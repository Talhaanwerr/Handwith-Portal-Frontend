/**
 * The Library card's scene for What's Inside? — the pirate cove (sea, the
 * sandy beach), a treasure chest with its lid lifted a crack and a cat's
 * ears peeking out over the rim (the portal's Twemoji cat), and a big
 * question mark. Inline SVG only: the Library page does not load
 * playlab.css. Nothing moves.
 */
export function WhatsInsideIcon() {
  const cat = "/games/blend-read/icons/cat.svg";
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="wsi-ic-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5FB4D9" />
            <stop offset="0.6" stopColor="#2E86AB" />
            <stop offset="1" stopColor="#155E86" />
          </linearGradient>
          <linearGradient id="wsi-ic-sand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F2DFA9" />
            <stop offset="1" stopColor="#DFC581" />
          </linearGradient>
          <linearGradient id="wsi-ic-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#C08A4F" />
            <stop offset="1" stopColor="#6E4522" />
          </linearGradient>
          <clipPath id="wsi-ic-mouth">
            <rect x="0" y="0" width="100" height="56" />
          </clipPath>
        </defs>
        {/* the cove: sea, a foam line, the beach */}
        <rect width="100" height="100" fill="url(#wsi-ic-sea)" />
        <path
          d="M0 30 Q12 26 25 30 T50 30 T75 30 T100 30"
          fill="none"
          stroke="#EAF7FD"
          strokeWidth="1.6"
          opacity="0.5"
        />
        <path d="M-4 100 Q8 66 50 62 Q92 66 104 100 Z" fill="url(#wsi-ic-sand)" />

        {/* the lid, lifted a crack on its hinge, behind the toy */}
        <g transform="rotate(-26 22 56)">
          <path
            d="M22 56 V47 Q22 30 50 30 Q78 30 78 47 V56 Z"
            fill="url(#wsi-ic-wood)"
            stroke="#54321A"
            strokeWidth="1.6"
          />
          <rect x="36" y="31" width="5" height="25" rx="1.6" fill="#E0A85E" />
          <rect x="59" y="31" width="5" height="25" rx="1.6" fill="#E0A85E" />
        </g>
        <path d="M24 57 Q24 49 50 48 Q76 49 76 57 Z" fill="#3B2312" />
        {/* the cat's ears over the rim */}
        <image href={cat} x="33" y="38" width="34" height="34" clipPath="url(#wsi-ic-mouth)" />
        {/* the chest's front */}
        <ellipse cx="50" cy="88" rx="32" ry="3.6" fill="#5A3A1A" opacity="0.25" />
        <path d="M22 59 H78 V82 Q78 88 72 88 H28 Q22 88 22 82 Z" fill="#54321A" />
        <path
          d="M22 56 H78 V79 Q78 85 72 85 H28 Q22 85 22 79 Z"
          fill="url(#wsi-ic-wood)"
          stroke="#54321A"
          strokeWidth="1.6"
        />
        <rect x="36" y="56" width="5" height="29" rx="1.6" fill="#E0A85E" />
        <rect x="59" y="56" width="5" height="29" rx="1.6" fill="#E0A85E" />
        <rect
          x="45.5"
          y="55"
          width="9"
          height="10"
          rx="2.4"
          fill="#F2C14E"
          stroke="#A56E1C"
          strokeWidth="1.2"
        />

        {/* the question */}
        <circle cx="82" cy="20" r="12" fill="#FFFFFF" />
        <text
          x="82"
          y="26"
          textAnchor="middle"
          fontSize="17"
          fontWeight="900"
          fill="#C06A12"
          fontFamily="system-ui, sans-serif"
        >
          ?
        </text>
      </svg>
    </div>
  );
}
