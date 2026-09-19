/** Acht rassen die Nederland het vaakst tegenkomt — homepage-default. */
export const POPULAR_BREED_SLUGS = [
  "labrador-retriever",
  "golden-retriever",
  "duitse-herder",
  "franse-bulldog",
  "teckel",
  "chihuahua",
  "border-collie",
  "berner-sennenhond",
] as const;

export type PopularBreedSlug = (typeof POPULAR_BREED_SLUGS)[number];

export function isPopularBreedSlug(slug: string): boolean {
  return (POPULAR_BREED_SLUGS as readonly string[]).includes(slug);
}
