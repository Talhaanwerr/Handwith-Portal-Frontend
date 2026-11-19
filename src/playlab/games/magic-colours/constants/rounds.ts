/**
 * Magic Colours — a colouring book that colours itself, for three-year-olds.
 *
 * A vehicle in black lines rolls (or floats) in and its name is said ("Fire
 * engine! Tap each part."). The child taps a blank part; its colour POPS in
 * from the finger and the colour is named ("That one is red."). When the
 * last part is coloured the vehicle's name is said again and it comes alive
 * — it drives, flies, rises or sails away — and the next one rolls in.
 * Nothing can go wrong: every blank part takes a tap, a coloured one simply
 * ignores it.
 *
 * Six games share this folder, one THEME each (NgShell `single`, no module
 * picker — every theme is its own Library game):
 *   • road       — car, bus, taxi, school bus, ice cream van, scooter
 *   • sea        — sailboat, speedboat, fishing boat, submarine, ship, ferry
 *   • sky        — aeroplane, helicopter, biplane, hot-air balloon, airship
 *   • space      — rocket, space shuttle, satellite, moon buggy, flying saucer
 *   • emergency  — fire engine, police car, ambulance, rescue helicopter,
 *                  lifeboat, tow truck
 *   • build      — digger, dump truck, crane, cement mixer, bulldozer,
 *                  road roller
 */

import {
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";
import type { PaintColorId } from "@games/color-paint/constants/colors";
import {
  ART_H,
  ART_W,
  VEHICLES,
  type McColour,
  type VehicleId,
} from "@games/magic-colours/constants/vehicles";

export type ModuleId = "road" | "sea" | "sky" | "space" | "emergency" | "build";
export const MODULE_IDS: readonly ModuleId[] = [
  "road",
  "sea",
  "sky",
  "space",
  "emergency",
  "build",
];

/** Each theme as NgShell's one module: its card colours and its intro line
 *  (said on the title screen after "Welcome to Magic Colours!"). */
export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "road",
    name: "On the Road",
    tag: "Colour a car, a bus, a taxi, a school bus, an ice cream van and a scooter",
    accent: "#E8574F",
    edge: "#B83A34",
    clip: "mgc-mode-roads",
  },
  {
    id: "sea",
    name: "Sea",
    tag: "Colour a sailboat, a speedboat, a fishing boat, a submarine, a ship and a ferry",
    accent: "#2F8FCB",
    edge: "#1F6C9C",
    clip: "mgc-mode-sea",
  },
  {
    id: "sky",
    name: "Sky",
    tag: "Colour an aeroplane, a helicopter, a biplane, a hot-air balloon and an airship",
    accent: "#4AA8E0",
    edge: "#2C7FB4",
    clip: "mgc-mode-sky",
  },
  {
    id: "space",
    name: "Space",
    tag: "Colour a rocket, a space shuttle, a satellite, a moon buggy and a flying saucer",
    accent: "#6C5CE7",
    edge: "#4B3DB8",
    clip: "mgc-mode-space",
  },
  {
    id: "emergency",
    name: "Emergency",
    tag: "Colour a fire engine, a police car, an ambulance, a rescue helicopter, a lifeboat and a tow truck",
    accent: "#E23B3B",
    edge: "#A82424",
    clip: "mgc-mode-emergency",
  },
  {
    id: "build",
    name: "Construction",
    tag: "Colour a digger, a dump truck, a crane, a cement mixer, a bulldozer and a road roller",
    accent: "#F2A516",
    edge: "#B97A08",
    clip: "mgc-mode-build",
  },
];

/** One theme's card, typed as the only module of its own game. */
export function moduleOf<M extends ModuleId>(id: M): ModuleInfo<M> {
  const m = MODULES.find((x) => x.id === id);
  if (!m) throw new Error(`no module ${id}`);
  return { ...m, id };
}

export const VOICE: GameVoice = { welcome: "mgc-welcome", done: "mgc-done" };

/** One vehicle a round; a game's run is all of its theme's vehicles. */
export const ROUNDS: Readonly<Record<ModuleId, readonly VehicleId[]>> = {
  road: ["car", "bus", "taxi", "school-bus", "ice-cream-van", "scooter"],
  sea: ["boat", "speedboat", "fishing-boat", "submarine", "ship", "ferry"],
  sky: ["plane", "helicopter", "biplane", "balloon", "airship"],
  space: ["rocket", "shuttle", "satellite", "moon-buggy", "ufo"],
  emergency: [
    "fire-engine",
    "police-car",
    "ambulance",
    "rescue-helicopter",
    "lifeboat",
    "tow-truck",
  ],
  build: ["digger", "dump-truck", "crane", "cement-mixer", "bulldozer", "road-roller"],
};

/** Rounds a run of a theme's game (its store and NgShell `roundCount`). */
export const roundsOf = (m: ModuleId): number => ROUNDS[m].length;

/** "Fire engine!" — said as it rolls in and again before it drives off. */
export const nameClip = (v: VehicleId) => `mgc-name-${v}`;
/** "Tap each part!" — after the name as a vehicle rolls in. */
export const TAP_CLIP = "mgc-tap-each";

const PAINT: ReadonlySet<string> = new Set<PaintColorId>([
  "red",
  "yellow",
  "green",
  "blue",
  "orange",
  "pink",
  "purple",
]);
/** "That one is red." — Color & Shape Friends' recorded lines; white, black
 *  and grey have Magic Colours' own. */
export const colourClip = (c: McColour) => (PAINT.has(c) ? `friends-is-${c}` : `mgc-is-${c}`);

/** The narrowest a part may be, in drawing units (≈ px on a 568 × 320 phone). */
const MIN_PART = 46;

/** Self-check: four to six vehicles a theme, no vehicle in two themes, 4–6
 *  big parts each, every hand point inside its part's box and the box inside
 *  the drawing, a line for every vehicle's name and every colour. */
export function checkRounds(has: (id: string) => boolean): string[] {
  const { problems, need } = roundChecker();
  const all = MODULE_IDS.flatMap((id) => ROUNDS[id]);
  need(distinct(all), "a vehicle is in two themes");
  need(has(TAP_CLIP), `${TAP_CLIP} is missing`);
  for (const id of MODULE_IDS) {
    const rs = ROUNDS[id];
    need(rs.length >= 4 && rs.length <= 6, `${id}: ${rs.length} rounds`);
    for (const v of rs) {
      const veh = VEHICLES[v];
      need(has(nameClip(v)), `${v}: no name line`);
      need(veh.parts.length >= 4 && veh.parts.length <= 6, `${v}: ${veh.parts.length} parts`);
      need(distinct(veh.parts.map((p) => p.id)), `${v}: two parts share an id`);
      for (const p of veh.parts) {
        const [x0, y0, x1, y1] = p.shape.box;
        need(Math.min(x1 - x0, y1 - y0) >= MIN_PART, `${v}.${p.id}: too small to tap`);
        need(x0 >= 0 && y0 >= 0 && x1 <= ART_W && y1 <= ART_H, `${v}.${p.id}: off the page`);
        const [ax, ay] = p.at;
        need(ax > x0 && ax < x1 && ay > y0 && ay < y1, `${v}.${p.id}: hand point outside`);
        need(has(colourClip(p.colour)), `${v}.${p.id}: no line for ${p.colour}`);
      }
    }
  }
  for (const m of MODULES) need(has(m.clip), `${m.id}: no intro line`);
  need(has(VOICE.welcome) && has(VOICE.done), "welcome / done line missing");
  return problems;
}
