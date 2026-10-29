// STUB. Validates input; storing, confirmation email, and Mollie payment are not wired yet (see README).
const BREEDS = new Set(["Labrador Retriever","Golden Retriever","Border Collie","Jack Russell Terrier","German Shepherd","Cocker Spaniel","Dachshund/Teckel","French Bulldog","Chihuahua","Australian Shepherd","Cane Corso","Rottweiler","Staffordshire Bull Terrier","Cavalier King Charles","English Springer Spaniel","Cockapoo","Cavapoo","Labradoodle","Berner Sennenhond","Maltipoo"]);
const EU = new Set("AT BE BG HR CY CZ DK EE FI FR DE GR HU IE IT LV LT LU MT NL PL PT RO SK SI ES SE".split(' '));
export async function onRequestPost({ request }) {
  let b; try { b = await request.json(); } catch { return Response.json({ ok: false, error: 'bad_json' }, { status: 400 }); }
  const breeds = [...new Set(b.breeds || [])], countries = [...new Set(b.countries || [])];
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.email || '') || !b.consent) return Response.json({ ok: false, error: 'email_or_consent' }, { status: 400 });
  if (String(b.email).trim().toLowerCase() !== String(b.email2 || '').trim().toLowerCase()) return Response.json({ ok: false, error: 'email_mismatch' }, { status: 400 });
  if (!breeds.length || breeds.length > 3 || !breeds.every(x => BREEDS.has(x))) return Response.json({ ok: false, error: 'breeds' }, { status: 400 });
  if (!countries.length || countries.length > 3 || !countries.every(x => EU.has(x))) return Response.json({ ok: false, error: 'countries' }, { status: 400 });
  // TODO: insert pending subscriber; create Mollie payment with SERVER-SIDE amount (never from client); send double opt-in email.
  return Response.json({ ok: true, pending: true });
}
