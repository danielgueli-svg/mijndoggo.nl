/**
 * Eigenaren-honden: datamodel + repository.
 *
 * v1 gebruikt localStorage (zelfde browser, zelfde apparaat).
 * Later wissel je `createOwnerDogRepository()` om naar een echte API
 * zonder de UI te herschrijven — zie README en de types hieronder.
 *
 * Geplande REST-vorm:
 *   GET    /api/rassen/:breedSlug/honden          → { dogs: OwnerDog[] }
 *   POST   /api/rassen/:breedSlug/honden          → { dog: OwnerDog }
 *          body: OwnerDogWrite (photos als multipart of als upload-URL's)
 *   DELETE /api/rassen/:breedSlug/honden/:id      → { ok: true }
 */

export const OWNER_DOGS_STORAGE_KEY = "mijndoggo.ownerDogs.v1";

export type OwnerDogPhoto = {
  url: string;
  alt: string;
};

export type OwnerDog = {
  id: string;
  breedSlug: string;
  name: string;
  ageYears: number;
  bio: string;
  photos: OwnerDogPhoto[];
  createdAt: string;
};

export type OwnerDogWrite = {
  breedSlug: string;
  name: string;
  ageYears: number;
  bio: string;
  photos: OwnerDogPhoto[];
};

export type OwnerDogListResponse = { dogs: OwnerDog[] };
export type OwnerDogCreateResponse = { dog: OwnerDog };
export type OwnerDogDeleteResponse = { ok: true };

export type OwnerDogRepository = {
  listByBreed: (breedSlug: string) => Promise<OwnerDog[]>;
  create: (input: OwnerDogWrite) => Promise<OwnerDog>;
  update: (id: string, input: OwnerDogWrite) => Promise<OwnerDog>;
  remove: (breedSlug: string, id: string) => Promise<void>;
};

function readAll(): OwnerDog[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(OWNER_DOGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isOwnerDog);
  } catch {
    return [];
  }
}

function writeAll(dogs: OwnerDog[]): void {
  localStorage.setItem(OWNER_DOGS_STORAGE_KEY, JSON.stringify(dogs));
}

function isOwnerDog(value: unknown): value is OwnerDog {
  if (!value || typeof value !== "object") return false;
  const dog = value as Partial<OwnerDog>;
  return (
    typeof dog.id === "string" &&
    typeof dog.breedSlug === "string" &&
    typeof dog.name === "string" &&
    typeof dog.ageYears === "number" &&
    typeof dog.bio === "string" &&
    typeof dog.createdAt === "string" &&
    Array.isArray(dog.photos)
  );
}

export function createLocalStorageOwnerDogRepository(): OwnerDogRepository {
  return {
    async listByBreed(breedSlug) {
      return readAll()
        .filter((dog) => dog.breedSlug === breedSlug)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async create(input) {
      const dog: OwnerDog = {
        ...input,
        name: input.name.trim(),
        bio: input.bio.trim(),
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      writeAll([dog, ...readAll()]);
      return dog;
    },
    async update(id, input) {
      const existing = readAll().find((dog) => dog.id === id);
      if (!existing) throw new Error("Deze hond staat niet op dit apparaat.");
      const updated: OwnerDog = {
        ...existing,
        ...input,
        name: input.name.trim(),
        bio: input.bio.trim(),
        id,
      };
      writeAll(readAll().map((dog) => (dog.id === id ? updated : dog)));
      return updated;
    },
    async remove(breedSlug, id) {
      writeAll(
        readAll().filter(
          (dog) => !(dog.id === id && dog.breedSlug === breedSlug),
        ),
      );
    },
  };
}

/** Enige plek om later een HTTP-repository te pluggen. */
export function createOwnerDogRepository(): OwnerDogRepository {
  return createLocalStorageOwnerDogRepository();
}

/** First owner-dog on this breed, newest first — used by the breed editor. */
export function firstOwnerDogForBreed(breedSlug: string): OwnerDog | undefined {
  return readAll()
    .filter((dog) => dog.breedSlug === breedSlug)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export async function upsertFirstOwnerDog(
  breedSlug: string,
  input: Omit<OwnerDogWrite, "breedSlug">,
): Promise<OwnerDog | null> {
  const name = input.name.trim();
  if (!name) return null;
  const repo = createOwnerDogRepository();
  const write: OwnerDogWrite = {
    breedSlug,
    name,
    ageYears: input.ageYears,
    bio: input.bio,
    photos: input.photos.slice(0, 3),
  };
  const existing = firstOwnerDogForBreed(breedSlug);
  return existing ? repo.update(existing.id, write) : repo.create(write);
}

export function validateOwnerDogWrite(input: OwnerDogWrite): string[] {
  const errors: string[] = [];
  const name = input.name.trim();
  const bio = input.bio.trim();

  if (name.length < 2) errors.push("Geef je hond een naam van minstens 2 letters.");
  if (name.length > 32) errors.push("Die naam is een tikkeltje lang — max 32 tekens.");
  if (!Number.isFinite(input.ageYears) || input.ageYears < 0 || input.ageYears > 25) {
    errors.push("Leeftijd mag tussen 0 en 25 jaar.");
  }
  if (bio.length < 8) errors.push("Schrijf een kort biootje (minstens 8 tekens).");
  if (bio.length > 280) errors.push("Bio mag max 280 tekens — hou het kort.");
  if (input.photos.length > 3) errors.push("Maximaal 3 foto's voor nu.");
  return errors;
}
