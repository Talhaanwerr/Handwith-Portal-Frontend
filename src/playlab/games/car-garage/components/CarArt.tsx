"use client";

import { memo, useId, type ReactNode } from "react";

/**
 * THE CAR — a missing prop, drawn here, and shared: Build-a-Car Garage builds
 * it part by part, The Messy Car Wash (`@games/car-garage/components/CarArt`)
 * washes it. Candy ABC's `VOCAB_ART.car` and the Twemoji car are one flat
 * picture each; this one comes apart.
 *
 * A chunky side view, nose to the right, seen a little from the front and
 * above: every part has a darker copy just behind it (up and to the right),
 * which gives the car its thickness — and puts the FAR wheels and the far
 * headlight in view, so all four wheels can be counted (two at each axle).
 *
 * Units: the viewBox is 240 × 150 and the wheels stand on y = 144. Every
 * part's place is a `Box` in those units (`spotBox`), so a game can lay an
 * HTML drop target, a glow or a splotch exactly over it in %.
 *
 * Only presentation attributes paint it (no stylesheet needed — the Library
 * icons use it too); car-garage.css adds the motion: the blink, the happy
 * bounce, the spinning wheels and the glow of a waiting place.
 */

export const CAR_W = 240;
export const CAR_H = 150;
/** Where the tyres touch the ground. */
export const GROUND_Y = 144;
/** Tyre radius. */
export const WHEEL_R = 21;
/** The near wheels' centre height. */
export const WHEEL_Y = GROUND_Y - WHEEL_R;
/** How far the far side sits from the near side: right and up. */
export const FAR = { dx: 14, dy: -9 } as const;
/** The far wheels sit further out than the true perspective would put them,
 *  so each axle clearly shows TWO wheels — all four can be counted. */
export const FAR_WHEEL = { dx: 23, dy: -7 } as const;

export type CarBody = "car" | "van" | "truck" | "bus";
export const CAR_BODIES: readonly CarBody[] = ["car", "van", "truck", "bus"];

export type CarColourId = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink";

export interface CarPaint {
  id: CarColourId;
  /** The paint, its highlight, its shade, and the outline (a darker shade of
   *  the fill, never black — the construction theme's rule). */
  face: string;
  light: string;
  deep: string;
  line: string;
}

/** The seven paints — exactly the colours the portal has a recorded line for
 *  (`friends-is-<id>`, "That one is red."). */
export const CAR_COLOURS: readonly CarPaint[] = [
  { id: "red", face: "#E5484D", light: "#FF8A8D", deep: "#B8363A", line: "#8E2629" },
  { id: "orange", face: "#F08A24", light: "#FFB869", deep: "#C06A12", line: "#94500C" },
  { id: "yellow", face: "#F5C431", light: "#FFE27F", deep: "#CF9B12", line: "#9C730A" },
  { id: "green", face: "#3DAB72", light: "#7DD8A5", deep: "#2B8A57", line: "#1E6B42" },
  { id: "blue", face: "#2E7FD6", light: "#73B4F4", deep: "#1F5FA6", line: "#174A82" },
  { id: "purple", face: "#8E5BD9", light: "#BC9AF2", deep: "#6C3FB5", line: "#522E8C" },
  { id: "pink", face: "#F06BA8", light: "#FFA6CE", deep: "#C94A86", line: "#9E3567" },
];

export function paintOf(id: CarColourId): CarPaint {
  return CAR_COLOURS.find((c) => c.id === id) ?? CAR_COLOURS[0];
}

/** The wheels by place: near back, near front, far back, far front. */
export type WheelSpot = "wheel-0" | "wheel-1" | "wheel-2" | "wheel-3";
export const WHEEL_SPOTS: readonly WheelSpot[] = ["wheel-0", "wheel-1", "wheel-2", "wheel-3"];

/** Every place a part goes. The headlights are the car's eyes. */
export type CarSpot = "body" | WheelSpot | "roof" | "windows" | "lights";
export const ALL_SPOTS: readonly CarSpot[] = ["body", ...WHEEL_SPOTS, "roof", "windows", "lights"];

/** The kinds of part: all four wheels are the same part. */
export type PartKind = "body" | "wheel" | "roof" | "windows" | "lights";
export const kindOf = (s: CarSpot): PartKind => (s.startsWith("wheel") ? "wheel" : (s as PartKind));

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** One body's drawing, in car units. */
export interface CarGeom {
  body: string;
  bodyBox: Box;
  /** The cabin, or the bus's whole top half. */
  roof: string;
  roofBox: Box;
  windows: readonly string[];
  windowsBox: Box;
  /** The axles' x: back, front. */
  wheelX: readonly [number, number];
  /** The near headlight (the eye). The far one is the same, moved by FAR. */
  eye: { x: number; y: number; r: number };
  smile: string;
  flat: string;
  tail: Box;
  seams: string;
  /** The white gloss streak along the body. */
  shine: string;
  bumpers: readonly Box[];
  /** Extra lines on the body (the pickup's bed rim). */
  trim?: string;
}

export const CAR_GEOM: Record<CarBody, CarGeom> = {
  car: {
    body: "M24 114 L38.7 114 A25 25 0 0 1 85.3 114 L148.7 114 A25 25 0 0 1 195.3 114 L212 114 Q224 114 224 102 L224 97 Q224 86 210 84 L168 78 L34 78 Q16 78 16 94 L16 104 Q16 114 24 114 Z",
    bodyBox: { x: 10, y: 76, w: 220, h: 40 },
    roof: "M34 80 L50 48 Q55 40 64 40 L124 40 Q134 40 141 46 L172 80 Z",
    roofBox: { x: 32, y: 38, w: 142, h: 44 },
    windows: [
      "M52 75 L62 52 Q64 48 69 48 L98 48 L98 75 Z",
      "M106 48 L123 48 Q130 48 135 53 L158 75 L106 75 Z",
    ],
    windowsBox: { x: 48, y: 44, w: 114, h: 35 },
    wheelX: [62, 172],
    eye: { x: 212, y: 95, r: 9.5 },
    smile: "M195 104 Q207 115 221 103",
    flat: "M199 108 L215 107",
    tail: { x: 15, y: 84, w: 7, h: 12 },
    seams: "M104 82 L104 110 M112 89 L126 89",
    shine: "M32 87 H150",
    bumpers: [
      { x: 10, y: 102, w: 12, h: 10 },
      { x: 218, y: 102, w: 12, h: 10 },
    ],
  },
  van: {
    body: "M22 114 L36.7 114 A25 25 0 0 1 83.3 114 L152.7 114 A25 25 0 0 1 199.3 114 L214 114 Q226 114 226 102 L226 96 Q226 86 212 84 L194 82 L28 82 Q14 82 14 96 L14 104 Q14 114 22 114 Z",
    bodyBox: { x: 10, y: 80, w: 220, h: 36 },
    roof: "M16 86 L16 32 Q16 22 28 22 L148 22 Q158 22 164 29 L204 86 Z",
    roofBox: { x: 14, y: 20, w: 192, h: 68 },
    windows: [
      "M26 76 L26 35 Q26 31 30 31 L62 31 L62 76 Z",
      "M70 31 L110 31 L110 76 L70 76 Z",
      "M118 31 L147 31 Q153 31 157 36 L188 76 L118 76 Z",
    ],
    windowsBox: { x: 22, y: 27, w: 170, h: 53 },
    wheelX: [60, 176],
    eye: { x: 215, y: 96, r: 9 },
    smile: "M198 105 Q209 115 223 104",
    flat: "M202 108 L217 107",
    tail: { x: 13, y: 88, w: 7, h: 12 },
    seams: "M114 86 L114 111 M122 92 L136 92",
    shine: "M30 91 H150",
    bumpers: [
      { x: 10, y: 102, w: 12, h: 10 },
      { x: 218, y: 102, w: 12, h: 10 },
    ],
  },
  truck: {
    body: "M16 114 L30.7 114 A25 25 0 0 1 77.3 114 L150.7 114 A25 25 0 0 1 197.3 114 L212 114 Q224 114 224 102 L224 97 Q224 86 210 84 L120 82 L120 68 Q120 62 114 62 L14 62 Q8 62 8 68 L8 106 Q8 114 16 114 Z",
    bodyBox: { x: 4, y: 60, w: 226, h: 56 },
    roof: "M118 84 L118 38 Q118 30 126 30 L156 30 Q164 30 168 36 L198 84 Z",
    roofBox: { x: 116, y: 28, w: 84, h: 58 },
    windows: ["M127 76 L127 43 Q127 39 131 39 L154 39 Q159 39 162 44 L183 76 Z"],
    windowsBox: { x: 123, y: 35, w: 64, h: 45 },
    wheelX: [54, 174],
    eye: { x: 212, y: 96, r: 9 },
    smile: "M195 105 Q207 115 221 104",
    flat: "M199 108 L215 107",
    tail: { x: 7, y: 72, w: 7, h: 12 },
    seams: "M124 88 L124 111 M132 93 L146 93",
    shine: "M20 90 H110",
    bumpers: [
      { x: 4, y: 102, w: 10, h: 10 },
      { x: 218, y: 102, w: 12, h: 10 },
    ],
    trim: "M14 71 L114 71",
  },
  bus: {
    body: "M14 114 L26.7 114 A25 25 0 0 1 73.3 114 L152.7 114 A25 25 0 0 1 199.3 114 L216 114 Q226 114 226 104 L226 90 Q226 84 220 84 L12 84 Q6 84 6 90 L6 106 Q6 114 14 114 Z",
    bodyBox: { x: 2, y: 82, w: 232, h: 34 },
    roof: "M6 88 L6 28 Q6 18 16 18 L206 18 Q220 18 223 31 L226 88 Z",
    roofBox: { x: 4, y: 16, w: 224, h: 74 },
    windows: [
      "M15 29 L48 29 L48 70 L15 70 Z",
      "M56 29 L90 29 L90 70 L56 70 Z",
      "M98 29 L132 29 L132 70 L98 70 Z",
      "M140 29 L174 29 L174 70 L140 70 Z",
      "M186 29 L211 29 Q215 29 216 33 L219 78 L186 78 Z",
    ],
    windowsBox: { x: 11, y: 25, w: 212, h: 57 },
    wheelX: [50, 176],
    eye: { x: 216, y: 97, r: 8.5 },
    smile: "M200 105 Q211 115 223 104",
    flat: "M203 108 L218 107",
    tail: { x: 5, y: 90, w: 6, h: 12 },
    seams: "M182 88 L182 112 M134 88 L134 112",
    shine: "M18 92 H128",
    bumpers: [
      { x: 2, y: 103, w: 10, h: 9 },
      { x: 222, y: 103, w: 10, h: 9 },
    ],
  },
};

/** The centre of one wheel place. */
export function wheelCentre(body: CarBody, spot: WheelSpot): { x: number; y: number } {
  const i = WHEEL_SPOTS.indexOf(spot);
  const far = i >= 2;
  const x = CAR_GEOM[body].wheelX[i % 2];
  return far ? { x: x + FAR_WHEEL.dx, y: WHEEL_Y + FAR_WHEEL.dy } : { x, y: WHEEL_Y };
}

/** Where a part goes, in car units: the drop target, the glow, the seat. */
export function spotBox(body: CarBody, spot: CarSpot): Box {
  const g = CAR_GEOM[body];
  if (spot === "body") return g.bodyBox;
  if (spot === "roof") return g.roofBox;
  if (spot === "windows") return g.windowsBox;
  if (spot === "lights") {
    const { x, y, r } = g.eye;
    return { x: x - r - 2, y: y + FAR.dy - r - 2, w: FAR.dx + 2 * r + 4, h: 2 * r - FAR.dy + 4 };
  }
  const c = wheelCentre(body, spot);
  return { x: c.x - WHEEL_R, y: c.y - WHEEL_R, w: 2 * WHEEL_R, h: 2 * WHEEL_R };
}

/** A box as the four % custom properties `.bcg-at-box` places by. */
export function boxVars(b: Box): Record<`--${string}`, string> {
  return {
    "--bcg-x": `${(b.x / CAR_W) * 100}%`,
    "--bcg-y": `${(b.y / CAR_H) * 100}%`,
    "--bcg-w": `${(b.w / CAR_W) * 100}%`,
    "--bcg-h": `${(b.h / CAR_H) * 100}%`,
  };
}

/* ── The pieces ───────────────────────────────────────────────────────── */

const TYRE = { tyre: "#2F3640", tread: "#454E5A", rim: "#D3DAE2", hub: "#8C99A6", line: "#1E232A" };
const TYRE_FAR = {
  tyre: "#252A31",
  tread: "#363D47",
  rim: "#A9B3BE",
  hub: "#6E7A87",
  line: "#16191E",
};

/** One wheel: tyre, rim, hub and bolts (the bolts show it turning). */
function Wheel({
  x,
  y,
  far = false,
  spin = false,
}: {
  x: number;
  y: number;
  far?: boolean;
  spin?: boolean;
}) {
  const t = far ? TYRE_FAR : TYRE;
  return (
    <g className={`bcg-wheel ${spin ? "is-spinning" : ""}`}>
      <circle cx={x} cy={y} r={WHEEL_R} fill={t.tyre} stroke={t.line} strokeWidth="2.5" />
      <circle cx={x} cy={y} r={WHEEL_R - 4} fill="none" stroke={t.tread} strokeWidth="2" />
      <circle cx={x} cy={y} r="10.5" fill={t.rim} stroke={t.hub} strokeWidth="2" />
      <circle cx={x} cy={y} r="3.6" fill={t.hub} />
      {[0, 1, 2, 3].map((k) => (
        <circle
          key={k}
          cx={x + Math.cos((k * Math.PI) / 2) * 6.6}
          cy={y + Math.sin((k * Math.PI) / 2) * 6.6}
          r="1.5"
          fill={t.hub}
        />
      ))}
      {!far && (
        <path
          d={`M${x - 14} ${y - 9} A ${WHEEL_R - 4} ${WHEEL_R - 4} 0 0 1 ${x - 4} ${y - 16}`}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.28"
        />
      )}
    </g>
  );
}

/** The near body: paint, tail light, door seam, bumpers, highlight. */
function BodyShape({ g, paint, fill }: { g: CarGeom; paint: CarPaint; fill: string }) {
  return (
    <g>
      <path d={g.body} fill={fill} stroke={paint.line} strokeWidth="3" strokeLinejoin="round" />
      <path d={g.shine} stroke="#FFFFFF" strokeWidth="3.4" strokeLinecap="round" opacity="0.35" />
      <path
        d={g.seams}
        fill="none"
        stroke={paint.line}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
      {g.trim && (
        <path
          d={g.trim}
          fill="none"
          stroke={paint.line}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity="0.6"
        />
      )}
      <rect
        x={g.tail.x}
        y={g.tail.y}
        width={g.tail.w}
        height={g.tail.h}
        rx="2.5"
        fill="#FF6B57"
        stroke="#B83A2C"
        strokeWidth="1.5"
      />
      {g.bumpers.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={b.y}
          width={b.w}
          height={b.h}
          rx="4"
          fill="#C9D1DA"
          stroke="#7E8B98"
          strokeWidth="2"
        />
      ))}
    </g>
  );
}

/** The cabin, with the recessed frames the windows sit in. */
function RoofShape({ g, paint, fill }: { g: CarGeom; paint: CarPaint; fill: string }) {
  return (
    <g>
      <path d={g.roof} fill={fill} stroke={paint.line} strokeWidth="3" strokeLinejoin="round" />
      {g.windows.map((w, i) => (
        <path
          key={i}
          d={w}
          fill={paint.deep}
          stroke={paint.deep}
          strokeWidth="4"
          strokeLinejoin="round"
        />
      ))}
    </g>
  );
}

function WindowShapes({ g, glass }: { g: CarGeom; glass: string }) {
  return (
    <g>
      {g.windows.map((w, i) => (
        <path
          key={i}
          d={w}
          fill={glass}
          stroke="#9FD3EE"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      ))}
      {g.windows.map((_, i) => {
        // one white glint across each pane, from its own box
        const box = g.windowsBox;
        const x = box.x + ((i + 0.3) / g.windows.length) * box.w;
        return (
          <path
            key={`g${i}`}
            d={`M${x} ${box.y + box.h - 10} L${x + 9} ${box.y + 9}`}
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.6"
          />
        );
      })}
    </g>
  );
}

/** A headlight that is also an eye: the lamp, its pupil and its lid. */
function Eye({
  x,
  y,
  r,
  paint,
  mood,
  clip,
  far = false,
}: {
  x: number;
  y: number;
  r: number;
  paint: CarPaint;
  mood: CarFace;
  clip: string;
  far?: boolean;
}) {
  const shut = mood === "sleep";
  return (
    <g>
      <circle cx={x} cy={y} r={r + 1.8} fill={far ? paint.deep : paint.line} />
      <circle cx={x} cy={y} r={r} fill={far ? "#E9EEF2" : "#FFFFFF"} />
      {!shut && (
        <g>
          <circle cx={x + r * 0.28} cy={y + r * 0.08} r={r * 0.52} fill="#2B3440" />
          <circle cx={x + r * 0.42} cy={y - r * 0.12} r={r * 0.18} fill="#FFFFFF" />
        </g>
      )}
      {/* the lid: half down while asleep. Awake, it waits just above the eye
          (outside the clip, so the eye is open with no stylesheet at all) and
          car-garage.css slides it down for a blink now and then. */}
      <g clipPath={`url(#${clip})`}>
        {shut ? (
          <rect
            x={x - r - 1}
            y={y - r - 1}
            width={2 * r + 2}
            height={r + 1}
            fill={far ? paint.deep : paint.face}
          />
        ) : (
          <rect
            className="bcg-lid"
            x={x - r - 1}
            y={y - 3 * r - 3}
            width={2 * r + 2}
            height={2 * r + 2}
            fill={far ? paint.deep : paint.face}
          />
        )}
      </g>
      {shut && (
        <path
          d={`M${x - r * 0.75} ${y} Q${x} ${y + r * 0.62} ${x + r * 0.75} ${y}`}
          fill="none"
          stroke={paint.line}
          strokeWidth="2"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

/** How the car feels: eyes shut (not built yet), open, or open and smiling. */
export type CarFace = "sleep" | "awake" | "happy";

export interface CarArtProps {
  body: CarBody;
  colour: CarColourId;
  /** The parts that are on. Default: all of them. */
  on?: readonly CarSpot[];
  /** Draw the places of the missing parts as a dashed outline. */
  ghost?: boolean;
  /** Missing places that glow — where the next part goes. */
  glow?: readonly CarSpot[];
  face?: CarFace;
  /** The wheels turn. */
  driving?: boolean;
  /** Drawn over the paint and the glass but under the eyes (the car wash's
   *  mud), in car units. */
  overlay?: ReactNode;
  className?: string;
}

/**
 * The car, any parts on or off. `face="happy"` sets off the bounce (body on
 * its springs, wheels still) and the blink; `driving` turns the wheels.
 */
export const CarArt = memo(function CarArt({
  body,
  colour,
  on = ALL_SPOTS,
  ghost = false,
  glow = [],
  face = "awake",
  driving = false,
  overlay,
  className = "",
}: CarArtProps) {
  const uid = useId().replace(/:/g, "");
  const g = CAR_GEOM[body];
  const paint = paintOf(colour);
  const has = (s: CarSpot) => on.includes(s);
  const paintFill = `url(#${uid}-paint)`;
  const glass = `url(#${uid}-glass)`;
  const far = `translate(${FAR.dx} ${FAR.dy})`;
  const showWindows = has("windows") && has("roof");
  const missing = ALL_SPOTS.filter((s) => !has(s));

  return (
    <svg
      viewBox={`0 0 ${CAR_W} ${CAR_H}`}
      width="100%"
      height="100%"
      className={`bcg-car ${face === "happy" ? "is-happy" : ""} ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-paint`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={paint.light} />
          <stop offset="0.42" stopColor={paint.face} />
          <stop offset="1" stopColor={paint.deep} />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E6F6FF" />
          <stop offset="1" stopColor="#9FD6F2" />
        </linearGradient>
        <clipPath id={`${uid}-eye`}>
          <circle cx={g.eye.x} cy={g.eye.y} r={g.eye.r} />
        </clipPath>
        <clipPath id={`${uid}-eyefar`}>
          <circle cx={g.eye.x + FAR.dx} cy={g.eye.y + FAR.dy} r={g.eye.r} />
        </clipPath>
      </defs>

      {/* the shadow it stands in */}
      <ellipse cx="122" cy={GROUND_Y + 1} rx="112" ry="5.5" fill="rgba(40,30,20,0.24)" />

      {/* the far wheels, behind everything */}
      {WHEEL_SPOTS.slice(2).map(
        (s) => has(s) && <Wheel key={s} {...wheelCentre(body, s)} far spin={driving} />
      )}

      <g className="bcg-car-bob">
        {/* the far side: the car's thickness */}
        {has("body") && (
          <path
            d={g.body}
            transform={far}
            fill={paint.deep}
            stroke={paint.line}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        )}
        {has("roof") && (
          <path
            d={g.roof}
            transform={far}
            fill={paint.deep}
            stroke={paint.line}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        )}
        {has("lights") && (
          <Eye
            x={g.eye.x + FAR.dx}
            y={g.eye.y + FAR.dy}
            r={g.eye.r}
            paint={paint}
            mood={face}
            clip={`${uid}-eyefar`}
            far
          />
        )}

        {/* the near side */}
        {has("roof") && <RoofShape g={g} paint={paint} fill={paintFill} />}
        {has("body") && <BodyShape g={g} paint={paint} fill={paintFill} />}
        {showWindows && <WindowShapes g={g} glass={glass} />}
        {overlay}
        {has("lights") && (
          <Eye x={g.eye.x} y={g.eye.y} r={g.eye.r} paint={paint} mood={face} clip={`${uid}-eye`} />
        )}
        {has("body") && face !== "sleep" && (
          <path
            d={face === "happy" ? g.smile : g.flat}
            fill="none"
            stroke={paint.line}
            strokeWidth="3.6"
            strokeLinecap="round"
          />
        )}
      </g>

      {/* the near wheels, in front */}
      {WHEEL_SPOTS.slice(0, 2).map(
        (s) => has(s) && <Wheel key={s} {...wheelCentre(body, s)} spin={driving} />
      )}

      {/* the places still waiting for their part */}
      {ghost && missing.map((s) => <Ghost key={s} body={body} spot={s} lit={glow.includes(s)} />)}
    </svg>
  );
});

/** A missing part's place: its outline, dashed; glowing when it is next. */
function Ghost({ body, spot, lit }: { body: CarBody; spot: CarSpot; lit: boolean }) {
  const g = CAR_GEOM[body];
  const look = {
    className: `bcg-ghost ${lit ? "is-lit" : ""}`,
    fill: lit ? "rgba(255,236,150,0.45)" : "rgba(255,255,255,0.32)",
    stroke: lit ? "#FFC21A" : "#FFFFFF",
    strokeWidth: lit ? 3.2 : 2.4,
    strokeDasharray: "7 5",
    strokeLinejoin: "round" as const,
    strokeLinecap: "round" as const,
  };
  if (spot === "body") return <path d={g.body} {...look} />;
  if (spot === "roof") return <path d={g.roof} {...look} />;
  if (spot === "windows")
    return (
      <g>
        {g.windows.map((w, i) => (
          <path key={i} d={w} {...look} />
        ))}
      </g>
    );
  if (spot === "lights") return <circle cx={g.eye.x} cy={g.eye.y} r={g.eye.r + 1.5} {...look} />;
  const c = wheelCentre(body, spot);
  return <circle cx={c.x} cy={c.y} r={WHEEL_R - 1} {...look} />;
}

/**
 * One loose part, as it waits in the tray — drawn in the box of its place
 * on the car (`spotBox`), so it lands the same size and shape it left.
 * `withWindows` puts the glass in a loose roof (a missing roof takes its
 * windows with it).
 */
export const PartArt = memo(function PartArt({
  body,
  colour,
  kind,
  withWindows = false,
}: {
  body: CarBody;
  colour: CarColourId;
  kind: PartKind;
  withWindows?: boolean;
}) {
  const uid = useId().replace(/:/g, "");
  const g = CAR_GEOM[body];
  const paint = paintOf(colour);
  const spot: CarSpot = kind === "wheel" ? "wheel-0" : kind;
  const b = spotBox(body, spot);
  const c = wheelCentre(body, "wheel-0");
  return (
    <svg
      viewBox={`${b.x} ${b.y} ${b.w} ${b.h}`}
      width="100%"
      height="100%"
      className="bcg-part-svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-paint`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={paint.light} />
          <stop offset="0.42" stopColor={paint.face} />
          <stop offset="1" stopColor={paint.deep} />
        </linearGradient>
        <linearGradient id={`${uid}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E6F6FF" />
          <stop offset="1" stopColor="#9FD6F2" />
        </linearGradient>
        <clipPath id={`${uid}-eye`}>
          <circle cx={g.eye.x} cy={g.eye.y} r={g.eye.r} />
        </clipPath>
        <clipPath id={`${uid}-eyefar`}>
          <circle cx={g.eye.x + FAR.dx} cy={g.eye.y + FAR.dy} r={g.eye.r} />
        </clipPath>
      </defs>
      {kind === "wheel" && <Wheel x={c.x} y={c.y} />}
      {kind === "body" && (
        <g>
          <BodyShape g={g} paint={paint} fill={`url(#${uid}-paint)`} />
          <Eye x={g.eye.x} y={g.eye.y} r={g.eye.r} paint={paint} mood="sleep" clip={`${uid}-eye`} />
        </g>
      )}
      {kind === "roof" && (
        <g>
          <RoofShape g={g} paint={paint} fill={`url(#${uid}-paint)`} />
          {withWindows && <WindowShapes g={g} glass={`url(#${uid}-glass)`} />}
        </g>
      )}
      {kind === "windows" && <WindowShapes g={g} glass={`url(#${uid}-glass)`} />}
      {kind === "lights" && (
        <g>
          <Eye
            x={g.eye.x + FAR.dx}
            y={g.eye.y + FAR.dy}
            r={g.eye.r}
            paint={paint}
            mood="awake"
            clip={`${uid}-eyefar`}
            far
          />
          <Eye x={g.eye.x} y={g.eye.y} r={g.eye.r} paint={paint} mood="awake" clip={`${uid}-eye`} />
        </g>
      )}
    </svg>
  );
});
