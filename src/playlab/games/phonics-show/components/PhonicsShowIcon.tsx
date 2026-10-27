/**
 * The Library card's scene for Phonics Game Show — the classroom's cream
 * wall and wooden floor, red curtains at the sides, the lit sign with a sun
 * on its screen, and three orange letter keys in front, the middle one the
 * answer. Inline SVG only (the Library page does not load playlab.css), and
 * the sun is the same Fluent picture the game shows. Nothing moves.
 */
const BULBS = Array.from({ length: 9 }, (_, i) => 26 + i * 6);

export function PhonicsShowIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="pgs-ic-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4A7FF0" />
            <stop offset="1" stopColor="#1F3FA6" />
          </linearGradient>
          <linearGradient id="pgs-ic-key" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFAD4D" />
            <stop offset="1" stopColor="#FF8A1F" />
          </linearGradient>
        </defs>
        {/* the room: cream wall, wooden floor */}
        <rect width="100" height="100" fill="#FBE9D6" />
        <rect y="74" width="100" height="26" fill="#D9934F" />
        <rect y="74" width="100" height="2" fill="#E8B077" />
        {/* the curtains */}
        <path d="M0 0H16L13 30 7 48 11 100H0Z" fill="#C22A39" />
        <path d="M100 0H84L87 30 93 48 89 100H100Z" fill="#C22A39" />
        <path d="M5 0V100M95 0V100" stroke="#92162A" strokeWidth="2.4" />
        {/* the lit sign */}
        <rect x="22" y="12" width="56" height="44" rx="6" fill="#EAA526" />
        {BULBS.map((x) => (
          <g key={x}>
            <circle cx={x} cy="15" r="1.4" fill="#FFF6C8" />
            <circle cx={x} cy="53" r="1.4" fill="#FFF6C8" />
          </g>
        ))}
        <rect x="27" y="18" width="46" height="32" rx="3.5" fill="url(#pgs-ic-screen)" />
        <rect x="38" y="20" width="24" height="28" rx="3" fill="#FFFFFF" />
        {/* the three letter keys, the middle one lit green */}
        {[
          { x: 18, l: "c", fill: "url(#pgs-ic-key)", lip: "#A84C08" },
          { x: 40, l: "s", fill: "#3FAE68", lip: "#14592F" },
          { x: 62, l: "m", fill: "url(#pgs-ic-key)", lip: "#A84C08" },
        ].map((k) => (
          <g key={k.l}>
            <rect x={k.x} y="66" width="20" height="20" rx="4" fill={k.lip} />
            <rect x={k.x} y="63" width="20" height="20" rx="4" fill={k.fill} />
            <text
              x={k.x + 10}
              y="78.5"
              textAnchor="middle"
              fontSize="14"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              fill="#FFFFFF"
            >
              {k.l}
            </text>
          </g>
        ))}
      </svg>
      {/* the sun on the sign's screen: the game's own Fluent picture */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/games/fluent3d/sun.png"
        alt=""
        className="absolute"
        style={{ left: "39%", top: "21%", width: "22%", height: "26%", objectFit: "contain" }}
      />
    </div>
  );
}
