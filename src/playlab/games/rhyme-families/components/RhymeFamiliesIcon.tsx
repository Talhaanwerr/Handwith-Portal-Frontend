/**
 * The Library card's scene for Rhyme Houses: two little houses on a green —
 * the cat house (orange roof) and the dog house (blue roof), each with its
 * picture on the front — and a hat coming up the sandy path. Inline SVG and
 * images only (the Library page does not load playlab.css). Nothing moves.
 */
export function RhymeFamiliesIcon() {
  const pic = (f: string) => `/games/fluent3d/${f}.png`;
  const house = (x: number, roof: string, face: string) => (
    <g>
      <rect x={x + 4} y="38" width="32" height="30" rx="2" fill="#FFF4DD" />
      <path d={`M${x} 40 L${x + 20} 20 L${x + 40} 40 Z`} fill={roof} />
      <circle cx={x + 20} cy="52" r="10" fill="#FFFFFF" />
      <image href={pic(face)} x={x + 11} y="43" width="18" height="18" />
    </g>
  );
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill="#AEE1F8" />
        <circle cx="84" cy="14" r="8" fill="#FFE36E" />
        <rect y="62" width="100" height="38" fill="#7CC960" />
        <path d="M40 100 Q46 84 50 72 Q54 84 60 100 Z" fill="#F3D89B" />
        {house(6, "#F2734B", "cat_face")}
        {house(54, "#3F95D8", "dog_face")}
        <image href={pic("top_hat")} x="39" y="78" width="22" height="20" />
      </svg>
    </div>
  );
}
