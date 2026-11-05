import test from 'node:test';
import assert from 'node:assert/strict';
import { sendMail } from '../lib/backend.js';

const msg = { subject: 'Bevestig', html: '<p>Hoi</p>', text: 'Hoi' };

test('sendMail is not_configured without the Email Sending binding or MAIL_FROM', async () => {
  assert.equal(await sendMail({}, 'a@example.com', msg), 'not_configured');
  assert.equal(await sendMail({ MAIL_FROM: 'MijnDoggo <alerts@mijndoggo.nl>' }, 'a@example.com', msg), 'not_configured');
  assert.equal(await sendMail({ MAIL_FROM: 'MijnDoggo <alerts@mijndoggo.nl>', EMAIL: {} }, 'a@example.com', msg), 'not_configured');
  assert.equal(await sendMail({ EMAIL: { send() { return { messageId: 'x' }; } } }, 'a@example.com', msg), 'not_configured');
});

test('sendMail uses the Cloudflare Email Sending binding and a named from address', async () => {
  let sent;
  const env = {
    MAIL_FROM: 'MijnDoggo <alerts@mijndoggo.nl>',
    EMAIL: { send(message) { sent = message; return { messageId: 'msg_1' }; } },
  };
  assert.equal(await sendMail(env, 'a@example.com', msg), 'sent');
  let bareFrom;
  const bare = { MAIL_FROM: 'alerts@mijndoggo.nl', EMAIL: { async send(message) { bareFrom = message.from; } } };
  assert.equal(await sendMail(bare, 'a@example.com', msg), 'sent');
  assert.equal(bareFrom, 'alerts@mijndoggo.nl');
  assert.deepEqual(sent, {
    to: 'a@example.com',
    from: { email: 'alerts@mijndoggo.nl', name: 'MijnDoggo' },
    subject: 'Bevestig',
    html: '<p>Hoi</p>',
    text: 'Hoi',
  });
});

test('sendMail returns failed when the binding throws', async () => {
  const env = {
    MAIL_FROM: 'alerts@mijndoggo.nl',
    EMAIL: { send() { throw new Error('E_SENDER_NOT_VERIFIED'); } },
  };
  assert.equal(await sendMail(env, 'a@example.com', msg), 'failed');
});
