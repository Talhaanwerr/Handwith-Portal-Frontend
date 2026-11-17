"use client";

import { BurjTowerArt } from "@shared/components/dubai/BurjTower";
import type { ModuleId } from "@games/burj-towers/constants/rounds";
import { starPoints } from "@games/burj-towers/components/starPoints";

/**
 * THREE TOWERS LINED UP SHORT TO TALL, on the stand over the gold ramp, on a
 * Dubai evening — Line Them Up solved, in Burj Khalifa's own tower art. The
 * round's polaroid draws it with the round's own heights; the module card
 * with three of its own, the tallest still being carried in. `heights` are
 * already in order, `gold` is which of them is gold glass. Plain SVG (one
 * <svg>, 150 × 100), `skyId` keeps its gradient's id apart from other copies.
 */
export function LinedUpScene({
  heights,
  gold,
  skyId,
  lift = false,
}: {
  heights: readonly number[];
  gold: number;
  skyId: string;
  /** The tallest is still in the air above its place (being carried in) —
   *  the module card's scene, whose moon's corner holds the polaroid. */
  lift?: boolean;
}) {
  const ground = 89;
  // the tallest tower, its spire and podium fill the picture, never more
  const unit = Math.min(11, (ground - 8) / (Math.max(...heights) + 2.2));
  return (
    <svg viewBox="0 0 150 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={skyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#36407f" />
          <stop offset="0.55" stopColor="#a8679b" />
          <stop offset="1" stopColor="#ffc287" />
        </linearGradient>
      </defs>
      <rect width="150" height="100" fill={`url(#${skyId})`} />
      {!lift && (
        <>
          <circle cx="16" cy="16" r="6" fill="#fff4cf" />
          <circle cx="19" cy="13.8" r="5.2" fill="#39437f" />
        </>
      )}
      <path d="M0 80h12v-12h9v12h11v-16h7v16h76v-13h9v13h26v20H0Z" fill="#7e6593" />
      <path d="M0 86C38 78 84 80 150 84V100H0Z" fill="#c88a73" />
      <rect x="12" y={ground} width="126" height="3.4" rx="1.2" fill="#e8c9a2" />
      <path d={`M16 ${ground + 3.4} L134 ${ground + 3.4} L134 98 Z`} fill="#f2c55c" />
      {heights.map((n, k) => {
        const up = lift && k === heights.length - 1;
        const x = 37 + k * 38;
        return (
          <g key={k}>
            {up && <ellipse cx={x} cy={ground - 0.6} rx="13" ry="1.6" fill="rgba(40,20,50,0.35)" />}
            <BurjTowerArt
              x={x}
              ground={up ? ground - 9 : ground}
              unit={unit}
              floors={n}
              time="dusk"
              gold={k === gold ? n : 0}
              spireUnits={1.5}
            />
          </g>
        );
      })}
    </svg>
  );
}

/**
 * A module in miniature for its home card and the star card. Tall or Short?
 * — a sunny day, a tall gold tower and a short silver one, the gold star
 * being carried up out of its holder on the sand onto the tall tower's spire
 * (a dotted trail behind it); Line Them Up — the evening, two towers on the
 * stand and the tallest coming down onto its place, with the little polaroid
 * of the order pinned in the corner. One SVG filling the card's picture box.
 */
export function ModuleMini({ id }: { id: ModuleId }) {
  if (id === "order")
    return (
      <span className="bjt-mini" aria-hidden="true">
        <LinedUpScene heights={[2, 3, 4]} gold={1} skyId="bjt-mini-sky-order" lift />
        <span className="bjt-mini-pol">
          <LinedUpScene heights={[2, 3, 4]} gold={1} skyId="bjt-mini-sky-pol" />
        </span>
      </span>
    );
  const sky = "bjt-mini-sky-tallshort";
  return (
    <span className="bjt-mini" aria-hidden="true">
      <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7cc0ec" />
            <stop offset="0.7" stopColor="#cfe9f7" />
            <stop offset="1" stopColor="#fbe3bd" />
          </linearGradient>
        </defs>
        <rect width="160" height="100" fill={`url(#${sky})`} />
        <circle cx="132" cy="20" r="8" fill="#ffe27a" />
        <path d="M0 80h14v-12h10v12h12v-18h8v18h80v-14h10v14h26v20H0Z" fill="#b4c6da" />
        <path d="M0 86C40 78 90 80 160 84V100H0Z" fill="#e9c48a" />
        <BurjTowerArt x={42} ground={95} unit={11} floors={5} gold={5} spireUnits={1.5} />
        <BurjTowerArt x={124} ground={95} unit={11} floors={2} spireUnits={1.5} />
        {/* the holder on the sand, and the star's way up to the spire */}
        <rect x="74" y="88" width="20" height="5" rx="1.6" fill="#e8c9a2" />
        <rect x="74" y="92" width="20" height="2" rx="1" fill="#b98f62" />
        <path
          d="M84 82 Q 82 42 52 24"
          fill="none"
          stroke="#fff"
          strokeWidth="1.8"
          strokeDasharray="0.2 4.4"
          strokeLinecap="round"
        />
        <polygon
          points={starPoints(42, 19, 10)}
          fill="#ffd34d"
          stroke="#e09a14"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
