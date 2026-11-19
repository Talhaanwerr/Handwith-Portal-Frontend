"use client";

import { memo } from "react";

/** What Munch's face is doing. */
export type Face = "idle" | "munch" | "yuck" | "bite";

const INK = "#3B1460";

/**
 * MUNCH — Silly Sandwich's monster: a big round purple fellow with stubby
 * yellow horns, one big googly eye and one smaller one, a single front tooth
 * and a pale belly, standing behind the counter (his body ends at its edge).
 * Four faces: waiting (and blinking), munching happily, a funny "yuck!"
 * (tongue out, eyes screwed shut, green cheeks), and a wide-open big bite.
 * Fills its box (6 wide : 5 tall). His hands are drawn separately
 * (`MunchHands`), in front of the bread.
 */
export const Munch = memo(function Munch({ face }: { face: Face }) {
  return (
    <svg viewBox="0 0 240 200" className="ssw-munch-svg" aria-hidden="true">
      {/* horns and tuft */}
      <path d="M70 58 L62 18 Q74 26 90 48 Z" fill="#FFC93D" />
      <path d="M170 58 L178 18 Q166 26 150 48 Z" fill="#FFC93D" />
      <path d="M104 34 Q108 14 118 30 Q124 10 132 30 Q142 16 140 38 Z" fill="#7A47D1" />
      {/* the body */}
      <path d="M22 200 C14 118 40 36 120 32 C200 36 226 118 218 200 Z" fill="#8C5BE0" />
      <path d="M200 200 C206 130 196 74 154 46 C196 60 222 118 218 200 Z" fill="#7445C9" />
      <ellipse cx="120" cy="190" rx="66" ry="44" fill="#B794F2" />
      {/* spots */}
      <circle cx="48" cy="120" r="7" fill="#A57BEB" />
      <circle cx="60" cy="96" r="4.5" fill="#A57BEB" />
      <circle cx="194" cy="112" r="5.5" fill="#A57BEB" />
      {/* the arms, reaching down to the bread */}
      <path
        d="M34 128 Q22 170 46 188"
        stroke="#7A47D1"
        strokeWidth="20"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M206 128 Q218 170 194 188"
        stroke="#7A47D1"
        strokeWidth="20"
        fill="none"
        strokeLinecap="round"
      />
      <Eyes face={face} />
      <Mouth face={face} />
    </svg>
  );
});

function Eyes({ face }: { face: Face }) {
  if (face === "munch")
    return (
      <g stroke={INK} strokeWidth="7" strokeLinecap="round" fill="none">
        <path d="M70 92 Q92 70 114 92" />
        <path d="M136 90 Q153 72 170 90" />
        <circle cx="62" cy="118" r="11" fill="#FF8FB8" stroke="none" opacity="0.8" />
        <circle cx="180" cy="116" r="10" fill="#FF8FB8" stroke="none" opacity="0.8" />
      </g>
    );
  if (face === "yuck")
    return (
      <g stroke={INK} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M74 76 L104 88 L74 100" />
        <path d="M168 76 L140 87 L168 98" />
        <ellipse cx="62" cy="120" rx="13" ry="9" fill="#9BE07A" stroke="none" opacity="0.85" />
        <ellipse cx="180" cy="118" rx="12" ry="8" fill="#9BE07A" stroke="none" opacity="0.85" />
      </g>
    );
  const big = face === "bite";
  return (
    <g>
      <circle cx="92" cy="86" r={big ? 28 : 25} fill="#FFFFFF" stroke="#5B2BA6" strokeWidth="3" />
      <circle cx="152" cy="82" r={big ? 22 : 19} fill="#FFFFFF" stroke="#5B2BA6" strokeWidth="3" />
      <circle cx="96" cy="94" r={big ? 13 : 11} fill={INK} />
      <circle cx="149" cy="89" r={big ? 10 : 8.5} fill={INK} />
      <circle cx="100" cy="90" r="3.6" fill="#FFFFFF" />
      <circle cx="152" cy="86" r="2.8" fill="#FFFFFF" />
      {face === "idle" && (
        <g className="ssw-lids" fill="#8C5BE0">
          <rect x="64" y="58" width="56" height="56" rx="26" />
          <rect x="130" y="60" width="44" height="46" rx="20" />
        </g>
      )}
    </g>
  );
}

function Mouth({ face }: { face: Face }) {
  if (face === "munch")
    return (
      <g className="ssw-chew">
        <ellipse cx="120" cy="134" rx="24" ry="11" fill={INK} />
        <rect x="113" y="123" width="12" height="9" rx="2" fill="#FFFFFF" />
      </g>
    );
  if (face === "yuck")
    return (
      <g>
        <path d="M112 134 Q114 166 126 166 Q138 166 134 134 Z" fill="#FF7FA8" />
        <path d="M123 140 V156" stroke="#E25A8C" strokeWidth="3" strokeLinecap="round" />
        <path
          d="M86 134 Q98 124 110 134 Q122 144 134 134 Q146 124 158 134"
          stroke={INK}
          strokeWidth="7"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    );
  if (face === "bite")
    return (
      <g>
        <ellipse cx="120" cy="136" rx="36" ry="28" fill={INK} />
        <ellipse cx="120" cy="152" rx="20" ry="9" fill="#FF7FA8" />
        <rect x="112" y="108" width="14" height="12" rx="2" fill="#FFFFFF" />
      </g>
    );
  return (
    <g>
      <path d="M84 124 Q120 166 156 124 Q120 136 84 124 Z" fill={INK} />
      <path d="M104 146 Q120 154 136 146 Q120 140 104 146 Z" fill="#FF7FA8" />
      <rect x="112" y="128" width="13" height="11" rx="2" fill="#FFFFFF" />
    </g>
  );
}

/** Munch's two hands, drawn in front of the bread so he holds it. Same box
 *  and viewBox as `Munch`. */
export const MunchHands = memo(function MunchHands() {
  return (
    <svg viewBox="0 0 240 200" className="ssw-munch-svg" aria-hidden="true">
      {[48, 192].map((x) => (
        <g key={x} fill="#7A47D1">
          <circle cx={x} cy="188" r="16" />
          <circle cx={x + (x < 120 ? 12 : -12)} cy="178" r="7" />
          <circle cx={x + (x < 120 ? 14 : -14)} cy="190" r="7" />
        </g>
      ))}
    </svg>
  );
});
