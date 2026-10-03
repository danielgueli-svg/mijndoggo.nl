import { fold } from "./text";

/** Nederlandse woonplaatsen — geen buitenlandse steden. */
export const NL_PLACES = [
  "Alkmaar",
  "Almere",
  "Alphen aan den Rijn",
  "Amersfoort",
  "Amstelveen",
  "Amsterdam",
  "Apeldoorn",
  "Arnhem",
  "Assen",
  "Bergen op Zoom",
  "Breda",
  "Capelle aan den IJssel",
  "Delft",
  "Den Haag",
  "Deventer",
  "Doetinchem",
  "Dordrecht",
  "Ede",
  "Eindhoven",
  "Emmen",
  "Enschede",
  "Gouda",
  "Groningen",
  "Haarlem",
  "Haarlemmermeer",
  "Heerlen",
  "Helmond",
  "Hengelo",
  "Hilversum",
  "Hoofddorp",
  "Hoorn",
  "Leeuwarden",
  "Leiden",
  "Leidschendam",
  "Lelystad",
  "Maastricht",
  "Middelburg",
  "Nieuwegein",
  "Nijmegen",
  "Oss",
  "Purmerend",
  "Roermond",
  "Roosendaal",
  "Rotterdam",
  "Schiedam",
  "Sittard",
  "Sneek",
  "Tilburg",
  "Utrecht",
  "Veenendaal",
  "Venlo",
  "Vlaardingen",
  "Zaandam",
  "Zaanstad",
  "Zeist",
  "Zoetermeer",
  "Zutphen",
  "Zwolle",
  "Ameland",
  "Bergen",
  "Bloemendaal",
  "Bunnik",
  "Deventer",
  "Katwijk",
  "Leusden",
  "Noordwijk",
  "Overveen",
  "Scheveningen",
  "Terschelling",
  "Texel",
  "Vlissingen",
  "Wageningen",
  "Zandvoort",
  "'s-Hertogenbosch",
] as const;

const ALIASES: Record<string, string> = {
  "den haag": "Den Haag",
  "s-gravenhage": "Den Haag",
  "'s-gravenhage": "Den Haag",
  "sgravenhage": "Den Haag",
  haag: "Den Haag",
  scheveningen: "Den Haag",
  "den bosch": "'s-Hertogenbosch",
  "s-hertogenbosch": "'s-Hertogenbosch",
  "'s-hertogenbosch": "'s-Hertogenbosch",
  shertogenbosch: "'s-Hertogenbosch",
  bosch: "'s-Hertogenbosch",
  zaanstad: "Zaandam",
};

const UNIQUE_PLACES = [...new Set(NL_PLACES)].sort((a, b) =>
  a.localeCompare(b, "nl"),
);

export function dutchPlaces(): string[] {
  return UNIQUE_PLACES;
}

export function findNlPlace(input: string): string | null {
  const q = fold(input);
  if (!q) return null;
  if (ALIASES[q]) return ALIASES[q];
  const exact = UNIQUE_PLACES.find((place) => fold(place) === q);
  if (exact) return exact;
  return null;
}

export function isNlPlace(input: string): boolean {
  return findNlPlace(input) !== null;
}

export function filterNlPlaces(query: string): string[] {
  const q = fold(query);
  if (!q) return UNIQUE_PLACES;
  return UNIQUE_PLACES.filter((place) => fold(place).includes(q));
}
