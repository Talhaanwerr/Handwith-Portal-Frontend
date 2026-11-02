import type { PaletteKey } from "@games/letter-treats/components/candy-world/CandyDefs";

/**
 * FEED THE FISH — tap the water and a food flake drops in and sinks; the
 * nearest hungry fish swims to it and nibbles it up. A fish that has had
 * enough bites is full: a heart, then it drifts down to its seaweed bed and
 * sleeps. Nothing is ever lost by being slow — a flake nobody wants just
 * settles on the sand and fades.
 *
 *   Feed Everyone      — 2, 3, 3 and 4 hungry fish; the round ends when
 *                        every fish is asleep.
 *   Feed the Colour Fish — one fish of a named colour is hungry, the others
 *                        are full and swim politely aside; its three bites
 *                        are counted aloud.
 *
 * Places are shares of the stage (x of its width, y of its height), so a
 * round looks the same on every screen.
 */

export type ModuleId = "everyone" | "colour";
export type FishHue = "red" | "yellow" | "orange" | "purple" | "pink" | "green";

export interface FishDef {
  hue: FishHue;
  /** Bites until full. */
  bites: 2 | 3;
  /** Where it swims when the round opens. */
  at: readonly [x: number, y: number];
  /** Which seaweed bed it sleeps by (an index into BEDS). */
  bed: number;
}

export interface FeedRoundDef {
  fish: readonly FishDef[];
  /** Feed the Colour Fish: the one hungry fish's colour. */
  target?: FishHue;
}

export interface ModuleInfo {
  id: ModuleId;
  rounds: readonly FeedRoundDef[];
}

/** Rounds per module. */
export const ROUNDS = 4;

/** Flakes in the water at once — more taps wait, so frantic tapping
 *  cannot pile up work. */
export const MAX_FLAKES = 4;

/** Where the seaweed beds stand along the sand (x shares). */
export const BEDS = [0.1, 0.32, 0.68, 0.9] as const;

/** The open water a waking fish keeps to (shares of the stage). */
export const WATER = { left: 0.1, right: 0.9, top: 0.3, bottom: 0.66 } as const;

/** Fish never start closer than this to each other (share of the width). */
const MIN_APART = 0.17;

export const MODULES: Record<ModuleId, ModuleInfo> = {
  everyone: {
    id: "everyone",
    rounds: [
      {
        fish: [
          { hue: "pink", bites: 2, at: [0.3, 0.42], bed: 1 },
          { hue: "yellow", bites: 2, at: [0.7, 0.54], bed: 2 },
        ],
      },
      {
        fish: [
          { hue: "orange", bites: 2, at: [0.22, 0.52], bed: 0 },
          { hue: "purple", bites: 3, at: [0.5, 0.36], bed: 1 },
          { hue: "green", bites: 2, at: [0.78, 0.54], bed: 3 },
        ],
      },
      {
        fish: [
          { hue: "red", bites: 3, at: [0.24, 0.38], bed: 0 },
          { hue: "yellow", bites: 2, at: [0.54, 0.56], bed: 2 },
          { hue: "pink", bites: 3, at: [0.8, 0.4], bed: 3 },
        ],
      },
      {
        fish: [
          { hue: "orange", bites: 2, at: [0.16, 0.44], bed: 0 },
          { hue: "green", bites: 3, at: [0.39, 0.6], bed: 1 },
          { hue: "purple", bites: 2, at: [0.61, 0.36], bed: 2 },
          { hue: "red", bites: 3, at: [0.84, 0.54], bed: 3 },
        ],
      },
    ],
  },
  colour: {
    id: "colour",
    rounds: [
      {
        target: "yellow",
        fish: [
          { hue: "pink", bites: 2, at: [0.2, 0.56], bed: 0 },
          { hue: "yellow", bites: 3, at: [0.5, 0.42], bed: 1 },
          { hue: "green", bites: 2, at: [0.8, 0.38], bed: 3 },
        ],
      },
      {
        target: "red",
        fish: [
          { hue: "red", bites: 3, at: [0.26, 0.4], bed: 1 },
          { hue: "purple", bites: 2, at: [0.54, 0.58], bed: 2 },
          { hue: "yellow", bites: 2, at: [0.8, 0.42], bed: 3 },
        ],
      },
      {
        target: "purple",
        fish: [
          { hue: "yellow", bites: 2, at: [0.22, 0.42], bed: 0 },
          { hue: "green", bites: 2, at: [0.48, 0.6], bed: 1 },
          { hue: "purple", bites: 3, at: [0.76, 0.46], bed: 2 },
        ],
      },
      {
        target: "orange",
        fish: [
          { hue: "orange", bites: 3, at: [0.3, 0.54], bed: 1 },
          { hue: "purple", bites: 2, at: [0.56, 0.36], bed: 2 },
          { hue: "green", bites: 2, at: [0.82, 0.52], bed: 3 },
        ],
      },
    ],
  },
};

/** Body and fin paint for each fish colour, from Letter Treats' palette. */
export const FISH_PAINT: Record<FishHue, readonly [body: PaletteKey, fin: PaletteKey]> = {
  red: ["red", "redDeep"],
  yellow: ["yellow", "orange"],
  orange: ["orange", "orangeDeep"],
  purple: ["purple", "lavenderDeep"],
  pink: ["pink", "pinkDeep"],
  green: ["green", "greenDeep"],
};

/** "Feed the yellow fish!" */
export const FEED_CLIP: Partial<Record<FishHue, string>> = {
  red: "ftf-feed-red",
  yellow: "ftf-feed-yellow",
  orange: "ftf-feed-orange",
  purple: "ftf-feed-purple",
};

export const WELCOME_CLIP = "ftf-welcome";
export const TAP_CLIP = "ftf-tap";
export const ASLEEP_CLIP = "ftf-asleep";
export const DONE_CLIP = "ftf-done";
/** Street Pals' recorded thanks, said by a fish as it is full. */
export const YUM_CLIPS = ["street-yum-ruby", "street-yum-bo"] as const;

const CONFUSABLE: readonly (readonly [FishHue, FishHue])[] = [
  ["red", "orange"],
  ["red", "pink"],
  ["orange", "yellow"],
  ["pink", "purple"],
];

/** The hungry fish of a round: every fish, or the one of the named colour. */
export function hungryIn(r: FeedRoundDef): number[] {
  return r.fish.flatMap((f, i) => (r.target === undefined || f.hue === r.target ? [i] : []));
}

/**
 * Every round can be finished and is fair: fish start in open water, apart
 * from each other, with a bed each; Feed Everyone grows from 2 to 4 fish;
 * Feed the Colour Fish has exactly one fish of its colour, needing three
 * bites to count, a recorded line to name it, and no look-alike colour
 * beside it.
 */
export function checkRounds(): string[] {
  const errs: string[] = [];
  for (const m of Object.values(MODULES)) {
    if (m.rounds.length !== ROUNDS) errs.push(`${m.id}: ${m.rounds.length} rounds, not ${ROUNDS}`);
    const targets = new Set<FishHue>();
    m.rounds.forEach((r, ri) => {
      const at = `${m.id} round ${ri + 1}`;
      if (r.fish.length < 2 || r.fish.length > BEDS.length)
        errs.push(`${at}: ${r.fish.length} fish`);
      if (new Set(r.fish.map((f) => f.hue)).size !== r.fish.length)
        errs.push(`${at}: a colour repeats`);
      if (new Set(r.fish.map((f) => f.bed)).size !== r.fish.length)
        errs.push(`${at}: two fish share a bed`);
      r.fish.forEach((f, i) => {
        const [x, y] = f.at;
        if (x < WATER.left || x > WATER.right || y < WATER.top || y > WATER.bottom)
          errs.push(`${at} fish ${i + 1}: starts outside the open water`);
        if (f.bed < 0 || f.bed >= BEDS.length) errs.push(`${at} fish ${i + 1}: no bed ${f.bed}`);
        r.fish.forEach((g, j) => {
          if (j > i && Math.hypot(g.at[0] - x, (g.at[1] - y) * 0.6) < MIN_APART)
            errs.push(`${at}: fish ${i + 1} and ${j + 1} start on top of each other`);
        });
      });
      const hungry = hungryIn(r);
      if (hungry.length === 0) errs.push(`${at}: nobody is hungry`);
      if (m.id === "everyone") {
        if (r.target !== undefined) errs.push(`${at}: a colour in Feed Everyone`);
        return;
      }
      if (r.target === undefined) {
        errs.push(`${at}: no colour named`);
        return;
      }
      if (hungry.length !== 1) errs.push(`${at}: ${hungry.length} fish are ${r.target}`);
      else if (r.fish[hungry[0]].bites !== 3)
        errs.push(`${at}: the ${r.target} fish does not count to 3`);
      if (!FEED_CLIP[r.target]) errs.push(`${at}: no recorded "feed the ${r.target} fish"`);
      if (targets.has(r.target)) errs.push(`${at}: ${r.target} was named before`);
      targets.add(r.target);
      const hues = r.fish.map((f) => f.hue);
      for (const [a, b] of CONFUSABLE)
        if (hues.includes(a) && hues.includes(b)) errs.push(`${at}: ${a} and ${b} side by side`);
    });
    if (m.id === "everyone") {
      const counts = m.rounds.map((r) => r.fish.length).join(",");
      if (counts !== "2,3,3,4") errs.push(`everyone: fish per round ${counts}, not 2,3,3,4`);
    }
  }
  return errs;
}
