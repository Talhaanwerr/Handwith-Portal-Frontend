/**
 * The Library card's scene for Snack Time in the Sky — inside the
 * aeroplane: the overhead bins, a big round window with the sky, a cloud
 * and a bird flying past, and the silver snack trolley on the blue carpet
 * with juice and an apple on top. Inline SVG only (the Library page does not
 * load playlab.css); the bird and the snacks are the portal's Fluent
 * pictures. Nothing moves.
 */
const PICS = [
  { src: "/games/fluent3d/bird.png", left: 50, top: 17, size: 16 },
  { src: "/games/fluent3d/beverage_box.png", left: 26, top: 55, size: 17 },
  { src: "/games/fluent3d/red_apple.png", left: 46, top: 57, size: 15 },
] as const;

export function PlaneSnacksIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="psn-ic-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e6ddcb" />
            <stop offset="1" stopColor="#faf6ee" />
          </linearGradient>
          <linearGradient id="psn-ic-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3f9fe8" />
            <stop offset="1" stopColor="#d4f0ff" />
          </linearGradient>
          <linearGradient id="psn-ic-cart" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a7b1bf" />
            <stop offset="0.25" stopColor="#eef1f5" />
            <stop offset="0.7" stopColor="#f6f8fa" />
            <stop offset="1" stopColor="#a2acba" />
          </linearGradient>
          <clipPath id="psn-ic-glass">
            <rect x="26" y="13" width="48" height="30" rx="14" />
          </clipPath>
        </defs>
        <rect width="100" height="100" fill="url(#psn-ic-wall)" />
        {/* the overhead bins */}
        <rect width="100" height="9" fill="#c9d0da" />
        <rect x="2" y="0" width="46" height="8" rx="2.5" fill="#eef1f5" />
        <rect x="52" y="0" width="46" height="8" rx="2.5" fill="#eef1f5" />
        {/* the big window */}
        <rect x="20" y="9" width="60" height="40" rx="19" fill="#d6cab3" />
        <rect x="20" y="8" width="60" height="40" rx="19" fill="#fffdf8" />
        <rect x="23" y="11" width="54" height="34" rx="16" fill="#e2d7c3" />
        <g clipPath="url(#psn-ic-glass)">
          <rect x="26" y="13" width="48" height="30" fill="url(#psn-ic-sky)" />
          <circle cx="66" cy="21" r="4" fill="#ffe27a" />
          <ellipse cx="38" cy="34" rx="9" ry="3.4" fill="#ffffff" />
          <circle cx="35" cy="31.5" r="3.6" fill="#ffffff" />
          <circle cx="40.5" cy="30.5" r="4.4" fill="#ffffff" />
          <path d="M26 43 V39 L64 33 L66 36 L26 45Z" fill="#f2f5f9" />
          <path d="M62 33.5 L66 27 L67.5 28 L66 36Z" fill="#e8574a" />
          <rect x="26" y="13" width="48" height="3.6" fill="#f2ece0" />
        </g>
        {/* the carpet */}
        <rect y="78" width="100" height="22" fill="#3f569b" />
        <rect y="76.5" width="100" height="2" fill="#7b8696" />
        {/* the trolley */}
        <rect x="18" y="70" width="52" height="4" rx="2" fill="#c7cfda" />
        <rect x="21" y="73" width="46" height="15" rx="2" fill="url(#psn-ic-cart)" />
        <rect x="21" y="74" width="46" height="1.8" fill="#e8574a" />
        <rect
          x="24"
          y="77.5"
          width="18"
          height="8"
          rx="1.4"
          fill="#e9edf2"
          stroke="#a9b3c1"
          strokeWidth="0.6"
        />
        <rect
          x="46"
          y="77.5"
          width="18"
          height="8"
          rx="1.4"
          fill="#e9edf2"
          stroke="#a9b3c1"
          strokeWidth="0.6"
        />
        <rect x="30" y="81" width="6" height="1.4" rx="0.7" fill="#8e99a9" />
        <rect x="52" y="81" width="6" height="1.4" rx="0.7" fill="#8e99a9" />
        <path
          d="M67 75 H73 Q75 75 75 77 V81 Q75 83 73 83 H67"
          fill="none"
          stroke="#8e99a9"
          strokeWidth="1.8"
        />
        <circle cx="26" cy="90" r="3" fill="#3e4552" />
        <circle cx="62" cy="90" r="3" fill="#3e4552" />
        <circle cx="26" cy="90" r="1.1" fill="#c9d0da" />
        <circle cx="62" cy="90" r="1.1" fill="#c9d0da" />
      </svg>
      {PICS.map((p) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={p.src}
          src={p.src}
          alt=""
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}%`,
            height: `${p.size}%`,
            objectFit: "contain",
          }}
        />
      ))}
    </div>
  );
}
