/**
 * The Library card's scene for Count & Match — its two modules in miniature:
 * park sky and grass, a plate of three apples wearing its 3 (the Twemoji
 * apple the word games ship), and a tall number card with five dots over its
 * 5. Inline SVG only: the Library page does not load playlab.css. Nothing
 * moves.
 */
export function NumberGroupsIcon() {
  const apple = "/games/blend-read/icons/apple.svg";
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="ng-ic-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6CC3F5" />
            <stop offset="1" stopColor="#DFF4FF" />
          </linearGradient>
          <linearGradient id="ng-ic-grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#74C96B" />
            <stop offset="1" stopColor="#4FA54F" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#ng-ic-sky)" />
        <circle cx="84" cy="14" r="7" fill="#FFD84D" />
        <ellipse cx="24" cy="56" rx="40" ry="12" fill="#8FD07E" />
        <ellipse cx="80" cy="58" rx="34" ry="10" fill="#A3DC8F" />
        <rect y="56" width="100" height="44" fill="url(#ng-ic-grass)" />

        {/* the picnic cloth */}
        <rect x="4" y="70" width="60" height="22" rx="3" fill="#FFFFFF" />
        <g fill="rgba(232,87,79,0.55)">
          {[4, 16, 28, 40, 52].map((x) => (
            <rect key={x} x={x} y="70" width="6" height="22" />
          ))}
          {[70, 82].map((y) => (
            <rect key={y} x="4" y={y} width="60" height="5" />
          ))}
        </g>

        {/* a plate of three apples */}
        <ellipse cx="32" cy="80" rx="24" ry="8" fill="#D9CCE8" />
        <ellipse cx="32" cy="78" rx="24" ry="8" fill="#FFFFFF" />
        <image href={apple} x="14" y="62" width="16" height="16" />
        <image href={apple} x="33" y="62" width="16" height="16" />
        <image href={apple} x="23.5" y="50" width="16" height="16" />

        {/* the number card: a group above the line, its numeral below */}
        <rect x="62" y="20" width="32" height="56" rx="5" fill="#C9B8F2" />
        <rect x="62" y="18" width="32" height="56" rx="5" fill="#FFFFFF" />
        <g fill="#8E5BD9">
          <circle cx="70" cy="27" r="3.4" />
          <circle cx="86" cy="27" r="3.4" />
          <circle cx="78" cy="35" r="3.4" />
          <circle cx="70" cy="43" r="3.4" />
          <circle cx="86" cy="43" r="3.4" />
        </g>
        <rect x="65" y="50" width="26" height="1.6" rx="0.8" fill="#E4DCF3" />
        <circle cx="78" cy="63" r="9" fill="#5F3A9C" />
        <circle cx="78" cy="62.4" r="8.4" fill="#7C4FC4" />
        <text
          x="78"
          y="67"
          textAnchor="middle"
          fontSize="13"
          fontWeight="900"
          fill="#FFFFFF"
          fontFamily="system-ui, sans-serif"
        >
          5
        </text>

        {/* the answer tag on the plate */}
        <circle cx="52" cy="58" r="7" fill="#2F8F4F" stroke="#FFFFFF" strokeWidth="1.6" />
        <text
          x="52"
          y="62"
          textAnchor="middle"
          fontSize="10"
          fontWeight="900"
          fill="#FFFFFF"
          fontFamily="system-ui, sans-serif"
        >
          3
        </text>
      </svg>
    </div>
  );
}
