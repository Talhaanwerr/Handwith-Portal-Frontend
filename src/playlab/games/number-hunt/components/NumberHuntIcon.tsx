/**
 * The Library card's scene for Number Hunt — its two modules in Berry's room:
 * bunting over a dotted wall, a wooden floor with the rainbow rug, a ball
 * wearing its 5 (the Twemoji ball the word games ship), and a purple dot card
 * dropping into the orange box numbered 4. Inline SVG only: the Library page
 * does not load playlab.css. Nothing moves.
 */
export function NumberHuntIcon() {
  const ball = "/games/blend-read/icons/ball.svg";
  const flags = ["#E5484D", "#F2C94C", "#3DAB72", "#2E7FD6", "#8E5BD9", "#FF7EA8"];
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <pattern id="nh-ic-dots" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="0.9" fill="#F3DDB3" />
          </pattern>
          <linearGradient id="nh-ic-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D9A066" />
            <stop offset="1" stopColor="#B97E48" />
          </linearGradient>
        </defs>
        {/* the wall, the wainscot and the floor */}
        <rect width="100" height="100" fill="#FFF3DC" />
        <rect width="100" height="60" fill="url(#nh-ic-dots)" />
        <rect y="52" width="100" height="10" fill="#8FD3C1" />
        <rect y="52" width="100" height="1.6" fill="#FFFFFF" />
        <rect y="62" width="100" height="38" fill="url(#nh-ic-floor)" />
        {/* the bunting */}
        <path d="M-2 6 Q50 16 102 6" fill="none" stroke="#9B6A3C" strokeWidth="0.9" />
        {flags.map((c, i) => {
          const x = 4 + i * 16.5;
          const y = 7.4 + Math.sin((i / 5) * Math.PI) * 4;
          return <path key={c} d={`M${x} ${y} l9 0 l-4.5 9 z`} fill={c} />;
        })}
        {/* the rainbow rug */}
        <ellipse cx="50" cy="86" rx="46" ry="12" fill="#E5484D" />
        <ellipse cx="50" cy="86" rx="39" ry="9.6" fill="#F2C94C" />
        <ellipse cx="50" cy="86" rx="32" ry="7.4" fill="#3DAB72" />
        <ellipse cx="50" cy="86" rx="25" ry="5.4" fill="#2E7FD6" />
        <ellipse cx="50" cy="86" rx="18" ry="3.6" fill="#FFF3DC" />

        {/* a ball wearing its 5 */}
        <ellipse cx="30" cy="82" rx="15" ry="3.4" fill="rgba(60,40,20,0.22)" />
        <image href={ball} x="9" y="46" width="38" height="38" />
        <circle cx="42" cy="78" r="9" fill="#1F5FA6" />
        <circle cx="42" cy="77" r="9" fill="#FFFFFF" stroke="#2E7FD6" strokeWidth="2" />
        <text
          x="42"
          y="81.6"
          textAnchor="middle"
          fontSize="13"
          fontWeight="900"
          fill="#1F5FA6"
          fontFamily="system-ui, sans-serif"
        >
          5
        </text>

        {/* a dot card dropping into box 4 */}
        <rect x="58" y="26" width="30" height="30" rx="4.5" fill="#A98BE0" />
        <rect
          x="58"
          y="24"
          width="30"
          height="30"
          rx="4.5"
          fill="#FFFFFF"
          stroke="#D9C8F5"
          strokeWidth="1.6"
        />
        <g fill="#8E5BD9">
          <circle cx="66" cy="32" r="3.4" />
          <circle cx="80" cy="32" r="3.4" />
          <circle cx="66" cy="46" r="3.4" />
          <circle cx="80" cy="46" r="3.4" />
        </g>
        <rect x="56" y="56" width="34" height="8" rx="2" fill="#C06A12" />
        <rect x="54" y="62" width="38" height="24" rx="3.5" fill="#C06A12" />
        <rect x="54" y="60" width="38" height="24" rx="3.5" fill="#F08A24" />
        <circle cx="73" cy="72" r="8" fill="#FFFFFF" />
        <text
          x="73"
          y="76.6"
          textAnchor="middle"
          fontSize="13"
          fontWeight="900"
          fill="#C06A12"
          fontFamily="system-ui, sans-serif"
        >
          4
        </text>
      </svg>
    </div>
  );
}
