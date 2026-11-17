/**
 * The Library card's scene for Tricky Fruit Puzzles — the warm kitchen wall,
 * the wooden table, a white plate, and on it the tangerine in FOUR pieces
 * pulled a little apart, each corner its own way. Inline SVG only (the
 * Library page does not load playlab.css); the tangerine is the game's own
 * Fluent picture, seen through each quarter's outline. Nothing moves.
 */
const ORANGE = "/games/fluent3d/tangerine.png";

/** The four quarters, split by two gentle wavy seams that meet in the middle. */
const QUARTERS = [
  { id: "frt-icon-tl", d: "M50 0 C55 17 45 33 50 50 C33 45 17 55 0 50 V0 Z", dx: -3, dy: -3 },
  { id: "frt-icon-tr", d: "M50 0 C55 17 45 33 50 50 C67 45 83 55 100 50 V0 Z", dx: 3, dy: -3 },
  { id: "frt-icon-bl", d: "M50 100 C45 83 55 67 50 50 C33 45 17 55 0 50 V100 Z", dx: -3, dy: 3 },
  { id: "frt-icon-br", d: "M50 100 C45 83 55 67 50 50 C67 45 83 55 100 50 V100 Z", dx: 3, dy: 3 },
];

export function FruitTrickyIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          {QUARTERS.map((q) => (
            <clipPath key={q.id} id={q.id}>
              <path d={q.d} />
            </clipPath>
          ))}
        </defs>
        <rect width="100" height="100" fill="#FFF4E4" />
        <rect y="72" width="100" height="28" fill="#DFA86E" />
        <rect y="70" width="100" height="5" fill="#F2CC98" />
        <ellipse cx="50" cy="66" rx="40" ry="17" fill="#FFFFFF" />
        <ellipse cx="50" cy="66" rx="30" ry="11" fill="#F4ECE1" />
        {QUARTERS.map((q) => (
          <g key={q.id} transform={`translate(${q.dx} ${q.dy})`}>
            <g transform="translate(19 13) scale(0.62)" clipPath={`url(#${q.id})`}>
              <image href={ORANGE} x="0" y="0" width="100" height="100" />
            </g>
          </g>
        ))}
      </svg>
    </div>
  );
}
