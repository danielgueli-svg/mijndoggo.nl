import { looksLikeEmail } from "./text";

export const MEMBERS_STORAGE_KEY = "mijndoggo.members.v1";
export const MEMBERS_CHANGED_EVENT = "mijndoggo:members";

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

function readAll(): Member[] {
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
    woonplaats: input.woonplaats.trim(),
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
  if (input.woonplaats.trim().length > 48) errors.push("Woonplaats mag max 48 tekens.");
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
