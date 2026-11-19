/**
 * The Library card's scene for Finish My Song: a golden evening sky with a
 * low sun, a branch with the robin singing (a music note beside it), and the
 * nest below with a hat sitting up in a cracked blue egg. Inline SVG and
 * images only (the Library page does not load playlab.css). Nothing moves.
 */
export function FinishSongIcon() {
  const pic = (f: string) => `/games/fluent3d/${f}.png`;
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="fms-icon-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F7A26B" />
            <stop offset="1" stopColor="#FFE7B8" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#fms-icon-sky)" />
        <circle cx="74" cy="64" r="16" fill="#FFE07A" />
        <path d="M0 70 Q50 58 100 68 V100 H0 Z" fill="#A6B24C" />
        <rect x="-4" y="36" width="58" height="6" rx="3" fill="#6E4A2C" />
        <ellipse cx="30" cy="27" rx="12" ry="10" fill="#8A5A34" />
        <ellipse cx="33" cy="30" rx="8" ry="7" fill="#F2873A" />
        <circle cx="38" cy="19" r="7" fill="#8A5A34" />
        <circle cx="40" cy="18" r="1.6" fill="#1F1A24" />
        <path d="M44 17 L51 19 L44 21 Z" fill="#F6C33B" />
        <ellipse cx="64" cy="20" rx="3.4" ry="2.6" fill="#7A5BC4" />
        <rect x="66.4" y="8" width="1.6" height="12" fill="#7A5BC4" />
        <path d="M18 76 Q50 70 82 76 Q80 94 50 96 Q20 94 18 76 Z" fill="#A8743F" />
        <path d="M34 80 C34 64 40 52 50 52 C60 52 66 64 66 80 Z" fill="#BFE3F2" />
        <image href={pic("top_hat")} x="35" y="46" width="30" height="30" />
        <path d="M14 80 Q50 92 86 80 Q84 96 50 98 Q16 96 14 80 Z" fill="#8A5A34" />
      </svg>
    </div>
  );
}
