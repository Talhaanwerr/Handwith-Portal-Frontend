import { OUTLINE_INK } from "@games/color-paint/constants/colors";
import {
  VEHICLES,
  mcFill,
  type Terrain,
  type VehicleId,
} from "@games/magic-colours/constants/vehicles";

/**
 * A Library card's scene for one of the six Magic Colours games: the game's
 * world in a few flat shapes and one of its vehicles, half coloured in (the
 * parts in `done` in their colours, the rest still white). Inline SVG only —
 * the Library page does not load playlab.css. Nothing moves. Each game's
 * folder wraps it (`ColoursRoadIcon` …) with its own vehicle and scene.
 */
export function McSceneIcon({
  vehicle,
  done,
  scene,
  uid,
}: {
  vehicle: VehicleId;
  done: readonly string[];
  scene: Terrain;
  /** Prefix for the SVG's gradient id (ids are document-wide). */
  uid: string;
}) {
  const v = VEHICLES[vehicle];
  const on = new Set(done);
  const y = scene === "sea" ? 34 : v.grounded ? 30 : 22;
  const dark = scene === "space";
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={dark ? "#0b1330" : "#8fd0f7"} />
            <stop offset="1" stopColor={dark ? "#24357a" : "#e3f5ff"} />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill={`url(#${uid}-sky)`} />
        {dark ? (
          <>
            <circle cx="16" cy="16" r="1.2" fill="#ffffff" />
            <circle cx="40" cy="9" r="0.9" fill="#ffffff" />
            <circle cx="88" cy="40" r="1" fill="#ffffff" />
            <circle cx="10" cy="56" r="0.9" fill="#ffffff" />
            <circle cx="80" cy="16" r="9" fill="#e8ecf6" />
            <circle cx="77" cy="13" r="2" fill="#c9cfdc" />
            <path d="M0,86 Q30,78 60,84 Q82,88 100,82 L100,100 L0,100 Z" fill="#c9ceda" />
          </>
        ) : (
          <circle cx="80" cy="20" r="9" fill="#ffd93d" />
        )}
        {scene === "road" && (
          <>
            <rect x="0" y="58" width="16" height="16" fill="#f3b9a7" />
            <rect x="18" y="52" width="14" height="22" fill="#fde3a1" />
            <rect x="68" y="56" width="16" height="18" fill="#b9dcf2" />
            <rect x="86" y="50" width="14" height="24" fill="#d6c6f1" />
            <rect y="74" width="100" height="4" fill="#ddd2c2" />
            <rect y="78" width="100" height="22" fill="#8a94a3" />
            <rect x="8" y="88" width="16" height="3" rx="1.5" fill="#ffffff" />
            <rect x="42" y="88" width="16" height="3" rx="1.5" fill="#ffffff" />
            <rect x="76" y="88" width="16" height="3" rx="1.5" fill="#ffffff" />
          </>
        )}
        {scene === "site" && (
          <>
            <path d="M0,74 Q30,60 56,70 Q80,78 100,66 L100,100 L0,100 Z" fill="#9fd486" />
            <rect y="76" width="100" height="24" fill="#c99a66" />
            <path d="M88,64 L92,64 L96,78 L84,78 Z" fill="#f08a24" />
          </>
        )}
        {scene === "sea" && (
          <>
            <path d="M6,76 Q20,66 36,68 Q48,70 54,76 Z" fill="#9fd486" />
            <rect y="75" width="100" height="25" fill="#3a9bd6" />
          </>
        )}
        {scene === "sky" && (
          <>
            <path d="M8,62 Q8,54 18,55 Q22,46 32,50 Q40,46 42,56 Q48,58 44,62 Z" fill="#ffffff" />
            <path d="M0,92 Q30,84 60,90 Q82,94 100,88 L100,100 L0,100 Z" fill="#b8e3a4" />
          </>
        )}
        <g transform={`translate(9 ${y}) scale(0.205)`}>
          {v.parts.map((p) => (
            <path
              key={p.id}
              d={p.shape.d}
              fill={on.has(p.id) ? mcFill(p.colour) : "#ffffff"}
              stroke={OUTLINE_INK}
              strokeWidth="10"
              strokeLinejoin="round"
            />
          ))}
          {v.trims?.map((t) => (
            <path key={t.d} d={t.d} fill="#cfd6df" stroke={OUTLINE_INK} strokeWidth="8" />
          ))}
          {v.details.map((d) => (
            <path
              key={d}
              d={d}
              fill="none"
              stroke={OUTLINE_INK}
              strokeWidth="10"
              strokeLinecap="round"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
