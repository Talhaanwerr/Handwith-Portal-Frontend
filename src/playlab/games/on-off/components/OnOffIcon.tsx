/**
 * The Library card's scene for On & Off — the game's own playroom in
 * miniature: the butter-yellow wall and honey floor of the room the game
 * opens in, the Twemoji bed, the teddy sitting ON it, and its black
 * silhouette waiting on the floor with a dotted route between — the whole
 * mechanic in one picture. Inline SVG only: the Library page does not load
 * playlab.css.
 */
const ICONS = "/games/blend-read/icons";

export function OnOffIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <filter id="oo-ic-black">
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.78 0" />
          </filter>
        </defs>
        {/* wall with soft dots, the mint wainscot, the floor */}
        <rect width="100" height="100" fill="#FFE7AD" />
        {[12, 36, 60, 84].map((x) =>
          [10, 30].map((y) => (
            <circle
              key={`${x}-${y}`}
              cx={x + (y === 30 ? 12 : 0)}
              cy={y}
              r="3.2"
              fill="#FFFFFF"
              opacity="0.7"
            />
          ))
        )}
        <rect y="46" width="100" height="14" fill="#92D9C3" />
        <rect y="44" width="100" height="3" fill="#FFFFFF" />
        <rect y="62" width="100" height="38" fill="#EDB877" />
        <rect y="60" width="100" height="3" fill="#FFFAF0" />
        <path d="M0 75h100M0 88h100" stroke="#C98B4E" strokeWidth="1" />

        {/* the bed, the teddy ON it, its silhouette on the floor */}
        <image href={`${ICONS}/bed.svg`} x="2" y="30" width="62" height="62" />
        <image href={`${ICONS}/toys.svg`} x="30" y="30" width="24" height="24" />
        <image
          href={`${ICONS}/toys.svg`}
          x="70"
          y="66"
          width="24"
          height="24"
          filter="url(#oo-ic-black)"
        />
        <path
          d="M48 30 Q76 18 82 62"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray="0.5 5"
          fill="none"
        />
        <path
          d="M77 57 L82 64 L87 57"
          stroke="#FFFFFF"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* ON / OFF tag */}
        <rect x="6" y="6" width="40" height="15" rx="7.5" fill="#FFFFFF" />
        <text
          x="26"
          y="17.4"
          textAnchor="middle"
          fontSize="10.5"
          fontWeight="900"
          fontFamily="ui-rounded, 'Nunito', system-ui, sans-serif"
        >
          <tspan fill="#2F9E5B">ON</tspan>
          <tspan fill="#8A5A2E"> · </tspan>
          <tspan fill="#E5484D">OFF</tspan>
        </text>
      </svg>
    </div>
  );
}
