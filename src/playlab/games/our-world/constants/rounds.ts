/**
 * OUR WORLD — six lessons about the world around us, each its own game
 * (`our-world-animals` … `-body`; this folder is their kit). Every lesson is
 * two PLACES and eight things, four that belong in each. The child sorts,
 * picks and spots the odd one out, so each thing is met several times:
 *
 *   1 SORT   two places and four things: drag each to where it belongs
 *   2 PICK   one place and three things: tap the one that belongs there
 *   3 ODD    four things, one from the other place: tap the one that does
 *            not belong
 *   4–6      the same three pages again with the lesson's other things
 *
 * Every page is derived from the lesson's two lists (never stored twice);
 * `checkRounds()` proves each thing has a picture and a recorded name, that
 * every page has exactly one way to be right, and that all eight things are
 * sorted once.
 */

import { fluentSrc } from "@shared/constants/fluent3d";
import { wordClip } from "@shared/audio/wordClips";
import { distinct, type GameVoice, type ModuleInfo } from "@games/number-groups/constants/kit";

export type ModuleId = "animals" | "sea" | "road" | "food" | "play" | "body";
export const MODULE_IDS: readonly ModuleId[] = ["animals", "sea", "road", "food", "play", "body"];

export const VOICE: GameVoice = { welcome: "owd-welcome", done: "owd-done" };

export type Four = readonly [string, string, string, string];

/** One of a lesson's two places. */
export interface Place {
  /** Its clip id's tail (`owd-place-<key>`) — the clip says its name. */
  key: string;
  /** The picture on its sign (never one of the lesson's eight things). */
  sign: string;
  /** Its colour and darker edge. */
  accent: string;
  edge: string;
  things: Four;
}

export interface Lesson {
  title: string;
  tag: string;
  accent: string;
  edge: string;
  places: readonly [Place, Place];
}

const GREEN = { accent: "#4CAF6A", edge: "#2E7D46" };
const AMBER = { accent: "#F0A223", edge: "#BE7A0C" };
const BLUE = { accent: "#3A8EDB", edge: "#1F5C9C" };
const VIOLET = { accent: "#8A63D2", edge: "#5E3BA6" };
const RED = { accent: "#E8554E", edge: "#B43A34" };
const TEAL = { accent: "#2FA3A0", edge: "#1C7573" };

export const LESSONS: Record<ModuleId, Lesson> = {
  animals: {
    title: "Our World: Animals",
    tag: "Farm animals and jungle animals",
    ...GREEN,
    places: [
      { key: "farm", sign: "house", ...AMBER, things: ["cow", "hen", "goat", "duck"] },
      { key: "jungle", sign: "tree", ...GREEN, things: ["lion", "monkey", "tiger", "elephant"] },
    ],
  },
  sea: {
    title: "Our World: Sea and Sky",
    tag: "What lives in the sea, what is in the sky",
    ...BLUE,
    places: [
      { key: "sea", sign: "ocean", ...BLUE, things: ["fish", "whale", "crab", "octopus"] },
      { key: "sky", sign: "sun", ...VIOLET, things: ["moon", "star", "cloud", "kite"] },
    ],
  },
  road: {
    title: "Our World: Road and Home",
    tag: "Things on the road, things in the house",
    ...RED,
    places: [
      { key: "road", sign: "engine", ...RED, things: ["car", "bus", "van", "bike"] },
      { key: "home", sign: "house", ...TEAL, things: ["bed", "chair", "lamp", "clock"] },
    ],
  },
  food: {
    title: "Our World: Food",
    tag: "Things we eat, things we do not eat",
    ...AMBER,
    places: [
      { key: "eat", sign: "bowl", ...AMBER, things: ["apple", "banana", "cheese", "pizza"] },
      { key: "no-eat", sign: "box", ...BLUE, things: ["shoe", "key", "pen", "cup"] },
    ],
  },
  play: {
    title: "Our World: Clothes and Toys",
    tag: "Things we wear, things we play with",
    ...VIOLET,
    places: [
      { key: "wear", sign: "vest", ...VIOLET, things: ["hat", "jacket", "tie", "cap"] },
      { key: "toys", sign: "toys", ...RED, things: ["ball", "doll", "drum", "robot"] },
    ],
  },
  body: {
    title: "Our World: Me and My Kitchen",
    tag: "Parts of my body, things in the kitchen",
    ...TEAL,
    places: [
      { key: "body", sign: "kid", ...TEAL, things: ["eye", "nose", "hand", "toes"] },
      { key: "kitchen", sign: "pot", ...AMBER, things: ["spoon", "pan", "mug", "kettle"] },
    ],
  },
};

export const MODULES: readonly ModuleInfo<ModuleId>[] = MODULE_IDS.map((id) => ({
  id,
  name: LESSONS[id].title.replace("Our World: ", ""),
  tag: LESSONS[id].tag,
  accent: LESSONS[id].accent,
  edge: LESSONS[id].edge,
  clip: `owd-mode-${id}`,
}));

export type Step = "sort" | "pick" | "odd";
const STEPS: readonly Step[] = ["sort", "pick", "odd"];
/** Pages a lesson: sort, pick, odd — twice. */
export const ROUNDS = 6;

/** The page a round plays, and which half of the lesson (0 or 1) it uses. */
export const pageOf = (round: number): { step: Step; half: number } => ({
  step: STEPS[round % 3],
  half: Math.floor(round / 3) % 2,
});

/* The game's own lines (see NEW-CLIPS.json). */
/** "Put each one where it belongs!" */
export const SORT = "owd-sort";
/** "Which one belongs here?" */
export const PICK = "owd-pick";
/** "Which one does not belong?" */
export const ODD = "owd-odd";
export const TRY = "instr-try-again";

/** The clip that says a place's name. */
export const placeClip = (p: Place): string => `owd-place-${p.key}`;
/** A thing's picture and the recorded clip that names it. */
export const picOf = (thing: string): string => fluentSrc(thing) ?? "";
export const sayOf = (thing: string): string => wordClip(thing) ?? "";

/** A thing on a page, and the place (0 or 1) it belongs in. */
export interface Item {
  thing: string;
  place: number;
}

/** SORT: two things of each place, never in place order. */
export function sortItems(l: Lesson, half: number): Item[] {
  const [a, b] = l.places;
  const k = half * 2;
  const items: Item[] = [
    { thing: a.things[k], place: 0 },
    { thing: b.things[k], place: 1 },
    { thing: b.things[k + 1], place: 1 },
    { thing: a.things[k + 1], place: 0 },
  ];
  return half === 0 ? items : [items[1], items[0], items[3], items[2]];
}

/** PICK: the place asked about, and three things — one of them its own. */
export function pickItems(l: Lesson, half: number): { place: number; items: Item[] } {
  const place = half;
  const own = l.places[place].things[3 - half * 3];
  const other = l.places[1 - place].things;
  const wrong: Item[] = [
    { thing: other[half], place: 1 - place },
    { thing: other[half + 2], place: 1 - place },
  ];
  const items = [...wrong];
  items.splice(half === 0 ? 1 : 0, 0, { thing: own, place });
  return { place, items };
}

/** ODD: three things of one place and one of the other. */
export function oddItems(l: Lesson, half: number): { odd: number; items: Item[] } {
  const home = half;
  const three = l.places[home].things.filter((_, i) => i !== (half === 0 ? 3 : 0));
  const stranger = l.places[1 - home].things[half === 0 ? 3 : 0];
  const items: Item[] = three.map((thing) => ({ thing, place: home }));
  const odd = half === 0 ? 2 : 0;
  items.splice(odd, 0, { thing: stranger, place: 1 - home });
  return { odd, items };
}

/** Self-check: every lesson is playable and fair on every page. */
export function checkRounds(has: (clip: string) => boolean = () => true): string[] {
  const problems: string[] = [];
  const need = (ok: boolean, msg: string) => {
    if (!ok) problems.push(msg);
  };
  for (const m of MODULE_IDS) {
    const l = LESSONS[m];
    const all = l.places.flatMap((p) => [...p.things]);
    need(distinct(all), `${m}: a thing is in both places`);
    for (const p of l.places) {
      need(!!fluentSrc(p.sign), `${m}: no picture for the ${p.key} sign`);
      need(!all.includes(p.sign), `${m}: the ${p.key} sign is one of the things`);
      need(has(placeClip(p)), `${m}: no clip for ${p.key}`);
    }
    for (const t of all) {
      need(!!fluentSrc(t), `${m}: ${t} has no picture`);
      need(!!wordClip(t), `${m}: ${t} has no recording`);
    }
    const sorted = [0, 1].flatMap((h) => sortItems(l, h));
    need(distinct(sorted.map((i) => i.thing)) && sorted.length === 8, `${m}: not all eight sorted`);
    for (const h of [0, 1]) {
      const s = sortItems(l, h);
      need(s.filter((i) => i.place === 0).length === 2, `${m} sort ${h}: not two a place`);
      need(s[0].place !== s[1].place || s[2].place !== s[3].place, `${m} sort ${h}: in order`);
      need(
        s.every((i) => l.places[i.place].things.includes(i.thing)),
        `${m} sort ${h}: a thing in the wrong place`
      );
      const p = pickItems(l, h);
      need(
        p.items.filter((i) => i.place === p.place).length === 1,
        `${m} pick ${h}: not one right`
      );
      need(distinct(p.items.map((i) => i.thing)), `${m} pick ${h}: a thing twice`);
      const o = oddItems(l, h);
      need(o.items.length === 4 && distinct(o.items.map((i) => i.thing)), `${m} odd ${h}: bad set`);
      need(
        o.items.filter((i) => i.place === o.items[o.odd].place).length === 1,
        `${m} odd ${h}: not one odd`
      );
    }
    need(
      pickItems(l, 0).items.findIndex((i) => i.place === 0) !==
        pickItems(l, 1).items.findIndex((i) => i.place === 1),
      `${m}: PICK's answer is always in one place`
    );
    need(oddItems(l, 0).odd !== oddItems(l, 1).odd, `${m}: ODD's answer is always in one place`);
  }
  return problems;
}
