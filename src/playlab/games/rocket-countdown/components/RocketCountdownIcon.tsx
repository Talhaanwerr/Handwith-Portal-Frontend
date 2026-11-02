/**
 * The Library card's scene for Rocket Countdown — night sky with stars and a
 * ringed planet, a white rocket with red fins on its launch pad (two of the
 * pad's lights on), and a big numbered star from the launch tower. Inline
 * SVG only: the Library page does not load playlab.css. Nothing moves.
 */
export function RocketCountdownIcon() {
  const planet = "/games/blend-read/icons/planet.svg";
  const stars: [number, number, number][] = [
    [10, 12, 1.2],
    [28, 8, 0.9],
    [46, 18, 1.1],
    [64, 6, 1],
    [88, 30, 1.2],
    [8, 40, 0.9],
    [36, 34, 0.8],
    [94, 52, 1],
  ];
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="rkc-ic-sky" x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0" stopColor="#050814" />
            <stop offset="0.55" stopColor="#0B1330" />
            <stop offset="1" stopColor="#1B2B6B" />
          </linearGradient>
          <radialGradient id="rkc-ic-neb" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#8B7CFF" stopOpacity="0.45" />
            <stop offset="1" stopColor="#8B7CFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#rkc-ic-sky)" />
        <ellipse cx="78" cy="70" rx="40" ry="30" fill="url(#rkc-ic-neb)" />
        <g fill="#DCE8FF">
          {stars.map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
          ))}
        </g>
        <image href={planet} x="64" y="6" width="32" height="32" />

        {/* the launch pad and its lights */}
        <rect x="8" y="84" width="44" height="6" rx="2" fill="#9FB2D8" />
        <rect x="10" y="88" width="40" height="12" rx="2" fill="#4A5A86" />
        {[18, 26, 34, 42].map((x, i) => (
          <circle key={x} cx={x} cy="94" r="2.4" fill={i < 2 ? "#FFD93D" : "#2C3550"} />
        ))}

        {/* the rocket */}
        <path d="M30 22 Q42 36 40 70 L20 70 Q18 36 30 22 Z" fill="#FFFFFF" />
        <path d="M30 22 Q42 36 40 70 L33 70 Q34 36 30 22 Z" fill="#C9CFDD" />
        <path d="M20 56 L10 76 L20 72 Z M40 56 L50 76 L40 72 Z" fill="#F25C6E" />
        <circle cx="30" cy="44" r="5.4" fill="#8FD6FF" stroke="#C9CFDD" strokeWidth="1.4" />
        <path d="M23 70 L37 70 L35 78 L25 78 Z" fill="#7A869E" />
        <path d="M26 78 Q30 90 34 78 Z" fill="#FFA868" />

        {/* a numbered star from the tower */}
        <path
          d="M74 44 L80 58 L95 59 L83 69 L87 84 L74 76 L61 84 L65 69 L53 59 L68 58 Z"
          fill="#FFD93D"
        />
        <path d="M74 76 L87 84 L83 69 L95 59 L80 62 Z" fill="#F2B823" opacity="0.6" />
        <text
          x="74"
          y="73"
          textAnchor="middle"
          fontSize="16"
          fontWeight="900"
          fill="#1F3F8F"
          fontFamily="system-ui, sans-serif"
        >
          3
        </text>
      </svg>
    </div>
  );
}
