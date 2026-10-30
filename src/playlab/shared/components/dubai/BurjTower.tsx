import type { CSSProperties, ReactNode, Ref } from "react";

/**
 * THE BURJ KHALIFA, IN PIECES — reusable by any game (styles in
 * `shared/styles/dubai.css`, all `bjk-` classes; no SVG ids, so
 * any number of towers can share a page).
 *
 * The tower is a stack of glass FLOOR SEGMENTS (tiers) on a PODIUM, topped by
 * the SPIRE — the Burj seen from the front, its Y-shaped plan as three parts:
 *   • the CORE — the same width all the way up, centred on the tower's line,
 *     with a bright spine down its middle that runs on up the spire;
 *   • two WINGS either side, whose tops sit lower than the core's, one wing
 *     lower than the other and swapping sides every tier (the spiral
 *     setbacks);
 *   • each tier clearly narrower than the one below, the cut taken from
 *     alternate sides, so the outline steps in like the real tower's.
 * Silver vertical fins cover the glass; windows sit in rows that fill each
 * tier; at dusk and night `lit` tiers glow warm and unlit ones go dark.
 *
 * HOW TO USE (DOM pieces):
 *   1. Set `--bjk-f` (one tier's height) on any ancestor; every piece sizes
 *      itself from it. Optionally set `--bjk-u` too (the width unit, default
 *      `--bjk-f`): a `--bjk-u` smaller than `--bjk-f` gives taller, slimmer
 *      tiers with more window rows.
 *   2. Stack, bottom to top, in a centred flex column:
 *        <div style="display:flex; flex-direction:column; align-items:center">
 *          <span className="bjk-spire-slot"><BurjSpire time="dusk" /></span>
 *          <div style="display:flex; flex-direction:column-reverse">
 *            {floors.map(i => <BurjFloor key={i} index={i} floors={n} time="dusk" lit />)}
 *          </div>
 *          <BurjPodium time="dusk" />
 *        </div>
 *      (the spire fills the height of whatever box it sits in, 0.62 units
 *      wide — its foot is exactly as wide as the core).
 *   3. Pass `onTap` to make a floor a button (at least 44 px wide, however
 *      slim the top tiers get); `live` gives it the pulsing gold "tap me"
 *      outline; children (a number badge, e.g.
 *      `<span className="bjk-floor-badge">3</span>`) sit on top.
 *   4. A tier or spire not built yet: `BurjGhostFloor` / `BurjGhostSpire` draw
 *      the same shape as a dashed, see-through outline (the plan of the
 *      tower), the same size, so real floors can replace them in place.
 *   5. `<BurjGlow strength={0..1} />` is a warm halo for dusk/night; place it
 *      absolutely behind the tower (it is `position: absolute`, sized by you).
 *
 * For a static picture (a Library icon, a title-card miniature) use
 * `BurjTowerArt`, the same tower as plain SVG shapes inside your own <svg>.
 */

export type BurjTime = "day" | "dusk" | "night";
export type FloorVariant = "glass" | "gold";

/** The bottom tier's width, in width units. */
export const BURJ_BASE = 1.9;
/** The core's width, in width units (the spire's foot is as wide). */
export const CORE_W = 0.5;
/** The podium's width and height, in width units. */
export const PODIUM_W = 2.9;
export const PODIUM_H = 0.5;

/**
 * A tier's shape, in width units: its `width`, and how far its centre sits
 * left (−) of the tower's centre line (`shift`). `floors` is the height of the
 * finished tower. Every tier steps in by an eighth of the base (less in a
 * tower of more than five, so the top tier is always 45% of the base), the
 * cut taken from the right on odd tiers and from the left on even ones.
 */
export function floorShape(index: number, floors: number): { width: number; shift: number } {
  const step = floors <= 1 ? 0 : Math.min(0.13, 0.55 / (floors - 1));
  const cut = step * BURJ_BASE;
  return { width: BURJ_BASE - cut * index, shift: index % 2 === 1 ? -cut / 2 : 0 };
}

/**
 * How far below the core's top each wing's top sits (left, right), in width
 * units: one wing low and one high, swapping every tier; the top tier's wings
 * drop further, so the tower narrows into its spire.
 */
export function wingDrops(index: number, floors: number): [number, number] {
  if (index === floors - 1 && floors > 1) return index % 2 ? [0.42, 0.6] : [0.6, 0.42];
  return index % 2 ? [0.12, 0.28] : [0.28, 0.12];
}

function shapeStyle(index: number, floors: number, widthScale = 1): CSSProperties {
  const { width, shift } = floorShape(index, floors);
  const [l, r] = wingDrops(index, floors);
  return {
    "--bjk-fw": width * widthScale,
    "--bjk-fx": shift * widthScale,
    "--bjk-wl": l,
    "--bjk-wr": r,
  } as CSSProperties;
}

/** The three parts of a tier; `panes` adds windows (and the lights-off dim). */
function TierArt({ panes }: { panes: boolean }) {
  const inner = panes ? (
    <>
      <span className="bjk-win" />
      <span className="bjk-floor-shade" />
    </>
  ) : null;
  return (
    <span className="bjk-floor-art">
      <span className="bjk-wing bjk-wing--l">{inner}</span>
      <span className="bjk-wing bjk-wing--r">{inner}</span>
      <span className="bjk-core">{inner}</span>
    </span>
  );
}

/**
 * ONE TIER — the core and its two stepped wings, silver-blue glass (or new
 * gold glass). `lit` lights its windows warm (dusk/night); unlit at dusk or
 * night it goes dark.
 */
export function BurjFloor({
  index,
  floors,
  variant = "glass",
  time = "day",
  lit = false,
  live = false,
  widthScale = 1,
  onTap,
  buttonRef,
  label,
  className = "",
  children,
}: {
  /** Which floor this is, 0 = the bottom floor (sets its width and setback). */
  index: number;
  /** How many floors the finished tower has. */
  floors: number;
  variant?: FloorVariant;
  time?: BurjTime;
  lit?: boolean;
  /** Waiting to be tapped: a pulsing gold outline. */
  live?: boolean;
  /** Draw it narrower than its place in the tower (e.g. 0.85 in a pile). */
  widthScale?: number;
  /** Makes the floor a button. */
  onTap?: () => void;
  buttonRef?: Ref<HTMLButtonElement>;
  /** The button's label (screen readers). */
  label?: string;
  className?: string;
  children?: ReactNode;
}) {
  const style = shapeStyle(index, floors, widthScale);
  const cls = `bjk-floor bjk-floor--${variant} bjk-floor--${time} ${lit ? "bjk-floor--lit" : ""} ${
    live ? "bjk-floor--live" : ""
  } ${className}`;
  if (!onTap)
    return (
      <span className={cls} style={style} aria-hidden="true">
        <TierArt panes />
        {children}
      </span>
    );
  return (
    <button
      ref={buttonRef}
      type="button"
      className={cls}
      style={style}
      onClick={onTap}
      disabled={!live}
      aria-label={label}
    >
      <TierArt panes />
      {children}
    </button>
  );
}

/** A tier not built yet: the same shape, as a dashed see-through outline. */
export function BurjGhostFloor({
  index,
  floors,
  className = "",
}: {
  index: number;
  floors: number;
  className?: string;
}) {
  return (
    <span
      className={`bjk-floor bjk-floor--ghost ${className}`}
      style={shapeStyle(index, floors)}
      aria-hidden="true"
    >
      <TierArt panes={false} />
    </span>
  );
}

/**
 * THE SPIRE — a stepped crown narrowing into the long needle, the core's
 * bright spine running up it, and the red aviation light blinking on its tip
 * at dusk and night. It fills the height of its box.
 */
export function BurjSpire({ time = "day" }: { time?: BurjTime }) {
  return (
    <span className={`bjk-spire bjk-spire--${time}`} aria-hidden="true">
      <svg viewBox="0 0 40 200" preserveAspectRatio="none">
        <rect className="bjk-sp-dk" x="19.4" y="0" width="1.2" height="13" />
        <polygon className="bjk-sp-dk" points="12.5,128 27.5,128 21.2,12 18.8,12" />
        <polygon className="bjk-sp-dk" points="9,152 31,152 27.5,128 12.5,128" />
        <polygon className="bjk-sp-dk" points="5,176 35,176 31,152 9,152" />
        <polygon className="bjk-sp-dk" points="4,200 36,200 35,176 5,176" />
        <polygon className="bjk-sp-lt" points="12.5,128 20,128 20,12 18.8,12" />
        <polygon className="bjk-sp-lt" points="9,152 20,152 20,128 12.5,128" />
        <polygon className="bjk-sp-lt" points="5,176 20,176 20,152 9,152" />
        <polygon className="bjk-sp-lt" points="4,200 20,200 20,176 5,176" />
        <rect className="bjk-sp-line" x="12.5" y="126.6" width="15" height="1.6" />
        <rect className="bjk-sp-line" x="9" y="150.6" width="22" height="1.6" />
        <rect className="bjk-sp-line" x="5" y="174.6" width="30" height="1.6" />
        <rect className="bjk-sp-spine" x="19.3" y="14" width="1.4" height="186" />
      </svg>
      {time !== "day" && <span className="bjk-spire-beacon" />}
    </span>
  );
}

/** The spire not built yet: its dashed see-through outline, the same size. */
export function BurjGhostSpire() {
  return (
    <span className="bjk-spire-ghost" aria-hidden="true">
      <BurjSpire />
    </span>
  );
}

/**
 * THE PODIUM — the low stone base with its glass tier and lit entrance, and
 * the fountain pool in front. `PODIUM_W` × `PODIUM_H` width units.
 */
export function BurjPodium({ time = "day" }: { time?: BurjTime }) {
  return (
    <span className={`bjk-podium bjk-podium--${time}`} aria-hidden="true">
      {/* 290 × 50: one width unit is 100 */}
      <svg viewBox="0 0 290 50">
        <rect className="bjk-po-water" x="0" y="41" width="290" height="9" rx="3" />
        <rect className="bjk-po-glint" x="10" y="43.5" width="270" height="1.2" />
        <path className="bjk-po-stone" d="M6 42 L12 30 H278 L284 42 Z" />
        <rect className="bjk-po-edge" x="6" y="40" width="278" height="2.6" />
        <path className="bjk-po-glass" d="M30 30 L34 16 H256 L260 30 Z" />
        {[52, 70, 88, 106, 124, 166, 184, 202, 220, 238].map((x) => (
          <rect key={x} className="bjk-po-mull" x={x} y="17" width="1.6" height="13" />
        ))}
        <rect className="bjk-po-door" x="133" y="20" width="24" height="10" rx="1.5" />
        <rect className="bjk-po-cap" x="34" y="14.5" width="222" height="2.4" />
        <g className="bjk-po-jets">
          <path d="M8 46 Q13 30 18 46" />
          <path d="M20 46 Q24 36 28 46" />
          <path d="M262 46 Q266 36 270 46" />
          <path d="M272 46 Q277 30 282 46" />
        </g>
      </svg>
    </span>
  );
}

/** A soft warm halo behind the tower at dusk and night (`strength` 0–1). */
export function BurjGlow({
  strength = 1,
  className = "",
}: {
  strength?: number;
  className?: string;
}) {
  return (
    <span className={`bjk-glow ${className}`} style={{ opacity: strength }} aria-hidden="true" />
  );
}

/* ── The same tower as plain SVG shapes (icons, miniatures) ─────────────── */

interface ArtPalette {
  /** left wing, core, right wing, ledge, window panes */
  wl: string;
  core: string;
  wr: string;
  ledge: string;
  pane: string;
}
const ART: Record<BurjTime | "gold", ArtPalette> = {
  day: { wl: "#a6c3df", core: "#eaf4fc", wr: "#6d8db3", ledge: "#ffffff", pane: "#7f9fc3" },
  dusk: { wl: "#7c74ad", core: "#f6c3a3", wr: "#3f3f75", ledge: "#ffdcbc", pane: "#2a2f58" },
  night: { wl: "#3d4a82", core: "#7685bd", wr: "#1f2750", ledge: "#a5b2de", pane: "#1a2045" },
  gold: { wl: "#e6b14b", core: "#fff3c8", wr: "#b47a1e", ledge: "#fff7da", pane: "#d39a32" },
};
const LIT = "#ffd98a";
const STONE: Record<BurjTime, [string, string, string]> = {
  day: ["#ecdcbc", "#cdb58c", "#7cc4e8"],
  dusk: ["#d8a88d", "#a77965", "#8d7fc4"],
  night: ["#5b5b86", "#3c3d66", "#3d4c8f"],
};

/**
 * The tower as SVG shapes, standing with its podium's foot at (`x`,
 * `ground`), one floor `unit` tall (and one width unit wide). The top `gold`
 * floors are new gold glass; floors listed in `dark` have their lights off
 * (dusk/night). Put it inside your own <svg>.
 */
export function BurjTowerArt({
  x,
  ground,
  unit,
  floors,
  time = "day",
  gold = 0,
  dark = [],
  spire = true,
  spireUnits = 2.6,
}: {
  x: number;
  ground: number;
  unit: number;
  floors: number;
  time?: BurjTime;
  gold?: number;
  dark?: readonly number[];
  spire?: boolean;
  /** The spire's height, in floor heights. */
  spireUnits?: number;
}) {
  const u = unit;
  const [stone, stoneDk, water] = STONE[time];
  const podTop = ground - PODIUM_H * u;
  const top = podTop - floors * u;
  const sw = CORE_W * u;
  const tip = top - spireUnits * u;
  const pal = ART[time];
  return (
    <g>
      {/* podium and pool */}
      <rect x={x - 1.45 * u} y={ground - 0.09 * u} width={2.9 * u} height={0.09 * u} fill={water} />
      <path
        d={`M${x - 1.39 * u} ${ground - 0.08 * u} L${x - 1.33 * u} ${podTop + 0.3 * u} H${
          x + 1.33 * u
        } L${x + 1.39 * u} ${ground - 0.08 * u}Z`}
        fill={stone}
      />
      <path
        d={`M${x - 1.15 * u} ${podTop + 0.3 * u} L${x - 1.11 * u} ${podTop} H${x + 1.11 * u} L${
          x + 1.15 * u
        } ${podTop + 0.3 * u}Z`}
        fill={stoneDk}
      />

      {/* tiers, bottom up: two wings, then the core over them */}
      {Array.from({ length: floors }, (_, i) => {
        const { width, shift } = floorShape(i, floors);
        const [dl, dr] = wingDrops(i, floors);
        const p = ART[i >= floors - gold ? "gold" : time];
        const w = width * u;
        const left = x + shift * u - w / 2;
        const right = left + w;
        const cl = x - sw / 2;
        const cr = x + sw / 2;
        const y = podTop - (i + 1) * u;
        const on = time !== "day" && !dark.includes(i) && i < floors - gold;
        const pane = on ? LIT : p.pane;
        const parts: [number, number, number, string][] = [
          [left, cl, y + dl * u, p.wl],
          [cr, right, y + dr * u, p.wr],
          [cl, cr, y, p.core],
        ];
        return (
          <g key={i}>
            {parts.map(([x0, x1, y0, fill]) =>
              x1 - x0 < 0.5 ? null : (
                <g key={x0}>
                  <rect x={x0} y={y0} width={x1 - x0} height={podTop - i * u - y0} fill={fill} />
                  <rect x={x0} y={y0} width={x1 - x0} height={0.07 * u} fill={p.ledge} />
                  {[0.45, 0.72].map((f) =>
                    y + f * u > y0 + 0.12 * u ? (
                      <line
                        key={f}
                        x1={x0 + (x1 - x0) * 0.1}
                        x2={x1 - (x1 - x0) * 0.1}
                        y1={y + f * u}
                        y2={y + f * u}
                        stroke={pane}
                        strokeWidth={0.16 * u}
                        strokeDasharray={`${0.06 * u} ${0.05 * u}`}
                      />
                    ) : null
                  )}
                </g>
              )
            )}
            <rect x={x - 0.02 * u} y={y} width={0.04 * u} height={u} fill="#ffffff" opacity="0.6" />
          </g>
        );
      })}

      {/* the spire: crown, needle, spine */}
      {spire && (
        <g>
          <polygon
            points={`${x - sw / 2},${top} ${x + sw / 2},${top} ${x + sw * 0.2},${
              top - (top - tip) * 0.36
            } ${x + 0.03 * u},${tip} ${x - 0.03 * u},${tip} ${x - sw * 0.2},${
              top - (top - tip) * 0.36
            }`}
            fill={pal.wr}
          />
          <polygon
            points={`${x - sw / 2},${top} ${x},${top} ${x},${tip} ${x - 0.03 * u},${tip} ${
              x - sw * 0.2
            },${top - (top - tip) * 0.36}`}
            fill={pal.core}
          />
          {time !== "day" && <circle cx={x} cy={tip} r={0.07 * u} fill="#ff5a4e" />}
        </g>
      )}
    </g>
  );
}
