/**
 * The Library card's scene for Tiny Toy Shop: a striped shop awning over a
 * wooden shelf of toys, and a basket of two teddies on the counter. Inline
 * SVG only: the Library page does not load playlab.css. Nothing moves.
 */
export function TinyToyShopIcon() {
  const icon = (id: string) => `/games/blend-read/icons/${id}.svg`;
  const stripes = ["#E8574F", "#FFFFFF", "#E8574F", "#FFFFFF", "#E8574F", "#FFFFFF", "#E8574F"];
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        {/* sky and shop wall */}
        <rect width="100" height="100" fill="#8FD3F5" />
        <rect y="14" width="100" height="62" fill="#FFF3DC" />
        {/* awning */}
        {stripes.map((c, i) => (
          <path
            key={i}
            d={`M${i * 14.3} 8 h14.3 v12 a7.15 7.15 0 0 1 -14.3 0 z`}
            fill={c}
            stroke="#B83A34"
            strokeWidth="0.6"
          />
        ))}
        {/* shelf with toys */}
        <rect x="8" y="46" width="84" height="4" rx="1" fill="#9B6A3C" />
        <image href={icon("ball")} x="12" y="30" width="17" height="17" />
        <image href={icon("drum")} x="33" y="30" width="17" height="17" />
        <image href={icon("train")} x="54" y="30" width="17" height="17" />
        <image href={icon("horse")} x="73" y="29" width="18" height="18" />
        {/* counter */}
        <rect y="72" width="100" height="28" fill="#C98A4E" />
        <rect y="70" width="100" height="5" fill="#E2A766" />
        {/* basket of teddies */}
        <image href={icon("bear")} x="30" y="50" width="20" height="20" />
        <image href={icon("bear")} x="48" y="50" width="20" height="20" />
        <path d="M30 66 Q49 46 68 66" fill="none" stroke="#8A5A2B" strokeWidth="2.4" />
        <path d="M27 64 h44 l-5 20 h-34 z" fill="#D9A35B" stroke="#8A5A2B" strokeWidth="1.4" />
        <path d="M29 71 h40 M30.5 77 h37" stroke="#8A5A2B" strokeWidth="1" />
      </svg>
    </div>
  );
}
