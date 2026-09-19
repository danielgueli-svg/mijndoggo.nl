import { useEffect, useMemo, useState, type FormEvent } from "react";
import { filesToPhotos } from "../lib/compress-image";
import {
  createOwnerDogRepository,
  validateOwnerDogWrite,
  type OwnerDog,
} from "../lib/owner-dogs";

type Props = {
  breedSlug: string;
  breedName: string;
};

const repo = createOwnerDogRepository();

function DogPhoto({ dog }: { dog: OwnerDog }) {
  const photo = dog.photos.find((item) => item.url.length > 8);
  if (photo) {
    return (
      <img
        src={photo.url}
        alt={photo.alt}
        className="aspect-[4/3] w-full object-cover"
      />
    );
  }
  return (
    <div
      className="flex aspect-[4/3] flex-col items-center justify-center gap-2 bg-sun/70"
      aria-hidden="true"
    >
      <svg viewBox="0 0 64 64" className="h-14 w-14" fill="none">
        <ellipse cx="32" cy="40" rx="11" ry="9" fill="#1C2740" />
        <ellipse cx="18" cy="24" rx="7" ry="9" fill="#1C2740" />
        <ellipse cx="46" cy="24" rx="7" ry="9" fill="#1C2740" />
        <ellipse cx="24" cy="16" rx="5.5" ry="7" fill="#1C2740" />
        <ellipse cx="40" cy="16" rx="5.5" ry="7" fill="#1C2740" />
      </svg>
      <span className="text-xs font-extrabold uppercase tracking-widest text-ink">
        Geen foto
      </span>
    </div>
  );
}

export default function OwnerDogs({ breedSlug, breedName }: Props) {
  const [dogs, setDogs] = useState<OwnerDog[]>([]);
  const [ready, setReady] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [ageYears, setAgeYears] = useState("2");
  const [bio, setBio] = useState("");
  const [photos, setPhotos] = useState<{ url: string; alt: string }[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    repo.listByBreed(breedSlug).then((list) => {
      if (!cancelled) {
        setDogs(list);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [breedSlug]);

  const empty = ready && dogs.length === 0;

  const remaining = useMemo(() => 280 - bio.length, [bio]);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErrors([]);
    try {
      const result = await filesToPhotos(files, photos, `${name || "Hond"} van een eigenaar`);
      setPhotos(result.photos);
      if (result.error) setErrors([result.error]);
    } catch {
      setErrors(["Die foto wilde niet meewerken. Probeer een kleinere jpg of png."]);
    } finally {
      setBusy(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const input = {
      breedSlug,
      name,
      ageYears: Number(ageYears),
      bio,
      photos: photos.map((photo) => ({
        ...photo,
        alt: photo.alt || `${name} de ${breedName}`,
      })),
    };
    const nextErrors = validateOwnerDogWrite(input);
    if (nextErrors.length) {
      setErrors(nextErrors);
      return;
    }
    setBusy(true);
    setErrors([]);
    try {
      const dog = await repo.create(input);
      setDogs((current) => [dog, ...current]);
      setName("");
      setAgeYears("2");
      setBio("");
      setPhotos([]);
      setFormOpen(false);
      setStatus(`${dog.name} staat erbij. Hallo ${dog.name}!`);
    } catch {
      setErrors(["Opslaan ging mis. Check of je browser localStorage toestaat."]);
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(id: string, dogName: string) {
    const ok = window.confirm(`${dogName} van dit apparaat halen?`);
    if (!ok) return;
    await repo.remove(breedSlug, id);
    setDogs((current) => current.filter((dog) => dog.id !== id));
    setStatus(`${dogName} is van dit apparaat gehaald.`);
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="eigenaren-titel">
      <div className="flex flex-col gap-4 rounded-[1.8rem] bg-white p-5 shadow-pop ring-2 ring-ink/10 sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-widest text-coral">
              Honden van eigenaren
            </p>
            <h2 id="eigenaren-titel" className="mt-1 font-display text-3xl font-semibold">
              Show je {breedName.toLowerCase()}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              MVP: alles blijft op <strong>dit apparaat</strong> (localStorage). Geen account,
              geen server. Later kunnen we dit 1-op-1 naar een echte API tillen — het datamodel
              is er al klaar voor.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormOpen((open) => !open);
              setErrors([]);
              setStatus(null);
            }}
            className="shrink-0 rounded-full bg-coral px-5 py-3 text-sm font-extrabold text-white shadow-pop ring-2 ring-ink/10 transition hover:bg-blush"
          >
            {formOpen ? "Formulier dicht" : "Zet jouw hond erbij"}
          </button>
        </div>

        {status && (
          <p className="rounded-2xl bg-foam px-4 py-3 text-sm font-bold text-ink" role="status">
            {status}
          </p>
        )}

        {formOpen && (
          <form onSubmit={onSubmit} className="grid gap-4 rounded-[1.4rem] bg-cream p-4 ring-2 ring-ink/10 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-extrabold">
                Naam
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={32}
                  placeholder="Bijv. Pip"
                  className="rounded-2xl border-2 border-ink/10 bg-white px-4 py-2.5 font-bold"
                />
              </label>
              <label className="grid gap-1 text-sm font-extrabold">
                Leeftijd (jaar)
                <input
                  value={ageYears}
                  onChange={(e) => setAgeYears(e.target.value)}
                  required
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
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
                maxLength={280}
                rows={3}
                placeholder="Gek op plassen in plassen, allergisch voor stofzuigers."
                className="rounded-2xl border-2 border-ink/10 bg-white px-4 py-2.5 font-bold"
              />
              <span className="text-xs font-bold text-muted">{remaining} tekens over</span>
            </label>
            <label className="grid gap-1 text-sm font-extrabold">
              Foto's (max 3, blijven lokaal)
              <span className="flex flex-wrap items-center gap-3">
                <span className="relative inline-flex">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => void onFiles(e.target.files)}
                    className="absolute inset-0 cursor-pointer opacity-0"
                    aria-label="Kies foto's van je hond"
                  />
                  <span className="rounded-full bg-sun px-4 py-2 text-sm font-extrabold text-ink shadow-pop ring-2 ring-ink/10">
                    Kies foto's
                  </span>
                </span>
                <span className="text-xs font-bold text-muted">
                  {photos.length === 0
                    ? "Nog geen foto — mag ook zonder."
                    : `${photos.length} foto${photos.length === 1 ? "" : "'s"} klaar`}
                </span>
              </span>
            </label>
            {photos.length > 0 && (
              <ul className="flex flex-wrap gap-3">
                {photos.map((photo, index) => (
                  <li key={photo.url.slice(0, 24) + index} className="relative">
                    <img
                      src={photo.url}
                      alt={photo.alt}
                      className="h-24 w-24 rounded-2xl object-cover ring-2 ring-ink/10"
                    />
                    <button
                      type="button"
                      className="absolute -right-2 -top-2 rounded-full bg-ink px-2 text-xs font-extrabold text-white"
                      onClick={() => setPhotos((current) => current.filter((_, i) => i !== index))}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
                {busy ? "Even geduld…" : "Hond toevoegen"}
              </button>
              <p className="self-center text-xs font-bold text-muted">
                Geen account nodig. Echt niet.
              </p>
            </div>
          </form>
        )}

        {!ready && (
          <p className="text-sm font-bold text-muted" role="status">
            Honden ophalen van dit apparaat…
          </p>
        )}

        {empty && (
          <div className="rounded-[1.4rem] border-2 border-dashed border-ink/15 bg-foam px-5 py-8 text-center">
            <p className="font-display text-2xl font-semibold">Nog geen honden van eigenaren</p>
            <p className="mx-auto mt-2 max-w-md text-sm font-bold text-muted">
              Wees de eerste die een {breedName.toLowerCase()} showt. Naam, leeftijd, een
              biootje, optioneel een foto — klaar is Pip.
            </p>
          </div>
        )}

        {dogs.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {dogs.map((dog) => (
              <li
                key={dog.id}
                className="flex flex-col overflow-hidden rounded-[1.4rem] bg-cream ring-2 ring-ink/10"
              >
                <DogPhoto dog={dog} />
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-xl font-semibold">{dog.name}</h3>
                    <p className="text-xs font-extrabold uppercase tracking-widest text-muted">
                      {dog.ageYears === 1 ? "1 jaar" : `${dog.ageYears} jaar`}
                    </p>
                  </div>
                  <p className="text-sm leading-snug text-ink">{dog.bio}</p>
                  <button
                    type="button"
                    onClick={() => void onRemove(dog.id, dog.name)}
                    className="mt-auto self-start text-xs font-extrabold uppercase tracking-widest text-coral hover:underline"
                  >
                    Verwijder van dit apparaat
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
