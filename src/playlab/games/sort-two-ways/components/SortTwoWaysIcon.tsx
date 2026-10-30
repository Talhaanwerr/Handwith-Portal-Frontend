import { HUES, SHAPE_PATHS, type HueId, type ShapeId } from "@games/shape-match/constants/shapes";

/**
 * The Library card's scene for Sort Two Ways — the game's own board in
 * miniature: the playroom wall and table, the checked board with its two grey
 * trays (blue things on top, yellow below, one black silhouette still to
 * fill), and the white round bank with the loose shapes. The shapes are Leo's
 * Puzzles' own outlines and paint. Inline styles only: the Library page does
 * not load playlab.css.
 */

function Shape({
  shape,
  hue,
  x,
  y,
  s,
  shadow = false,
}: {
  shape: ShapeId;
  hue: HueId;
  x: number;
  y: number;
  s: number;
  shadow?: boolean;
}) {
  const paint = HUES[hue];
  return (
    <g transform={`translate(${x} ${y}) scale(${s / 40})`}>
      <path
        d={SHAPE_PATHS[shape]}
        fill={shadow ? "#2b2b33" : paint.fill}
        fillOpacity={shadow ? 0.75 : 1}
        stroke={shadow ? "none" : paint.edge}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
    </g>
  );
}

export function SortTwoWaysIcon() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1 / 1",
        overflow: "hidden",
        borderRadius: "22%",
        pointerEvents: "none",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        style={{ position: "absolute", inset: 0, display: "block", width: "100%", height: "100%" }}
      >
        <defs>
          <linearGradient id="stw-ic-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF8EC" />
            <stop offset="1" stopColor="#FFE9CF" />
          </linearGradient>
          <pattern id="stw-ic-check" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill="#FFF4E2" />
            <rect width="4" height="4" fill="#F1D7B4" />
            <rect x="4" y="4" width="4" height="4" fill="#F1D7B4" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#stw-ic-wall)" />
        <rect y="78" width="100" height="22" fill="#C08546" />
        <rect y="76" width="100" height="3" fill="#E8B77E" />

        {/* the checked board and its two grey trays */}
        <rect x="5" y="20" width="56" height="62" rx="6" fill="#C99A62" />
        <rect
          x="5"
          y="18"
          width="56"
          height="62"
          rx="6"
          fill="url(#stw-ic-check)"
          stroke="#FFFFFF"
          strokeWidth="1.6"
        />
        <rect x="9" y="23" width="48" height="24" rx="4" fill="#CDD2DB" stroke="#4B515E" />
        <rect x="9" y="51" width="48" height="24" rx="4" fill="#CDD2DB" stroke="#4B515E" />
        <Shape shape="circle" hue="sky" x={12} y={26} s={18} />
        <Shape shape="square" hue="sky" x={32} y={26} s={18} />
        <Shape shape="circle" hue="sun" x={12} y={54} s={18} />
        <Shape shape="square" hue="sun" x={32} y={54} s={18} shadow />

        {/* the bank: white round buttons, two by two */}
        {[
          [76, 34, "square", "sky"],
          [91, 34, "circle", "sun"],
          [76, 52, "square", "sun"],
          [91, 52, "circle", "sky"],
        ].map(([cx, cy, shape, hue]) => (
          <g key={`${cx}-${cy}`}>
            <circle cx={cx as number} cy={(cy as number) + 1.4} r="7.4" fill="#D6B98F" />
            <circle
              cx={cx as number}
              cy={cy as number}
              r="7.4"
              fill="#FFFFFF"
              stroke="#F3E6D3"
              strokeWidth="1"
            />
            <Shape
              shape={shape as ShapeId}
              hue={hue as HueId}
              x={(cx as number) - 5}
              y={(cy as number) - 5}
              s={10}
            />
          </g>
        ))}
        {/* a loose one on its way into the silhouette */}
        <path
          d="M72 60 Q62 72 50 66"
          stroke="#FFFFFF"
          strokeWidth="1.4"
          strokeDasharray="2.4 2"
          fill="none"
        />
      </svg>
    </div>
  );
}
