// Matching for a stored signup against shared puppyalert-listings (READ-ONLY). Same idea as PuppyAlert: NL always,
// plus BE/DE when crossBorder is on and the province+radius reaches them. Listings have country-level location only.
export function matchQuery(signup) {
  const breeds = JSON.parse(signup.breeds), near = signup.near ? JSON.parse(signup.near) : { reach: [] };
  const countries = ['NL', ...(near.crossBorder ? near.reach : [])];
  return { sql: `SELECT id, breed, country, listing_url FROM listings WHERE is_active = 1 AND breed IN (${breeds.map(() => '?').join(',')}) AND country IN (${countries.map(() => '?').join(',')})`, binds: [...breeds, ...countries] };
}
