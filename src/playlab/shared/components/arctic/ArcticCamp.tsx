"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { A } from "@shared/components/arctic/palette";

/**
 * THE EXPEDITION CAMP — the warm human corner of the cold world: tent,
 * fire, sled, snowman, pines. Wood here is the SAME wood as the pirate
 * theme's palette (wood is wood across worlds), and the fire/lantern glow
 * is the theme's designated warmth.
 *
 * Deliberate reuse, not redrawn: compass, map, rope coil, lantern and
 * wooden sign already exist in shared/components/pirate/ — the expedition
 * set is wood-and-brass and belongs to both worlds. See the README.
 */

/** The expedition tent — snow-dusted canvas with a warm doorway. */
export function ArcticTent({
  glow = true,
  className = "",
}: {
  glow?: boolean;
  className?: string;
}) {
  const uid = useId();
  const gid = `${uid}-tent`;
  return (
    <svg
      viewBox="0 0 220 150"
      className={`pl-art ${className}`}
      role="img"
      aria-label="An expedition tent"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={A.SCARF} />
          <stop offset="1" stopColor={A.SCARF_DEEP} />
        </linearGradient>
      </defs>
      {/* guy ropes */}
      <g stroke={A.ROCK_DEEP} strokeWidth="2" strokeLinecap="round" opacity="0.8">
        <path d="M40 62 L14 136" fill="none" />
        <path d="M180 62 L206 136" fill="none" />
      </g>
      {/* canvas */}
      <path
        d="M110 18 L196 138 L24 138 Z"
        fill={`url(#${gid})`}
        stroke={A.SCARF_DEEP}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* snow on the ridge */}
      <path d="M110 18 L148 72 Q128 62 110 66 Q92 62 72 72 Z" fill={A.SNOW} />
      {/* doorway */}
      <path
        d="M84 138 L110 62 L136 138 Z"
        fill={A.SCARF_DEEP}
        stroke={A.SCARF_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M92 138 L110 78 L128 138 Z"
        fill={glow ? A.GLOW : A.PENGUIN_DEEP}
        opacity={glow ? 0.95 : 0.85}
      />
      {/* pole tip */}
      <circle cx="110" cy="16" r="5" fill={A.WOOD} stroke={A.WOOD_LINE} strokeWidth="2.5" />
    </svg>
  );
}

/** The campfire — logs and a soft flame. `flicker` allows the one motion a
 *  fire earns (a tiny breath); off by default like every motion here. */
export function Campfire({
  lit = true,
  flicker = false,
  className = "",
}: {
  lit?: boolean;
  flicker?: boolean;
  className?: string;
}) {
  const uid = useId();
  const gid = `${uid}-fire`;
  const flame = (
    <g>
      <path
        d="M60 18 Q76 40 72 58 Q70 74 54 76 Q36 74 36 56 Q36 44 46 34 Q44 46 52 50 Q48 32 60 18 Z"
        fill={A.FIRE}
        stroke={A.FIRE_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M56 44 Q62 54 58 64 Q50 66 47 58 Q46 50 56 44 Z" fill={A.GLOW} />
    </g>
  );
  return (
    <svg
      viewBox="0 0 110 100"
      className={`pl-art ${className}`}
      role="img"
      aria-label={lit ? "A glowing campfire" : "An unlit campfire"}
    >
      <defs>
        <radialGradient id={gid} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={A.GLOW} stopOpacity="0.5" />
          <stop offset="1" stopColor={A.GLOW} stopOpacity="0" />
        </radialGradient>
      </defs>
      {lit && <circle cx="55" cy="56" r="44" fill={`url(#${gid})`} />}
      {lit &&
        (flicker ? (
          <motion.g
            animate={{ scale: [1, 1.05, 0.98, 1], y: [0, -1.5, 0.5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            /* motion parameter, not styling — the flame breathes around its
               base, same documented exception as the chest hinge */
            style={{ originX: "54px", originY: "72px" }}
          >
            {flame}
          </motion.g>
        ) : (
          flame
        ))}
      {/* logs */}
      <rect
        x="16"
        y="72"
        width="78"
        height="11"
        rx="5.5"
        fill={A.WOOD}
        stroke={A.WOOD_LINE}
        strokeWidth="2.5"
        transform="rotate(8 55 78)"
      />
      <rect
        x="16"
        y="72"
        width="78"
        height="11"
        rx="5.5"
        fill={A.WOOD_DEEP}
        stroke={A.WOOD_LINE}
        strokeWidth="2.5"
        transform="rotate(-8 55 78)"
      />
      {/* snow at the base */}
      <path d="M8 92 Q55 82 102 92 L102 96 L8 96 Z" fill={A.SNOW} />
    </svg>
  );
}

/** The wooden sled with runners — pulled by imagination. */
export function ArcticSled({ className = "" }: { className?: string }) {
  const uid = useId();
  const gid = `${uid}-sled`;
  return (
    <svg
      viewBox="0 0 200 100"
      className={`pl-art ${className}`}
      role="img"
      aria-label="A wooden sled"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={A.WOOD} />
          <stop offset="1" stopColor={A.WOOD_DEEP} />
        </linearGradient>
      </defs>
      {/* deck planks */}
      <rect
        x="34"
        y="34"
        width="128"
        height="12"
        rx="6"
        fill={`url(#${gid})`}
        stroke={A.WOOD_LINE}
        strokeWidth="3"
      />
      <rect
        x="42"
        y="20"
        width="112"
        height="12"
        rx="6"
        fill={`url(#${gid})`}
        stroke={A.WOOD_LINE}
        strokeWidth="3"
      />
      {/* struts */}
      <g stroke={A.WOOD_LINE} strokeWidth="5" strokeLinecap="round">
        <path d="M58 46 L58 66" fill="none" />
        <path d="M100 46 L100 66" fill="none" />
        <path d="M142 46 L142 66" fill="none" />
      </g>
      {/* runner curling at the front */}
      <path
        d="M20 66 Q16 46 34 40 L38 48 Q28 52 30 64 L170 64 Q182 64 186 72 Q182 80 170 78 L32 78 Q20 78 20 66 Z"
        fill={A.WOOD_DEEP}
        stroke={A.WOOD_LINE}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* rope */}
      <path
        d="M34 40 Q18 30 8 34"
        fill="none"
        stroke={A.ROPE}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* snow under runners */}
      <path d="M12 86 Q100 78 190 86 L190 90 L12 90 Z" fill={A.SNOW} />
    </svg>
  );
}

/** The snowman — scarf, carrot nose, stick arms; the child's own landmark. */
export function Snowman({ className = "" }: { className?: string }) {
  const uid = useId();
  const gid = `${uid}-man`;
  return (
    <svg
      viewBox="0 0 150 190"
      className={`pl-art ${className}`}
      role="img"
      aria-label="A snowman with a scarf and carrot nose"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={A.WHITE} />
          <stop offset="1" stopColor={A.SNOW_DEEP} />
        </linearGradient>
      </defs>
      {/* stick arms */}
      <g stroke={A.WOOD_LINE} strokeWidth="4" strokeLinecap="round">
        <path d="M32 108 L6 88 M14 94 L6 100" fill="none" />
        <path d="M118 108 L144 88 M136 94 L144 100" fill="none" />
      </g>
      {/* body */}
      <circle
        cx="75"
        cy="134"
        r="46"
        fill={`url(#${gid})`}
        stroke={A.SNOW_LINE}
        strokeWidth="3.5"
      />
      <circle cx="75" cy="64" r="32" fill={`url(#${gid})`} stroke={A.SNOW_LINE} strokeWidth="3.5" />
      {/* scarf */}
      <path
        d="M46 88 Q75 102 104 88 L102 100 Q75 112 48 100 Z"
        fill={A.SCARF}
        stroke={A.SCARF_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M92 98 L98 126 L82 122 Z"
        fill={A.SCARF}
        stroke={A.SCARF_DEEP}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* face */}
      <circle cx="63" cy="58" r="3.4" fill={A.INK} />
      <circle cx="87" cy="58" r="3.4" fill={A.INK} />
      <path
        d="M75 64 L100 70 L75 74 Z"
        fill={A.CARROT}
        stroke={A.FIRE_DEEP}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <g fill={A.INK}>
        <circle cx="64" cy="78" r="2" />
        <circle cx="75" cy="81" r="2" />
        <circle cx="86" cy="78" r="2" />
      </g>
      {/* coal buttons */}
      <g fill={A.INK}>
        <circle cx="75" cy="120" r="3" />
        <circle cx="75" cy="136" r="3" />
        <circle cx="75" cy="152" r="3" />
      </g>
    </svg>
  );
}

/** A snow-covered pine — the sparse vegetation. */
export function ArcticPine({
  small = false,
  className = "",
}: {
  small?: boolean;
  className?: string;
}) {
  const uid = useId();
  const gid = `${uid}-pine`;
  return (
    <svg
      viewBox={small ? "0 0 100 130" : "0 0 120 180"}
      className={`pl-art ${className}`}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3E7D5B" />
          <stop offset="1" stopColor="#2A5C42" />
        </linearGradient>
      </defs>
      <g transform={small ? "scale(0.84)" : undefined}>
        <rect
          x="52"
          y="140"
          width="14"
          height="28"
          rx="6"
          fill={A.WOOD_DEEP}
          stroke={A.WOOD_LINE}
          strokeWidth="3"
        />
        <g fill={`url(#${gid})`} stroke="#1F4631" strokeWidth="3" strokeLinejoin="round">
          <path d="M59 8 L96 66 L22 66 Z" />
          <path d="M59 44 L104 110 L14 110 Z" />
          <path d="M59 84 L112 150 L6 150 Z" />
        </g>
        {/* snow on each tier */}
        <path d="M59 8 L80 42 Q66 36 59 40 Q50 36 38 42 Z" fill={A.SNOW} />
        <path d="M40 84 Q59 74 78 84 Q70 90 59 88 Q48 90 40 84 Z" fill={A.SNOW} />
        <path d="M30 126 Q59 114 88 126 Q72 132 59 130 Q44 132 30 126 Z" fill={A.SNOW} />
      </g>
    </svg>
  );
}
