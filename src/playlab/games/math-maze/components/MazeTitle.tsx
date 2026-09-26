"use client";

/**
 * "Math Maze ① → ⑩" — the title the reference wears, the numbers in round
 * BADGES rather than typed, with a red arrow between them. The badges change
 * with the maze, so the title itself says which way to count: 1 → 5,
 * 1 → 10, or 10 → 1.
 */
export function MazeTitle({ from, to, big = false }: { from: number; to: number; big?: boolean }) {
  return (
    <h1
      className={`mz-title font-rounded font-black ${big ? "mz-title--big" : ""}`}
      aria-label={`Math Maze, ${from} to ${to}`}
    >
      <span className="mz-title-words">Math Maze</span>
      <span className="mz-title-run" aria-hidden="true">
        <span className="mz-badge">{from}</span>
        <svg viewBox="0 0 40 20" className="mz-arrow">
          <path
            d="M2 10 H30 M24 3 L34 10 L24 17"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
        <span className="mz-badge">{to}</span>
      </span>
    </h1>
  );
}
