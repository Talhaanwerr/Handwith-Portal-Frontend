"use client";

/**
 * GAME SCENE ICONS, built from the games' OWN art — the portal card shows a
 * miniature of the real game world, not a symbol of it. The shark on the
 * card IS the game's shark; the chef's pot IS the pot; the dino IS Toro.
 * That is what makes the cards read as the finished product: the child
 * recognises the exact friend they will meet inside.
 *
 * Composition rules shared by every icon (the system):
 *   - a rounded square diorama (rounded-[22%], overflow hidden);
 *   - the game's real backdrop or a gradient in its world colours;
 *   - ONE hero from the game's art, large, off-centre;
 *   - the LETTER the game teaches, on the game's own surface (card, bubble,
 *     tile, magnet), because letters are the product;
 *   - one interaction cue at most (the shared pointing hand or a dotted
 *     route) — the cue tells the mechanic;
 *   - no ambient animation: cards must sit still in a grid.
 */

import type { ReactNode } from "react";
import { FriendlyShark, LetterFish } from "@games/feed-the-shark/components/SharkArt";
import { OceanBackdrop } from "@games/feed-the-shark/components/OceanBackdrop";
import { ChefArt, PuzzleMagnet } from "@games/magnet-match/components/MagnetArt";
import { Toro } from "@games/dino-dig/components/DinoArt";
import { CandyScene } from "@games/letter-treats/components/CandyScene";
import { PencilPal } from "@games/letter-hunt/components/PennyArt";
import { ANIMAL_ART } from "@shared/components/illustrations/AnimalArt";
import { PirateShip } from "@shared/components/pirate/PirateShip";
import { TreasureChest, GoldCoin } from "@shared/components/pirate/PirateTreasure";

/* ── shared scaffolding ── */

function Diorama({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={`pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%] ${className}`}
      aria-hidden="true"
    >
      {children}
    </div>
  );
}

/** An absolutely-placed layer; positions in % of the diorama. */
function At({
  x,
  y,
  w,
  r = 0,
  z = 1,
  children,
}: {
  x: number;
  y: number;
  w: number;
  r?: number;
  z?: number;
  children: ReactNode;
}) {
  return (
    <div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        zIndex: z,
        transform: r ? `rotate(${r}deg)` : undefined,
      }}
    >
      {children}
    </div>
  );
}

/** The portal's one pointing hand, reused on every card that taps/drags. */
function Hand() {
  return (
    <svg viewBox="0 0 30 30" className="block h-full w-full">
      <path
        d="M8 4 Q7 -4 12 -4.6 Q16.6 -4.6 16.6 3 L16.6 9 Q23 7 25 12.6 Q26 18 19.6 20 L10 21 Q3.6 20 3.6 12.6 Z"
        transform="translate(1 6)"
        fill="#F2C49A"
        stroke="#C68A57"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M11 26.6 L20.6 26 Q24 27.6 22.6 30 L13 30 Q9.6 29 11 26.6 Z"
        fill="#4A7FB5"
        stroke="#35608C"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A letter on a rounded white tile — SVG throughout, so the glyph scales
 *  with the tile at every card size. */
function LetterTile({
  ch,
  color = "#0d3a5c",
  border = "#A882E8",
}: {
  ch: string;
  color?: string;
  border?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className="block h-auto w-full drop-shadow-md">
      <rect
        x="4"
        y="4"
        width="92"
        height="92"
        rx="24"
        fill="#FFFFFF"
        stroke={border}
        strokeWidth="7"
      />
      <text
        x="50"
        y="72"
        textAnchor="middle"
        fontSize="60"
        fontWeight={900}
        fontFamily="inherit"
        fill={color}
      >
        {ch}
      </text>
    </svg>
  );
}

/** A letter in a translucent bubble — the ocean games' letter surface. */
function LetterBubble({
  ch,
  solid = false,
  color = "#FFFFFF",
}: {
  ch: string;
  solid?: boolean;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className="block h-auto w-full drop-shadow-md">
      <circle
        cx="50"
        cy="50"
        r="45"
        fill={solid ? "#FFFFFF" : "rgba(255,255,255,0.22)"}
        stroke={solid ? "none" : "rgba(255,255,255,0.9)"}
        strokeWidth="5"
      />
      <path
        d="M28 34 Q36 22 50 20"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <text
        x="50"
        y="70"
        textAnchor="middle"
        fontSize="54"
        fontWeight={900}
        fontFamily="inherit"
        fill={solid ? "#0E5A86" : color}
      >
        {ch}
      </text>
    </svg>
  );
}

/** A dotted route with an arrowhead — the "this moves there" cue. */
function DottedRoute({
  d,
  color = "#FFD93D",
  head,
}: {
  d: string;
  color?: string;
  head: [number, number, number];
}) {
  const [hx, hy, hr] = head;
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ zIndex: 3 }}>
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeDasharray="0.6 7.5"
      />
      <g transform={`translate(${hx} ${hy}) rotate(${hr})`}>
        <path d="M-5 3 L0 -6 L5 3 Z" fill={color} />
      </g>
    </svg>
  );
}

const Monkey = ANIMAL_ART["monkey"] ?? ANIMAL_ART["lion"];

/* ── 1 · ABC (tracing): the letter with its dotted route, hand mid-stroke ── */
export function LetterTracingIcon() {
  return (
    <Diorama className="bg-gradient-to-b from-[#EFE9FC] to-[#C7B6EE]">
      <At x={14} y={6} w={72}>
        <LetterTile ch="A" color="#7C5CBF" border="#A882E8" />
      </At>
      <DottedRoute d="M50 16 Q41 42 30 66" color="#FFD93D" head={[29, 60, -200]} />
      <At x={26} y={58} w={22} z={4}>
        <Hand />
      </At>
      {/* finished-stroke sparkles */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <path d="M78 22 Q79 26 83 27 Q79 28 78 32 Q77 28 73 27 Q77 26 78 22 Z" fill="#FFD93D" />
        <path
          d="M18 34 Q18.8 37 22 37.8 Q18.8 38.6 18 42 Q17.2 38.6 14 37.8 Q17.2 37 18 34 Z"
          fill="#FFFFFF"
        />
      </svg>
      <At x={8} y={78} w={30} z={2} r={-8}>
        <div className="h-2.5 w-full rounded-full bg-white/50" />
      </At>
    </Diorama>
  );
}

/* ── 2 · Jungle Spy: the game's real animal peeking through real foliage ── */
export function JungleSpyIcon() {
  return (
    <Diorama className="bg-gradient-to-b from-[#DFF7E8] to-[#8FD9B4]">
      {/* the animal the child spies */}
      <At x={30} y={26} w={52} z={1}>
        {Monkey ? <Monkey /> : null}
      </At>
      {/* hiding letters */}
      <At x={10} y={16} w={26} z={2} r={-10}>
        <LetterTile ch="B" color="#3DAA72" border="#66CC94" />
      </At>
      <At x={68} y={64} w={22} z={2} r={9}>
        <LetterTile ch="K" color="#3DAA72" border="#66CC94" />
      </At>
      {/* foliage over the corners, in front */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ zIndex: 3 }}>
        <path d="M-4 -4 Q34 4 22 34 Q-4 28 -4 -4 Z" fill="#4DBF85" />
        <path
          d="M6 6 Q22 10 18 26"
          fill="none"
          stroke="#2F8F5F"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path d="M104 -6 Q68 6 80 32 Q104 28 104 -6 Z" fill="#66CC94" />
        <path d="M-6 104 Q26 96 18 74 Q-6 80 -6 104 Z" fill="#66CC94" />
        <path d="M104 106 Q72 98 82 76 Q106 82 104 106 Z" fill="#4DBF85" />
      </svg>
      <At x={58} y={12} w={26} z={4}>
        <Hand />
      </At>
    </Diorama>
  );
}

/* ── 3 · Letter Hunt: Penny the pencil points out the matching letter ── */
export function LetterHuntIcon() {
  return (
    <Diorama className="bg-gradient-to-b from-[#FFECF3] to-[#FFC0D5]">
      <At x={4} y={18} w={34} z={2}>
        <PencilPal pointing />
      </At>
      {/* the letter crowd, the match ringed */}
      <At x={44} y={10} w={24} r={-8}>
        <LetterTile ch="E" color="#D14D82" border="#FF8FA3" />
      </At>
      <At x={72} y={30} w={20} r={7}>
        <LetterTile ch="F" color="#E8A0B8" border="#FFC0D5" />
      </At>
      <At x={46} y={46} w={20} r={5}>
        <LetterTile ch="L" color="#E8A0B8" border="#FFC0D5" />
      </At>
      <At x={64} y={64} w={26} r={-4} z={2}>
        <LetterTile ch="E" color="#D14D82" border="#FFD93D" />
      </At>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ zIndex: 3 }}>
        <circle
          cx="78"
          cy="78"
          r="17"
          fill="none"
          stroke="#FFD93D"
          strokeWidth="3.6"
          strokeDasharray="6 5"
          strokeLinecap="round"
        />
      </svg>
      <At x={78} y={82} w={20} z={4}>
        <Hand />
      </At>
    </Diorama>
  );
}

/* ── 4 · Magnet Match: the game's chef and a real letter magnet ── */
export function MagnetMatchIcon() {
  return (
    <Diorama className="bg-gradient-to-b from-[#FDF2CB] to-[#F2CE6B]">
      <At x={-4} y={26} w={58} z={1}>
        <ChefArt happy />
      </At>
      <At x={50} y={16} w={40} z={2} r={6}>
        <PuzzleMagnet letter="S" colorIndex={2} />
      </At>
      <DottedRoute d="M72 46 Q78 62 68 76" color="#8A5A2E" head={[68, 72, 190]} />
      <At x={58} y={72} w={34} z={2} r={-4}>
        <svg viewBox="0 0 120 80" className="block h-auto w-full drop-shadow-md">
          <rect
            x="4"
            y="4"
            width="112"
            height="72"
            rx="16"
            fill="#FFFFFF"
            stroke="#E8B33D"
            strokeWidth="6"
          />
          <text
            x="60"
            y="60"
            textAnchor="middle"
            fontSize="48"
            fontWeight={900}
            fontFamily="inherit"
            fill="#C8A24A"
            opacity="0.7"
          >
            S
          </text>
        </svg>
      </At>
    </Diorama>
  );
}

/* ── 5 · Dino Dig: Toro himself waits for the letter crossing the stones ── */
export function DinoDigIcon() {
  return (
    <Diorama className="bg-gradient-to-b from-[#E2F7F9] to-[#8FDCE2]">
      {/* the river */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <path d="M0 74 Q50 66 100 74 L100 100 L0 100 Z" fill="#00C4CC" opacity="0.4" />
        <ellipse
          cx="26"
          cy="82"
          rx="13"
          ry="5.5"
          fill="#C9CDD2"
          stroke="#8C99A6"
          strokeWidth="1.8"
        />
        <ellipse
          cx="52"
          cy="87"
          rx="13"
          ry="5.5"
          fill="#C9CDD2"
          stroke="#8C99A6"
          strokeWidth="1.8"
        />
      </svg>
      <At x={52} y={30} w={48} z={2}>
        <Toro mood="happy" />
      </At>
      <At x={10} y={26} w={30} z={2} r={-6}>
        <LetterTile ch="D" color="#0A1A3A" border="#00C4CC" />
      </At>
      <DottedRoute d="M40 40 Q50 34 58 40" color="#0A1A3A" head={[57, 39, 110]} />
    </Diorama>
  );
}

/* ── 6 · Letter Treats: the candy world itself, letter as the treat ── */
export function LetterTreatsIcon() {
  return (
    <Diorama className="bg-gradient-to-b from-[#FFE3EF] to-[#FFB7D6]">
      <CandyScene variant="full" />
      <At x={26} y={22} w={48} z={2} r={-4}>
        <LetterTile ch="L" color="#C2417A" border="#FF9EC4" />
      </At>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ zIndex: 3 }}>
        <path
          d="M76 20 Q77.2 24.4 82 25.6 Q77.2 26.8 76 31 Q74.8 26.8 70 25.6 Q74.8 24.4 76 20 Z"
          fill="#FFD93D"
        />
      </svg>
      <At x={56} y={62} w={22} z={4}>
        <Hand />
      </At>
    </Diorama>
  );
}

/* ── 7 · Feed the Shark: the game's shark, letter card and all, fish inbound ── */
export function FeedTheSharkIcon() {
  return (
    <Diorama>
      <div className="absolute inset-0">
        <OceanBackdrop />
      </div>
      <At x={30} y={8} w={68} z={2}>
        <FriendlyShark letter="A" />
      </At>
      <At x={2} y={56} w={34} z={2}>
        <LetterFish letter="a" />
      </At>
      <DottedRoute d="M36 68 Q46 64 54 60" color="#FFFFFF" head={[53, 59, 110]} />
    </Diorama>
  );
}

/* ── 8 · Space ABC: the real cosmos, the letter with one piece to place ── */
export function SpaceLettersIcon() {
  return (
    <Diorama className="bg-gradient-to-b from-[#101A42] to-[#0B1330]">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <circle cx="14" cy="14" r="1.6" fill="#FFFFFF" opacity="0.9" />
        <circle cx="86" cy="10" r="1.2" fill="#FFFFFF" opacity="0.7" />
        <circle cx="10" cy="56" r="1.2" fill="#FFFFFF" opacity="0.6" />
        <circle cx="92" cy="46" r="1.5" fill="#FFFFFF" opacity="0.6" />
        <circle cx="84" cy="86" r="8" fill="#5B7FFF" opacity="0.55" />
        <ellipse
          cx="84"
          cy="86"
          rx="14"
          ry="3.6"
          fill="none"
          stroke="#8FA8FF"
          strokeWidth="1.6"
          opacity="0.7"
          transform="rotate(-16 84 86)"
        />
      </svg>
      <At x={12} y={12} w={54} z={2}>
        <LetterTile ch="P" color="#5B7FFF" border="#5B7FFF" />
      </At>
      {/* the missing slice, pulled aside — a corner of the tile itself */}
      <At x={64} y={54} w={26} z={2} r={10}>
        <svg viewBox="0 0 100 100" className="block h-auto w-full drop-shadow-md">
          <path
            d="M8 30 Q40 12 92 20 L92 88 Q60 96 12 88 Z"
            fill="#FFFFFF"
            stroke="#5B7FFF"
            strokeWidth="6"
            strokeLinejoin="round"
          />
          <path
            d="M34 70 L52 40 L70 70 M40 60 L64 60"
            fill="none"
            stroke="#5B7FFF"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </At>
      <DottedRoute d="M72 58 Q64 48 56 42" color="#5B7FFF" head={[56, 43, -40]} />
      <At x={74} y={74} w={22} z={4}>
        <Hand />
      </At>
    </Diorama>
  );
}

/* ── 9 · Ocean ABC: the game's water, the B bubble mid-pop ── */
export function OceanAbcIcon() {
  return (
    <Diorama>
      <div className="absolute inset-0">
        <OceanBackdrop />
      </div>
      <At x={4} y={22} w={26} z={2}>
        <LetterBubble ch="A" />
      </At>
      <At x={70} y={26} w={26} z={2}>
        <LetterBubble ch="C" />
      </At>
      {/* B bursting free */}
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ zIndex: 2 }}>
        <g stroke="#BFE9FF" strokeWidth="3" strokeLinecap="round">
          <path d="M50 30 L50 22" />
          <path d="M36 38 L30 32" />
          <path d="M64 38 L70 32" />
          <path d="M38 62 L32 68" />
          <path d="M62 62 L68 68" />
        </g>
        <text
          x="50"
          y="62"
          textAnchor="middle"
          fontSize="34"
          fontWeight={900}
          fontFamily="inherit"
          fill="#FFD93D"
          stroke="#C79A18"
          strokeWidth="1"
        >
          B
        </text>
      </svg>
      <At x={54} y={58} w={22} z={4}>
        <Hand />
      </At>
    </Diorama>
  );
}

/* ── 10 · Ocean Hunt: A ? C over the real water, the B dragged home ── */
export function OceanHuntIcon() {
  return (
    <Diorama>
      <div className="absolute inset-0">
        <OceanBackdrop />
      </div>
      <At x={4} y={12} w={25} z={2}>
        <LetterBubble ch="A" />
      </At>
      <At x={71} y={12} w={25} z={2}>
        <LetterBubble ch="C" />
      </At>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ zIndex: 2 }}>
        <circle
          cx="50"
          cy="24"
          r="12.5"
          fill="none"
          stroke="#FFD93D"
          strokeWidth="2.8"
          strokeDasharray="4.5 5.5"
          strokeLinecap="round"
        />
        <text
          x="50"
          y="30"
          textAnchor="middle"
          fontSize="17"
          fontWeight={900}
          fontFamily="inherit"
          fill="#FFD93D"
        >
          ?
        </text>
      </svg>
      <At x={38} y={58} w={26} z={2}>
        <LetterBubble ch="B" solid />
      </At>
      <DottedRoute d="M52 58 Q54 46 51 38" color="#FFD93D" head={[51, 39, -10]} />
      <At x={52} y={68} w={22} z={4}>
        <Hand />
      </At>
    </Diorama>
  );
}

/* ── 11 · Pirate Match: the real ship, the open chest, letter meets treasure ── */
export function PirateMatchIcon() {
  return (
    <Diorama className="bg-gradient-to-b from-[#8FCBE8] to-[#2E86AB]">
      <At x={-8} y={16} w={72} z={1}>
        <PirateShip />
      </At>
      <At x={58} y={58} w={40} z={2}>
        <TreasureChest state="open" />
      </At>
      <At x={8} y={62} w={28} z={2} r={-6}>
        <LetterTile ch="A" color="#0d3a5c" border="#E9B44C" />
      </At>
      <DottedRoute d="M38 72 Q52 62 62 70" color="#E9B44C" head={[61, 68, 120]} />
      <At x={44} y={10} w={12} z={2}>
        <GoldCoin />
      </At>
    </Diorama>
  );
}

/** id → scene, for the portal card. */
export const GAME_SCENE_ICONS: Record<string, () => ReactNode> = {
  "letter-tracing": LetterTracingIcon,
  "jungle-spy": JungleSpyIcon,
  "letter-hunt": LetterHuntIcon,
  "magnet-match": MagnetMatchIcon,
  "dino-dig": DinoDigIcon,
  "letter-treats": LetterTreatsIcon,
  "feed-the-shark": FeedTheSharkIcon,
  "space-letters": SpaceLettersIcon,
  "ocean-abc": OceanAbcIcon,
  "ocean-hunt": OceanHuntIcon,
  "pirate-match": PirateMatchIcon,
};
