import { wordSrc } from "@games/rhyme-or-not/constants/words";

/**
 * The Library card's scene for Silly Sandwich: a butter-yellow tiled wall,
 * the purple monster Munch grinning behind a wooden counter, holding a slice
 * of bread with a hat on it, and a plate with a rat waiting beside it. Inline
 * SVG and images only (the Library page does not load playlab.css). Nothing
 * moves.
 */
export function SillySandwichIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill="#FFF0CC" />
        {[0, 20, 40, 60, 80].map((v) => (
          <g key={v} fill="#FFE2A2">
            <rect x={v} y="0" width="1.4" height="70" />
            <rect x="0" y={v} width="100" height="1.4" />
          </g>
        ))}
        <path d="M30 18 L27 4 Q33 8 38 15 Z" fill="#FFC93D" />
        <path d="M70 18 L73 4 Q67 8 62 15 Z" fill="#FFC93D" />
        <path d="M14 74 C10 40 24 12 50 11 C76 12 90 40 86 74 Z" fill="#8C5BE0" />
        <circle cx="40" cy="34" r="9" fill="#FFFFFF" />
        <circle cx="62" cy="33" r="7" fill="#FFFFFF" />
        <circle cx="41" cy="37" r="4.2" fill="#3B1460" />
        <circle cx="61" cy="35.5" r="3.3" fill="#3B1460" />
        <path d="M36 46 Q50 60 64 46 Q50 51 36 46 Z" fill="#3B1460" />
        <rect x="47" y="47.5" width="6" height="5" rx="1" fill="#FFFFFF" />
        <rect y="70" width="100" height="30" fill="#C27A3E" />
        <rect y="68" width="100" height="6" fill="#EBB070" />
        <rect x="28" y="62" width="44" height="9" rx="4.5" fill="#E3A653" />
        <rect x="30" y="61" width="40" height="4.5" rx="2.2" fill="#FBE1A4" />
        <circle cx="50" cy="55" r="9" fill="#FFFFFF" stroke="#7CCB4E" strokeWidth="2.4" />
        <image href={wordSrc("hat")} x="43" y="48" width="14" height="14" />
        <circle cx="24" cy="66" r="5" fill="#7A47D1" />
        <circle cx="76" cy="66" r="5" fill="#7A47D1" />
        <circle cx="50" cy="87" r="10" fill="#FFFFFF" stroke="#5FA8D3" strokeWidth="2.4" />
        <image href={wordSrc("rat")} x="42" y="79" width="16" height="16" />
      </svg>
    </div>
  );
}
