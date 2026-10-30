import { BRICK_H, unproject, type Brick, type BrickKind, type View } from "./geometry";

/**
 * BRICK ENGINE — the rules of the plate.
 *
 * A brick fills whole stud cells, one level tall. It may sit on the plate
 * (level 0) or on any level where at least one of its cells has a brick
 * underneath — an overhang clutches fine on real studs, so it does here.
 * Two bricks never share a cell. A brick with another brick resting on it
 * cannot be pulled out from under it; take the top one off first, exactly as
 * with a real stack.
 */

export interface Plate {
  /** Studs along x and z. */
  w: number;
  d: number;
}

export interface Spot {
  x: number;
  z: number;
  y: number;
  w: number;
  d: number;
}

const cell = (x: number, z: number, y: number) => `${x},${z},${y}`;

export function occupancy(bricks: readonly Brick[], skip?: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const b of bricks) {
    if (b.id === skip) continue;
    for (let i = 0; i < b.w; i++)
      for (let j = 0; j < b.d; j++) map.set(cell(b.x + i, b.z + j, b.y), b.id);
  }
  return map;
}

export function fits(occ: Map<string, string>, plate: Plate, s: Spot): boolean {
  if (s.x < 0 || s.z < 0 || s.x + s.w > plate.w || s.z + s.d > plate.d || s.y < 0) return false;
  let supported = s.y === 0;
  for (let i = 0; i < s.w; i++) {
    for (let j = 0; j < s.d; j++) {
      if (occ.has(cell(s.x + i, s.z + j, s.y))) return false;
      if (!supported && occ.has(cell(s.x + i, s.z + j, s.y - 1))) supported = true;
    }
  }
  return supported;
}

/** True when nothing rests on this brick, so it can be lifted off. */
export function isFree(bricks: readonly Brick[], b: Brick): boolean {
  const occ = occupancy(bricks);
  for (let i = 0; i < b.w; i++)
    for (let j = 0; j < b.d; j++) if (occ.has(cell(b.x + i, b.z + j, b.y + 1))) return false;
  return true;
}

export function topLevel(bricks: readonly Brick[]): number {
  let top = -1;
  for (const b of bricks) if (b.y > top) top = b.y;
  return top;
}

export interface Landing {
  spot: Spot;
  /** False when the finger is over the plate but nothing fits there. */
  ok: boolean;
}

/**
 * Where a held brick would land if let go at screen point (px, py).
 *
 * The finger's ray is cut against the top of every level from the highest
 * down; the first level where the brick, centred on that point, fits and is
 * held up by something is the landing. So holding a brick over the top of a
 * tower lands it on the tower, and holding it over open plate lands it on the
 * plate — which is what "where I am pointing" means on a 3D board.
 * Returns null when the point is off the plate altogether.
 */
export function landingAt(
  v: View,
  plate: Plate,
  bricks: readonly Brick[],
  kind: BrickKind,
  px: number,
  py: number,
  skip?: string
): Landing | null {
  const occ = occupancy(bricks, skip);
  const top = topLevel(bricks.filter((b) => b.id !== skip));
  // A brick held over the plate's edge slides in to fit, the way a hand
  // lines a real brick up with the plate; only a finger off the plate
  // altogether lands nowhere.
  const clampX = (x: number) => Math.max(0, Math.min(plate.w - kind.w, x));
  const clampZ = (z: number) => Math.max(0, Math.min(plate.d - kind.d, z));
  const over = (p: { x: number; z: number }) =>
    p.x > -0.5 && p.z > -0.5 && p.x < plate.w + 0.5 && p.z < plate.d + 0.5;
  let ground: Spot | null = null;
  for (let y = top + 1; y >= 0; y--) {
    const p = unproject(v, px, py, y * BRICK_H);
    if (!over(p)) continue;
    const spot = {
      x: clampX(Math.round(p.x - kind.w / 2)),
      z: clampZ(Math.round(p.z - kind.d / 2)),
      y,
      w: kind.w,
      d: kind.d,
    };
    if (fits(occ, plate, spot)) return { spot, ok: true };
    if (y === 0) ground = spot;
  }
  // Over the plate but blocked: the red ghost shows where it would be.
  return ground ? { spot: ground, ok: false } : null;
}

let serial = 0;
export function newBrickId(): string {
  serial += 1;
  return `b${serial}`;
}
