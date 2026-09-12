"use client";

import type { Theme } from "@games/counting-numbers/constants/levels";

/**
 * The things the child counts — one flat, chunky drawing per theme, in the
 * saturated storybook colours of the reference, each with a lighter face
 * and a glint so it sits off the page the way the friends do. Every drawing
 * fills a 60×60 box so the layouts can treat them all the same size.
 */

const Star = () => (
  <svg viewBox="0 0 60 60" className="cn-thing-svg" aria-hidden="true">
    <path
      d="M30 5 L37.2 22.1 L55.7 23.5 L41.6 35.5 L46 53.5 L30 43.8 L14 53.5 L18.4 35.5 L4.3 23.5 L22.8 22.1 Z"
      fill="#3F6FBF"
    />
    <path
      d="M30 13 L35 25 L48 26 L38 34.5 L41 47 L30 40.5 L19 47 L22 34.5 L12 26 L25 25 Z"
      fill="#5A8AD6"
    />
    <circle cx="24" cy="24" r="2.6" fill="#BFD6F5" opacity="0.9" />
  </svg>
);

const Apple = () => (
  <svg viewBox="0 0 60 60" className="cn-thing-svg" aria-hidden="true">
    <path
      d="M30 14 Q31 6 36 4"
      stroke="#7A4A22"
      strokeWidth="3.2"
      fill="none"
      strokeLinecap="round"
    />
    <path d="M32 11 Q44 4 46 12 Q38 16 32 11 Z" fill="#5FAF3A" />
    <path
      d="M34 11 Q40 8 44 11"
      stroke="#3E8A28"
      strokeWidth="1.4"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M30 17 Q16 8 9 22 Q4 36 14 48 Q22 58 30 52 Q38 58 46 48 Q56 36 51 22 Q44 8 30 17 Z"
      fill="#7DC242"
    />
    <path d="M30 52 Q40 56 46 48 Q52 40 51 30 Q48 44 38 50 Z" fill="#5FAF3A" opacity="0.5" />
    <path
      d="M18 24 Q13 30 15 40"
      stroke="#C8F0A0"
      strokeWidth="3.4"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="21" cy="20" r="2.2" fill="#DDF7BF" />
  </svg>
);

const Balloon = () => (
  <svg viewBox="0 0 60 60" className="cn-thing-svg" aria-hidden="true">
    <ellipse cx="30" cy="26" rx="22" ry="24" fill="#B06AD6" />
    <ellipse cx="35" cy="34" rx="15" ry="13" fill="#9A55C4" opacity="0.45" />
    <ellipse cx="21" cy="15" rx="6" ry="9" fill="#E2BCF5" opacity="0.8" />
    <path d="M26 49 L30 54 L34 49 Z" fill="#8E4FB3" />
    <path d="M30 54 Q26 57 30 60" stroke="#8E4FB3" strokeWidth="1.6" fill="none" />
  </svg>
);

const Ant = () => (
  <svg viewBox="0 0 60 60" className="cn-thing-svg" aria-hidden="true">
    {/* six legs and two antennae, then the three segments and a happy face */}
    <g stroke="#2B2B2B" strokeWidth="2.6" strokeLinecap="round" fill="none">
      <path d="M20 38 L12 44 L10 52 M28 40 L26 48 L22 54 M36 40 L40 48 L42 54" />
      <path d="M18 30 L10 26 L6 30 M30 28 L32 18 L28 14 M40 30 L48 24 L52 26" />
      <path d="M46 22 L50 12 M50 24 L58 18" />
    </g>
    <circle cx="50" cy="11" r="2.2" fill="#2B2B2B" />
    <circle cx="58" cy="17" r="2.2" fill="#2B2B2B" />
    <ellipse cx="15" cy="34" rx="10" ry="7.5" fill="#3A3A3A" />
    <ellipse cx="13" cy="31" rx="5" ry="2.5" fill="#5A5A5A" opacity="0.7" />
    <ellipse cx="30" cy="33" rx="8" ry="6.5" fill="#4A4A4A" />
    <circle cx="44" cy="30" r="9" fill="#3A3A3A" />
    <circle cx="46" cy="27" r="3.4" fill="#FFFFFF" />
    <circle cx="46.8" cy="27.6" r="1.6" fill="#111111" />
    <path
      d="M44 34 Q48 36 51 33"
      stroke="#FFFFFF"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
    />
    <ellipse cx="50" cy="32" rx="2.4" ry="1.4" fill="#F7A6B6" opacity="0.8" />
  </svg>
);

const Bird = ({ color = "#F28AB2" }: { color?: string }) => (
  <svg viewBox="0 0 60 60" className="cn-thing-svg" aria-hidden="true">
    {/* tail, body, a raised wing, a pale belly, beak and a bright eye */}
    <path d="M4 30 L12 22 L14 34 Z" fill={color} />
    <path d="M10 34 Q22 16 40 24 Q54 30 48 44 Q34 52 20 46 Q8 42 10 34 Z" fill={color} />
    <path d="M20 42 Q32 50 44 42 Q34 48 20 42 Z" fill="#FFFFFF" opacity="0.4" />
    <path d="M22 30 Q28 14 44 22 Q36 34 22 30 Z" fill="#FFFFFF" opacity="0.5" />
    <circle cx="45" cy="30" r="3.8" fill="#FFFFFF" />
    <circle cx="45.8" cy="30.4" r="2" fill="#222222" />
    <circle cx="46.6" cy="29.6" r="0.7" fill="#FFFFFF" />
    <path d="M50 32 L58 34.5 L50 37 Z" fill="#F2A53B" />
    <path d="M26 48 L24 54 M32 48 L32 54" stroke="#F2A53B" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const Fish = () => (
  <svg viewBox="0 0 60 60" className="cn-thing-svg" aria-hidden="true">
    {/* tail, body, a paler belly, fins, scales, an eye with a glint */}
    <path d="M4 30 L16 18 L16 42 Z" fill="#2FA6B8" />
    <ellipse cx="34" cy="30" rx="22" ry="15" fill="#3FC1D4" />
    <ellipse cx="36" cy="35" rx="16" ry="7" fill="#8FE0EC" opacity="0.8" />
    <path d="M28 16 Q34 8 42 15 L34 20 Z" fill="#2FA6B8" />
    <path d="M30 44 Q36 52 44 46 L34 41 Z" fill="#2FA6B8" />
    <path
      d="M26 20 Q31 26 26 30 M30 22 Q35 27 30 33 M34 24 Q38 28 34 34"
      stroke="#FFFFFF"
      strokeWidth="2.2"
      fill="none"
      opacity="0.55"
      strokeLinecap="round"
    />
    <circle cx="46" cy="27" r="4.5" fill="#FFFFFF" />
    <circle cx="47" cy="27.5" r="2.4" fill="#1F2A44" />
    <circle cx="48" cy="26.5" r="0.9" fill="#FFFFFF" />
    <path
      d="M50 34 Q53 35 52 37"
      stroke="#1F2A44"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const PETALS = [0, 72, 144, 216, 288] as const;

const Flower = () => (
  <svg viewBox="0 0 60 60" className="cn-thing-svg" aria-hidden="true">
    <path d="M30 40 L30 58" stroke="#5FAF3A" strokeWidth="4" strokeLinecap="round" />
    <path d="M30 50 Q40 44 44 50 Q36 54 30 50 Z" fill="#5FAF3A" />
    <path d="M30 46 Q20 40 16 46 Q24 50 30 46 Z" fill="#4E9A2E" />
    {PETALS.map((deg) => (
      <ellipse
        key={deg}
        cx="30"
        cy="14"
        rx="8"
        ry="11"
        fill="#F4A6C8"
        transform={`rotate(${deg} 30 28)`}
      />
    ))}
    {PETALS.map((deg) => (
      <ellipse
        key={deg}
        cx="30"
        cy="16"
        rx="4"
        ry="6"
        fill="#FAC8DC"
        opacity="0.85"
        transform={`rotate(${deg} 30 28)`}
      />
    ))}
    <circle cx="30" cy="28" r="7" fill="#F6C544" />
    <circle cx="28" cy="26" r="2.2" fill="#FBE59A" />
  </svg>
);

const Cupcake = () => (
  <svg viewBox="0 0 60 60" className="cn-thing-svg" aria-hidden="true">
    {/* the case, its pleats, a swirl of icing, sprinkles and a cherry */}
    <path d="M14 32 L18 54 L42 54 L46 32 Z" fill="#E88A5D" />
    <path d="M20 34 L22 52 M30 34 L30 52 M40 34 L38 52" stroke="#C96F44" strokeWidth="2" />
    <path d="M16 32 L44 32 L43 36 L17 36 Z" fill="#C96F44" opacity="0.5" />
    <path d="M12 32 Q14 14 30 12 Q46 14 48 32 Z" fill="#F7D6E6" />
    <path d="M14 30 Q18 20 30 22 Q42 20 46 30 Z" fill="#FBE6F0" opacity="0.8" />
    <path d="M18 30 Q24 22 30 28 Q36 22 42 30" stroke="#FFFFFF" strokeWidth="3" fill="none" />
    <path
      d="M22 18 L25 21 M34 16 L37 18 M28 25 L30 22 M40 24 L42 27"
      stroke="#3F6FBF"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path d="M19 24 L21 27 M38 20 L41 21" stroke="#F6C544" strokeWidth="2" strokeLinecap="round" />
    <circle cx="30" cy="10" r="4.5" fill="#E0413F" />
    <circle cx="28.5" cy="8.5" r="1.3" fill="#FFFFFF" opacity="0.8" />
    <path
      d="M30 6 Q32 3 35 4"
      stroke="#5FAF3A"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
    />
  </svg>
);

const Duck = () => (
  <svg viewBox="0 0 60 60" className="cn-thing-svg" aria-hidden="true">
    {/* body, a folded wing, a pale tummy, the head, beak and a bright eye */}
    <ellipse cx="28" cy="38" rx="20" ry="13" fill="#F6C544" />
    <ellipse cx="30" cy="44" rx="14" ry="6" fill="#FBE59A" opacity="0.8" />
    <path d="M14 36 Q24 28 34 36 Q26 44 14 36 Z" fill="#EBB12C" />
    <path d="M14 34 Q6 30 8 40 Q14 40 14 34 Z" fill="#E8B330" />
    <circle cx="40" cy="24" r="10" fill="#F6C544" />
    <path d="M48 24 L58 27.5 L48 31 Z" fill="#F28A2E" />
    <path d="M48 27 L56 27.5 L48 29 Z" fill="#E07A20" />
    <circle cx="43" cy="22" r="3.4" fill="#FFFFFF" />
    <circle cx="43.6" cy="22.4" r="1.9" fill="#222222" />
    <circle cx="44.3" cy="21.6" r="0.7" fill="#FFFFFF" />
    <ellipse cx="46" cy="28" rx="2.4" ry="1.4" fill="#F7A6B6" opacity="0.8" />
  </svg>
);

const Kite = () => (
  <svg viewBox="0 0 60 60" className="cn-thing-svg" aria-hidden="true">
    {/* a two-tone diamond, its spars, and a tail with bows */}
    <path d="M30 4 L48 24 L30 44 L12 24 Z" fill="#E0413F" />
    <path d="M30 4 L12 24 L30 44 Z" fill="#F26D6B" />
    <path d="M30 4 L30 44 M12 24 L48 24" stroke="#FFFFFF" strokeWidth="2" opacity="0.7" />
    <circle cx="22" cy="18" r="2.2" fill="#FFFFFF" opacity="0.8" />
    <path d="M30 44 Q26 50 30 54 Q34 58 30 58" stroke="#3F6FBF" strokeWidth="2.5" fill="none" />
    <path d="M26 49 L30 47 L26 45 Z M34 49 L30 47 L34 45 Z" fill="#F6C544" />
    <path d="M26 56 L30 54 L26 52 Z M34 56 L30 54 L34 52 Z" fill="#5FAF3A" />
  </svg>
);

const Block = () => (
  <svg viewBox="0 0 60 60" className="cn-thing-svg" aria-hidden="true">
    {/* a wooden block with a letter on its face */}
    <path d="M12 20 L30 10 L48 20 L48 44 L30 54 L12 44 Z" fill="#4D9EE8" />
    <path d="M30 30 L48 20 L48 44 L30 54 Z" fill="#2F6FB5" />
    <path d="M12 20 L30 10 L48 20 L30 30 Z" fill="#7FBCF2" />
    <path d="M15 24 L30 32 L30 50 L15 42 Z" fill="#6FB2F0" opacity="0.5" />
    <path
      d="M18 43 L22 30 L26 45 M19.5 39 L24.5 39"
      stroke="#FFFFFF"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="30" cy="20" r="3" fill="#FFFFFF" opacity="0.7" />
  </svg>
);

/** The birds come in the reference's five colours, one each. */
const BIRD_COLORS = ["#F28AB2", "#F4F4F4", "#7FBCF2", "#8ED66B", "#B48CE8"] as const;

/** The thing a theme draws, `index` telling the themes that vary which one
 *  this is (the birds are five different colours). */
export function Thing({ theme, index = 0 }: { theme: Theme; index?: number }) {
  switch (theme) {
    case "star":
      return <Star />;
    case "apple":
      return <Apple />;
    case "balloon":
      return <Balloon />;
    case "ant":
      return <Ant />;
    case "door":
      return null; // a door is a whole station, drawn by the sequence screen
    case "bird":
      return <Bird color={BIRD_COLORS[index % BIRD_COLORS.length]} />;
    case "fish":
      return <Fish />;
    case "flower":
      return <Flower />;
    case "cupcake":
      return <Cupcake />;
    case "duck":
      return <Duck />;
    case "kite":
      return <Kite />;
    case "block":
      return <Block />;
  }
}

/** The colours the numbered circles wear behind the ants, one to five. */
export const ANT_COLORS = ["#E8C63B", "#B06AD6", "#E8963B", "#3F6FBF", "#E0556E"] as const;

/** The doors, left to right. */
export const DOOR_COLORS = [
  { body: "#3FA33A", panel: "#2E8A2A" },
  { body: "#E05A6E", panel: "#C8455B" },
  { body: "#A97FD8", panel: "#8E64C2" },
] as const;

/** A tall door with a pale window and a gold knob — one station of the
 *  hall. */
export function Door({ index }: { index: number }) {
  const c = DOOR_COLORS[index % DOOR_COLORS.length];
  return (
    <svg viewBox="0 0 100 220" className="cn-door-svg" aria-hidden="true">
      <rect x="2" y="2" width="96" height="216" rx="6" fill="#D9D3C4" />
      <rect x="10" y="10" width="80" height="208" rx="4" fill={c.body} />
      <rect x="18" y="20" width="64" height="120" rx="3" fill={c.panel} />
      <rect x="22" y="24" width="56" height="112" rx="2" fill="#E8B84A" />
      <rect x="27" y="29" width="46" height="102" rx="2" fill="#DDE9F0" />
      <circle cx="22" cy="150" r="5" fill="#E8B84A" />
    </svg>
  );
}

/** A four-point sparkle — what a finished level throws. */
export function Sparkle() {
  return (
    <svg viewBox="0 0 40 40" className="cn-thing-svg" aria-hidden="true">
      <path d="M20 2 Q22 17 38 20 Q22 23 20 38 Q18 23 2 20 Q18 17 20 2 Z" fill="#F6C544" />
      <circle cx="20" cy="20" r="3.5" fill="#FFFFFF" />
    </svg>
  );
}

/** The plate the apples sit on. */
export function Plate() {
  return (
    <svg viewBox="0 0 200 60" className="cn-plate-svg" aria-hidden="true">
      <ellipse cx="100" cy="30" rx="98" ry="26" fill="#DDE9F0" />
      <ellipse cx="100" cy="28" rx="82" ry="18" fill="#EEF6FA" />
    </svg>
  );
}

/** The classroom table and its chair. */
export function TableAndChair() {
  return (
    <svg viewBox="0 0 400 200" className="cn-table-svg" aria-hidden="true">
      {/* chair, behind and to the left */}
      <path d="M40 40 L110 40 L114 96 L44 96 Z" fill="#E9C08A" />
      <path
        d="M46 96 L42 170 M108 96 L114 170"
        stroke="#9AA6B2"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* the table top, then its legs */}
      <path d="M120 80 L400 80 L400 106 L120 106 Z" fill="#E9C08A" />
      <path
        d="M150 106 L140 190 M380 106 L392 190"
        stroke="#9AA6B2"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path d="M120 80 L400 80 L400 88 L120 88 Z" fill="#F4D8AC" />
    </svg>
  );
}
