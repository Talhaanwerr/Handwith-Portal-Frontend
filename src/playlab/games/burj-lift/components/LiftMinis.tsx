"use client";

import { BurjTowerArt } from "@shared/components/dubai/BurjTower";
import { fluentSrc } from "@shared/constants/fluent3d";
import { COLOUR_PAINT, FLOOR_COLOURS, type ModuleId } from "@games/burj-lift/constants/rounds";

const RIDER = fluentSrc("penguin");

/** A lift car with its rider, as plain SVG shapes (left edge `x`, bottom `y`). */
function MiniCar({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <rect
        x={x}
        y={y - h}
        width={w}
        height={h}
        rx="1.6"
        fill="#cfeaf8"
        stroke="#e0a632"
        strokeWidth="1.8"
      />
      {RIDER && <image href={RIDER} x={x + 1.2} y={y - h + 1.6} width={w - 2.4} height={h - 2} />}
      <rect x={x + w * 0.3} y={y - h - 2.4} width={w * 0.4} height="2.4" rx="0.8" fill="#c58a1e" />
      <rect x={x - 0.8} y={y} width={w + 1.6} height="1.8" rx="0.6" fill="#c58a1e" />
    </g>
  );
}

/** A fat arrow, its tip at (`x`, `y`), pointing up or down. */
function MiniArrow({ x, y, up }: { x: number; y: number; up: boolean }) {
  const s = up ? 1 : -1;
  const d = `M${x} ${y} L${x + 11} ${y + 12 * s} H${x + 5} V${y + 24 * s} H${x - 5} V${
    y + 12 * s
  } H${x - 11} Z`;
  return <path d={d} fill="#e3a12f" stroke="#b07415" strokeWidth="2" strokeLinejoin="round" />;
}

/**
 * A module in miniature for its home card: the tower in its own sky with
 * the glass lift on its side. Up or Down? — a sunny day and the two big
 * arrows; Picture Floors — the evening, coloured signs beside the floors and
 * a balloon over the lift. One SVG filling the card's picture box.
 */
export function ModuleMini({ id }: { id: ModuleId }) {
  const day = id === "updown";
  const sky = `bjl-mini-sky-${id}`;
  const u = 12;
  const ground = 95;
  const tx = 72;
  const floors = 5;
  const podTop = ground - 0.5 * u;
  const railX = tx + 1.05 * u;
  const carBottom = podTop - 2 * u;
  return (
    <span className="bjl-mini" aria-hidden="true">
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
        <path
          d="M0 80h14v-12h10v12h12v-18h8v18h80v-14h10v14h26v20H0Z"
          fill={day ? "#b4c6da" : "#7e6593"}
        />
        <path d="M0 87C40 79 90 81 160 85V100H0Z" fill={day ? "#e9c48a" : "#c88a73"} />
        <BurjTowerArt
          x={tx}
          ground={ground}
          unit={u}
          floors={floors}
          time={day ? "day" : "dusk"}
          spireUnits={1.6}
        />
        {/* the signs (Picture Floors: one colour a floor) */}
        {!day &&
          FLOOR_COLOURS.slice(0, floors).map((c, i) => (
            <rect
              key={c}
              x={tx - 1.15 * u - 9}
              y={podTop - (i + 1) * u + 1.5}
              width="9"
              height={u - 3}
              rx="2"
              fill={COLOUR_PAINT[c].face}
              stroke={COLOUR_PAINT[c].edge}
              strokeWidth="1"
            />
          ))}
        {/* the rails and the car */}
        <rect x={railX} y={podTop - 5.3 * u} width="1.4" height={5.8 * u} fill="#8a6a2a" />
        <rect
          x={railX + u - 1.4}
          y={podTop - 5.3 * u}
          width="1.4"
          height={5.8 * u}
          fill="#8a6a2a"
        />
        <MiniCar x={railX} y={carBottom} w={u} h={u * 0.92} />
        {day ? (
          <>
            <MiniArrow x={railX + u + 22} y={22} up />
            <MiniArrow x={railX + u + 22} y={78} up={false} />
          </>
        ) : (
          <g>
            <path
              d={`M${railX + u * 0.7} ${carBottom - u * 0.6} Q${railX + u + 6} ${
                carBottom - u * 1.4
              } ${railX + u + 10} ${carBottom - u * 2}`}
              fill="none"
              stroke="#fff1d6"
              strokeWidth="1"
            />
            <ellipse
              cx={railX + u + 10}
              cy={carBottom - u * 2 - 9}
              rx="8"
              ry="9.6"
              fill={COLOUR_PAINT.blue.face}
              stroke={COLOUR_PAINT.blue.edge}
              strokeWidth="1.2"
            />
          </g>
        )}
      </svg>
    </span>
  );
}
