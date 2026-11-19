/**
 * The Library card's scene for Rhyme Time: the sunny stage — sky, red
 * curtains, wooden boards — with a cat and a hat side by side and a green
 * thumbs-up. Inline SVG and images only (the Library page does not load
 * playlab.css). Nothing moves.
 */
export function RhymeOrNotIcon() {
  const pic = (f: string) => `/games/fluent3d/${f}.png`;
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill="#A9E2FA" />
        <rect y="66" width="100" height="34" fill="#E9A257" />
        <rect y="64" width="100" height="3" fill="#B86E2A" />
        <path d="M0 0 H16 Q12 34 6 60 H0 Z" fill="#D0434D" />
        <path d="M100 0 H84 Q88 34 94 60 H100 Z" fill="#D0434D" />
        <rect width="100" height="7" fill="#C93C46" />
        <ellipse cx="32" cy="70" rx="18" ry="4" fill="#B86E2A" opacity="0.5" />
        <ellipse cx="68" cy="70" rx="18" ry="4" fill="#B86E2A" opacity="0.5" />
        <image href={pic("cat_face")} x="14" y="34" width="36" height="36" />
        <image href={pic("top_hat")} x="50" y="34" width="36" height="36" />
        <circle cx="50" cy="86" r="11" fill="#3DAB72" />
        <image href={pic("thumbs_up")} x="42" y="78" width="16" height="16" />
      </svg>
    </div>
  );
}
