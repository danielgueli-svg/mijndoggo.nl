import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const tipCategories = [
  "wassen",
  "wandelen",
  "plekken",
  "voeding",
  "verzorging",
  "overig",
] as const;

const galleryImage = z.object({
  unsplashId: z.string(),
  alt: z.string(),
  photographer: z.string(),
  unsplashUrl: z.string().url(),
  sfeer: z.boolean().default(false),
});

const tips = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/tips" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(tipCategories),
    heroImage: z.string(),
    heroImageAlt: z.string(),
    photographer: z.string(),
    unsplashUrl: z.string().url(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.string().default("MijnDoggo"),
    featured: z.boolean().default(false),
    minutes: z.number().int().positive().default(4),
  }),
});

const breeds = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./content/breeds" }),
  schema: z.object({
    name: z.string(),
    shortName: z.string(),
    tagline: z.string(),
    size: z.enum(["klein", "middel", "groot"]),
    energy: z.enum(["laag", "middel", "hoog"]),
    goodWithKids: z.boolean(),
    origin: z.string(),
    traits: z.array(z.string()).min(2).max(6),
    gallery: z.array(galleryImage).min(1).max(6),
  }),
});

export const collections = { tips, breeds };
export type TipCategory = (typeof tipCategories)[number];
