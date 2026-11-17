/**
 * The Library card's scene for Rhyme Match: the garden — sky, a picket fence,
 * the lawn — with a dog and a frog together on a white pad and a sun waiting
 * below. Inline SVG and images only (the Library page does not load
 * playlab.css). Nothing moves.
 */
export function RhymeMatchIcon() {
  const pic = (f: string) => `/games/fluent3d/${f}.png`;
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill="#AEE3FA" />
        <rect y="44" width="100" height="12" fill="#FFFFFF" />
        {[4, 16, 28, 40, 52, 64, 76, 88].map((x) => (
          <path key={x} d={`M${x} 58 V40 L${x + 4} 35 L${x + 8} 40 V58 Z`} fill="#FFFFFF" />
        ))}
        <rect y="56" width="100" height="44" fill="#78C85C" />
        <rect x="14" y="18" width="72" height="40" rx="12" fill="#FFFFFF" />
        <rect
          x="14"
          y="18"
          width="72"
          height="40"
          rx="12"
          fill="none"
          stroke="#FFD23D"
          strokeWidth="3"
        />
        <image href={pic("dog_face")} x="18" y="21" width="32" height="34" />
        <image href={pic("frog")} x="50" y="21" width="32" height="34" />
        <image href={pic("sun")} x="38" y="66" width="24" height="24" />
      </svg>
    </div>
  );
}
