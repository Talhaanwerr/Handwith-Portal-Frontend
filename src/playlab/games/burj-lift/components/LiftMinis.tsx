"use client";

import { BurjTowerArt } from "@shared/components/dubai/BurjTower";
import { fluentSrc } from "@shared/constants/fluent3d";
import { KidArt } from "@games/burj-lift/components/KidArt";
import {
  COLOUR_PAINT,
  FLOORS,
  FLOOR_COLOURS,
  FLOOR_PICS,
  type ModuleId,
} from "@games/burj-lift/constants/rounds";

/** A round button with a fat arrow, centred at (`x`, `y`). */
function MiniButton({ x, y, up }: { x: number; y: number; up: boolean }) {
  const s = up ? 1 : -1;
  return (
    <g>
      <circle cx={x} cy={y + 1.4} r="7.6" fill={up ? "#b07415" : "#23479a"} />
      <circle
        cx={x}
        cy={y}
        r="7.6"
        fill={up ? "#e3a12f" : "#3a74d8"}
        stroke="#ffffff"
        strokeWidth="1.6"
      />
      <path
        d={`M${x} ${y - 5 * s} L${x + 5} ${y} H${x + 2.2} V${y + 4.6 * s} H${x - 2.2} V${y} H${x - 5} Z`}
        fill="#ffffff"
      />
    </g>
  );
}

/**
 * A module in miniature for its home card and the star card: the tower in its
 * own sky, a sign beside each of its four floors (the number, and the picture
 * or the colour), the glass lift with the girl riding in it, the boy waiting
 * on the sand with what he wants (a bubble, or a balloon), and the two big
 * buttons. One SVG filling the card's picture box.
 */
export function ModuleMini({ id }: { id: ModuleId }) {
  const day = id === "updown";
  const sky = `bjl-mini-sky-${id}`;
  const u = 12.5;
  const ground = 95;
  const tx = 60;
  const podTop = ground - 0.5 * u;
  const railX = tx + 1.05 * u;
  const carH = u * 0.92;
  const carBottom = podTop - 2 * u;
  const floorTop = (n: number) => podTop - n * u;
  const boyPic = FLOOR_PICS[2];
  const boySrc = fluentSrc(boyPic);
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
          floors={FLOORS}
          time={day ? "day" : "dusk"}
          spireUnits={1.5}
        />
        {/* a sign beside every floor: its picture or colour, and its number */}
        {Array.from({ length: FLOORS }, (_, i) => {
          const y = floorTop(i + 1) + 1.6;
          const x = tx - 1.05 * u - 21;
          const src = fluentSrc(FLOOR_PICS[i]);
          const paint = COLOUR_PAINT[FLOOR_COLOURS[i]];
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width="21"
                height={u - 3.2}
                rx="2.4"
                fill="#ffffff"
                stroke="#e0a632"
                strokeWidth="1.1"
              />
              {day ? (
                src && <image href={src} x={x + 1.4} y={y + 1} width="7.6" height="7.6" />
              ) : (
                <rect x={x + 1.6} y={y + 1.3} width="7.2" height="7" rx="1.6" fill={paint.face} />
              )}
              <circle cx={x + 15} cy={y + (u - 3.2) / 2} r="4.2" fill="#2f9e58" />
              <text
                x={x + 15}
                y={y + (u - 3.2) / 2 + 2.3}
                textAnchor="middle"
                fontSize="6.4"
                fontWeight="900"
                fill="#ffffff"
                fontFamily="Nunito, sans-serif"
              >
                {i + 1}
              </text>
            </g>
          );
        })}
        {/* the rails and the car, the girl riding up */}
        <rect
          x={railX}
          y={floorTop(4) - 3}
          width="1.4"
          height={ground - floorTop(4) + 3}
          fill="#8a6a2a"
        />
        <rect
          x={railX + u - 1.4}
          y={floorTop(4) - 3}
          width="1.4"
          height={ground - floorTop(4) + 3}
          fill="#8a6a2a"
        />
        <rect
          x={railX}
          y={carBottom - carH}
          width={u}
          height={carH}
          rx="1.6"
          fill="#cfeaf8"
          stroke="#e0a632"
          strokeWidth="1.6"
        />
        <KidArt who="girl" x={railX + 1.6} y={carBottom - carH + 1} w={u - 3.2} h={carH - 1.6} />
        <rect x={railX - 0.8} y={carBottom} width={u + 1.6} height="1.8" rx="0.6" fill="#c58a1e" />
        {/* the boy waiting on the sand, and what he wants */}
        <KidArt who="boy" x={railX + u + 3} y={ground - 25} w={16} h={25} />
        {day ? (
          <g>
            <rect
              x={railX + u + 1}
              y={ground - 39}
              width="20"
              height="11"
              rx="3"
              fill="#ffffff"
              stroke="#e0a632"
              strokeWidth="1.1"
            />
            {boySrc && (
              <image href={boySrc} x={railX + u + 2.4} y={ground - 38} width="8.6" height="8.6" />
            )}
            <circle cx={railX + u + 15.6} cy={ground - 33.5} r="3.8" fill="#2f9e58" />
            <text
              x={railX + u + 15.6}
              y={ground - 31.4}
              textAnchor="middle"
              fontSize="5.8"
              fontWeight="900"
              fill="#ffffff"
              fontFamily="Nunito, sans-serif"
            >
              3
            </text>
          </g>
        ) : (
          <g>
            <path
              d={`M${railX + u + 15} ${ground - 13} Q${railX + u + 19} ${ground - 22} ${railX + u + 17} ${ground - 30}`}
              fill="none"
              stroke="#fff1d6"
              strokeWidth="0.9"
            />
            <ellipse
              cx={railX + u + 17}
              cy={ground - 38}
              rx="6.4"
              ry="7.8"
              fill={COLOUR_PAINT.green.face}
              stroke={COLOUR_PAINT.green.edge}
              strokeWidth="1"
            />
          </g>
        )}
        {/* the call buttons */}
        <rect
          x="113"
          y="47"
          width="24"
          height="44"
          rx="7"
          fill="#fff8e6"
          stroke="#e0a632"
          strokeWidth="1.6"
        />
        <MiniButton x={125} y={60} up />
        <MiniButton x={125} y={78} up={false} />
      </svg>
    </span>
  );
}
