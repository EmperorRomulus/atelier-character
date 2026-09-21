import type { Character, Outfit, Presentation, StyleId } from "./types";

export const BODY_VIEWS = ["front", "side", "back"] as const;
export type BodyView = (typeof BODY_VIEWS)[number];

type ModelKey =
  | "woman-traveler"
  | "woman-scholar"
  | "woman-rogue"
  | "man-warrior"
  | "man-traveler"
  | "man-rogue"
  | "other-noble"
  | "other-scholar";

const KIT: Record<Presentation, Record<Outfit, ModelKey>> = {
  woman: {
    traveler: "woman-traveler",
    noble: "woman-scholar",
    rogue: "woman-rogue",
    warrior: "woman-rogue",
    scholar: "woman-scholar",
    casual: "woman-traveler",
    street: "woman-rogue",
    formal: "woman-scholar",
    academic: "woman-scholar",
    fantasy: "woman-traveler",
    scifi: "woman-rogue",
    athletic: "woman-rogue",
    vintage: "woman-scholar",
    lounge: "woman-traveler",
    uniform: "woman-scholar",
  },
  man: {
    traveler: "man-traveler",
    noble: "man-warrior",
    rogue: "man-rogue",
    warrior: "man-warrior",
    scholar: "man-traveler",
    casual: "man-traveler",
    street: "man-rogue",
    formal: "man-warrior",
    academic: "man-traveler",
    fantasy: "man-warrior",
    scifi: "man-rogue",
    athletic: "man-warrior",
    vintage: "man-traveler",
    lounge: "man-traveler",
    uniform: "man-warrior",
  },
  other: {
    traveler: "other-scholar",
    noble: "other-noble",
    rogue: "other-noble",
    warrior: "other-noble",
    scholar: "other-scholar",
    casual: "other-scholar",
    street: "other-noble",
    formal: "other-noble",
    academic: "other-scholar",
    fantasy: "other-noble",
    scifi: "other-noble",
    athletic: "other-noble",
    vintage: "other-scholar",
    lounge: "other-scholar",
    uniform: "other-noble",
  },
};

export function styleFolder(style: StyleId): "real" | "anime" | "paint" | "clay" {
  if (style === "anime") return "anime";
  if (style === "clay") return "clay";
  if (style === "oil") return "real";
  return "paint";
}

export function kitKey(character: Character): ModelKey {
  return KIT[character.presentation][character.outfit.archetype];
}

export function modelSrc(character: Character, view: BodyView = viewOf(character)): string {
  const key = kitKey(character);
  const folder = styleFolder(character.style);
  if (folder === "real") return `/models/${key}-${view}.jpg`;
  if (view === "front") return `/models/${folder}/${key}-front.jpg`;
  return `/models/${key}-${view}.jpg`;
}

export function viewOf(character: Character): BodyView {
  const pose = character.scene.pose;
  if (pose === "side" || pose === "back") return pose;
  return "front";
}

export function schematicThumbs(character: Character): { view: BodyView; src: string }[] {
  return BODY_VIEWS.map((view) => ({ view, src: modelSrc(character, view) }));
}
