/**
 * The Library card's scene for Feed the Fish: light blue water over sand,
 * a seaweed bed, food flakes sinking and a round orange fish with its mouth
 * open to catch one. Inline SVG and flat colours only — the Library page
 * does not load playlab.css or the game's gradients. Nothing moves.
 */
export function FeedTheFishIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="ftf-ic-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6fc7ef" />
            <stop offset="1" stopColor="#2e8fc4" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#ftf-ic-water)" />
        <rect width="100" height="10" fill="#ffffff" opacity="0.25" />
        <path d="M0 86 Q25 80 50 85 Q75 90 100 83 V100 H0 Z" fill="#f2e3bc" />
        {/* seaweed */}
        <path d="M14 88 C8 74 20 66 13 52 C22 62 22 74 20 88 Z" fill="#55a86d" />
        <path d="M20 88 C18 72 28 66 25 56 C32 66 28 76 27 88 Z" fill="#7ccb8f" />
        <path d="M84 86 C80 74 90 68 86 58 C94 68 92 76 90 86 Z" fill="#6fd1a6" />
        {/* bubbles */}
        <circle cx="80" cy="30" r="3" fill="#ffffff" opacity="0.5" />
        <circle cx="86" cy="20" r="2" fill="#ffffff" opacity="0.5" />
        <circle cx="76" cy="14" r="1.6" fill="#ffffff" opacity="0.5" />
        {/* flakes */}
        <circle cx="62" cy="22" r="3" fill="#ffa868" />
        <circle cx="70" cy="40" r="3" fill="#f08a45" />
        {/* the fish, mouth open towards the flake */}
        <path d="M28 58 L12 46 L12 72 Z" fill="#f08a45" />
        <path d="M36 42 Q46 30 58 40 Z" fill="#f08a45" />
        <ellipse cx="46" cy="58" rx="22" ry="16" fill="#ffa868" />
        <ellipse cx="48" cy="65" rx="14" ry="6" fill="#ffffff" opacity="0.3" />
        <circle cx="56" cy="53" r="5" fill="#ffffff" />
        <circle cx="57" cy="53.5" r="2.8" fill="#3d3d5c" />
        <ellipse cx="67" cy="59" rx="3" ry="3.8" fill="#7a2e46" />
        <circle cx="60" cy="62" r="2.2" fill="#ff8fb0" opacity="0.6" />
      </svg>
    </div>
  );
}
