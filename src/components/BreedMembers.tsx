import { useEffect, useMemo, useState } from "react";
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

function memberLine(member: Member): string {
  const name = displayNickname(member);
  return member.woonplaats ? `${name} · ${member.woonplaats}` : name;
}

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

  const listed = useMemo(
    () => [...members].sort((a, b) => Number(b.wantsWalk) - Number(a.wantsWalk)),
    [members],
  );

  return (
    <aside className="rounded-[1.8rem] bg-white p-5 shadow-pop ring-2 ring-ink/10 lg:sticky lg:top-28">
      <p className="text-xs font-extrabold uppercase tracking-widest text-coral">Baasjes</p>
      <h2 className="mt-1 font-display text-2xl font-semibold">Baasjes voor dit ras</h2>
      <p className="mt-2 text-sm font-bold text-muted">
        Nickname van wie een {breedName.toLowerCase()} heeft aangemeld.
      </p>

      {!ready && <p className="mt-4 text-sm font-bold text-muted">Lijst ophalen…</p>}

      {ready && listed.length === 0 && (
        <p className="mt-4 rounded-2xl bg-foam px-4 py-3 text-sm font-bold text-muted">
          Nog niemand aangemeld — wees de eerste!{" "}
          <a className="text-sky-deep underline decoration-2 underline-offset-2" href="/aanmelden">
            Aanmelden
          </a>
        </p>
      )}

      {listed.length > 0 && (
        <ul className="mt-4 divide-y divide-ink/10">
          {listed.map((member) => (
            <li key={member.id} className="flex items-baseline justify-between gap-3 py-2.5">
              <span className="font-extrabold">{memberLine(member)}</span>
              {member.wantsWalk && (
                <span className="shrink-0 rounded-full bg-sun px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                  wandelen
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
