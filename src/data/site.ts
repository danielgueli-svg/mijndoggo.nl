import { unsplashSrc } from "../lib/images";
import { photos, type BreedImage } from "./photos";

export const site = {
  name: "MijnDoggo",
  domain: "mijndoggo.nl",
  tagline: "De warme Nederlandse plek voor hondenliefhebbers.",
  description:
    "Misschien zoek je een ras dat bij jullie ritme past, of een tip die voelt als een zacht gesprek aan de keukentafel. MijnDoggo is de warme Nederlandse plek voor rassenverhalen, praktische tips en jouw hond.",
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
