import { memo } from "react";
import type { Kid } from "@games/burj-lift/constants/rounds";

/**
 * Burj Lift's two passengers — a GIRL (brown bunches with yellow ties, a rose
 * dress) and a BOY (a short crop with a tuft, a blue T-shirt with a star,
 * navy shorts) — as plain flat SVG: big round heads, dot eyes, rosy cheeks,
 * calm colours. Colours are presentation attributes and there are no ids, so
 * the same drawing works in the game, in a title-card miniature and on the
 * Library card (which does not load playlab.css).
 *
 * `pose`: "stand" (arms down — waiting, riding) or "cheer" (both arms up —
 * carried, and stepping out on their floor). `head` draws the face alone,
 * cropped close, for the window of the floor they got to. `x`/`y`/`w`/`h`
 * place it inside another SVG (a miniature); without them it fills its box
 * (class `bjl-kid-art`). The figure's box is 100 × 160, feet on its bottom.
 */

export type KidPose = "stand" | "cheer";

const SKIN = "#F2C29E";
const SKIN_DK = "#E0A47E";
const CHEEK = "#F49A9C";
const INK = "#3B2A26";
const WHITE = "#FFFFFF";

const GIRL = {
  hair: "#5B3826",
  tie: "#FFCF5C",
  dress: "#EF7E97",
  dressDk: "#D25F7B",
  shoe: "#B94E6E",
};
const BOY = {
  hair: "#3A2820",
  shirt: "#4C9BE0",
  shirtDk: "#3A7EC0",
  star: "#FFD45E",
  shorts: "#2F5785",
  shoe: "#E45B4D",
};

/** The crop of the head alone, per kid (the girl's bunches stick out). */
const HEAD_BOX: Record<Kid, string> = { girl: "8 12 84 64", boy: "18 12 64 64" };

/** The face both share: eyes with a shine, brows, cheeks, a little nose, a
 *  smile (or, cheering, an open laugh). The girl has lashes. */
function Face({ who, pose }: { who: Kid; pose: KidPose }) {
  return (
    <g>
      <path
        d="M36 41 Q40 38.6 44 40.6 M56 40.6 Q60 38.6 64 41"
        fill="none"
        stroke={who === "girl" ? GIRL.hair : BOY.hair}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <ellipse cx="40.5" cy="49" rx="3.3" ry="4.1" fill={INK} />
      <ellipse cx="59.5" cy="49" rx="3.3" ry="4.1" fill={INK} />
      <circle cx="41.7" cy="47.5" r="1.25" fill={WHITE} />
      <circle cx="60.7" cy="47.5" r="1.25" fill={WHITE} />
      {who === "girl" && (
        <path
          d="M37.4 46 L35.2 44.4 M62.6 46 L64.8 44.4"
          stroke={INK}
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      )}
      <ellipse cx="34" cy="56.5" rx="4.6" ry="3" fill={CHEEK} opacity="0.8" />
      <ellipse cx="66" cy="56.5" rx="4.6" ry="3" fill={CHEEK} opacity="0.8" />
      <path
        d="M48.6 53.6 Q50 55 51.4 53.6"
        fill="none"
        stroke={SKIN_DK}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      {pose === "cheer" ? (
        <g>
          <path d="M43 58.4 Q50 59.6 57 58.4 Q56 67.4 50 67.4 Q44 67.4 43 58.4 Z" fill="#8C2F3C" />
          <ellipse cx="50" cy="64.6" rx="3.8" ry="2.2" fill="#F07C8A" />
        </g>
      ) : (
        <path
          d="M44 59 Q50 64.6 56 59"
          fill="none"
          stroke={INK}
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      )}
    </g>
  );
}

/** The girl's head: hair behind, two bunches, the face, a soft fringe. */
function GirlHead({ pose }: { pose: KidPose }) {
  return (
    <g>
      <circle cx="19" cy="50" r="10.5" fill={GIRL.hair} />
      <circle cx="81" cy="50" r="10.5" fill={GIRL.hair} />
      <circle cx="26.5" cy="42.5" r="3.8" fill={GIRL.tie} />
      <circle cx="73.5" cy="42.5" r="3.8" fill={GIRL.tie} />
      <circle cx="50" cy="42" r="27" fill={GIRL.hair} />
      <ellipse cx="50" cy="48" rx="23.5" ry="22.5" fill={SKIN} />
      <path
        d="M26.4 44 Q27 23 50 21.5 Q73 23 73.6 44 Q68 33.5 59 32.2 Q54 37.6 45 35 Q37.4 34 32 38.6 Q28.4 41 26.4 44 Z"
        fill={GIRL.hair}
      />
      <Face who="girl" pose={pose} />
    </g>
  );
}

/** The boy's head: ears, a short crop with a tuft on top, the face. */
function BoyHead({ pose }: { pose: KidPose }) {
  return (
    <g>
      <circle cx="26.5" cy="50" r="5" fill={SKIN} />
      <circle cx="73.5" cy="50" r="5" fill={SKIN} />
      <circle cx="26.8" cy="50.4" r="2.2" fill={SKIN_DK} />
      <circle cx="73.2" cy="50.4" r="2.2" fill={SKIN_DK} />
      <ellipse cx="50" cy="48" rx="23.5" ry="22.5" fill={SKIN} />
      <path
        d="M26 46 Q24.4 21 50 20 Q75.6 21 74 46 Q71.6 35.2 63 33.2 Q57 31.6 51 35 Q43 31.4 36 33.6 Q28.6 36.6 26 46 Z"
        fill={BOY.hair}
      />
      <path d="M45 21.4 Q48 12 58 13.6 Q52.6 15.6 52.4 21.4 Z" fill={BOY.hair} />
      <Face who="boy" pose={pose} />
    </g>
  );
}

/** Arms, each with its short sleeve: down by the sides (drawn behind the
 *  clothes), or both thrown up in a cheer (drawn in front of the hair). */
function Arms({ pose, sleeve }: { pose: KidPose; sleeve: string }) {
  const up = pose === "cheer";
  const arm = (side: 1 | -1) => {
    const sx = 50 - side * 15;
    const hx = up ? 50 - side * 33 : 50 - side * 20.5;
    const hy = up ? 52 : 104;
    const mx = up ? 50 - side * 25 : 50 - side * 21.5;
    const my = up ? 68 : 90;
    return (
      <g key={side}>
        <path
          d={`M${sx} 79 Q${mx} ${my} ${hx} ${hy}`}
          fill="none"
          stroke={SKIN}
          strokeWidth="8.4"
          strokeLinecap="round"
        />
        <circle cx={hx} cy={hy} r="5" fill={SKIN} />
        <circle cx={sx} cy="77" r="7.4" fill={sleeve} />
      </g>
    );
  };
  return (
    <g>
      {arm(1)}
      {arm(-1)}
    </g>
  );
}

/** Legs with white socks, and a shoe on each foot (toes out a little). */
function Legs({ top, shoe, sole }: { top: number; shoe: string; sole?: string }) {
  return (
    <g>
      <rect x="36.6" y={top} width="9.4" height={146 - top} rx="4.7" fill={SKIN} />
      <rect x="54" y={top} width="9.4" height={146 - top} rx="4.7" fill={SKIN} />
      <rect x="36.6" y="137" width="9.4" height="9" fill={WHITE} />
      <rect x="54" y="137" width="9.4" height="9" fill={WHITE} />
      <path d="M30.4 159 Q29.6 146.6 40.4 145.6 Q47.6 145.6 47.6 153 L47.6 159 Z" fill={shoe} />
      <path d="M69.6 159 Q70.4 146.6 59.6 145.6 Q52.4 145.6 52.4 153 L52.4 159 Z" fill={shoe} />
      {sole && (
        <>
          <rect x="30" y="156.4" width="17.8" height="3.6" rx="1.6" fill={sole} />
          <rect x="52.2" y="156.4" width="17.8" height="3.6" rx="1.6" fill={sole} />
        </>
      )}
    </g>
  );
}

/** Below the clothes: the legs (and the boy's shorts). */
function Lower({ who }: { who: Kid }) {
  if (who === "girl") return <Legs top={112} shoe={GIRL.shoe} />;
  return (
    <g>
      <Legs top={116} shoe={BOY.shoe} sole={WHITE} />
      <path d="M34 101 H66 L67.4 121 H53.4 L50 112 L46.6 121 H32.6 Z" fill={BOY.shorts} />
    </g>
  );
}

/** The dress (a hem band and a white collar), or the T-shirt with its star. */
function Clothes({ who }: { who: Kid }) {
  if (who === "girl")
    return (
      <g>
        <path d="M38 70 Q50 64 62 70 L74.6 116 Q50 125 25.4 116 Z" fill={GIRL.dress} />
        <path d="M25.4 116 Q50 125 74.6 116 L73.2 110.6 Q50 119 26.8 110.6 Z" fill={GIRL.dressDk} />
        <path
          d="M41.6 69.6 Q45.6 76.4 50 70.6 Q54.4 76.4 58.4 69.6"
          fill="none"
          stroke={WHITE}
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    );
  return (
    <g>
      <path d="M37 70 Q50 64.6 63 70 L66 104 Q50 108.6 34 104 Z" fill={BOY.shirt} />
      <path d="M34 104 Q50 108.6 66 104 L65.6 99.4 Q50 104 34.4 99.4 Z" fill={BOY.shirtDk} />
      <path
        d="M43.6 69.4 Q50 74.6 56.4 69.4"
        fill="none"
        stroke={BOY.shirtDk}
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M50 79.6 L52.3 84.4 L57.4 85 L53.6 88.4 L54.6 93.4 L50 90.9 L45.4 93.4 L46.4 88.4 L42.6 85 L47.7 84.4 Z"
        fill={BOY.star}
      />
    </g>
  );
}

export const KidArt = memo(function KidArt({
  who,
  pose = "stand",
  head = false,
  x,
  y,
  w,
  h,
}: {
  who: Kid;
  pose?: KidPose;
  /** The face alone (the floor's window). */
  head?: boolean;
  /** Inside another SVG: where and how big. */
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}) {
  const nested = w !== undefined;
  const sleeve = who === "girl" ? GIRL.dress : BOY.shirt;
  return (
    <svg
      viewBox={head ? HEAD_BOX[who] : "0 0 100 160"}
      x={x}
      y={y}
      width={nested ? w : undefined}
      height={nested ? h : undefined}
      className={nested ? undefined : "bjl-kid-art"}
      preserveAspectRatio={head ? "xMidYMid meet" : "xMidYMax meet"}
      aria-hidden="true"
    >
      {!head && <Lower who={who} />}
      {!head && pose === "stand" && <Arms pose={pose} sleeve={sleeve} />}
      {!head && <Clothes who={who} />}
      {who === "girl" ? <GirlHead pose={pose} /> : <BoyHead pose={pose} />}
      {!head && pose === "cheer" && <Arms pose={pose} sleeve={sleeve} />}
    </svg>
  );
});
