"use client";

import { WordPicture } from "@games/cvc-match/components/WordPicture";
import { WORDS, type ModuleId } from "@games/word-builder/constants/rounds";

/** A lesson in miniature for its home card: its first word's picture and the
 *  word on letter tiles, the lesson's vowel in its own colour. */
export function WbdMini({ id }: { id: ModuleId }) {
  const word = WORDS[id][0];
  return (
    <span className="wbd-mini" aria-hidden="true">
      <span className="wbd-mini-pic">
        <WordPicture word={word} />
      </span>
      <span className="wbd-mini-word">
        {word.split("").map((l) => (
          <span key={l} className={`wbd-mini-tile ${l === id ? "is-vowel" : ""}`}>
            {l}
          </span>
        ))}
      </span>
    </span>
  );
}

/** A lesson's Library card: a sky, the ground, and its first word on three
 *  letter tiles, the vowel in red. Inline SVG only (the Library page does
 *  not load playlab.css). */
export function WordBuilderIcon({ word }: { word: string }) {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill="#A9DEF7" />
        <rect y="72" width="100" height="28" fill="#D9A766" />
        {word.split("").map((l, i) => (
          <g key={l} transform={`translate(${9 + i * 29} ${i === 1 ? 30 : 36})`}>
            <rect x="0" y="4" width="25" height="28" rx="6" fill="#B8742F" />
            <rect x="0" y="0" width="25" height="28" rx="6" fill="#FFF3D6" />
            <text
              x="12.5"
              y="21"
              textAnchor="middle"
              fontSize="20"
              fontWeight="900"
              fontFamily="Nunito, system-ui, sans-serif"
              fill={i === 1 ? "#E8554E" : "#3A2A6B"}
            >
              {l}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
