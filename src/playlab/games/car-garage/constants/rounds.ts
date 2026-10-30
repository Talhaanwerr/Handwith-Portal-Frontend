/**
 * Build-a-Car Garage — every round, as data, and the check that proves it fair.
 *
 * Two modules of four rounds on the garage yard, each ONE mechanic:
 *
 *   • "build"   — BUILD THE CAR. A ghost of the car stands on the lift; its
 *     parts wait in the tray. Put them on in a FIXED order the child can see
 *     on the step strip — body → four wheels (counted aloud) → roof →
 *     windows. Only the step being built can be picked up; the rest wait,
 *     dimmed. The finished car wakes up, honks and drives away.
 *   • "missing" — MISSING PART. A finished car has lost one part (its place
 *     is outlined). Three things lie in the tray: the part, and two things
 *     that could never go on a car. Drag the right one in.
 *
 * Answers are DERIVED from the data (the step's parts, the missing spot's
 * kind) — never stored twice — and `checkRounds()` proves every round can be
 * finished and is fair. The module plumbing is Count & Match's, imported from
 * `@games/number-groups/constants/kit`.
 */

import type { PictureId } from "@games/blend-read/components/PictureArt";
import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";
import { unit } from "@shared/utils/hash";
import {
  ALL_SPOTS,
  CAR_BODIES,
  CAR_COLOURS,
  CAR_H,
  CAR_W,
  WHEEL_SPOTS,
  kindOf,
  spotBox,
  type CarBody,
  type CarColourId,
  type CarSpot,
  type PartKind,
  type WheelSpot,
} from "@games/car-garage/components/CarArt";

export type ModuleId = "build" | "missing";
export const MODULE_IDS: readonly ModuleId[] = ["build", "missing"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "build",
    name: "Build the Car",
    tag: "One part at a time",
    accent: "#2E7FD6",
    edge: "#1F5FA6",
    clip: "bcg-mode-build",
  },
  {
    id: "missing",
    name: "Missing Part",
    tag: "Find the part that fits",
    accent: "#F08A24",
    edge: "#C06A12",
    clip: "bcg-mode-missing",
  },
];

export const VOICE: GameVoice = { welcome: "bcg-welcome", done: "bcg-done" };

/** "car", "van", "bus" — the recorded names (there is no "truck"). */
export const NAME_CLIP: Partial<Record<CarBody, string>> = {
  car: "name-car",
  van: "name-van",
  bus: "name-bus",
};

/* ── Build the Car ────────────────────────────────────────────────────── */

/** The building order, as the step strip shows it. */
export type StepKind = "body" | "wheel" | "roof" | "windows";

export interface Step {
  kind: StepKind;
  /** Said (and shown in the teacher's bubble) when the step starts. */
  clip: string;
}

export const STEPS: readonly Step[] = [
  { kind: "body", clip: "bcg-step-body" },
  { kind: "wheel", clip: "bcg-step-wheels" },
  { kind: "roof", clip: "bcg-step-roof" },
  { kind: "windows", clip: "bcg-step-windows" },
];

/** The loose parts in the tray: one body, four wheels, a roof, the windows. */
export type PieceId = "body" | "wheel-a" | "wheel-b" | "wheel-c" | "wheel-d" | "roof" | "windows";
export const PIECES: readonly PieceId[] = [
  "body",
  "wheel-a",
  "wheel-b",
  "wheel-c",
  "wheel-d",
  "roof",
  "windows",
];
export const pieceKind = (p: PieceId): StepKind =>
  p.startsWith("wheel") ? "wheel" : (p as StepKind);

/**
 * Where the wheels can be dropped: on an AXLE. Each axle takes two wheels,
 * the far one first — so a new wheel never vanishes behind one already on.
 */
export type AxleId = "axle-back" | "axle-front";
export const AXLES: Record<AxleId, readonly [WheelSpot, WheelSpot]> = {
  "axle-back": ["wheel-2", "wheel-0"],
  "axle-front": ["wheel-3", "wheel-1"],
};
export const AXLE_IDS: readonly AxleId[] = ["axle-back", "axle-front"];

/** A drop target in Build the Car: a part's own place, or an axle. */
export type BuildTarget = "body" | "roof" | "windows" | AxleId;

/** The places a step fills. */
export function stepSpots(kind: StepKind): CarSpot[] {
  return kind === "wheel" ? [...WHEEL_SPOTS] : [kind];
}

/** The targets a step offers. */
export function stepTargets(kind: StepKind): BuildTarget[] {
  return kind === "wheel" ? [...AXLE_IDS] : [kind];
}

/** The first empty place a target fills, or null when it is full. */
export function seatFor(target: BuildTarget, filled: ReadonlySet<CarSpot>): CarSpot | null {
  if (target === "axle-back" || target === "axle-front")
    return AXLES[target].find((s) => !filled.has(s)) ?? null;
  return filled.has(target) ? null : target;
}

/** The step being built, given what is on: the first one not finished. */
export function currentStep(filled: ReadonlySet<CarSpot>): number {
  const i = STEPS.findIndex((s) => stepSpots(s.kind).some((spot) => !filled.has(spot)));
  return i < 0 ? STEPS.length : i;
}

export interface BuildRound {
  body: CarBody;
  colour: CarColourId;
}

export const BUILD_ROUNDS: readonly BuildRound[] = [
  { body: "car", colour: "red" },
  { body: "van", colour: "blue" },
  { body: "truck", colour: "orange" },
  { body: "bus", colour: "green" },
];

/* ── Missing Part ─────────────────────────────────────────────────────── */

/** Things that could never go on a car: three drawn here, the rest Twemoji. */
export type OddThing =
  | "square-wheel"
  | "chimney"
  | "sail"
  | Extract<PictureId, "hat" | "shoe" | "crown" | "flag" | "bone">;

export interface MissingRound {
  body: CarBody;
  colour: CarColourId;
  /** The place that is empty. A missing roof takes its windows with it. */
  missing: CarSpot;
  /** The two wrong things in the tray. */
  odd: readonly [OddThing, OddThing];
}

export const MISSING_ROUNDS: readonly MissingRound[] = [
  { body: "car", colour: "purple", missing: "wheel-1", odd: ["square-wheel", "chimney"] },
  { body: "van", colour: "yellow", missing: "roof", odd: ["sail", "hat"] },
  { body: "truck", colour: "pink", missing: "windows", odd: ["crown", "shoe"] },
  { body: "bus", colour: "blue", missing: "lights", odd: ["flag", "bone"] },
];

/** The ask said when each kind of part is missing. */
export const MISSING_ASK = "bcg-ask-missing";

/** A choice in the tray: the right part, or one of the odd things. */
export type Choice = { right: true; kind: PartKind } | { right: false; odd: OddThing };

/** The parts on a car missing one: everything but the gap (and, for a
 *  missing roof, its windows). */
export function missingOn(r: MissingRound): CarSpot[] {
  return ALL_SPOTS.filter((s) => s !== r.missing && !(r.missing === "roof" && s === "windows"));
}

/** The three choices, in a fixed shuffle that never puts the part first
 *  twice in a row. */
export function missingChoices(round: number): Choice[] {
  const r = MISSING_ROUNDS[round];
  const all: Choice[] = [
    { right: true, kind: kindOf(r.missing) },
    { right: false, odd: r.odd[0] },
    { right: false, odd: r.odd[1] },
  ];
  // where the right part stands: 1, 2, 0, 2 … from the round's own hash
  const at = Math.floor(unit(round * 17 + 5) * 3);
  const [right, ...wrong] = all;
  const out = [...wrong];
  out.splice(at, 0, right);
  return out;
}

/** The right choice's place in the tray. */
export const rightIndex = (round: number) => missingChoices(round).findIndex((c) => c.right);

/* ── The self-check ───────────────────────────────────────────────────── */

/** Every problem with the round data, or an empty list. Run by the harness. */
export function checkRounds(): string[] {
  const { problems, need, noRepeats } = roundChecker();
  const colours = new Set(CAR_COLOURS.map((c) => c.id));

  need(BUILD_ROUNDS.length === ROUND_COUNT, `build: ${BUILD_ROUNDS.length} rounds`);
  need(MISSING_ROUNDS.length === ROUND_COUNT, `missing: ${MISSING_ROUNDS.length} rounds`);
  need(distinct(MODULES.map((m) => m.id)), "modules: an id twice");

  // every part's place lies on the drawing, and every spot is filled by one step
  for (const body of CAR_BODIES)
    for (const s of ALL_SPOTS) {
      const b = spotBox(body, s);
      need(
        b.x >= 0 && b.y >= 0 && b.x + b.w <= CAR_W + 0.5 && b.y + b.h <= CAR_H + 0.5,
        `${body}: the ${s} place runs off the drawing`
      );
    }
  const built = STEPS.flatMap((s) => stepSpots(s.kind));
  need(distinct(built), "build: a place is filled by two steps");
  need(
    WHEEL_SPOTS.every((w) => built.includes(w)) && built.length === 7,
    "build: the steps do not build the whole car"
  );
  need(
    STEPS.map((s) => s.kind).join() === "body,wheel,roof,windows",
    "build: the order is not body, wheels, roof, windows"
  );
  // the four wheels: four wheel pieces, and the axles hold exactly four places
  need(PIECES.filter((p) => pieceKind(p) === "wheel").length === 4, "build: not four wheels");
  const axleSeats = AXLE_IDS.flatMap((a) => AXLES[a]);
  need(distinct(axleSeats) && axleSeats.length === 4, "build: the axles do not hold four wheels");
  // every step can be finished from the tray, in order
  const filled = new Set<CarSpot>();
  STEPS.forEach((step, i) => {
    need(currentStep(filled) === i, `build: step ${i} is not next when it should be`);
    const pieces = PIECES.filter((p) => pieceKind(p) === step.kind);
    pieces.forEach(() => {
      const t = stepTargets(step.kind).find((x) => seatFor(x, filled) !== null);
      const seat = t ? seatFor(t, filled) : null;
      need(seat !== null, `build: step ${step.kind} runs out of places`);
      if (seat) filled.add(seat);
    });
  });
  need(currentStep(filled) === STEPS.length, "build: the car is not finished at the end");

  BUILD_ROUNDS.forEach((r, i) => need(colours.has(r.colour), `build ${i}: unknown colour`));
  need(distinct(BUILD_ROUNDS.map((r) => r.body)), "build: the same body twice");
  need(distinct(BUILD_ROUNDS.map((r) => r.colour)), "build: the same colour twice");

  MISSING_ROUNDS.forEach((r, i) => {
    const choices = missingChoices(i);
    need(colours.has(r.colour), `missing ${i}: unknown colour`);
    need(r.missing !== "body", `missing ${i}: a car with no body is not a car`);
    need(choices.length === 3, `missing ${i}: not three choices`);
    need(choices.filter((c) => c.right).length === 1, `missing ${i}: not exactly one right choice`);
    need(distinct(r.odd), `missing ${i}: the same odd thing twice`);
    need(!missingOn(r).includes(r.missing), `missing ${i}: the gap is drawn on`);
  });
  noRepeats(
    "missing",
    MISSING_ROUNDS.map((r) => kindOf(r.missing))
  );
  need(distinct(MISSING_ROUNDS.flatMap((r) => r.odd)), "missing: an odd thing comes back");
  need(distinct(MISSING_ROUNDS.map((r) => r.colour)), "missing: the same colour twice");
  need(
    new Set(MISSING_ROUNDS.map((_, i) => rightIndex(i))).size >= 2,
    "missing: the right part always stands in the same place"
  );
  return problems;
}
