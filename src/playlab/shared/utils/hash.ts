/**
 * A fixed hash to the unit interval — the portal's stand-in for Math.random
 * anywhere a value is used at render.
 *
 * The same `n` always gives the same number, so a board or a burst looks the
 * same on the server, on the client, and on a replay. Identical to the hash
 * the celebration layers carry inline; shared here so new callers stop
 * copying it.
 */
export function unit(n: number): number {
  let t = (n + 1) * 0x9e3779b9;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
