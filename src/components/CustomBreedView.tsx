import { useEffect, useState } from "react";
import BreedMembers from "./BreedMembers";
import OwnerDogs from "./OwnerDogs";
import { energyLabels, sizeLabels } from "../lib/catalog";
import {
  CUSTOM_BREED_FALLBACK_IMAGE,
  getCustomBreed,
  type CustomBreed,
} from "../lib/custom-breeds";
import { unsplashSrc } from "../lib/images";

function storyParagraphs(story: string): string[] {
  return story
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

export default function CustomBreedView() {
  const [breed, setBreed] = useState<CustomBreed | null>(null);
  const [ready, setReady] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("slug")?.trim() ?? "";
    const found = slug ? getCustomBreed(slug) ?? null : null;
    setBreed(found);
    setReady(true);
    if (found && params.get("nieuw") === "1") {
      setBanner(`${found.name} staat live — op deze pagina én op de homepage.`);
    } else if (found && params.get("bewerkt") === "1") {
      setBanner(`Wijzigingen van ${found.name} staan live op deze pagina en op home.`);
    }
    if (found) {
      document.title = `${found.name} · MijnDoggo`;
    }
  }, []);

  if (!ready) {
    return (
      <p className="mx-auto max-w-6xl px-4 py-10 text-sm font-bold text-muted sm:px-6">
        Ras laden…
      </p>
    );
  }

  if (!breed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-4xl font-semibold">Ras niet gevonden</h1>
        <p className="mt-3 text-muted">
          Dit eigen ras staat niet op dit apparaat. Voeg het opnieuw toe, of kies een ras uit de
          catalogus.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/rassen/nieuw"
            className="rounded-full bg-coral px-5 py-3 text-sm font-extrabold text-white shadow-pop"
          >
            Ras toevoegen
          </a>
          <a
            href="/rassen"
            className="rounded-full bg-white px-5 py-3 text-sm font-extrabold shadow-pop ring-2 ring-ink/10"
          >
            Alle rassen
          </a>
        </div>
      </div>
    );
  }

  const fallback = unsplashSrc(CUSTOM_BREED_FALLBACK_IMAGE.unsplashId, 1200, 800);
  const gallery = breed.photos.length
    ? breed.photos.slice(0, 3)
    : [{ url: fallback, alt: CUSTOM_BREED_FALLBACK_IMAGE.alt }];

  return (
    <article>
      {banner && (
        <p
          className="mx-auto mt-6 max-w-6xl rounded-[1.2rem] bg-foam px-4 py-3 text-sm font-bold text-ink ring-2 ring-ink/10 sm:px-6"
          role="status"
        >
          {banner}{" "}
          <a className="text-sky-deep underline decoration-2 underline-offset-2" href="/#rassen">
            Naar de homepage-klikker
          </a>
        </p>
      )}

      <header className="mx-auto max-w-6xl px-4 pb-4 pt-10 sm:px-6">
        <p className="text-xs font-extrabold uppercase tracking-widest text-coral">
          Eigen ras · {breed.origin}
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-4xl font-semibold sm:text-6xl">{breed.name}</h1>
          <a
            href={`/rassen/nieuw?edit=${encodeURIComponent(breed.slug)}`}
            className="rounded-full bg-white px-4 py-2 text-sm font-extrabold shadow-pop ring-2 ring-ink/10 hover:bg-sun"
          >
            Bewerken
          </a>
        </div>
        <p className="mt-4 max-w-2xl text-xl font-semibold text-muted">{breed.tagline}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          <li className="rounded-full bg-sun px-3 py-1 text-xs font-extrabold uppercase tracking-wide">
            {sizeLabels[breed.size]}
          </li>
          <li className="rounded-full bg-sky px-3 py-1 text-xs font-extrabold uppercase tracking-wide">
            {energyLabels[breed.energy]}
          </li>
          <li className="rounded-full bg-blush px-3 py-1 text-xs font-extrabold uppercase tracking-wide">
            {breed.goodWithKids ? "Vaak fijn met kinderen" : "Niet per se het eerste ras voor kinderen"}
          </li>
          {breed.traits.map((trait) => (
            <li
              key={trait}
              className="rounded-full bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wide ring-2 ring-ink/10"
            >
              {trait}
            </li>
          ))}
        </ul>
      </header>

      <section className="breed-photo-compact mx-auto px-4 py-3 sm:px-6" aria-label={`Foto's van de ${breed.name}`}>
        <p className="text-xs font-extrabold uppercase tracking-widest text-coral">Fotogalerij</p>
        <h2 className="mt-1 font-display text-xl font-semibold">Even kijken. Even kwispelen.</h2>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {gallery.map((photo, index) => (
            <figure
              key={`${photo.url.slice(0, 24)}-${index}`}
              className="overflow-hidden rounded-xl bg-white shadow-pop ring-2 ring-ink/10"
            >
              <img
                src={photo.url}
                alt={photo.alt}
                width="280"
                height="210"
                className="w-full object-cover"
              />
            </figure>
          ))}
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <details className="rounded-[1.8rem] bg-white p-5 shadow-pop ring-2 ring-ink/10 sm:p-8">
          <summary className="cursor-pointer font-display text-2xl font-semibold">
            Kort verhaal
            <span className="ml-2 text-sm font-bold text-muted">tik om te openen</span>
          </summary>
          <p className="breed-story mt-4 text-lg leading-relaxed text-ink">
            {storyParagraphs(breed.story)[0] ?? breed.tagline}
          </p>
        </details>
        <BreedMembers breedSlug={breed.slug} breedName={breed.shortName} />
      </div>

      <OwnerDogs breedSlug={breed.slug} breedName={breed.shortName} />

      <p className="mx-auto max-w-6xl px-4 pb-8 text-sm font-bold sm:px-6">
        <a className="text-sky-deep underline decoration-2 underline-offset-2" href="/rassen">
          ← Terug naar alle rassen
        </a>
        {" · "}
        <a className="text-sky-deep underline decoration-2 underline-offset-2" href="/#rassen">
          Naar home
        </a>
      </p>
    </article>
  );
}
