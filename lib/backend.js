// MijnDoggo preview backend helpers. Binding SUBS = own subscriber D1; LISTINGS = shared puppyalert-listings (read-only).
export const json = (body, status = 200) => Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
export const token = () => Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const DISCLAIMER = 'MijnDoggo verzamelt advertenties van fokkers en websites, maar controleert deze niet. Check daarom altijd zelf of een fokker de juiste vergunning en registratie heeft en bezoek de pup bij voorkeur samen met de moederhond. MijnDoggo is niet aansprakelijk voor advertenties, fokkers of afspraken die je met hen maakt.';
// Shared email layout (pattern from EuroRentAlert alert mail: green header bar with logo, white card, footer). Inline CSS only.
const G = '#1f6b3e', BTN = `display:inline-block;background:${G};color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600;font-size:15px`;
const WHY = 'Je krijgt deze mail omdat je je met dit e-mailadres hebt aangemeld voor een puppy-alert op mijndoggo.nl.';
export function layout(base, { title, bodyHtml, unsubUrl }) {
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f3f5f2;font-family:Arial,Helvetica,sans-serif;color:#1d2a22">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f5f2"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden">
<tr><td style="background:${G};padding:18px 28px"><a href="${base}/" style="text-decoration:none"><img src="${base}/logo-doghead.png" width="40" height="40" alt="" style="vertical-align:middle;border-radius:8px;background:#ffffff"> <span style="vertical-align:middle;font-size:24px;font-weight:700;color:#ffffff;font-family:Georgia,serif">MijnDoggo</span></a></td></tr>
<tr><td style="padding:28px;font-size:15px;line-height:1.55">${bodyHtml}</td></tr>
<tr><td style="padding:0 28px 22px"><div style="border-top:1px solid #e5ebe7;padding-top:16px;font-size:12.5px;line-height:1.5;color:#5b6b61">
<p style="margin:0 0 8px"><strong style="color:#1d2a22">MijnDoggo</strong> · <a href="${base}/" style="color:${G}">mijndoggo.nl</a> · <a href="${unsubUrl}" style="color:${G}">Afmelden</a></p>
<p style="margin:0 0 8px">${esc(WHY)}</p><p style="margin:0;font-size:11.5px;color:#7a877f">${esc(DISCLAIMER)}</p></div></td></tr>
<tr><td style="background:${G};height:10px;line-height:10px;font-size:0">&nbsp;</td></tr>
</table></td></tr></table></body></html>`;
}
const textFoot = (base, unsubUrl) => `\n\n--\nMijnDoggo · mijndoggo.nl (${base}/)\nAfmelden: ${unsubUrl}\n${WHY}\n\n${DISCLAIMER}`;
export function confirmEmail(base, tok, unsub) {
  const url = `${base}/api/confirm?token=${tok}`, un = `${base}/api/unsubscribe?token=${unsub}`;
  const body = 'Tik op de knop om je puppy-alert te bevestigen. Heb je je niet aangemeld? Dan kun je deze mail negeren.';
  return { subject: 'Bevestig je e-mailadres voor MijnDoggo',
    html: layout(base, { title: 'Bevestig je e-mailadres', unsubUrl: un, bodyHtml: `<h1 style="margin:0 0 12px;font-size:22px;font-family:Georgia,serif">Bevestig je e-mailadres</h1><p style="margin:0 0 20px">${esc(body)}</p><p style="margin:0 0 8px"><a href="${url}" style="${BTN}">Bevestig mijn alert</a></p>` }),
    text: `Bevestig je e-mailadres\n\n${body}\n\n${url}` + textFoot(base, un) };
}
// breeds: Dutch names; near: {province, radius, crossBorder} or null.
export function welcomeEmail(base, unsub, { breeds = [], near = null, plan = '6m' } = {}) {
  const un = `${base}/api/unsubscribe?token=${unsub}`, where = near?.province ? `${near.province}, binnen ${near.radius} km${near.crossBorder ? ', ook over de grens (België/Duitsland)' : ''}` : `Heel Nederland${near?.crossBorder ? ', ook over de grens (België/Duitsland)' : ''}`;
  const rows = [['Rassen', breeds.join(', ')], ['Waar', where], ['Periode', plan === '12m' ? '1 jaar' : '6 maanden']];
  return { subject: 'Welkom bij MijnDoggo: je puppy-alert staat aan',
    html: layout(base, { title: 'Welkom bij MijnDoggo', unsubUrl: un, bodyHtml: `<h1 style="margin:0 0 12px;font-size:22px;font-family:Georgia,serif">Welkom! Je puppy-alert staat aan</h1><p style="margin:0 0 16px">We houden de fokkers voor je in de gaten. Zodra er een nieuw nestje is dat bij je zoekopdracht past, krijg je een mail met de link naar de fokker.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;background:#f3f8f4;border-radius:8px;font-size:14px">${rows.map(([k, v]) => `<tr><td style="padding:10px 14px;color:#5b6b61;width:90px">${k}</td><td style="padding:10px 14px;font-weight:600">${esc(v)}</td></tr>`).join('')}</table>
<p style="margin:16px 0 0">Geen abonnement: we schrijven nooit automatisch af.</p>` }),
    text: `Welkom! Je puppy-alert staat aan\n\nWe houden de fokkers voor je in de gaten en mailen je bij een nieuw nestje dat past.\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nGeen abonnement: we schrijven nooit automatisch af.` + textFoot(base, un) };
}
// items: [{ breed (NL name), country ('NL'|'BE'|'DE'), url }]. Links only, no photos or ad text.
const CN = { NL: 'Nederland', BE: 'België', DE: 'Duitsland' };
export function alertEmail(base, unsub, items) {
  const un = `${base}/api/unsubscribe?token=${unsub}`, n = items.length;
  const li = items.map(i => `<tr><td style="padding:12px 0;border-bottom:1px solid #e5ebe7"><strong>${esc(i.breed)}</strong> <span style="color:#5b6b61">· ${esc(CN[i.country] || i.country)}</span><br><a href="${esc(i.url)}" style="color:${G};word-break:break-all">${esc(i.url)}</a></td></tr>`).join('');
  return { subject: n === 1 ? `Nieuw nestje: ${items[0].breed}` : `${n} nieuwe nestjes voor jouw rassen`,
    html: layout(base, { title: 'Nieuwe pups', unsubUrl: un, bodyHtml: `<h1 style="margin:0 0 12px;font-size:22px;font-family:Georgia,serif">${n === 1 ? 'Er is een nieuw nestje' : `Er zijn ${n} nieuwe nestjes`}</h1><p style="margin:0 0 8px">Deze fokkers hebben pups die passen bij je alert. Klik door naar de site van de fokker voor alle details.</p><table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px">${li}</table>` }),
    text: `${n === 1 ? 'Er is een nieuw nestje' : `Er zijn ${n} nieuwe nestjes`}\n\n${items.map(i => `- ${i.breed} (${CN[i.country] || i.country}): ${i.url}`).join('\n')}` + textFoot(base, un) };
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
