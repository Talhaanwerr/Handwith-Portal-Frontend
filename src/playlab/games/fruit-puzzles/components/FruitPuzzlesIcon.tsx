/**
 * The Library card's scene for Fruit Puzzles — a warm kitchen wall, the
 * wooden table, a white plate, and on it the red apple in two halves pulled a
 * little apart. Inline SVG only (the Library page does not load playlab.css);
 * the apple is the game's own Fluent picture, seen through each half's
 * outline. Nothing moves.
 */
const APPLE = "/games/fluent3d/red_apple.png";

/** The two halves: the apple's left and right, split by a gentle wavy seam. */
const HALVES = [
  { id: "frp-icon-l", d: "M50 0 C55 17 45 33 50 50 C55 67 45 83 50 100 H0 V0 Z", dx: -3.5 },
  { id: "frp-icon-r", d: "M50 0 C55 17 45 33 50 50 C55 67 45 83 50 100 H100 V0 Z", dx: 3.5 },
];

export function FruitPuzzlesIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          {HALVES.map((h) => (
            <clipPath key={h.id} id={h.id}>
              <path d={h.d} />
            </clipPath>
          ))}
        </defs>
        <rect width="100" height="100" fill="#FFF4E4" />
        <rect y="72" width="100" height="28" fill="#DFA86E" />
        <rect y="70" width="100" height="5" fill="#F2CC98" />
        <ellipse cx="50" cy="66" rx="40" ry="17" fill="#FFFFFF" />
        <ellipse cx="50" cy="66" rx="30" ry="11" fill="#F4ECE1" />
        {HALVES.map((h) => (
          <g key={h.id} transform={`translate(${h.dx} 0)`}>
            <g transform="translate(18 14) scale(0.64)" clipPath={`url(#${h.id})`}>
              <image href={APPLE} x="0" y="0" width="100" height="100" />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
