/**
 * The Library card's scene for Odd Sound Out — Phonics Game Show's studio
 * (cream wall, wooden floor, red curtains), a "?" on the lit sign, and four
 * picture cards: three b's (ball, bus, bed) and the odd cat, lit green.
 * Inline SVG only (the Library page does not load playlab.css); the pictures
 * are the game's own Fluent images and the cat photo. Nothing moves.
 */
const BULBS = Array.from({ length: 5 }, (_, i) => 38 + i * 6);
const CARDS = [
  { x: 6, src: "/games/fluent3d/soccer_ball.png", rim: "#C9A7E8" },
  { x: 29, src: "/games/jungle-spy/animals/cat.jpg", rim: "#34A95A" },
  { x: 52, src: "/games/fluent3d/bus.png", rim: "#C9A7E8" },
  { x: 75, src: "/games/fluent3d/bed.png", rim: "#C9A7E8" },
];

export function OddSoundIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="odd-ic-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4A7FF0" />
            <stop offset="1" stopColor="#1F3FA6" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="#FBE9D6" />
        <rect y="72" width="100" height="28" fill="#D9934F" />
        <rect y="72" width="100" height="2" fill="#E8B077" />
        <path d="M0 0H12L10 30 5 48 8 100H0Z" fill="#C22A39" />
        <path d="M100 0H88L90 30 95 48 92 100H100Z" fill="#C22A39" />
        <rect x="34" y="12" width="32" height="30" rx="5" fill="#EAA526" />
        {BULBS.map((x) => (
          <g key={x}>
            <circle cx={x} cy="15" r="1.3" fill="#FFF6C8" />
            <circle cx={x} cy="39" r="1.3" fill="#FFF6C8" />
          </g>
        ))}
        <rect x="38" y="18" width="24" height="18" rx="3" fill="url(#odd-ic-screen)" />
        <text
          x="50"
          y="33"
          textAnchor="middle"
          fontSize="15"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#FFFFFF"
        >
          ?
        </text>
        {CARDS.map((c) => (
          <g key={c.x}>
            <rect x={c.x} y="54" width="19" height="19" rx="4" fill={c.rim} />
            <rect x={c.x + 1.6} y="55.6" width="15.8" height="15.8" rx="3" fill="#FFFFFF" />
          </g>
        ))}
      </svg>
      {CARDS.map((c) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={c.src}
          src={c.src}
          alt=""
          className="absolute"
          style={{
            left: `${c.x + 2.4}%`,
            top: "56.4%",
            width: "14.2%",
            height: "14.2%",
            objectFit: "cover",
            borderRadius: "2px",
          }}
        />
      ))}
    </div>
  );
}
