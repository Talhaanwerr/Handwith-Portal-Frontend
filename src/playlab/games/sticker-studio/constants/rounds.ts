/**
 * STICKER STUDIO — six picture-making lessons, each its own game
 * (`sticker-studio-garden` … `-party`; this folder is their kit). A lesson is
 * a scene and six stickers. There is no wrong picture:
 *
 *   1–4 ADD   "Put the flower in your picture!" — drag that sticker anywhere
 *             on the scene (four stickers, one a page; the picture grows)
 *   5   FREE  "Now make your own picture!" — every sticker can be used again
 *             and again; tap Done when the picture is finished
 *
 * The picture is kept between pages (and cleared when a lesson starts again).
 * `checkRounds()` proves every sticker has a picture and a recorded name.
 */

import { fluentSrc } from "@shared/constants/fluent3d";
import { wordClip } from "@shared/audio/wordClips";
import { distinct, type GameVoice, type ModuleInfo } from "@games/number-groups/constants/kit";

export type ModuleId = "garden" | "space" | "farm" | "park" | "street" | "party";
export const MODULE_IDS: readonly ModuleId[] = [
  "garden",
  "space",
  "farm",
  "park",
  "street",
  "party",
];

export const VOICE: GameVoice = { welcome: "stk-welcome", done: "stk-done" };

export type Six = readonly [string, string, string, string, string, string];

export interface Lesson {
  title: string;
  tag: string;
  accent: string;
  edge: string;
  /** The first four are asked for, in this order; all six are free at the end. */
  stickers: Six;
}

export const LESSONS: Record<ModuleId, Lesson> = {
  garden: {
    title: "Sticker Studio: Garden",
    tag: "Make a garden picture",
    accent: "#4CAF6A",
    edge: "#2E7D46",
    stickers: ["flower", "butterfly", "sun", "tree", "ant", "kite"],
  },
  space: {
    title: "Sticker Studio: Space",
    tag: "Make a space picture",
    accent: "#6C63D9",
    edge: "#4A42A8",
    stickers: ["rocket", "moon", "star", "astronaut", "robot", "globe"],
  },
  farm: {
    title: "Sticker Studio: Farm",
    tag: "Make a farm picture",
    accent: "#E8554E",
    edge: "#B43A34",
    stickers: ["cow", "hen", "duck", "goat", "dog", "house"],
  },
  park: {
    title: "Sticker Studio: Park",
    tag: "Make a park picture",
    accent: "#2FA3A0",
    edge: "#1C7573",
    stickers: ["ball", "kite", "dog", "bike", "tree", "flower"],
  },
  street: {
    title: "Sticker Studio: Street",
    tag: "Make a street picture",
    accent: "#3A8EDB",
    edge: "#1F5C9C",
    stickers: ["car", "bus", "van", "house", "bike", "train"],
  },
  party: {
    title: "Sticker Studio: Party",
    tag: "Make a party picture",
    accent: "#E06AA8",
    edge: "#B0437E",
    stickers: ["cake", "drum", "guitar", "crown", "hat", "gem"],
  },
};

export const MODULES: readonly ModuleInfo<ModuleId>[] = MODULE_IDS.map((id) => ({
  id,
  name: LESSONS[id].title.replace("Sticker Studio: ", ""),
  tag: LESSONS[id].tag,
  accent: LESSONS[id].accent,
  edge: LESSONS[id].edge,
  clip: `stk-mode-${id}`,
}));

/** How many stickers are asked for, one a page, before the free page. */
export const ASKED = 4;
/** Pages a lesson: the asked stickers, then the free page. */
export const ROUNDS = ASKED + 1;
/** The most stickers a picture can hold (the tray stops giving them out). */
export const MAX_STICKERS = 16;

/* The game's own lines (see NEW-CLIPS.json). */
/** "Put the" — the sticker's name and `IN` follow. */
export const PUT = "stk-put";
/** "in your picture!" */
export const IN = "stk-in";
/** "Now make your own picture! Tap Done when you finish." */
export const FREE = "stk-free";
export const TRY = "instr-try-again";

export const picOf = (sticker: string): string => fluentSrc(sticker) ?? "";
export const sayOf = (sticker: string): string => wordClip(sticker) ?? "";

/** A sticker on the picture: which one and where (fractions of the scene). */
export interface Placed {
  sticker: string;
  x: number;
  y: number;
}

/**
 * The picture being made, kept between a lesson's pages (a page is remounted
 * for every round). Cleared when round 0 starts.
 */
const PICTURES = new Map<ModuleId, Placed[]>();
export function pictureOf(id: ModuleId, round: number): Placed[] {
  if (round === 0) PICTURES.set(id, []);
  return PICTURES.get(id) ?? [];
}
export function savePicture(id: ModuleId, picture: Placed[]): void {
  PICTURES.set(id, picture);
}

/** Self-check: every sticker is pictured and named, none twice in a lesson. */
export function checkRounds(): string[] {
  const problems: string[] = [];
  const need = (ok: boolean, msg: string) => {
    if (!ok) problems.push(msg);
  };
  for (const m of MODULE_IDS) {
    const l = LESSONS[m];
    need(distinct(l.stickers), `${m}: a sticker twice`);
    for (const s of l.stickers) {
      need(!!fluentSrc(s), `${m}: ${s} has no picture`);
      need(!!wordClip(s), `${m}: ${s} has no recording`);
    }
  }
  need(ROUNDS === ASKED + 1 && ASKED <= 6, "the pages do not add up");
  return problems;
}
