import { getCollection, type CollectionEntry } from "astro:content";
import type { BreedImage } from "../data/photos";

export type { BreedImage };
export type BreedSize = "klein" | "middel" | "groot";
export type BreedEnergy = "laag" | "middel" | "hoog";
export type BreedEntry = CollectionEntry<"breeds">;

export type Breed = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  size: BreedSize;
  energy: BreedEnergy;
  goodWithKids: boolean;
  origin: string;
  traits: string[];
  image: BreedImage;
  gallery: BreedImage[];
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

export function coverImage(entry: BreedEntry): BreedImage {
  const photo = entry.data.gallery[0];
  return {
    unsplashId: photo.unsplashId,
    alt: photo.alt,
    photographer: photo.photographer,
    unsplashUrl: photo.unsplashUrl,
  };
}

export function toBreed(entry: BreedEntry): Breed {
  return {
    slug: entry.id,
    name: entry.data.name,
    shortName: entry.data.shortName,
    tagline: entry.data.tagline,
    size: entry.data.size,
    energy: entry.data.energy,
    goodWithKids: entry.data.goodWithKids,
    origin: entry.data.origin,
    traits: entry.data.traits,
    image: coverImage(entry),
    gallery: entry.data.gallery.map((photo) => ({
      unsplashId: photo.unsplashId,
      alt: photo.alt,
      photographer: photo.photographer,
      unsplashUrl: photo.unsplashUrl,
    })),
  };
}

export async function loadBreeds(): Promise<Breed[]> {
  const entries = await getCollection("breeds");
  return entries
    .map(toBreed)
    .sort((a, b) => a.name.localeCompare(b.name, "nl"));
}

export async function loadBreedEntry(
  slug: string,
): Promise<BreedEntry | undefined> {
  const entries = await getCollection("breeds");
  return entries.find((entry) => entry.id === slug);
}

/** Eerste alinea vóór de H2's — kort verhaaltje, geen heel essay. */
export function shortBreedStory(markdown: string): string {
  const intro = markdown.split(/^##\s+/m)[0]?.trim() ?? "";
  return intro.replace(/\s+/g, " ").trim();
}
