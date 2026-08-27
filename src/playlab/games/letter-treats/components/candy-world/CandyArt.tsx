/**
 * Candy Land illustration system.
 *
 * Every asset in the world is drawn here, from one palette and one set of
 * drawing rules, so the trees, castle, sweets and clouds read as a single
 * piece of artwork rather than a pile of unrelated SVGs:
 *
 *   - soft, rounded silhouettes only (no corners, no sharp geometry)
 *   - one light (upper-left): every body is a lit gradient from CandyDefs,
 *     glossy sweets add a specular + sheen, everything casts a soft shadow
 *   - materials differ by finish, not by system: cotton candy is matte and
 *     fluffy, lollipops are glass-glossy, gumdrops are translucent with a
 *     sugar coat, frosting is creamy with a soft sheen
 *   - no outlines — forms separate by value, not by line
 *
 * These are illustration colours (art direction), so per GAME_DEV / tokens.ts
 * they live as a named palette next to the drawing, not as design tokens.
 *
 * All components are width-driven (`width: 100%`, intrinsic aspect ratio)
 * so CandyWorld sizes them purely from CSS.
 */

import {
  PALETTE,
  F,
  Spec,
  Sheen,
  Shade,
} from "@games/letter-treats/components/candy-world/CandyDefs";

/** The world palette - re-exported from CandyDefs so older imports keep working. */
export const CANDY = PALETTE;

const HI = "rgba(255,255,255,0.55)";

/** Picks the lit gradient for a palette colour, or falls back to the flat
 *  colour for callers passing an arbitrary hex. */
function lit(color: string): string {
  const key = (Object.keys(PALETTE) as (keyof typeof PALETTE)[]).find((k) => PALETTE[k] === color);
  return key ? F[key] : color;
}

// ── Clouds ──────────────────────────────────────────────────────────────────

/** Three marshmallow silhouettes: lit puffs on top, a soft lavender underside. */
export function Cloud({ shape = 0, tint = CANDY.white }: { shape?: 0 | 1 | 2; tint?: string }) {
  const puffs: [number, number, number][][] = [
    [
      [40, 30, 22],
      [74, 24, 24],
      [100, 36, 16],
      [22, 40, 14],
    ],
    [
      [38, 36, 19],
      [66, 26, 25],
      [98, 34, 20],
      [120, 44, 13],
      [18, 46, 11],
    ],
    [
      [30, 40, 15],
      [52, 32, 20],
      [80, 28, 23],
      [102, 42, 14],
    ],
  ];
  const w = [120, 140, 120][shape];
  const base: [number, number, number, number] = [
    [60, 42, 56, 13],
    [70, 46, 62, 13],
    [60, 48, 54, 11],
  ][shape] as [number, number, number, number];
  return (
    <svg viewBox={`0 0 ${w} 60`} className="ltw-svg">
      <ellipse cx={base[0]} cy={base[1]} rx={base[2]} ry={base[3]} fill={tint} />
      {puffs[shape].map(([x, y, r]) => (
        <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill={tint} />
      ))}
      {/* lit crowns on the two biggest puffs */}
      {puffs[shape].slice(0, 2).map(([x, y, r]) => (
        <ellipse
          key={`h${x}`}
          cx={x - r * 0.3}
          cy={y - r * 0.35}
          rx={r * 0.55}
          ry={r * 0.38}
          fill="url(#cg-spec)"
          opacity="0.7"
        />
      ))}
      {/* underside: ambient lavender shade, fades up into the white */}
      <ellipse
        cx={base[0]}
        cy={base[1] + 4}
        rx={base[2] * 0.92}
        ry={base[3] * 0.9}
        fill="url(#cg-under)"
      />
    </svg>
  );
}

// ── Ground: three rows of hills plus the winding path, in ONE drawing ──────

export function CandyGround({ path = true }: { path?: boolean }) {
  return (
    <svg
      viewBox="0 0 1200 420"
      preserveAspectRatio="xMidYMax slice"
      className="ltw-ground-svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ltw-hill-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3EDFF" />
          <stop offset="1" stopColor={CANDY.lavender} />
        </linearGradient>
        <linearGradient id="ltw-hill-mid" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#E4FBEF" />
          <stop offset="0.6" stopColor={CANDY.mint} />
          <stop offset="1" stopColor="#8FDDB9" />
        </linearGradient>
        <linearGradient id="ltw-hill-peach" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#FFEEDF" />
          <stop offset="0.6" stopColor={CANDY.peach} />
          <stop offset="1" stopColor="#FFB88F" />
        </linearGradient>
        <linearGradient id="ltw-hill-near" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor="#FFE8F1" />
          <stop offset="0.55" stopColor={CANDY.pink} />
          <stop offset="1" stopColor="#F98FBA" />
        </linearGradient>
        <linearGradient id="ltw-path" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD1E3" />
          <stop offset="1" stopColor="#FF8FBF" />
        </linearGradient>
        <linearGradient id="ltw-haze" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* far hills: palest, with atmospheric haze sitting on them */}
      <path
        d="M-20 250 C 120 140, 260 150, 380 220 C 470 270, 560 250, 640 200 C 740 140, 880 140, 980 210 C 1060 262, 1140 250, 1220 220 L1220 420 L-20 420 Z"
        fill="url(#ltw-hill-far)"
      />
      {/* haze follows the hill silhouette, so it never shows as a band */}
      <path
        d="M-20 250 C 120 140, 260 150, 380 220 C 470 270, 560 250, 640 200 C 740 140, 880 140, 980 210 C 1060 262, 1140 250, 1220 220 L1220 420 L-20 420 Z"
        fill="url(#ltw-haze)"
      />

      {/* mid hills */}
      <path
        d="M-20 310 C 80 230, 220 230, 330 290 C 400 326, 470 330, 540 316 L 540 420 L -20 420 Z"
        fill="url(#ltw-hill-mid)"
      />
      <path
        d="M 600 322 C 700 260, 860 240, 980 290 C 1070 330, 1150 330, 1220 300 L1220 420 L600 420 Z"
        fill="url(#ltw-hill-peach)"
      />
      {/* lit crowns + a soft shadow where the mid hills meet the meadow */}
      <ellipse cx="190" cy="258" rx="120" ry="22" fill={HI} />
      <ellipse cx="880" cy="278" rx="130" ry="22" fill={HI} />
      <path
        d="M-20 372 C 160 320, 330 330, 470 366 C 560 390, 660 390, 760 362 C 900 322, 1060 326, 1220 372 L1220 350 L-20 350 Z"
        fill="#6B2D5C"
        opacity="0.06"
      />

      {/* near meadow: pink frosting */}
      <path
        d="M-20 372 C 160 320, 330 330, 470 366 C 560 390, 660 390, 760 362 C 900 322, 1060 326, 1220 372 L1220 420 L-20 420 Z"
        fill="url(#ltw-hill-near)"
      />
      <ellipse cx="300" cy="352" rx="160" ry="14" fill={HI} opacity="0.7" />

      {/* winding frosting path with a cream cookie kerb and sugar sheen */}
      {path &&
        PATH_SEGMENTS.map(([d, w], i) => (
          <g key={i}>
            <path
              d={d}
              stroke="#6B2D5C"
              strokeWidth={w * 1.5}
              strokeLinecap="round"
              fill="none"
              opacity="0.08"
              transform="translate(0 4)"
            />
            <path
              d={d}
              stroke={CANDY.cream}
              strokeWidth={w * 1.45}
              strokeLinecap="round"
              fill="none"
            />
            <path d={d} stroke="url(#ltw-path)" strokeWidth={w} strokeLinecap="round" fill="none" />
            <path
              d={d}
              stroke={CANDY.white}
              strokeWidth={w * 0.3}
              strokeLinecap="round"
              fill="none"
              opacity="0.28"
              transform={`translate(0 ${-w * 0.22})`}
            />
            <path
              d={d}
              stroke={CANDY.white}
              strokeWidth={w * 0.16}
              strokeLinecap="round"
              strokeDasharray={`${w * 0.5} ${w * 0.7}`}
              opacity="0.7"
              fill="none"
            />
          </g>
        ))}
    </svg>
  );
}

const PATH_SEGMENTS: [string, number][] = [
  ["M 580 446 C 540 412, 470 380, 520 350", 46],
  ["M 520 350 C 560 328, 660 330, 690 300", 34],
  ["M 690 300 C 708 282, 690 262, 720 244", 22],
  ["M 720 244 C 740 232, 756 218, 766 206", 13],
];

// ── Castle ──────────────────────────────────────────────────────────────────

function Tower({ x, w, h, roof }: { x: number; w: number; h: number; roof: string }) {
  const r = w / 2;
  const top = 180 - h;
  const peak = top - h * 0.55 - 10;
  return (
    <g>
      {/* lit cylinder: gradient body + a shaded right third */}
      <rect x={x} y={top} width={w} height={h} rx={r * 0.35} fill={F.pinkLight} />
      <path
        d={`M${x + w * 0.62} ${top} H ${x + w} V ${top + h} H ${x + w * 0.62} Z`}
        fill="#6B2D5C"
        opacity="0.08"
      />
      <path
        d={`M${x} ${top} H ${x + w * 0.2} V ${top + h} H ${x} Z`}
        fill="#FFFFFF"
        opacity="0.35"
      />
      {/* frosting roof: dimensional swirl */}
      <path
        d={`M${x - 7} ${top + 8} Q ${x + r} ${peak} ${x + w + 7} ${top + 8} Q ${x + w * 0.75} ${top + 20} ${x + r} ${top + 12} Q ${x + w * 0.25} ${top + 20} ${x - 7} ${top + 8} Z`}
        fill={lit(roof)}
      />
      <Sheen
        d={`M${x - 4} ${top + 6} Q ${x + r} ${peak + 6} ${x + w + 4} ${top + 6} Q ${x + r} ${top + 2} ${x - 4} ${top + 6} Z`}
        opacity={0.8}
      />
      <Spec x={x + r * 0.7} y={top - h * 0.12} rx={r * 0.32} ry={r * 0.5} rotate={-30} />
      {/* shadow the roof throws on the wall */}
      <path
        d={`M${x} ${top + 8} Q ${x + r} ${top + 18} ${x + w} ${top + 8} L ${x + w} ${top + 14} Q ${x + r} ${top + 24} ${x} ${top + 14} Z`}
        fill="#6B2D5C"
        opacity="0.12"
      />
      {/* flag */}
      <rect x={x + r - 1} y={peak - 14} width="2" height="18" fill={CANDY.stick} />
      <path d={`M${x + r + 1} ${peak - 14} l 13 4 l -13 5 Z`} fill={F.strawberry} />
      {/* window: glowing vanilla with a sill */}
      <rect x={x + r - 5} y={top + h * 0.42} width="10" height="14" rx="5" fill={F.vanilla} />
      <rect
        x={x + r - 6}
        y={top + h * 0.42 + 13}
        width="12"
        height="2.5"
        rx="1.25"
        fill={CANDY.pinkDeep}
        opacity="0.5"
      />
    </g>
  );
}

export function CandyCastle() {
  return (
    <svg viewBox="0 0 220 180" className="ltw-svg">
      <Shade x={110} y={176} rx={104} ry={8} />
      <Tower x={20} w={36} h={96} roof={CANDY.lavenderDeep} />
      <Tower x={164} w={36} h={96} roof={CANDY.lavenderDeep} />
      {/* keep */}
      <rect x={56} y={84} width={108} height={96} rx="14" fill={F.pinkLight} />
      <path d="M56 84 h 20 v 96 h -20 Z" fill="#FFFFFF" opacity="0.3" />
      <path d="M130 84 h 34 v 96 h -34 Z" fill="#6B2D5C" opacity="0.07" />
      {/* frosting crown on the keep */}
      <path d="M48 92 Q110 38 172 92 Q140 82 110 86 Q80 82 48 92 Z" fill={F.pinkDeep} />
      <Sheen d="M52 88 Q110 44 168 88 Q110 72 52 88 Z" opacity={0.7} />
      <path d="M48 92 Q110 86 172 92 L172 98 Q110 92 48 98 Z" fill="#6B2D5C" opacity="0.12" />
      <Tower x={92} w={36} h={124} roof={CANDY.strawberry} />
      {/* arched door with a warm inner glow */}
      <path d="M98 180 v-26 a12 12 0 0 1 24 0 v26 Z" fill={F.chocolate} />
      <path d="M102 180 v-22 a8 8 0 0 1 16 0 v22 Z" fill="#E8B28F" />
      <path d="M102 180 v-22 a8 8 0 0 1 16 0 v22 Z" fill="url(#cg-sheen)" opacity="0.5" />
      {/* gumdrop trim along the base */}
      {[62, 78, 142, 158].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy={174} r={5} fill={i % 2 === 0 ? F.mint : F.vanilla} />
          <Spec x={x - 1.5} y={172} rx={1.8} ry={1.2} />
        </g>
      ))}
    </svg>
  );
}

// ── Trees ───────────────────────────────────────────────────────────────────

export function CottonCandyTree({
  color = CANDY.pink,
  shade = CANDY.pinkDeep,
}: {
  color?: string;
  shade?: string;
}) {
  const c = lit(color);
  return (
    <svg viewBox="0 0 100 140" className="ltw-svg">
      <Shade x={50} y={136} rx={30} ry={5} />
      <rect x="45" y="86" width="10" height="54" rx="5" fill={F.stick} />
      <path d="M45 86 h4 v54 h-4 Z" fill="#FFFFFF" opacity="0.5" />
      {/* fluffy: overlapping lit puffs, a soft shade pool at the bottom */}
      <circle cx="50" cy="54" r="40" fill={c} />
      <circle cx="24" cy="64" r="20" fill={c} />
      <circle cx="78" cy="62" r="22" fill={c} />
      <circle cx="46" cy="24" r="22" fill={c} />
      <circle cx="66" cy="34" r="16" fill={c} />
      <path d="M12 74 Q50 112 90 70 Q70 94 50 94 Q30 94 12 74 Z" fill={shade} opacity="0.45" />
      {/* matte cotton: broad soft highlight, no specular */}
      <ellipse cx="34" cy="34" rx="14" ry="10" fill="url(#cg-spec)" opacity="0.6" />
      <ellipse cx="44" cy="16" rx="7" ry="5" fill="url(#cg-spec)" opacity="0.5" />
    </svg>
  );
}

export function LollipopTree({
  a = CANDY.strawberry,
  b = CANDY.white,
}: {
  a?: string;
  b?: string;
}) {
  return (
    <svg viewBox="0 0 80 160" className="ltw-svg">
      <Shade x={40} y={156} rx={22} ry={4} />
      <rect x="36" y="72" width="8" height="88" rx="4" fill={F.stick} />
      <path d="M36 72 h3 v88 h-3 Z" fill="#FFFFFF" opacity="0.5" />
      {/* glossy disc */}
      <circle cx="40" cy="40" r="38" fill={lit(b)} />
      <path
        d="M40 2 a38 38 0 0 1 0 76 a30 30 0 0 1 0 -60 a22 22 0 0 1 0 44 a14 14 0 0 1 0 -28 a7 7 0 0 1 0 14"
        stroke={a}
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="40" cy="40" r="38" fill="none" stroke={a} strokeWidth="3" opacity="0.5" />
      {/* shade away from the light, then the glass gloss over everything */}
      <path d="M40 78 A38 38 0 0 0 78 40 A30 30 0 0 1 40 78 Z" fill="#6B2D5C" opacity="0.12" />
      <circle cx="40" cy="40" r="38" fill="url(#cg-shadow)" opacity="0.35" />
      <Sheen d="M6 30 A38 38 0 0 1 74 30 Q40 20 6 30 Z" opacity={0.85} />
      <Spec x={24} y={20} rx={9} ry={6} rotate={-30} />
    </svg>
  );
}

export function GumdropTree({
  color = CANDY.mint,
  shade = CANDY.mintDeep,
}: {
  color?: string;
  shade?: string;
}) {
  return (
    <svg viewBox="0 0 100 130" className="ltw-svg">
      <Shade x={50} y={126} rx={30} ry={5} />
      <rect x="45" y="92" width="10" height="38" rx="5" fill={F.stick} />
      {/* translucent body + sugar coat */}
      <path d="M50 8 C 18 8, 8 60, 12 96 H 88 C 92 60, 82 8, 50 8 Z" fill={lit(color)} />
      <path d="M50 8 C 18 8, 8 60, 12 96 H 88 C 92 60, 82 8, 50 8 Z" fill="url(#cg-sugar)" />
      <path d="M12 96 C 30 82, 70 82, 88 96 Z" fill={shade} opacity="0.6" />
      <path
        d="M62 10 C 80 22, 90 58, 88 96 L 72 96 C 76 60, 72 30, 62 10 Z"
        fill="#6B2D5C"
        opacity="0.08"
      />
      <Sheen d="M50 10 C 26 10, 16 40, 14 60 Q 50 40 86 60 C 84 40, 74 10, 50 10 Z" opacity={0.5} />
      <Spec x={34} y={36} rx={8} ry={13} rotate={-10} />
    </svg>
  );
}

// ── Landmarks & small sweets ───────────────────────────────────────────────

export function Peppermint({ color = CANDY.candyRed }: { color?: string }) {
  return (
    <svg viewBox="0 0 60 60" className="ltw-svg">
      <Shade x={30} y={57} rx={22} ry={3} />
      <circle cx="30" cy="30" r="28" fill={F.white} />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <path
          key={deg}
          d="M30 30 L30 2 A28 28 0 0 1 44 5.7 Z"
          fill={color}
          transform={`rotate(${deg} 30 30)`}
        />
      ))}
      <circle cx="30" cy="30" r="28" fill="url(#cg-shadow)" opacity="0.45" />
      <circle cx="30" cy="30" r="28" fill="none" stroke={CANDY.pinkLight} strokeWidth="2" />
      <Sheen d="M4 24 A28 28 0 0 1 56 24 Q30 16 4 24 Z" opacity={0.9} />
      <Spec x={19} y={15} rx={7} ry={5} rotate={-30} />
    </svg>
  );
}

export function Gumdrop({ color = CANDY.purple }: { color?: string }) {
  return (
    <svg viewBox="0 0 60 52" className="ltw-svg">
      <Shade x={30} y={49} rx={22} ry={3} />
      <path d="M30 4 C 12 4, 6 30, 8 48 H 52 C 54 30, 48 4, 30 4 Z" fill={lit(color)} />
      <path d="M30 4 C 12 4, 6 30, 8 48 H 52 C 54 30, 48 4, 30 4 Z" fill="url(#cg-sugar)" />
      <path d="M8 48 C 20 41, 40 41, 52 48 Z" fill="#6B2D5C" opacity="0.16" />
      <Spec x={20} y={17} rx={6} ry={8} rotate={-10} />
    </svg>
  );
}

export function CandyFlower({
  petal = CANDY.pink,
  center = CANDY.vanilla,
}: {
  petal?: string;
  center?: string;
}) {
  return (
    <svg viewBox="0 0 60 72" className="ltw-svg">
      <rect x="27.5" y="34" width="5" height="38" rx="2.5" fill={F.mintDeep} />
      <ellipse cx="20" cy="58" rx="9" ry="5" fill={F.mint} transform="rotate(-25 20 58)" />
      {[0, 72, 144, 216, 288].map((deg) => (
        <ellipse
          key={deg}
          cx="30"
          cy="16"
          rx="8"
          ry="12"
          fill={lit(petal)}
          transform={`rotate(${deg} 30 28)`}
        />
      ))}
      <circle cx="30" cy="28" r="8" fill={lit(center)} />
      <Spec x={27} y={25} rx={3} ry={2} />
    </svg>
  );
}

export function Cupcake({
  frosting = CANDY.pink,
  cup = CANDY.lavender,
}: {
  frosting?: string;
  cup?: string;
}) {
  const f = lit(frosting);
  return (
    <svg viewBox="0 0 60 70" className="ltw-svg">
      <Shade x={30} y={68} rx={20} ry={3} />
      {/* pleated cup */}
      <path d="M10 38 L16 70 H44 L50 38 Z" fill={lit(cup)} />
      {[16, 23, 30, 37, 44].map((x) => (
        <path
          key={x}
          d={`M${x} 38 L${x + (x - 30) * 0.18} 70`}
          stroke="#6B2D5C"
          strokeWidth="1.2"
          opacity="0.12"
        />
      ))}
      <path d="M10 38 h40 v4 H10 Z" fill="#6B2D5C" opacity="0.12" />
      {/* creamy swirl */}
      <circle cx="30" cy="30" r="18" fill={f} />
      <circle cx="18" cy="36" r="10" fill={f} />
      <circle cx="42" cy="36" r="10" fill={f} />
      <circle cx="30" cy="16" r="9" fill={f} />
      <path d="M12 40 Q30 50 48 40 Q40 46 30 46 Q20 46 12 40 Z" fill="#6B2D5C" opacity="0.12" />
      <Sheen d="M14 30 Q30 8 46 30 Q30 24 14 30 Z" opacity={0.6} />
      <Spec x={23} y={22} rx={5} ry={3.5} rotate={-25} />
      {/* cherry */}
      <circle cx="30" cy="9" r="5" fill={F.candyRed} />
      <Spec x={28} y={7} rx={1.8} ry={1.2} />
      {[
        [22, 30, F.vanilla],
        [36, 26, F.mint],
        [30, 38, F.sky],
      ].map(([x, y, c]) => (
        <rect
          key={`${x}`}
          x={x as number}
          y={y as number}
          width="5"
          height="2"
          rx="1"
          fill={c as string}
          transform={`rotate(30 ${x} ${y})`}
        />
      ))}
    </svg>
  );
}

export function CandyMushroom({ cap = CANDY.strawberry }: { cap?: string }) {
  return (
    <svg viewBox="0 0 60 56" className="ltw-svg">
      <Shade x={30} y={54} rx={14} ry={2.5} />
      <rect x="22" y="30" width="16" height="26" rx="8" fill={F.cream} />
      <path d="M4 32 C 4 10, 56 10, 56 32 Q 30 40 4 32 Z" fill={lit(cap)} />
      <path d="M4 32 Q 30 40 56 32 Q 30 44 4 32 Z" fill="#6B2D5C" opacity="0.15" />
      <Sheen d="M8 26 C 12 12, 48 12, 52 26 Q 30 22 8 26 Z" opacity={0.55} />
      {[
        [18, 22, 4],
        [36, 18, 3],
        [44, 27, 2.5],
      ].map(([x, y, r]) => (
        <circle key={x} cx={x} cy={y} r={r} fill={CANDY.white} opacity="0.92" />
      ))}
    </svg>
  );
}

export function Sparkle({ color = CANDY.white }: { color?: string }) {
  return (
    <svg viewBox="0 0 20 20" className="ltw-svg">
      <path d="M10 0 Q11 9 20 10 Q11 11 10 20 Q9 11 0 10 Q9 9 10 0 Z" fill={color} />
      <circle cx="10" cy="10" r="2.2" fill="#FFFFFF" opacity="0.9" />
    </svg>
  );
}

export function RainbowArc() {
  const bands = [
    CANDY.strawberry,
    CANDY.peach,
    CANDY.vanilla,
    CANDY.mint,
    CANDY.sky,
    CANDY.lavender,
  ];
  return (
    <svg viewBox="0 0 300 160" className="ltw-svg">
      {bands.map((c, i) => (
        <path
          key={c}
          d={`M ${12 + i * 9} 160 A ${138 - i * 9} ${138 - i * 9} 0 0 1 ${288 - i * 9} 160`}
          stroke={c}
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
      ))}
      <path
        d="M 12 160 A 138 138 0 0 1 288 160"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeOpacity="0.45"
        fill="none"
      />
    </svg>
  );
}
