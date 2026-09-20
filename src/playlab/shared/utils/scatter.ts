/**
 * Collision-aware scatter placement.
 *
 * Two games spread letters across a free play area — Letter Hunt's cards and
 * Jungle Spy's bubbles — and both used to do it the same broken way: a
 * hand-authored list of PERCENT slots, with the item's own size expressed in
 * PIXELS, and nothing reconciling the two. That works only at the viewport the
 * slots were eyeballed on:
 *
 *   - Letter Hunt clamped each card into the safe area INDEPENDENTLY of every
 *     other card, so on a short screen every slot above the clamp floor
 *     collapsed onto the identical line and the cards stacked.
 *   - Jungle Spy measured the animal's real box into `keep` and then never
 *     consulted it, so letters landed on the picture the keep-out was
 *     computed to protect.
 *
 * This module takes the measured area, the measured item sizes and any
 * keep-out rectangles, and returns positions that actually fit. The
 * hand-authored slot order is still honoured — it is a good design and any
 * prefix of it is still a balanced board — it is simply no longer trusted to
 * be collision-free at sizes nobody tested.
 *
 * EVERYTHING HERE IS DETERMINISTIC. The same inputs always produce the same
 * board, which is the portal's existing contract (a child replaying a letter
 * meets the board they remember) and avoids any Math.random in a render path.
 */

/** A box, in px relative to the play area's top-left. */
export interface KeepRect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface ScatterArea {
  /** play-area size in CSS px */
  w: number;
  h: number;
  /** boxes no item may overlap — the animal picture, a fixed mascot, etc. */
  keep?: readonly KeepRect[];
}

export interface ScatterOptions {
  /** Never place more than this many items. Defaults to the slot count. */
  max?: number;
  /**
   * Place at least this many, falling back to a generated grid if the slot
   * map cannot manage it. Use it for the count the GAME depends on — Letter
   * Hunt cannot finish a round with fewer than its five targets on screen.
   */
  min?: number;
  /** Clear space to leave between two items, px. */
  gap?: number;
}

export interface Placed {
  /** Index into the `slots` array this position came from (-1 for grid). */
  slot: number;
  /** Centre of the item, px relative to the play area. */
  x: number;
  y: number;
  /**
   * The size the item should actually render at. Equal to the requested size
   * in the normal path; the grid fallback may return something smaller,
   * because a board that shrinks is still playable and one that overlaps is
   * not.
   */
  size: number;
}

/** Eight compass directions, tried in a fixed order — no randomness. */
const NUDGE_DIRS: readonly (readonly [number, number])[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [0.7, 0.7],
  [-0.7, 0.7],
  [0.7, -0.7],
  [-0.7, -0.7],
];

/** How far out to search around a slot before giving up on it. */
const NUDGE_RINGS = 3;

function clamp(v: number, lo: number, hi: number): number {
  // A degenerate area (hi < lo) still has to yield something on-screen.
  if (hi < lo) return (lo + hi) / 2;
  return v < lo ? lo : v > hi ? hi : v;
}

/** Do two centred squares overlap, allowing for `gap` of clear space? */
function hits(
  ax: number,
  ay: number,
  aSize: number,
  bx: number,
  by: number,
  bSize: number,
  gap: number
): boolean {
  const need = (aSize + bSize) / 2 + gap;
  return Math.abs(ax - bx) < need && Math.abs(ay - by) < need;
}

/** Does a centred square overlap a keep-out box, allowing for `gap`? */
function hitsRect(x: number, y: number, size: number, r: KeepRect, gap: number): boolean {
  const half = size / 2 + gap;
  return x + half > r.left && x - half < r.right && y + half > r.top && y - half < r.bottom;
}

function isFree(
  x: number,
  y: number,
  size: number,
  taken: readonly Placed[],
  keep: readonly KeepRect[],
  gap: number
): boolean {
  for (const r of keep) {
    if (hitsRect(x, y, size, r, gap)) return false;
  }
  for (const p of taken) {
    if (hits(x, y, size, p.x, p.y, p.size, gap)) return false;
  }
  return true;
}

/**
 * A guaranteed layout for `count` items: an even grid across the whole area,
 * with the cell size — and therefore the items — shrunk until they fit.
 *
 * This is the safety net, not the normal path. It runs only when the authored
 * slot map genuinely cannot seat the number of items the game needs, which on
 * a very short landscape phone it sometimes cannot. A smaller board is always
 * better than an unfinishable one.
 */
function gridFallback(
  count: number,
  sizes: readonly number[],
  area: ScatterArea,
  gap: number
): Placed[] {
  if (count <= 0) return [];
  // Choose a column count whose cells are as close to square as the area
  // allows, so the items keep their spread instead of forming a thin line.
  const cols = Math.max(
    1,
    Math.round(Math.sqrt((count * Math.max(area.w, 1)) / Math.max(area.h, 1)))
  );
  const rows = Math.ceil(count / cols);
  const cellW = area.w / cols;
  const cellH = area.h / rows;
  const cell = Math.max(24, Math.min(cellW, cellH) - gap);

  const out: Placed[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    // Centre the last (possibly short) row so the board never looks truncated.
    const inRow = Math.min(cols, count - r * cols);
    const rowOffset = (area.w - inRow * cellW) / 2;
    out.push({
      slot: -1,
      x: rowOffset + c * cellW + cellW / 2,
      y: r * cellH + cellH / 2,
      size: Math.min(cell, sizes[i] ?? cell),
    });
  }
  return out;
}

/**
 * Seat as many of `slots` as will fit, in the order given.
 *
 * @param slots  percent coordinates, `[x, y]`, each 0–100
 * @param sizes  each item's full box size in px, indexed alongside `slots`
 * @param area   the measured play area, plus any keep-out boxes
 */
export function scatter(
  slots: readonly (readonly [number, number])[],
  sizes: readonly number[],
  area: ScatterArea,
  options: ScatterOptions = {}
): Placed[] {
  const { max = slots.length, min = 0, gap = 6 } = options;
  const keep = area.keep ?? [];
  if (area.w <= 0 || area.h <= 0) return [];

  const placed: Placed[] = [];

  for (let i = 0; i < slots.length && placed.length < max; i++) {
    const size = sizes[i] ?? sizes[sizes.length - 1] ?? 48;
    const half = size / 2;
    // Inset so the item's own box — not just its centre — stays on screen.
    // This replaces the per-item `clamp(60px, x%, 100% - 60px)` that used to
    // sit in the style prop, where each card was pushed to the boundary with
    // no idea another card was already sitting on it.
    const minX = half + 2;
    const maxX = area.w - half - 2;
    const minY = half + 2;
    const maxY = area.h - half - 2;

    const baseX = clamp((slots[i][0] / 100) * area.w, minX, maxX);
    const baseY = clamp((slots[i][1] / 100) * area.h, minY, maxY);

    if (isFree(baseX, baseY, size, placed, keep, gap)) {
      placed.push({ slot: i, x: baseX, y: baseY, size });
      continue;
    }

    // Occupied: walk outward in fixed rings until something is clear. The
    // step is tied to the item's own size, so a big card searches in big
    // strides and a small one stays near its designed spot.
    const step = size * 0.62;
    let seated = false;
    for (let ring = 1; ring <= NUDGE_RINGS && !seated; ring++) {
      for (const [dx, dy] of NUDGE_DIRS) {
        const x = clamp(baseX + dx * step * ring, minX, maxX);
        const y = clamp(baseY + dy * step * ring, minY, maxY);
        if (isFree(x, y, size, placed, keep, gap)) {
          placed.push({ slot: i, x, y, size });
          seated = true;
          break;
        }
      }
    }
    // Still nothing? Drop this slot. A board with fewer letters is correct;
    // a board with two letters on the same spot is not.
  }

  if (placed.length >= min) return placed;
  return gridFallback(Math.min(min, max), sizes, area, gap);
}
