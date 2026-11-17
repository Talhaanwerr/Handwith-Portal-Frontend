"use client";

import { LESSONS, MODULE_IDS, type ModuleId } from "@games/rainbow-words/constants/rounds";

/** A lesson in miniature for its home card: its three words on cards. */
export function RbwMini({ id }: { id: ModuleId }) {
  return (
    <span className="rbw-mini" aria-hidden="true">
      {LESSONS[id].words.map((w) => (
        <span key={w} className="rbw-mini-word font-rounded font-black">
          {w}
        </span>
      ))}
    </span>
  );
}

/** A lesson's Library card: the rainbow painted up to its band, and its
 *  first word on a card. Inline SVG only (the Library page does not load
 *  playlab.css). */
export function RainbowWordsIcon({ id }: { id: ModuleId }) {
  const upTo = MODULE_IDS.indexOf(id);
  const word = LESSONS[id].words[1];
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill="#BFE7FA" />
        <g fill="none" strokeWidth="4.4">
          {MODULE_IDS.map((m, i) => (
            <circle
              key={m}
              cx="50"
              cy="78"
              r={62 - i * 4.4}
              stroke={i <= upTo ? LESSONS[m].accent : "#FFFFFF"}
              opacity={i <= upTo ? 1 : 0.55}
            />
          ))}
        </g>
        <rect y="78" width="100" height="22" fill="#7CC77A" />
        <rect x="20" y="52" width="60" height="30" rx="8" fill={LESSONS[id].edge} />
        <rect x="20" y="48" width="60" height="30" rx="8" fill="#FFFFFF" />
        <text
          x="50"
          y="70"
          textAnchor="middle"
          fontSize={word.length > 4 ? 15 : 20}
          fontWeight="900"
          fontFamily="Nunito, system-ui, sans-serif"
          fill={LESSONS[id].edge}
        >
          {word}
        </text>
      </svg>
    </div>
  );
}
