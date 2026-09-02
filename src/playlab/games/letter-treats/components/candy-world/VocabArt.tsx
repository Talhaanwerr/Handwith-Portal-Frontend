"use client";

/**
 * VocabArt - the Alphabet Set vocabulary pictures PlayLab did not already
 * draw, in the same language as CandyArt and the shared AnimalArt:
 *
 *   - 100 x 100 viewBox, soft rounded silhouettes, no outlines
 *   - every body is a lit gradient from CandyDefs (F.*), so each form reads
 *     as a volume under the shared upper-left light
 *   - a specular (Spec) on the main form, a darker shape for the shaded side,
 *     and a cast shadow pool under every object
 *   - pastel Candy Land palette; saturated colour only where recognition
 *     needs it (a red apple, a yellow sun)
 *   - detail only where it helps a 3-year-old name the thing
 *
 * Every entry is a zero-argument component so TreatArt can treat all three
 * picture sources (these, AnimalArt, the bakery ingredients) identically.
 */

import { F, Spec, Shade } from "@games/letter-treats/components/candy-world/CandyDefs";
import { ANIMAL_ART } from "@shared/components/illustrations/AnimalArt";

type Art = () => React.ReactElement;

const P = {
  pink: "#FF9EC4",
  pinkDeep: "#F06AA0",
  pinkLight: "#FFD3E4",
  red: "#F25C6E",
  redDeep: "#D9405A",
  orange: "#FFA868",
  orangeDeep: "#F08A45",
  yellow: "#FFD93D",
  yellowDeep: "#F0B429",
  cream: "#FFF5E6",
  sand: "#F2D9B3",
  brown: "#B07A5A",
  brownDeep: "#8C5C40",
  mint: "#A6E9CB",
  mintDeep: "#6FD1A6",
  green: "#7CCB8F",
  greenDeep: "#55A86D",
  sky: "#8FD6FF",
  skyDeep: "#4FB0F0",
  blue: "#74B9FF",
  blueDeep: "#4A8FE0",
  navy: "#3D3D5C",
  lavender: "#C9B8F2",
  lavenderDeep: "#A98BE0",
  purple: "#9B6FD6",
  grey: "#C9CFDD",
  greyDeep: "#9AA3B8",
  white: "#FFFFFF",
  ink: "#3D3D5C",
} as const;

const SH = "rgba(60,40,80,0.14)";

/** The upper-left highlight every form gets. */
const Hi = ({ x, y, rx = 7, ry = 5 }: { x: number; y: number; rx?: number; ry?: number }) => (
  <Spec x={x} y={y} rx={rx * 1.15} ry={ry * 1.15} />
);
const Eye = ({ x, y, r = 3.5 }: { x: number; y: number; r?: number }) => (
  <>
    <circle cx={x} cy={y} r={r} fill={P.ink} />
    <circle cx={x + r * 0.35} cy={y - r * 0.35} r={r * 0.35} fill={P.white} />
  </>
);
const Smile = ({ x, y, w = 8 }: { x: number; y: number; w?: number }) => (
  <path
    d={`M${x - w / 2} ${y} Q${x} ${y + w * 0.6} ${x + w / 2} ${y}`}
    stroke={P.ink}
    strokeWidth="2.5"
    fill="none"
    strokeLinecap="round"
  />
);
const Svg = ({ children }: { children: React.ReactNode }) => (
  <svg viewBox="0 0 100 100" className="h-full w-full">
    <Shade x={50} y={93} rx={30} ry={5} />
    {children}
  </svg>
);

// ── A ──
const Astronaut: Art = () => (
  <Svg>
    {/* backpack peeks out behind the shoulders */}
    <rect x="26" y="44" width="48" height="30" rx="10" fill={F.grey} />
    {/* suit: torso, arms, legs, boots */}
    <path
      d="M30 54 Q30 46 38 46 L62 46 Q70 46 70 54 L70 78 Q70 84 64 84 L36 84 Q30 84 30 78 Z"
      fill={F.white}
    />
    <path d="M28 50 Q18 52 18 64 L18 72 Q18 78 24 78 L30 76 L30 54 Z" fill={F.white} />
    <path d="M72 50 Q82 52 82 64 L82 72 Q82 78 76 78 L70 76 L70 54 Z" fill={F.white} />
    <rect x="34" y="82" width="13" height="10" rx="4" fill={F.white} />
    <rect x="53" y="82" width="13" height="10" rx="4" fill={F.white} />
    <rect x="32" y="88" width="16" height="6" rx="3" fill={F.grey} />
    <rect x="52" y="88" width="16" height="6" rx="3" fill={F.grey} />
    {/* suit seams, chest panel, glove cuffs */}
    <path d="M30 64 H70" stroke={P.grey} strokeWidth="1.5" opacity="0.6" />
    <rect x="42" y="58" width="16" height="11" rx="3" fill={F.sky} />
    <circle cx="46" cy="63" r="1.8" fill={P.red} />
    <circle cx="53" cy="63" r="1.8" fill={P.yellow} />
    <rect x="18" y="70" width="12" height="5" rx="2.5" fill={F.grey} />
    <rect x="70" y="70" width="12" height="5" rx="2.5" fill={F.grey} />
    <circle cx="22" cy="80" r="5" fill={F.grey} />
    <circle cx="78" cy="80" r="5" fill={F.grey} />
    {/* helmet: white shell, collar, deep visor with a face inside */}
    <rect x="36" y="42" width="28" height="8" rx="4" fill={F.grey} />
    <circle cx="50" cy="28" r="23" fill={F.white} />
    <path d="M31 30 Q31 12 50 12 Q69 12 69 30 Q69 46 50 46 Q31 46 31 30 Z" fill={F.skyDeep} />
    <path d="M33 30 Q33 14 50 14 Q67 14 67 30 Q67 44 50 44 Q33 44 33 30 Z" fill={F.sky} />
    <circle cx="50" cy="32" r="12" fill={F.sand} />
    <path d="M38 26 Q50 18 62 26 Q58 22 50 22 Q42 22 38 26 Z" fill={F.brown} />
    <Eye x={46} y={31} r={2.2} />
    <Eye x={54} y={31} r={2.2} />
    <Smile x={50} y={36} w={7} />
    <path
      d="M35 24 Q40 12 52 13"
      stroke="#FFFFFF"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      opacity="0.8"
    />
    <circle cx="50" cy="28" r="23" fill="url(#cg-shadow)" opacity="0.25" />
    <Hi x={40} y={16} rx={7} ry={4} />
    <Hi x={40} y={54} rx={5} ry={3} />
  </Svg>
);
const Anchor: Art = () => (
  <Svg>
    <circle cx="50" cy="16" r="8" fill="none" stroke={P.blueDeep} strokeWidth="6" />
    <rect x="46" y="22" width="8" height="54" rx="4" fill={F.blue} />
    <rect x="30" y="34" width="40" height="8" rx="4" fill={F.blue} />
    <path
      d="M18 58 Q22 84 50 86 Q78 84 82 58 Q74 68 66 66 L66 60 L78 56 M34 66 Q26 68 18 58"
      stroke={P.blue}
      strokeWidth="8"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Hi x={44} y={30} rx={3} ry={8} />
  </Svg>
);

// ── B ──
const Bus: Art = () => (
  <Svg>
    <rect x="10" y="26" width="80" height="50" rx="14" fill={F.yellow} />
    <rect x="10" y="56" width="80" height="20" rx="10" fill={F.yellowDeep} />
    <rect x="18" y="34" width="18" height="16" rx="5" fill={F.sky} />
    <rect x="41" y="34" width="18" height="16" rx="5" fill={F.sky} />
    <rect x="64" y="34" width="18" height="16" rx="5" fill={F.sky} />
    <circle cx="30" cy="78" r="9" fill={P.ink} />
    <circle cx="70" cy="78" r="9" fill={P.ink} />
    <circle cx="30" cy="78" r="4" fill={F.grey} />
    <circle cx="70" cy="78" r="4" fill={F.grey} />
    <Hi x={24} y={31} rx={8} ry={3} />
  </Svg>
);
const Butterfly: Art = () => (
  <Svg>
    <path d="M50 50 C 30 14, 8 22, 16 46 C 6 62, 28 78, 50 56 Z" fill={F.pink} />
    <path d="M50 50 C 70 14, 92 22, 84 46 C 94 62, 72 78, 50 56 Z" fill={F.pink} />
    <circle cx="28" cy="40" r="7" fill={F.lavender} />
    <circle cx="72" cy="40" r="7" fill={F.lavender} />
    <circle cx="30" cy="62" r="4" fill={F.yellow} />
    <circle cx="70" cy="62" r="4" fill={F.yellow} />
    <rect x="46" y="30" width="8" height="42" rx="4" fill={F.purple} />
    <path
      d="M48 30 Q42 20 36 18 M52 30 Q58 20 64 18"
      stroke={P.purple}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <Hi x={24} y={30} rx={6} ry={4} />
  </Svg>
);

// ── C ──
const Car: Art = () => (
  <Svg>
    <path
      d="M14 62 L20 44 Q24 36 32 36 L64 36 Q72 36 78 44 L88 52 L88 66 Q88 70 84 70 L18 70 Q14 70 14 66 Z"
      fill={F.red}
    />
    <path d="M28 44 L36 40 L60 40 L70 48 Z" fill={F.sky} />
    <rect x="14" y="60" width="74" height="10" rx="4" fill={F.redDeep} />
    <circle cx="30" cy="72" r="9" fill={P.ink} />
    <circle cx="72" cy="72" r="9" fill={P.ink} />
    <circle cx="30" cy="72" r="4" fill={F.grey} />
    <circle cx="72" cy="72" r="4" fill={F.grey} />
    <Hi x={34} y={52} rx={8} ry={3} />
  </Svg>
);
const Cup: Art = () => (
  <Svg>
    <path d="M24 30 L30 82 Q31 88 38 88 L62 88 Q69 88 70 82 L76 30 Z" fill={F.lavender} />
    <path
      d="M28 60 L30 82 Q31 88 38 88 L62 88 Q69 88 70 82 L72 60 Z"
      fill={F.lavenderDeep}
      opacity="0.55"
    />
    <ellipse cx="50" cy="30" rx="26" ry="8" fill={F.lavenderDeep} />
    <ellipse cx="50" cy="30" rx="20" ry="5" fill={F.sand} />
    <path
      d="M76 42 Q94 44 90 60 Q86 70 72 70"
      stroke={P.lavender}
      strokeWidth="8"
      fill="none"
      strokeLinecap="round"
    />
    <Hi x={36} y={46} rx={4} ry={10} />
  </Svg>
);
const Cake: Art = () => (
  <Svg>
    <rect x="16" y="50" width="68" height="34" rx="10" fill={F.pink} />
    <rect x="16" y="70" width="68" height="14" rx="8" fill={F.pinkDeep} opacity="0.5" />
    <path
      d="M16 50 Q24 60 32 50 Q40 60 48 50 Q56 60 64 50 Q72 60 80 50 L84 50 L84 58 L16 58 Z"
      fill={F.cream}
    />
    <rect x="16" y="44" width="68" height="12" rx="6" fill={F.cream} />
    <rect x="47" y="22" width="6" height="22" rx="3" fill={F.sky} />
    <ellipse cx="50" cy="18" rx="5" ry="8" fill={F.yellow} />
    <circle cx="34" cy="66" r="3" fill={F.yellow} />
    <circle cx="50" cy="70" r="3" fill={F.mint} />
    <circle cx="66" cy="66" r="3" fill={F.sky} />
    <Hi x={30} y={48} rx={8} ry={3} />
  </Svg>
);
const Cow: Art = () => (
  <Svg>
    <ellipse cx="50" cy="54" rx="32" ry="28" fill={P.white} />
    <path d="M26 66 Q36 52 50 58 Q64 52 74 66 Q66 86 50 86 Q34 86 26 66Z" fill={F.pink} />
    <path d="M20 40 Q12 30 20 24 Q30 24 32 36 Z" fill={P.white} />
    <path d="M80 40 Q88 30 80 24 Q70 24 68 36 Z" fill={P.white} />
    <path d="M30 30 Q24 18 34 16 Q36 26 38 30 Z M70 30 Q76 18 66 16 Q64 26 62 30 Z" fill={F.sand} />
    <path d="M56 36 Q70 30 72 46 Q62 52 56 36Z" fill={P.ink} opacity="0.7" />
    <Eye x={40} y={48} />
    <Eye x={60} y={48} />
    <circle cx="42" cy="70" r="3" fill={F.pinkDeep} />
    <circle cx="58" cy="70" r="3" fill={F.pinkDeep} />
    <Hi x={36} y={38} rx={7} ry={4} />
  </Svg>
);

// ── D ──
const Drum: Art = () => (
  <Svg>
    <rect x="18" y="34" width="64" height="44" rx="8" fill={F.red} />
    <path
      d="M18 50 L82 50 L82 78 Q82 86 74 86 L26 86 Q18 86 18 78 Z"
      fill={F.redDeep}
      opacity="0.5"
    />
    <path
      d="M26 36 L36 76 M46 36 L56 76 M66 36 L76 76 M36 36 L26 76 M56 36 L46 76 M76 36 L66 76"
      stroke={P.yellow}
      strokeWidth="3"
      strokeLinecap="round"
    />
    <ellipse cx="50" cy="34" rx="32" ry="10" fill={F.cream} />
    <path d="M30 20 L46 32 M70 20 L54 32" stroke={P.brown} strokeWidth="4" strokeLinecap="round" />
    <circle cx="28" cy="18" r="5" fill={F.sand} />
    <circle cx="72" cy="18" r="5" fill={F.sand} />
    <Hi x={34} y={30} rx={8} ry={3} />
  </Svg>
);
const Doll: Art = () => (
  <Svg>
    <path d="M24 90 Q28 60 50 58 Q72 60 76 90 Z" fill={F.pink} />
    <path d="M32 90 L68 90 L68 84 L32 84 Z" fill={F.pinkDeep} opacity="0.5" />
    <circle cx="50" cy="38" r="22" fill={F.sand} />
    <path d="M28 38 Q28 10 50 12 Q72 10 72 38 Q68 30 50 30 Q32 30 28 38 Z" fill={F.brown} />
    <circle cx="30" cy="40" r="8" fill={F.brown} />
    <circle cx="70" cy="40" r="8" fill={F.brown} />
    <Eye x={42} y={40} r={3} />
    <Eye x={58} y={40} r={3} />
    <Smile x={50} y={48} w={8} />
    <circle cx="38" cy="48" r="3" fill={F.pink} opacity="0.7" />
    <circle cx="62" cy="48" r="3" fill={F.pink} opacity="0.7" />
    <circle cx="50" cy="70" r="3" fill={P.white} />
    <Hi x={40} y={20} rx={6} ry={4} />
  </Svg>
);
const Door: Art = () => (
  <Svg>
    <rect x="24" y="12" width="52" height="80" rx="10" fill={F.brown} />
    <rect x="31" y="20" width="38" height="28" rx="6" fill={F.brownDeep} opacity="0.4" />
    <rect x="31" y="54" width="38" height="30" rx="6" fill={F.brownDeep} opacity="0.4" />
    <circle cx="64" cy="52" r="4" fill={F.yellow} />
    <rect x="18" y="88" width="64" height="6" rx="3" fill={SH} />
    <Hi x={40} y={28} rx={3} ry={8} />
  </Svg>
);
const Duck: Art = () => (
  <Svg>
    <ellipse cx="54" cy="64" rx="30" ry="22" fill={F.yellow} />
    <ellipse cx="56" cy="72" rx="22" ry="12" fill={F.yellowDeep} opacity="0.45" />
    <circle cx="36" cy="40" r="18" fill={F.yellow} />
    <path d="M18 44 Q10 40 18 36 L30 36 L30 46 Z" fill={F.orange} />
    <path d="M72 54 Q90 44 86 62 Q78 68 72 60 Z" fill={F.yellowDeep} opacity="0.6" />
    <Eye x={40} y={36} />
    <Hi x={30} y={30} rx={6} ry={4} />
  </Svg>
);

// ── E ──
const Envelope: Art = () => (
  <Svg>
    <rect x="14" y="28" width="72" height="48" rx="8" fill={F.cream} />
    <path d="M14 34 L50 60 L86 34 L86 30 Q86 28 84 28 L16 28 Q14 28 14 30 Z" fill={F.sand} />
    <path d="M14 76 L40 54 M86 76 L60 54" stroke={P.sand} strokeWidth="3" />
    <circle cx="50" cy="60" r="5" fill={F.red} />
    <Hi x={26} y={40} rx={6} ry={3} />
  </Svg>
);
const EyeArt: Art = () => (
  <Svg>
    <path d="M10 50 Q50 14 90 50 Q50 86 10 50 Z" fill={P.white} />
    <circle cx="50" cy="50" r="18" fill={F.sky} />
    <circle cx="50" cy="50" r="9" fill={P.ink} />
    <circle cx="56" cy="44" r="4" fill={P.white} />
    <path
      d="M10 50 Q50 14 90 50"
      stroke={P.ink}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M24 30 L20 22 M40 20 L38 12 M60 20 L62 12 M76 30 L80 22"
      stroke={P.ink}
      strokeWidth="3"
      strokeLinecap="round"
    />
  </Svg>
);
const Engine: Art = () => (
  <Svg>
    <rect x="40" y="36" width="48" height="36" rx="8" fill={F.red} />
    <rect x="14" y="52" width="30" height="20" rx="6" fill={F.red} />
    <rect x="22" y="30" width="10" height="26" rx="5" fill={P.ink} />
    <rect x="48" y="44" width="14" height="12" rx="4" fill={F.sky} />
    <rect x="66" y="44" width="14" height="12" rx="4" fill={F.sky} />
    <rect x="14" y="66" width="74" height="6" rx="3" fill={F.redDeep} opacity="0.5" />
    <circle cx="26" cy="78" r="7" fill={P.ink} />
    <circle cx="52" cy="78" r="7" fill={P.ink} />
    <circle cx="74" cy="78" r="7" fill={P.ink} />
    <circle cx="22" cy="20" r="7" fill={P.white} opacity="0.8" />
    <circle cx="32" cy="12" r="5" fill={P.white} opacity="0.6" />
    <Hi x={54} y={40} rx={8} ry={3} />
  </Svg>
);

// ── F ──
const Fan: Art = () => (
  <Svg>
    <rect x="46" y="58" width="8" height="26" rx="4" fill={F.grey} />
    <rect x="32" y="82" width="36" height="8" rx="4" fill={F.greyDeep} />
    {[0, 90, 180, 270].map((d) => (
      <ellipse
        key={d}
        cx="50"
        cy="30"
        rx="10"
        ry="18"
        fill={F.sky}
        transform={`rotate(${d} 50 48)`}
      />
    ))}
    <circle cx="50" cy="48" r="8" fill={P.white} />
    <circle cx="50" cy="48" r="30" fill="none" stroke={P.grey} strokeWidth="4" />
    <Hi x={40} y={30} rx={4} ry={6} />
  </Svg>
);
const Flag: Art = () => (
  <Svg>
    <rect x="22" y="10" width="6" height="80" rx="3" fill={F.sand} />
    <path d="M28 14 L80 24 L64 40 L80 56 L28 62 Z" fill={F.red} />
    <path d="M28 40 L72 46 L80 56 L28 62 Z" fill={F.redDeep} opacity="0.4" />
    <circle cx="25" cy="10" r="4" fill={F.yellow} />
    <Hi x={40} y={22} rx={8} ry={3} />
  </Svg>
);
const Flower: Art = () => (
  <Svg>
    <rect x="47" y="56" width="6" height="36" rx="3" fill={F.greenDeep} />
    <ellipse cx="36" cy="78" rx="12" ry="6" fill={F.green} transform="rotate(-30 36 78)" />
    {[0, 60, 120, 180, 240, 300].map((d) => (
      <ellipse
        key={d}
        cx="50"
        cy="22"
        rx="10"
        ry="15"
        fill={F.pink}
        transform={`rotate(${d} 50 40)`}
      />
    ))}
    <circle cx="50" cy="40" r="11" fill={F.yellow} />
    <Hi x={46} y={36} rx={4} ry={3} />
  </Svg>
);
const Fish: Art = () => (
  <Svg>
    <path d="M72 50 L92 34 L92 66 Z" fill={F.orangeDeep} />
    <ellipse cx="46" cy="50" rx="32" ry="22" fill={F.orange} />
    <path d="M18 56 Q46 74 76 56 Q60 72 46 72 Q30 72 18 56 Z" fill={F.orangeDeep} opacity="0.55" />
    <path d="M40 28 Q50 16 58 30 Z" fill={F.orangeDeep} />
    <circle cx="56" cy="46" r="6" fill={F.yellow} />
    <Eye x={30} y={46} />
    <Hi x={34} y={36} rx={7} ry={4} />
  </Svg>
);

// ── G ──
const Guitar: Art = () => (
  <Svg>
    <rect x="46" y="6" width="8" height="46" rx="4" fill={F.brown} />
    <rect x="42" y="4" width="16" height="10" rx="4" fill={F.brownDeep} />
    <path
      d="M50 44 C 30 44, 22 60, 30 70 C 22 82, 30 94, 50 94 C 70 94, 78 82, 70 70 C 78 60, 70 44, 50 44 Z"
      fill={F.orange}
    />
    <path
      d="M30 70 C 22 82, 30 94, 50 94 C 70 94, 78 82, 70 70 Z"
      fill={F.orangeDeep}
      opacity="0.4"
    />
    <circle cx="50" cy="68" r="9" fill={F.brownDeep} />
    <path d="M47 14 L47 80 M50 14 L50 80 M53 14 L53 80" stroke={P.cream} strokeWidth="1.2" />
    <Hi x={38} y={54} rx={5} ry={4} />
  </Svg>
);
const Globe: Art = () => (
  <Svg>
    <rect x="46" y="80" width="8" height="8" fill={F.grey} />
    <rect x="32" y="86" width="36" height="8" rx="4" fill={F.greyDeep} />
    <path
      d="M24 26 Q10 50 24 74"
      stroke={P.greyDeep}
      strokeWidth="5"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="50" cy="50" r="30" fill={F.sky} />
    <path
      d="M36 30 Q48 26 50 40 Q44 52 34 48 Q28 40 36 30 Z M56 42 Q72 40 74 54 Q68 68 56 62 Q50 52 56 42 Z M44 66 Q54 64 56 74 Q48 80 42 74 Z"
      fill={F.green}
    />
    <Hi x={40} y={34} rx={7} ry={5} />
  </Svg>
);

// ── H ──
const House: Art = () => (
  <Svg>
    <rect x="22" y="46" width="56" height="42" rx="6" fill={F.cream} />
    <path d="M14 50 L50 16 L86 50 Z" fill={F.red} />
    <path d="M22 50 L50 24 L78 50 Z" fill={F.redDeep} opacity="0.35" />
    <rect x="42" y="62" width="16" height="26" rx="5" fill={F.brown} />
    <rect x="28" y="54" width="12" height="12" rx="3" fill={F.sky} />
    <rect x="60" y="54" width="12" height="12" rx="3" fill={F.sky} />
    <rect x="62" y="22" width="8" height="14" rx="2" fill={F.brownDeep} />
    <Hi x={40} y={36} rx={6} ry={3} />
  </Svg>
);
const Hand: Art = () => (
  <Svg>
    <rect x="30" y="44" width="40" height="44" rx="14" fill={F.sand} />
    <rect x="30" y="16" width="10" height="40" rx="5" fill={F.sand} />
    <rect x="42" y="10" width="10" height="44" rx="5" fill={F.sand} />
    <rect x="54" y="14" width="10" height="42" rx="5" fill={F.sand} />
    <rect x="66" y="26" width="9" height="34" rx="4.5" fill={F.sand} />
    <rect x="14" y="48" width="22" height="10" rx="5" fill={F.sand} transform="rotate(-30 14 48)" />
    <rect x="30" y="76" width="40" height="12" rx="6" fill={SH} />
    <Hi x={44} y={50} rx={6} ry={4} />
  </Svg>
);
const Heart: Art = () => (
  <Svg>
    <path
      d="M50 86 C 20 66, 8 48, 16 32 C 24 16, 44 18, 50 32 C 56 18, 76 16, 84 32 C 92 48, 80 66, 50 86 Z"
      fill={F.red}
    />
    <path
      d="M50 86 C 28 70, 16 56, 18 44 Q 50 70 82 44 C 84 56, 72 70, 50 86 Z"
      fill={F.redDeep}
      opacity="0.4"
    />
    <Hi x={32} y={34} rx={8} ry={5} />
  </Svg>
);
const Hen: Art = () => (
  <Svg>
    <ellipse cx="52" cy="62" rx="30" ry="24" fill={F.cream} />
    <path d="M22 64 Q52 86 82 64 Q70 86 52 86 Q34 86 22 64 Z" fill={F.sand} opacity="0.7" />
    <circle cx="36" cy="38" r="16" fill={F.cream} />
    <path d="M30 24 Q32 14 38 22 Q42 12 46 22 Q50 16 48 26 Z" fill={F.red} />
    <path d="M20 40 L12 44 L20 48 Z" fill={F.orange} />
    <path d="M30 46 Q26 56 34 54 Z" fill={F.red} />
    <path d="M76 48 Q92 40 90 58 Q82 62 76 56 Z" fill={F.sand} />
    <Eye x={40} y={36} />
    <Hi x={30} y={32} rx={5} ry={3} />
  </Svg>
);

// ── I ──
const Ink: Art = () => (
  <Svg>
    <rect x="26" y="36" width="48" height="52" rx="12" fill={F.blueDeep} />
    <rect x="26" y="62" width="48" height="26" rx="12" fill={P.navy} opacity="0.35" />
    <rect x="38" y="20" width="24" height="20" rx="6" fill={F.grey} />
    <rect x="34" y="16" width="32" height="8" rx="4" fill={F.greyDeep} />
    <path d="M70 30 L86 12" stroke={P.brown} strokeWidth="6" strokeLinecap="round" />
    <circle cx="24" cy="90" r="5" fill={F.blueDeep} />
    <circle cx="16" cy="84" r="3" fill={F.blueDeep} />
    <Hi x={38} y={50} rx={4} ry={9} />
  </Svg>
);
const Iron: Art = () => (
  <Svg>
    <path
      d="M12 74 Q10 58 26 54 L78 54 Q92 54 90 72 Q88 82 76 82 L22 82 Q12 82 12 74 Z"
      fill={F.grey}
    />
    <path
      d="M12 74 Q12 82 22 82 L76 82 Q88 82 90 72 L90 76 Q88 86 76 86 L22 86 Q12 86 12 78 Z"
      fill={F.greyDeep}
    />
    <path d="M30 54 Q30 28 52 26 L72 26 Q82 26 82 36 L82 54 Z" fill={F.sky} />
    <path d="M40 54 Q42 40 52 38 L70 38 L70 54 Z" fill={P.white} opacity="0.5" />
    <circle cx="74" cy="44" r="4" fill={F.red} />
    <path
      d="M82 32 Q96 22 90 10"
      stroke={P.greyDeep}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <Hi x={40} y={64} rx={8} ry={3} />
  </Svg>
);
const Insect: Art = () => (
  <Svg>
    <circle cx="50" cy="58" r="26" fill={F.red} />
    <path d="M50 34 L50 84" stroke={P.ink} strokeWidth="3" />
    <circle cx="38" cy="52" r="5" fill={P.ink} />
    <circle cx="62" cy="52" r="5" fill={P.ink} />
    <circle cx="42" cy="70" r="4" fill={P.ink} />
    <circle cx="58" cy="70" r="4" fill={P.ink} />
    <circle cx="50" cy="30" r="12" fill={P.ink} />
    <path
      d="M44 22 Q38 12 32 10 M56 22 Q62 12 68 10"
      stroke={P.ink}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="46" cy="28" r="2.5" fill={P.white} />
    <circle cx="54" cy="28" r="2.5" fill={P.white} />
    <path
      d="M24 64 L14 70 M26 54 L14 52 M76 64 L86 70 M74 54 L86 52"
      stroke={P.ink}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <Hi x={40} y={44} rx={5} ry={3} />
  </Svg>
);

// ── J ──
const Jar: Art = () => (
  <Svg>
    <rect x="26" y="28" width="48" height="62" rx="12" fill={F.sky} opacity="0.55" />
    <rect x="30" y="48" width="40" height="40" rx="10" fill={F.pink} />
    <rect x="30" y="66" width="40" height="22" rx="10" fill={F.pinkDeep} opacity="0.5" />
    <rect x="28" y="18" width="44" height="14" rx="6" fill={F.mintDeep} />
    <rect x="24" y="22" width="52" height="8" rx="4" fill={F.mint} />
    <rect x="32" y="36" width="4" height="40" rx="2" fill={P.white} opacity="0.7" />
    <Hi x={44} y={34} rx={6} ry={3} />
  </Svg>
);
const Juice: Art = () => (
  <Svg>
    <path d="M30 30 L34 86 Q34 90 38 90 L62 90 Q66 90 66 86 L70 30 Z" fill={F.sky} opacity="0.5" />
    <path d="M32 46 L34 86 Q34 90 38 90 L62 90 Q66 90 66 86 L68 46 Z" fill={F.orange} />
    <path
      d="M33 66 L34 86 Q34 90 38 90 L62 90 Q66 90 66 86 L67 66 Z"
      fill={F.orangeDeep}
      opacity="0.4"
    />
    <ellipse cx="50" cy="30" rx="20" ry="5" fill={F.sky} opacity="0.6" />
    <path d="M56 30 L70 8" stroke={P.red} strokeWidth="5" strokeLinecap="round" />
    <circle cx="76" cy="36" r="10" fill={F.orange} />
    <circle cx="76" cy="36" r="6" fill={F.yellow} />
    <Hi x={40} y={56} rx={3} ry={10} />
  </Svg>
);
const Jacket: Art = () => (
  <Svg>
    <path
      d="M30 24 L50 30 L70 24 L86 36 L80 54 L72 50 L72 88 L28 88 L28 50 L20 54 L14 36 Z"
      fill={F.blue}
    />
    <path d="M28 70 L72 70 L72 88 L28 88 Z" fill={F.blueDeep} opacity="0.4" />
    <path d="M50 30 L50 88" stroke={P.cream} strokeWidth="3" />
    <path d="M30 24 L40 36 L50 30 L60 36 L70 24" fill={F.blueDeep} opacity="0.5" />
    <circle cx="45" cy="48" r="2.5" fill={F.yellow} />
    <circle cx="45" cy="62" r="2.5" fill={F.yellow} />
    <Hi x={36} y={44} rx={4} ry={8} />
  </Svg>
);
const Jet: Art = () => (
  <Svg>
    <path d="M12 52 Q40 44 88 48 Q92 52 88 56 Q40 60 12 52 Z" fill={P.white} />
    <path d="M12 52 Q40 56 88 56 Q40 60 12 52 Z" fill={F.grey} />
    <path d="M40 48 L26 24 L36 24 L56 48 Z" fill={F.sky} />
    <path d="M40 56 L30 76 L40 76 L56 56 Z" fill={F.sky} />
    <path d="M16 50 L10 40 L18 40 L26 50 Z" fill={F.sky} />
    <rect x="66" y="48" width="8" height="5" rx="2.5" fill={F.skyDeep} />
    <circle cx="82" cy="52" r="4" fill={F.skyDeep} />
    <Hi x={60} y={50} rx={10} ry={2} />
  </Svg>
);
const Jelly: Art = () => (
  <Svg>
    <path d="M22 38 Q22 16 50 16 Q78 16 78 38 L78 70 Q50 82 22 70 Z" fill={F.red} opacity="0.85" />
    <path d="M22 70 Q50 82 78 70 L78 84 Q50 96 22 84 Z" fill={F.redDeep} opacity="0.5" />
    <ellipse cx="50" cy="84" rx="36" ry="6" fill={SH} />
    <Hi x={36} y={30} rx={6} ry={9} />
  </Svg>
);

// ── K ──
const Key: Art = () => (
  <Svg>
    <circle cx="32" cy="36" r="20" fill={F.yellow} />
    <circle cx="32" cy="36" r="8" fill={F.cream} />
    <path d="M46 48 L84 86" stroke={P.yellow} strokeWidth="10" strokeLinecap="round" />
    <path d="M70 72 L78 64 M80 82 L88 74" stroke={P.yellow} strokeWidth="8" strokeLinecap="round" />
    <Hi x={24} y={26} rx={6} ry={4} />
  </Svg>
);
const King: Art = () => (
  <Svg>
    <path d="M22 92 Q26 62 50 60 Q74 62 78 92 Z" fill={F.purple} />
    <circle cx="50" cy="44" r="20" fill={F.sand} />
    <path d="M28 34 L30 14 L40 26 L50 10 L60 26 L70 14 L72 34 Z" fill={F.yellow} />
    <rect x="28" y="30" width="44" height="8" rx="3" fill={F.yellowDeep} />
    <circle cx="40" cy="22" r="3" fill={F.red} />
    <circle cx="60" cy="22" r="3" fill={F.sky} />
    <Eye x={43} y={44} r={3} />
    <Eye x={57} y={44} r={3} />
    <Smile x={50} y={52} />
    <path d="M36 58 Q50 74 64 58 Q60 70 50 70 Q40 70 36 58Z" fill={P.white} />
    <Hi x={40} y={38} rx={5} ry={3} />
  </Svg>
);
const Kettle: Art = () => (
  <Svg>
    <path
      d="M22 40 Q22 22 50 22 Q78 22 78 40 L82 80 Q82 88 74 88 L26 88 Q18 88 18 80 Z"
      fill={F.sky}
    />
    <path
      d="M18 70 L82 70 L82 80 Q82 88 74 88 L26 88 Q18 88 18 80 Z"
      fill={F.skyDeep}
      opacity="0.4"
    />
    <path d="M78 48 L94 38 L92 56 Z" fill={F.skyDeep} />
    <path d="M30 30 Q50 2 70 30" stroke={P.ink} strokeWidth="5" fill="none" strokeLinecap="round" />
    <circle cx="50" cy="24" r="5" fill={P.ink} />
    <Hi x={36} y={42} rx={6} ry={9} />
  </Svg>
);
const Kangaroo: Art = () => (
  <Svg>
    <path d="M18 78 Q4 68 14 60 Q24 56 30 66 Z" fill={F.brown} />
    <ellipse cx="50" cy="64" rx="26" ry="24" fill={F.brown} />
    <ellipse cx="50" cy="72" rx="16" ry="14" fill={F.sand} />
    <path d="M42 72 Q50 82 58 72 Q52 70 42 72 Z" fill={F.brownDeep} opacity="0.3" />
    <circle cx="62" cy="34" r="16" fill={F.brown} />
    <path d="M52 20 L48 4 L60 18 Z M72 20 L78 4 L66 18 Z" fill={F.brown} />
    <path d="M74 34 Q84 36 80 42 Z" fill={F.brownDeep} />
    <Eye x={60} y={32} r={3} />
    <ellipse cx="32" cy="88" rx="14" ry="5" fill={F.brownDeep} />
    <ellipse cx="66" cy="88" rx="14" ry="5" fill={F.brownDeep} />
    <Hi x={44} y={50} rx={6} ry={4} />
  </Svg>
);

// ── L ──
const Leaf: Art = () => (
  <Svg>
    <path d="M20 80 C 16 40, 46 14, 84 18 C 86 56, 62 86, 20 80 Z" fill={F.green} />
    <path
      d="M20 80 C 40 70, 62 56, 84 18 C 86 56, 62 86, 20 80 Z"
      fill={F.greenDeep}
      opacity="0.35"
    />
    <path d="M22 78 Q50 50 80 22" stroke={P.cream} strokeWidth="3" strokeLinecap="round" />
    <path
      d="M40 62 L52 68 M50 50 L64 54 M60 38 L72 40"
      stroke={P.cream}
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.7"
    />
    <Hi x={40} y={34} rx={8} ry={4} />
  </Svg>
);
const Lamp: Art = () => (
  <Svg>
    <path d="M24 52 L38 12 L62 12 L76 52 Z" fill={F.yellow} />
    <path d="M24 52 L76 52 L76 58 L24 58 Z" fill={F.yellowDeep} />
    <rect x="46" y="58" width="8" height="24" rx="4" fill={F.grey} />
    <rect x="30" y="82" width="40" height="10" rx="5" fill={F.greyDeep} />
    <ellipse cx="50" cy="62" rx="20" ry="6" fill={F.yellow} opacity="0.35" />
    <Hi x={40} y={24} rx={4} ry={8} />
  </Svg>
);
const Ladder: Art = () => (
  <Svg>
    <rect x="26" y="8" width="10" height="84" rx="5" fill={F.sand} />
    <rect x="64" y="8" width="10" height="84" rx="5" fill={F.sand} />
    {[22, 38, 54, 70].map((y) => (
      <rect key={y} x="34" y={y} width="32" height="8" rx="4" fill={F.brown} />
    ))}
    <Hi x={30} y={20} rx={2} ry={8} />
  </Svg>
);

// ── M ──
const Mountain: Art = () => (
  <Svg>
    <path d="M6 84 L34 34 L50 58 L64 26 L94 84 Z" fill={F.lavenderDeep} />
    <path d="M6 84 L34 34 L50 58 L40 84 Z" fill={F.lavender} />
    <path d="M64 26 L56 40 L62 38 L68 44 L72 40 Z" fill={P.white} />
    <path d="M34 34 L28 44 L34 42 L38 46 L40 44 Z" fill={P.white} />
    <ellipse cx="50" cy="86" rx="46" ry="6" fill={F.mint} />
    <Hi x={30} y={50} rx={4} ry={8} />
  </Svg>
);
const Mouse: Art = () => (
  <Svg>
    <path
      d="M72 66 Q92 60 90 78"
      stroke={P.pink}
      strokeWidth="5"
      fill="none"
      strokeLinecap="round"
    />
    <ellipse cx="48" cy="62" rx="32" ry="22" fill={F.grey} />
    <ellipse cx="48" cy="72" rx="22" ry="10" fill={F.greyDeep} opacity="0.35" />
    <circle cx="30" cy="40" r="12" fill={F.grey} />
    <circle cx="30" cy="40" r="7" fill={F.pink} />
    <circle cx="56" cy="34" r="12" fill={F.grey} />
    <circle cx="56" cy="34" r="7" fill={F.pink} />
    <circle cx="20" cy="62" r="5" fill={F.pink} />
    <Eye x={32} y={56} r={3} />
    <path d="M14 58 L6 56 M14 66 L6 68" stroke={P.greyDeep} strokeWidth="2" strokeLinecap="round" />
    <Hi x={40} y={50} rx={7} ry={4} />
  </Svg>
);

// ── N ──
const Nose: Art = () => (
  <Svg>
    <circle cx="50" cy="50" r="40" fill={F.sand} />
    <path
      d="M50 22 L46 52 Q30 56 34 70 Q42 80 50 74 Q58 80 66 70 Q70 56 54 52 Z"
      fill={F.orange}
      opacity="0.75"
    />
    <ellipse cx="42" cy="70" rx="6" ry="4" fill={F.brownDeep} opacity="0.35" />
    <ellipse cx="58" cy="70" rx="6" ry="4" fill={F.brownDeep} opacity="0.35" />
    <Eye x={30} y={40} r={3} />
    <Eye x={70} y={40} r={3} />
    <Hi x={46} y={40} rx={3} ry={8} />
  </Svg>
);

const Nail: Art = () => (
  <Svg>
    <rect x="28" y="14" width="44" height="10" rx="5" fill={F.greyDeep} />
    <rect x="44" y="22" width="12" height="56" rx="2" fill={F.grey} />
    <path d="M44 78 L50 92 L56 78 Z" fill={F.grey} />
    <rect x="44" y="22" width="5" height="56" fill={P.white} opacity="0.5" />
    <Hi x={38} y={18} rx={6} ry={2} />
  </Svg>
);
const Net: Art = () => (
  <Svg>
    <path d="M18 86 L46 40" stroke={P.brown} strokeWidth="7" strokeLinecap="round" />
    <ellipse cx="58" cy="36" rx="26" ry="22" fill={F.sky} opacity="0.45" />
    <path
      d="M36 28 L80 28 M34 40 L82 40 M40 50 L76 50 M46 16 L46 56 M58 14 L58 58 M70 16 L70 56"
      stroke={P.skyDeep}
      strokeWidth="1.5"
      opacity="0.7"
    />
    <ellipse cx="58" cy="36" rx="26" ry="22" fill="none" stroke={P.brown} strokeWidth="5" />
  </Svg>
);
const Nut: Art = () => (
  <Svg>
    <path d="M50 20 Q78 22 80 50 Q76 84 50 88 Q24 84 20 50 Q22 22 50 20 Z" fill={F.brown} />
    <path d="M20 50 Q50 70 80 50 Q76 84 50 88 Q24 84 20 50 Z" fill={F.brownDeep} opacity="0.4" />
    <path d="M30 34 Q50 22 70 34 Q66 44 50 44 Q34 44 30 34 Z" fill={F.sand} />
    <Hi x={40} y={52} rx={6} ry={5} />
  </Svg>
);

// ── O ──
const Ocean: Art = () => (
  <Svg>
    <circle cx="50" cy="50" r="40" fill={F.sky} />
    <path d="M10 50 Q20 42 30 50 T 50 50 T 70 50 T 90 50 L90 90 L10 90 Z" fill={F.blue} />
    <path
      d="M14 66 Q24 58 34 66 T 54 66 T 74 66 T 88 66 L88 90 L12 90 Z"
      fill={F.blueDeep}
      opacity="0.5"
    />
    <path
      d="M20 50 Q30 42 40 50 M60 50 Q70 42 80 50"
      stroke={P.white}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="70" cy="28" r="8" fill={F.yellow} />
    <Hi x={30} y={30} rx={8} ry={5} />
  </Svg>
);
const Ox: Art = () => (
  <Svg>
    <ellipse cx="50" cy="56" rx="30" ry="26" fill={F.brown} />
    <path d="M26 66 Q38 56 50 62 Q62 56 74 66 Q66 84 50 84 Q34 84 26 66Z" fill={F.sand} />
    <path d="M22 36 Q6 28 10 14 Q22 20 28 34 Z M78 36 Q94 28 90 14 Q78 20 72 34 Z" fill={F.sand} />
    <Eye x={40} y={48} />
    <Eye x={60} y={48} />
    <circle cx="42" cy="70" r="3" fill={F.brownDeep} />
    <circle cx="58" cy="70" r="3" fill={F.brownDeep} />
    <circle cx="50" cy="74" r="4" fill={F.yellow} />
    <Hi x={38} y={38} rx={6} ry={4} />
  </Svg>
);
const Owl: Art = () => (
  <Svg>
    <path d="M24 40 Q24 16 50 16 Q76 16 76 40 L76 66 Q76 88 50 88 Q24 88 24 66 Z" fill={F.brown} />
    <path d="M24 66 Q50 76 76 66 Q76 88 50 88 Q24 88 24 66 Z" fill={F.brownDeep} opacity="0.35" />
    <path d="M28 24 L22 10 L38 20 Z M72 24 L78 10 L62 20 Z" fill={F.brown} />
    <ellipse cx="50" cy="66" rx="16" ry="14" fill={F.sand} />
    <circle cx="38" cy="42" r="12" fill={F.cream} />
    <circle cx="62" cy="42" r="12" fill={F.cream} />
    <Eye x={38} y={42} r={5} />
    <Eye x={62} y={42} r={5} />
    <path d="M46 52 L50 60 L54 52 Z" fill={F.orange} />
    <Hi x={34} y={26} rx={6} ry={3} />
  </Svg>
);

// ── P ──
const Pen: Art = () => (
  <Svg>
    <path d="M22 78 L66 18 L82 30 L38 90 Z" fill={F.blue} />
    <path d="M30 84 L74 24 L82 30 L38 90 Z" fill={F.blueDeep} opacity="0.4" />
    <path d="M22 78 L38 90 L18 94 Z" fill={F.sand} />
    <path d="M18 94 L24 88 L26 91 Z" fill={P.ink} />
    <path d="M66 18 L72 10 L90 22 L82 30 Z" fill={F.skyDeep} />
    <Hi x={46} y={48} rx={3} ry={12} />
  </Svg>
);
const Pizza: Art = () => (
  <Svg>
    <path d="M50 90 L14 24 Q50 6 86 24 Z" fill={F.sand} />
    <path d="M50 80 L24 30 Q50 18 76 30 Z" fill={F.yellow} />
    <path d="M14 24 Q50 6 86 24 L82 30 Q50 14 18 30 Z" fill={F.orange} />
    <circle cx="50" cy="36" r="5" fill={F.red} />
    <circle cx="38" cy="50" r="5" fill={F.red} />
    <circle cx="60" cy="52" r="5" fill={F.red} />
    <circle cx="48" cy="64" r="4" fill={F.red} />
    <Hi x={40} y={32} rx={4} ry={3} />
  </Svg>
);
const Pig: Art = () => (
  <Svg>
    <ellipse cx="50" cy="56" rx="32" ry="28" fill={F.pink} />
    <path d="M24 30 Q22 14 36 18 Q40 28 38 34 Z M76 30 Q78 14 64 18 Q60 28 62 34 Z" fill={F.pink} />
    <ellipse cx="50" cy="64" rx="14" ry="10" fill={F.pinkDeep} />
    <circle cx="45" cy="64" r="3" fill={F.redDeep} opacity="0.6" />
    <circle cx="55" cy="64" r="3" fill={F.redDeep} opacity="0.6" />
    <Eye x={38} y={48} />
    <Eye x={62} y={48} />
    <Hi x={36} y={36} rx={7} ry={4} />
  </Svg>
);
const Panda: Art = () => (
  <Svg>
    <circle cx="50" cy="54" r="30" fill={P.white} />
    <circle cx="28" cy="30" r="10" fill={P.ink} />
    <circle cx="72" cy="30" r="10" fill={P.ink} />
    <ellipse cx="38" cy="50" rx="9" ry="11" fill={P.ink} transform="rotate(-15 38 50)" />
    <ellipse cx="62" cy="50" rx="9" ry="11" fill={P.ink} transform="rotate(15 62 50)" />
    <Eye x={39} y={50} r={3} />
    <Eye x={61} y={50} r={3} />
    <ellipse cx="50" cy="64" rx="5" ry="4" fill={P.ink} />
    <Smile x={50} y={70} w={8} />
    <Hi x={40} y={34} rx={7} ry={4} />
  </Svg>
);

// ── Q ──
const Quilt: Art = () => (
  <Svg>
    <rect x="14" y="14" width="72" height="72" rx="8" fill={F.cream} />
    {[0, 1, 2].flatMap((r) =>
      [0, 1, 2].map((c) => (
        <rect
          key={`${r}${c}`}
          x={18 + c * 22}
          y={18 + r * 22}
          width="20"
          height="20"
          rx="4"
          fill={(r + c) % 2 === 0 ? P.pink : [P.mint, P.sky, P.lavender][(r + c) % 3]}
        />
      ))
    )}
    <path
      d="M18 40 L82 40 M18 62 L82 62 M40 18 L40 82 M62 18 L62 82"
      stroke={P.cream}
      strokeWidth="2"
    />
    <Hi x={26} y={24} rx={5} ry={3} />
  </Svg>
);
const Question: Art = () => (
  <Svg>
    <circle cx="50" cy="50" r="40" fill={F.purple} />
    <path
      d="M50 90 A40 40 0 0 0 90 50 L10 50 A40 40 0 0 0 50 90 Z"
      fill={F.lavenderDeep}
      opacity="0.5"
    />
    <path
      d="M36 40 Q36 24 50 24 Q64 24 64 38 Q64 46 54 50 Q50 52 50 60"
      stroke={P.white}
      strokeWidth="8"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="50" cy="72" r="5" fill={P.white} />
    <Hi x={34} y={32} rx={7} ry={5} />
  </Svg>
);
const Quokka: Art = () => (
  <Svg>
    <ellipse cx="50" cy="68" rx="28" ry="22" fill={F.brown} />
    <circle cx="50" cy="42" r="22" fill={F.brown} />
    <circle cx="32" cy="26" r="8" fill={F.brown} />
    <circle cx="68" cy="26" r="8" fill={F.brown} />
    <circle cx="32" cy="26" r="4" fill={F.pink} />
    <circle cx="68" cy="26" r="4" fill={F.pink} />
    <ellipse cx="50" cy="52" rx="12" ry="8" fill={F.sand} />
    <Eye x={42} y={40} r={3} />
    <Eye x={58} y={40} r={3} />
    <ellipse cx="50" cy="48" rx="3.5" ry="2.5" fill={P.ink} />
    <Smile x={50} y={52} w={12} />
    <Hi x={42} y={30} rx={6} ry={4} />
  </Svg>
);

// ── R ──
const Robot: Art = () => (
  <Svg>
    <rect x="28" y="46" width="44" height="36" rx="8" fill={F.sky} />
    <rect x="28" y="68" width="44" height="14" rx="7" fill={F.skyDeep} opacity="0.4" />
    <rect x="32" y="14" width="36" height="30" rx="8" fill={F.grey} />
    <rect x="14" y="50" width="12" height="24" rx="6" fill={F.grey} />
    <rect x="74" y="50" width="12" height="24" rx="6" fill={F.grey} />
    <rect x="34" y="82" width="12" height="10" rx="3" fill={F.greyDeep} />
    <rect x="54" y="82" width="12" height="10" rx="3" fill={F.greyDeep} />
    <circle cx="42" cy="28" r="5" fill={F.mintDeep} />
    <circle cx="58" cy="28" r="5" fill={F.mintDeep} />
    <rect x="42" y="36" width="16" height="3" rx="1.5" fill={P.ink} />
    <rect x="48" y="4" width="4" height="10" fill={F.greyDeep} />
    <circle cx="50" cy="4" r="4" fill={F.red} />
    <rect x="40" y="54" width="20" height="8" rx="2" fill={F.yellow} />
    <Hi x={40} y={20} rx={5} ry={3} />
  </Svg>
);
const Ring: Art = () => (
  <Svg>
    <circle cx="50" cy="60" r="26" fill="none" stroke={P.yellow} strokeWidth="10" />
    <path
      d="M30 76 A26 26 0 0 0 70 76"
      stroke={P.yellowDeep}
      strokeWidth="10"
      fill="none"
      opacity="0.6"
    />
    <path d="M50 12 L64 24 L50 40 L36 24 Z" fill={F.sky} />
    <path d="M36 24 L64 24 L50 40 Z" fill={F.skyDeep} opacity="0.5" />
    <Hi x={46} y={20} rx={4} ry={3} />
  </Svg>
);
const Rocket: Art = () => (
  <Svg>
    <path d="M50 8 Q70 30 66 70 L34 70 Q30 30 50 8 Z" fill={P.white} />
    <path d="M50 8 Q70 30 66 70 L54 70 Q56 30 50 8 Z" fill={F.grey} opacity="0.4" />
    <path d="M34 50 L18 72 L34 70 Z M66 50 L82 72 L66 70 Z" fill={F.red} />
    <circle cx="50" cy="38" r="8" fill={F.sky} />
    <path d="M40 70 L60 70 L56 80 L44 80 Z" fill={F.greyDeep} />
    <path d="M44 80 Q50 98 56 80 Z" fill={F.orange} />
    <path d="M47 82 Q50 92 53 82 Z" fill={F.yellow} />
    <Hi x={44} y={24} rx={3} ry={7} />
  </Svg>
);

const Rain: Art = () => (
  <Svg>
    <ellipse cx="50" cy="34" rx="34" ry="14" fill={F.lavender} />
    <circle cx="34" cy="28" r="16" fill={F.lavender} />
    <circle cx="58" cy="22" r="20" fill={F.lavender} />
    <circle cx="78" cy="32" r="12" fill={F.lavender} />
    <ellipse cx="52" cy="42" rx="30" ry="6" fill={F.lavenderDeep} opacity="0.4" />
    {[26, 42, 58, 74].map((x, i) => (
      <path
        key={x}
        d={`M${x} ${56 + (i % 2) * 10} Q${x - 4} ${64 + (i % 2) * 10} ${x} ${70 + (i % 2) * 10} Q${x + 4} ${64 + (i % 2) * 10} ${x} ${56 + (i % 2) * 10} Z`}
        fill={F.sky}
      />
    ))}
    <Hi x={40} y={18} rx={8} ry={4} />
  </Svg>
);

// ── S ──
const Star: Art = () => (
  <Svg>
    <path
      d="M50 8 L62 36 L92 38 L68 58 L76 88 L50 72 L24 88 L32 58 L8 38 L38 36 Z"
      fill={F.yellow}
    />
    <path d="M50 72 L76 88 L68 58 L92 38 L66 44 Z" fill={F.yellowDeep} opacity="0.45" />
    <Hi x={40} y={36} rx={6} ry={4} />
  </Svg>
);
const Shoe: Art = () => (
  <Svg>
    <path
      d="M14 64 Q14 46 30 44 L40 44 Q52 44 60 54 Q76 60 88 66 Q92 74 84 78 L20 78 Q14 78 14 72 Z"
      fill={F.red}
    />
    <path d="M14 72 L92 72 Q92 78 84 78 L20 78 Q14 78 14 72 Z" fill={F.cream} />
    <path d="M30 44 Q32 54 44 56 Q52 58 60 54" stroke={P.white} strokeWidth="3" fill="none" />
    <path d="M34 48 L40 52 M38 46 L44 50" stroke={P.white} strokeWidth="2" />
    <circle cx="70" cy="64" r="3" fill={P.white} />
    <Hi x={26} y={54} rx={6} ry={3} />
  </Svg>
);
const Soup: Art = () => (
  <Svg>
    <path d="M14 48 L86 48 Q86 86 50 86 Q14 86 14 48 Z" fill={F.sky} />
    <path d="M14 64 Q50 74 86 64 Q82 86 50 86 Q18 86 14 64 Z" fill={F.skyDeep} opacity="0.4" />
    <ellipse cx="50" cy="48" rx="36" ry="9" fill={F.skyDeep} />
    <ellipse cx="50" cy="48" rx="30" ry="6" fill={F.orange} />
    <circle cx="40" cy="47" r="3" fill={F.green} />
    <circle cx="58" cy="48" r="3" fill={F.yellow} />
    <path d="M60 44 L78 18" stroke={P.grey} strokeWidth="5" strokeLinecap="round" />
    <path
      d="M36 30 Q40 22 36 14 M50 30 Q54 22 50 14"
      stroke={P.white}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      opacity="0.8"
    />
    <Hi x={30} y={62} rx={6} ry={4} />
  </Svg>
);

// ── T ──
const Tree: Art = () => (
  <Svg>
    <rect x="44" y="62" width="12" height="30" rx="5" fill={F.brown} />
    <circle cx="50" cy="44" r="28" fill={F.green} />
    <circle cx="30" cy="54" r="16" fill={F.green} />
    <circle cx="70" cy="54" r="16" fill={F.green} />
    <path d="M16 58 Q50 82 84 58 Q70 74 50 74 Q30 74 16 58 Z" fill={F.greenDeep} opacity="0.5" />
    <circle cx="40" cy="38" r="4" fill={F.red} />
    <circle cx="62" cy="48" r="4" fill={F.red} />
    <Hi x={38} y={28} rx={8} ry={5} />
  </Svg>
);
const Train: Art = () => (
  <Svg>
    <rect x="10" y="40" width="36" height="34" rx="6" fill={F.sky} />
    <rect x="50" y="48" width="40" height="26" rx="6" fill={F.red} />
    <rect x="16" y="24" width="18" height="20" rx="5" fill={F.skyDeep} />
    <rect x="20" y="28" width="10" height="9" rx="2" fill={P.white} />
    <rect x="56" y="54" width="10" height="9" rx="2" fill={P.white} />
    <rect x="74" y="54" width="10" height="9" rx="2" fill={P.white} />
    <rect x="10" y="66" width="80" height="8" rx="4" fill={SH} />
    <circle cx="22" cy="80" r="7" fill={P.ink} />
    <circle cx="40" cy="80" r="7" fill={P.ink} />
    <circle cx="62" cy="80" r="7" fill={P.ink} />
    <circle cx="80" cy="80" r="7" fill={P.ink} />
    <circle cx="14" cy="14" r="6" fill={P.white} opacity="0.8" />
    <Hi x={20} y={46} rx={6} ry={3} />
  </Svg>
);
const Tooth: Art = () => (
  <Svg>
    {/* crown: wide rounded molar with two roots; a cool blue-grey shade keeps
        the white readable on the white plate */}
    <path
      d="M18 36 Q16 8 50 14 Q84 8 82 36 Q82 54 74 64 L70 86 Q66 96 58 86 L50 70 L42 86 Q34 96 30 86 L26 64 Q18 54 18 36 Z"
      fill={F.white}
    />
    <path
      d="M50 14 Q84 8 82 36 Q82 54 74 64 L70 86 Q66 96 58 86 L50 70 Z"
      fill="#9FB0D6"
      opacity="0.3"
    />
    <path
      d="M26 64 L30 86 Q34 96 42 86 L50 70 L58 86 Q66 96 70 86 L74 64 Q50 76 26 64 Z"
      fill="#9FB0D6"
      opacity="0.32"
    />
    <path
      d="M18 36 Q16 8 50 14 Q84 8 82 36 Q82 54 74 64 L70 86 Q66 96 58 86 L50 70 L42 86 Q34 96 30 86 L26 64 Q18 54 18 36 Z"
      fill="url(#cg-shadow)"
      opacity="0.35"
    />
    <path
      d="M36 30 Q50 40 64 30"
      stroke="#9FB0D6"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      opacity="0.8"
    />
    <path d="M76 12 Q77 19 84 20 Q77 21 76 28 Q75 21 68 20 Q75 19 76 12 Z" fill={P.skyDeep} />
    <Hi x={34} y={30} rx={8} ry={10} />
  </Svg>
);

// ── U ──
const Uniform: Art = () => (
  <Svg>
    <path
      d="M30 22 L50 28 L70 22 L86 34 L80 50 L72 46 L72 90 L28 90 L28 46 L20 50 L14 34 Z"
      fill={F.blue}
    />
    <path d="M28 74 L72 74 L72 90 L28 90 Z" fill={F.blueDeep} opacity="0.4" />
    <path d="M42 28 L50 40 L58 28 Z" fill={P.white} />
    <path d="M50 40 L46 50 L50 58 L54 50 Z" fill={F.red} />
    <circle cx="36" cy="52" r="4" fill={F.yellow} />
    <rect x="60" y="50" width="10" height="4" rx="2" fill={F.yellow} />
    <Hi x={36} y={40} rx={4} ry={8} />
  </Svg>
);
const Ukulele: Art = () => (
  <Svg>
    <rect x="46" y="6" width="8" height="44" rx="4" fill={F.brown} />
    <rect x="42" y="4" width="16" height="10" rx="4" fill={F.brownDeep} />
    <path
      d="M50 42 C 34 42, 28 54, 34 62 C 26 72, 32 88, 50 88 C 68 88, 74 72, 66 62 C 72 54, 66 42, 50 42 Z"
      fill={F.mint}
    />
    <path
      d="M34 62 C 26 72, 32 88, 50 88 C 68 88, 74 72, 66 62 Z"
      fill={F.mintDeep}
      opacity="0.45"
    />
    <circle cx="50" cy="64" r="7" fill={F.brownDeep} />
    <path d="M47 14 L47 78 M50 14 L50 78 M53 14 L53 78" stroke={P.cream} strokeWidth="1.2" />
    <Hi x={40} y={52} rx={4} ry={3} />
  </Svg>
);
const Up: Art = () => (
  <Svg>
    <path d="M50 10 L84 46 L64 46 L64 88 L36 88 L36 46 L16 46 Z" fill={F.mintDeep} />
    <path d="M50 10 L84 46 L64 46 L64 88 L50 88 L50 36 Z" fill={F.greenDeep} opacity="0.35" />
    <Hi x={40} y={36} rx={5} ry={7} />
  </Svg>
);
const Urchin: Art = () => (
  <Svg>
    {Array.from({ length: 16 }, (_, i) => (
      <path
        key={i}
        d="M50 50 L50 8"
        stroke={P.purple}
        strokeWidth="4"
        strokeLinecap="round"
        transform={`rotate(${i * 22.5} 50 50)`}
      />
    ))}
    <circle cx="50" cy="50" r="22" fill={F.lavenderDeep} />
    <circle cx="50" cy="50" r="22" fill={F.purple} opacity="0.5" />
    <Eye x={44} y={48} r={3} />
    <Eye x={56} y={48} r={3} />
    <Smile x={50} y={56} w={8} />
    <Hi x={42} y={40} rx={5} ry={3} />
  </Svg>
);

// ── V ──
const Violin: Art = () => (
  <Svg>
    <rect x="46" y="4" width="8" height="42" rx="4" fill={F.brownDeep} />
    <path
      d="M50 40 C 30 40, 24 54, 32 62 C 22 72, 28 90, 50 90 C 72 90, 78 72, 68 62 C 76 54, 70 40, 50 40 Z"
      fill={F.orange}
    />
    <path
      d="M32 62 C 22 72, 28 90, 50 90 C 72 90, 78 72, 68 62 Z"
      fill={F.orangeDeep}
      opacity="0.4"
    />
    <path
      d="M40 58 Q38 68 42 76 M60 58 Q62 68 58 76"
      stroke={P.brownDeep}
      strokeWidth="2.5"
      fill="none"
    />
    <rect x="46" y="70" width="8" height="8" rx="2" fill={F.brownDeep} />
    <path d="M47 12 L47 74 M50 12 L50 74 M53 12 L53 74" stroke={P.cream} strokeWidth="1.2" />
    <path d="M72 20 L90 84" stroke={P.brown} strokeWidth="3" strokeLinecap="round" />
    <Hi x={40} y={52} rx={4} ry={3} />
  </Svg>
);
const Volcano: Art = () => (
  <Svg>
    <path d="M8 88 L34 30 L66 30 L92 88 Z" fill={F.brown} />
    <path d="M50 88 L66 30 L92 88 Z" fill={F.brownDeep} opacity="0.4" />
    <path d="M34 30 L66 30 L60 42 Q50 48 40 42 Z" fill={F.red} />
    <path d="M44 30 Q40 18 48 10 Q50 20 56 14 Q60 22 56 30 Z" fill={F.orange} />
    <path d="M48 30 Q46 22 50 16 Q52 22 54 30 Z" fill={F.yellow} />
    <path d="M40 42 Q36 60 30 70 Q36 64 42 56 Z" fill={F.red} />
    <Hi x={30} y={60} rx={4} ry={8} />
  </Svg>
);
const Vest: Art = () => (
  <Svg>
    <path d="M26 18 L40 24 L50 44 L60 24 L74 18 L78 88 L22 88 Z" fill={F.mintDeep} />
    <path d="M22 72 L78 72 L78 88 L22 88 Z" fill={F.greenDeep} opacity="0.35" />
    <path d="M50 44 L50 88" stroke={P.cream} strokeWidth="3" />
    <circle cx="50" cy="56" r="2.5" fill={F.yellow} />
    <circle cx="50" cy="70" r="2.5" fill={F.yellow} />
    <Hi x={34} y={40} rx={4} ry={8} />
  </Svg>
);
const Vase: Art = () => (
  <Svg>
    <path
      d="M36 14 L64 14 L58 30 Q80 42 76 66 Q72 90 50 90 Q28 90 24 66 Q20 42 42 30 Z"
      fill={F.lavender}
    />
    <path
      d="M24 66 Q50 78 76 66 Q72 90 50 90 Q28 90 24 66 Z"
      fill={F.lavenderDeep}
      opacity="0.45"
    />
    <rect x="34" y="10" width="32" height="8" rx="4" fill={F.lavenderDeep} />
    <path d="M42 30 Q50 50 58 30" fill="none" stroke={P.white} strokeWidth="2" opacity="0.5" />
    <circle cx="50" cy="60" r="5" fill={F.pink} />
    <Hi x={38} y={48} rx={5} ry={10} />
  </Svg>
);

// ── W ──
const Watch: Art = () => (
  <Svg>
    <rect x="38" y="6" width="24" height="88" rx="8" fill={F.red} />
    <circle cx="50" cy="50" r="26" fill={F.grey} />
    <circle cx="50" cy="50" r="20" fill={P.white} />
    <path d="M50 50 L50 36 M50 50 L60 56" stroke={P.ink} strokeWidth="3" strokeLinecap="round" />
    <circle cx="50" cy="50" r="2.5" fill={P.ink} />
    <rect x="74" y="44" width="6" height="12" rx="2" fill={F.greyDeep} />
    <Hi x={42} y={38} rx={5} ry={4} />
  </Svg>
);
const Wind: Art = () => (
  <Svg>
    <path
      d="M12 36 L56 36 Q70 36 70 24 Q70 14 60 14"
      stroke={P.sky}
      strokeWidth="8"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M8 54 L76 54 Q90 54 90 66 Q90 78 78 78"
      stroke={P.skyDeep}
      strokeWidth="8"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M18 72 L44 72 Q54 72 54 82"
      stroke={P.sky}
      strokeWidth="8"
      fill="none"
      strokeLinecap="round"
    />
    <path d="M24 28 Q20 24 16 28 Q20 32 24 28 Z" fill={P.white} />
    <Hi x={30} y={34} rx={10} ry={2} />
  </Svg>
);
const Wagon: Art = () => (
  <Svg>
    <path d="M14 40 L86 40 L82 70 L18 70 Z" fill={F.red} />
    <path d="M16 56 L84 56 L82 70 L18 70 Z" fill={F.redDeep} opacity="0.45" />
    <rect x="10" y="36" width="80" height="8" rx="4" fill={F.redDeep} />
    <circle cx="28" cy="78" r="10" fill={P.ink} />
    <circle cx="72" cy="78" r="10" fill={P.ink} />
    <circle cx="28" cy="78" r="4" fill={F.grey} />
    <circle cx="72" cy="78" r="4" fill={F.grey} />
    <path d="M86 44 L96 26" stroke={P.ink} strokeWidth="4" strokeLinecap="round" />
    <Hi x={30} y={48} rx={8} ry={3} />
  </Svg>
);

// ── X ──
const Xylophone: Art = () => (
  <Svg>
    {[
      [14, 72, P.red],
      [30, 62, P.orange],
      [46, 52, P.yellow],
      [62, 44, P.mintDeep],
      [78, 36, P.sky],
    ].map(([x, h, c], i) => (
      <rect
        key={i}
        x={x as number}
        y={92 - (h as number)}
        width="12"
        height={h as number}
        rx="5"
        fill={c as string}
      />
    ))}
    <path
      d="M20 30 L84 18 M20 84 L84 70"
      stroke={P.brown}
      strokeWidth="4"
      strokeLinecap="round"
      opacity="0.7"
    />
    <path d="M70 88 L88 62" stroke={P.brown} strokeWidth="3" strokeLinecap="round" />
    <circle cx="89" cy="60" r="5" fill={F.lavender} />
    <Hi x={20} y={28} rx={4} ry={3} />
  </Svg>
);
const Xray: Art = () => (
  <Svg>
    <rect x="16" y="10" width="68" height="80" rx="8" fill={P.navy} />
    <rect x="30" y="22" width="40" height="24" rx="10" fill={P.white} opacity="0.9" />
    <rect x="46" y="44" width="8" height="36" rx="4" fill={P.white} opacity="0.9" />
    {[50, 58, 66, 74].map((y) => (
      <rect key={y} x="32" y={y} width="36" height="4" rx="2" fill={P.white} opacity="0.85" />
    ))}
    <rect x="46" y="22" width="8" height="8" fill={P.navy} opacity="0.4" />
    <Hi x={26} y={18} rx={5} ry={3} />
  </Svg>
);
const Fox: Art = () => (
  <Svg>
    <path d="M22 30 L14 12 L36 26 Z M78 30 L86 12 L64 26 Z" fill={F.orange} />
    <path d="M50 90 Q14 70 22 30 L78 30 Q86 70 50 90 Z" fill={F.orange} />
    <path d="M50 90 Q30 80 28 60 Q50 72 72 60 Q70 80 50 90 Z" fill={P.white} />
    <Eye x={38} y={50} />
    <Eye x={62} y={50} />
    <ellipse cx="50" cy="68" rx="5" ry="4" fill={P.ink} />
    <Hi x={36} y={38} rx={6} ry={4} />
  </Svg>
);
const Six: Art = () => (
  <Svg>
    <circle cx="50" cy="50" r="40" fill={F.mint} />
    <path
      d="M50 90 A40 40 0 0 0 90 50 L10 50 A40 40 0 0 0 50 90 Z"
      fill={F.mintDeep}
      opacity="0.45"
    />
    <path
      d="M62 22 Q40 28 36 54 M36 54 A14 14 0 1 0 64 54 A14 14 0 1 0 36 54"
      stroke={P.white}
      strokeWidth="9"
      fill="none"
      strokeLinecap="round"
    />
    <Hi x={34} y={32} rx={7} ry={5} />
  </Svg>
);

// ── Y ──
const Yacht: Art = () => (
  <Svg>
    <path d="M52 14 L52 62 L86 62 Z" fill={P.white} />
    <path d="M46 24 L46 62 L18 62 Z" fill={F.pink} />
    <rect x="48" y="10" width="4" height="56" rx="2" fill={F.brown} />
    <path d="M10 66 L90 66 L80 82 L20 82 Z" fill={F.red} />
    <path d="M10 66 L90 66 L88 70 L12 70 Z" fill={F.redDeep} opacity="0.4" />
    <path
      d="M6 88 Q16 82 26 88 T 46 88 T 66 88 T 86 88 T 98 88"
      stroke={P.sky}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    <Hi x={64} y={44} rx={4} ry={8} />
  </Svg>
);
const Yarn: Art = () => (
  <Svg>
    <circle cx="48" cy="52" r="34" fill={F.lavenderDeep} />
    <path
      d="M20 40 Q48 62 82 44 M16 56 Q48 78 80 60 M28 24 Q44 52 36 84 M58 20 Q74 50 64 84"
      stroke={P.lavender}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M76 70 Q96 74 94 90"
      stroke={P.lavenderDeep}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    <Hi x={34} y={34} rx={7} ry={5} />
  </Svg>
);
const Yellow: Art = () => (
  <Svg>
    <path
      d="M44 88 Q22 80 26 56 Q30 40 46 36 L46 20 Q46 14 50 14 Q54 14 54 20 L54 36 Q70 40 74 56 Q78 80 56 88 Z"
      fill={F.yellow}
    />
    <path
      d="M26 60 Q50 74 74 60 Q78 80 56 88 L44 88 Q22 80 26 60 Z"
      fill={F.yellowDeep}
      opacity="0.45"
    />
    <rect x="44" y="10" width="12" height="12" rx="4" fill={F.grey} />
    <Hi x={40} y={50} rx={5} ry={9} />
  </Svg>
);

// ── Z ──
const Zoo: Art = () => (
  <Svg>
    <rect x="12" y="26" width="76" height="12" rx="6" fill={F.mintDeep} />
    {[20, 34, 48, 62, 76].map((x) => (
      <rect key={x} x={x} y="32" width="6" height="56" rx="3" fill={F.greenDeep} />
    ))}
    <ellipse cx="50" cy="66" rx="16" ry="14" fill={F.brown} />
    <circle cx="50" cy="52" r="10" fill={F.brown} />
    <circle cx="43" cy="44" r="4" fill={F.brown} />
    <circle cx="57" cy="44" r="4" fill={F.brown} />
    <Eye x={47} y={52} r={2} />
    <Eye x={53} y={52} r={2} />
    <Hi x={26} y={30} rx={8} ry={2} />
  </Svg>
);
const Zip: Art = () => (
  <Svg>
    <rect x="14" y="22" width="72" height="56" rx="10" fill={F.sky} />
    <path d="M14 50 L86 50" stroke={P.skyDeep} strokeWidth="8" />
    {[22, 34, 46, 58, 70].map((x) => (
      <rect key={x} x={x} y="44" width="6" height="12" rx="1.5" fill={F.grey} />
    ))}
    <rect x="58" y="40" width="14" height="20" rx="4" fill={F.greyDeep} />
    <rect x="62" y="30" width="6" height="12" rx="3" fill={F.greyDeep} />
    <Hi x={28} y={30} rx={8} ry={3} />
  </Svg>
);

// ── Animals and anchor words formerly borrowed from other games, redrawn here
//    so every vocabulary picture is one family ──

const Ant: Art = () => (
  <Svg>
    <ellipse cx="26" cy="60" rx="14" ry="11" fill={F.brownDeep} />
    <ellipse cx="50" cy="58" rx="12" ry="10" fill={F.brownDeep} />
    <ellipse cx="74" cy="54" rx="15" ry="13" fill={F.brownDeep} />
    <path
      d="M40 54 L30 36 M48 52 L46 32 M58 52 L64 32 M40 64 L30 82 M50 66 L50 84 M60 64 L70 80"
      stroke={P.brownDeep}
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path
      d="M70 42 Q62 30 56 28 M80 42 Q86 30 92 28"
      stroke={P.brownDeep}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <Eye x={78} y={52} r={3} />
    <Hi x={70} y={46} rx={5} ry={3} />
    <Hi x={22} y={54} rx={4} ry={3} />
  </Svg>
);
const Apple: Art = () => (
  <Svg>
    <path
      d="M50 34 Q30 22 20 42 Q12 68 34 84 Q44 90 50 86 Q56 90 66 84 Q88 68 80 42 Q70 22 50 34 Z"
      fill={F.red}
    />
    <path
      d="M50 86 Q56 90 66 84 Q88 68 80 42 Q78 70 62 82 Q56 86 50 86 Z"
      fill={P.redDeep}
      opacity="0.35"
    />
    <path
      d="M50 34 Q48 24 54 16"
      stroke={P.brownDeep}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    <ellipse cx="60" cy="22" rx="10" ry="5" fill={F.green} transform="rotate(-24 60 22)" />
    <Hi x={34} y={44} rx={8} ry={6} />
  </Svg>
);
const Alligator: Art = () => (
  <Svg>
    <path d="M8 62 Q8 48 24 48 L92 48 Q96 56 92 66 L24 70 Q8 72 8 62 Z" fill={F.green} />
    <path d="M8 62 Q40 74 92 66 L24 70 Q8 72 8 62 Z" fill={P.greenDeep} opacity="0.4" />
    <path d="M30 48 Q30 30 48 32 Q60 32 60 48 Z" fill={F.green} />
    <circle cx="40" cy="36" r="6" fill={F.mint} />
    <Eye x={41} y={36} r={3} />
    <path
      d="M24 66 L28 60 L34 66 L40 60 L46 66 L52 60 L58 66 L64 60 L70 66"
      stroke={P.white}
      strokeWidth="2.5"
      fill="none"
      strokeLinejoin="round"
    />
    {[24, 40, 56, 72].map((x) => (
      <path key={x} d={`M${x} 48 L${x + 5} 40 L${x + 10} 48 Z`} fill={P.greenDeep} opacity="0.6" />
    ))}
    <circle cx="86" cy="54" r="2" fill={P.greenDeep} />
    <Hi x={30} y={52} rx={10} ry={3} />
  </Svg>
);
const Bear: Art = () => (
  <Svg>
    <circle cx="26" cy="30" r="12" fill={F.brown} />
    <circle cx="74" cy="30" r="12" fill={F.brown} />
    <circle cx="26" cy="30" r="6" fill={F.sand} />
    <circle cx="74" cy="30" r="6" fill={F.sand} />
    <circle cx="50" cy="54" r="32" fill={F.brown} />
    <ellipse cx="50" cy="64" rx="15" ry="11" fill={F.sand} />
    <ellipse cx="50" cy="60" rx="5" ry="3.8" fill={P.ink} />
    <Smile x={50} y={67} w={10} />
    <Eye x={39} y={48} r={3.4} />
    <Eye x={61} y={48} r={3.4} />
    <Hi x={36} y={36} rx={8} ry={5} />
  </Svg>
);
const Cat: Art = () => (
  <Svg>
    <path d="M24 36 L20 12 L40 26 Z M76 36 L80 12 L60 26 Z" fill={F.lavender} />
    <path d="M27 32 L25 20 L36 28 Z M73 32 L75 20 L64 28 Z" fill={P.pink} opacity="0.7" />
    <circle cx="50" cy="54" r="32" fill={F.lavender} />
    <Eye x={39} y={48} r={3.8} />
    <Eye x={61} y={48} r={3.8} />
    <path d="M47 58 L50 61 L53 58 Z" fill={P.pink} />
    <path
      d="M46 62 Q50 66 54 62"
      stroke={P.ink}
      strokeWidth="2.4"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M30 56 L14 53 M30 62 L15 64 M70 56 L86 53 M70 62 L85 64"
      stroke={P.ink}
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.6"
    />
    <Hi x={38} y={38} rx={8} ry={5} />
  </Svg>
);
const Dog: Art = () => (
  <Svg>
    <path
      d="M22 34 Q10 36 10 56 Q10 74 22 72 Z M78 34 Q90 36 90 56 Q90 74 78 72 Z"
      fill={F.brownDeep}
    />
    <circle cx="50" cy="54" r="30" fill={F.sand} />
    <path d="M34 34 Q50 18 66 34 Q58 42 50 40 Q42 42 34 34 Z" fill={F.brown} />
    <Eye x={40} y={50} r={3.5} />
    <Eye x={60} y={50} r={3.5} />
    <ellipse cx="50" cy="62" rx="6" ry="4.5" fill={P.ink} />
    <path
      d="M44 70 Q50 76 56 70"
      stroke={P.ink}
      strokeWidth="2.4"
      fill="none"
      strokeLinecap="round"
    />
    <path d="M50 70 L50 76" stroke={P.ink} strokeWidth="2" strokeLinecap="round" />
    <Hi x={38} y={42} rx={7} ry={4} />
  </Svg>
);
const Elephant: Art = () => (
  <Svg>
    <circle cx="22" cy="48" r="18" fill={F.grey} />
    <circle cx="78" cy="48" r="18" fill={F.grey} />
    <circle cx="22" cy="48" r="10" fill={P.pink} opacity="0.5" />
    <circle cx="78" cy="48" r="10" fill={P.pink} opacity="0.5" />
    <circle cx="50" cy="48" r="28" fill={F.grey} />
    <path d="M42 66 Q36 84 46 90 Q56 92 56 82 Q54 74 58 66 Z" fill={F.grey} />
    <path d="M44 74 L56 74 M45 80 L55 80" stroke={P.greyDeep} strokeWidth="1.5" opacity="0.6" />
    <Eye x={40} y={44} r={3.4} />
    <Eye x={60} y={44} r={3.4} />
    <Hi x={38} y={32} rx={8} ry={5} />
  </Svg>
);
const Frog: Art = () => (
  <Svg>
    <circle cx="32" cy="30" r="12" fill={F.green} />
    <circle cx="68" cy="30" r="12" fill={F.green} />
    <circle cx="32" cy="30" r="7" fill={P.white} />
    <circle cx="68" cy="30" r="7" fill={P.white} />
    <Eye x={33} y={30} r={3.5} />
    <Eye x={69} y={30} r={3.5} />
    <path d="M14 56 Q14 34 50 34 Q86 34 86 56 Q86 82 50 82 Q14 82 14 56 Z" fill={F.green} />
    <path d="M20 64 Q50 86 80 64 Q76 80 50 80 Q24 80 20 64 Z" fill={P.greenDeep} opacity="0.35" />
    <path
      d="M30 56 Q50 74 70 56"
      stroke={P.ink}
      strokeWidth="2.6"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="34" cy="70" r="3.5" fill={P.pink} opacity="0.6" />
    <circle cx="66" cy="70" r="3.5" fill={P.pink} opacity="0.6" />
    <Hi x={32} y={46} rx={9} ry={4} />
  </Svg>
);
const Giraffe: Art = () => (
  <Svg>
    <rect x="40" y="40" width="20" height="52" rx="10" fill={F.yellow} />
    <path d="M32 30 Q32 12 50 12 Q70 12 70 30 Q70 44 50 44 Q32 44 32 30 Z" fill={F.yellow} />
    <path d="M38 16 L34 4 M62 16 L66 4" stroke={P.brown} strokeWidth="3" strokeLinecap="round" />
    <circle cx="34" cy="4" r="3.5" fill={F.brown} />
    <circle cx="66" cy="4" r="3.5" fill={F.brown} />
    <path d="M26 26 Q18 22 22 32 Z M74 26 Q82 22 78 32 Z" fill={F.yellow} />
    <Eye x={42} y={26} r={3} />
    <Eye x={58} y={26} r={3} />
    <ellipse cx="50" cy="38" rx="8" ry="4" fill={F.sand} />
    {[
      [44, 52],
      [56, 60],
      [46, 70],
      [56, 80],
    ].map(([x, y]) => (
      <circle key={x + y} cx={x} cy={y} r="4" fill={P.brown} opacity="0.8" />
    ))}
    <Hi x={42} y={18} rx={6} ry={4} />
  </Svg>
);
const Jellyfish: Art = () => (
  <Svg>
    <path
      d="M16 50 Q16 14 50 14 Q84 14 84 50 Q66 56 50 50 Q34 56 16 50 Z"
      fill={F.pink}
      opacity="0.92"
    />
    <path
      d="M16 50 Q34 56 50 50 Q66 56 84 50 Q70 62 50 58 Q30 62 16 50 Z"
      fill={P.pinkDeep}
      opacity="0.4"
    />
    {[24, 38, 50, 62, 76].map((x, i) => (
      <path
        key={x}
        d={`M${x} 56 Q${x - 6} 70 ${x} 80 Q${x + 6} 88 ${x - 2} 94`}
        stroke={P.pinkDeep}
        strokeWidth={i % 2 ? 3 : 4}
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
    ))}
    <Eye x={41} y={38} r={3} />
    <Eye x={59} y={38} r={3} />
    <Hi x={36} y={26} rx={9} ry={6} />
  </Svg>
);
const Lion: Art = () => (
  <Svg>
    {Array.from({ length: 12 }, (_, i) => (
      <circle
        key={i}
        cx="50"
        cy="18"
        r="11"
        fill={F.orange}
        transform={`rotate(${i * 30} 50 52)`}
      />
    ))}
    <circle cx="50" cy="52" r="26" fill={F.yellow} />
    <ellipse cx="50" cy="62" rx="12" ry="9" fill={F.cream} />
    <ellipse cx="50" cy="58" rx="4.5" ry="3.5" fill={P.ink} />
    <Smile x={50} y={65} w={9} />
    <Eye x={40} y={48} r={3.2} />
    <Eye x={60} y={48} r={3.2} />
    <Hi x={38} y={38} rx={7} ry={4} />
  </Svg>
);
const Monkey: Art = () => (
  <Svg>
    <circle cx="20" cy="48" r="12" fill={F.brown} />
    <circle cx="80" cy="48" r="12" fill={F.brown} />
    <circle cx="20" cy="48" r="6" fill={F.sand} />
    <circle cx="80" cy="48" r="6" fill={F.sand} />
    <circle cx="50" cy="52" r="30" fill={F.brown} />
    <path d="M28 56 Q30 34 50 36 Q70 34 72 56 Q70 78 50 78 Q30 78 28 56 Z" fill={F.sand} />
    <Eye x={40} y={50} r={3.4} />
    <Eye x={60} y={50} r={3.4} />
    <circle cx="46" cy="60" r="1.8" fill={P.ink} />
    <circle cx="54" cy="60" r="1.8" fill={P.ink} />
    <Smile x={50} y={66} w={12} />
    <Hi x={36} y={32} rx={7} ry={4} />
  </Svg>
);
const Nest: Art = () => (
  <Svg>
    <path d="M12 56 Q50 44 88 56 Q86 84 50 86 Q14 84 12 56 Z" fill={F.brown} />
    <path d="M12 56 Q50 70 88 56 Q86 84 50 86 Q14 84 12 56 Z" fill={P.brownDeep} opacity="0.35" />
    {[
      [20, 62],
      [34, 70],
      [54, 74],
      [72, 66],
    ].map(([x, y]) => (
      <path
        key={x}
        d={`M${x} ${y} q8 -4 14 2`}
        stroke={P.sand}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.8"
      />
    ))}
    <ellipse cx="38" cy="50" rx="9" ry="11" fill={F.sky} />
    <ellipse cx="56" cy="48" rx="9" ry="11" fill={F.sky} />
    <Hi x={34} y={44} rx={3} ry={4} />
    <Hi x={52} y={42} rx={3} ry={4} />
  </Svg>
);
const Octopus: Art = () => (
  <Svg>
    {[18, 32, 46, 60, 74].map((x, i) => (
      <path
        key={x}
        d={`M${x + 8} 60 Q${x - 4} 76 ${x + 2} 90`}
        stroke={P.lavenderDeep}
        strokeWidth="9"
        fill="none"
        strokeLinecap="round"
        opacity={0.85 + (i % 2) * 0.15}
      />
    ))}
    <path d="M18 50 Q18 12 50 12 Q82 12 82 50 Q82 66 50 66 Q18 66 18 50 Z" fill={F.lavenderDeep} />
    <Eye x={40} y={42} r={4} />
    <Eye x={60} y={42} r={4} />
    <Smile x={50} y={52} w={10} />
    <circle cx="32" cy="52" r="3.5" fill={P.pink} opacity="0.6" />
    <circle cx="68" cy="52" r="3.5" fill={P.pink} opacity="0.6" />
    <Hi x={36} y={26} rx={9} ry={6} />
  </Svg>
);
const Quail: Art = () => (
  <Svg>
    <ellipse cx="54" cy="62" rx="28" ry="22" fill={F.sand} />
    <path d="M26 64 Q54 82 82 64 Q74 84 54 84 Q34 84 26 64 Z" fill={P.brown} opacity="0.3" />
    <circle cx="36" cy="40" r="16" fill={F.sand} />
    <path d="M38 26 Q40 10 48 14 Q44 20 44 28 Z" fill={P.brownDeep} />
    <circle cx="48" cy="12" r="3.5" fill={F.brownDeep} />
    <path d="M20 42 L12 46 L20 50 Z" fill={F.orange} />
    <path d="M76 50 Q92 42 88 60 Q80 64 74 58 Z" fill={F.brown} />
    <Eye x={40} y={38} r={3} />
    <Hi x={30} y={32} rx={5} ry={3} />
  </Svg>
);
const Rabbit: Art = () => (
  <Svg>
    <ellipse cx="36" cy="26" rx="9" ry="22" fill={F.white} transform="rotate(-10 36 26)" />
    <ellipse cx="64" cy="26" rx="9" ry="22" fill={F.white} transform="rotate(10 64 26)" />
    <ellipse
      cx="36"
      cy="28"
      rx="4.5"
      ry="15"
      fill={P.pink}
      opacity="0.6"
      transform="rotate(-10 36 28)"
    />
    <ellipse
      cx="64"
      cy="28"
      rx="4.5"
      ry="15"
      fill={P.pink}
      opacity="0.6"
      transform="rotate(10 64 28)"
    />
    <circle cx="50" cy="60" r="28" fill={F.white} />
    <Eye x={40} y={56} r={3.4} />
    <Eye x={60} y={56} r={3.4} />
    <path d="M47 66 L50 69 L53 66 Z" fill={P.pink} />
    <path
      d="M46 70 Q50 74 54 70"
      stroke={P.ink}
      strokeWidth="2.2"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="34" cy="66" r="3.5" fill={P.pink} opacity="0.5" />
    <circle cx="66" cy="66" r="3.5" fill={P.pink} opacity="0.5" />
    <Hi x={38} y={44} rx={8} ry={5} />
  </Svg>
);
const Snake: Art = () => (
  <Svg>
    <path
      d="M14 70 Q14 52 34 52 Q52 52 52 64 Q52 76 68 76 Q84 76 84 62 Q84 50 70 48"
      stroke={P.greenDeep}
      strokeWidth="16"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M14 70 Q14 52 34 52 Q52 52 52 64 Q52 76 68 76 Q84 76 84 62 Q84 50 70 48"
      stroke="url(#cg-sheen)"
      strokeWidth="12"
      fill="none"
      strokeLinecap="round"
      opacity="0.6"
    />
    <circle cx="72" cy="42" r="12" fill={F.green} />
    <Eye x={70} y={40} r={3} />
    <path d="M84 44 L94 40 M84 44 L94 48" stroke={P.red} strokeWidth="2" strokeLinecap="round" />
    <Hi x={66} y={36} rx={5} ry={3} />
  </Svg>
);
const Turtle: Art = () => (
  <Svg>
    <path
      d="M14 64 Q14 56 22 56 L78 56 Q86 56 86 64 Q86 72 78 72 L22 72 Q14 72 14 64 Z"
      fill={F.green}
    />
    <path d="M22 56 Q22 24 50 24 Q78 24 78 56 Z" fill={F.greenDeep} />
    <path d="M34 40 L50 32 L66 40 L62 56 L38 56 Z" fill={P.green} opacity="0.5" />
    <path d="M34 40 L28 56 M66 40 L72 56" stroke={P.green} strokeWidth="2" opacity="0.5" />
    <circle cx="88" cy="56" r="9" fill={F.green} />
    <Eye x={90} y={54} r={2.5} />
    <path
      d="M26 72 L24 82 M74 72 L76 82"
      stroke={P.greenDeep}
      strokeWidth="6"
      strokeLinecap="round"
    />
    <Hi x={40} y={32} rx={8} ry={4} />
  </Svg>
);
const Whale: Art = () => (
  <Svg>
    <path d="M10 58 Q10 30 46 30 Q84 30 84 58 Q84 72 64 72 L22 72 Q10 72 10 58 Z" fill={F.blue} />
    <path
      d="M10 58 Q40 80 84 58 Q84 72 64 72 L22 72 Q10 72 10 58 Z"
      fill={P.blueDeep}
      opacity="0.35"
    />
    <path d="M80 58 L96 46 L94 66 Z" fill={F.blueDeep} />
    <path d="M14 66 Q40 60 70 66" stroke={P.white} strokeWidth="2" fill="none" opacity="0.5" />
    <Eye x={26} y={50} r={3} />
    <path
      d="M40 22 Q36 12 30 12 M40 22 Q44 12 50 12"
      stroke={P.sky}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <Hi x={30} y={40} rx={9} ry={5} />
  </Svg>
);
const Yak: Art = () => (
  <Svg>
    <path d="M20 40 Q6 32 10 16 Q22 22 26 36 Z M80 40 Q94 32 90 16 Q78 22 74 36 Z" fill={F.sand} />
    <path
      d="M18 50 Q18 26 50 26 Q82 26 82 50 L82 80 Q66 92 50 88 Q34 92 18 80 Z"
      fill={F.brownDeep}
    />
    <path
      d="M24 68 Q50 82 76 68 L76 80 Q62 90 50 88 Q38 90 24 80 Z"
      fill={P.brownDeep}
      opacity="0.5"
    />
    <path d="M30 40 Q50 30 70 40 Q64 34 50 34 Q36 34 30 40 Z" fill={F.brown} />
    <Eye x={40} y={52} r={3} />
    <Eye x={60} y={52} r={3} />
    <ellipse cx="50" cy="70" rx="10" ry="6" fill={F.sand} />
    <circle cx="46" cy="70" r="1.8" fill={P.brownDeep} />
    <circle cx="54" cy="70" r="1.8" fill={P.brownDeep} />
    <Hi x={38} y={42} rx={7} ry={3} />
  </Svg>
);
const Zebra: Art = () => (
  <Svg>
    <path
      d="M30 30 Q26 12 36 12 Q40 22 40 30 Z M70 30 Q74 12 64 12 Q60 22 60 30 Z"
      fill={F.white}
    />
    <path d="M28 44 Q28 26 50 26 Q72 26 72 44 L72 66 Q72 84 50 84 Q28 84 28 66 Z" fill={F.white} />
    <path
      d="M34 30 L46 40 L34 48 Z M66 30 L54 40 L66 48 Z M32 56 L46 60 L32 64 Z M68 56 L54 60 L68 64 Z"
      fill={P.ink}
      opacity="0.85"
    />
    <path d="M40 26 Q50 18 60 26 L60 32 Q50 26 40 32 Z" fill={P.ink} opacity="0.85" />
    <Eye x={42} y={44} r={3} />
    <Eye x={58} y={44} r={3} />
    <ellipse cx="50" cy="74" rx="12" ry="7" fill={F.grey} />
    <circle cx="46" cy="74" r="1.8" fill={P.ink} />
    <circle cx="54" cy="74" r="1.8" fill={P.ink} />
    <Hi x={40} y={36} rx={5} ry={3} />
  </Svg>
);
const Ball: Art = () => (
  <Svg>
    <circle cx="50" cy="52" r="34" fill={F.blue} />
    <path d="M16 52 Q50 30 84 52" stroke={P.white} strokeWidth="7" fill="none" opacity="0.85" />
    <path d="M16 52 Q50 74 84 52" stroke={P.yellow} strokeWidth="7" fill="none" opacity="0.9" />
    <circle cx="50" cy="52" r="34" fill="url(#cg-shadow)" opacity="0.35" />
    <Hi x={36} y={38} rx={9} ry={6} />
  </Svg>
);
const Egg: Art = () => (
  <Svg>
    <path d="M50 12 Q76 12 78 54 Q78 88 50 88 Q22 88 22 54 Q24 12 50 12 Z" fill={F.cream} />
    <path d="M22 60 Q50 80 78 60 Q76 88 50 88 Q24 88 22 60 Z" fill={P.sand} opacity="0.5" />
    <Hi x={38} y={32} rx={8} ry={11} />
  </Svg>
);
const Goat: Art = () => (
  <Svg>
    <path d="M32 28 Q20 16 24 6 Q34 12 38 26 Z M68 28 Q80 16 76 6 Q66 12 62 26 Z" fill={F.sand} />
    <path d="M30 44 Q30 26 50 26 Q70 26 70 44 L70 70 Q70 84 50 84 Q30 84 30 70 Z" fill={F.white} />
    <path
      d="M24 34 Q14 36 18 44 Q26 44 30 38 Z M76 34 Q86 36 82 44 Q74 44 70 38 Z"
      fill={F.white}
    />
    <Eye x={42} y={46} r={3} />
    <Eye x={58} y={46} r={3} />
    <ellipse cx="50" cy="64" rx="9" ry="5" fill={P.pink} opacity="0.6" />
    <path d="M42 80 Q50 96 58 80" fill={F.white} />
    <Hi x={40} y={36} rx={7} ry={4} />
  </Svg>
);
const Hat: Art = () => (
  <Svg>
    <ellipse cx="50" cy="72" rx="42" ry="12" fill={F.yellow} />
    <path d="M28 70 Q26 26 50 26 Q74 26 72 70 Z" fill={F.yellow} />
    <path d="M28 58 Q50 68 72 58 L72 70 L28 70 Z" fill={P.yellowDeep} opacity="0.5" />
    <path d="M28 56 Q50 64 72 56 L72 62 Q50 70 28 62 Z" fill={F.red} />
    <ellipse cx="50" cy="72" rx="42" ry="12" fill="url(#cg-shadow)" opacity="0.4" />
    <Hi x={40} y={38} rx={6} ry={9} />
  </Svg>
);
const Igloo: Art = () => (
  <Svg>
    <path d="M10 78 Q10 30 50 30 Q90 30 90 78 Z" fill={F.sky} />
    <path d="M10 78 Q50 86 90 78 L90 80 Q50 90 10 80 Z" fill={P.skyDeep} opacity="0.3" />
    <path
      d="M18 58 Q50 64 82 58 M14 70 Q50 76 86 70 M24 46 Q50 50 76 46"
      stroke={P.white}
      strokeWidth="2"
      fill="none"
      opacity="0.8"
    />
    <path
      d="M36 46 L36 70 M50 40 L50 58 M64 46 L64 70 M28 60 L28 78 M72 60 L72 78"
      stroke={P.white}
      strokeWidth="2"
      opacity="0.8"
    />
    <path d="M38 78 Q38 56 50 56 Q62 56 62 78 Z" fill={F.blueDeep} />
    <path d="M42 78 Q42 62 50 62 Q58 62 58 78 Z" fill={P.navy} opacity="0.5" />
    <Hi x={34} y={40} rx={9} ry={5} />
  </Svg>
);
const Jam: Art = () => (
  <Svg>
    <rect x="24" y="34" width="52" height="56" rx="12" fill={F.red} />
    <rect x="24" y="64" width="52" height="26" rx="12" fill={P.redDeep} opacity="0.4" />
    <rect x="22" y="22" width="56" height="16" rx="7" fill={F.pink} />
    <path
      d="M22 30 Q30 36 38 30 Q46 36 54 30 Q62 36 70 30 Q76 34 78 30 L78 36 L22 36 Z"
      fill={P.pinkDeep}
      opacity="0.6"
    />
    <rect x="30" y="44" width="4" height="36" rx="2" fill={P.white} opacity="0.6" />
    <Hi x={38} y={42} rx={6} ry={3} />
  </Svg>
);
const Kite: Art = () => (
  <Svg>
    <path d="M50 8 L82 44 L50 80 L18 44 Z" fill={F.lavenderDeep} />
    <path d="M50 8 L82 44 L50 44 Z" fill={F.pink} />
    <path d="M18 44 L50 80 L50 44 Z" fill={F.yellow} />
    <path
      d="M50 80 Q44 88 52 92 Q44 96 50 100"
      stroke={P.lavenderDeep}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
    />
    <path d="M50 8 L50 80 M18 44 L82 44" stroke={P.white} strokeWidth="2" opacity="0.6" />
    <Hi x={40} y={30} rx={5} ry={7} />
  </Svg>
);
const Moon: Art = () => (
  <Svg>
    <path d="M62 10 Q20 18 22 54 Q26 90 66 90 Q46 80 44 50 Q46 22 62 10 Z" fill={F.yellow} />
    <path d="M44 50 Q46 80 66 90 Q52 86 48 70 Q44 58 44 50 Z" fill={P.yellowDeep} opacity="0.4" />
    <circle cx="76" cy="30" r="3" fill={P.yellow} />
    <circle cx="84" cy="50" r="2" fill={P.yellow} />
    <circle cx="78" cy="70" r="2.5" fill={P.yellow} />
    <Hi x={36} y={34} rx={5} ry={9} />
  </Svg>
);
const Queen: Art = () => (
  <Svg>
    <path d="M22 92 Q26 62 50 60 Q74 62 78 92 Z" fill={F.pink} />
    <circle cx="50" cy="44" r="20" fill={F.sand} />
    <path d="M28 46 Q26 18 50 16 Q74 18 72 46 Q66 34 50 32 Q34 34 28 46 Z" fill={F.orange} />
    <path d="M30 30 L32 14 L42 24 L50 10 L58 24 L68 14 L70 30 Z" fill={F.gold} />
    <circle cx="50" cy="20" r="3" fill={P.red} />
    <Eye x={43} y={44} r={3} />
    <Eye x={57} y={44} r={3} />
    <Smile x={50} y={52} />
    <Hi x={40} y={38} rx={5} ry={3} />
  </Svg>
);
const Sun: Art = () => (
  <Svg>
    {Array.from({ length: 12 }, (_, i) => (
      <path
        key={i}
        d="M50 8 L54 20 L46 20 Z"
        fill={F.orange}
        transform={`rotate(${i * 30} 50 50)`}
      />
    ))}
    <circle cx="50" cy="50" r="26" fill={F.yellow} />
    <Eye x={42} y={48} r={3} />
    <Eye x={58} y={48} r={3} />
    <Smile x={50} y={56} w={12} />
    <circle cx="36" cy="56" r="3" fill={P.orange} opacity="0.6" />
    <circle cx="64" cy="56" r="3" fill={P.orange} opacity="0.6" />
    <Hi x={40} y={38} rx={7} ry={5} />
  </Svg>
);
const Tiger: Art = () => (
  <Svg>
    <circle cx="26" cy="30" r="11" fill={F.orange} />
    <circle cx="74" cy="30" r="11" fill={F.orange} />
    <circle cx="50" cy="54" r="31" fill={F.orange} />
    <path
      d="M34 26 L40 38 L30 36 Z M66 26 L60 38 L70 36 Z M22 54 L34 56 L24 62 Z M78 54 L66 56 L76 62 Z"
      fill={P.ink}
      opacity="0.8"
    />
    <ellipse cx="50" cy="64" rx="14" ry="10" fill={F.cream} />
    <ellipse cx="50" cy="60" rx="4.5" ry="3.5" fill={P.ink} />
    <Smile x={50} y={67} w={10} />
    <Eye x={40} y={48} r={3.4} />
    <Eye x={60} y={48} r={3.4} />
    <Hi x={38} y={36} rx={7} ry={4} />
  </Svg>
);
const Umbrella: Art = () => (
  <Svg>
    <path d="M8 50 Q50 4 92 50 Q82 44 72 50 Q61 44 50 50 Q39 44 28 50 Q18 44 8 50 Z" fill={F.red} />
    <path
      d="M50 8 Q68 20 72 50 Q61 44 50 50 Q39 44 28 50 Q32 20 50 8 Z"
      fill={P.yellow}
      opacity="0.5"
    />
    <path
      d="M50 50 L50 82 Q50 92 58 92 Q66 92 66 84"
      stroke={P.brownDeep}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    <rect x="48" y="2" width="4" height="8" rx="2" fill={P.brownDeep} />
    <Hi x={32} y={30} rx={8} ry={4} />
  </Svg>
);
const Van: Art = () => (
  <Svg>
    <path d="M12 40 Q12 30 22 30 L60 30 L86 48 L88 70 L12 70 Z" fill={F.mintDeep} />
    <path d="M12 58 L88 58 L88 70 L12 70 Z" fill={P.greenDeep} opacity="0.35" />
    <rect x="20" y="36" width="16" height="14" rx="3" fill={F.sky} />
    <rect x="42" y="36" width="16" height="14" rx="3" fill={F.sky} />
    <path d="M62 36 L70 36 L80 48 L62 48 Z" fill={F.sky} />
    <circle cx="30" cy="74" r="9" fill={P.ink} />
    <circle cx="72" cy="74" r="9" fill={P.ink} />
    <circle cx="30" cy="74" r="4" fill={P.grey} />
    <circle cx="72" cy="74" r="4" fill={P.grey} />
    <Hi x={28} y={33} rx={8} ry={2} />
  </Svg>
);
const Water: Art = () => (
  <Svg>
    <path d="M50 10 Q30 40 26 58 Q24 84 50 88 Q76 84 74 58 Q70 40 50 10 Z" fill={F.sky} />
    <path d="M26 66 Q50 80 74 66 Q72 86 50 88 Q28 86 26 66 Z" fill={P.skyDeep} opacity="0.4" />
    <path
      d="M38 52 Q36 68 44 76"
      stroke={P.white}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      opacity="0.8"
    />
    <Hi x={42} y={42} rx={5} ry={8} />
  </Svg>
);
const Box: Art = () => (
  <Svg>
    <rect x="18" y="40" width="64" height="48" rx="6" fill={F.sand} />
    <rect x="14" y="30" width="72" height="16" rx="5" fill={F.brown} />
    <path d="M18 46 h64 v10 H18 Z" fill="#6B2D5C" opacity="0.1" />
    <rect x="44" y="30" width="12" height="58" fill={F.red} />
    <rect x="14" y="34" width="72" height="8" fill={P.red} opacity="0.7" />
    <path d="M50 30 Q40 16 36 24 Q38 30 50 30 Q60 16 64 24 Q62 30 50 30 Z" fill={F.red} />
    <Hi x={28} y={34} rx={6} ry={2} />
  </Svg>
);
const YoYo: Art = () => (
  <Svg>
    <path d="M50 48 Q50 24 54 6" stroke={P.greyDeep} strokeWidth="2.5" fill="none" />
    <circle cx="50" cy="58" r="30" fill={F.pink} />
    <circle cx="50" cy="58" r="16" fill={F.pinkLight} />
    <circle cx="50" cy="58" r="5" fill={P.pinkDeep} />
    <circle cx="50" cy="58" r="30" fill="url(#cg-shadow)" opacity="0.35" />
    <Hi x={36} y={44} rx={8} ry={5} />
  </Svg>
);

// ── Vocabulary words that are also bakery ingredients: drawn here so the
//    Alphabet Set never shows the flatter bakery version ──

const Banana: Art = () => (
  <Svg>
    <path
      d="M22 28 C 26 58, 46 78, 74 80 C 84 80, 86 72, 80 68 C 58 64, 42 48, 36 24 C 34 16, 20 18, 22 28 Z"
      fill={F.yellow}
    />
    <path
      d="M30 34 C 38 58, 54 72, 78 76 C 84 78, 84 74, 80 70 C 58 64, 44 50, 36 28 Z"
      fill={P.yellowDeep}
      opacity="0.35"
    />
    <path
      d="M30 32 C 38 56, 52 70, 74 74"
      stroke={P.white}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
      opacity="0.55"
    />
    <rect x="18" y="18" width="10" height="10" rx="3" fill={F.brownDeep} />
    <Hi x={32} y={36} rx={4} ry={6} />
  </Svg>
);
const Grapes: Art = () => (
  <Svg>
    <path
      d="M50 30 Q48 18 56 12"
      stroke={P.greenDeep}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    <ellipse cx="64" cy="20" rx="10" ry="5" fill={F.green} transform="rotate(-20 64 20)" />
    {[
      [38, 40],
      [62, 40],
      [30, 56],
      [50, 54],
      [70, 56],
      [40, 72],
      [60, 72],
      [50, 86],
    ].map(([x, y]) => (
      <circle key={x + y} cx={x} cy={y} r="11" fill={F.purple} />
    ))}
    {[
      [38, 40],
      [62, 40],
      [30, 56],
      [50, 54],
      [70, 56],
      [40, 72],
      [60, 72],
      [50, 86],
    ].map(([x, y]) => (
      <Spec key={`s${x}${y}`} x={x - 3} y={y - 3} rx={3.5} ry={2.5} />
    ))}
  </Svg>
);
const IceCream: Art = () => (
  <Svg>
    <path d="M30 52 L50 92 L70 52 Z" fill={F.sand} />
    <path
      d="M34 58 L66 58 M38 66 L62 66 M42 74 L58 74 M44 52 L58 84 M56 52 L42 84"
      stroke={P.brown}
      strokeWidth="1.5"
      opacity="0.45"
    />
    <circle cx="50" cy="40" r="20" fill={F.pink} />
    <path d="M30 44 Q40 56 50 52 Q60 56 70 44 Q66 58 50 60 Q34 58 30 44 Z" fill={F.pink} />
    <circle cx="50" cy="40" r="20" fill="url(#cg-shadow)" opacity="0.3" />
    <circle cx="50" cy="18" r="5" fill={F.candyRed} />
    <Hi x={40} y={30} rx={7} ry={5} />
  </Svg>
);
const Lemon: Art = () => (
  <Svg>
    <path
      d="M22 50 Q22 26 50 26 Q78 26 78 50 Q78 74 50 74 Q22 74 22 50 Z"
      fill={F.yellow}
      transform="rotate(-20 50 50)"
    />
    <path
      d="M18 46 Q14 44 12 48 Q14 52 18 50 Z M82 54 Q86 52 88 56 Q86 60 82 58 Z"
      fill={F.yellowDeep}
    />
    <path d="M30 66 Q50 80 72 64 Q60 76 50 76 Q40 76 30 66 Z" fill={P.yellowDeep} opacity="0.4" />
    <ellipse cx="66" cy="28" rx="10" ry="5" fill={F.green} transform="rotate(-30 66 28)" />
    <Hi x={36} y={40} rx={9} ry={6} />
  </Svg>
);
const Milk: Art = () => (
  <Svg>
    <path
      d="M30 30 L40 14 L60 14 L70 30 L70 86 Q70 90 66 90 L34 90 Q30 90 30 86 Z"
      fill={F.white}
    />
    <path d="M30 30 L70 30 L70 36 L30 36 Z" fill={P.sky} opacity="0.5" />
    <path d="M58 30 L70 30 L70 86 Q70 90 66 90 L58 90 Z" fill="#6B2D5C" opacity="0.07" />
    <rect x="38" y="48" width="24" height="26" rx="6" fill={F.sky} />
    <path
      d="M42 62 Q50 70 58 62"
      stroke={P.white}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <rect x="44" y="8" width="12" height="8" rx="3" fill={F.grey} />
    <Hi x={40} y={40} rx={3} ry={8} />
  </Svg>
);
const Orange: Art = () => (
  <Svg>
    <circle cx="50" cy="54" r="32" fill={F.orange} />
    <path d="M22 62 Q50 82 78 62 Q74 84 50 86 Q26 84 22 62 Z" fill={P.orangeDeep} opacity="0.35" />
    <circle cx="50" cy="54" r="32" fill="url(#cg-sugar)" opacity="0.5" />
    <rect x="47" y="16" width="6" height="10" rx="3" fill={F.brownDeep} />
    <ellipse cx="62" cy="22" rx="11" ry="5" fill={F.green} transform="rotate(-20 62 22)" />
    <Hi x={36} y={42} rx={9} ry={6} />
  </Svg>
);
const Pineapple: Art = () => (
  <Svg>
    <path d="M50 30 L38 8 L46 26 L50 4 L54 26 L62 8 Z" fill={F.greenDeep} />
    <path d="M40 30 L28 18 L44 32 Z M60 30 L72 18 L56 32 Z" fill={F.green} />
    <path d="M28 56 Q28 30 50 30 Q72 30 72 56 Q72 86 50 90 Q28 86 28 56 Z" fill={F.yellowDeep} />
    <path
      d="M30 44 L70 80 M30 64 L58 88 M70 44 L30 80 M70 64 L42 88 M44 32 L72 60 M56 32 L28 60"
      stroke={P.brown}
      strokeWidth="1.5"
      opacity="0.4"
    />
    <path d="M28 66 Q50 84 72 66 Q70 86 50 90 Q30 86 28 66 Z" fill={P.brown} opacity="0.2" />
    <Hi x={40} y={44} rx={6} ry={9} />
  </Svg>
);
const Zucchini: Art = () => (
  <Svg>
    <path
      d="M20 66 Q14 54 26 50 L74 36 Q86 34 88 44 Q88 52 78 56 L30 72 Q22 74 20 66 Z"
      fill={F.greenDeep}
    />
    <path d="M24 60 L78 42" stroke={P.mint} strokeWidth="3" strokeLinecap="round" opacity="0.5" />
    <path
      d="M20 66 Q30 68 40 64 L78 52 Q86 50 88 44 Q88 52 78 56 L30 72 Q22 74 20 66 Z"
      fill="#1F6B3C"
      opacity="0.25"
    />
    <path d="M84 40 Q92 34 94 28 Q90 30 86 36 Z" fill={F.brown} />
    <Hi x={36} y={56} rx={10} ry={4} />
  </Svg>
);

export const VOCAB_ART: Record<string, Art> = {
  banana: Banana,
  grapes: Grapes,
  icecream: IceCream,
  lemon: Lemon,
  milk: Milk,
  orange: Orange,
  pineapple: Pineapple,
  zucchini: Zucchini,
  ant: Ant,
  apple: Apple,
  alligator: Alligator,
  bear: Bear,
  cat: Cat,
  dog: Dog,
  elephant: Elephant,
  frog: Frog,
  giraffe: Giraffe,
  jellyfish: Jellyfish,
  lion: Lion,
  monkey: Monkey,
  nest: Nest,
  octopus: Octopus,
  quail: Quail,
  rabbit: Rabbit,
  snake: Snake,
  turtle: Turtle,
  whale: Whale,
  yak: Yak,
  zebra: Zebra,
  ball: Ball,
  egg: Egg,
  goat: Goat,
  hat: Hat,
  igloo: Igloo,
  jam: Jam,
  kite: Kite,
  moon: Moon,
  queen: Queen,
  sun: Sun,
  tiger: Tiger,
  umbrella: Umbrella,
  van: Van,
  water: Water,
  box: Box,
  yoyo: YoYo,
  astronaut: Astronaut,
  anchor: Anchor,
  bus: Bus,
  butterfly: Butterfly,
  car: Car,
  cup: Cup,
  cake: Cake,
  cow: Cow,
  drum: Drum,
  doll: Doll,
  door: Door,
  duck: Duck,
  envelope: Envelope,
  eye: EyeArt,
  engine: Engine,
  fan: Fan,
  flag: Flag,
  flower: Flower,
  fish: Fish,
  guitar: Guitar,
  globe: Globe,
  house: House,
  hand: Hand,
  heart: Heart,
  hen: Hen,
  ink: Ink,
  iron: Iron,
  insect: Insect,
  jar: Jar,
  juice: Juice,
  jacket: Jacket,
  jet: Jet,
  jelly: Jelly,
  key: Key,
  king: King,
  kettle: Kettle,
  kangaroo: Kangaroo,
  leaf: Leaf,
  lamp: Lamp,
  ladder: Ladder,
  mountain: Mountain,
  mouse: Mouse,
  nose: Nose,
  nail: Nail,
  net: Net,
  nut: Nut,
  ocean: Ocean,
  ox: Ox,
  owl: Owl,
  pen: Pen,
  pizza: Pizza,
  // P is a penguin, drawn once in the shared AnimalArt and reused here — the
  // same call letter-tracing's AnchorArt makes, so the portal never grows a
  // second, slightly-different penguin. Pig stays registered below: nothing in
  // the vocabulary asks for it today, but the drawing is good and a data edit
  // can bring it back without touching this file.
  penguin: ANIMAL_ART.penguin,
  pig: Pig,
  panda: Panda,
  quilt: Quilt,
  question: Question,
  quokka: Quokka,
  robot: Robot,
  rain: Rain,
  ring: Ring,
  rocket: Rocket,
  star: Star,
  shoe: Shoe,
  soup: Soup,
  tree: Tree,
  train: Train,
  tooth: Tooth,
  uniform: Uniform,
  ukulele: Ukulele,
  up: Up,
  urchin: Urchin,
  violin: Violin,
  volcano: Volcano,
  vest: Vest,
  vase: Vase,
  watch: Watch,
  wind: Wind,
  wagon: Wagon,
  xylophone: Xylophone,
  xray: Xray,
  fox: Fox,
  six: Six,
  yacht: Yacht,
  yarn: Yarn,
  yellow: Yellow,
  zoo: Zoo,
  zip: Zip,
  zipper: Zip,
};
