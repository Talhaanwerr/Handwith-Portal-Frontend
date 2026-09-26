/**
 * Reading back what a game saved in the browser.
 *
 * A zustand `persist` store hands back whatever is in localStorage, and that is
 * not guaranteed to be what this version of the game wrote: an older build, a
 * hand-edited entry, or another tab can leave a string where a number belongs
 * or a level id the game no longer has. Merged in blindly, a bad value is at
 * best a star count that reads "NaN" and at worst a white screen — Blend &
 * Seek indexed its levels with a saved id and crashed on one it did not know.
 *
 * So a store's `merge` passes every saved field through one of these, and
 * anything that does not fit is dropped in favour of the fresh default.
 */

/** A plain object, or null. Arrays and everything else are not records. */
export function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** A whole number within [min, max], or the fallback. */
export function wholeNumber(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max
    ? value
    : fallback;
}

/** One of the allowed values, or the fallback. */
export function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback;
}

/**
 * A saved `{ key: number }` map, keeping only the keys that are allowed and
 * the values that are whole numbers in range. `allowed` may be a list or a
 * test, for maps keyed by something open-ended like a board id.
 */
export function numberMap<K extends string>(
  value: unknown,
  allowed: readonly K[] | ((key: string) => boolean),
  min: number,
  max: number
): Partial<Record<K, number>> {
  const saved = asRecord(value);
  const out: Partial<Record<K, number>> = {};
  if (!saved) return out;
  const ok = typeof allowed === "function" ? allowed : (k: string) => allowed.includes(k as K);
  for (const [key, v] of Object.entries(saved)) {
    if (ok(key) && typeof v === "number" && Number.isInteger(v) && v >= min && v <= max)
      out[key as K] = v;
  }
  return out;
}
