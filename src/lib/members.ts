import { findNlPlace } from "./nl-places";
import { looksLikeEmail } from "./text";

export const MEMBERS_STORAGE_KEY = "mijndoggo.members.v1";
export const MEMBERS_SEED_KEY = "mijndoggo.members.seeded.v1";
export const MEMBERS_CHANGED_EVENT = "mijndoggo:members";

const DEMO_MEMBERS: Member[] = [
  {
    id: "demo-floortje",
    email: "demo.floortje@mijndoggo.nl",
    nickname: "Floortje",
    dogName: "Pip",
    woonplaats: "Haarlem",
    breedSlug: "labrador-retriever",
    breedName: "Labrador Retriever",
    wantsWalk: true,
    createdAt: "2026-01-02T10:00:00.000Z",
  },
  {
    id: "demo-max",
    email: "demo.max@mijndoggo.nl",
    nickname: "Max",
    dogName: "Bink",
    woonplaats: "Amsterdam",
    breedSlug: "golden-retriever",
    breedName: "Golden Retriever",
    wantsWalk: true,
    createdAt: "2026-01-03T10:00:00.000Z",
  },
  {
    id: "demo-noor",
    email: "demo.noor@mijndoggo.nl",
    nickname: "Noor",
    dogName: "Kees",
    woonplaats: "Amsterdam",
    breedSlug: "franse-bulldog",
    breedName: "Franse Bulldog",
    wantsWalk: false,
    createdAt: "2026-01-04T10:00:00.000Z",
  },
  {
    id: "demo-tim",
    email: "demo.tim@mijndoggo.nl",
    nickname: "Tim",
    dogName: "Saar",
    woonplaats: "Amsterdam",
    breedSlug: "border-collie",
    breedName: "Border Collie",
    wantsWalk: true,
    createdAt: "2026-01-05T10:00:00.000Z",
  },
  {
    id: "demo-lisa",
    email: "demo.lisa@mijndoggo.nl",
    nickname: "Lisa",
    dogName: "Bram",
    woonplaats: "Utrecht",
    breedSlug: "teckel",
    breedName: "Teckel",
    wantsWalk: true,
    createdAt: "2026-01-06T10:00:00.000Z",
  },
  {
    id: "demo-joost",
    email: "demo.joost@mijndoggo.nl",
    nickname: "Joost",
    dogName: "Nala",
    woonplaats: "Utrecht",
    breedSlug: "duitse-herder",
    breedName: "Duitse Herder",
    wantsWalk: false,
    createdAt: "2026-01-07T10:00:00.000Z",
  },
  {
    id: "demo-sana",
    email: "demo.sana@mijndoggo.nl",
    nickname: "Sana",
    dogName: "Ollie",
    woonplaats: "Haarlem",
    breedSlug: "chihuahua",
    breedName: "Chihuahua",
    wantsWalk: true,
    createdAt: "2026-01-08T10:00:00.000Z",
  },
  {
    id: "demo-daan",
    email: "demo.daan@mijndoggo.nl",
    nickname: "Daan",
    dogName: "Bo",
    woonplaats: "Den Haag",
    breedSlug: "berner-sennenhond",
    breedName: "Berner Sennenhond",
    wantsWalk: true,
    createdAt: "2026-01-09T10:00:00.000Z",
  },
  {
    id: "demo-mirte",
    email: "demo.mirte@mijndoggo.nl",
    nickname: "Mirte",
    dogName: "Fien",
    woonplaats: "Rotterdam",
    breedSlug: "cocker-spaniel",
    breedName: "Cocker Spaniël",
    wantsWalk: false,
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "demo-kars",
    email: "demo.kars@mijndoggo.nl",
    nickname: "Kars",
    dogName: "Loek",
    woonplaats: "Groningen",
    breedSlug: "staffordshire-bull-terrier",
    breedName: "Staffordshire Bull Terriër",
    wantsWalk: true,
    createdAt: "2026-01-11T10:00:00.000Z",
  },
];

export type Member = {
  id: string;
  email: string;
  nickname: string;
  dogName: string;
  woonplaats: string;
  breedSlug: string;
  breedName: string;
  wantsWalk: boolean;
  createdAt: string;
};

export type MemberWrite = {
  email: string;
  nickname: string;
  dogName: string;
  woonplaats: string;
  breedSlug: string;
  breedName: string;
  wantsWalk: boolean;
};

export type PlaceCount = {
  plaats: string;
  count: number;
};

function emitChange(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(MEMBERS_CHANGED_EVENT));
  }
}

function readRaw(): Member[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(MEMBERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMember);
  } catch {
    return [];
  }
}

function seedIfNeeded(): Member[] {
  const existing = readRaw();
  if (existing.length > 0) return existing;
  if (typeof localStorage === "undefined") return [];
  if (localStorage.getItem(MEMBERS_SEED_KEY)) return existing;
  writeAll(DEMO_MEMBERS);
  localStorage.setItem(MEMBERS_SEED_KEY, "1");
  return DEMO_MEMBERS;
}

function readAll(): Member[] {
  return seedIfNeeded();
}

function writeAll(members: Member[]): void {
  localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
  emitChange();
}

function isMember(value: unknown): value is Member {
  if (!value || typeof value !== "object") return false;
  const member = value as Partial<Member>;
  return (
    typeof member.id === "string" &&
    typeof member.email === "string" &&
    typeof member.nickname === "string" &&
    typeof member.dogName === "string" &&
    typeof member.woonplaats === "string" &&
    typeof member.breedSlug === "string" &&
    typeof member.breedName === "string" &&
    typeof member.wantsWalk === "boolean" &&
    typeof member.createdAt === "string"
  );
}

export function listMembers(): Member[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listMembersByBreed(breedSlug: string): Member[] {
  return listMembers().filter((member) => member.breedSlug === breedSlug);
}

export function createMember(input: MemberWrite): Member {
  const email = input.email.trim().toLowerCase();
  if (readAll().some((member) => member.email === email)) {
    throw new Error("Dit e-mailadres staat hier al op dit apparaat.");
  }
  const member: Member = {
    id: crypto.randomUUID(),
    email,
    nickname: input.nickname.trim(),
    dogName: input.dogName.trim(),
    woonplaats: findNlPlace(input.woonplaats) ?? "",
    breedSlug: input.breedSlug,
    breedName: input.breedName,
    wantsWalk: input.wantsWalk,
    createdAt: new Date().toISOString(),
  };
  writeAll([member, ...readAll()]);
  return member;
}

export function placesByMemberCount(members: Member[]): PlaceCount[] {
  const counts = new Map<string, number>();
  for (const member of members) {
    const plaats = member.woonplaats.trim();
    if (!plaats) continue;
    const key = plaats;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([plaats, count]) => ({ plaats, count }))
    .sort((a, b) => b.count - a.count || a.plaats.localeCompare(b.plaats, "nl"));
}

export function displayNickname(member: Member): string {
  return member.nickname || "Baasje";
}

export function validateMemberWrite(input: MemberWrite): string[] {
  const errors: string[] = [];
  const email = input.email.trim();
  if (!email) errors.push("E-mail is verplicht.");
  else if (!looksLikeEmail(email)) errors.push("Dat e-mailadres ziet er nog niet helemaal goed uit.");
  if (email.length > 120) errors.push("E-mail mag max 120 tekens.");
  if (input.nickname.trim().length > 32) errors.push("Bijnaam mag max 32 tekens.");
  if (input.dogName.trim().length > 32) errors.push("Hondennaam mag max 32 tekens.");
  if (input.woonplaats.trim() && !findNlPlace(input.woonplaats)) {
    errors.push("Kies een Nederlandse woonplaats uit de lijst.");
  }
  if (!input.breedSlug.trim() || !input.breedName.trim()) {
    errors.push("Kies een ras uit de lijst.");
  }
  return errors;
}

export function subscribeMembers(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(MEMBERS_CHANGED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(MEMBERS_CHANGED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}
