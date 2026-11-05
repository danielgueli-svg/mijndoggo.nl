import test from 'node:test';
import assert from 'node:assert/strict';
import { sendMail } from '../lib/backend.js';

const msg = { subject: 'Bevestig', html: '<p>Hoi</p>', text: 'Hoi' };
const FROM = 'Mijndoggo <alerts@mijndoggo.nl>';

test('sendMail is not_configured without MAIL_FROM, and without either sender', async () => {
  assert.equal(await sendMail({}, 'a@example.com', msg), 'not_configured');
  assert.equal(await sendMail({ MAIL_FROM: FROM }, 'a@example.com', msg), 'not_configured');
  assert.equal(await sendMail({ CF_EMAIL_TOKEN: 'tok' }, 'a@example.com', msg), 'not_configured');
});

test('sendMail uses Cloudflare Email Sending REST when CF_EMAIL_TOKEN is set', async () => {
  const calls = [];
  const prev = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  };
  try {
    const env = { MAIL_FROM: FROM, CF_EMAIL_TOKEN: 'cf-tok', RESEND_API_KEY: 're_should_not_run' };
    assert.equal(await sendMail(env, 'a@example.com', msg), 'sent');
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://api.cloudflare.com/client/v4/accounts/a8dba695e3870d66e10af3a7198e937e/email/sending/send');
    assert.equal(calls[0].init.headers.Authorization, 'Bearer cf-tok');
    assert.deepEqual(JSON.parse(calls[0].init.body), {
      from: { address: 'alerts@mijndoggo.nl', name: 'Mijndoggo' },
      to: 'a@example.com', subject: 'Bevestig', html: '<p>Hoi</p>', text: 'Hoi',
    });
    calls.length = 0;
    assert.equal(await sendMail({ ...env, CF_ACCOUNT_ID: 'acct-1' }, 'a@example.com', msg), 'sent');
    assert.equal(calls[0].url, 'https://api.cloudflare.com/client/v4/accounts/acct-1/email/sending/send');
  } finally {
    globalThis.fetch = prev;
  }
});

test('a failed Cloudflare send does not fall back to Resend', async () => {
  const prev = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.match(String(url), /email\/sending\/send$/);
    return new Response('no', { status: 403 });
  };
  try {
    assert.equal(await sendMail({ MAIL_FROM: FROM, CF_EMAIL_TOKEN: 'cf-tok', RESEND_API_KEY: 're_x' }, 'a@example.com', msg), 'failed');
  } finally {
    globalThis.fetch = prev;
  }
});

test('Resend is used only when CF_EMAIL_TOKEN is unset', async () => {
  let body;
  const prev = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://api.resend.com/emails');
    assert.equal(init.headers.Authorization, 'Bearer re_x');
    body = JSON.parse(init.body);
    return new Response('{}', { status: 200 });
  };
  try {
    assert.equal(await sendMail({ MAIL_FROM: FROM, RESEND_API_KEY: 're_x' }, 'a@example.com', msg), 'sent');
    assert.deepEqual(body, { from: FROM, to: ['a@example.com'], subject: 'Bevestig', html: '<p>Hoi</p>', text: 'Hoi' });
  } finally {
    globalThis.fetch = prev;
  }
});
