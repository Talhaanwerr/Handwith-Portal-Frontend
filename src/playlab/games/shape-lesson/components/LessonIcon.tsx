import { HUES, LESSONS, type LessonId } from "@games/shape-lesson/constants/lessons";
import { SHAPE_PATHS } from "@games/shape-lesson/constants/shapes";

/** Each lesson's card: its sky, its ground, and one cue from its world. */
const CARD: Readonly<Record<LessonId, { sky: string; ground: string }>> = {
  circle: { sky: "#BDE6FF", ground: "#7ACB5C" },
  square: { sky: "#CFE6FF", ground: "#5B6577" },
  triangle: { sky: "#DDF4FF", ground: "#5DB346" },
  rectangle: { sky: "#FFE0B5", ground: "#C9B79C" },
  star: { sky: "#3B2580", ground: "#43307F" },
};

/**
 * The Library card of a MY SHAPES lesson: the lesson's world in miniature
 * with its shape standing big in the middle, a chunky sticker (white rim,
 * dark slab). Inline SVG only (the Library page does not load playlab.css);
 * nothing moves.
 */
export function LessonIcon({ lesson }: { lesson: LessonId }) {
  const card = CARD[lesson];
  const paint = HUES[LESSONS[lesson].hue];
  const d = SHAPE_PATHS[lesson];
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill={card.sky} />
        {lesson === "circle" && <circle cx="16" cy="16" r="9" fill="#FFE066" />}
        {lesson === "square" &&
          [8, 80].map((x) => (
            <g key={x}>
              <rect x={x} y="30" width="14" height="60" fill="#7FA9E6" />
              <rect x={x + 3} y="36" width="8" height="8" fill="#E8F2FF" />
              <rect x={x + 3} y="52" width="8" height="8" fill="#FFE066" />
            </g>
          ))}
        {lesson === "triangle" &&
          [10, 88].map((x) => (
            <path key={x} d={`M${x} 40 L${x + 10} 82 H${x - 10} Z`} fill="#2F8F4A" />
          ))}
        {lesson === "rectangle" && <rect x="0" y="90" width="100" height="3" fill="#8F96A3" />}
        {lesson === "star" &&
          [
            [12, 14],
            [86, 20],
            [20, 40],
            [80, 46],
          ].map(([x, y]) => <circle key={x} cx={x} cy={y} r="1.6" fill="#FFF3B0" />)}
        <path d="M0 82 Q30 76 55 80 T100 78 V100 H0 Z" fill={card.ground} />
        <g transform="translate(20 16) scale(0.6)">
          <path
            d={d}
            transform="translate(0 7)"
            fill={paint.edge}
            stroke={paint.edge}
            strokeWidth="9"
            strokeLinejoin="round"
          />
          <path d={d} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth="9" strokeLinejoin="round" />
          <path d={d} fill={paint.fill} />
        </g>
      </svg>
    </div>
  );
}
