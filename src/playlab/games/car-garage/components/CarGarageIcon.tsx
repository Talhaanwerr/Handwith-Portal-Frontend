import { CarArt } from "@games/car-garage/components/CarArt";

/**
 * The Library card's scene for Build-a-Car Garage — the garage yard (sky and
 * sun, the workshop, the dirt) with a red car half built on the yellow
 * scissor lift: body and two wheels on, its other wheels' places glowing,
 * and the next wheel waiting beside it. Inline SVG and inline sizes only —
 * the Library page does not load playlab.css (the car draws with
 * presentation attributes alone). Nothing moves.
 */
export function CarGarageIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="bcg-ic-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#79C4E8" />
            <stop offset="1" stopColor="#CFEAF7" />
          </linearGradient>
          <linearGradient id="bcg-ic-dirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#B07A46" />
            <stop offset="1" stopColor="#8A5B30" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#bcg-ic-sky)" />
        <circle cx="80" cy="18" r="8" fill="#FFD873" />
        <circle cx="80" cy="18" r="12" fill="#FFD873" opacity="0.25" />
        {/* the workshop */}
        <rect
          x="8"
          y="34"
          width="34"
          height="26"
          rx="2"
          fill="#E8CE9A"
          stroke="#54321A"
          strokeWidth="1.4"
        />
        <path
          d="M5 36 L25 24 L45 36 Z"
          fill="#8C99A6"
          stroke="#4A5560"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <rect
          x="15"
          y="44"
          width="9"
          height="16"
          rx="1"
          fill="#9A6534"
          stroke="#54321A"
          strokeWidth="1"
        />
        <rect
          x="28"
          y="43"
          width="10"
          height="8"
          rx="1"
          fill="#BDE3F4"
          stroke="#54321A"
          strokeWidth="1"
        />
        {/* the yard */}
        <path d="M0 58 Q30 54 60 58 Q80 61 100 57 V100 H0 Z" fill="url(#bcg-ic-dirt)" />
        <ellipse cx="30" cy="80" rx="18" ry="4" fill="#E8CE9A" opacity="0.6" />
        {/* the scissor lift */}
        <g stroke="#A87408" strokeWidth="2.4" strokeLinecap="round">
          <path d="M14 78 L40 88" />
          <path d="M14 88 L40 78" stroke="#F2B824" />
          <path d="M48 78 L74 88" />
          <path d="M48 88 L74 78" stroke="#F2B824" />
        </g>
        <rect x="8" y="88" width="72" height="3" rx="1" fill="#65727F" />
        <rect
          x="6"
          y="74"
          width="80"
          height="3"
          rx="1.2"
          fill="#C9CDD2"
          stroke="#4A5560"
          strokeWidth="0.8"
        />
        <rect
          x="6"
          y="76.6"
          width="80"
          height="2.6"
          rx="1"
          fill="#F2B824"
          stroke="#4A5560"
          strokeWidth="0.8"
        />
      </svg>
      {/* the car on the lift: its wheels stand on the platform (y = 74) */}
      <div style={{ position: "absolute", left: "4%", top: "33.5%", width: "84%", height: "42%" }}>
        <CarArt
          body="car"
          colour="red"
          on={["body", "lights", "wheel-0", "wheel-2"]}
          ghost
          glow={["wheel-1", "wheel-3"]}
          face="sleep"
        />
      </div>
      {/* the next wheel, waiting */}
      <svg
        viewBox="0 0 44 44"
        style={{ position: "absolute", right: "3%", bottom: "4%", width: "22%", height: "22%" }}
      >
        <circle cx="22" cy="22" r="20" fill="#2F3640" stroke="#1E232A" strokeWidth="2.5" />
        <circle cx="22" cy="22" r="10" fill="#D3DAE2" stroke="#8C99A6" strokeWidth="2" />
        <circle cx="22" cy="22" r="3.4" fill="#8C99A6" />
      </svg>
    </div>
  );
}
