"use client";

import { BurjTowerArt } from "@shared/components/dubai/BurjTower";
import type { ModuleId } from "@games/burj-towers/constants/rounds";
import { starPoints } from "@games/burj-towers/components/starPoints";

/**
 * A module in miniature for its home card, in Burj Khalifa's own tower art.
 * Tall or Short? — a sunny day, a tall gold tower with a star on its spire
 * beside a short silver one; Line Them Up — the evening, three towers lined
 * up short to tall on a stand, over the gold ramp. One SVG filling the card's
 * picture box (its own size container).
 */
export function ModuleMini({ id }: { id: ModuleId }) {
  const day = id === "tallshort";
  const sky = `bjt-mini-sky-${id}`;
  return (
    <span className="bjt-mini" aria-hidden="true">
      <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={sky} x1="0" y1="0" x2="0" y2="1">
            {day ? (
              <>
                <stop offset="0" stopColor="#7cc0ec" />
                <stop offset="0.7" stopColor="#cfe9f7" />
                <stop offset="1" stopColor="#fbe3bd" />
              </>
            ) : (
              <>
                <stop offset="0" stopColor="#36407f" />
                <stop offset="0.55" stopColor="#a8679b" />
                <stop offset="1" stopColor="#ffc287" />
              </>
            )}
          </linearGradient>
        </defs>
        <rect width="160" height="100" fill={`url(#${sky})`} />
        {day ? (
          <circle cx="132" cy="20" r="8" fill="#ffe27a" />
        ) : (
          <>
            <circle cx="134" cy="18" r="7" fill="#fff4cf" />
            <circle cx="137.5" cy="15.5" r="6" fill="#39437f" />
          </>
        )}
        <path
          d="M0 80h14v-12h10v12h12v-18h8v18h80v-14h10v14h26v20H0Z"
          fill={day ? "#b4c6da" : "#7e6593"}
        />
        <path d="M0 86C40 78 90 80 160 84V100H0Z" fill={day ? "#e9c48a" : "#c88a73"} />
        {day ? (
          <>
            <BurjTowerArt x={56} ground={95} unit={11} floors={5} gold={5} spireUnits={1.5} />
            <BurjTowerArt x={110} ground={95} unit={11} floors={2} spireUnits={1.5} />
            <polygon
              points={starPoints(56, 21, 10)}
              fill="#ffd34d"
              stroke="#e09a14"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </>
        ) : (
          <>
            <rect x="16" y="89" width="128" height="3.4" rx="1.2" fill="#e8c9a2" />
            <path d="M20 92.4 L140 92.4 L140 98 Z" fill="#f2c55c" />
            {[
              [42, 2],
              [80, 3],
              [118, 4],
            ].map(([x, n]) => (
              <BurjTowerArt
                key={x}
                x={x}
                ground={89}
                unit={11}
                floors={n}
                time="dusk"
                gold={x === 80 ? n : 0}
                spireUnits={1.5}
              />
            ))}
          </>
        )}
      </svg>
    </span>
  );
}
