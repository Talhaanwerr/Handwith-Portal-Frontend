"use client";

import { memo } from "react";
import type { BurjTime } from "@shared/components/dubai/BurjTower";

/**
 * DUBAI — the backdrop for the Burj Khalifa games. Reusable as it is:
 *
 *   <DubaiWorld time="day" />   sunny blue sky, soft clouds, a high sun
 *   <DubaiWorld time="dusk" />  a calm violet-to-gold evening, the sun low
 *                               behind the city, the first stars, lit windows
 *   <DubaiWorld time="night" /> deep blue night, crescent moon, stars
 *
 * It fills its positioned parent (`position: absolute; inset: 0`) and sits
 * behind everything; nothing in it moves or takes taps. Layers, back to
 * front: the sky, the sun or moon, a low skyline of distant buildings (the
 * Dubai Frame, the Emirates Towers, a twisting tower, a mosque, the Burj Al
 * Arab's sail, the Museum of the Future's ring), a soft haze on the horizon,
 * rolling desert dunes, and two date palms at the edges. Every layer is sized
 * in the stage's container units, so the horizon is always the same height
 * above the sand whatever the screen. The tower itself is not part of the
 * world — stand `BurjTower` pieces in front of it.
 *
 * Styles: `shared/styles/dubai.css` (`bjk-world…`). SVG ids
 * carry the time, so two worlds of different times can share a page.
 */
export const DubaiWorld = memo(function DubaiWorld({ time = "day" }: { time?: BurjTime }) {
  return (
    <div className={`bjk-world bjk-world--${time}`} aria-hidden="true">
      <Sky time={time} />
      <span className="bjk-world-sun" />
      <Skyline time={time} />
      <span className="bjk-world-haze" />
      <Dunes />
      <span className="bjk-world-palm bjk-world-palm--l">
        <Palm />
      </span>
      <span className="bjk-world-palm bjk-world-palm--r">
        <Palm />
      </span>
    </div>
  );
});

/* ── The sky: clouds by day, streaks at dusk, stars at night ────────────── */

const CLOUDS: readonly (readonly [number, number, number, number])[][] = [
  [
    [300, 180, 90, 32],
    [372, 162, 70, 40],
    [440, 184, 80, 28],
  ],
  [
    [1150, 118, 78, 26],
    [1212, 102, 60, 34],
    [1274, 120, 70, 24],
  ],
  [
    [760, 262, 58, 18],
    [806, 250, 44, 24],
    [848, 264, 50, 16],
  ],
];
const STREAKS: readonly (readonly [number, number, number])[] = [
  [380, 330, 230],
  [1180, 280, 260],
  [820, 410, 180],
  [1460, 400, 150],
];
/** Fixed star positions (x, y, r) — never random, so every render matches. */
const STARS: readonly (readonly [number, number, number])[] = [
  [90, 60, 2.6],
  [210, 140, 1.8],
  [330, 50, 2.2],
  [420, 210, 1.6],
  [540, 90, 2.8],
  [650, 30, 1.8],
  [700, 170, 2],
  [820, 70, 2.4],
  [930, 140, 1.6],
  [1010, 40, 2.2],
  [1100, 200, 1.8],
  [1190, 80, 2.8],
  [1300, 150, 1.6],
  [1380, 50, 2.2],
  [1480, 120, 2],
  [1550, 230, 1.6],
  [160, 280, 1.6],
  [600, 300, 1.4],
  [1260, 300, 1.4],
  [1000, 330, 1.2],
];

function Sky({ time }: { time: BurjTime }) {
  return (
    <svg className="bjk-world-sky" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
      {time === "day" &&
        CLOUDS.map((c, i) => (
          <g key={i} className="bjk-world-cloud">
            {c.map(([cx, cy, rx, ry]) => (
              <ellipse key={cx} cx={cx} cy={cy} rx={rx} ry={ry} />
            ))}
          </g>
        ))}
      {time === "dusk" &&
        STREAKS.map(([cx, cy, rx]) => (
          <ellipse key={cx} className="bjk-world-streak" cx={cx} cy={cy} rx={rx} ry={9} />
        ))}
      {time !== "day" &&
        STARS.map(([cx, cy, r]) => (
          <circle
            key={`${cx}-${cy}`}
            className="bjk-world-star"
            cx={cx}
            cy={cy}
            r={r}
            opacity={time === "dusk" ? (cy < 160 ? 0.7 : 0) : 0.9}
          />
        ))}
    </svg>
  );
}

/* ── The skyline (viewBox 2400 × 300, standing on y = 300) ──────────────── */

type Cap = "flat" | "spike" | "round" | "step";
const FAR: readonly (readonly [number, number, number, Cap?])[] = [
  [0, 90, 90],
  [80, 60, 140],
  [150, 110, 70],
  [250, 50, 170, "spike"],
  [310, 90, 110],
  [410, 70, 150, "round"],
  [490, 120, 80],
  [620, 60, 190, "step"],
  [690, 100, 100],
  [800, 80, 130],
  [890, 60, 160, "spike"],
  [960, 140, 85],
  [1110, 70, 140, "round"],
  [1190, 90, 105],
  [1290, 60, 175, "step"],
  [1360, 120, 90],
  [1490, 70, 130],
  [1570, 50, 185, "spike"],
  [1630, 110, 95],
  [1750, 80, 150, "round"],
  [1840, 90, 110],
  [1940, 60, 165, "step"],
  [2010, 120, 85],
  [2140, 70, 140],
  [2220, 90, 100, "spike"],
  [2320, 80, 125],
];

/** One building's outline, from its foot at (x, 300). */
function block(x: number, w: number, h: number, cap: Cap = "flat"): string {
  const y = 300 - h;
  const r = x + w;
  switch (cap) {
    case "round":
      return `M${x} 300V${y + w / 2}A${w / 2} ${w / 2} 0 0 1 ${r} ${y + w / 2}V300Z`;
    case "step":
      return `M${x} 300V${y + 22}H${x + w * 0.2}V${y}H${x + w * 0.8}V${y + 22}H${r}V300Z`;
    case "spike": {
      const c = x + w / 2;
      return `M${x} 300V${y}H${c - 3}V${y - 34}H${c + 3}V${y}H${r}V300Z`;
    }
    default:
      return `M${x} 300V${y}H${r}V300Z`;
  }
}
const FAR_PATH = FAR.map(([x, w, h, cap]) => block(x, w, h, cap)).join("");

/** Nearer towers with rows of windows. */
const NEAR_WINDOWED: readonly string[] = [
  block(0, 60, 120),
  block(80, 70, 170, "step"),
  block(170, 70, 100),
  block(420, 50, 200, "step"),
  // the Emirates Towers: two slanted tops
  "M520 300V105L566 55V300Z",
  "M582 300V140L616 102V300Z",
  block(650, 70, 130, "round"),
  block(760, 80, 150),
  block(860, 70, 110),
  block(950, 60, 170, "spike"),
  block(1030, 70, 120),
  // a tower that twists as it rises
  "M1140 300C1135 230 1149 170 1142 72H1190C1197 170 1183 230 1190 300Z",
  block(1690, 60, 210, "step"),
  block(1930, 70, 160),
  block(2020, 70, 120, "round"),
  block(2110, 60, 190, "spike"),
  block(2200, 90, 100),
  block(2310, 90, 140),
];

/** Landmarks drawn plain (no window rows). */
const NEAR_PLAIN: readonly string[] = [
  // the Dubai Frame
  "M262 300V112H380V300H352V140H290V300Z",
  // a mosque: hall, big dome and finial, two small domes, two minarets
  "M1258 300V252H1404V300Z",
  "M1290 252C1290 206 1372 206 1372 252Z",
  "M1328 214H1334V196H1328Z",
  "M1262 252C1262 234 1290 234 1290 252Z",
  "M1372 252C1372 234 1400 234 1400 252Z",
  "M1238 300V150L1245 128L1252 150V300Z",
  "M1410 300V150L1417 128L1424 150V300Z",
  // the Burj Al Arab: mast, sail, island
  "M1500 300V62H1508V300Z",
  "M1508 84C1598 112 1650 200 1640 300H1508Z",
  "M1466 300C1490 288 1662 288 1684 300Z",
  // the Museum of the Future: a ring on its mound
  "M1793 250A52 46 0 1 1 1897 250A52 46 0 1 1 1793 250ZM1826 246A21 19 0 1 0 1868 246A21 19 0 1 0 1826 246Z",
  "M1778 300C1800 284 1890 284 1912 300Z",
];

function Skyline({ time }: { time: BurjTime }) {
  const win = `bjk-world-win-${time}`;
  return (
    <svg className="bjk-world-skyline" viewBox="0 0 2400 300" preserveAspectRatio="xMidYMax slice">
      <defs>
        <pattern id={win} width="16" height="20" patternUnits="userSpaceOnUse">
          <rect className="bjk-world-window" x="5" y="5" width="6" height="8" rx="1" />
        </pattern>
      </defs>
      <path className="bjk-world-far" d={FAR_PATH} />
      <g className="bjk-world-near">
        {NEAR_WINDOWED.map((d) => (
          <path key={d} d={d} />
        ))}
        {NEAR_PLAIN.map((d) => (
          <path key={d} d={d} fillRule="evenodd" />
        ))}
      </g>
      <g fill={`url(#${win})`}>
        {NEAR_WINDOWED.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

/* ── The desert: three dunes with ripples (stretched to the stage width) ── */

function Dunes() {
  return (
    <svg className="bjk-world-sand" viewBox="0 0 1600 200" preserveAspectRatio="none">
      <path
        className="bjk-world-dune1"
        d="M0 62C200 30 420 26 640 52C860 78 1060 40 1260 34C1420 30 1520 46 1600 58V200H0Z"
      />
      <path
        className="bjk-world-dune2"
        d="M0 112C180 84 380 80 560 100C760 122 980 90 1180 86C1360 82 1500 98 1600 108V200H0Z"
      />
      <path
        className="bjk-world-dune3"
        d="M0 152C260 128 520 132 760 148C1000 164 1260 138 1600 140V200H0Z"
      />
      <g className="bjk-world-ripple">
        <path d="M120 174C220 166 320 168 420 174" />
        <path d="M900 180C1000 172 1120 172 1220 178" />
        <path d="M560 191C640 185 720 185 800 191" />
        <path d="M1320 190C1390 185 1460 185 1530 190" />
      </g>
    </svg>
  );
}

/* ── A date palm ─────────────────────────────────────────────────────────── */

function Palm() {
  return (
    <svg viewBox="0 0 120 200" preserveAspectRatio="xMidYMax meet">
      <path className="bjk-palm-trunk" d="M62 198C57 160 52 118 60 72" />
      <g className="bjk-palm-rings">
        <path d="M54 180h12M53 160h12M53 140h11M54 120h11M56 100h10M58 84h8" />
      </g>
      <g className="bjk-palm-leaf">
        <path d="M60 68C40 50 18 52 2 66C20 60 38 62 60 74Z" />
        <path d="M60 68C44 40 30 28 10 26C30 36 44 50 58 74Z" />
        <path d="M60 68C62 40 74 22 92 16C80 30 70 46 62 74Z" />
        <path d="M60 68C80 52 102 52 118 64C100 60 82 62 62 76Z" />
        <path d="M60 70C76 72 96 86 104 106C90 92 74 84 60 76Z" />
        <path d="M60 70C44 74 26 88 18 108C32 94 46 84 60 76Z" />
      </g>
      <g className="bjk-palm-dates">
        <circle cx="56" cy="78" r="4" />
        <circle cx="64" cy="79" r="4" />
        <circle cx="60" cy="84" r="3.6" />
      </g>
    </svg>
  );
}
