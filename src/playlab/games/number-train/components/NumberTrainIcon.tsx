/**
 * The Library card's scene for Number Train: a garden, a railway, and the
 * engine pulling carriages 1, 2 and 3. Inline SVG only: the Library page does
 * not load playlab.css. Nothing moves.
 */
export function NumberTrainIcon() {
  const cars = [
    { n: 1, face: "#E5484D", edge: "#B8363A" },
    { n: 2, face: "#F08A24", edge: "#C06A12" },
    { n: 3, face: "#3DAB72", edge: "#2B8A57" },
  ];
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill="#BFE6FF" />
        <circle cx="80" cy="18" r="9" fill="#FFD84D" />
        <ellipse cx="25" cy="62" rx="40" ry="18" fill="#8BD17C" />
        <ellipse cx="80" cy="64" rx="36" ry="16" fill="#7CC56E" />
        <rect y="62" width="100" height="38" fill="#6DBB5E" />
        {/* the railway */}
        {Array.from({ length: 11 }, (_, i) => (
          <rect key={i} x={i * 10 - 2} y="73" width="4" height="7" fill="#9B6A3C" />
        ))}
        <rect y="73" width="100" height="1.6" fill="#6B6F7D" />
        <rect y="78.4" width="100" height="1.6" fill="#6B6F7D" />
        {/* the carriages */}
        {cars.map((c, i) => {
          const x = 4 + i * 19;
          return (
            <g key={c.n}>
              <rect x={x} y="52" width="17" height="16" rx="2.5" fill={c.face} />
              <rect x={x} y="64" width="17" height="4" rx="1.5" fill={c.edge} />
              <circle cx={x + 8.5} cy="59" r="5.4" fill="#FFFFFF" />
              <text
                x={x + 8.5}
                y="62.2"
                textAnchor="middle"
                fontSize="9"
                fontWeight="900"
                fill={c.edge}
                fontFamily="system-ui, sans-serif"
              >
                {c.n}
              </text>
              <circle cx={x + 4} cy="70" r="3.2" fill="#3B3B4A" />
              <circle cx={x + 13} cy="70" r="3.2" fill="#3B3B4A" />
            </g>
          );
        })}
        {/* the engine, facing right */}
        <g transform="translate(61 40)">
          <rect x="0" y="6" width="14" height="22" rx="2" fill="#E5484D" />
          <rect x="-1" y="3" width="16" height="4" rx="1.5" fill="#8A2A2E" />
          <rect x="3" y="10" width="8" height="7" rx="1.5" fill="#CDEBFF" />
          <rect x="13" y="14" width="22" height="14" rx="6" fill="#2E7FD6" />
          <rect x="26" y="6" width="5" height="9" rx="1" fill="#3B3B4A" />
          <circle cx="7" cy="30" r="4.6" fill="#3B3B4A" />
          <circle cx="21" cy="30" r="3.6" fill="#3B3B4A" />
          <circle cx="30" cy="30" r="3.6" fill="#3B3B4A" />
          <circle cx="32" cy="1" r="3" fill="#FFFFFF" opacity="0.9" />
          <circle cx="37" cy="-4" r="4" fill="#FFFFFF" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
}
