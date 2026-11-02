/**
 * The Library card's scene for Drum Beats — a warm playroom wall, the big
 * drum, and its row of dots under it: two blue, one red. Inline SVG (the
 * Library page does not load playlab.css); the drum is the game's own Fluent
 * picture. Nothing moves.
 */
const DOTS = [
  { x: 32, fill: "#2F8FCB" },
  { x: 50, fill: "#2F8FCB" },
  { x: 68, fill: "#E8574F" },
];

export function DrumBeatsIcon() {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill="#FFF4E4" />
        <rect y="80" width="100" height="20" fill="#E0AE7A" />
        <rect x="18" y="74" width="64" height="16" rx="8" fill="#FFFFFF" />
        {DOTS.map((d) => (
          <circle key={d.x} cx={d.x} cy="82" r="5.6" fill={d.fill} />
        ))}
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/games/fluent3d/drum.png"
        alt=""
        className="absolute"
        style={{ left: "22%", top: "10%", width: "56%", height: "56%", objectFit: "contain" }}
      />
    </div>
  );
}
