/**
 * The Library card's scene for Shadow Match Mystery: a classroom wall and
 * floor, a train above a spotlight patch holding its dark shadow, and a short
 * and a long shadow bar. Inline SVG only (the Library page does not load
 * playlab.css). Nothing moves.
 */
export function ShadowMatchIcon() {
  const train = "/games/blend-read/icons/train.svg";
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <filter id="shm-ic-black">
            <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.75 0" />
          </filter>
        </defs>
        <rect width="100" height="100" fill="#FBE9D6" />
        <rect y="64" width="100" height="36" fill="#D9A066" />
        <rect y="62" width="100" height="3" fill="#B97E48" />
        {/* the spotlight patch with the train's shadow */}
        <ellipse cx="50" cy="74" rx="38" ry="16" fill="#FFF8E6" />
        <image href={train} x="30" y="56" width="40" height="34" filter="url(#shm-ic-black)" />
        {/* the train itself, above */}
        <image href={train} x="30" y="10" width="40" height="40" />
        {/* a short and a long shadow bar */}
        <rect x="8" y="30" width="12" height="5" rx="2.5" fill="#3A3A4A" opacity="0.7" />
        <rect x="76" y="30" width="18" height="5" rx="2.5" fill="#3A3A4A" opacity="0.7" />
      </svg>
    </div>
  );
}
