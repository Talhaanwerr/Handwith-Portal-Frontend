"use client";

import type { CharacterId } from "@games/counting-numbers/constants/levels";

/**
 * The five friends of Numbers 1 – 5 — our own cast, drawn in one language:
 * big soft shapes, no outlines, huge white eyes with a glint, a rounder,
 * paler tummy, blush on the cheeks, and a darker tone underneath every shape
 * so it sits on the page. Nova the bunny set the standard; the others were
 * redrawn to match her.
 *
 *   Pip    — a small yellow chick, all crest and feet
 *   Momo   — a big teal fuzzy monster with horns and a toothy grin
 *   Nova   — a lavender bunny in round glasses
 *   Rusty  — an orange fox in a striped scarf, brush tail and all
 *   Dot    — a pink polka-dot creature with antennae
 *
 * One SVG each, 120×160, with a `pose`: standing, waving, or both arms up.
 */
export type Pose = "idle" | "wave" | "cheer";

interface CharacterProps {
  pose?: Pose;
}

/** Eyes shared by the whole cast — big, white, a black pupil and a glint. */
function Eyes({ cx, cy, gap, r }: { cx: number; cy: number; gap: number; r: number }) {
  return (
    <g>
      <circle cx={cx - gap} cy={cy} r={r} fill="#FFFFFF" />
      <circle cx={cx + gap} cy={cy} r={r} fill="#FFFFFF" />
      <circle cx={cx - gap + r * 0.18} cy={cy + r * 0.18} r={r * 0.46} fill="#1F1F2E" />
      <circle cx={cx + gap + r * 0.18} cy={cy + r * 0.18} r={r * 0.46} fill="#1F1F2E" />
      <circle cx={cx - gap + r * 0.36} cy={cy - r * 0.02} r={r * 0.16} fill="#FFFFFF" />
      <circle cx={cx + gap + r * 0.36} cy={cy - r * 0.02} r={r * 0.16} fill="#FFFFFF" />
    </g>
  );
}

/** Blush on both cheeks. */
function Cheeks({
  cx,
  cy,
  gap,
  color = "#F7A6B6",
}: {
  cx: number;
  cy: number;
  gap: number;
  color?: string;
}) {
  return (
    <g opacity="0.8">
      <ellipse cx={cx - gap} cy={cy} rx="7" ry="4" fill={color} />
      <ellipse cx={cx + gap} cy={cy} rx="7" ry="4" fill={color} />
    </g>
  );
}

/** An arm on the side of a body: hanging, waving, or straight up. */
function Arm({
  x,
  y,
  side,
  pose,
  color,
}: {
  x: number;
  y: number;
  side: "left" | "right";
  pose: Pose;
  color: string;
}) {
  const dir = side === "left" ? -1 : 1;
  const up = pose === "cheer" || (pose === "wave" && side === "right");
  const d = up
    ? `M${x} ${y} Q${x + dir * 22} ${y - 18} ${x + dir * 18} ${y - 44}`
    : `M${x} ${y} Q${x + dir * 18} ${y + 14} ${x + dir * 12} ${y + 34}`;
  const hx = up ? x + dir * 18 : x + dir * 12;
  const hy = up ? y - 44 : y + 34;
  return (
    <g>
      <path d={d} stroke={color} strokeWidth="12" strokeLinecap="round" fill="none" />
      <circle cx={hx} cy={hy} r="8.5" fill={color} />
    </g>
  );
}

export function Pip({ pose = "idle" }: CharacterProps) {
  return (
    <svg viewBox="0 0 120 160" className="cn-character-svg" aria-hidden="true">
      {/* feet */}
      <path
        d="M40 150 L30 158 M40 150 L40 160 M40 150 L50 158"
        stroke="#F28A2E"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M80 150 L70 158 M80 150 L80 160 M80 150 L90 158"
        stroke="#F28A2E"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* wings */}
      <Arm x={24} y={100} side="left" pose={pose} color="#F2B52E" />
      <Arm x={96} y={100} side="right" pose={pose} color="#F2B52E" />
      {/* body, shaded underneath */}
      <ellipse cx="60" cy="104" rx="42" ry="46" fill="#F6C544" />
      <ellipse cx="60" cy="130" rx="34" ry="18" fill="#EBB12C" opacity="0.35" />
      <ellipse cx="60" cy="116" rx="24" ry="22" fill="#FBE59A" />
      {/* head and crest */}
      <circle cx="60" cy="54" r="36" fill="#F6C544" />
      <path
        d="M44 22 Q50 6 58 20 M56 18 Q62 2 70 16 M68 22 Q76 10 80 22"
        stroke="#F2B52E"
        strokeWidth="7"
        strokeLinecap="round"
        fill="none"
      />
      <Eyes cx={60} cy={52} gap={13} r={10} />
      <path d="M50 66 L60 78 L70 66 Z" fill="#F28A2E" />
      <path d="M50 66 L60 70 L70 66 Z" fill="#E07A20" />
      <Cheeks cx={60} cy={66} gap={22} />
    </svg>
  );
}

export function Momo({ pose = "idle" }: CharacterProps) {
  return (
    <svg viewBox="0 0 120 160" className="cn-character-svg" aria-hidden="true">
      {/* feet */}
      <ellipse cx="42" cy="152" rx="14" ry="7" fill="#1F8A96" />
      <ellipse cx="78" cy="152" rx="14" ry="7" fill="#1F8A96" />
      <Arm x={20} y={86} side="left" pose={pose} color="#2FB3C0" />
      <Arm x={100} y={86} side="right" pose={pose} color="#2FB3C0" />
      {/* fur: the body with tufts along the top */}
      <path d="M18 96 Q16 42 60 32 Q104 42 102 96 Q104 138 60 146 Q16 138 18 96 Z" fill="#2FB3C0" />
      <path
        d="M30 44 L26 30 L38 38 M46 34 L46 20 L54 32 M66 32 L74 20 L74 34 M82 38 L94 30 L90 44"
        stroke="#2FB3C0"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <ellipse cx="60" cy="126" rx="36" ry="16" fill="#1F8A96" opacity="0.3" />
      {/* horns */}
      <path d="M36 36 L30 12 L48 30 Z" fill="#F6C544" />
      <path d="M84 36 L90 12 L72 30 Z" fill="#F6C544" />
      <path d="M36 36 L33 22 L44 32 Z" fill="#FBE59A" />
      <path d="M84 36 L87 22 L76 32 Z" fill="#FBE59A" />
      <ellipse cx="60" cy="114" rx="28" ry="22" fill="#7FDCE4" />
      <Eyes cx={60} cy={68} gap={17} r={13} />
      {/* a big toothy grin */}
      <path d="M38 94 Q60 112 82 94 Q60 126 38 94 Z" fill="#1F1F2E" />
      <path d="M44 96 L50 96 L50 104 Z M70 96 L76 96 L70 104 Z" fill="#FFFFFF" />
      <path d="M48 102 Q60 112 72 102 L70 108 Q60 116 50 108 Z" fill="#F26D7D" />
      <Cheeks cx={60} cy={92} gap={32} color="#7FDCE4" />
    </svg>
  );
}

export function Nova({ pose = "idle" }: CharacterProps) {
  return (
    <svg viewBox="0 0 120 160" className="cn-character-svg" aria-hidden="true">
      <ellipse cx="40" cy="20" rx="9" ry="22" fill="#C9A9F0" transform="rotate(-12 40 20)" />
      <ellipse cx="80" cy="20" rx="9" ry="22" fill="#C9A9F0" transform="rotate(12 80 20)" />
      <ellipse cx="40" cy="20" rx="4" ry="14" fill="#F4C6E0" transform="rotate(-12 40 20)" />
      <ellipse cx="80" cy="20" rx="4" ry="14" fill="#F4C6E0" transform="rotate(12 80 20)" />
      <path d="M44 154 L42 138 L56 140 Z M76 154 L78 138 L64 140 Z" fill="#B48CE8" />
      <Arm x={30} y={98} side="left" pose={pose} color="#C9A9F0" />
      <Arm x={90} y={98} side="right" pose={pose} color="#C9A9F0" />
      <ellipse cx="60" cy="112" rx="32" ry="34" fill="#C9A9F0" />
      <ellipse cx="60" cy="134" rx="24" ry="10" fill="#A97FD8" opacity="0.3" />
      <ellipse cx="60" cy="120" rx="18" ry="18" fill="#F4E6FF" />
      <circle cx="60" cy="62" r="32" fill="#C9A9F0" />
      <Eyes cx={60} cy={60} gap={13} r={9} />
      <circle cx="47" cy="60" r="13" fill="none" stroke="#5A3F9A" strokeWidth="3" />
      <circle cx="73" cy="60" r="13" fill="none" stroke="#5A3F9A" strokeWidth="3" />
      <path d="M58 60 L62 60" stroke="#5A3F9A" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M56 76 Q60 80 64 76"
        stroke="#5A3F9A"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="60" cy="72" r="3" fill="#F26D7D" />
      <Cheeks cx={60} cy={74} gap={20} />
    </svg>
  );
}

export function Rusty({ pose = "idle" }: CharacterProps) {
  return (
    <svg viewBox="0 0 120 160" className="cn-character-svg" aria-hidden="true">
      {/* the brush tail, swept out behind */}
      <path d="M90 118 Q124 100 112 132 Q104 146 86 138 Z" fill="#F28A2E" />
      <path d="M104 118 Q118 112 112 130 Q106 138 96 134 Z" fill="#FBE0C0" />
      <path d="M44 156 L42 140 L56 142 Z M76 156 L78 140 L64 142 Z" fill="#C8651F" />
      <Arm x={28} y={96} side="left" pose={pose} color="#F28A2E" />
      <Arm x={92} y={96} side="right" pose={pose} color="#F28A2E" />
      <ellipse cx="60" cy="112" rx="32" ry="34" fill="#F28A2E" />
      <ellipse cx="60" cy="122" rx="18" ry="20" fill="#FBE0C0" />
      {/* the striped scarf */}
      <path d="M32 90 Q60 104 88 90 L86 102 Q60 116 34 102 Z" fill="#3F6FBF" />
      <path
        d="M40 95 L44 106 M52 100 L54 110 M66 100 L64 110 M78 95 L74 106"
        stroke="#F6C544"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M70 100 Q82 108 78 122 L70 118 Z" fill="#3F6FBF" />
      {/* ears */}
      <path d="M30 40 L40 6 L58 36 Z M90 40 L80 6 L62 36 Z" fill="#F28A2E" />
      <path d="M36 36 L41 16 L51 34 Z M84 36 L79 16 L69 34 Z" fill="#FBE0C0" />
      <circle cx="60" cy="58" r="32" fill="#F28A2E" />
      <path d="M30 60 Q60 86 90 60 Q80 92 60 92 Q40 92 30 60 Z" fill="#FBE0C0" />
      <Eyes cx={60} cy={54} gap={14} r={8} />
      <ellipse cx="60" cy="74" rx="5.5" ry="4.5" fill="#1F1F2E" />
      <path
        d="M52 82 Q60 88 68 82"
        stroke="#1F1F2E"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <Cheeks cx={60} cy={70} gap={24} color="#F7B39A" />
    </svg>
  );
}

export function Dot({ pose = "idle" }: CharacterProps) {
  return (
    <svg viewBox="0 0 120 160" className="cn-character-svg" aria-hidden="true">
      <path
        d="M46 20 Q40 6 30 4 M74 20 Q80 6 90 4"
        stroke="#E0556E"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="30" cy="4" r="5.5" fill="#F6C544" />
      <circle cx="90" cy="4" r="5.5" fill="#F6C544" />
      <ellipse cx="44" cy="150" rx="12" ry="6" fill="#C43D57" />
      <ellipse cx="76" cy="150" rx="12" ry="6" fill="#C43D57" />
      <Arm x={22} y={92} side="left" pose={pose} color="#F27B95" />
      <Arm x={98} y={92} side="right" pose={pose} color="#F27B95" />
      <circle cx="60" cy="88" r="54" fill="#F27B95" />
      <ellipse cx="60" cy="128" rx="34" ry="12" fill="#D9556E" opacity="0.28" />
      {[
        [30, 68],
        [86, 62],
        [42, 118],
        [92, 108],
        [66, 132],
        [22, 100],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="6" fill="#FFFFFF" opacity="0.7" />
      ))}
      <Eyes cx={60} cy={72} gap={16} r={11} />
      <path
        d="M42 98 Q60 116 78 98"
        stroke="#1F1F2E"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
      />
      <Cheeks cx={60} cy={94} gap={28} color="#FFB3C6" />
    </svg>
  );
}

const CAST: Record<CharacterId, (p: CharacterProps) => React.ReactElement> = {
  pip: Pip,
  momo: Momo,
  nova: Nova,
  rusty: Rusty,
  dot: Dot,
};

export const CHARACTER_NAMES: Record<CharacterId, string> = {
  pip: "Pip",
  momo: "Momo",
  nova: "Nova",
  rusty: "Rusty",
  dot: "Dot",
};

/** Any friend by id. */
export function Character({ id, pose = "idle" }: { id: CharacterId; pose?: Pose }) {
  const Draw = CAST[id];
  return <Draw pose={pose} />;
}

/** The little smiling face at the end of the progress bar — Pip. */
export function MascotFace() {
  return (
    <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="#F6C544" />
      <path
        d="M13 6 Q16 0 20 5 M19 4 Q22 -1 26 4"
        stroke="#F2B52E"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="14" cy="17" r="3.4" fill="#1F1F2E" />
      <circle cx="26" cy="17" r="3.4" fill="#1F1F2E" />
      <circle cx="15" cy="16" r="1" fill="#FFFFFF" />
      <circle cx="27" cy="16" r="1" fill="#FFFFFF" />
      <path d="M17 24 L20 28 L23 24 Z" fill="#F28A2E" />
      <ellipse cx="10" cy="24" rx="3" ry="1.8" fill="#F7A6B6" opacity="0.8" />
      <ellipse cx="30" cy="24" rx="3" ry="1.8" fill="#F7A6B6" opacity="0.8" />
    </svg>
  );
}
