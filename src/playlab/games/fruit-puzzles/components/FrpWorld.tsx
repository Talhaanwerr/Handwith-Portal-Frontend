"use client";

import { memo } from "react";

/** The little fruits on the orchard trees outside the window. */
const TREE_FRUIT = [
  { x: 228, y: 330, c: "#E8574F" },
  { x: 262, y: 296, c: "#E8574F" },
  { x: 296, y: 342, c: "#F08A24" },
  { x: 410, y: 372, c: "#F08A24" },
  { x: 446, y: 340, c: "#E8574F" },
] as const;

/**
 * THE SUNNY KITCHEN — Fruit Puzzles' world, behind every screen: a warm
 * cream wall, a window on the left looking out on an orchard, a shelf with
 * fruit bowls and jars on the right, and a long wooden table along the
 * bottom that the plate stands on. The middle of the wall stays plain, so
 * nothing competes with the puzzle. Nothing moves.
 */
export const FrpWorld = memo(function FrpWorld() {
  return (
    <div className="frp-world" aria-hidden="true">
      <svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" className="frp-world-svg">
        <defs>
          <linearGradient id="frp-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF6E8" />
            <stop offset="1" stopColor="#FCE7CF" />
          </linearGradient>
          <linearGradient id="frp-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#BFE6FA" />
            <stop offset="1" stopColor="#E6F6FD" />
          </linearGradient>
          <linearGradient id="frp-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#E9BC86" />
            <stop offset="1" stopColor="#D49A62" />
          </linearGradient>
        </defs>

        {/* the wall, with faint stripes */}
        <rect width="1600" height="1000" fill="url(#frp-wall)" />
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={i * 100 + 40} y="0" width="20" height="760" fill="#FBEBD6" />
        ))}

        {/* the window and the orchard outside */}
        <rect x="150" y="150" width="380" height="400" rx="26" fill="#FFFFFF" />
        <rect x="170" y="170" width="340" height="360" rx="16" fill="url(#frp-sky)" />
        <circle cx="440" cy="236" r="34" fill="#FFE07A" />
        <path d="M170 440 Q 260 392 350 430 T 510 418 V 530 H170 Z" fill="#A8DB8F" />
        <path d="M170 476 Q 300 440 420 470 T 510 462 V 530 H170 Z" fill="#8CCB74" />
        <rect x="252" y="350" width="16" height="96" rx="6" fill="#B07A4B" />
        <circle cx="260" cy="324" r="62" fill="#6FBF5E" />
        <rect x="422" y="382" width="14" height="80" rx="6" fill="#B07A4B" />
        <circle cx="429" cy="358" r="50" fill="#7CC86A" />
        {TREE_FRUIT.map((t) => (
          <circle key={`${t.x}-${t.y}`} cx={t.x} cy={t.y} r="10" fill={t.c} />
        ))}
        <rect x="333" y="170" width="14" height="360" fill="#FFFFFF" />
        <rect x="170" y="343" width="340" height="14" fill="#FFFFFF" />
        <rect x="130" y="540" width="420" height="26" rx="12" fill="#F2D2A6" />
        {/* the curtains */}
        <path d="M120 130 H210 Q 196 320 150 560 H120 Z" fill="#F7B6A8" />
        <path d="M560 130 H470 Q 484 320 530 560 H560 Z" fill="#F7B6A8" />
        <rect x="104" y="118" width="472" height="20" rx="10" fill="#D9917F" />

        {/* the shelf, with a fruit bowl, jars and a little plant */}
        <rect x="1100" y="430" width="390" height="22" rx="10" fill="#C98E58" />
        <rect x="1130" y="452" width="18" height="40" rx="6" fill="#B47C49" />
        <rect x="1442" y="452" width="18" height="40" rx="6" fill="#B47C49" />
        <circle cx="1170" cy="384" r="26" fill="#FFD84D" />
        <circle cx="1214" cy="378" r="30" fill="#E8574F" />
        <circle cx="1252" cy="390" r="22" fill="#9BD06B" />
        <path d="M1132 392 H1290 Q 1282 430 1211 432 Q 1140 430 1132 392 Z" fill="#7FB4E0" />
        <rect x="1312" y="356" width="56" height="76" rx="14" fill="#FFFFFF" opacity="0.9" />
        <rect x="1312" y="346" width="56" height="18" rx="8" fill="#E8A66A" />
        <rect x="1324" y="384" width="32" height="30" rx="8" fill="#F3C25A" />
        <path d="M1404 432 L1396 380 H1460 L1452 432 Z" fill="#E0855E" />
        <path d="M1428 380 Q 1400 330 1414 300 Q 1434 336 1428 380 Z" fill="#6FBF5E" />
        <path d="M1428 380 Q 1452 326 1478 318 Q 1466 360 1428 380 Z" fill="#7CC86A" />

        {/* the table */}
        <rect x="0" y="740" width="1600" height="260" fill="url(#frp-wood)" />
        <rect x="0" y="728" width="1600" height="26" fill="#F2CC98" />
        <rect x="0" y="754" width="1600" height="8" fill="#C48A54" opacity="0.5" />
        {[860, 950].map((y) => (
          <rect key={y} x="0" y={y} width="1600" height="4" fill="#C48A54" opacity="0.35" />
        ))}
      </svg>
    </div>
  );
});
