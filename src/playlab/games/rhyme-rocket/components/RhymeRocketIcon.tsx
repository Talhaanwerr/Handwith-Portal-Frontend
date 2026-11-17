import { wordSrc } from "@games/rhyme-or-not/constants/words";

const DOTS: readonly (readonly [number, number])[] = [
  [8, 10],
  [22, 30],
  [40, 8],
  [62, 14],
  [90, 8],
  [84, 40],
  [12, 52],
  [70, 50],
];

/**
 * The Library card's scene for Rhyme Rocket: a starry navy sky, an orange
 * planet with a jar on it, and the red-nosed rocket with a star in its window
 * flying up from the moon-ground. Inline SVG and images only (the Library
 * page does not load playlab.css). Nothing moves.
 */
export function RhymeRocketIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill="#141D55" />
        {DOTS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill="#FFFFFF" />
        ))}
        <path d="M0 88 Q30 82 55 86 T100 84 V100 H0 Z" fill="#8C82D0" />
        <circle cx="68" cy="32" r="22" fill="#D9772A" />
        <circle cx="68" cy="30" r="22" fill="#FF9F43" />
        <image href={wordSrc("jar")} x="55" y="17" width="26" height="26" />
        <g transform="translate(18 40) rotate(28)">
          <path d="M8 22 Q0 28 0 38 L9 34 Z" fill="#E8414B" />
          <path d="M28 22 Q36 28 36 38 L27 34 Z" fill="#E8414B" />
          <path
            d="M18 0 C28 6 30 18 29 32 C28 38 26 40 24 42 H12 C10 40 8 38 7 32 C6 18 8 6 18 0 Z"
            fill="#FFFFFF"
          />
          <path d="M18 0 C23 3 26 7 27 11 C21 9 15 9 9 11 C10 7 13 3 18 0 Z" fill="#E8414B" />
          <path d="M13 42 Q18 56 23 42 Z" fill="#FFB43D" />
          <circle cx="18" cy="25" r="9" fill="#2F6FD6" />
          <circle cx="18" cy="25" r="7.4" fill="#FFFFFF" />
          <image href={wordSrc("star")} x="12" y="19" width="12" height="12" />
        </g>
      </svg>
    </div>
  );
}
