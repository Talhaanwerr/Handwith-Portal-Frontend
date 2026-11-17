import { wordSrc } from "@games/rhyme-or-not/constants/words";

/**
 * The Library card's scene for Magic Hat Swap: the purple tower room — a
 * round teal window with a moon — the "hat" card on its stand, and the
 * upturned magic hat with a pink "h" block dropping in. Inline SVG and
 * images only (the Library page does not load playlab.css). Nothing moves.
 */
export function MagicHatIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill="#4A2E88" />
        <circle cx="50" cy="16" r="14" fill="#2E1A5C" />
        <circle cx="50" cy="16" r="12" fill="#13707F" />
        <circle cx="55" cy="13" r="4" fill="#FFF4C2" />
        <rect y="74" width="100" height="26" fill="#7A4A2A" />
        <ellipse cx="50" cy="88" rx="46" ry="8" fill="#1C8C97" />
        {/* the card on its stand */}
        <path d="M18 72 L14 86 M38 72 L42 86" stroke="#7A4A2A" strokeWidth="3" />
        <rect
          x="8"
          y="30"
          width="40"
          height="44"
          rx="5"
          fill="#FFF6E0"
          stroke="#FFC93D"
          strokeWidth="2.5"
        />
        <image href={wordSrc("hat")} x="14" y="33" width="28" height="26" />
        <text x="28" y="70" textAnchor="middle" fontSize="11" fontWeight="800" fill="#3A2A8C">
          <tspan fill="#E0408A">h</tspan>at
        </text>
        {/* the hat */}
        <path d="M60 58 L62 84 Q76 89 90 84 L92 58 Z" fill="#3A2A8C" />
        <path d="M60 61 Q76 66 92 61 L92 67 Q76 72 60 67 Z" fill="#FFC93D" />
        <ellipse cx="76" cy="58" rx="20" ry="6" fill="#5B47C4" />
        <ellipse cx="76" cy="58" rx="13" ry="3.4" fill="#140C38" />
        {/* the block going in */}
        <rect
          x="67"
          y="32"
          width="18"
          height="18"
          rx="3"
          fill="#F2C98A"
          stroke="#A86B33"
          strokeWidth="1.6"
        />
        <text x="76" y="46" textAnchor="middle" fontSize="13" fontWeight="900" fill="#E0408A">
          h
        </text>
        <path d="M58 30 l2 4 4 1 -4 1 -2 4 -2 -4 -4 -1 4 -1 Z" fill="#FFE68A" />
        <path d="M92 40 l1.5 3 3 1 -3 1 -1.5 3 -1.5 -3 -3 -1 3 -1 Z" fill="#FFE68A" />
      </svg>
    </div>
  );
}
