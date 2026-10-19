/**
 * BRICK ENGINE — geometry.
 *
 * Every brick game in PlayLab (Brick Lab, Color Sort Factory, Number Tower,
 * Build Steps, Pattern Wall) shares this one model of an interlocking plastic
 * brick and this one camera. Units are STUDS: one stud pitch (8 mm on a real
 * brick) is 1. A brick is 1.2 tall (9.6 mm), its studs are 0.6 across
 * (4.8 mm) and stand 0.21 proud (1.7 mm) — the real proportions, which is most
 * of why the bricks read as moulded plastic instead of coloured boxes.
 *
 * The camera is an orthographic orbit: `yaw` turns the plate, `pitch` tilts
 * it. Projection is closed-form both ways, so a finger on the screen can be
 * turned back into a stud cell at any height (`unproject`) — that is what
 * the drag uses to snap a brick onto the top of whatever it is held over.
 */

export const BRICK_H = 1.2;
export const STUD_R = 0.3;
export const STUD_H = 0.21;
export const PLATE_H = 0.32;

/** The colour palette — the classic brick colours. `clip` is the recorded
 *  "<colour> block!" line, when one exists. */
export const COLORS = {
  red: { hex: "#C91A09", clip: "friends-block-red", is: "friends-is-red", name: "red" },
  orange: { hex: "#FE8A18", clip: "friends-block-orange", is: "friends-is-orange", name: "orange" },
  yellow: { hex: "#F5CD2F", clip: "friends-block-yellow", is: "friends-is-yellow", name: "yellow" },
  green: { hex: "#25A244", clip: "friends-block-green", is: "friends-is-green", name: "green" },
  teal: { hex: "#36AEBF", clip: "friends-block-teal", is: null, name: "teal" },
  blue: { hex: "#0A5BC4", clip: "friends-block-blue", is: "friends-is-blue", name: "blue" },
  purple: { hex: "#7E3FB5", clip: "friends-block-purple", is: "friends-is-purple", name: "purple" },
  pink: { hex: "#F27BB0", clip: "friends-block-pink", is: "friends-is-pink", name: "pink" },
  white: { hex: "#F2F3F2", clip: null, is: null, name: "white" },
  black: { hex: "#2A3138", clip: null, is: null, name: "black" },
} as const;

export type BrickColor = keyof typeof COLORS;

export interface Brick {
  id: string;
  /** Studs along x and z. */
  w: number;
  d: number;
  color: BrickColor;
  /** A printed mark — a letter, for the word games — on a side face. */
  tag?: string;
  /** Which side the print goes on; default: the side most facing the camera. */
  face?: "+x" | "-x" | "+z" | "-z";
  /** The brick's back-left cell, and its LEVEL (0 = on the plate). */
  x: number;
  z: number;
  y: number;
}

/** A brick before it has a place: what the tray hands out. */
export interface BrickKind {
  w: number;
  d: number;
  color: BrickColor;
  tag?: string;
}

export interface View {
  /** Radians. 0 looks straight down the z axis. */
  yaw: number;
  /** Radians above the horizon. */
  pitch: number;
  /** Pixels per stud. */
  scale: number;
  /** Screen position of the orbit centre (on the plate surface). */
  ox: number;
  oy: number;
  /** World point the camera orbits (plate centre). */
  cx: number;
  cz: number;
}

export interface Pt {
  x: number;
  y: number;
}

/** World (x, height, z) to screen. */
export function project(v: View, x: number, h: number, z: number): Pt {
  const dx = x - v.cx;
  const dz = z - v.cz;
  const c = Math.cos(v.yaw);
  const s = Math.sin(v.yaw);
  const rx = dx * c - dz * s;
  const rz = dx * s + dz * c;
  return {
    x: v.ox + rx * v.scale,
    y: v.oy + rz * v.scale * Math.sin(v.pitch) - h * v.scale * Math.cos(v.pitch),
  };
}

/** Screen to world on the horizontal plane at height `h`. */
export function unproject(v: View, px: number, py: number, h: number): { x: number; z: number } {
  const rx = (px - v.ox) / v.scale;
  const rz = (py - v.oy + h * v.scale * Math.cos(v.pitch)) / (v.scale * Math.sin(v.pitch));
  const c = Math.cos(v.yaw);
  const s = Math.sin(v.yaw);
  return { x: rx * c + rz * s + v.cx, z: -rx * s + rz * c + v.cz };
}

/** Which way the camera looks from, as a world (x, z) direction. */
export function viewDir(v: View): { x: number; z: number } {
  return { x: Math.sin(v.yaw), z: Math.cos(v.yaw) };
}

export const pts = (list: readonly Pt[]) =>
  list.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

/* ── Colour ─────────────────────────────────────────────────────────────── */

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const shades = new Map<string, string>();

/** `f` below 1 darkens, above 1 lifts towards white. Cached: a turn asks for
 *  the same few tones thousands of times a second. */
export function shade(hex: string, f: number): string {
  const key = hex + f.toFixed(3);
  const hit = shades.get(key);
  if (hit) return hit;
  const out = mix(hex, f);
  shades.set(key, out);
  return out;
}

function mix(hex: string, f: number): string {
  const [r, g, b] = rgb(hex);
  const ch = (c: number) =>
    Math.round(f <= 1 ? c * f : c + (255 - c) * Math.min(1, f - 1)).toString();
  return `rgb(${ch(r)},${ch(g)},${ch(b)})`;
}

/* ── Faces ──────────────────────────────────────────────────────────────── */

export interface Face {
  points: Pt[];
  fill: string;
  edge: string;
  kind: "top" | "side";
}

export interface StudShape {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  hs: number;
  depth: number;
}

export interface BoxShape {
  faces: Face[];
  studs: StudShape[];
  /** Top-face front edges, for the moulded highlight line. */
  rim: Pt[];
  /** Screen bounds — for sorting and hit areas. */
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/**
 * The visible geometry of a box with studs: the top, the two side faces that
 * face the camera (shaded by how squarely they face the key light, which
 * sits up and to the camera's left), and the studs in back-to-front order.
 */
export function boxShape(
  v: View,
  hex: string,
  x: number,
  z: number,
  w: number,
  d: number,
  y0: number,
  height: number,
  studs: boolean,
  /** World cells ("x,z") whose stud is under another brick: not drawn. */
  hidden?: ReadonlySet<string>
): BoxShape {
  const y1 = y0 + height;
  const dir = viewDir(v);
  const c = Math.cos(v.yaw);
  const s = Math.sin(v.yaw);
  const faces: Face[] = [];

  // Four side faces as [x0,z0,x1,z1, normal]. A face shows when its outward
  // normal points at the camera.
  const sides: Array<[number, number, number, number, number, number]> = [
    [x, z + d, x + w, z + d, 0, 1],
    [x + w, z, x, z, 0, -1],
    [x + w, z + d, x + w, z, 1, 0],
    [x, z, x, z + d, -1, 0],
  ];
  for (const [ax, az, bx, bz, nx, nz] of sides) {
    if (nx * dir.x + nz * dir.z <= 0.001) continue;
    // Screen-space x of the normal: negative faces the light on the left.
    const nScreen = nx * c - nz * s;
    // Quantised so the shade cache holds a few dozen tones, not one per frame.
    const f = Math.round((0.8 - 0.2 * nScreen) * 50) / 50;
    faces.push({
      kind: "side",
      points: [
        project(v, ax, y1, az),
        project(v, bx, y1, bz),
        project(v, bx, y0, bz),
        project(v, ax, y0, az),
      ],
      fill: shade(hex, f),
      edge: shade(hex, f * 0.62),
    });
  }

  const top = [
    project(v, x, y1, z),
    project(v, x + w, y1, z),
    project(v, x + w, y1, z + d),
    project(v, x, y1, z + d),
  ];
  faces.push({ kind: "top", points: top, fill: shade(hex, 1.0), edge: shade(hex, 0.72) });

  // The top's two edges nearest the camera catch the light.
  const near = top.map((p, i) => ({ p, i })).sort((a, b) => b.p.y - a.p.y)[0].i;
  const rim = [top[(near + 3) % 4], top[near], top[(near + 1) % 4]];

  const studList: StudShape[] = [];
  if (studs) {
    const rx = STUD_R * v.scale;
    const ry = rx * Math.sin(v.pitch);
    const hs = STUD_H * v.scale * Math.cos(v.pitch);
    for (let i = 0; i < w; i++) {
      for (let j = 0; j < d; j++) {
        if (hidden?.has(`${x + i},${z + j}`)) continue;
        const p = project(v, x + i + 0.5, y1, z + j + 0.5);
        studList.push({ cx: p.x, cy: p.y, rx, ry, hs, depth: p.y });
      }
    }
    studList.sort((a, b) => a.depth - b.depth);
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const f of faces) {
    for (const p of f.points) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
  }
  if (studs) minY -= STUD_H * v.scale;
  return { faces, studs: studList, rim, minX, maxX, minY, maxY };
}

/* ── Draw order ─────────────────────────────────────────────────────────── */

/**
 * Painter's order for axis-aligned boxes. Two bricks that never overlap on
 * screen need no order; for those that do, a separating axis decides which is
 * behind — whichever lies further from the camera along x or z, and
 * for a stack, the lower one. A topological sort on those pairs is exact for any camera angle,
 * which a single depth key is not once bricks have different lengths.
 */
export function drawOrder(bricks: readonly Brick[], v: View): Brick[] {
  const dir = viewDir(v);
  const n = bricks.length;
  const shapes = bricks.map((b) => {
    const corners = [
      project(v, b.x, b.y * BRICK_H, b.z),
      project(v, b.x + b.w, b.y * BRICK_H, b.z),
      project(v, b.x + b.w, b.y * BRICK_H, b.z + b.d),
      project(v, b.x, b.y * BRICK_H, b.z + b.d),
    ];
    const lift = (BRICK_H + STUD_H) * v.scale * Math.cos(v.pitch);
    const xs = corners.map((p) => p.x);
    const ys = corners.map((p) => p.y);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minY: Math.min(...ys) - lift,
      maxY: Math.max(...ys),
    };
  });

  const behind = (a: Brick, b: Brick): boolean | null => {
    if (a.x + a.w <= b.x) return dir.x > 0;
    if (b.x + b.w <= a.x) return dir.x < 0;
    if (a.z + a.d <= b.z) return dir.z > 0;
    if (b.z + b.d <= a.z) return dir.z < 0;
    if (a.y + 1 <= b.y) return true;
    if (b.y + 1 <= a.y) return false;
    return null;
  };

  const after: number[][] = Array.from({ length: n }, () => []);
  const indeg = new Array<number>(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const A = shapes[i];
      const B = shapes[j];
      if (A.maxX <= B.minX || B.maxX <= A.minX || A.maxY <= B.minY || B.maxY <= A.minY) continue;
      const r = behind(bricks[i], bricks[j]);
      if (r === true) {
        after[i].push(j);
        indeg[j]++;
      } else if (r === false) {
        after[j].push(i);
        indeg[i]++;
      }
    }
  }

  // Kahn's algorithm, ties broken by a plain depth key so the order is stable.
  const key = (i: number) => {
    const b = bricks[i];
    return b.y * 1000 + ((b.x + b.w / 2) * dir.x + (b.z + b.d / 2) * dir.z);
  };
  const ready: number[] = [];
  for (let i = 0; i < n; i++) if (indeg[i] === 0) ready.push(i);
  const out: Brick[] = [];
  const done = new Array<boolean>(n).fill(false);
  while (out.length < n) {
    if (ready.length === 0) {
      // A cycle (cannot happen for touching-free boxes, but data is data):
      // release the shallowest remaining brick.
      let best = -1;
      for (let i = 0; i < n; i++) if (!done[i] && (best < 0 || key(i) < key(best))) best = i;
      ready.push(best);
      indeg[best] = 0;
    }
    ready.sort((a, b) => key(b) - key(a));
    const i = ready.pop() as number;
    if (done[i]) continue;
    done[i] = true;
    out.push(bricks[i]);
    for (const j of after[i]) if (--indeg[j] === 0 && !done[j]) ready.push(j);
  }
  return out;
}
