"use client";

import { memo, useId, type ReactNode } from "react";
import type { Sock, SockColour, SockPattern } from "@games/sock-case/constants/rounds";

/**
 * THE SOCK CASE'S PROPS — the only things this game draws, because nothing
 * in the portal had them: a sock (a colour and a pattern), a wooden clothes
 * peg, a laundry basket and the detective's magnifying glass. All in the
 * portal's chunky, soft-shaded language: no black outlines (a darker shade of
 * the fill instead), light from the upper left, and a solid darker copy of
 * each shape just under it for the 3D edge. Every drawing fills its box.
 */

/** A sock's paint: its body, the lit and shaded sides, the 3D edge, and the
 *  colour its pattern is printed in. */
export const SOCK_PAINT: Record<
  SockColour,
  { face: string; light: string; shade: string; edge: string; ink: string }
> = {
  red: { face: "#E5484D", light: "#FF8F92", shade: "#C2383D", edge: "#962A2E", ink: "#FFFFFF" },
  orange: { face: "#F08A24", light: "#FFBA6B", shade: "#CF6F12", edge: "#9E520B", ink: "#FFFFFF" },
  yellow: { face: "#F7C93E", light: "#FFE68F", shade: "#E0AA1F", edge: "#A9790C", ink: "#B97508" },
  green: { face: "#3DAB72", light: "#82D9A9", shade: "#2B8A57", edge: "#1D6640", ink: "#FFFFFF" },
  blue: { face: "#2E7FD6", light: "#78B6F5", shade: "#1F64AE", edge: "#154A84", ink: "#FFFFFF" },
  purple: { face: "#8E5BD9", light: "#BD9CF2", shade: "#7041BA", edge: "#522F8C", ink: "#FFFFFF" },
  pink: { face: "#FF7EA8", light: "#FFB8CF", shade: "#E95C8B", edge: "#B83F69", ink: "#FFFFFF" },
};

/** The sock's outline, in its 80 × 110 box: a ribbed cuff on top, the leg,
 *  a round heel bottom-left and the foot pointing right. */
const SOCK =
  "M16 14 Q16 6 24 6 H48 Q56 6 56 14 V58 Q56 64 61 67 L70 72 Q80 78 78 89 Q75 102 62 101 L34 97 Q16 95 16 76 Z";
const CUFF = "M16 14 Q16 6 24 6 H48 Q56 6 56 14 V21 H16 Z";

/** Where the big motifs (stars, hearts) sit: three down the leg, two on the foot. */
const MOTIFS: readonly [number, number][] = [
  [28, 33],
  [45, 46],
  [28, 61],
  [50, 82],
  [69, 88],
];
/** The small dots: a staggered grid, clipped to the sock. */
const DOTS: readonly [number, number][] = [24, 37, 50, 63, 76, 89].flatMap((y, row) =>
  (row % 2 ? [32, 48, 64, 80] : [24, 40, 56, 72]).map((x) => [x, y] as [number, number])
);

function starPath(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let k = 0; k < 10; k++) {
    const a = -Math.PI / 2 + (k * Math.PI) / 5;
    const rr = k % 2 ? r * 0.46 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
}

function heartPath(cx: number, cy: number, s: number): string {
  const p = (x: number, y: number) => `${(cx + x * s).toFixed(1)} ${(cy + y * s).toFixed(1)}`;
  return `M${p(0, 0.42)} C${p(-0.95, -0.12)} ${p(-0.42, -0.82)} ${p(0, -0.3)} C${p(0.42, -0.82)} ${p(0.95, -0.12)} ${p(0, 0.42)} Z`;
}

const STARS = MOTIFS.map(([x, y]) => starPath(x, y, 8.2)).join(" ");
const HEARTS = MOTIFS.map(([x, y]) => heartPath(x, y, 15)).join(" ");
const STRIPES = [25, 39, 53, 67, 81, 95];
const ZIGZAGS = [30, 52, 74, 94].map((y) => {
  const pts = Array.from({ length: 11 }, (_, k) => `${k * 9} ${k % 2 ? y + 7 : y}`);
  return `M${pts.join(" L")}`;
});

function Pattern({ pattern, ink }: { pattern: SockPattern; ink: string }) {
  switch (pattern) {
    case "stripes":
      return (
        <g fill={ink} opacity="0.92">
          {STRIPES.map((y) => (
            <rect key={y} x="0" y={y} width="80" height="7" />
          ))}
        </g>
      );
    case "zigzag":
      return (
        <g
          fill="none"
          stroke={ink}
          strokeWidth="5"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity="0.92"
        >
          {ZIGZAGS.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      );
    case "dots":
      return (
        <g fill={ink} opacity="0.92">
          {DOTS.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3.6" />
          ))}
        </g>
      );
    case "stars":
      return <path d={STARS} fill={ink} opacity="0.95" />;
    case "hearts":
      return <path d={HEARTS} fill={ink} opacity="0.95" />;
    default:
      return null;
  }
}

/** One sock, filling its box (80 × 110). Pass `x`/`y`/`width`/`height` to
 *  place it inside another drawing (the magnifying glass, the icon). */
export const SockArt = memo(function SockArt({
  sock,
  x,
  y,
  width,
  height,
}: {
  sock: Sock;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const paint = SOCK_PAINT[sock.colour];
  const clip = `${uid}-clip`;
  const body = `${uid}-body`;
  return (
    <svg
      viewBox="0 0 80 110"
      // placed inside another drawing, its own x/y/width/height place it
      // (the class would size it to its parent instead)
      className={width === undefined ? "skc-sock-art" : undefined}
      x={x}
      y={y}
      width={width}
      height={height}
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clip}>
          <path d={SOCK} />
        </clipPath>
        <linearGradient id={body} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={paint.light} />
          <stop offset="0.42" stopColor={paint.face} />
          <stop offset="1" stopColor={paint.shade} />
        </linearGradient>
      </defs>
      {/* the solid edge under it — the chunky 3D look */}
      <path d={SOCK} transform="translate(1.6 3.6)" fill={paint.edge} />
      <path d={SOCK} fill={`url(#${body})`} />
      <g clipPath={`url(#${clip})`}>
        <Pattern pattern={sock.pattern} ink={paint.ink} />
        {/* heel and toe, a shade deeper, as on a real sock */}
        <circle cx="19" cy="93" r="13" fill={paint.shade} />
        <circle cx="77" cy="95" r="13.5" fill={paint.shade} />
        <path
          d="M6 82 Q24 86 30 106"
          fill="none"
          stroke={paint.edge}
          strokeWidth="1.6"
          opacity="0.35"
        />
      </g>
      {/* the ribbed cuff */}
      <path d={CUFF} fill={paint.light} />
      <g stroke={paint.shade} strokeWidth="1.7" strokeLinecap="round" opacity="0.55">
        {[22, 28, 34, 40, 46, 51].map((cx) => (
          <path key={cx} d={`M${cx} 9 V19`} />
        ))}
      </g>
      <path d="M16 21 H56" stroke={paint.shade} strokeWidth="1.8" opacity="0.7" />
      {/* light down the leg, then the outline in its own darker shade */}
      <path d="M22 27 V62" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity="0.32" />
      <path d={SOCK} fill="none" stroke={paint.edge} strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
});

/** A wooden clothes peg with its spring, in a 20 × 40 box; the rope crosses
 *  it at about a third of the way down. */
export function PegArt() {
  return (
    <svg viewBox="0 0 20 40" className="skc-peg-art" aria-hidden="true">
      <rect x="2.6" y="2.4" width="7.6" height="37" rx="3.4" fill="#B97E48" />
      <rect x="9.8" y="2.4" width="7.6" height="37" rx="3.4" fill="#B97E48" />
      <rect x="2" y="0.6" width="7.6" height="36" rx="3.4" fill="#F0C48A" />
      <rect x="10.4" y="0.6" width="7.6" height="36" rx="3.4" fill="#E2AE6E" />
      <path d="M4.4 4 V18" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
      <rect x="0.6" y="15" width="18.8" height="6" rx="3" fill="#7D8A98" />
      <rect x="0.6" y="14.4" width="18.8" height="4.4" rx="2.2" fill="#B9C4CF" />
    </svg>
  );
}

/** The laundry basket, seen from the front (240 × 110): blue plastic with
 *  rows of holes, a rim and two hand holds. */
export const BasketArt = memo(function BasketArt() {
  const uid = useId().replace(/:/g, "");
  const body = `${uid}-basket`;
  return (
    <svg
      viewBox="0 0 240 110"
      className="skc-basket-svg"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FCBEA" />
          <stop offset="1" stopColor="#3C9DCA" />
        </linearGradient>
      </defs>
      {/* the inside, dark, above the rim's back */}
      <rect x="12" y="4" width="216" height="20" rx="9" fill="#24739A" />
      {/* the edge under it, then the body */}
      <path d="M12 22 H228 L213 102 Q211 110 201 110 H39 Q29 110 27 102 Z" fill="#1F6A8E" />
      <path d="M12 18 H228 L213 98 Q211 106 201 106 H39 Q29 106 27 98 Z" fill={`url(#${body})`} />
      <g fill="#2A83AE" opacity="0.75">
        {[44, 68, 92, 116, 140, 164, 188].map((x) => (
          <rect key={`a${x}`} x={x} y="40" width="13" height="16" rx="6.5" />
        ))}
        {[56, 80, 104, 128, 152, 176].map((x) => (
          <rect key={`b${x}`} x={x} y="68" width="13" height="16" rx="6.5" />
        ))}
      </g>
      {/* the rim, its light and the hand holds */}
      <rect x="4" y="12" width="232" height="18" rx="9" fill="#2F8DBB" />
      <rect x="4" y="9" width="232" height="17" rx="8.5" fill="#A8E0F6" />
      <path
        d="M16 13.5 H224"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.6"
      />
      <rect x="20" y="34" width="30" height="9" rx="4.5" fill="#24739A" />
      <rect x="190" y="34" width="30" height="9" rx="4.5" fill="#24739A" />
    </svg>
  );
});

/** A folded towel lying in the basket — what shows when no sock does: a
 *  mint towel with white stripes at its ends, folded over twice. */
export function TowelArt() {
  return (
    <svg viewBox="0 0 120 44" className="skc-towel-svg" aria-hidden="true">
      <rect x="10" y="20" width="100" height="24" rx="7" fill="#4FAE8E" />
      <rect x="10" y="17" width="100" height="23" rx="7" fill="#8FD3C1" />
      <rect x="16" y="4" width="88" height="20" rx="7" fill="#4FAE8E" />
      <rect x="16" y="2" width="88" height="19" rx="7" fill="#A6E9CB" />
      <g fill="#FFFFFF" opacity="0.9">
        <rect x="26" y="2" width="5" height="19" />
        <rect x="35" y="2" width="5" height="19" />
        <rect x="80" y="2" width="5" height="19" />
        <rect x="89" y="2" width="5" height="19" />
      </g>
      <path d="M24 7 H96" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
      <path d="M18 30 H102" stroke="#6FC3A8" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** The lens's centre and radius in the glass's 140 × 140 box — where the
 *  glass is pinned over the sock it looks at. */
export const LENS = { x: 58, y: 58, r: 40 } as const;

/**
 * The detective's magnifying glass (140 × 140): a brass ring, a wooden
 * handle, a glint on the glass — and whatever it looks at, drawn bigger
 * inside the lens (`children`, an SVG element in the box's own units).
 */
export function MagnifierArt({ children }: { children?: ReactNode }) {
  const uid = useId().replace(/:/g, "");
  const lens = `${uid}-lens`;
  return (
    <svg viewBox="0 0 140 140" className="skc-glass-svg" aria-hidden="true">
      <defs>
        <clipPath id={lens}>
          <circle cx={LENS.x} cy={LENS.y} r={LENS.r} />
        </clipPath>
      </defs>
      {/* the handle: its dark edge, the wood, a brass collar */}
      <path d="M90 92 L126 128" stroke="#54321A" strokeWidth="21" strokeLinecap="round" />
      <path d="M90 90 L124 124" stroke="#9A6534" strokeWidth="16" strokeLinecap="round" />
      <path d="M96 92 L120 116" stroke="#C08A4F" strokeWidth="4" strokeLinecap="round" />
      <path d="M86 86 L96 96" stroke="#A56E1C" strokeWidth="21" />
      <path d="M86 85 L95 94" stroke="#F2C14E" strokeWidth="17" />
      {/* the glass and what it shows */}
      <circle cx={LENS.x} cy={LENS.y} r={LENS.r} fill="#F2FAFF" />
      <g clipPath={`url(#${lens})`}>{children}</g>
      <circle cx={LENS.x} cy={LENS.y} r={LENS.r} fill="#BFE6FF" opacity="0.16" />
      <path
        d="M30 46 A30 30 0 0 1 50 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.85"
      />
      {/* the brass ring, with its darker edge under it */}
      <circle
        cx={LENS.x}
        cy={LENS.y + 2}
        r={LENS.r + 6}
        fill="none"
        stroke="#A56E1C"
        strokeWidth="13"
      />
      <circle
        cx={LENS.x}
        cy={LENS.y}
        r={LENS.r + 6}
        fill="none"
        stroke="#F2C14E"
        strokeWidth="12"
      />
      <circle
        cx={LENS.x}
        cy={LENS.y}
        r={LENS.r + 9}
        fill="none"
        stroke="#FFE7A3"
        strokeWidth="2.4"
        strokeDasharray="34 220"
        strokeDashoffset="-150"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** The magnifying glass over a sock, the sock 1.35× its size in the lens. */
export function GlassOver({ sock }: { sock: Sock }) {
  const w = 82;
  const h = (w * 110) / 80;
  return (
    <MagnifierArt>
      <SockArt sock={sock} x={LENS.x - w / 2} y={LENS.y - h / 2} width={w} height={h} />
    </MagnifierArt>
  );
}
