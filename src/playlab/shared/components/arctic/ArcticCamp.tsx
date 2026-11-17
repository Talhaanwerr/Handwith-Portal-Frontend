"use client";

import { useId } from "react";
import { A } from "@shared/components/arctic/palette";

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
