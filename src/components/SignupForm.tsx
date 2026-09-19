import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { CatalogBreed } from "../lib/catalog";
import {
  customBreedToCatalog,
  listCustomBreeds,
  subscribeCustomBreeds,
} from "../lib/custom-breeds";
import {
  createMember,
  validateMemberWrite,
} from "../lib/members";
import BreedPicker from "./BreedPicker";
import PlacePicker from "./PlacePicker";

type Props = {
  catalog: CatalogBreed[];
};

export default function SignupForm({ catalog }: Props) {
  const [custom, setCustom] = useState<CatalogBreed[]>([]);
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [dogName, setDogName] = useState("");
  const [woonplaats, setWoonplaats] = useState("");
  const [breedSlug, setBreedSlug] = useState("");
  const [wantsWalk, setWantsWalk] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [statusHref, setStatusHref] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const refresh = () => setCustom(listCustomBreeds().map(customBreedToCatalog));
    refresh();
    return subscribeCustomBreeds(refresh);
  }, []);

  const breeds = useMemo(() => {
    const seen = new Set(catalog.map((breed) => breed.slug));
    return [...catalog, ...custom.filter((breed) => !seen.has(breed.slug))];
  }, [catalog, custom]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const breed = breeds.find((item) => item.slug === breedSlug);
    const input = {
      email,
      nickname,
      dogName,
      woonplaats,
      breedSlug,
      breedName: breed?.name ?? "",
      wantsWalk,
    };
    const nextErrors = validateMemberWrite(input);
    if (nextErrors.length) {
      setErrors(nextErrors);
      setStatus(null);
      setStatusHref(null);
      return;
    }
    setBusy(true);
    setErrors([]);
    try {
      const member = createMember(input);
      setEmail("");
      setNickname("");
      setDogName("");
      setWoonplaats("");
      setBreedSlug("");
      setWantsWalk(false);
      const who = member.nickname || member.email;
      setStatus(
        `Gelukt! ${who} staat erbij${member.wantsWalk ? " — en wil graag wandelen" : ""}.`,
      );
      setStatusHref(`/rassen/${member.breedSlug}`);
    } catch (error) {
      setErrors([
        error instanceof Error
          ? error.message
          : "Opslaan ging mis. Check of je browser localStorage toestaat.",
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      id="aanmelden"
      className="rounded-[1.8rem] bg-white p-5 shadow-pop ring-2 ring-ink/10 sm:p-8"
      aria-labelledby="aanmelden-titel"
    >
      <p className="text-xs font-extrabold uppercase tracking-widest text-coral">Aanmelden</p>
      <h2 id="aanmelden-titel" className="mt-1 font-display text-3xl font-semibold">
        Zet jezelf bij de baasjes
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Alleen <strong>e-mailadres</strong> is verplicht. Nickname, naam van de hond en
        woonplaats mag je leeg laten. Geen wachtwoord, geen account — het blijft op dit
        apparaat.
      </p>

      {status && (
        <p className="mt-4 rounded-2xl bg-foam px-4 py-3 text-sm font-bold text-ink" role="status">
          {status}{" "}
          <a className="text-sky-deep underline decoration-2 underline-offset-2" href="/community">
            Naar de community
          </a>
          {statusHref ? (
            <>
              {" · "}
              <a className="text-sky-deep underline decoration-2 underline-offset-2" href={statusHref}>
                Naar je ras-pagina
              </a>
            </>
          ) : null}
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-5 grid gap-4">
        <label className="grid gap-1 text-sm font-extrabold">
          E-mailadres <span className="font-bold text-coral">*</span>
          <input
            type="email"
            required
            aria-required="true"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            inputMode="email"
            placeholder="jij@voorbeeld.nl"
            className="rounded-2xl border-2 border-ink/10 bg-cream px-4 py-2.5 font-bold"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-extrabold">
            Nickname
            <input
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              maxLength={32}
              autoComplete="nickname"
              placeholder="Optioneel"
              className="rounded-2xl border-2 border-ink/10 bg-cream px-4 py-2.5 font-bold"
            />
          </label>
          <label className="grid gap-1 text-sm font-extrabold">
            Naam van de hond
            <input
              value={dogName}
              onChange={(event) => setDogName(event.target.value)}
              maxLength={32}
              placeholder="Optioneel"
              className="rounded-2xl border-2 border-ink/10 bg-cream px-4 py-2.5 font-bold"
            />
          </label>
        </div>

        <PlacePicker value={woonplaats} onChange={setWoonplaats} />

        <BreedPicker breeds={breeds} value={breedSlug} onChange={setBreedSlug} />

        <label className="flex items-start gap-3 rounded-2xl bg-foam px-4 py-3 text-sm font-extrabold">
          <input
            type="checkbox"
            checked={wantsWalk}
            onChange={(event) => setWantsWalk(event.target.checked)}
            className="mt-1 h-4 w-4 accent-coral"
          />
          <span>
            Ik wil wandelen met andere baasjes
            <span className="block font-bold text-muted">
              Dan zien anderen in de community dat je openstaat voor een rondje.
            </span>
          </span>
        </label>

        {errors.length > 0 && (
          <ul className="list-disc space-y-1 rounded-2xl bg-blush/30 px-5 py-3 text-sm font-bold text-ink">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        <button
          type="submit"
          disabled={busy}
          className="justify-self-start rounded-full bg-coral px-5 py-3 text-sm font-extrabold text-white shadow-pop ring-2 ring-ink/10 hover:bg-blush disabled:opacity-60"
        >
          {busy ? "Even geduld…" : "Aanmelden"}
        </button>
      </form>
    </section>
  );
}
