// MijnDoggo preview backend helpers. Binding SUBS = own subscriber D1; LISTINGS = shared puppyalert-listings (read-only).
export const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export const token = () => Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const DISCLAIMER = 'Advertenties komen uit openbare bronnen. Controleer altijd of de fokker officieel geregistreerd is voordat je op bezoek gaat.';
export function confirmEmail(base, tok, unsub) {
  const body = 'Tik op de knop om je puppy-alert te bevestigen. Heb je je niet aangemeld? Dan kun je deze mail negeren.';
  return { subject: 'Bevestig je e-mailadres voor MijnDoggo',
    html: `<p>${esc(body)}</p><p><a href="${base}/api/confirm?token=${tok}">Bevestig mijn alert</a></p><p style="font-size:12px;color:#666">${esc(DISCLAIMER)}</p><p style="font-size:12px"><a href="${base}/api/unsubscribe?token=${unsub}">Afmelden</a></p>`,
    text: `${body}\n\n${base}/api/confirm?token=${tok}\n\n${DISCLAIMER}\n\nAfmelden: ${base}/api/unsubscribe?token=${unsub}` };
}
// Returns 'sent' | 'not_configured' | 'failed'. Needs RESEND_API_KEY + MAIL_FROM on a Resend-verified domain. Only ever sent to the person signing up.
export async function sendMail(env, to, m) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM) return 'not_configured';
  const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.MAIL_FROM, to: [to], subject: m.subject, html: m.html, text: m.text }) }).catch(() => null);
  return r && r.ok ? 'sent' : 'failed';
}
// Mollie: TEST key only. Refuses anything that is not test_.
export const mollieKey = env => (env.MOLLIE_TEST_API_KEY || '').startsWith('test_') ? env.MOLLIE_TEST_API_KEY : null;
export const mollie = (env, path, init = {}) => fetch('https://api.mollie.com/v2' + path, { ...init, headers: { Authorization: `Bearer ${mollieKey(env)}`, 'Content-Type': 'application/json' } });
export const PRICES = { '6m': ['12.00', '6 maanden'], '12m': ['20.00', '1 jaar'] };
export const page = (title, msg, status = 200) => new Response(`<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(title)} | MijnDoggo</title><link rel="stylesheet" href="/style.css"><main class="wrap" style="padding:3rem 1rem"><h1>${esc(title)}</h1><p>${esc(msg)}</p><p><a href="/">Naar MijnDoggo</a></p></main></html>`, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
