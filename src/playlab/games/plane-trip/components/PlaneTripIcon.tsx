/**
 * The Library card's scene for Plane Trip — the airport's glass wall onto
 * the sky with the plane outside, the terminal floor, a red suitcase with
 * white hearts and the luggage tag that matches it. Inline SVG only (the
 * Library page does not load playlab.css). Nothing moves.
 */
export function PlaneTripIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="ptr-ic-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#62BDF2" />
            <stop offset="1" stopColor="#E2F4FF" />
          </linearGradient>
          <clipPath id="ptr-ic-bag">
            <rect x="46" y="62" width="40" height="28" rx="6" />
          </clipPath>
        </defs>
        <rect width="100" height="100" fill="url(#ptr-ic-sky)" />
        <rect y="46" width="100" height="10" fill="#B3BBC6" />
        <rect y="45" width="100" height="2" fill="#8CCB5A" />
        {/* the plane outside */}
        <g transform="translate(6 18) scale(0.34)">
          <path d="M34 40 L16 6 H44 L72 40 Z" fill="#F08A24" />
          <path
            d="M20 54 C20 40 34 36 52 36 H208 C232 36 252 46 257 58 C252 68 236 74 214 74 H46 C30 74 20 66 20 54Z"
            fill="#FFFFFF"
          />
          <path d="M24 62 H252" stroke="#F08A24" strokeWidth="5" />
          <path d="M118 62 L156 62 L128 98 L106 98 Z" fill="#D7DEE9" />
          <path d="M228 44 Q242 45 249 54 H230 Z" fill="#2E4A7A" />
        </g>
        {/* glass wall mullions */}
        <rect y="0" width="100" height="4" fill="#D3DBE5" />
        <rect x="48" y="0" width="3" height="56" fill="#E8EDF3" />
        {/* the floor */}
        <rect y="56" width="100" height="44" fill="#E5DCCD" />
        {/* the suitcase */}
        <path
          d="M58 63 V57 C58 55 60 54 62 54 H70 C72 54 74 55 74 57 V63"
          fill="none"
          stroke="#4A5260"
          strokeWidth="3"
        />
        <rect x="46" y="64" width="40" height="28" rx="6" fill="#B5342E" />
        <rect x="46" y="62" width="40" height="28" rx="6" fill="#E8524A" />
        <g clipPath="url(#ptr-ic-bag)" fill="#FFFFFF">
          {[
            [54, 70],
            [66, 68],
            [78, 72],
            [58, 82],
            [74, 84],
          ].map(([x, y]) => (
            <path
              key={`${x}-${y}`}
              transform={`translate(${x} ${y}) scale(0.6)`}
              d="M0,5.5 C-7,0.5 -6.5,-5.5 -3.2,-5.5 C-1.5,-5.5 -0.4,-4.3 0,-3.2 C0.4,-4.3 1.5,-5.5 3.2,-5.5 C6.5,-5.5 7,0.5 0,5.5Z"
            />
          ))}
        </g>
        <circle cx="54" cy="93" r="2.6" fill="#333A46" />
        <circle cx="78" cy="93" r="2.6" fill="#333A46" />
        {/* the matching tag */}
        <g transform="rotate(-8 24 74)">
          <path d="M24 52 C20 56 22 60 24 62" stroke="#8A6A3C" strokeWidth="1.5" fill="none" />
          <path
            d="M14 64 L24 59 L34 64 H38 V92 H10 V64 Z"
            fill="#D8CDB6"
            transform="translate(0 1.5)"
          />
          <path d="M14 64 L24 59 L34 64 H38 V92 H10 V64 Z" fill="#FFF8E8" />
          <rect x="14" y="70" width="20" height="15" rx="3.5" fill="#E8524A" />
          <path
            transform="translate(24 77.5) scale(0.55)"
            d="M0,5.5 C-7,0.5 -6.5,-5.5 -3.2,-5.5 C-1.5,-5.5 -0.4,-4.3 0,-3.2 C0.4,-4.3 1.5,-5.5 3.2,-5.5 C6.5,-5.5 7,0.5 0,5.5Z"
            fill="#FFFFFF"
          />
        </g>
      </svg>
    </div>
  );
}
