"use client";

import { memo, useId, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Thing } from "@games/number-groups/components/SumParts";
import {
  BAG_PAINT,
  type Bag,
  type BagPattern,
  type Item,
} from "@games/plane-trip/constants/rounds";

/**
 * PLANE TRIP'S ART — the airport (a glass wall onto the apron with the plane
 * parked outside, and the shiny terminal floor), the plane itself, the
 * suitcases with their colours and patterns, a luggage tag, and the things
 * to pack that the Fluent set has no clear picture of. Chunky and
 * soft-shaded, solid lower edges, like the rest of the portal.
 */

/** A safe id for SVG references (React's ids carry characters url() hates). */
function useSvgId(prefix: string) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/* ── The airport ─────────────────────────────────────────────────────────── */

/**
 * The airport behind every screen. Nothing moves, except that with
 * `takeoff` the plane outside rolls off and climbs away. Its parts are
 * sized from the board's `--ptr-floor` (plane-trip.css), so the passengers
 * and suitcases always stand on the floor.
 */
export const AirportWorld = memo(function AirportWorld({ takeoff = false }: { takeoff?: boolean }) {
  return (
    <div className="ptr-airport" aria-hidden="true">
      <span className="ptr-air-sky" />
      <span className="ptr-air-cloud ptr-air-cloud--a">
        <Cloud />
      </span>
      <span className="ptr-air-cloud ptr-air-cloud--b">
        <Cloud />
      </span>
      <span className="ptr-air-apron" />
      <motion.span
        className="ptr-air-plane"
        initial={false}
        animate={takeoff ? { x: "150%", y: "-150%", rotate: -12 } : { x: 0, y: 0, rotate: 0 }}
        transition={{ duration: 2.2, ease: "easeIn" }}
      >
        <PlaneArt />
      </motion.span>
      <span className="ptr-air-glass" />
      <span className="ptr-air-floor" />
    </div>
  );
});

function Cloud() {
  return (
    <svg viewBox="0 0 120 50">
      <ellipse cx="60" cy="36" rx="54" ry="13" fill="#FFFFFF" />
      <circle cx="40" cy="28" r="17" fill="#FFFFFF" />
      <circle cx="66" cy="20" r="20" fill="#FFFFFF" />
      <circle cx="88" cy="30" r="13" fill="#FFFFFF" />
    </svg>
  );
}

/** The aeroplane, side on, nose to the right. */
export function PlaneArt() {
  return (
    <svg viewBox="0 0 260 104" className="ptr-plane-art">
      {/* shadow on the apron */}
      <ellipse cx="136" cy="98" rx="100" ry="5" fill="rgba(20, 30, 50, 0.22)" />
      {/* wheels */}
      <rect x="70" y="70" width="5" height="18" fill="#7A8494" />
      <rect x="196" y="70" width="5" height="18" fill="#7A8494" />
      <circle cx="72" cy="90" r="7" fill="#333A46" />
      <circle cx="199" cy="90" r="7" fill="#333A46" />
      {/* far wing */}
      <path d="M126 46 L150 46 L176 22 L162 22 Z" fill="#B9C4D6" />
      {/* tail */}
      <path d="M34 40 L16 6 H44 L72 40 Z" fill="#E8701A" />
      <path d="M34 40 L16 6 H30 L56 40 Z" fill="#F08A24" />
      {/* the body, with its solid lower edge */}
      <path
        d="M20 56 C20 42 34 38 52 38 H208 C232 38 252 48 257 60 C252 71 236 78 214 78 H46 C30 78 20 70 20 56Z"
        fill="#C9D2DF"
      />
      <path
        d="M20 54 C20 40 34 36 52 36 H208 C232 36 252 46 257 58 C252 68 236 74 214 74 H46 C30 74 20 66 20 54Z"
        fill="#FFFFFF"
      />
      <path d="M24 62 H252" stroke="#F08A24" strokeWidth="4" />
      {/* windows */}
      {Array.from({ length: 11 }, (_, i) => (
        <circle key={i} cx={66 + i * 13} cy="50" r="3.6" fill="#5DB8F2" />
      ))}
      <path d="M228 44 Q242 45 249 54 H230 Z" fill="#2E4A7A" />
      <rect
        x="208"
        y="42"
        width="11"
        height="22"
        rx="3"
        fill="none"
        stroke="#C9D2DF"
        strokeWidth="2"
      />
      {/* near wing and engine */}
      <path d="M118 62 L156 62 L128 98 L106 98 Z" fill="#D7DEE9" />
      <path d="M118 62 L156 62 L152 66 L117 66 Z" fill="#B9C4D6" />
      <rect x="120" y="70" width="30" height="13" rx="6.5" fill="#9AA6B8" />
      <rect x="120" y="70" width="30" height="10" rx="5" fill="#B9C4D6" />
      {/* tail wing */}
      <path d="M26 50 L4 44 L10 56 L30 58 Z" fill="#E8701A" />
    </svg>
  );
}

/* ── A suitcase ──────────────────────────────────────────────────────────── */

const STAR =
  "M0,-7 L2.06,-2.83 L6.66,-2.16 L3.33,1.08 L4.11,5.66 L0,3.5 L-4.11,5.66 L-3.33,1.08 L-6.66,-2.16 L-2.06,-2.83Z";
const HEART =
  "M0,5.5 C-7,0.5 -6.5,-5.5 -3.2,-5.5 C-1.5,-5.5 -0.4,-4.3 0,-3.2 C0.4,-4.3 1.5,-5.5 3.2,-5.5 C6.5,-5.5 7,0.5 0,5.5Z";
const SPOTS = [
  [22, 30],
  [50, 28],
  [78, 32],
  [34, 50],
  [64, 50],
  [20, 68],
  [50, 68],
  [80, 66],
] as const;

function Motif({ pattern, colour }: { pattern: BagPattern; colour: string }) {
  if (pattern === "stripes")
    return (
      <>
        {[12, 32, 52, 72].map((x) => (
          <rect key={x} x={x} y="14" width="9" height="66" fill={colour} />
        ))}
      </>
    );
  if (pattern === "dots")
    return (
      <>
        {SPOTS.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="5" fill={colour} />
        ))}
      </>
    );
  const d = pattern === "stars" ? STAR : HEART;
  return (
    <>
      {SPOTS.map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d={d}
          transform={`translate(${x} ${y}) scale(1.05)`}
          fill={colour}
        />
      ))}
    </>
  );
}

/** A big chunky suitcase in its colour and pattern: handle, wheels, a seam. */
export const Suitcase = memo(function Suitcase({ bag }: { bag: Bag }) {
  const clip = useSvgId("ptr-bag-");
  const paint = BAG_PAINT[bag.colour];
  return (
    <svg viewBox="0 0 100 92" className="ptr-suitcase" aria-hidden="true">
      <defs>
        <clipPath id={clip}>
          <rect x="6" y="14" width="88" height="62" rx="12" />
        </clipPath>
      </defs>
      <ellipse cx="50" cy="88" rx="40" ry="3.5" fill="rgba(20, 30, 50, 0.22)" />
      <circle cx="24" cy="84" r="5" fill="#333A46" />
      <circle cx="76" cy="84" r="5" fill="#333A46" />
      <path
        d="M36 15 V8 C36 4 39 2 43 2 H57 C61 2 64 4 64 8 V15"
        fill="none"
        stroke="#4A5260"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <rect x="6" y="18" width="88" height="62" rx="12" fill={paint.edge} />
      <rect x="6" y="14" width="88" height="62" rx="12" fill={paint.body} />
      <g clipPath={`url(#${clip})`} opacity="0.92">
        <Motif pattern={bag.pattern} colour={paint.motif} />
      </g>
      <rect x="6" y="38" width="88" height="3" fill={paint.edge} opacity="0.55" />
      <rect x="12" y="18" width="30" height="5" rx="2.5" fill="#FFFFFF" opacity="0.35" />
    </svg>
  );
});

/**
 * A luggage tag on its string, with a picture of the passenger's suitcase.
 */
export function LuggageTag({ bag }: { bag: Bag }) {
  return (
    <span className="ptr-tag">
      <svg viewBox="0 0 100 120" className="ptr-tag-card" aria-hidden="true">
        <path d="M50 0 C40 6 46 14 50 18" stroke="#8A6A3C" strokeWidth="3" fill="none" />
        <path
          d="M30 22 L50 12 L70 22 H86 C92 22 96 26 96 32 V108 C96 114 92 118 86 118 H14 C8 118 4 114 4 108 V32 C4 26 8 22 14 22 Z"
          fill="#D8CDB6"
          transform="translate(0 2)"
        />
        <path
          d="M30 22 L50 12 L70 22 H86 C92 22 96 26 96 32 V108 C96 114 92 118 86 118 H14 C8 118 4 114 4 108 V32 C4 26 8 22 14 22 Z"
          fill="#FFF8E8"
        />
        <circle cx="50" cy="24" r="4.5" fill="#D8CDB6" />
      </svg>
      <span className="ptr-tag-bag">
        <Suitcase bag={bag} />
      </span>
    </span>
  );
}

/* ── Things to pack ──────────────────────────────────────────────────────── */

const FLUENT_ITEM: Partial<Record<Item, string>> = {
  icecream: "icecream",
  shell: "shell",
  crab: "crab",
  jacket: "jacket",
};

/** One thing to pack: its Fluent picture, or its drawing here. */
export const ItemPicture = memo(function ItemPicture({ item }: { item: Item }) {
  const fluent = FLUENT_ITEM[item];
  if (fluent) return <Thing id={fluent} />;
  return (
    <svg viewBox="0 0 100 100" className="ptr-item-art" aria-hidden="true">
      <ellipse cx="50" cy="93" rx="34" ry="4" fill="rgba(20, 30, 50, 0.18)" />
      {DRAWN[item]}
    </svg>
  );
});

const DRAWN: Partial<Record<Item, ReactNode>> = {
  sunglasses: (
    <g>
      <path d="M10 40 L4 30 M90 40 L96 30" stroke="#E2457E" strokeWidth="5" strokeLinecap="round" />
      <path d="M42 46 Q50 38 58 46" stroke="#E2457E" strokeWidth="5" fill="none" />
      <rect x="8" y="38" width="36" height="32" rx="14" fill="#C2306A" />
      <rect x="56" y="38" width="36" height="32" rx="14" fill="#C2306A" />
      <rect x="8" y="36" width="36" height="31" rx="14" fill="#FF6FA0" />
      <rect x="56" y="36" width="36" height="31" rx="14" fill="#FF6FA0" />
      <rect x="13" y="41" width="26" height="21" rx="10" fill="#2B2F4A" />
      <rect x="61" y="41" width="26" height="21" rx="10" fill="#2B2F4A" />
      <path
        d="M18 46 L24 46 M66 46 L72 46"
        stroke="#FFFFFF"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.7"
      />
    </g>
  ),
  flipflops: (
    <g>
      <g transform="rotate(-10 32 52)">
        <ellipse cx="32" cy="56" rx="15" ry="32" fill="#1E9A93" />
        <ellipse cx="32" cy="53" rx="15" ry="32" fill="#38C7C0" />
        <path
          d="M20 46 Q32 30 44 46 M32 33 V40"
          stroke="#FF6FA0"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <g transform="rotate(10 68 52)">
        <ellipse cx="68" cy="56" rx="15" ry="32" fill="#1E9A93" />
        <ellipse cx="68" cy="53" rx="15" ry="32" fill="#38C7C0" />
        <path
          d="M56 46 Q68 30 80 46 M68 33 V40"
          stroke="#FF6FA0"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </g>
  ),
  beachball: (
    <g>
      <circle cx="50" cy="52" r="40" fill="#D8DDE6" />
      <circle cx="50" cy="49" r="40" fill="#FFFFFF" />
      <path d="M50 9 C28 20 24 70 40 88 C22 84 10 68 10 49 C10 28 28 10 50 9Z" fill="#E8524A" />
      <path d="M50 9 C72 20 76 70 60 88 C78 84 90 68 90 49 C90 28 72 10 50 9Z" fill="#3C7BE0" />
      <path d="M50 9 C42 24 42 70 48 89 C50 89 52 89 52 89 C58 70 58 24 50 9Z" fill="#F7C53C" />
      <circle cx="50" cy="20" r="6" fill="#FFFFFF" />
      <path
        d="M26 28 Q30 22 36 20"
        stroke="#FFFFFF"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
    </g>
  ),
  mittens: (
    <g>
      <g transform="translate(14 -2) rotate(12 60 56)">
        <path
          d="M44 84 V44 C44 28 58 22 68 26 C76 29 78 38 76 48 L84 42 C90 38 96 44 92 50 L78 68 V84 Z"
          fill="#B5342E"
        />
        <rect x="42" y="78" width="38" height="12" rx="5" fill="#E9EEF5" />
      </g>
      <path
        d="M18 84 V44 C18 28 32 22 42 26 C50 29 52 38 50 48 L58 42 C64 38 70 44 66 50 L52 68 V84 Z"
        fill="#C93F38"
      />
      <path
        d="M18 82 V42 C18 26 32 20 42 24 C50 27 52 36 50 46 L58 40 C64 36 70 42 66 48 L52 66 V82 Z"
        fill="#E8524A"
      />
      <rect x="16" y="76" width="38" height="14" rx="6" fill="#FFFFFF" />
      <path d="M22 50 H46 M22 60 H46" stroke="#FFFFFF" strokeWidth="3" opacity="0.5" />
    </g>
  ),
  beanie: (
    <g>
      <path d="M16 74 C16 38 34 24 50 24 C66 24 84 38 84 74 Z" fill="#2A5BAF" />
      <path d="M16 72 C16 36 34 22 50 22 C66 22 84 36 84 72 Z" fill="#3C7BE0" />
      <path d="M26 46 H74 M20 58 H80" stroke="#FFFFFF" strokeWidth="5" opacity="0.85" />
      <rect x="12" y="66" width="76" height="22" rx="9" fill="#2A5BAF" />
      <rect x="12" y="64" width="76" height="21" rx="9" fill="#F7C53C" />
      {[22, 34, 46, 58, 70, 80].map((x) => (
        <path key={x} d={`M${x} 68 V81`} stroke="#D9A21E" strokeWidth="3" />
      ))}
      <circle cx="50" cy="16" r="12" fill="#E9EEF5" />
      <circle cx="50" cy="14" r="12" fill="#FFFFFF" />
    </g>
  ),
  scarf: (
    <g>
      <path d="M14 30 C36 18 64 42 86 28 L90 46 C66 60 36 36 18 48 Z" fill="#26864C" />
      <path d="M14 26 C36 14 64 38 86 24 L90 42 C66 56 36 32 18 44 Z" fill="#3DB36B" />
      <path d="M30 22 L34 40 M52 30 L54 46 M72 30 L74 46" stroke="#FFFFFF" strokeWidth="5" />
      <path d="M56 40 L70 84 L54 88 L44 44 Z" fill="#26864C" />
      <path d="M56 38 L70 82 L54 86 L44 42 Z" fill="#3DB36B" />
      <path d="M50 58 L64 54 M54 70 L67 66" stroke="#FFFFFF" strokeWidth="5" />
      {[55, 59, 63, 67].map((x, i) => (
        <path
          key={x}
          d={`M${x - 1 + i * 0.4} 85 L${x - 2} 94`}
          stroke="#3DB36B"
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
    </g>
  ),
  boots: (
    <g>
      <path d="M28 24 H62 V60 L84 66 C94 69 94 88 84 88 H28 Z" fill="#6E4630" />
      <path d="M28 22 H62 V58 L84 64 C94 67 94 85 84 85 H28 Z" fill="#9A6444" />
      <rect x="26" y="80" width="68" height="8" rx="4" fill="#3E2A1E" />
      <path d="M36 40 H54 M36 50 H54" stroke="#6E4630" strokeWidth="3" strokeLinecap="round" />
      <circle cx="30" cy="22" r="8" fill="#FFFFFF" />
      <circle cx="42" cy="18" r="9" fill="#FFFFFF" />
      <circle cx="54" cy="20" r="9" fill="#FFFFFF" />
      <circle cx="63" cy="24" r="7" fill="#FFFFFF" />
    </g>
  ),
};

/** The snowy trip's sticker: a big snowflake. */
export function Snowflake() {
  return (
    <svg viewBox="0 0 100 100" className="ptr-item-art" aria-hidden="true">
      <g stroke="#3B7FC0" strokeWidth="7" strokeLinecap="round" fill="none">
        {[0, 60, 120].map((a) => (
          <g key={a} transform={`rotate(${a} 50 50)`}>
            <path d="M50 12 V88" />
            <path d="M40 20 L50 30 L60 20 M40 80 L50 70 L60 80" />
          </g>
        ))}
      </g>
      <circle cx="50" cy="50" r="7" fill="#3B7FC0" />
    </svg>
  );
}
