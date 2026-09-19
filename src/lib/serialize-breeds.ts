import type { Breed } from "./breeds";
import type { CatalogBreed } from "./catalog";
import { breedImageSrc } from "./images";

export function toCatalogBreed(breed: Breed): CatalogBreed {
  return {
    slug: breed.slug,
    name: breed.name,
    shortName: breed.shortName,
    tagline: breed.tagline,
    size: breed.size,
    energy: breed.energy,
    imageSrc: breedImageSrc(breed.image, 640, 480),
    imageAlt: breed.image.alt,
    custom: false,
  };
}
