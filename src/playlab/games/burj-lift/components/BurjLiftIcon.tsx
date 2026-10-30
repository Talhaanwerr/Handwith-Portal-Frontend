import { BurjTowerArt } from "@shared/components/dubai/BurjTower";

/**
 * The Library card's scene for Burj Lift — a sunny Dubai sky, a low skyline
 * and the sand, the Burj Khalifa in the middle with its glass lift on the
 * side, a penguin riding in it and an up arrow beside. Inline SVG only (the
 * Library page does not load playlab.css); the penguin is the portal's
 * Fluent picture. Nothing moves.
 */
export function BurjLiftIcon() {
  const u = 12;
  const ground = 94;
  const x = 40;
  const podTop = ground - 0.5 * u;
  const rail = x + 1.05 * u;
  const carBottom = podTop - 2 * u;
  const carH = u * 0.94;
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="bjl-ic-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5aaee8" />
            <stop offset="0.6" stopColor="#bfe2f6" />
            <stop offset="1" stopColor="#f8e3bf" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="url(#bjl-ic-sky)" />
        <circle cx="80" cy="18" r="8" fill="#ffe27a" />
        <path d="M0 80V68h7v12h4V60h6v20h5V70h5v10h46V64l6-6v22h4V72h7v8h10v20H0Z" fill="#b4c6da" />
        <path d="M0 85C30 79 64 80 100 83V100H0Z" fill="#e9c48a" />
        <path d="M0 93C34 88 70 89 100 92V100H0Z" fill="#dfae72" />
        <BurjTowerArt x={x} ground={ground} unit={u} floors={5} time="day" spireUnits={1.9} />
        {/* the lift: rails, the glass car in its gold frame */}
        <rect x={rail} y={podTop - 5.3 * u} width="1.4" height={5.8 * u} fill="#8a6a2a" />
        <rect x={rail + u - 1.4} y={podTop - 5.3 * u} width="1.4" height={5.8 * u} fill="#8a6a2a" />
        <rect
          x={rail}
          y={carBottom - carH}
          width={u}
          height={carH}
          rx="1.6"
          fill="#cfeaf8"
          stroke="#e0a632"
          strokeWidth="1.8"
        />
        <rect
          x={rail + u * 0.3}
          y={carBottom - carH - 2.4}
          width={u * 0.4}
          height="2.4"
          fill="#c58a1e"
        />
        <rect x={rail - 0.8} y={carBottom} width={u + 1.6} height="1.8" fill="#c58a1e" />
        {/* the big up arrow */}
        <path
          d="M80 36 L92 50 H85 V64 H75 V50 H68 Z"
          fill="#e3a12f"
          stroke="#b07415"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/games/fluent3d/penguin.png"
        alt=""
        className="absolute"
        style={{
          left: `${rail + 1}%`,
          top: `${carBottom - carH + 1.4}%`,
          width: `${u - 2}%`,
          height: `${carH - 2}%`,
          objectFit: "contain",
        }}
      />
    </div>
  );
}
