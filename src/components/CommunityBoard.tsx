import { useEffect, useMemo, useState } from "react";
import { fold } from "../lib/text";
import { filterNlPlaces, findNlPlace, isNlPlace } from "../lib/nl-places";
import {
  displayNickname,
  isDemoMember,
  listMembers,
  memberPlace,
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
    if (!q) return [];
    return dutchMembers.filter((member) => {
      const plaats = fold(memberPlace(member));
      if (selectedPlace) return plaats === fold(selectedPlace);
      return plaats.includes(q);
    });
  }, [dutchMembers, q, selectedPlace]);

  const places = useMemo(() => placesByMemberCount(dutchMembers), [dutchMembers]);
  const hasDemo = dutchMembers.some(isDemoMember);

  const spots = useMemo(
    () => walkSpotsForCity(selectedPlace ?? query),
    [selectedPlace, query],
  );

  return (
    <div className="grid gap-8">
      <label className="grid gap-1 text-sm font-extrabold">
        Zoek op woonplaats / stad
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Typ een stad, bijv. Amsterdam"
          className="w-full rounded-full border-2 border-ink/15 bg-white px-5 py-3 text-sm font-bold shadow-pop outline-none placeholder:font-semibold placeholder:text-muted/70"
        />
      </label>

      <section aria-labelledby="plekken-titel">
        <h2 id="plekken-titel" className="font-display text-2xl font-semibold">
          Plekken, gesorteerd op aantal baasjes
        </h2>
        <p className="mt-1 text-sm font-bold text-muted">
          Sterkste community eerst. Tik een rij, of zoek hierboven.
          {hasDemo ? " Een paar voorbeeld-baasjes staan klaar, zodat de lijst niet leeg is." : ""}
        </p>
        {!ready && <p className="mt-3 text-sm font-bold text-muted">Plekken laden…</p>}
        {ready && places.length === 0 && (
          <p className="mt-3 rounded-[1.3rem] bg-white px-4 py-5 text-sm font-bold text-muted ring-2 ring-ink/10">
            Nog geen woonplaatsen. Meld je aan en vul optioneel een plaats in.
          </p>
        )}
        {places.length > 0 && (
          <ul className="mt-4 divide-y divide-ink/10 overflow-hidden rounded-[1.4rem] bg-white ring-2 ring-ink/10">
            {places.map((place) => {
              const active = selectedPlace
                ? fold(selectedPlace) === fold(place.plaats)
                : fold(query) === fold(place.plaats);
              return (
                <li key={place.plaats}>
                  <button
                    type="button"
                    onClick={() => setQuery(active ? "" : place.plaats)}
                    className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-extrabold ${
                      active ? "bg-ink text-cream" : "bg-white hover:bg-sun"
                    }`}
                  >
                    <span>
                      {place.plaats} · {place.count}{" "}
                      {place.count === 1 ? "lid" : "leden"}
                    </span>
                    {active && <span className="text-[10px] font-extrabold uppercase tracking-widest">gekozen</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className={q ? "grid gap-8 lg:grid-cols-2 lg:items-start" : "grid gap-8"}>
        <section aria-labelledby="leden-titel">
          <h2 id="leden-titel" className="font-display text-2xl font-semibold">
            {q ? `Baasjes in ${selectedPlace ?? query.trim()}` : "Baasjes in een stad"}
          </h2>
          <p className="mt-1 text-sm font-bold text-muted">
            Nickname, welk ras, en of ze openstaan voor een wandeling — alle rassen door elkaar.
          </p>
          {ready && !q && (
            <p className="mt-3 rounded-[1.3rem] bg-white px-4 py-5 text-sm font-bold text-muted ring-2 ring-ink/10">
              Tik een plaats in de lijst of typ een stad, bijvoorbeeld Amsterdam.
            </p>
          )}
          {ready && q && filteredMembers.length === 0 && (
            <p className="mt-3 rounded-[1.3rem] bg-white px-4 py-5 text-sm font-bold text-muted ring-2 ring-ink/10">
              {nlHint
                ? "Alleen Nederlandse plaatsen — probeer bijvoorbeeld Amsterdam of Utrecht."
                : "Niemand in die woonplaats — probeer een andere Nederlandse stad, zoals Amsterdam."}
            </p>
          )}
          {filteredMembers.length > 0 && (
            <ul className="mt-4 grid gap-2">
              {filteredMembers.map((member) => (
                <li
                  key={member.id}
                  className="flex items-center justify-between gap-3 rounded-[1.2rem] bg-white px-4 py-3 ring-2 ring-ink/10"
                >
                  <span>
                    <span className="font-extrabold">{displayNickname(member)}</span>
                    <span className="mt-0.5 block text-sm font-bold text-muted">
                      {member.breedName || "Ras onbekend"}
                    </span>
                    {isDemoMember(member) && (
                      <span className="mt-1 inline-block text-[10px] font-extrabold uppercase tracking-widest text-sky-deep">
                        voorbeeld
                      </span>
                    )}
                  </span>
                  {member.wantsWalk ? (
                    <span className="shrink-0 rounded-full bg-sun px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide">
                      wandelen
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>

        {q && (
          <section aria-labelledby="wandelen-titel">
            <h2 id="wandelen-titel" className="font-display text-2xl font-semibold">
              Wandelen bij {selectedPlace ?? query.trim()}
            </h2>
            <p className="mt-1 text-sm font-bold text-muted">
              Populaire uitlaatplekken in de buurt, plus altijd een{" "}
              <strong>strandwandeling</strong> en een <strong>boswandeling</strong>.
            </p>

            {spots.nearby.length > 0 && (
              <ul className="mt-4 grid gap-3">
                {spots.nearby.map((spot) => (
                  <SpotCard key={spot.id} spot={spot} />
                ))}
              </ul>
            )}

            {spots.nearby.length === 0 && (
              <p className="mt-4 rounded-[1.3rem] bg-foam px-4 py-3 text-sm font-bold text-muted">
                Geen specifieke plek in onze lijst voor “{query.trim()}”. Strandwandeling en
                boswandeling blijven hieronder staan.
              </p>
            )}

            <p className="mt-4 text-xs font-extrabold uppercase tracking-widest text-sky-deep">
              Altijd: strandwandeling &amp; boswandeling
            </p>
            <ul className="mt-2 grid gap-3">
              {spots.always.map((spot) => (
                <SpotCard key={spot.id} spot={spot} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
