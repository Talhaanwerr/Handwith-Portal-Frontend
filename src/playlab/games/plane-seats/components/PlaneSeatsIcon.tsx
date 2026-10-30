/**
 * The Library card's scene for Plane Seats — the cabin (bins, a round window
 * with sky and a cloud, the carpet), one big blue seat with a 3 on its
 * headrest and the bear sitting in it, and a boarding pass with a 3. Inline
 * SVG (the Library page does not load playlab.css); the bear is the game's
 * own Fluent picture. Nothing moves.
 */
export function PlaneSeatsIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="pls-ic-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E9E2D4" />
            <stop offset="1" stopColor="#F8F3EA" />
          </linearGradient>
          <linearGradient id="pls-ic-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5DB8F2" />
            <stop offset="1" stopColor="#C9ECFF" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#pls-ic-wall)" />
        {/* the bins */}
        <rect width="100" height="16" fill="#DCE1E8" />
        <rect y="14" width="100" height="3" fill="#AEB7C4" />
        <path d="M33 0 V14 M66 0 V14" stroke="#C9D0DA" strokeWidth="1.5" />
        {/* a window */}
        <rect x="68" y="22" width="22" height="30" rx="11" fill="#FFFDF8" />
        <rect x="71" y="25" width="16" height="24" rx="8" fill="url(#pls-ic-sky)" />
        <ellipse cx="79" cy="40" rx="6" ry="2.6" fill="#FFFFFF" />
        <circle cx="77" cy="38" r="3" fill="#FFFFFF" />
        {/* the carpet */}
        <rect y="76" width="100" height="24" fill="#3E56A0" />
        <rect y="74" width="100" height="3" fill="#56606E" />
        {/* the seat */}
        <ellipse cx="34" cy="85" rx="25" ry="2.4" fill="rgba(20,30,70,0.3)" />
        <rect x="16" y="28" width="36" height="50" rx="10" fill="#1F4F94" />
        <rect x="16" y="26" width="36" height="50" rx="10" fill="#2F6FC4" />
        <rect x="20" y="29" width="28" height="16" rx="4" fill="#FFFFFF" />
        <text
          x="34"
          y="42"
          textAnchor="middle"
          fontSize="13"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#1F4F94"
        >
          3
        </text>
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/games/fluent3d/bear.png"
        alt=""
        className="absolute"
        style={{ left: "22%", top: "45%", width: "24%", height: "24%", objectFit: "contain" }}
      />
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        {/* the cushion and armrests, in front of the bear */}
        <rect x="12" y="66" width="44" height="12" rx="6" fill="#2A63B0" />
        <rect x="10" y="56" width="7" height="20" rx="3" fill="#244F91" />
        <rect x="51" y="56" width="7" height="20" rx="3" fill="#244F91" />
        {/* the boarding pass */}
        <g transform="rotate(-6 78 74)">
          <rect x="60" y="62" width="36" height="22" rx="4" fill="#C9C2B3" />
          <rect x="60" y="60" width="36" height="22" rx="4" fill="#FFFFFF" />
          <path d="M60 64 a4 4 0 0 1 4 -4 H72 V82 H64 a4 4 0 0 1 -4 -4Z" fill="#EF6F5E" />
          <text
            x="84"
            y="77"
            textAnchor="middle"
            fontSize="16"
            fontWeight="900"
            fontFamily="system-ui, sans-serif"
            fill="#1F4F94"
          >
            3
          </text>
        </g>
      </svg>
    </div>
  );
}
