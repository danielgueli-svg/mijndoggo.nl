export type BreedSize = "klein" | "middel" | "groot";
export type BreedEnergy = "laag" | "middel" | "hoog";

export type CatalogBreed = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  size: BreedSize;
  energy: BreedEnergy;
  imageSrc: string;
  imageAlt: string;
  custom?: boolean;
};

export const sizeLabels: Record<BreedSize, string> = {
  klein: "Klein",
  middel: "Middel",
  groot: "Groot",
};

export const energyLabels: Record<BreedEnergy, string> = {
  laag: "Rustiger tempo",
  middel: "Vrolijk actief",
  hoog: "Veel energie",
};

export function breedHref(breed: Pick<CatalogBreed, "slug" | "custom">): string {
  return breed.custom
    ? `/rassen/eigen?slug=${encodeURIComponent(breed.slug)}`
    : `/rassen/${breed.slug}`;
}

export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export function breedInitial(name: string): string {
  return name
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .charAt(0)
    .toUpperCase();
}

export function breedMatchesQuery(breed: CatalogBreed, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${breed.name} ${breed.shortName}`.toLowerCase().includes(q);
}
