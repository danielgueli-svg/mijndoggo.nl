import { useEffect, useMemo, useState, type FormEvent } from "react";
import { energyLabels, sizeLabels, type BreedEnergy, type BreedSize, type CatalogBreed } from "../lib/catalog";
import { filesToPhotos, type LocalPhoto } from "../lib/compress-image";
import {
  createCustomBreed,
  getCustomBreed,
  updateCustomBreed,
  validateCustomBreedWrite,
  type CustomBreedWrite,
} from "../lib/custom-breeds";
import {
  firstOwnerDogForBreed,
  upsertFirstOwnerDog,
  validateOwnerDogWrite,
} from "../lib/owner-dogs";

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

function PhotoField({
  label,
  hint,
  photos,
  onChange,
  alt,
}: {
  label: string;
  hint: string;
  photos: LocalPhoto[];
  onChange: (photos: LocalPhoto[]) => void;
  alt: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    setBusy(true);
    setError(null);
    const result = await filesToPhotos(files, photos, alt);
    onChange(result.photos);
    if (result.error) setError(result.error);
    setBusy(false);
  }

  return (
    <div className="grid gap-2">
      <p className="text-sm font-extrabold">{label}</p>
      <p className="text-xs font-bold text-muted">{hint}</p>
      <label className="relative inline-flex w-fit">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(event) => void onFiles(event.target.files)}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-label={label}
        />
        <span className="rounded-full bg-sun px-4 py-2 text-sm font-extrabold text-ink shadow-pop ring-2 ring-ink/10">
          {busy ? "Foto’s laden…" : "Kies foto’s"}
        </span>
      </label>
      {photos.length > 0 && (
        <ul className="flex flex-wrap gap-3">
          {photos.map((photo, index) => (
            <li key={`${photo.url.slice(0, 24)}-${index}`} className="relative">
              <img
                src={photo.url}
                alt={photo.alt}
                className="h-24 w-24 rounded-2xl object-cover ring-2 ring-ink/10"
              />
              <button
                type="button"
                className="absolute -right-2 -top-2 rounded-full bg-ink px-2 text-xs font-extrabold text-white"
                onClick={() => onChange(photos.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-sm font-bold text-coral">{error}</p>}
    </div>
  );
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
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [dogName, setDogName] = useState("");
  const [dogAge, setDogAge] = useState("2");
  const [dogBio, setDogBio] = useState("");
  const [dogPhotos, setDogPhotos] = useState<LocalPhoto[]>([]);
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
    setPhotos(existing.photos);
    const dog = firstOwnerDogForBreed(slug);
    if (dog) {
      setDogName(dog.name);
      setDogAge(String(dog.ageYears));
      setDogBio(dog.bio);
      setDogPhotos(dog.photos);
    }
    setReady(true);
  }, [catalog]);

  const reserved = useMemo(() => catalog.map((breed) => breed.slug), [catalog]);
  const editing = Boolean(editSlug) && !catalogLocked && !missing;

  async function onSubmit(event: FormEvent) {
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
      photos: photos.map((photo) => ({
        ...photo,
        alt: photo.alt || name.trim() || "Eigen ras",
      })),
    };
    const nextErrors = validateCustomBreedWrite(input);
    const dogStarted = Boolean(dogName.trim() || dogBio.trim() || dogPhotos.length);
    if (dogStarted) {
      nextErrors.push(
        ...validateOwnerDogWrite({
          breedSlug: editSlug ?? "nieuw",
          name: dogName,
          ageYears: Number(dogAge),
          bio: dogBio,
          photos: dogPhotos,
        }),
      );
    }
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
      if (dogStarted) {
        await upsertFirstOwnerDog(saved.slug, {
          name: dogName,
          ageYears: Number(dogAge),
          bio: dogBio,
          photos: dogPhotos.map((photo) => ({
            ...photo,
            alt: photo.alt || `${dogName} de ${saved.shortName}`,
          })),
        });
      }
      const flag = editing ? "bewerkt=1" : "nieuw=1";
      window.location.href = `/rassen/eigen?slug=${encodeURIComponent(saved.slug)}&${flag}`;
    } catch (error) {
      const quota =
        error instanceof DOMException && error.name === "QuotaExceededError";
      setErrors([
        quota
          ? "De foto’s zijn te groot voor dit apparaat. Haal er eentje af of kies een kleinere jpg."
          : error instanceof Error
            ? error.message
            : "Opslaan ging mis. Check of je browser lokale opslag toestaat.",
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
          Ingebouwde rassen bewerk je niet in deze eerste versie. Voeg een eigen ras toe, of
          open het bestaande verhaal.
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
          Dit eigen ras staat niet op dit apparaat. Misschien een andere browser?
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
        Publiceren zet het ras meteen op de homepage én op een eigen pagina — met jouw foto’s en
        (als je wilt) je eigen hond. Bewerken kan daarna opnieuw. Alles blijft op dit apparaat.
      </p>

      <form onSubmit={(event) => void onSubmit(event)} className="mt-6 grid gap-4">
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
                  {sizeLabels[item]}
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
                  {energyLabels[item]}
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

        <PhotoField
          label="Foto’s van het ras (max 3)"
          hint="De eerste foto wordt de tegel op de homepage. Blijft op dit apparaat."
          photos={photos}
          onChange={setPhotos}
          alt={name || "Eigen ras"}
        />

        <fieldset className="grid gap-4 rounded-[1.4rem] bg-foam p-4 ring-2 ring-ink/10">
          <legend className="px-1 text-sm font-extrabold">Jouw hond bij dit ras (optioneel)</legend>
          <p className="-mt-2 text-xs font-bold text-muted">
            Na publiceren staat die op de ras-pagina. Leeg laten kan — je kunt ’m later nog
            toevoegen.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1 text-sm font-extrabold">
              Naam van je hond
              <input
                value={dogName}
                onChange={(event) => setDogName(event.target.value)}
                maxLength={32}
                placeholder="Bijv. Pip"
                className="rounded-2xl border-2 border-ink/10 bg-white px-4 py-2.5 font-bold"
              />
            </label>
            <label className="grid gap-1 text-sm font-extrabold">
              Leeftijd (jaar)
              <input
                value={dogAge}
                onChange={(event) => setDogAge(event.target.value)}
                type="number"
                min={0}
                max={25}
                step={0.5}
                className="rounded-2xl border-2 border-ink/10 bg-white px-4 py-2.5 font-bold"
              />
            </label>
          </div>
          <label className="grid gap-1 text-sm font-extrabold">
            Kort biootje
            <textarea
              value={dogBio}
              onChange={(event) => setDogBio(event.target.value)}
              maxLength={280}
              rows={3}
              placeholder="Gek op plassen in plassen, allergisch voor stofzuigers."
              className="rounded-2xl border-2 border-ink/10 bg-white px-4 py-2.5 font-bold"
            />
          </label>
          <PhotoField
            label="Foto’s van jouw hond (max 3)"
            hint="Optioneel. Zichtbaar op de ras-pagina onder ‘Honden van eigenaren’."
            photos={dogPhotos}
            onChange={setDogPhotos}
            alt={dogName || "Hond van een eigenaar"}
          />
        </fieldset>

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
            {busy
              ? "Opslaan…"
              : editing
                ? "Wijzigingen publiceren"
                : "Publiceren op home & ras-pagina"}
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
