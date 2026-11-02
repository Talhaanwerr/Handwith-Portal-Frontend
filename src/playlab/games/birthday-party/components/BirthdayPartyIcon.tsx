/**
 * The Library card's scene for Birthday Party — the party in Candy Land: a
 * pastel candy sky over pink hills, a frilled party table, the birthday cake
 * with three lit candles, and a cupcake (the Twemoji cupcake the game plays
 * with) on a plate. Inline SVG only: the Library page does not load
 * playlab.css. Nothing moves.
 */
export function BirthdayPartyIcon() {
  const cupcake = "/games/blend-read/icons/cupcake.svg";
  const candles = [
    { x: 38, band: "#54A0FF" },
    { x: 50, band: "#FF7EA8" },
    { x: 62, band: "#3DCB8A" },
  ];
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="bdc-ic-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9FD9FF" />
            <stop offset="0.45" stopColor="#CDD6FF" />
            <stop offset="0.8" stopColor="#FFB5D6" />
            <stop offset="1" stopColor="#FFE3EE" />
          </linearGradient>
        </defs>
        {/* the candy sky, a cloud, the hills */}
        <rect width="100" height="100" fill="url(#bdc-ic-sky)" />
        <g fill="#FFFFFF" opacity="0.9">
          <circle cx="16" cy="18" r="6" />
          <circle cx="24" cy="15" r="8" />
          <circle cx="32" cy="19" r="5.5" />
          <rect x="14" y="18" width="20" height="6" rx="3" />
        </g>
        <path d="M0 58 Q22 44 46 56 Q70 46 100 56 L100 100 L0 100 Z" fill="#A6E9CB" />
        <path d="M0 64 Q30 54 60 64 Q82 58 100 64 L100 100 L0 100 Z" fill="#7CCB8F" />

        {/* the party table */}
        <rect x="2" y="70" width="96" height="10" rx="3" fill="#FFE3EE" />
        <rect x="2" y="78" width="96" height="22" fill="#FF8FB8" />
        <g fill="#FFD93D">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <path key={i} d={`M${2 + i * 12} 78 l12 0 l-6 6 z`} />
          ))}
        </g>

        {/* the cake on its plate */}
        <ellipse cx="50" cy="73" rx="27" ry="3.4" fill="#D9CCE8" />
        <ellipse cx="50" cy="72" rx="26" ry="3" fill="#FFFFFF" />
        <path d="M28 52 L28 68 Q50 74 72 68 L72 52 Z" fill="#FFB3CB" />
        <path d="M28 60 Q50 65 72 60 L72 63 Q50 68 28 63 Z" fill="#FFF4DE" />
        <ellipse cx="50" cy="52" rx="22" ry="5" fill="#FFE3EE" />
        <path
          d="M28 52 Q28 57 31 57 Q34 57 34 55 Q36 60 40 60 Q44 60 44 56 Q48 59 52 59 Q56 59 57 56 Q60 61 64 61 Q68 61 68 56 Q71 57 72 52 Q72 56 50 56 Q28 56 28 52 Z"
          fill="#FF7EA8"
        />
        {/* three lit candles */}
        {candles.map((c) => (
          <g key={c.x}>
            <rect x={c.x - 2.2} y="38" width="4.4" height="14" rx="1.4" fill="#FFFFFF" />
            <path d={`M${c.x - 2.2} 42 l4.4 -1.6 l0 2 l-4.4 1.6 z`} fill={c.band} />
            <path d={`M${c.x - 2.2} 47 l4.4 -1.6 l0 2 l-4.4 1.6 z`} fill={c.band} />
            <circle cx={c.x} cy="33" r="4.4" fill="#FFD966" opacity="0.4" />
            <path
              d={`M${c.x} 28 Q${c.x + 3} 33 ${c.x + 2} 35.5 Q${c.x} 37.5 ${c.x - 2} 35.5 Q${c.x - 3} 33 ${c.x} 28 Z`}
              fill="#FFA726"
            />
            <path
              d={`M${c.x} 31.5 Q${c.x + 1.4} 34 ${c.x + 0.8} 35.4 Q${c.x} 36.4 ${c.x - 0.8} 35.4 Q${c.x - 1.4} 34 ${c.x} 31.5 Z`}
              fill="#FFF3A0"
            />
          </g>
        ))}

        {/* a cupcake on a plate */}
        <ellipse cx="85" cy="77" rx="12" ry="3" fill="#D9CCE8" />
        <ellipse cx="85" cy="76" rx="11.4" ry="2.6" fill="#FFFFFF" />
        <image href={cupcake} x="74" y="55" width="22" height="22" />
      </svg>
    </div>
  );
}
