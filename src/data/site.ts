import { unsplashSrc } from "../lib/images";
import { photos, type BreedImage } from "./photos";

export const site = {
  name: "MijnDoggo",
  domain: "mijndoggo.nl",
  tagline: "Andere hondenmensen. Jouw tips. Samen naar buiten.",
  description:
    "MijnDoggo is de plek om andere hondenbezitters te ontmoeten: deel foto’s, wissel tips uit, en plan een wandeling als jullie klikken. Warm, Nederlands, en gemaakt voor baasjes die hun hond serieus nemen — zonder zwaar te doen.",
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
  { href: "/intro", label: "Intro" },
  { href: "/over", label: "Over" },
] as const;
