"use client";

import { memo } from "react";
import { F, Shade, Spec } from "@games/letter-treats/components/candy-world/CandyDefs";
import { FISH_PAINT, type FishHue } from "@games/feed-the-fish/constants/rounds";

/**
 * Feed the Fish's own pieces — a chunky fish in any colour whose mouth
 * opens and whose eyes close, a food flake, a seaweed clump and a heart —
 * because the portal has no fish that can eat or sleep. Drawn in Letter
 * Treats' language (lit `CandyDefs` gradients, mounted once by the root;
 * a specular spot; no outlines) so they swim beside its turtle, octopus
 * and jellyfish. Each fills its box; the stylesheet sizes and moves it.
 */

export type FishMood = "hungry" | "eat" | "full" | "asleep" | "content";

/** A fish facing RIGHT, in 120 × 84. Its mouth is at (104, 47). */
export const FishArt = memo(function FishArt({ hue, mood }: { hue: FishHue; mood: FishMood }) {
  const [body, fin] = FISH_PAINT[hue];
  const open = mood === "hungry" || mood === "eat";
  const shut = mood === "asleep";
  return (
    <svg viewBox="0 0 120 84" aria-hidden="true">
      <Shade x={60} y={80} rx={34} ry={3.5} />
      {/* tail and fins behind the body */}
      <path className="ftf-tail" d="M30 42 L5 18 Q-1 42 5 66 Z" fill={F[fin]} />
      <path d="M44 20 Q60 0 82 15 L76 24 Z" fill={F[fin]} />
      <path d="M58 70 Q66 82 78 74 L70 64 Z" fill={F[fin]} />
      {/* the body */}
      <ellipse cx="64" cy="44" rx="42" ry="29" fill={F[body]} />
      <ellipse cx="68" cy="57" rx="28" ry="12" fill="#FFFFFF" opacity="0.28" />
      <path
        d="M44 30 Q50 44 44 58 M54 27 Q61 44 54 61"
        stroke="#FFFFFF"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
        opacity="0.3"
      />
      <ellipse cx="60" cy="50" rx="10" ry="6" fill={F[fin]} transform="rotate(-24 60 50)" />
      {/* face */}
      {shut ? (
        <path
          d="M76 37 Q83 43 90 37"
          stroke="#3D3D5C"
          strokeWidth="3.4"
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <>
          <circle cx="83" cy="35" r="9.5" fill="#FFFFFF" />
          <circle cx="85" cy="35.5" r="5.4" fill="#3D3D5C" />
          <circle cx="87" cy="33" r="1.9" fill="#FFFFFF" />
        </>
      )}
      <circle cx="90" cy="52" r="4.5" fill="#FF8FB0" opacity="0.55" />
      {open ? (
        <g className="ftf-mouth">
          <ellipse cx="102" cy="48" rx="5.6" ry="7" fill="#7A2E46" />
          <ellipse cx="102" cy="51" rx="3.4" ry="3" fill="#E86A86" />
        </g>
      ) : (
        <path
          d="M95 49 Q100 54 105 48"
          stroke="#3D3D5C"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      )}
      <Spec x={52} y={28} rx={11} ry={5} rotate={-12} />
    </svg>
  );
});

/** A food flake. */
export function FlakeArt() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 9 Q7 3 13 4 Q20 4 20 10 Q22 16 16 19 Q10 22 6 17 Q2 13 5 9 Z" fill={F.orange} />
      <path d="M8 9 Q11 7 14 9" stroke="#FFFFFF" strokeWidth="2" fill="none" opacity="0.6" />
      <circle cx="15" cy="14" r="1.6" fill={F.orangeDeep} />
    </svg>
  );
}

/** A seaweed clump: three fronds, each swaying from its root. */
export const SeaweedArt = memo(function SeaweedArt() {
  return (
    <svg viewBox="0 0 60 130" aria-hidden="true">
      <path
        className="ftf-frond ftf-frond--a"
        d="M18 130 C6 104 26 88 12 62 C2 42 18 24 14 6 C24 22 22 44 28 62 C36 88 22 104 28 130 Z"
        fill={F.greenDeep}
      />
      <path
        className="ftf-frond ftf-frond--b"
        d="M30 130 C24 100 42 86 34 56 C30 38 40 22 42 10 C48 26 44 42 46 58 C50 88 36 102 40 130 Z"
        fill={F.green}
      />
      <path
        className="ftf-frond ftf-frond--c"
        d="M40 130 C38 112 54 100 50 80 C48 68 54 56 58 48 C60 62 58 72 60 84 C62 104 50 114 50 130 Z"
        fill={F.mintDeep}
      />
    </svg>
  );
});

export function HeartArt() {
  return (
    <svg viewBox="0 0 40 36" aria-hidden="true">
      <path
        d="M20 34 C8 25 2 18 2 11 C2 5 7 1 12 1 C16 1 18.5 3.5 20 6 C21.5 3.5 24 1 28 1 C33 1 38 5 38 11 C38 18 32 25 20 34 Z"
        fill="#FF5C8A"
      />
      <ellipse cx="11" cy="9" rx="4" ry="3" fill="#FFFFFF" opacity="0.55" />
    </svg>
  );
}
