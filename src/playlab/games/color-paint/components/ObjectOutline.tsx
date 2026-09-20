import {
  ART_BOX,
  OUTLINE_WIDTH,
  type PaintActivity,
} from "@games/color-paint/constants/activities";
import { OUTLINE_INK, PAINT_COLORS } from "@games/color-paint/constants/colors";

interface ObjectOutlineProps {
  activity: PaintActivity;
  /** Fill every part with the colour it is "meant" to be. Used by the finale
   *  and the celebration, where the picture is shown finished. */
  filled?: boolean;
  className?: string;
}

/**
 * The colouring-book line for one object: each part traced in thick ink, with
 * the detail lines (stem, vein, segments) laid over the top.
 *
 * On the easel it sits ABOVE the paint canvas, so the line stays crisp however
 * heavily the child scribbles beneath it — the paint goes under the drawing,
 * like a real colouring book.
 */
export function ObjectOutline({ activity, filled = false, className = "" }: ObjectOutlineProps) {
  return (
    <svg
      viewBox={`0 0 ${ART_BOX} ${ART_BOX}`}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g
        stroke={OUTLINE_INK}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {activity.regions.map((r) => (
          <path key={r.id} d={r.path} fill={filled ? PAINT_COLORS[r.suggested].fill : "none"} />
        ))}
        {activity.details.map((d) => (
          <path key={d} d={d} fill="none" />
        ))}
      </g>
    </svg>
  );
}
