import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { BreedEnergy, BreedSize, CatalogBreed } from "../lib/catalog";
import {
  createCustomBreed,
  getCustomBreed,
  updateCustomBreed,
  validateCustomBreedWrite,
  type CustomBreedWrite,
} from "../lib/custom-breeds";

type Props = {
  catalog: CatalogBreed[];
};

const sizes: BreedSize[] = ["klein", "middel", "groot"];
const energies: BreedEnergy[] = ["laag", "middel", "hoog"];

function parseTraits(raw: string): string[] {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function BreedEditor({ catalog }: Props) {
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [missing, setMissing] = useState(false);
  const [catalogLocked, setCatalogLocked] = useState(false);

  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [tagline, setTagline] = useState("");
  const [size, setSize] = useState<BreedSize>("middel");
  const [energy, setEnergy] = useState<BreedEnergy>("middel");
  const [goodWithKids, setGoodWithKids] = useState(true);
  const [origin, setOrigin] = useState("");
  const [traitsRaw, setTraitsRaw] = useState("");
  const [story, setStory] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("edit")?.trim() || null;
    setEditSlug(slug);
    if (!slug) {
      setReady(true);
      return;
    }
    if (catalog.some((breed) => breed.slug === slug)) {
      setCatalogLocked(true);
      setReady(true);
      return;
    }
    const existing = getCustomBreed(slug);
    if (!existing) {
      setMissing(true);
      setReady(true);
      return;
    }
    setName(existing.name);
    setShortName(existing.shortName);
    setTagline(existing.tagline);
    setSize(existing.size);
    setEnergy(existing.energy);
    setGoodWithKids(existing.goodWithKids);
    setOrigin(existing.origin);
    setTraitsRaw(existing.traits.join(", "));
    setStory(existing.story);
    setReady(true);
  }, [catalog]);

  const reserved = useMemo(() => catalog.map((breed) => breed.slug), [catalog]);
  const editing = Boolean(editSlug) && !catalogLocked && !missing;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const input: CustomBreedWrite = {
      name,
      shortName,
      tagline,
      size,
      energy,
      goodWithKids,
      origin,
      traits: parseTraits(traitsRaw),
      story,
    };
    const nextErrors = validateCustomBreedWrite(input);
    if (nextErrors.length) {
      setErrors(nextErrors);
      return;
    }
    setBusy(true);
    setErrors([]);
    try {
      const saved =
        editing && editSlug
          ? updateCustomBreed(editSlug, input)
          : createCustomBreed(input, reserved);
      window.location.href = `/rassen/eigen?slug=${encodeURIComponent(saved.slug)}`;
    } catch (error) {
      setErrors([
        error instanceof Error
          ? error.message
          : "Opslaan ging mis. Check of je browser localStorage toestaat.",
      ]);
      setBusy(false);
    }
  }

  if (!ready) {
    return (
      <p className="text-sm font-bold text-muted" role="status">
        Formulier laden…
      </p>
    );
  }

  if (catalogLocked) {
    return (
      <div className="rounded-[1.8rem] bg-white p-6 shadow-pop ring-2 ring-ink/10">
        <h1 className="font-display text-3xl font-semibold">Dit ras staat al in de catalogus</h1>
        <p className="mt-3 text-muted">
          Ingebouwde rassen bewerk je niet in deze MVP. Voeg een eigen ras toe, of open het
          bestaande verhaal.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="/rassen/nieuw"
            className="rounded-full bg-coral px-5 py-3 text-sm font-extrabold text-white shadow-pop"
          >
            Nieuw ras maken
          </a>
          <a
            href={`/rassen/${editSlug}`}
            className="rounded-full bg-white px-5 py-3 text-sm font-extrabold shadow-pop ring-2 ring-ink/10"
          >
            Naar ras-pagina
          </a>
        </div>
      </div>
    );
  }

  if (missing) {
    return (
      <div className="rounded-[1.8rem] bg-white p-6 shadow-pop ring-2 ring-ink/10">
        <h1 className="font-display text-3xl font-semibold">Eigen ras niet gevonden</h1>
        <p className="mt-3 text-muted">
          Dit slug staat niet in de localStorage van dit apparaat. Misschien een andere browser?
        </p>
        <a
          href="/rassen/nieuw"
          className="mt-5 inline-flex rounded-full bg-coral px-5 py-3 text-sm font-extrabold text-white shadow-pop"
        >
          Nieuw ras maken
        </a>
      </div>
    );
  }

  return (
    <section className="rounded-[1.8rem] bg-white p-5 shadow-pop ring-2 ring-ink/10 sm:p-8">
      <p className="text-xs font-extrabold uppercase tracking-widest text-coral">
        {editing ? "Bewerken" : "Nieuw ras"}
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
        {editing ? `Pas ${name || "je ras"} aan` : "Voeg een ras toe"}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Client-MVP: na opslaan staat het ras meteen op de homepage (bij zoeken, en als eigen ras
        naast de acht populaire) en op een eigen ras-pagina. Alleen op dit apparaat.
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-extrabold">
            Rasnaam
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={48}
              placeholder="Bijv. Markiesje"
              className="rounded-2xl border-2 border-ink/10 bg-cream px-4 py-2.5 font-bold"
            />
          </label>
          <label className="grid gap-1 text-sm font-extrabold">
            Korte naam
            <input
              value={shortName}
              onChange={(event) => setShortName(event.target.value)}
              maxLength={24}
              placeholder="Optioneel"
              className="rounded-2xl border-2 border-ink/10 bg-cream px-4 py-2.5 font-bold"
            />
          </label>
        </div>

        <label className="grid gap-1 text-sm font-extrabold">
          Tagline
          <input
            value={tagline}
            onChange={(event) => setTagline(event.target.value)}
            required
            maxLength={120}
            placeholder="Eén zin die het ras vangt."
            className="rounded-2xl border-2 border-ink/10 bg-cream px-4 py-2.5 font-bold"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="grid gap-1 text-sm font-extrabold">
            Formaat
            <select
              value={size}
              onChange={(event) => setSize(event.target.value as BreedSize)}
              className="rounded-2xl border-2 border-ink/10 bg-cream px-4 py-2.5 font-bold"
            >
              {sizes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-extrabold">
            Energie
            <select
              value={energy}
              onChange={(event) => setEnergy(event.target.value as BreedEnergy)}
              className="rounded-2xl border-2 border-ink/10 bg-cream px-4 py-2.5 font-bold"
            >
              {energies.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-extrabold">
            Herkomst
            <input
              value={origin}
              onChange={(event) => setOrigin(event.target.value)}
              maxLength={40}
              placeholder="Nederland"
              className="rounded-2xl border-2 border-ink/10 bg-cream px-4 py-2.5 font-bold"
            />
          </label>
        </div>

        <label className="flex items-start gap-3 rounded-2xl bg-foam px-4 py-3 text-sm font-extrabold">
          <input
            type="checkbox"
            checked={goodWithKids}
            onChange={(event) => setGoodWithKids(event.target.checked)}
            className="mt-1 h-4 w-4 accent-coral"
          />
          <span>Vaak fijn met kinderen</span>
        </label>

        <label className="grid gap-1 text-sm font-extrabold">
          Trekjes (komma’s, 2 tot 6)
          <input
            value={traitsRaw}
            onChange={(event) => setTraitsRaw(event.target.value)}
            placeholder="zacht, alert, knuffel"
            className="rounded-2xl border-2 border-ink/10 bg-cream px-4 py-2.5 font-bold"
          />
        </label>

        <label className="grid gap-1 text-sm font-extrabold">
          Kort verhaal
          <textarea
            value={story}
            onChange={(event) => setStory(event.target.value)}
            required
            rows={8}
            maxLength={4000}
            placeholder="Temperament, verzorging, voor wie het ras past…"
            className="rounded-2xl border-2 border-ink/10 bg-cream px-4 py-2.5 font-bold"
          />
        </label>

        {errors.length > 0 && (
          <ul className="list-disc space-y-1 rounded-2xl bg-blush/30 px-5 py-3 text-sm font-bold text-ink">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-ink px-5 py-3 text-sm font-extrabold text-cream shadow-pop disabled:opacity-60"
          >
            {busy ? "Opslaan…" : editing ? "Wijzigingen publiceren" : "Publiceren op home & ras-pagina"}
          </button>
          <a
            href="/rassen"
            className="rounded-full bg-white px-5 py-3 text-sm font-extrabold shadow-pop ring-2 ring-ink/10"
          >
            Annuleren
          </a>
        </div>
      </form>
    </section>
  );
}
