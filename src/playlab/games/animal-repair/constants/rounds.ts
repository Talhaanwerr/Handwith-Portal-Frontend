/**
 * Silly Animal Repair Shop — every round, as data, and the check that proves
 * it fair.
 *
 * Six soft toys sit, one at a time, on the repair-shop bench. Each is built
 * from separate parts, so a part can be missing, back in place, or a silly
 * part borrowed from another toy. Two modules of four rounds, each ONE
 * mechanic:
 *
 *   • "missing" — WHAT'S MISSING? One part has come off (a dashed outline
 *     where it goes, a sad face). Three parts lie in the kit: drag the right
 *     one onto its place.
 *   • "silly"   — SILLY MIX-UP. The toy wears another toy's part. Tap the
 *     silly part (it boings off), then drag the right part on.
 *
 * Answers are DERIVED (the right part is the one the toy owns for that slot,
 * found in `PARTS`), never stored twice, and `checkRounds()` proves every
 * round has exactly one right part and a fair kit.
 */

import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  shuffled,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";

export type ModuleId = "missing" | "silly";
export const MODULE_IDS: readonly ModuleId[] = ["missing", "silly"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "missing",
    name: "What's Missing?",
    tag: "Drag the lost part back on",
    accent: "#2E7FD6",
    edge: "#1F5FA6",
    clip: "arp-mode-missing",
  },
  {
    id: "silly",
    name: "Silly Mix-up",
    tag: "Tap the silly part, then fix it",
    accent: "#F08A24",
    edge: "#C06A12",
    clip: "arp-mode-silly",
  },
];

export const VOICE: GameVoice = { welcome: "arp-welcome", done: "arp-done" };

/* ── The toys and their parts ─────────────────────────────────────────────── */

export type AnimalId = "bunny" | "elephant" | "cat" | "mouse" | "lion";
export const ANIMAL_IDS: readonly AnimalId[] = ["bunny", "elephant", "cat", "mouse", "lion"];

/** The places on a toy a part can come off. Every toy is built on the same
 *  skeleton, so any toy's ears fit any toy's ear place — that is what makes
 *  the silly mix-ups possible. */
export type Kind = "ears" | "nose" | "tail" | "mane";

export type PartId =
  | "bunny-ears"
  | "bunny-tail"
  | "elephant-trunk"
  | "cat-ears"
  | "cat-tail"
  | "mouse-ears"
  | "mouse-tail"
  | "lion-mane"
  | "lion-tail";

/** Every loose part: whose it is, and which place it fits. */
export const PARTS: Record<PartId, { owner: AnimalId; kind: Kind; name: string }> = {
  "bunny-ears": { owner: "bunny", kind: "ears", name: "long bunny ears" },
  "bunny-tail": { owner: "bunny", kind: "tail", name: "a fluffy bunny tail" },
  "elephant-trunk": { owner: "elephant", kind: "nose", name: "an elephant trunk" },
  "cat-ears": { owner: "cat", kind: "ears", name: "pointy cat ears" },
  "cat-tail": { owner: "cat", kind: "tail", name: "a cat tail" },
  "mouse-ears": { owner: "mouse", kind: "ears", name: "round mouse ears" },
  "mouse-tail": { owner: "mouse", kind: "tail", name: "a thin mouse tail" },
  "lion-mane": { owner: "lion", kind: "mane", name: "a lion mane" },
  "lion-tail": { owner: "lion", kind: "tail", name: "a lion tail" },
};

/** The parts in a fixed order — their numbers for the kit shuffle. */
export const PART_IDS = Object.keys(PARTS) as PartId[];

export const ANIMAL_NAMES: Record<AnimalId, string> = {
  bunny: "bunny",
  elephant: "elephant",
  cat: "cat",
  mouse: "mouse",
  lion: "lion",
};

/** The part a toy owns for a place, if that place comes off on this toy. */
export function ownPart(animal: AnimalId, kind: Kind): PartId | null {
  return PART_IDS.find((p) => PARTS[p].owner === animal && PARTS[p].kind === kind) ?? null;
}

/** Everything a toy wears when it is whole. */
export function ownParts(animal: AnimalId): Partial<Record<Kind, PartId>> {
  const out: Partial<Record<Kind, PartId>> = {};
  for (const p of PART_IDS) if (PARTS[p].owner === animal) out[PARTS[p].kind] = p;
  return out;
}

/** The ask said when a part has come off, by place. */
export const LOST_ASK: Record<Kind, string> = {
  ears: "arp-lost-ears",
  nose: "arp-lost-nose",
  tail: "arp-lost-tail",
  mane: "arp-lost-mane",
};

/* ── The rounds ───────────────────────────────────────────────────────────── */

export interface MissingRound {
  animal: AnimalId;
  /** The place the part is missing from — the right part is derived. */
  kind: Kind;
  /** The two other toys' parts that wait in the kit beside the right one. */
  others: readonly [PartId, PartId];
}

export interface SillyRound extends MissingRound {
  /** The other toy's part the toy is wearing in that place. */
  silly: PartId;
}

export const MISSING_ROUNDS: readonly MissingRound[] = [
  { animal: "bunny", kind: "ears", others: ["mouse-ears", "cat-tail"] },
  { animal: "elephant", kind: "nose", others: ["cat-ears", "mouse-tail"] },
  { animal: "cat", kind: "tail", others: ["mouse-tail", "bunny-ears"] },
  { animal: "lion", kind: "mane", others: ["cat-ears", "mouse-tail"] },
];

export const SILLY_ROUNDS: readonly SillyRound[] = [
  { animal: "bunny", kind: "tail", silly: "cat-tail", others: ["mouse-ears", "elephant-trunk"] },
  { animal: "cat", kind: "ears", silly: "bunny-ears", others: ["mouse-ears", "elephant-trunk"] },
  { animal: "mouse", kind: "tail", silly: "lion-tail", others: ["cat-tail", "lion-mane"] },
  { animal: "lion", kind: "tail", silly: "bunny-tail", others: ["mouse-tail", "elephant-trunk"] },
];

/** The right part for a round, derived from who owns what. */
export function rightPart(r: MissingRound): PartId {
  return ownPart(r.animal, r.kind) as PartId;
}

/** The kit's three parts, in a fixed shuffle (the right one not always first). */
export function trayFor(r: MissingRound, seed: number): PartId[] {
  const ids = [rightPart(r), ...r.others].map((p) => PART_IDS.indexOf(p));
  return shuffled(ids, seed).map((i) => PART_IDS[i]);
}
export const missingTray = (round: number) => trayFor(MISSING_ROUNDS[round], 17 + round);
export const sillyTray = (round: number) => trayFor(SILLY_ROUNDS[round], 53 + round);

/* ── The self-check ───────────────────────────────────────────────────────── */

/** Every problem with the round data, or an empty list. Run by the harness. */
export function checkRounds(): string[] {
  const { problems, need, noRepeats } = roundChecker();
  need(MISSING_ROUNDS.length === ROUND_COUNT, `missing: ${MISSING_ROUNDS.length} rounds`);
  need(SILLY_ROUNDS.length === ROUND_COUNT, `silly: ${SILLY_ROUNDS.length} rounds`);
  need(distinct(MODULES.map((m) => m.id)), "modules: an id twice");

  const used = new Set<PartId>();
  const kit = (name: string, r: MissingRound, tray: readonly PartId[]) => {
    const right = ownPart(r.animal, r.kind);
    need(right !== null, `${name}: the ${r.animal} has no ${r.kind} that comes off`);
    if (!right) return;
    tray.forEach((p) => used.add(p));
    need(tray.length === 3 && distinct(tray), `${name}: the kit is not three different parts`);
    need(
      tray.filter((p) => p === right).length === 1,
      `${name}: the right part is not in the kit once`
    );
    need(
      r.others.every((p) => PARTS[p].owner !== r.animal),
      `${name}: a wrong part belongs to the ${r.animal} itself`
    );
    need(!r.others.includes(right), `${name}: the right part is also a wrong one`);
  };

  MISSING_ROUNDS.forEach((r, i) => kit(`missing ${i}`, r, missingTray(i)));
  SILLY_ROUNDS.forEach((r, i) => {
    const name = `silly ${i}`;
    kit(name, r, sillyTray(i));
    used.add(r.silly);
    need(PARTS[r.silly].kind === r.kind, `${name}: the silly part does not fit that place`);
    need(PARTS[r.silly].owner !== r.animal, `${name}: the silly part is the toy's own`);
    need(!sillyTray(i).includes(r.silly), `${name}: the silly part is offered back in the kit`);
  });

  for (const [name, rounds, tray] of [
    ["missing", MISSING_ROUNDS, missingTray],
    ["silly", SILLY_ROUNDS, sillyTray],
  ] as const) {
    need(distinct(rounds.map((r) => r.animal)), `${name}: the same toy twice`);
    need(new Set(rounds.map((r) => r.kind)).size >= 2, `${name}: fewer than two kinds of part`);
    noRepeats(
      name,
      rounds.map((r) => `${r.animal}-${r.kind}`)
    );
    const at = rounds.map((r, i) => tray(i).indexOf(rightPart(r)));
    need(new Set(at).size >= 2, `${name}: the right part is in the same kit place every round`);
  }

  const seen = new Set([...MISSING_ROUNDS, ...SILLY_ROUNDS].map((r) => r.animal));
  for (const a of ANIMAL_IDS) need(seen.has(a), `the ${a} never comes to the shop`);
  for (const p of PART_IDS) need(used.has(p), `the ${p} is never played`);
  return problems;
}
