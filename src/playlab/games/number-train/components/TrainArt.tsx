"use client";

import { memo } from "react";
import { cssVars } from "@shared/styles/cssVars";
import { PAINT, type ModuleId } from "@games/number-train/constants/rounds";

/** A still, plain meadow behind every Number Train screen: sky, one hill, grass.
 *  Nothing in it moves, so nothing repaints while the train does. */
export function TrainWorld() {
  return (
    <div className="ntr-world" aria-hidden="true">
      <div className="ntr-sky" />
      <div className="ntr-hill" />
      <div className="ntr-grass" />
    </div>
  );
}

/** The engine, facing right: cab, boiler, chimney, cow-catcher, wheels. */
export const Engine = memo(function Engine() {
  return (
    <svg viewBox="0 0 120 100" className="ntr-engine-art" aria-hidden="true">
      <rect x="6" y="20" width="40" height="52" rx="5" fill="#E5484D" />
      <rect x="2" y="14" width="48" height="10" rx="4" fill="#8A2A2E" />
      <rect
        x="13"
        y="30"
        width="26"
        height="20"
        rx="4"
        fill="#CDEBFF"
        stroke="#FFFFFF"
        strokeWidth="3"
      />
      <rect x="44" y="40" width="58" height="32" rx="14" fill="#2E7FD6" />
      <rect x="44" y="48" width="58" height="5" fill="#F2C94C" />
      <rect x="78" y="18" width="14" height="24" rx="3" fill="#3B3B4A" />
      <rect x="74" y="14" width="22" height="8" rx="3" fill="#3B3B4A" />
      <circle cx="62" cy="34" r="6" fill="#F2C94C" />
      <path d="M102 58 L116 76 H100 Z" fill="#3B3B4A" />
      <rect x="4" y="70" width="104" height="8" rx="3" fill="#3B3B4A" />
      <Wheel cx={24} r={13} />
      <Wheel cx={64} r={10} />
      <Wheel cx={90} r={10} />
    </svg>
  );
});

function Wheel({ cx, r }: { cx: number; r: number }) {
  return (
    <g>
      <circle cx={cx} cy={99 - r} r={r} fill="#3B3B4A" />
      <circle cx={cx} cy={99 - r} r={r * 0.45} fill="#C9CCD6" />
    </g>
  );
}

/** One box carriage: a coloured wagon with its big numeral, on two wheels. */
export const Carriage = memo(function Carriage({ n }: { n: number }) {
  const p = PAINT[n];
  return (
    <span
      className="ntr-car"
      style={cssVars({ "--ntr-car": p.face, "--ntr-car-edge": p.edge })}
      aria-hidden="true"
    >
      <span className="ntr-car-box">
        <span className="ntr-car-num font-rounded font-black">{n}</span>
      </span>
      <span className="ntr-car-wheel ntr-car-wheel--a" />
      <span className="ntr-car-wheel ntr-car-wheel--b" />
    </span>
  );
});

/** Each module in miniature, for its home card and the star card. */
export function ModuleMini({ id }: { id: ModuleId }) {
  return (
    <span className="ng-mini ntr-mini" aria-hidden="true">
      <span className="ntr-mini-car">
        <Carriage n={1} />
      </span>
      {id === "build" ? (
        <span className="ntr-mini-car">
          <Carriage n={2} />
        </span>
      ) : (
        <>
          <span className="ntr-mini-car ntr-mini-gap" />
          <span className="ntr-mini-car">
            <Carriage n={3} />
          </span>
        </>
      )}
      {/* the engine leads: it is at the right, facing the way the train goes */}
      <span className="ntr-mini-engine">
        <Engine />
      </span>
    </span>
  );
}
