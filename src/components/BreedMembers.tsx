import { useEffect, useState } from "react";
import {
  displayNickname,
  listMembersByBreed,
  subscribeMembers,
  type Member,
} from "../lib/members";

type Props = {
  breedSlug: string;
  breedName: string;
};

export default function BreedMembers({ breedSlug, breedName }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setMembers(listMembersByBreed(breedSlug));
      setReady(true);
    };
    refresh();
    return subscribeMembers(refresh);
  }, [breedSlug]);

  return (
    <aside className="rounded-[1.8rem] bg-white p-5 shadow-pop ring-2 ring-ink/10 lg:sticky lg:top-28">
      <p className="text-xs font-extrabold uppercase tracking-widest text-coral">Baasjes</p>
      <h2 className="mt-1 font-display text-2xl font-semibold">Wie heeft een {breedName}</h2>
      <p className="mt-2 text-sm font-bold text-muted">
        Bijnaam en woonplaats — zoals ze zich hier hebben aangemeld.
      </p>

      {!ready && <p className="mt-4 text-sm font-bold text-muted">Lijst ophalen…</p>}

      {ready && members.length === 0 && (
        <p className="mt-4 rounded-2xl bg-foam px-4 py-3 text-sm font-bold text-muted">
          Nog niemand hier.{" "}
          <a className="text-sky-deep underline decoration-2 underline-offset-2" href="/intro#aanmelden">
            Meld je aan
          </a>
          .
        </p>
      )}

      {members.length > 0 && (
        <ul className="mt-4 divide-y divide-ink/10">
          {members.map((member) => (
            <li key={member.id} className="flex items-baseline justify-between gap-3 py-2.5">
              <span className="font-extrabold">{displayNickname(member)}</span>
              <span className="text-sm font-bold text-muted">
                {member.woonplaats || "—"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
