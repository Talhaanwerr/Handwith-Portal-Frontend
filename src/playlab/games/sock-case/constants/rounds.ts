/**
 * The Missing Sock Case — every round, as data, and the check that proves it
 * fair.
 *
 * MATCHING PAIRS and ODD ONE OUT, with a gentle detective theme. A sock is a
 * colour and a pattern; two socks are a pair when both are the same. Two
 * modules of four rounds, each ONE mechanic:
 *
 *   • "pair" — FIND THE PAIR (drag). One sock hangs on the washing line next
 *     to an empty peg; the basket holds 2–4 socks. Drag the matching one onto
 *     the empty peg. Early rounds differ by COLOUR (every sock the same
 *     pattern), later ones by PATTERN (every sock the same colour).
 *   • "odd"  — THE ODD SOCK (tap). 3 or 5 socks hang on the line: all pairs
 *     but one. Tap the sock with no partner; its partner flies in from the
 *     basket, and the pairs are counted.
 *
 * Answers are DERIVED from the data (the matching sock is the one equal to the
 * clue; the odd sock is the one whose look appears once), never stored twice,
 * and `checkRounds()` proves every round has exactly one answer and that the
 * socks a child must tell apart are clearly different.
 */

import {
  ROUND_COUNT,
  distinct,
  roundChecker,
  shuffled,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";

export type ModuleId = "pair" | "odd";
export const MODULE_IDS: readonly ModuleId[] = ["pair", "odd"];

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "pair",
    name: "Find the Pair",
    tag: "Drag the matching sock",
    accent: "#2E7FD6",
    edge: "#1F5FA6",
    clip: "skc-mode-pair",
  },
  {
    id: "odd",
    name: "The Odd Sock",
    tag: "Tap the sock with no partner",
    accent: "#F08A24",
    edge: "#C06A12",
    clip: "skc-mode-odd",
  },
];

export const VOICE: GameVoice = { welcome: "skc-welcome", done: "skc-done" };

/* ── Socks ────────────────────────────────────────────────────────────────── */

export type SockColour = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink";
export type SockPattern = "plain" | "stripes" | "dots" | "stars" | "hearts" | "zigzag";

export interface Sock {
  colour: SockColour;
  pattern: SockPattern;
}

/** What tells the socks of a round apart. */
export type Cue = "colour" | "pattern";

export const sockKey = (s: Sock) => `${s.colour}-${s.pattern}`;
export const sameSock = (a: Sock, b: Sock) => a.colour === b.colour && a.pattern === b.pattern;

/** Colours a two-year-old might mix up next to each other — never in the
 *  same colour round. */
const COLOUR_CLASH: readonly [SockColour, SockColour][] = [
  ["red", "pink"],
  ["red", "orange"],
  ["orange", "yellow"],
  ["blue", "purple"],
];
/** Patterns too alike to be the only difference (two kinds of line). */
const PATTERN_CLASH: readonly [SockPattern, SockPattern][] = [["stripes", "zigzag"]];

function clashes<T>(xs: readonly T[], pairs: readonly [T, T][]): boolean {
  return pairs.some(([a, b]) => xs.includes(a) && xs.includes(b));
}

/* ── Find the Pair ────────────────────────────────────────────────────────── */

export interface PairRound {
  /** What the basket's socks differ by. */
  cue: Cue;
  /** The sock on the line — the one to find a partner for. */
  clue: Sock;
  /** The other socks in the basket (the match is the clue itself). */
  others: readonly Sock[];
}

/** How many socks the basket holds, round by round. */
export const PAIR_CHOICES = [2, 3, 3, 4] as const;

export const PAIR_ROUNDS: readonly PairRound[] = [
  {
    cue: "colour",
    clue: { colour: "red", pattern: "stripes" },
    others: [{ colour: "blue", pattern: "stripes" }],
  },
  {
    cue: "colour",
    clue: { colour: "yellow", pattern: "dots" },
    others: [
      { colour: "green", pattern: "dots" },
      { colour: "purple", pattern: "dots" },
    ],
  },
  {
    cue: "pattern",
    clue: { colour: "blue", pattern: "stars" },
    others: [
      { colour: "blue", pattern: "stripes" },
      { colour: "blue", pattern: "dots" },
    ],
  },
  {
    cue: "pattern",
    clue: { colour: "pink", pattern: "hearts" },
    others: [
      { colour: "pink", pattern: "zigzag" },
      { colour: "pink", pattern: "plain" },
      { colour: "pink", pattern: "dots" },
    ],
  },
];

/** The socks in the basket, left to right — the match among the others, in
 *  a fixed shuffle. */
export function pairBasket(round: number): Sock[] {
  const r = PAIR_ROUNDS[round];
  const all = [r.clue, ...r.others];
  return shuffled(
    all.map((_, i) => i),
    11 + round * 3
  ).map((i) => all[i]);
}

/** Which basket sock is the match, derived. */
export function pairAnswer(round: number): number {
  const r = PAIR_ROUNDS[round];
  return pairBasket(round).findIndex((s) => sameSock(s, r.clue));
}

/* ── The Odd Sock ─────────────────────────────────────────────────────────── */

export interface OddRound {
  cue: Cue;
  /** The socks on the line, left to right: pairs, and one with no partner. */
  line: readonly Sock[];
}

/** How many socks hang on the line, round by round. */
export const ODD_COUNTS = [3, 3, 5, 5] as const;

export const ODD_ROUNDS: readonly OddRound[] = [
  {
    cue: "colour",
    line: [
      { colour: "blue", pattern: "stripes" },
      { colour: "red", pattern: "dots" },
      { colour: "blue", pattern: "stripes" },
    ],
  },
  {
    cue: "colour",
    line: [
      { colour: "purple", pattern: "stars" },
      { colour: "green", pattern: "zigzag" },
      { colour: "green", pattern: "zigzag" },
    ],
  },
  {
    cue: "colour",
    line: [
      { colour: "pink", pattern: "hearts" },
      { colour: "blue", pattern: "dots" },
      { colour: "pink", pattern: "hearts" },
      { colour: "yellow", pattern: "stars" },
      { colour: "blue", pattern: "dots" },
    ],
  },
  {
    cue: "pattern",
    line: [
      { colour: "green", pattern: "stripes" },
      { colour: "green", pattern: "dots" },
      { colour: "green", pattern: "stripes" },
      { colour: "green", pattern: "dots" },
      { colour: "green", pattern: "hearts" },
    ],
  },
];

/** How many socks on the line share each look. */
function lookCounts(line: readonly Sock[]): Map<string, number> {
  const counts = new Map<string, number>();
  line.forEach((s) => counts.set(sockKey(s), (counts.get(sockKey(s)) ?? 0) + 1));
  return counts;
}

/** The lonely sock: the only one whose look appears once (-1 if there is not
 *  exactly one). */
export function oddIndex(r: OddRound): number {
  const counts = lookCounts(r.line);
  const lonely = r.line.flatMap((s, i) => (counts.get(sockKey(s)) === 1 ? [i] : []));
  return lonely.length === 1 ? lonely[0] : -1;
}

/** The other sock on the line that looks like sock `i` (-1 if none). */
export function partnerOf(r: OddRound, i: number): number {
  return r.line.findIndex((s, k) => k !== i && sameSock(s, r.line[i]));
}

/** The pairs once the case is solved — each as its socks' places on the
 *  line, in the order they are counted (left to right). The odd sock's pair
 *  is `[odd, -1]`: its partner comes from the basket. */
export function pairsOnLine(r: OddRound): [number, number][] {
  const odd = oddIndex(r);
  const out: [number, number][] = [];
  r.line.forEach((_, i) => {
    if (i === odd) out.push([i, -1]);
    else {
      const p = partnerOf(r, i);
      if (p > i) out.push([i, p]);
    }
  });
  return out;
}

/* ── The self-check ───────────────────────────────────────────────────────── */

/** Every problem with the round data, or an empty list. Run by the harness. */
export function checkRounds(): string[] {
  const { problems, need, noRepeats } = roundChecker();
  need(distinct(MODULES.map((m) => m.id)), "modules: an id twice");
  need(PAIR_ROUNDS.length === ROUND_COUNT, `pair: ${PAIR_ROUNDS.length} rounds`);
  need(ODD_ROUNDS.length === ROUND_COUNT, `odd: ${ODD_ROUNDS.length} rounds`);

  /** The socks a child tells apart differ in exactly the round's cue, and
   *  clearly so. */
  const fair = (name: string, cue: Cue, looks: readonly Sock[]) => {
    const colours = looks.map((s) => s.colour);
    const patterns = looks.map((s) => s.pattern);
    if (cue === "colour") {
      need(distinct(colours), `${name}: two different socks share a colour`);
      need(!clashes(colours, COLOUR_CLASH), `${name}: two colours too alike`);
    } else {
      need(new Set(colours).size === 1, `${name}: a pattern round with two colours`);
      need(distinct(patterns), `${name}: two different socks share a pattern`);
      need(!clashes(patterns, PATTERN_CLASH), `${name}: two patterns too alike`);
    }
  };

  // Find the Pair: the basket holds the match once, and the round's cue is
  // the only difference
  const spots: number[] = [];
  PAIR_ROUNDS.forEach((r, i) => {
    const name = `pair ${i}`;
    const basket = pairBasket(i);
    need(
      basket.length === PAIR_CHOICES[i],
      `${name}: ${basket.length} socks, not ${PAIR_CHOICES[i]}`
    );
    need(basket.filter((s) => sameSock(s, r.clue)).length === 1, `${name}: not exactly one match`);
    need(distinct(basket.map(sockKey)), `${name}: two identical socks in the basket`);
    if (r.cue === "colour")
      need(
        basket.every((s) => s.pattern === r.clue.pattern),
        `${name}: a colour round with two patterns`
      );
    fair(name, r.cue, basket);
    spots.push(pairAnswer(i));
  });
  need(new Set(spots).size > 1, "pair: the match is always in the same place");
  need(spots[0] !== 0, "pair 0: the match should not be the first sock");
  need(
    PAIR_ROUNDS.map((r) => r.cue).join() === "colour,colour,pattern,pattern",
    "pair: colour rounds first, then pattern rounds"
  );
  noRepeats(
    "pair",
    PAIR_ROUNDS.map((r) => sockKey(r.clue))
  );

  // The Odd Sock: an odd total, exactly one lonely sock, every other look
  // exactly twice
  const odds: number[] = [];
  ODD_ROUNDS.forEach((r, i) => {
    const name = `odd ${i}`;
    const n = r.line.length;
    need(n === ODD_COUNTS[i], `${name}: ${n} socks, not ${ODD_COUNTS[i]}`);
    need(n % 2 === 1, `${name}: an even number of socks`);
    const odd = oddIndex(r);
    need(odd >= 0, `${name}: not exactly one sock without a partner`);
    const counts = lookCounts(r.line);
    need(
      [...counts.values()].filter((c) => c === 2).length === (n - 1) / 2,
      `${name}: a look that is neither a pair nor the odd sock`
    );
    need(
      [...counts.values()].every((c) => c === 1 || c === 2),
      `${name}: three socks look the same`
    );
    // in a long line no pair hangs side by side — the child has to look
    if (n === 5)
      need(
        r.line.every((s, k) => k === 0 || !sameSock(s, r.line[k - 1])),
        `${name}: a pair hangs side by side`
      );
    const looks = [...new Map(r.line.map((s) => [sockKey(s), s])).values()];
    fair(name, r.cue, looks);
    need(pairsOnLine(r).length === (n + 1) / 2, `${name}: the pairs do not add up`);
    odds.push(odd);
  });
  need(new Set(odds).size > 2, "odd: the lonely sock is too often in the same place");
  noRepeats(
    "odd",
    ODD_ROUNDS.map((r) => r.line.map(sockKey).join("|"))
  );

  return problems;
}
