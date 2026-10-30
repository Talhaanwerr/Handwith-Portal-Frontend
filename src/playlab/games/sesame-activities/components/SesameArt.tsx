"use client";

import { SA_COLORS } from "@games/sesame-activities/constants/content";

/**
 * Play Street Pals' own cast and props — original flat-cartoon SVG in the
 * portal's house style (soft rounded shapes, no realism), invented for this
 * game only. None of these designs, names or poses reference any existing
 * TV puppet: Percy the chick, Ruby (red, little cream horns, heart nose) and
 * Bo (blue, round ears, a hair tuft and freckles) are original characters.
 *
 * Only the things nothing shared ships are drawn here: the three pals, the
 * glossy balls, the park tree and ledge, a window, a bush, a plate and the
 * street houses. Food and animals come from the shared `Picture` (Twemoji)
 * and `AnimalArt` sets.
 */

export type PalMood = "idle" | "happy";

/** Points round an ellipse — the fuzzy outline of the two furry pals is a
 *  ring of overlapping circles. Computed once at load, never at render. */
function ring(cx: number, cy: number, rx: number, ry: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [Number((cx + rx * Math.cos(a)).toFixed(1)), Number((cy + ry * Math.sin(a)).toFixed(1))];
  });
}

const RUBY_FUR = ring(70, 96, 49, 51, 26);
const BO_FUR = ring(70, 98, 45, 53, 26);

function Eye({ x, y, r = 11 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r} ry={r * 1.15} fill="#FFFFFF" />
      <circle cx={x + 1.5} cy={y + 2} r={r * 0.5} fill="#2B2B3A" />
      <circle cx={x + 3.5} cy={y - 1} r={r * 0.2} fill="#FFFFFF" />
    </g>
  );
}

/** Percy — an original round yellow chick with a three-feather crest.
 *  `happy` opens the beak and lifts a wing. (Name kept as `BirdArt`: the
 *  Library card icon imports it.) */
export function BirdArt({ happy = false }: { happy?: boolean }) {
  return (
    <svg viewBox="0 0 140 150" className="h-full w-full" aria-hidden="true">
      {/* tail */}
      <path d="M26 104 L4 96 L12 112 L2 120 L28 118 Z" fill="#EDB321" />
      {/* legs + feet */}
      <path
        d="M56 128 V142 M84 128 V142 M48 146 L56 142 L64 146 M76 146 L84 142 L92 146"
        stroke="#F08A24"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* crest */}
      <path d="M62 36 Q54 16 64 8 Q68 22 70 34 Z" fill="#F2B823" />
      <path d="M70 34 Q70 10 82 6 Q80 22 76 36 Z" fill="#F7C62E" />
      <path d="M76 38 Q84 20 96 22 Q88 30 82 40 Z" fill="#F2B823" />
      {/* body */}
      <ellipse cx="70" cy="84" rx="50" ry="52" fill="#FAD53C" />
      <ellipse cx="72" cy="104" rx="31" ry="27" fill="#FFF1A6" />
      {/* wing */}
      {happy ? (
        <path d="M24 84 Q2 58 10 40 Q30 56 38 82 Z" fill="#F2BF2A" />
      ) : (
        <ellipse cx="28" cy="94" rx="13" ry="24" fill="#F2BF2A" transform="rotate(14 28 94)" />
      )}
      <ellipse cx="114" cy="94" rx="12" ry="22" fill="#F2BF2A" transform="rotate(-14 114 94)" />
      {/* face */}
      <Eye x={55} y={66} r={10} />
      <Eye x={85} y={66} r={10} />
      <ellipse cx="42" cy="84" rx="7" ry="4.5" fill="#FF9E7A" opacity="0.7" />
      <ellipse cx="98" cy="84" rx="7" ry="4.5" fill="#FF9E7A" opacity="0.7" />
      {happy ? (
        <g>
          <path d="M58 80 L70 72 L82 80 Z" fill="#F08A24" />
          <path d="M60 83 L70 98 L80 83 Z" fill="#E0661B" />
          <path d="M63 83 L77 83 L70 92 Z" fill="#B8323A" />
        </g>
      ) : (
        <path d="M58 80 L70 73 L82 80 L70 92 Z" fill="#F08A24" />
      )}
    </svg>
  );
}

/** Ruby — an original red furry pal: pear-round body, little cream horns,
 *  pink heart nose, one tooth. */
export function RubyArt({ mood = "idle", wave = false }: { mood?: PalMood; wave?: boolean }) {
  const body = "#E8574F";
  return (
    <svg viewBox="0 0 140 162" className="h-full w-full" aria-hidden="true">
      <ellipse cx="50" cy="150" rx="17" ry="9" fill="#B83A34" />
      <ellipse cx="90" cy="150" rx="17" ry="9" fill="#B83A34" />
      <path d="M44 50 Q36 24 48 16 Q52 32 58 44 Z" fill="#FFE2B3" />
      <path d="M96 50 Q104 24 92 16 Q88 32 82 44 Z" fill="#FFE2B3" />
      {/* arms */}
      <ellipse cx="22" cy="106" rx="11" ry="21" fill={body} transform="rotate(22 22 106)" />
      {wave ? (
        <g>
          <path
            d="M108 96 Q128 80 128 54"
            stroke={body}
            strokeWidth="19"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="128" cy="46" r="11" fill={body} />
          <circle cx="121" cy="37" r="4.5" fill={body} />
          <circle cx="129" cy="34" r="4.5" fill={body} />
          <circle cx="136" cy="38" r="4.5" fill={body} />
        </g>
      ) : (
        <ellipse cx="118" cy="106" rx="11" ry="21" fill={body} transform="rotate(-22 118 106)" />
      )}
      {RUBY_FUR.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="7.5" fill={body} />
      ))}
      <ellipse cx="70" cy="96" rx="50" ry="52" fill={body} />
      <ellipse cx="70" cy="118" rx="30" ry="26" fill="#F79A92" />
      {/* face */}
      <path
        d="M44 52 Q53 46 62 50"
        stroke="#8C2A2A"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M78 50 Q87 46 96 52"
        stroke="#8C2A2A"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <Eye x={54} y={72} r={11} />
      <Eye x={86} y={72} r={11} />
      <ellipse cx="38" cy="92" rx="7" ry="4.5" fill="#FFB0B8" opacity="0.8" />
      <ellipse cx="102" cy="92" rx="7" ry="4.5" fill="#FFB0B8" opacity="0.8" />
      <path d="M70 94 Q63 85 66 83 Q70 82 70 86 Q70 82 74 83 Q77 85 70 94 Z" fill="#FF7FA0" />
      {mood === "happy" ? (
        <g>
          <path d="M54 98 Q70 124 86 98 Z" fill="#7A2230" />
          <ellipse cx="70" cy="111" rx="8" ry="4.5" fill="#FF8A9A" />
          <rect x="66" y="98" width="8" height="6" rx="1.5" fill="#FFFFFF" />
        </g>
      ) : (
        <g>
          <path
            d="M56 100 Q70 112 84 100"
            stroke="#7A2230"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="66" y="104" width="7" height="6" rx="1.5" fill="#FFFFFF" />
        </g>
      )}
    </svg>
  );
}

/** Bo — an original blue furry pal: tall oval body, round ears, a three-hair
 *  tuft and freckles. */
export function BoArt({ mood = "idle" }: { mood?: PalMood }) {
  const body = "#4A9BEA";
  return (
    <svg viewBox="0 0 140 162" className="h-full w-full" aria-hidden="true">
      <ellipse cx="50" cy="152" rx="17" ry="8" fill="#2A6FBF" />
      <ellipse cx="90" cy="152" rx="17" ry="8" fill="#2A6FBF" />
      <circle cx="32" cy="54" r="15" fill={body} />
      <circle cx="108" cy="54" r="15" fill={body} />
      <circle cx="32" cy="54" r="8" fill="#A8D4FF" />
      <circle cx="108" cy="54" r="8" fill="#A8D4FF" />
      <path d="M62 48 Q60 30 66 24 Q68 36 70 46 Q72 28 80 22 Q80 38 76 48 Z" fill="#2F7FD6" />
      <ellipse cx="24" cy="108" rx="10" ry="20" fill={body} transform="rotate(20 24 108)" />
      <ellipse cx="116" cy="108" rx="10" ry="20" fill={body} transform="rotate(-20 116 108)" />
      {BO_FUR.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="7" fill={body} />
      ))}
      <ellipse cx="70" cy="98" rx="46" ry="54" fill={body} />
      <ellipse cx="70" cy="122" rx="27" ry="24" fill="#A8D4FF" />
      <Eye x={55} y={76} r={10.5} />
      <Eye x={85} y={76} r={10.5} />
      <g fill="#2A6FBF" opacity="0.7">
        <circle cx="38" cy="94" r="2" />
        <circle cx="44" cy="98" r="2" />
        <circle cx="36" cy="100" r="2" />
        <circle cx="102" cy="94" r="2" />
        <circle cx="96" cy="98" r="2" />
        <circle cx="104" cy="100" r="2" />
      </g>
      <ellipse cx="70" cy="92" rx="6" ry="4.5" fill="#1F4F8F" />
      {mood === "happy" ? (
        <g>
          <path d="M54 100 Q70 126 86 100 Z" fill="#173E6E" />
          <ellipse cx="70" cy="113" rx="8" ry="4.5" fill="#FF8A9A" />
          <rect x="62" y="100" width="7" height="6" rx="1.5" fill="#FFFFFF" />
          <rect x="71" y="100" width="7" height="6" rx="1.5" fill="#FFFFFF" />
        </g>
      ) : (
        <g>
          <path
            d="M56 102 Q70 114 84 102"
            stroke="#173E6E"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <rect x="62" y="105" width="6" height="5" rx="1.5" fill="#FFFFFF" />
          <rect x="72" y="105" width="6" height="5" rx="1.5" fill="#FFFFFF" />
        </g>
      )}
    </svg>
  );
}

/** A big glossy ball for Percy's matching game. */
export function GlossyBall({ colorKey }: { colorKey: string }) {
  const c = SA_COLORS[colorKey] ?? SA_COLORS.red;
  const gid = `sa-ball-${colorKey}`;
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id={gid} cx="36%" cy="30%" r="74%">
          <stop offset="0" stopColor={c.light} />
          <stop offset="0.5" stopColor={c.fill} />
          <stop offset="1" stopColor={c.edge} />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="95" rx="30" ry="4.5" fill="rgba(20,40,10,0.22)" />
      <circle cx="50" cy="50" r="43" fill={`url(#${gid})`} />
      <path
        d="M14 58 Q50 76 86 58"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="5"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx="35"
        cy="28"
        rx="13"
        ry="8"
        fill="#FFFFFF"
        opacity="0.75"
        transform="rotate(-28 35 28)"
      />
      <circle cx="56" cy="20" r="3" fill="#FFFFFF" opacity="0.6" />
    </svg>
  );
}

/** A chunky red cross for a tried-and-wrong choice. */
export function CrossMark() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
      <path
        d="M24 24 L76 76 M76 24 L24 76"
        stroke="#FFFFFF"
        strokeWidth="22"
        strokeLinecap="round"
      />
      <path
        d="M24 24 L76 76 M76 24 L24 76"
        stroke="#E5484D"
        strokeWidth="13"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The park tree Percy perches on — its long branch reaches right. Drawn
 *  on the scene set's own grid: 10 viewBox units per set unit. */
export function PerchTreeArt() {
  return (
    <svg viewBox="0 0 360 500" className="h-full w-full" aria-hidden="true">
      <path d="M40 500 Q52 380 58 250 L100 250 Q100 380 118 500 Z" fill="#9B6B43" />
      <path d="M70 500 Q76 400 78 260 L92 262 Q92 400 100 500 Z" fill="#B7835A" />
      <path
        d="M80 268 Q200 252 352 238"
        stroke="#9B6B43"
        strokeWidth="22"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M200 254 Q226 226 250 214"
        stroke="#9B6B43"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      <ellipse cx="258" cy="208" rx="22" ry="13" fill="#4FAE5A" />
      <ellipse cx="338" cy="230" rx="18" ry="11" fill="#5DBE68" />
      <circle cx="40" cy="140" r="96" fill="#4FAE5A" />
      <circle cx="140" cy="96" r="90" fill="#5DBE68" />
      <circle cx="96" cy="200" r="70" fill="#4FAE5A" />
      <circle cx="204" cy="150" r="62" fill="#5DBE68" />
      <circle cx="120" cy="70" r="46" fill="#79D17F" opacity="0.8" />
      <circle cx="60" cy="100" r="34" fill="#79D17F" opacity="0.6" />
      <g fill="#F2665A">
        <circle cx="150" cy="140" r="7" />
        <circle cx="76" cy="176" r="7" />
        <circle cx="204" cy="118" r="7" />
        <circle cx="30" cy="96" r="7" />
      </g>
    </svg>
  );
}

/** The grassy ledge Percy's balls sit on. */
export function GrassLedgeArt() {
  return (
    <svg
      viewBox="0 0 600 120"
      preserveAspectRatio="none"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M14 44 Q300 18 586 44 Q600 100 560 114 Q300 126 40 114 Q0 100 14 44 Z"
        fill="#A8744A"
      />
      <path
        d="M30 84 Q300 72 570 84 Q566 104 548 110 Q300 120 52 110 Q34 104 30 84 Z"
        fill="#8A5A36"
      />
      <g fill="#C99466" opacity="0.7">
        <ellipse cx="110" cy="80" rx="16" ry="7" />
        <ellipse cx="300" cy="92" rx="20" ry="8" />
        <ellipse cx="470" cy="78" rx="14" ry="6" />
      </g>
      <path
        d="M0 44 Q300 2 600 44 L600 52 Q585 68 570 54 Q555 70 540 56 Q520 72 500 58 Q480 72 460 58 Q440 72 420 58 Q400 72 380 58 Q360 72 340 58 Q320 72 300 58 Q280 72 260 58 Q240 72 220 58 Q200 72 180 58 Q160 72 140 58 Q120 72 100 58 Q80 72 60 58 Q45 70 30 56 Q15 68 0 52 Z"
        fill="#5DBB5D"
      />
      <path
        d="M24 38 Q300 6 576 38"
        stroke="#8FDC86"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
      />
      <g>
        <circle cx="70" cy="36" r="7" fill="#FFFFFF" />
        <circle cx="70" cy="36" r="3" fill="#F7CB3F" />
        <circle cx="540" cy="34" r="7" fill="#FFB3D1" />
        <circle cx="540" cy="34" r="3" fill="#F7CB3F" />
      </g>
    </svg>
  );
}

/** A curtained window onto a sunny day. */
export function WindowArt() {
  const gid = "sa-win-day";
  return (
    <svg viewBox="0 0 200 220" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7CC8FF" />
          <stop offset="1" stopColor="#D6F0FF" />
        </linearGradient>
      </defs>
      <rect x="28" y="16" width="144" height="176" rx="12" fill="#FFFFFF" />
      <rect x="38" y="26" width="124" height="156" rx="6" fill={`url(#${gid})`} />
      <g>
        <circle cx="126" cy="60" r="16" fill="#FFE27A" />
        <g fill="#FFFFFF">
          <ellipse cx="72" cy="112" rx="22" ry="9" />
          <circle cx="64" cy="106" r="10" />
          <circle cx="80" cy="104" r="12" />
        </g>
        <path d="M38 166 Q80 140 120 160 Q142 150 162 158 V182 H38 Z" fill="#8FD18A" />
      </g>
      <rect x="96" y="26" width="8" height="156" fill="#FFFFFF" />
      <rect x="38" y="100" width="124" height="8" fill="#FFFFFF" />
      <rect x="18" y="186" width="164" height="14" rx="5" fill="#E9DDCB" />
      <rect x="8" y="6" width="184" height="8" rx="4" fill="#A86E45" />
      <path d="M12 12 H56 Q48 90 60 196 H12 Z" fill="#B79AE8" />
      <path d="M188 12 H144 Q152 90 140 196 H188 Z" fill="#B79AE8" />
      <path
        d="M24 14 Q20 100 26 194 M44 14 Q38 100 46 194"
        stroke="#A184D8"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M176 14 Q180 100 174 194 M156 14 Q162 100 154 194"
        stroke="#A184D8"
        strokeWidth="4"
        fill="none"
      />
    </svg>
  );
}

/** A white plate a food picture sits on. */
export function PlateArt() {
  return (
    <svg viewBox="0 0 140 60" className="h-full w-full" aria-hidden="true">
      <ellipse cx="70" cy="34" rx="66" ry="24" fill="#D9CCE8" />
      <ellipse cx="70" cy="30" rx="66" ry="24" fill="#FFFFFF" />
      <ellipse cx="70" cy="30" rx="46" ry="15" fill="#F3EEF8" />
    </svg>
  );
}

/* ── The street (intro + finish backdrop) ─────────────────────────────── */

interface HouseSpec {
  x: number;
  w: number;
  h: number;
  wall: string;
  roof: string;
  door: string;
  peaked: boolean;
}

const HOUSES: readonly HouseSpec[] = [
  { x: 10, w: 200, h: 250, wall: "#F7A9A0", roof: "#D9665C", door: "#8A4AB8", peaked: true },
  { x: 222, w: 190, h: 310, wall: "#9FCBF5", roof: "#4E86C8", door: "#F2C94C", peaked: false },
  { x: 424, w: 190, h: 230, wall: "#FFE08A", roof: "#E89A3A", door: "#4E9CF0", peaked: true },
  { x: 790, w: 200, h: 280, wall: "#A8E0B8", roof: "#4FAE5A", door: "#E8574F", peaked: false },
  { x: 1002, w: 180, h: 240, wall: "#D3C1F5", roof: "#8A63C9", door: "#F59540", peaked: true },
  { x: 1236, w: 190, h: 300, wall: "#FFC9A0", roof: "#E07B3C", door: "#4FAE5A", peaked: false },
  { x: 1438, w: 160, h: 236, wall: "#9FE0E0", roof: "#3A9C9C", door: "#E8574F", peaked: true },
];

function House({ x, w, h, wall, roof, door, peaked }: HouseSpec) {
  const top = 400 - h;
  const cols = [x + w * 0.2, x + w * 0.6];
  const rows = [top + 30, top + 30 + (h - 120) / 2];
  return (
    <g>
      {peaked ? (
        <path
          d={`M${x - 10} ${top + 6} L${x + w / 2} ${top - 60} L${x + w + 10} ${top + 6} Z`}
          fill={roof}
        />
      ) : (
        <rect x={x - 8} y={top - 16} width={w + 16} height={22} rx={6} fill={roof} />
      )}
      <rect x={x} y={top} width={w} height={h} fill={wall} />
      {rows.map((ry) =>
        cols.map((cx) => (
          <g key={`${cx}-${ry}`}>
            <rect x={cx} y={ry} width={w * 0.2} height={42} rx={5} fill="#FFFFFF" />
            <rect x={cx + 4} y={ry + 4} width={w * 0.2 - 8} height={34} rx={3} fill="#CDE9FF" />
            <rect x={cx + w * 0.1 - 1.5} y={ry + 4} width={3} height={34} fill="#FFFFFF" />
          </g>
        ))
      )}
      <rect x={x + w * 0.38} y={400 - 76} width={w * 0.24} height={76} rx={10} fill={door} />
      <circle cx={x + w * 0.56} cy={400 - 38} r={4} fill="#FFF3C4" />
      <rect x={x + w * 0.32} y={396} width={w * 0.36} height={8} rx={3} fill="#E9DDCB" />
    </g>
  );
}

function StreetTree({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 9} y={300} width={18} height={100} rx={6} fill="#9B6B43" />
      <circle cx={x} cy={270} r={58} fill="#4FAE5A" />
      <circle cx={x - 30} cy={300} r={36} fill="#5DBE68" />
      <circle cx={x + 32} cy={296} r={38} fill="#5DBE68" />
      <circle cx={x - 14} cy={246} r={24} fill="#79D17F" opacity="0.7" />
    </g>
  );
}

/** The row of townhouses, trees and a lamppost that the intro and the
 *  finish stand in front of. Anchored to the ground (`xMidYMax slice`). */
export function StreetArt() {
  return (
    <svg
      viewBox="0 0 1600 400"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
      aria-hidden="true"
    >
      {HOUSES.map((h) => (
        <House key={h.x} {...h} />
      ))}
      <StreetTree x={700} />
      <StreetTree x={1206} />
      <g>
        <rect x={634} y={210} width={8} height={190} rx={4} fill="#5B5F7A" />
        <path d="M624 214 H652 L646 196 H630 Z" fill="#5B5F7A" />
        <circle cx={638} cy={216} r={8} fill="#FFE9A6" />
      </g>
    </svg>
  );
}
