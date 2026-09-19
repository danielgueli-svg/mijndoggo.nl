import { useEffect, useMemo, useState } from "react";
import { fold } from "../lib/text";
import { filterNlPlaces, findNlPlace, isNlPlace } from "../lib/nl-places";
import {
  displayNickname,
  listMembers,
  placesByMemberCount,
  subscribeMembers,
  type Member,
} from "../lib/members";
import { walkKindLabels, walkSpotsForCity, type WalkSpot } from "../lib/walk-spots";

function SpotCard({ spot }: { spot: WalkSpot }) {
  return (
    <li className="rounded-[1.3rem] bg-cream p-4 ring-2 ring-ink/10">
      <p className="text-[11px] font-extrabold uppercase tracking-widest text-sky-deep">
        {walkKindLabels[spot.kind]}
        {spot.city ? ` · ${spot.city}` : ""}
      </p>
      <h3 className="mt-1 font-display text-xl font-semibold">{spot.name}</h3>
      <p className="mt-1 text-sm leading-snug text-muted">{spot.description}</p>
    </li>
  );
}

export default function CommunityBoard() {
  const [members, setMembers] = useState<Member[]>([]);
  const [query, setQuery] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setMembers(listMembers());
      setReady(true);
    };
    refresh();
    return subscribeMembers(refresh);
  }, []);

  const q = fold(query);
  const nlHint = q.length > 0 && filterNlPlaces(query).length === 0;
  const selectedPlace = findNlPlace(query);

  const dutchMembers = useMemo(
    () => members.filter((member) => !member.woonplaats || isNlPlace(member.woonplaats)),
    [members],
  );

  const filteredMembers = useMemo(() => {
    if (!q) return dutchMembers;
    return dutchMembers.filter((member) => {
      const plaats = fold(member.woonplaats);
      return plaats.includes(q);
    });
  }, [dutchMembers, q]);

  const places = useMemo(
    () => placesByMemberCount(q ? filteredMembers : dutchMembers),
    [dutchMembers, filteredMembers, q],
  );

  const spots = useMemo(
    () => walkSpotsForCity(selectedPlace ?? query),
    [selectedPlace, query],
  );

  return (
    <div className="grid gap-8">
      <label className="grid gap-1 text-sm font-extrabold">
        Zoek op woonplaats
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nederlandse plaats, bijv. Haarlem…"
          className="w-full rounded-full border-2 border-ink/15 bg-white px-5 py-3 text-sm font-bold shadow-pop outline-none placeholder:font-semibold placeholder:text-muted/70"
        />
      </label>

      <section aria-labelledby="plekken-titel">
        <h2 id="plekken-titel" className="font-display text-2xl font-semibold">
          Plekken, gesorteerd op aantal baasjes
        </h2>
        <p className="mt-1 text-sm font-bold text-muted">
          Alleen Nederlandse woonplaatsen, gesorteerd op aantal leden. Tik een plaats.
        </p>
        {!ready && <p className="mt-3 text-sm font-bold text-muted">Plekken laden…</p>}
        {ready && places.length === 0 && (
          <p className="mt-3 rounded-[1.3rem] bg-white px-4 py-5 text-sm font-bold text-muted ring-2 ring-ink/10">
            Nog geen woonplaatsen. Meld je aan en vul optioneel een plaats in.
          </p>
        )}
        {places.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {places.map((place) => {
              const active = fold(query) === fold(place.plaats);
              return (
                <li key={place.plaats}>
                  <button
                    type="button"
                    onClick={() => setQuery(active ? "" : place.plaats)}
                    className={`rounded-full px-4 py-2 text-sm font-extrabold ring-2 ring-ink/10 ${
                      active ? "bg-ink text-cream" : "bg-white hover:bg-sun"
                    }`}
                  >
                    {place.plaats} · {place.count}{" "}
                    {place.count === 1 ? "lid" : "leden"}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section aria-labelledby="leden-titel">
        <h2 id="leden-titel" className="font-display text-2xl font-semibold">
          Baasjes
        </h2>
        <p className="mt-1 text-sm font-bold text-muted">Bijnaam en ras.</p>
        {ready && filteredMembers.length === 0 && (
          <p className="mt-3 rounded-[1.3rem] bg-white px-4 py-5 text-sm font-bold text-muted ring-2 ring-ink/10">
            {nlHint
              ? "Alleen Nederlandse plaatsen — probeer bijvoorbeeld Utrecht of Haarlem."
              : dutchMembers.length === 0
                ? "Nog niemand aangemeld op dit apparaat."
                : "Niemand in die woonplaats — probeer een andere Nederlandse stad."}
          </p>
        )}
        {filteredMembers.length > 0 && (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {filteredMembers.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between gap-3 rounded-[1.2rem] bg-white px-4 py-3 ring-2 ring-ink/10"
              >
                <span className="font-extrabold">{displayNickname(member)}</span>
                <span className="text-sm font-bold text-muted">
                  {member.breedName}
                  {member.woonplaats ? ` · ${member.woonplaats}` : ""}
                  {member.wantsWalk ? " · wandelen" : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="wandelen-titel">
        <h2 id="wandelen-titel" className="font-display text-2xl font-semibold">
          Wandelen in de buurt
        </h2>
        <p className="mt-1 text-sm font-bold text-muted">
          Plekken bij je stad, en <strong>altijd</strong> strand en bos.
        </p>

        {spots.nearby.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-extrabold uppercase tracking-widest text-coral">
              Bij {query.trim()}
            </p>
            <ul className="mt-2 grid gap-3 md:grid-cols-2">
              {spots.nearby.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </ul>
          </div>
        )}

        {query.trim() && spots.nearby.length === 0 && (
          <p className="mt-4 rounded-[1.3rem] bg-foam px-4 py-3 text-sm font-bold text-muted">
            Geen specifieke plek in onze lijst voor “{query.trim()}”. Strand en bos blijven hieronder staan.
          </p>
        )}

        {!query.trim() && (
          <p className="mt-4 rounded-[1.3rem] bg-foam px-4 py-3 text-sm font-bold text-muted">
            Zoek een woonplaats hierboven om plekken in de buurt te zien. Strand en bos staan altijd klaar.
          </p>
        )}

        <div className="mt-4">
          <p className="text-xs font-extrabold uppercase tracking-widest text-sky-deep">
            Altijd: strand &amp; bos
          </p>
          <ul className="mt-2 grid gap-3 md:grid-cols-2">
            {spots.always.map((spot) => (
              <SpotCard key={spot.id} spot={spot} />
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
