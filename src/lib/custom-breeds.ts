import { unsplashSrc } from "./images";
import type { BreedEnergy, BreedSize, CatalogBreed } from "./catalog";
import { slugify } from "./text";

export const CUSTOM_BREEDS_STORAGE_KEY = "mijndoggo.customBreeds.v1";
export const CUSTOM_BREEDS_CHANGED_EVENT = "mijndoggo:custom-breeds";

export const CUSTOM_BREED_FALLBACK_IMAGE = {
  unsplashId: "photo-1548199973-03cce0bbc87b",
  alt: "Honden rennen blij over een zandpad",
};

export type CustomBreedPhoto = {
  url: string;
  alt: string;
};

export type CustomBreed = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  size: BreedSize;
  energy: BreedEnergy;
  goodWithKids: boolean;
  origin: string;
  traits: string[];
  story: string;
  photos: CustomBreedPhoto[];
  createdAt: string;
  updatedAt: string;
};

export type CustomBreedWrite = {
  name: string;
  shortName: string;
  tagline: string;
  size: BreedSize;
  energy: BreedEnergy;
  goodWithKids: boolean;
  origin: string;
  traits: string[];
  story: string;
  photos: CustomBreedPhoto[];
};

function emitChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CUSTOM_BREEDS_CHANGED_EVENT));
  }
}

function readAll(): CustomBreed[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_BREEDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCustomBreed).map(normalize);
  } catch {
    return [];
  }
}

function writeAll(breeds: CustomBreed[]): void {
  localStorage.setItem(CUSTOM_BREEDS_STORAGE_KEY, JSON.stringify(breeds));
  emitChange();
}

function isPhoto(value: unknown): value is CustomBreedPhoto {
  if (!value || typeof value !== "object") return false;
  const photo = value as Partial<CustomBreedPhoto>;
  return typeof photo.url === "string" && typeof photo.alt === "string" && photo.url.length > 8;
}

function isCustomBreed(value: unknown): value is CustomBreed {
  if (!value || typeof value !== "object") return false;
  const breed = value as Partial<CustomBreed>;
  return (
    typeof breed.slug === "string" &&
    typeof breed.name === "string" &&
    typeof breed.shortName === "string" &&
    typeof breed.tagline === "string" &&
    typeof breed.story === "string" &&
    Array.isArray(breed.traits)
  );
}

function normalize(breed: CustomBreed): CustomBreed {
  return {
    ...breed,
    photos: Array.isArray(breed.photos) ? breed.photos.filter(isPhoto) : [],
  };
}

export function listCustomBreeds(): CustomBreed[] {
  return readAll().sort((a, b) => a.name.localeCompare(b.name, "nl"));
}

export function getCustomBreed(slug: string): CustomBreed | undefined {
  return readAll().find((breed) => breed.slug === slug);
}

export function uniqueCustomSlug(name: string, reserved: string[]): string {
  const base = slugify(name) || "eigen-ras";
  const taken = new Set(reserved);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n += 1;
  return `${base}-${n}`;
}

export function createCustomBreed(
  input: CustomBreedWrite,
  reservedSlugs: string[],
): CustomBreed {
  const now = new Date().toISOString();
  const breed: CustomBreed = {
    ...input,
    name: input.name.trim(),
    shortName: input.shortName.trim() || input.name.trim(),
    tagline: input.tagline.trim(),
    origin: input.origin.trim() || "Onbekend",
    traits: input.traits.map((trait) => trait.trim()).filter(Boolean),
    story: input.story.trim(),
    photos: input.photos.slice(0, 3),
    slug: uniqueCustomSlug(input.name, [
      ...reservedSlugs,
      ...readAll().map((item) => item.slug),
    ]),
    createdAt: now,
    updatedAt: now,
  };
  writeAll([breed, ...readAll()]);
  return breed;
}

export function updateCustomBreed(slug: string, input: CustomBreedWrite): CustomBreed {
  const existing = getCustomBreed(slug);
  if (!existing) throw new Error("Dit eigen ras staat niet op dit apparaat.");
  const updated: CustomBreed = {
    ...existing,
    ...input,
    name: input.name.trim(),
    shortName: input.shortName.trim() || input.name.trim(),
    tagline: input.tagline.trim(),
    origin: input.origin.trim() || "Onbekend",
    traits: input.traits.map((trait) => trait.trim()).filter(Boolean),
    story: input.story.trim(),
    photos: input.photos.slice(0, 3),
    slug,
    updatedAt: new Date().toISOString(),
  };
  writeAll(readAll().map((breed) => (breed.slug === slug ? updated : breed)));
  return updated;
}

export function customBreedToCatalog(breed: CustomBreed): CatalogBreed {
  const cover = breed.photos[0];
  return {
    slug: breed.slug,
    name: breed.name,
    shortName: breed.shortName,
    tagline: breed.tagline,
    size: breed.size,
    energy: breed.energy,
    imageSrc: cover?.url ?? unsplashSrc(CUSTOM_BREED_FALLBACK_IMAGE.unsplashId, 640, 480),
    imageAlt: cover?.alt ?? CUSTOM_BREED_FALLBACK_IMAGE.alt,
    custom: true,
  };
}

export function validateCustomBreedWrite(input: CustomBreedWrite): string[] {
  const errors: string[] = [];
  const name = input.name.trim();
  const tagline = input.tagline.trim();
  const story = input.story.trim();
  const traits = input.traits.map((trait) => trait.trim()).filter(Boolean);

  if (name.length < 2) errors.push("Geef het ras een naam van minstens 2 letters.");
  if (name.length > 48) errors.push("Rasnaam mag max 48 tekens.");
  if (input.shortName.trim().length > 24) errors.push("Korte naam mag max 24 tekens.");
  if (tagline.length < 8) errors.push("Schrijf een korte tagline (minstens 8 tekens).");
  if (tagline.length > 120) errors.push("Tagline mag max 120 tekens.");
  if (input.origin.trim().length > 40) errors.push("Herkomst mag max 40 tekens.");
  if (traits.length < 2) errors.push("Geef minstens 2 trekjes, gescheiden door komma's.");
  if (traits.length > 6) errors.push("Maximaal 6 trekjes.");
  if (story.length < 40) errors.push("Het korte verhaal mag wat langer — minstens 40 tekens.");
  if (story.length > 4000) errors.push("Verhaal mag max 4000 tekens.");
  if (input.photos.length > 3) errors.push("Maximaal 3 rasfoto’s.");
  return errors;
}

export function subscribeCustomBreeds(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CUSTOM_BREEDS_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CUSTOM_BREEDS_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
