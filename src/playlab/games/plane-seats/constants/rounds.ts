/**
 * Plane Seats — numbers 1 to 5 on the seats of an aeroplane, as data.
 *
 * One row of five big seats across the cabin, numbered 1 2 3 4 5 from left
 * to right. Every module plays on that same row:
 *
 *   • "number" — SEAT NUMBERS: a passenger walks up holding a boarding pass
 *                with a big numeral; tap the seat with that number and they
 *                sit in it. Three passengers a round.
 *   • "sums"   — TICKET SUMS: the boarding pass shows a little dot sum
 *                (●● + ● = ?); add it up and tap that seat.
 */

import {
  ROUND_COUNT,
  distinct,
  inRange,
  roundChecker,
  type GameVoice,
  type ModuleInfo,
} from "@games/number-groups/constants/kit";

export type ModuleId = "number" | "sums";
export const MODULE_IDS: readonly ModuleId[] = ["number", "sums"];
/** The two modules played with boarding passes. */
export type TicketModule = "number" | "sums";

export const MODULES: readonly ModuleInfo<ModuleId>[] = [
  {
    id: "number",
    name: "Seat Numbers",
    tag: "Match the number",
    accent: "#2F7FD8",
    edge: "#1F5DA6",
    clip: "pls-mode-number",
  },
  {
    id: "sums",
    name: "Ticket Sums",
    tag: "Add to find the seat",
    accent: "#EF6F5E",
    edge: "#C24E3F",
    clip: "pls-mode-sums",
  },
];

export const VOICE: GameVoice = { welcome: "pls-welcome", done: "pls-done" };

/** The seats, left to right. */
export const SEATS = [1, 2, 3, 4, 5] as const;

/** The passengers: Fluent animal faces (each on a little drawn body). */
export type Passenger = "bear" | "panda" | "fox" | "lion" | "rabbit" | "monkey" | "tiger" | "dog";

/** Each passenger's jumper colour (their drawn body). */
export const COAT: Readonly<Record<Passenger, string>> = {
  bear: "#F2A65A",
  panda: "#5BB6E8",
  fox: "#7CC46F",
  lion: "#B98AE0",
  rabbit: "#F47FA0",
  monkey: "#F5C84C",
  tiger: "#6A8FF0",
  dog: "#E8735F",
};

/** One passenger with a boarding pass: the seat it shows, and (Ticket Sums)
 *  the dot sum that adds up to it. */
export interface Trip {
  who: Passenger;
  seat: number;
  sum?: readonly [number, number];
}

/** Three passengers a round, one after another. */
export type TicketRound = readonly [Trip, Trip, Trip];

export const TICKET_ROUNDS: Readonly<Record<TicketModule, readonly TicketRound[]>> = {
  number: [
    [
      { who: "bear", seat: 2 },
      { who: "rabbit", seat: 4 },
      { who: "panda", seat: 1 },
    ],
    [
      { who: "fox", seat: 3 },
      { who: "lion", seat: 5 },
      { who: "monkey", seat: 2 },
    ],
    [
      { who: "tiger", seat: 1 },
      { who: "bear", seat: 5 },
      { who: "dog", seat: 3 },
    ],
    [
      { who: "panda", seat: 4 },
      { who: "fox", seat: 1 },
      { who: "rabbit", seat: 5 },
    ],
  ],
  sums: [
    [
      { who: "lion", seat: 2, sum: [1, 1] },
      { who: "panda", seat: 3, sum: [2, 1] },
      { who: "bear", seat: 4, sum: [1, 3] },
    ],
    [
      { who: "rabbit", seat: 4, sum: [2, 2] },
      { who: "fox", seat: 2, sum: [1, 1] },
      { who: "monkey", seat: 5, sum: [3, 2] },
    ],
    [
      { who: "dog", seat: 3, sum: [1, 2] },
      { who: "tiger", seat: 5, sum: [4, 1] },
      { who: "panda", seat: 2, sum: [1, 1] },
    ],
    [
      { who: "bear", seat: 4, sum: [3, 1] },
      { who: "lion", seat: 5, sum: [2, 3] },
      { who: "rabbit", seat: 3, sum: [2, 1] },
    ],
  ],
};

/** The line said as each passenger walks up. */
export const findClip = (m: TicketModule) => (m === "number" ? "pls-find" : "pls-add");

/** Self-check: four rounds a module; three passengers with three different
 *  seats a round; sums that add up; every number 1–5 a seat somewhere in Seat Numbers. */
export function checkRounds(): string[] {
  const { problems, need, covers, noRepeats } = roundChecker();
  for (const id of ["number", "sums"] as const) {
    const rs = TICKET_ROUNDS[id];
    need(rs.length === ROUND_COUNT, `${id}: ${rs.length} rounds`);
    noRepeats(
      id,
      rs.map((r) => r.map((t) => `${t.who}${t.seat}`).join())
    );
    const seen = new Set<number>();
    for (const r of rs) {
      need(r.length === 3, `${id}: ${r.length} passengers`);
      need(distinct(r.map((t) => t.seat)), `${id}: a seat is used twice in a round`);
      need(distinct(r.map((t) => t.who)), `${id}: a passenger boards twice in a round`);
      for (const t of r) {
        need(inRange(t.seat), `${id}: seat ${t.seat}`);
        seen.add(t.seat);
        if (id === "number") need(!t.sum, `number: seat ${t.seat} has a sum`);
        else {
          const [a, b] = t.sum ?? [0, 0];
          need(a >= 1 && b >= 1, `sums: ${a}+${b} has an empty side`);
          need(a + b === t.seat, `sums: ${a}+${b} is not ${t.seat}`);
          need(t.seat >= 2, `sums: seat ${t.seat} cannot be a sum`);
        }
      }
    }
    if (id === "number") covers(id, seen);
  }

  return problems;
}
