/**
 * On & Off — the scene data, the round order and the one geometry every
 * round is laid out from.
 *
 * The game teaches the positional words ON and OFF with one mechanic: a
 * black silhouette shows exactly where a thing belongs, the child drags the
 * thing there. Six scenes, each ONE piece of furniture (or a tree, or a rug)
 * and ONE thing, and every round plays a scene in one of two directions:
 *
 *   • "on"  — PUT IT ON. The thing waits in a big bubble at the side; its
 *     silhouette sits ON the surface. "Put the teddy ON the bed."
 *   • "off" — TAKE IT OFF. The thing starts sitting ON the surface; its
 *     silhouette waits OFF it, on the floor / grass beside it.
 *     "Take the teddy OFF the bed."
 *
 * One run mixes the two (`ROUNDS`): eight rounds, four each way, never the
 * same word three times running, so the child has to listen to the word —
 * and two scenes come back the other way round, so the contrast is seen on
 * the very same bed and tree.
 *
 * THE UNIT. Everything is placed in `u`, one stage-derived length, so a scene
 * scales as one picture:
 *     landscape  u = min(1cqh, 0.62cqw)      portrait  u = min(1cqw, 0.46cqh)
 * (mirrored in `unitPx` / `liftPx` below and in `.oo-root` in on-off.css —
 * keep them in step). Horizontal positions are measured from the stage's
 * CENTRE line and vertical ones UP from a BASELINE (negative numbers), so
 * the composition is always centred and always stands on the floor. The
 * baseline is the bottom edge, lifted by half of any height the stage has
 * beyond the design's (100u landscape, 217u portrait) — a 4:3 tablet or a
 * very tall phone gets the scene in the middle, not sunk to the bottom with
 * bare wall above it. Each scene also says where ITS floor line is, and the
 * world's floor is drawn to that line, so furniture always stands on it.
 *
 * `checkScenes()` proves the data fair: the round order keeps the mix rules,
 * and at the real screen sizes every ON spot lies on its surface's top,
 * every OFF spot off it, no target under the bubble, the teacher, the prompt
 * or the top chrome, and so on. The harness runs it; it must return [].
 */

import type { PictureId } from "@games/blend-read/components/PictureArt";

/** Which way a round goes: put the thing ON, or take it OFF. */
export type Dir = "on" | "off";
const DIRS: readonly Dir[] = ["on", "off"];
export type Orient = "land" | "port";

/** The existing worlds a scene can stand in (see OoArt's `Backdrop`). */
export type BackdropId = "room" | "playroom" | "dining" | "park";
export type SurfaceId = "bed" | "tree" | "box" | "table" | "chair" | "rug";

/** A box in u: left/top from the stage's centre line / bottom edge. */
export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A point in u (centre line / bottom edge). */
export interface Pt {
  x: number;
  y: number;
}

/**
 * The fixed geometry of each surface drawing, as fractions of its own art
 * box — where its flat top is and how wide it runs — so a scene only says
 * where the furniture stands and how tall it is, and every spot on it is
 * derived, never typed twice.
 */
interface SurfaceArt {
  /** width / height of the art box (the drawing's viewBox). */
  aspect: number;
  /** Where the thing sits on the top: x across, y down (fractions). */
  seat: Pt;
  /** The flat top runs from `span[0]` to `span[1]` across the art. */
  span: readonly [number, number];
  /** Top of the visible drawing (the art box has air above some). */
  visTop: number;
  /** Left and right of the visible drawing — the tree's crown spills past
   *  its viewBox on the left (drawn with overflow visible). */
  visX?: readonly [number, number];
}

const SURFACE_ART: Record<SurfaceId, SurfaceArt> = {
  // Twemoji bed (36 × 36): mattress top at y 23, from x 4 to 34; the
  // pillow sits at the left, so the thing goes right of centre.
  bed: { aspect: 1, seat: { x: 0.64, y: 0.64 }, span: [0.34, 0.92], visTop: 0.33 },
  // Street Pals' PerchTreeArt (360 × 500): the long branch reaches right,
  // its top edge near y 234 at x 290.
  tree: {
    aspect: 0.72,
    seat: { x: 0.8, y: 0.47 },
    span: [0.5, 0.95],
    visTop: 0,
    visX: [-0.16, 1],
  },
  // Twemoji box (36 × 36): the lid is a diamond centred at (18, 11).
  box: { aspect: 1, seat: { x: 0.5, y: 0.37 }, span: [0.2, 0.8], visTop: 0 },
  // Numbers 1 – 5's TableAndChair (400 × 200), cropped by on-off.css to
  // the table alone (x 116 – 400, y 76 – 194; its chair is left out), so the
  // table fills its box: top edge at y 80, legs to 193.
  table: { aspect: 284 / 118, seat: { x: 0.5, y: 0.034 }, span: [0.05, 0.98], visTop: 0 },
  // Twemoji chair (36 × 36): the seat centre near (17, 23).
  chair: { aspect: 1, seat: { x: 0.47, y: 0.64 }, span: [0.2, 0.8], visTop: 0 },
  // Rainbow Shapes' braided Rug (304 × 64), lying on the floor.
  rug: { aspect: 4.75, seat: { x: 0.5, y: 0.56 }, span: [0.18, 0.82], visTop: 0 },
};

/** Where a surface stands in one orientation: centre x, feet y, height, and
 *  the floor line of the world behind it (all u from the baseline). */
interface Stand {
  cx: number;
  feet: number;
  h: number;
  floor: number;
}

export interface Scene {
  id: string;
  surface: SurfaceId;
  /** The word the child hears for the surface. */
  surfaceName: string;
  thing: PictureId;
  thingName: string;
  backdrop: BackdropId;
  land: Stand;
  port: Stand;
  /** Where the thing goes when it is OFF: its seat on the floor (u). */
  offLand: Pt;
  offPort: Pt;
}

/** The six scenes (their play order is `ROUNDS`). */
export const SCENES: readonly Scene[] = [
  {
    id: "bed",
    surface: "bed",
    surfaceName: "bed",
    thing: "toys",
    thingName: "teddy",
    backdrop: "room",
    land: { cx: -4, feet: -7, h: 64, floor: -30 },
    port: { cx: 0, feet: -86, h: 92, floor: -104 },
    offLand: { x: 58, y: -9 },
    offPort: { x: 24, y: -30 },
  },
  {
    id: "tree",
    surface: "tree",
    surfaceName: "tree",
    thing: "bird",
    thingName: "bird",
    backdrop: "park",
    land: { cx: 8, feet: -6, h: 66, floor: -28 },
    port: { cx: 2, feet: -78, h: 92, floor: -96 },
    offLand: { x: 58, y: -9 },
    offPort: { x: 24, y: -30 },
  },
  {
    id: "box",
    surface: "box",
    surfaceName: "box",
    thing: "ball",
    thingName: "ball",
    backdrop: "playroom",
    land: { cx: 2, feet: -8, h: 52, floor: -30 },
    port: { cx: 0, feet: -92, h: 76, floor: -112 },
    offLand: { x: 58, y: -9 },
    offPort: { x: 24, y: -30 },
  },
  {
    id: "table",
    surface: "table",
    surfaceName: "table",
    thing: "cake",
    thingName: "cake",
    backdrop: "dining",
    land: { cx: -6, feet: -7, h: 35, floor: -30 },
    port: { cx: 0, feet: -100, h: 39, floor: -118 },
    offLand: { x: 58, y: -9 },
    offPort: { x: 24, y: -30 },
  },
  {
    id: "chair",
    surface: "chair",
    surfaceName: "chair",
    thing: "cat",
    thingName: "cat",
    backdrop: "room",
    land: { cx: 5, feet: -6, h: 62, floor: -30 },
    port: { cx: 0, feet: -84, h: 84, floor: -104 },
    offLand: { x: 58, y: -9 },
    offPort: { x: 24, y: -30 },
  },
  {
    id: "rug",
    surface: "rug",
    surfaceName: "rug",
    thing: "dog",
    thingName: "dog",
    backdrop: "playroom",
    land: { cx: -6, feet: -22, h: 18.5, floor: -46 },
    port: { cx: 0, feet: -108, h: 20.2, floor: -138 },
    offLand: { x: 58, y: -9 },
    offPort: { x: 24, y: -30 },
  },
];

export interface Round {
  scene: Scene;
  dir: Dir;
}

/**
 * The run, in play order: [scene id, direction]. Fixed, so every child
 * meets the same sequence — ON first (the easier one), then the words
 * mixed in pairs and singles, the worlds alternating so no two rounds in a
 * row look alike; the bed and the tree come back the other way round.
 */
const ORDER: readonly (readonly [string, Dir])[] = [
  ["bed", "on"],
  ["tree", "off"],
  ["box", "off"],
  ["table", "on"],
  ["chair", "off"],
  ["rug", "on"],
  ["tree", "on"],
  ["bed", "off"],
];

export const ROUNDS: readonly Round[] = ORDER.flatMap(([id, dir]) =>
  SCENES.filter((s) => s.id === id).map((scene) => ({ scene, dir }))
);

export const ROUND_COUNT = ROUNDS.length;

/** The fixed parts of the frame, per orientation (u). */
const FRAME = {
  land: {
    /** The thing's size on its target (a silhouette is the same size). */
    thing: 24,
    /** The bubble the thing waits in, and the thing magnified inside it. */
    bubble: { cx: 60, cy: -54, d: 38 },
    bubbleThing: 29,
  },
  port: {
    thing: 28,
    bubble: { cx: 24, cy: -52, d: 44 },
    bubbleThing: 33,
  },
} as const;

/** 1u in px for a stage of W × H — the mirror of `.oo-root { --u }`. */
function unitPx(W: number, H: number): number {
  return W >= H ? Math.min(H / 100, (0.62 * W) / 100) : Math.min(W / 100, (0.46 * H) / 100);
}

/** The design height in u, per orientation. */
const DESIGN_H = { land: 100, port: 217 } as const;

/** How far the baseline sits above the bottom edge, in px — half of the
 *  stage's height beyond the design's. Mirrors `--oo-lift` in on-off.css. */
function liftPx(W: number, H: number): number {
  const u = unitPx(W, H);
  return Math.max(0, (H - DESIGN_H[W >= H ? "land" : "port"] * u) * 0.5);
}

/** The world's floor depth below the baseline for a scene (u, positive). */
export function floorDepth(scene: Scene, o: Orient): number {
  return -(o === "land" ? scene.land : scene.port).floor;
}

/** The surface's art box. */
export function surfaceBox(scene: Scene, o: Orient): Box {
  const s = o === "land" ? scene.land : scene.port;
  const w = s.h * SURFACE_ART[scene.surface].aspect;
  return { x: s.cx - w / 2, y: s.feet - s.h, w, h: s.h };
}

/** The ON seat: a point on the surface's top, derived from its art. */
function onSeat(scene: Scene, o: Orient): Pt {
  const b = surfaceBox(scene, o);
  const art = SURFACE_ART[scene.surface];
  return { x: b.x + art.seat.x * b.w, y: b.y + art.seat.y * b.h };
}

function offSeat(scene: Scene, o: Orient): Pt {
  return o === "land" ? scene.offLand : scene.offPort;
}

/** The thing standing on a seat: bottom-centre on the point. Twemoji
 *  drawings have a little air under them, so the box sinks by 4%. */
function thingAt(seat: Pt, o: Orient): Box {
  const s = FRAME[o].thing;
  return { x: seat.x - s / 2, y: seat.y - s * 0.96, w: s, h: s };
}

export function bubbleBox(o: Orient): Box {
  const b = FRAME[o].bubble;
  return { x: b.cx - b.d / 2, y: b.cy - b.d / 2, w: b.d, h: b.d };
}

/** The thing magnified inside the bubble. */
function bubbleThingBox(o: Orient): Box {
  const b = FRAME[o].bubble;
  const s = FRAME[o].bubbleThing;
  return { x: b.cx - s / 2, y: b.cy - s / 2, w: s, h: s };
}

/** Where the thing starts and where its silhouette waits, per direction. */
export function homeBox(scene: Scene, d: Dir, o: Orient): Box {
  return d === "on" ? bubbleThingBox(o) : thingAt(onSeat(scene, o), o);
}
export function targetBox(scene: Scene, d: Dir, o: Orient): Box {
  return thingAt(d === "on" ? onSeat(scene, o) : offSeat(scene, o), o);
}

/** A drop counts inside the target grown to 1.3× its size. */
export const HIT_SCALE = 1.3;

/** The prompt, in three parts so the ON / OFF word can be shown big. */
export function promptFor(scene: Scene, d: Dir): { before: string; word: string; after: string } {
  return d === "on"
    ? { before: `Put the ${scene.thingName}`, word: "ON", after: `the ${scene.surfaceName}.` }
    : { before: `Take the ${scene.thingName}`, word: "OFF", after: `the ${scene.surfaceName}.` };
}

/** The narration for one round, named after its thing, surface and way:
 *  the prompt ("Put the teddy on the bed.") and the line once it is there
 *  ("The teddy is on the bed!"). Only the eight rounds in `ORDER` are
 *  recorded; any other pairing is not in the manifest and stays silent. */
export function roundClips(scene: Scene, d: Dir): { prompt: string; placed: string } {
  const pair = `${scene.thingName}-${scene.surface}`;
  return {
    prompt: `onoff-${d === "on" ? "put" : "take"}-${pair}`,
    placed: `onoff-is-${d}-${pair}`,
  };
}

/** The reaction to a drop that missed: "Oops! Put it on." / "…Take it off." */
export const WRONG_CLIP: Record<Dir, string> = { on: "onoff-wrong-on", off: "onoff-wrong-off" };

/** Stars for a finished run: no misses is three, a few is two, else one. */
export function starsFor(misses: number): number {
  if (misses === 0) return 3;
  if (misses <= 3) return 2;
  return 1;
}

/* ─── The self-check ──────────────────────────────────────────────────── */

/** The screens the layout must hold on (the harness plays them all). */
const CHECK_SIZES: readonly (readonly [number, number])[] = [
  [568, 320],
  [667, 375],
  [844, 390],
  [1024, 768],
  [1366, 768],
  [390, 844],
  [360, 740],
  [320, 568],
  [768, 1024],
];

/** Top chrome: the pills and the progress trail own the top 68 px — in
 *  portrait the trail drops below the pills, to 120 px. */
const chromePx = (W: number, H: number) => (W >= H ? 68 : 120);

/** Above the scene, at most this share of the stage may be bare wall. */
const MAX_BARE = 0.4;

interface Rect {
  l: number;
  t: number;
  r: number;
  b: number;
}

function toPx(box: Box, W: number, H: number): Rect {
  const u = unitPx(W, H);
  const l = W / 2 + box.x * u;
  const t = H - liftPx(W, H) + box.y * u;
  return { l, t, r: l + box.w * u, b: t + box.h * u };
}

function grow(r: Rect, k: number): Rect {
  const dx = ((r.r - r.l) * (k - 1)) / 2;
  const dy = ((r.b - r.t) * (k - 1)) / 2;
  return { l: r.l - dx, t: r.t - dy, r: r.r + dx, b: r.b + dy };
}

function meets(a: Rect, b: Rect): boolean {
  return a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
}

/** The teacher's corner and the prompt bubble beside / above him (px).
 *  Mirrors `.oo-teacher-slot` and `.oo-says` in on-off.css. */
function guideRects(W: number, H: number): Rect[] {
  const u = unitPx(W, H);
  const B = H - liftPx(W, H);
  if (W >= H) {
    const teacher = { l: 0, t: B - 54 * u, r: 26 * u, b: B };
    const says = { l: 0, t: B - 70 * u, r: 54 * u, b: B - 54 * u };
    return [teacher, says];
  }
  const teacher = { l: 0, t: B - 48 * u, r: 27 * u, b: B };
  const says = { l: 27 * u, t: B - 24 * u, r: W, b: B - 2 * u };
  return [teacher, says];
}

/** The longest run of one direction the order may hold. */
const MAX_RUN = 2;

/** Reports every break of the mix rules in the round order through `say`. */
function checkOrder(say: (msg: string) => void) {
  if (ROUNDS.length !== ORDER.length) say("the round order names a scene that does not exist");
  const ons = ROUNDS.filter((r) => r.dir === "on").length;
  if (Math.abs(ons - (ROUNDS.length - ons)) > 1)
    say(`the mix is lopsided: ${ons} ON, ${ROUNDS.length - ons} OFF`);
  if (ROUNDS[0]?.dir !== "on") say("the run should open with ON, the easier word");
  let run = 0;
  ROUNDS.forEach((r, i) => {
    const prev = ROUNDS[i - 1];
    run = prev && prev.dir === r.dir ? run + 1 : 1;
    if (run > MAX_RUN) say(`round ${i + 1}: ${r.dir.toUpperCase()} ${run} times in a row`);
    if (prev && prev.scene === r.scene) say(`round ${i + 1}: the same scene twice running`);
    if (prev && prev.scene.backdrop === r.scene.backdrop)
      say(`round ${i + 1}: same world as the round before`);
  });
  for (const scene of SCENES) {
    const dirs = ROUNDS.filter((r) => r.scene === scene).map((r) => r.dir);
    if (dirs.length === 0) say(`${scene.id}: never played`);
    if (new Set(dirs).size !== dirs.length)
      say(`${scene.id}: played the same way twice (a repeat must be the other way round)`);
  }
}

/** Every problem with the round order and with the scene data at every
 *  checked size, or []. */
export function checkScenes(): string[] {
  const problems: string[] = [];
  const say = (msg: string) => problems.push(msg);

  const things = new Set(SCENES.map((s) => s.thing));
  if (things.size !== SCENES.length) say("two scenes share a thing");
  const surfaces = new Set(SCENES.map((s) => s.surface));
  if (surfaces.size !== SCENES.length) say("two scenes share a surface");
  if (new Set(SCENES.map((s) => s.id)).size !== SCENES.length) say("duplicate scene id");
  checkOrder(say);

  for (const scene of SCENES) {
    const art = SURFACE_ART[scene.surface];
    if (art.seat.x < art.span[0] || art.seat.x > art.span[1])
      say(`${scene.id}: seat is off the flat top of its art`);

    for (const [W, H] of CHECK_SIZES) {
      const o: Orient = W >= H ? "land" : "port";
      const tag = `${scene.id} @${W}x${H}`;
      const CHROME_PX = chromePx(W, H);
      const inside = (r: Rect) => r.l >= 0 && r.r <= W && r.t >= CHROME_PX && r.b <= H;
      const guide = guideRects(W, H);

      const sb = surfaceBox(scene, o);
      const surf = toPx(sb, W, H);
      const [vx0, vx1] = art.visX ?? [0, 1];
      const vis: Rect = {
        l: surf.l + vx0 * (surf.r - surf.l),
        r: surf.l + vx1 * (surf.r - surf.l),
        t: surf.t + art.visTop * (surf.b - surf.t),
        b: surf.b,
      };
      if (vis.l < 0 || vis.r > W || vis.t < CHROME_PX || vis.b > H)
        say(`${tag}: the ${scene.surface} leaves the stage`);
      if (guide.some((g) => meets(g, vis))) say(`${tag}: the ${scene.surface} is under the guide`);
      if (meets(vis, toPx(bubbleBox(o), W, H)))
        say(`${tag}: the ${scene.surface} is under the bubble`);

      // ON: the seat is on the flat top of the surface
      const on = onSeat(scene, o);
      const topL = sb.x + art.span[0] * sb.w;
      const topR = sb.x + art.span[1] * sb.w;
      if (on.x < topL || on.x > topR) say(`${tag}: ON spot is not over the ${scene.surface}'s top`);
      if (on.y < sb.y + art.visTop * sb.h || on.y > sb.y + sb.h)
        say(`${tag}: ON spot is not at the ${scene.surface}'s height`);

      // OFF: the thing on its off spot is clear of the surface altogether
      const offT = toPx(targetBox(scene, "off", o), W, H);
      if (meets(offT, vis)) say(`${tag}: OFF spot touches the ${scene.surface}`);

      const onT = toPx(targetBox(scene, "on", o), W, H);
      for (const [name, r] of [
        ["ON target", onT],
        ["OFF target", offT],
      ] as const) {
        if (!inside(r)) say(`${tag}: ${name} leaves the stage or sits under the top chrome`);
        if (guide.some((g) => meets(g, r))) say(`${tag}: ${name} is under the teacher or prompt`);
      }
      // the hit boxes never reach the bubble, and never each other
      const bub = toPx(bubbleBox(o), W, H);
      if (meets(grow(onT, HIT_SCALE), bub)) say(`${tag}: ON hit box reaches the bubble`);
      if (meets(grow(onT, HIT_SCALE), grow(offT, HIT_SCALE)))
        say(`${tag}: ON and OFF hit boxes overlap (a tap could count)`);
      if (!inside(bub) || guide.some((g) => meets(g, bub)))
        say(`${tag}: the bubble is off the stage or under the guide`);

      // a target the child can hit: at least 44 px
      if (onT.r - onT.l < 44) say(`${tag}: thing smaller than 44px`);

      // the furniture stands ON the world's floor (a rug lies wholly on it),
      // and the OFF spot is on the floor too
      const st = o === "land" ? scene.land : scene.port;
      if (st.feet - st.floor < 4) say(`${tag}: the ${scene.surface} stands on the wall`);
      if (scene.surface === "rug" && sb.y < st.floor) say(`${tag}: the rug climbs the wall`);
      if (offSeat(scene, o).y < st.floor) say(`${tag}: OFF spot is on the wall`);

      // no big bare band above the scene, either way round (the thing sits
      // on the ON spot in both: as a silhouette, or as itself before OFF)
      for (const d of DIRS) {
        const tops = [vis.t, onT.t, toPx(targetBox(scene, d, o), W, H).t];
        if (d === "on") tops.push(bub.t);
        const bare = (Math.min(...tops) - CHROME_PX) / H;
        if (bare > MAX_BARE)
          say(`${tag}: ${Math.round(bare * 100)}% bare wall above the scene (${d})`);
      }
      const floorTop = H - liftPx(W, H) - floorDepth(scene, o) * unitPx(W, H);
      if (floorTop < CHROME_PX) say(`${tag}: the floor reaches the top chrome`);
    }
  }
  return problems;
}
