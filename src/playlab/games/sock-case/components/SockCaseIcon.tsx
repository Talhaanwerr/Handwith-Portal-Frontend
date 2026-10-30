import { GlassOver, SockArt } from "@games/sock-case/components/SockArt";

/**
 * The Library card's scene for The Missing Sock Case — Jigsaw Fun's playroom
 * (a warm wall, the wooden table), a washing line with a pair of red striped
 * socks and one lonely blue sock under the detective's magnifying glass, and
 * the blue laundry basket on the table. The socks and the glass are the
 * game's own drawings; everything else is inline SVG (the Library page does
 * not load playlab.css). Nothing moves.
 */
export function SockCaseIcon() {
  const pegs = [22, 44, 72];
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <defs>
          <linearGradient id="skc-ic-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF8EC" />
            <stop offset="1" stopColor="#FFE9CF" />
          </linearGradient>
          <linearGradient id="skc-ic-table" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#D09A5F" />
            <stop offset="1" stopColor="#AD7038" />
          </linearGradient>
          <linearGradient id="skc-ic-basket" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7FCBEA" />
            <stop offset="1" stopColor="#3C9DCA" />
          </linearGradient>
        </defs>
        {/* the playroom: the wall and the table */}
        <rect width="100" height="100" fill="url(#skc-ic-wall)" />
        <rect y="76" width="100" height="24" fill="url(#skc-ic-table)" />
        <rect y="76" width="100" height="2.4" fill="#E8B77E" />

        {/* the washing line between two hooks */}
        <path d="M4 18 H96" stroke="#D9B173" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="4" cy="18" r="2.2" fill="#E0A85E" />
        <circle cx="96" cy="18" r="2.2" fill="#E0A85E" />

        {/* the pair, and the lonely sock */}
        <SockArt
          sock={{ colour: "red", pattern: "stripes" }}
          x={13}
          y={16}
          width={22}
          height={30}
        />
        <SockArt
          sock={{ colour: "red", pattern: "stripes" }}
          x={35}
          y={16}
          width={22}
          height={30}
        />
        <SockArt sock={{ colour: "blue", pattern: "dots" }} x={63} y={16} width={22} height={30} />
        {pegs.map((x) => (
          <g key={x}>
            <rect x={x - 2.2} y={14} width={4.4} height={8} rx={1.6} fill="#E2AE6E" />
            <rect x={x - 2.4} y={17} width={4.8} height={1.6} rx={0.8} fill="#9AA7B4" />
          </g>
        ))}

        {/* the basket on the table */}
        <rect x="8" y="62" width="44" height="6" rx="3" fill="#24739A" />
        <path d="M8 66 H52 L48 92 Q47 95 44 95 H16 Q13 95 12 92 Z" fill="url(#skc-ic-basket)" />
        <rect x="6" y="63" width="48" height="5" rx="2.5" fill="#A8E0F6" />
        <g fill="#2A83AE" opacity="0.75">
          {[16, 24, 32, 40].map((x) => (
            <rect key={x} x={x} y={74} width={4} height={6} rx={2} />
          ))}
        </g>

        {/* the detective's glass over the lonely sock */}
        <svg x="56" y="20" width="42" height="42" viewBox="0 0 140 140">
          <GlassOver sock={{ colour: "blue", pattern: "dots" }} />
        </svg>
      </svg>
    </div>
  );
}
