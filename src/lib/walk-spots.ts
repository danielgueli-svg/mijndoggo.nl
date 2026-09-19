import { fold } from "./text";

export type WalkSpotKind = "strand" | "bos" | "park" | "duin" | "uiterwaard";

export type WalkSpot = {
  id: string;
  name: string;
  kind: WalkSpotKind;
  city: string;
  aliases: string[];
  description: string;
};

export const ALWAYS_WALK_SPOTS: WalkSpot[] = [
  {
    id: "altijd-strandwandeling",
    name: "Strandwandeling",
    kind: "strand",
    city: "",
    aliases: ["kust", "zee", "zand", "strandwandeling"],
    description:
      "Altijd een optie, ook als je stad niet aan zee ligt: zand, wind en een natte hond. Check seizoensregels en aangelijnde zones.",
  },
  {
    id: "altijd-boswandeling",
    name: "Boswandeling",
    kind: "bos",
    city: "",
    aliases: ["bomen", "boswachter", "wandelbos", "boswandeling"],
    description:
      "Altijd een goed plan: schaduw, takken en snuffelpaadjes. In het broedseizoen vaak aangelijnd — check het bord bij de ingang.",
  },
];

export const CITY_WALK_SPOTS: WalkSpot[] = [
  {
    id: "amsterdam-vondelpark",
    name: "Vondelpark",
    kind: "park",
    city: "Amsterdam",
    aliases: ["amsterdam", "ams"],
    description: "Breed, groen en altijd iemand om te begroeten — houd ’m kort bij de paden op drukke uren.",
  },
  {
    id: "amsterdam-westerpark",
    name: "Westerpark",
    kind: "park",
    city: "Amsterdam",
    aliases: ["amsterdam", "ams"],
    description: "Gras, cultuur en een losloopveld — fijn als Vondel te druk voelt.",
  },
  {
    id: "amsterdam-bos",
    name: "Amsterdamse Bos",
    kind: "bos",
    city: "Amsterdam",
    aliases: ["amsterdam", "amstelveen"],
    description: "Echt bos aan de stadsrand: water, paden en ruimte om uit te razen.",
  },
  {
    id: "rotterdam-kralingen",
    name: "Kralingse Bos",
    kind: "bos",
    city: "Rotterdam",
    aliases: ["rotterdam", "kralingen"],
    description: "Bos, plas en renners. Fijn voor een lange lus aan de oostkant van de stad.",
  },
  {
    id: "rotterdam-zuiderpark",
    name: "Zuiderpark",
    kind: "park",
    city: "Rotterdam",
    aliases: ["rotterdam", "charlois"],
    description: "Groot stadspark met ruimte om te racen. Check waar loslopen mag.",
  },
  {
    id: "den-haag-scheveningen",
    name: "Scheveningen",
    kind: "strand",
    city: "Den Haag",
    aliases: ["den haag", "haag", "scheveningen", "'s-gravenhage", "s-gravenhage"],
    description: "Zout, wind en een boulevard. Buiten het hoogseizoen heerlijk uitwaaien.",
  },
  {
    id: "den-haag-bos",
    name: "Haagse Bos",
    kind: "bos",
    city: "Den Haag",
    aliases: ["den haag", "haag", "'s-gravenhage", "s-gravenhage"],
    description: "Stadsbos tussen station en paleis: kort, groen en goed bereikbaar.",
  },
  {
    id: "utrecht-maxima",
    name: "Máximapark",
    kind: "park",
    city: "Utrecht",
    aliases: ["utrecht", "leidsche rijn"],
    description: "Grote lijnen, water en ruimte — fijn als de binnenstad te krap voelt.",
  },
  {
    id: "utrecht-amelisweerd",
    name: "Amelisweerd",
    kind: "bos",
    city: "Utrecht",
    aliases: ["utrecht", "bunnik"],
    description: "Landgoedbossen en de Kromme Rijn. Klassieke zondagswandeling.",
  },
  {
    id: "haarlem-kennemer",
    name: "Zuid-Kennemerland",
    kind: "duin",
    city: "Haarlem",
    aliases: ["haarlem", "overveen", "bloemendaal"],
    description: "Duinen, bos en soms een ree. Trek stevige schoenen aan.",
  },
  {
    id: "groningen-noorder",
    name: "Noorderplantsoen",
    kind: "park",
    city: "Groningen",
    aliases: ["groningen"],
    description: "Stadspark met vijvers en korte rondjes — handig na school of werk.",
  },
  {
    id: "eindhoven-genneper",
    name: "Genneper Parken",
    kind: "park",
    city: "Eindhoven",
    aliases: ["eindhoven", "gestel"],
    description: "Water, weides en een Dommellus. Ruim genoeg voor een stevige session.",
  },
  {
    id: "nijmegen-ooij",
    name: "Ooijpolder",
    kind: "uiterwaard",
    city: "Nijmegen",
    aliases: ["nijmegen", "ooij"],
    description: "Uiterwaarden en horizon. Laarzen meenemen als de Waal hoog staat.",
  },
  {
    id: "maastricht-sint-pieter",
    name: "Sint-Pietersberg",
    kind: "bos",
    city: "Maastricht",
    aliases: ["maastricht"],
    description: "Heuvels, groeves en uitzicht. Een klimmetje dat de meeste honden prima vinden.",
  },
  {
    id: "arnhem-sonsbeek",
    name: "Sonsbeek",
    kind: "park",
    city: "Arnhem",
    aliases: ["arnhem"],
    description: "Heuvelachtig stadspark met water en slingerpaden.",
  },
  {
    id: "breda-mastbos",
    name: "Mastbos",
    kind: "bos",
    city: "Breda",
    aliases: ["breda"],
    description: "Oud dennenbos met rechte lanen. Klassiek Brabants uitwaaien.",
  },
  {
    id: "tilburg-wandelbos",
    name: "Wandelbos",
    kind: "bos",
    city: "Tilburg",
    aliases: ["tilburg"],
    description: "Dicht bij de stad, toch echt bomen. Fijn voor een doordeweekse ronde.",
  },
  {
    id: "almere-weerwater",
    name: "Weerwater",
    kind: "park",
    city: "Almere",
    aliases: ["almere"],
    description: "Water, wind en brede paden. Houd rekening met fietsers op de hoofdroutes.",
  },
  {
    id: "zwolle-engelse-werk",
    name: "Engelse Werk",
    kind: "park",
    city: "Zwolle",
    aliases: ["zwolle"],
    description: "Park aan de IJssel: gras, bomen en ruimte om te snuffelen.",
  },
  {
    id: "amersfoort-treek",
    name: "Den Treek",
    kind: "bos",
    city: "Amersfoort",
    aliases: ["amersfoort", "leusden"],
    description: "Utrechtse Heuvelrug-gevoel: zandpaden en dennen.",
  },
  {
    id: "leiden-hout",
    name: "Leidse Hout",
    kind: "park",
    city: "Leiden",
    aliases: ["leiden"],
    description: "Groen aan de rand van de stad, goed voor een rustige middagronde.",
  },
  {
    id: "delft-hout",
    name: "Delftse Hout",
    kind: "park",
    city: "Delft",
    aliases: ["delft"],
    description: "Plas, weides en een losloopveld — check de borden bij de ingang.",
  },
  {
    id: "leeuwarden-prinsen",
    name: "Prinsentuin",
    kind: "park",
    city: "Leeuwarden",
    aliases: ["leeuwarden"],
    description: "Stadspark met korte rondjes. Voor een langere tocht: op naar de wouden.",
  },
  {
    id: "enschede-volkspark",
    name: "Volkspark",
    kind: "park",
    city: "Enschede",
    aliases: ["enschede"],
    description: "Klassiek stadspark, fijn als opwarmertje voor een bos buiten de ring.",
  },
  {
    id: "apeldoorn-loo",
    name: "Paleispark Het Loo",
    kind: "bos",
    city: "Apeldoorn",
    aliases: ["apeldoorn", "het loo"],
    description: "Bos en lanen rond het paleis. Honden vaak aangelijnd — lees het bord.",
  },
];

export const walkKindLabels: Record<WalkSpotKind, string> = {
  strand: "Strand",
  bos: "Bos",
  park: "Park",
  duin: "Duin",
  uiterwaard: "Uiterwaard",
};

function spotMatchesQuery(spot: WalkSpot, query: string): boolean {
  const q = fold(query);
  if (!q) return false;
  const hay = [spot.city, spot.name, ...spot.aliases].map(fold).join(" ");
  return hay.includes(q);
}

/** Plekken bij de gezochte stad, plus altijd strand en bos. */
export function walkSpotsForCity(query: string): {
  nearby: WalkSpot[];
  always: WalkSpot[];
} {
  const nearby = query.trim()
    ? CITY_WALK_SPOTS.filter((spot) => spotMatchesQuery(spot, query))
    : [];
  return { nearby, always: ALWAYS_WALK_SPOTS };
}
