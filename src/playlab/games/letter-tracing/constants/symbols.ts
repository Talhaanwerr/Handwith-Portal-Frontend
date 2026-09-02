import type { Module } from "@games/letter-tracing/types";

/** Canonical symbol lists for progress tracking, shared by the store, the
 *  home shelf and the page router — defined once, imported everywhere.
 *
 *  THE CANONICAL SYMBOL IS THE MODULE'S OWN GLYPH. The lowercase module's data
 *  is keyed by "a".."z", so its canonical list must be too — this function
 *  returning UPPERCASE for the lowercase module made every indexOf() miss,
 *  and the Math.max(0, ...) guards downstream turned each miss into index 0:
 *  every lowercase tile, and every Next, landed on "a" forever. */
export const LETTER_SYMBOLS: readonly string[] = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const LOWERCASE_SYMBOLS: readonly string[] = "abcdefghijklmnopqrstuvwxyz".split("");
export const NUMBER_SYMBOLS: readonly string[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
];

export function symbolsFor(module: Module): readonly string[] {
  if (module === "numbers") return NUMBER_SYMBOLS;
  if (module === "lowercase") return LOWERCASE_SYMBOLS;
  return LETTER_SYMBOLS;
}
