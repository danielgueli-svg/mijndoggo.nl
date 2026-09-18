import { unsplashSrc } from "../lib/images";
import { photos, type BreedImage } from "./photos";

export const site = {
  name: "MijnDoggo",
  domain: "mijndoggo.nl",
  tagline: "De vrolijkste hangout voor hondenvrienden.",
  description:
    "MijnDoggo is een Nederlandstalige, open-source site voor dog lovers: klik een ras, lees de vibe, zet je eigen hond in de spotlight en scoor tips voor wandelen, wassen en meer.",
};

export const heroPhotos: Array<BreedImage & { caption: string }> = [
  { ...photos.tulipRetriever, caption: "Tulpentijd is altijd" },
  { ...photos.twoRunning, caption: "Renvrienden" },
  { ...photos.beachToller, caption: "Strandkwispel" },
];

export function heroSrc(id: string): string {
  return unsplashSrc(id, 900, 1100);
}

export const nav = [
  { href: "/", label: "Home" },
  { href: "/rassen", label: "Rassen" },
  { href: "/tips", label: "Tips" },
  { href: "/over", label: "Over" },
] as const;
