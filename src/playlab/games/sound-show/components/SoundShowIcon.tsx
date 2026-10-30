/**
 * The Library card's scene for Sound Show — Phonics Game Show's studio (cream
 * wall, wooden floor, red curtains) with one big letter "s" on the lit sign
 * and two picture cards in front: the sun (glowing, the answer) and a cup.
 * Inline SVG only (the Library page does not load playlab.css); the two
 * pictures are the game's own Fluent images. Nothing moves.
 */
const BULBS = Array.from({ length: 7 }, (_, i) => 32 + i * 6);

export function SoundShowIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="snd-ic-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4A7FF0" />
            <stop offset="1" stopColor="#1F3FA6" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="#FBE9D6" />
        <rect y="74" width="100" height="26" fill="#D9934F" />
        <rect y="74" width="100" height="2" fill="#E8B077" />
        <path d="M0 0H16L13 30 7 48 11 100H0Z" fill="#C22A39" />
        <path d="M100 0H84L87 30 93 48 89 100H100Z" fill="#C22A39" />
        <path d="M5 0V100M95 0V100" stroke="#92162A" strokeWidth="2.4" />
        {/* the lit sign with the letter */}
        <rect x="28" y="8" width="44" height="40" rx="6" fill="#EAA526" />
        {BULBS.map((x) => (
          <g key={x}>
            <circle cx={x} cy="11" r="1.4" fill="#FFF6C8" />
            <circle cx={x} cy="45" r="1.4" fill="#FFF6C8" />
          </g>
        ))}
        <rect x="33" y="14" width="34" height="28" rx="3.5" fill="url(#snd-ic-screen)" />
        <text
          x="50"
          y="37"
          textAnchor="middle"
          fontSize="26"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#FFFFFF"
        >
          s
        </text>
        {/* the two picture cards: the answer glows */}
        <rect x="19" y="57" width="27" height="27" rx="5" fill="#FFE27A" />
        <rect x="21" y="59" width="23" height="23" rx="4" fill="#FFFFFF" />
        <rect x="54" y="57" width="27" height="27" rx="5" fill="#F0C870" />
        <rect x="56" y="59" width="23" height="23" rx="4" fill="#FFFFFF" />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/games/fluent3d/sun.png"
        alt=""
        className="absolute"
        style={{ left: "23%", top: "61%", width: "19%", height: "19%", objectFit: "contain" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/games/fluent3d/teacup_without_handle.png"
        alt=""
        className="absolute"
        style={{ left: "58%", top: "61%", width: "19%", height: "19%", objectFit: "contain" }}
      />
    </div>
  );
}
