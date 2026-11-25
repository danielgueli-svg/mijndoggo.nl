import test from 'node:test';
import assert from 'node:assert/strict';
import { btwIncluded, formatMoney, receiptEmail } from '../lib/backend.js';
import { onRequestPost } from '../functions/api/mollie-webhook.js';

test('21% btw is taken from the inclusive amount and rounded to cents', () => {
  assert.deepEqual(btwIncluded('12.00'), { totalCents: 1200, vatCents: 208 });
  assert.deepEqual(btwIncluded('10.00'), { totalCents: 1000, vatCents: 174 });
  assert.deepEqual(btwIncluded('24.20'), { totalCents: 2420, vatCents: 420 });
  assert.equal(formatMoney(208, 'EUR'), '€ 2,08');
  assert.equal(formatMoney(1200, 'EUR'), '€ 12,00');
});

test('the receipt uses the Mollie payment and never a fixed price', () => {
  const payment = { id: 'tr_abc123', status: 'paid', amount: { currency: 'EUR', value: '24.20' }, paidAt: '2026-11-25T10:48:00Z' };
  const mail = receiptEmail('https://mijndoggo.nl', 'ab'.repeat(24), payment);
  assert.equal(mail.subject, 'Betaling ontvangen – je Mijndoggo puppy-alert is actief');
  assert.match(mail.text, /€ 24,20/);
  assert.match(mail.text, /waarvan 21% btw: € 4,20/);
  assert.match(mail.text, /tr_abc123/);
  assert.match(mail.text, /25 november 2026 om 11:48/);
  assert.match(mail.text, /Daniel Eiberg/);
  assert.match(mail.text, /KVK 84076143/);
  assert.match(mail.text, /BTW NL003910720B43/);
  assert.match(mail.text, /Amsterdam, Nederland/);
  assert.match(mail.text, /info@mijndoggo.nl/);
  assert.match(mail.html, /mailto:info@mijndoggo.nl/);
  assert.match(mail.html, /href="https:\/\/mijndoggo\.nl\/api\/unsubscribe\?token=/);
  assert.doesNotMatch(mail.text, /€ 12,00/);
  assert.doesNotMatch(mail.html, /€ 12,00/);
});

function memorySubs(row) {
  const state = { ...row };
  const prepare = sql => ({
    bind(...args) {
      return {
        async run() {
          if (sql.includes('payment_status = ?')) {
            state.payment_status = args[0];
            if (args[1] === 'paid' && !state.paid_at) state.paid_at = args[2];
            return { meta: { changes: state.payment_id === args[3] ? 1 : 0 } };
          }
          if (sql.includes("receipt_sent_at = datetime('now')")) {
            if (state.payment_id === args[0] && state.receipt_sent_at == null) {
              state.receipt_sent_at = 'now';
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (sql.includes('receipt_sent_at = NULL')) {
            state.receipt_sent_at = null;
            return { meta: { changes: 1 } };
          }
          return { meta: { changes: 0 } };
        },
        async first() {
          return { email: state.email, unsub_token: state.unsub_token };
        },
      };
    },
  });
  return { state, prepare };
}

const paid = { id: 'tr_paid1', status: 'paid', amount: { currency: 'EUR', value: '24.20' }, paidAt: '2026-11-25T10:48:00Z' };

function hook(db) {
  const body = new FormData();
  body.set('id', 'tr_paid1');
  return onRequestPost({
    request: new Request('https://mijndoggo.nl/api/mollie-webhook', { method: 'POST', body }),
    env: { MOLLIE_MODE: 'test', MOLLIE_TEST_API_KEY: 'test_dummy', MAIL_FROM: 'Mijndoggo <alerts@mijndoggo.nl>', CF_EMAIL_TOKEN: 'cf-tok', SUBS: db },
  });
}

test('a paid webhook sends one receipt and a retry does not send again', async () => {
  const db = memorySubs({ email: 'danielgueli@gmail.com', unsub_token: 'cd'.repeat(24), payment_id: 'tr_paid1', receipt_sent_at: null, paid_at: null });
  const sends = [];
  const prev = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    if (String(url).includes('api.mollie.com/v2/payments/tr_paid1')) return new Response(JSON.stringify(paid), { status: 200 });
    if (String(url).includes('/email/sending/send')) {
      sends.push(JSON.parse(init.body));
      return new Response('{}', { status: 200 });
    }
    return new Response('no', { status: 500 });
  };
  try {
    assert.equal((await hook(db)).status, 200);
    assert.equal((await hook(db)).status, 200);
    assert.equal(sends.length, 1);
    assert.equal(sends[0].to, 'danielgueli@gmail.com');
    assert.equal(sends[0].from.address, 'alerts@mijndoggo.nl');
    assert.match(sends[0].text, /waarvan 21% btw: € 4,20/);
    assert.match(sends[0].text, /tr_paid1/);
    assert.equal(db.state.receipt_sent_at, 'now');
  } finally {
    globalThis.fetch = prev;
  }
});

test('an unpaid payment does not send, and a failed send can be retried once', async () => {
  const db = memorySubs({ email: 'a@example.com', unsub_token: 'ef'.repeat(24), payment_id: 'tr_paid1', receipt_sent_at: null, paid_at: null });
  let mollieStatus = 'open';
  let mailStatus = 500;
  let sends = 0;
  const prev = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).includes('api.mollie.com')) return new Response(JSON.stringify({ ...paid, status: mollieStatus }), { status: 200 });
    if (String(url).includes('/email/sending/send')) {
      sends += 1;
      return new Response('{}', { status: mailStatus });
    }
    return new Response('no', { status: 500 });
  };
  try {
    await hook(db);
    assert.equal(sends, 0);
    mollieStatus = 'paid';
    await hook(db);
    assert.equal(sends, 1);
    assert.equal(db.state.receipt_sent_at, null);
    mailStatus = 200;
    await hook(db);
    await hook(db);
    assert.equal(sends, 2);
    assert.equal(db.state.receipt_sent_at, 'now');
  } finally {
    globalThis.fetch = prev;
  }
});
