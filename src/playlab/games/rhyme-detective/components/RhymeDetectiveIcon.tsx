/**
 * The Library card's scene for Rhyme Detective: a lavender bedroom wall with
 * a shelf, a manila case file pinned up with a cat on it, and a big
 * magnifying glass over a hat on the shelf. Inline SVG and images only (the
 * Library page does not load playlab.css). Nothing moves.
 */
export function RhymeDetectiveIcon() {
  const pic = (f: string) => `/games/fluent3d/${f}.png`;
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill="#D9C8EE" />
        {[6, 22, 38, 54, 70, 86].map((x) => (
          <rect key={x} x={x} width="7" height="100" fill="#CDB8E6" />
        ))}
        <rect y="76" width="100" height="24" fill="#E3A865" />
        <rect y="74" width="100" height="4" fill="#FFFFFF" />
        <rect x="46" y="62" width="50" height="5" rx="2" fill="#B57A43" />
        <rect x="6" y="10" width="38" height="44" rx="4" fill="#F3D28B" />
        <rect x="6" y="6" width="16" height="7" rx="2" fill="#E4BC6A" />
        <rect x="11" y="16" width="28" height="28" rx="3" fill="#FFFFFF" />
        <image href={pic("cat_face")} x="13" y="18" width="24" height="24" />
        <circle cx="70" cy="44" r="21" fill="#EAF6FF" />
        <image href={pic("top_hat")} x="54" y="28" width="32" height="32" />
        <circle cx="70" cy="44" r="21" fill="none" stroke="#E2A93B" strokeWidth="5" />
        <rect
          x="80"
          y="62"
          width="8"
          height="26"
          rx="4"
          fill="#7A4A22"
          transform="rotate(-38 84 75)"
        />
      </svg>
    </div>
  );
}
