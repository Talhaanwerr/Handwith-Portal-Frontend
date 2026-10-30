import { BurjTowerArt } from "@shared/components/dubai/BurjTower";
import { starPoints } from "@games/burj-towers/components/starPoints";

/**
 * The Library card's scene for Tallest Tower — a sunny Dubai sky, a low
 * skyline and the sand, and two Burj Khalifa towers side by side: a tall gold
 * one with a gold star on its spire and a short silver one. Inline SVG only
 * (the Library page does not load playlab.css). Nothing moves.
 */
export function TallestTowerIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="bjt-ic-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5aaee8" />
            <stop offset="0.55" stopColor="#a9d8f4" />
            <stop offset="0.85" stopColor="#f8e7c9" />
            <stop offset="1" stopColor="#f6d6a4" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#bjt-ic-sky)" />
        <circle cx="82" cy="16" r="7" fill="#fff6c8" />
        <circle cx="82" cy="16" r="5" fill="#ffe27a" />
        <path d="M0 82V70h7v12h4V62h6v20h5V72h5v10h46V66l6-6v22h4V74h7v8h10v18H0Z" fill="#b4c6da" />
        <path d="M0 85C30 79 64 80 100 83V100H0Z" fill="#e9c48a" />
        <path d="M0 93C34 88 70 89 100 92V100H0Z" fill="#dfae72" />
        <BurjTowerArt x={35} ground={94} unit={10} floors={6} gold={6} spireUnits={1.6} />
        <BurjTowerArt x={72} ground={94} unit={10} floors={3} spireUnits={1.6} />
        <polygon
          points={starPoints(35, 14, 9)}
          fill="#ffd34d"
          stroke="#e09a14"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
