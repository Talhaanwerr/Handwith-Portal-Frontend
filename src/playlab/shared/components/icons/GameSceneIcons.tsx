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
import { DoorLeaf, Item, Key } from "@games/door-count/components/DoorArt";
import { ThingArt } from "@games/number-match/components/MatchArt";
import { ShapeGlyph, ShapeHole } from "@games/shape-match/components/ShapeArt";
import { LeoFigure } from "@games/shape-match/components/Leo";
import { Picture } from "@games/blend-read/components/PictureArt";
import { QuizPicture } from "@games/word-quiz/components/QuizArt";
import { Thing as CountingThing, Plate } from "@games/counting-numbers/components/CountingArt";
import { cssVars } from "@shared/styles/cssVars";

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
        <PuzzleMagnet letter="S" colorIndex={2} size="100%" />
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

/* ── 12 · Key Quest: the corridor itself — one door standing open on
        the apples it hides, the brass knob that answers, and the key won ── */

/** One door of the corridor at card size, built from the game's own leaf so
 *  the card shows the exact door the child will meet. */
function CorridorDoor({
  leaf,
  panel,
  open = false,
  count = 0,
}: {
  leaf: string;
  panel: string;
  open?: boolean;
  count?: number;
}) {
  return (
    <div className="dcicon-door" style={cssVars({ "--dc-leaf": leaf, "--dc-panel": panel })}>
      <div className="dcicon-room">
        {count > 0 && (
          <div className="dcicon-things">
            {Array.from({ length: count }, (_, i) => (
              <span key={i} className="dcicon-thing">
                <Item theme="apple" />
              </span>
            ))}
          </div>
        )}
        {/* shut: the whole leaf. open: the leaf swung back against the jamb */}
        <div className={open ? "dcicon-leaf dcicon-leaf--open" : "dcicon-leaf"}>
          {open ? null : <DoorLeaf />}
        </div>
      </div>
    </div>
  );
}

export function DoorCountIcon() {
  return (
    <Diorama className="dcicon-corridor">
      <At x={7} y={8} w={30} z={2}>
        <CorridorDoor leaf="#3FA33A" panel="#2E8A2A" open count={3} />
      </At>
      {/* and the one still shut beside it, because there are always doors */}
      <At x={40} y={8} w={30} z={2}>
        <CorridorDoor leaf="#E05A6E" panel="#C8455B" />
      </At>
      {/* the key the right answer wins, tipped out of the doorway */}
      <At x={73} y={6} w={18} z={3} r={18}>
        <Key />
      </At>
      {/* the knob that answers, with the hand about to turn it */}
      <At x={70} y={56} w={26} z={3}>
        <span className="dcicon-knob font-rounded font-black">3</span>
      </At>
      <At x={80} y={70} w={18} z={4}>
        <Hand />
      </At>
    </Diorama>
  );
}

/**
 * NUMBER MATCH — two cards of things with their numbers under them, the
 * third number still waiting in the tray and a hand reaching for it. The
 * whole game in one picture: count the card, put the number below it.
 */
export function NumberMatchIcon() {
  return (
    <Diorama className="nmicon-room">
      <At x={6} y={10} w={40} z={2}>
        <span className="nmicon-card" style={cssVars({ "--pl-color": "#BFE3F7" })}>
          <span className="nmicon-thing nmicon-thing--a">
            <ThingArt thing="cupcake" />
          </span>
          <span className="nmicon-thing nmicon-thing--b">
            <ThingArt thing="cupcake" />
          </span>
        </span>
      </At>
      <At x={54} y={10} w={40} z={2}>
        <span className="nmicon-card" style={cssVars({ "--pl-color": "#FFD9E4" })}>
          <span className="nmicon-thing nmicon-thing--c">
            <ThingArt thing="cupcake" />
          </span>
        </span>
      </At>

      {/* the numbers, one placed and one still being reached for */}
      <At x={14} y={58} w={24} z={3}>
        <span className="nmicon-chip font-rounded font-black">2</span>
      </At>
      <At x={62} y={58} w={24} z={3}>
        <span className="nmicon-chip font-rounded font-black">1</span>
      </At>
      <At x={72} y={68} w={22} z={4}>
        <Hand />
      </At>
    </Diorama>
  );
}

/**
 * SHAPES & PICTURES — Leo watching his board: a yellow circle and a green
 * square already in their holes, a blue triangle still waiting, and the
 * missing piece under a hand on the grass. The mechanic in one picture.
 */
export function ShapeMatchIcon() {
  return (
    <Diorama className="smicon-sky">
      <span className="smicon-ground" />

      <At x={15} y={6} w={70} z={2}>
        <span className="smicon-banner" />
      </At>

      <At x={27} y={25} w={70} z={3}>
        <span className="smicon-panel">
          <span className="smicon-slot">
            <ShapeGlyph piece={{ shape: "circle", hue: "sun" }} />
          </span>
          <span className="smicon-slot">
            <ShapeHole piece={{ shape: "triangle", hue: "sky" }} />
          </span>
          <span className="smicon-slot">
            <ShapeGlyph piece={{ shape: "square", hue: "leaf" }} />
          </span>
        </span>
      </At>

      <At x={0} y={33} w={32} z={4}>
        <span className="smicon-leo">
          <LeoFigure mood="watch" still />
        </span>
      </At>

      <At x={50} y={63} w={20} z={4}>
        <span className="smicon-piece">
          <ShapeGlyph piece={{ shape: "triangle", hue: "sky" }} />
        </span>
      </At>

      <At x={60} y={70} w={22} z={5}>
        <Hand />
      </At>
    </Diorama>
  );
}

/**
 * Art borrowed from a game, forced to fill its slot.
 *
 * The four newest cards reuse art whose OWN sizing lives in its game's
 * stylesheet (`cn-thing-svg`, `br-pic-img`, `pl-art`) — and the Library page
 * does not load playlab.css, so none of those rules exist here. Sizing on the
 * wrapper with utilities that DO exist is what keeps these cards correct off
 * the play route.
 */
function Art({ children }: { children: ReactNode }) {
  return (
    <span className="block [&>img]:block [&>img]:h-full [&>img]:w-full [&>img]:object-contain [&>svg]:block [&>svg]:h-auto [&>svg]:w-full">
      {children}
    </span>
  );
}

/** A number in a coloured circle — the counting games' one control. */
function NumberPip({ n, fill = "#2E7FD6" }: { n: string; fill?: string }) {
  return (
    <svg viewBox="0 0 100 100" className="block h-auto w-full drop-shadow-md">
      <circle cx="50" cy="50" r="46" fill={fill} />
      <circle cx="50" cy="38" r="38" fill="#FFFFFF" opacity="0.18" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="58"
        fontWeight="900"
        fontFamily="Nunito, system-ui, sans-serif"
        fill="#FFFFFF"
      >
        {n}
      </text>
    </svg>
  );
}

/**
 * NUMBER SAFARI — the ants' line with one number missing and the answer in a
 * hand: how many, and which one is gone, in one picture.
 */
export function NumberSafariIcon() {
  return (
    <Diorama className="bg-[#B4DC2E]">
      <span className="absolute -top-[18%] -left-[10%] h-[62%] w-[78%] rounded-[50%] bg-[#7FA81C]" />
      <span className="absolute top-[8%] right-[8%] h-[16%] w-[16%] rounded-full bg-[#FFE36A]" />

      <At x={4} y={44} w={22} z={2}>
        <NumberPip n="1" />
      </At>
      <At x={4} y={62} w={26} z={2}>
        <Art>
          <CountingThing theme="ant" index={0} />
        </Art>
      </At>

      <At x={33} y={44} w={22} z={2}>
        <NumberPip n="2" />
      </At>
      <At x={33} y={62} w={26} z={2}>
        <Art>
          <CountingThing theme="ant" index={1} />
        </Art>
      </At>

      {/* the gap — the whole mechanic */}
      <At x={62} y={44} w={22} z={2}>
        <svg viewBox="0 0 100 100" className="block h-auto w-full">
          <circle cx="50" cy="50" r="46" fill="#2B2B2B" />
        </svg>
      </At>
      <At x={62} y={62} w={26} z={2}>
        <Art>
          <CountingThing theme="ant" index={2} />
        </Art>
      </At>

      {/* the answer, on its way */}
      <At x={70} y={12} w={26} z={4}>
        <NumberPip n="3" />
      </At>
      <At x={84} y={26} w={22} z={5}>
        <Hand />
      </At>
    </Diorama>
  );
}

/**
 * WORD SITE — a picture card on the building site with its word being dropped
 * into place: the game is that drag, and nothing else.
 */
export function CvcMatchIcon() {
  return (
    <Diorama className="bg-[#7EC8EE]">
      <span className="absolute inset-x-0 top-0 h-[64%] bg-[linear-gradient(#2F8FD0,#B9E2F4)]" />
      <span className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(#B0793F,#8F5F2E)]" />
      {/* the city, three flat towers */}
      <span className="absolute bottom-[38%] left-[6%] h-[26%] w-[14%] bg-[#8FA6B8] opacity-60" />
      <span className="absolute bottom-[38%] left-[22%] h-[36%] w-[12%] bg-[#7F97AB] opacity-60" />
      <span className="absolute bottom-[38%] left-[36%] h-[22%] w-[13%] bg-[#8FA6B8] opacity-60" />

      {/* the card: a picture over its drop zone */}
      <At x={8} y={16} w={44} z={3}>
        <span className="block overflow-hidden rounded-[18%] border-[6px] border-[#8A5A1E] bg-[#FFFAF0] shadow-md">
          <span className="block p-[10%]">
            <Art>
              <Picture id="cat" />
            </Art>
          </span>
          <span className="block h-[22%] border-t-[5px] border-[#D9C49C] bg-[#DDF288]" />
        </span>
      </At>

      {/* the word tile, mid-drag */}
      <At x={54} y={52} w={40} z={4}>
        <span className="font-rounded flex items-center justify-center rounded-[26%] border-[6px] border-[#2B6D9E] bg-[#8FD0F5] py-[10%] text-[clamp(8px,2.6vw,22px)] font-black text-[#1F3550] shadow-md">
          cat
        </span>
      </At>
      <At x={78} y={66} w={22} z={5}>
        <Hand />
      </At>
    </Diorama>
  );
}

/**
 * SORT IT — two labelled boards with the presenter between them and a thing
 * being carried to the big one. The rule is shown, never written.
 */
export function SortItIcon() {
  return (
    <Diorama className="bg-[#B4DDF0]">
      <span className="absolute top-[8%] left-[10%] h-[14%] w-[26%] rounded-full bg-white/70" />
      <span className="absolute top-[14%] right-[12%] h-[10%] w-[20%] rounded-full bg-white/60" />

      {/* BIG */}
      <At x={4} y={30} w={36} z={2}>
        <span className="flex aspect-square items-center justify-center rounded-[20%] border-[6px] border-[#2F7BA6] bg-white p-[12%] shadow-md">
          <Art>
            <Picture id="apple" />
          </Art>
        </span>
      </At>
      {/* SMALL */}
      <At x={60} y={30} w={36} z={2}>
        <span className="flex aspect-square items-center justify-center rounded-[20%] border-[6px] border-[#2F7BA6] bg-white p-[26%] shadow-md">
          <Art>
            <Picture id="apple" />
          </Art>
        </span>
      </At>

      {/* the presenter, between the two — the position IS the idea */}
      <At x={41} y={34} w={18} z={4}>
        <Art>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/games/asset/bigsmall-trimmed.png" alt="" />
        </Art>
      </At>

      {/* one more thing still to be sorted, under a hand */}
      <At x={30} y={72} w={22} z={4}>
        <Art>
          <Picture id="ball" />
        </Art>
      </At>
      <At x={44} y={78} w={22} z={5}>
        <Hand />
      </At>
    </Diorama>
  );
}

/**
 * BLEND & SEEK — three letters sounded out into a word, and the picture they
 * name: the blend, then the match.
 */
export function BlendReadIcon() {
  return (
    <Diorama className="bg-[#DCEEFF]">
      <span className="absolute inset-x-0 bottom-0 h-[34%] bg-[#BFDCF5]" />
      <span className="absolute top-[6%] left-[8%] h-[12%] w-[22%] rounded-full bg-white/70" />

      <At x={28} y={8} w={44} z={2}>
        <Art>
          <Picture id="cat" />
        </Art>
      </At>

      <At x={6} y={56} w={26} z={3}>
        <LetterTile ch="c" border="#5FA8D6" />
      </At>
      <At x={37} y={56} w={26} z={3}>
        <LetterTile ch="a" border="#5FA8D6" />
      </At>
      <At x={68} y={56} w={26} z={3}>
        <LetterTile ch="t" border="#5FA8D6" />
      </At>

      <At x={56} y={70} w={22} z={5}>
        <Hand />
      </At>
    </Diorama>
  );
}

/**
 * SNOW WORDS — the bus on the ice with three words beside it, the right one
 * already tapped. The mechanic is the picture.
 */
export function WordQuizIcon() {
  return (
    <Diorama className="bg-[#CBE8F7]">
      <span className="absolute inset-x-0 bottom-0 h-[34%] bg-[#EAF6FD]" />
      <span className="absolute inset-x-[6%] top-[8%] bottom-[8%] rounded-[12%] border-[5px] border-[#2F6F96] bg-white/95" />

      {/* the three answer rows */}
      <At x={11} y={22} w={44} z={2}>
        <span className="block rounded-[22%] border-[4px] border-[#CFDAE4] bg-[#FBFCFE] py-[12%]" />
      </At>
      <At x={11} y={43} w={44} z={2}>
        <span className="font-rounded flex items-center rounded-[22%] border-[4px] border-[#4B8A34] bg-[#A8E08A] px-[8%] py-[6%] text-[clamp(6px,2vw,17px)] font-black text-[#1F3550]">
          bus
        </span>
      </At>
      <At x={11} y={64} w={44} z={2}>
        <span className="block rounded-[22%] border-[4px] border-[#CFDAE4] bg-[#FBFCFE] py-[12%]" />
      </At>

      {/* the picture being read against */}
      <At x={58} y={30} w={34} z={2}>
        <Art>
          <QuizPicture word="bus" />
        </Art>
      </At>

      {/* the segmented progress along the bottom */}
      <At x={11} y={83} w={78} z={3}>
        <span className="flex gap-[3%]">
          <span className="h-[6px] flex-1 rounded-full bg-[#3FAE68]" />
          <span className="h-[6px] flex-1 rounded-full bg-[#3FAE68]" />
          <span className="h-[6px] flex-1 rounded-full bg-[#3FAE68]" />
          <span className="h-[6px] flex-1 rounded-full border border-[#B9CBDB] bg-white" />
          <span className="h-[6px] flex-1 rounded-full border border-[#B9CBDB] bg-white" />
        </span>
      </At>

      <At x={44} y={48} w={20} z={5}>
        <Hand />
      </At>
    </Diorama>
  );
}

/* Math Maze's tile grid, in the icon's 100 x 100 space: three columns and
   three rows of 22-unit tiles on a cream board. */
const MZ_COL = [15, 39, 63] as const;
const MZ_ROW = [17, 41, 65] as const;
const MZ_TILE = 22;

function MazeIconTile({
  c,
  r,
  fill,
  stroke,
  dashed = false,
}: {
  c: 0 | 1 | 2;
  r: 0 | 1 | 2;
  fill: string;
  stroke: string;
  dashed?: boolean;
}) {
  return (
    <rect
      x={MZ_COL[c]}
      y={MZ_ROW[r]}
      width={MZ_TILE}
      height={MZ_TILE}
      rx="5"
      fill={fill}
      stroke={stroke}
      strokeWidth="1.6"
      strokeDasharray={dashed ? "2.6 2" : undefined}
    />
  );
}

function MazeIconNumber({
  c,
  r,
  n,
  faded = false,
}: {
  c: 0 | 1 | 2;
  r: 0 | 1 | 2;
  n: string;
  faded?: boolean;
}) {
  return (
    <text
      x={MZ_COL[c] + MZ_TILE / 2}
      y={MZ_ROW[r] + MZ_TILE / 2}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize="15"
      fontWeight="900"
      fontFamily="Nunito, system-ui, sans-serif"
      fill="#F07A1E"
      opacity={faded ? 0.45 : 1}
    >
      {n}
    </text>
  );
}

/**
 * MATH MAZE — the maze itself on the building site's sky: start flag, 1 and
 * 2 lit on the trail, a wrong 2 crossed out in red, the hand on the 3 that
 * comes next, and the trophy waiting in the corner. Tiles in the game's own
 * colours.
 */
export function MathMazeIcon() {
  return (
    <Diorama className="bg-[#7EC8EE]">
      <span className="absolute inset-x-0 top-0 h-[64%] bg-[linear-gradient(#2F8FD0,#B9E2F4)]" />
      <span className="absolute inset-x-0 bottom-0 h-[38%] bg-[linear-gradient(#B0793F,#8F5F2E)]" />

      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" style={{ zIndex: 2 }}>
        {/* the board and its shadow */}
        <rect x="11" y="15.5" width="78" height="78" rx="10" fill="rgba(60,30,120,0.28)" />
        <rect
          x="11"
          y="13"
          width="78"
          height="78"
          rx="10"
          fill="#FFF8EC"
          stroke="#FFFFFF"
          strokeWidth="2.5"
        />

        {/* the start */}
        <MazeIconTile c={0} r={0} fill="#ECE6F4" stroke="#ECE6F4" />

        {/* 1 and 2 on the trail: pale green, a dashed ring */}
        <MazeIconTile c={1} r={0} fill="#E6F8D8" stroke="#7CC95A" />
        <circle
          cx="50"
          cy="28"
          r="8"
          fill="none"
          stroke="#43A92F"
          strokeWidth="1.3"
          strokeDasharray="2 1.8"
        />
        <MazeIconNumber c={1} r={0} n="1" />
        <MazeIconTile c={1} r={1} fill="#E6F8D8" stroke="#7CC95A" />
        <circle
          cx="50"
          cy="52"
          r="8"
          fill="none"
          stroke="#43A92F"
          strokeWidth="1.3"
          strokeDasharray="2 1.8"
        />
        <MazeIconNumber c={1} r={1} n="2" />

        {/* the rest of the maze */}
        <MazeIconTile c={2} r={0} fill="#FFFFFF" stroke="#F1DCC0" />
        <MazeIconNumber c={2} r={0} n="5" />
        <MazeIconTile c={0} r={1} fill="#FFFFFF" stroke="#F1DCC0" />
        <MazeIconNumber c={0} r={1} n="4" />
        <MazeIconTile c={2} r={1} fill="#FFFFFF" stroke="#F1DCC0" />
        <MazeIconNumber c={2} r={1} n="6" />

        {/* the next number, warm — on the bottom row, so the hand's body
            falls off the board and the trophy stays in view */}
        <MazeIconTile c={1} r={2} fill="#FFF7E0" stroke="#F0B43C" />
        <MazeIconNumber c={1} r={2} n="3" />

        {/* a wrong 2, already tried: faded, a red cross on it */}
        <MazeIconTile c={0} r={2} fill="#FDECEB" stroke="#F2B8B4" />
        <MazeIconNumber c={0} r={2} n="2" faded />
        <path
          d="M20 70 L32 82 M32 70 L20 82"
          stroke="#E0413F"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* the prize corner */}
        <MazeIconTile c={2} r={2} fill="#FFE9A6" stroke="#F0B43C" dashed />
      </svg>

      <At x={18} y={20} w={16} z={3}>
        <Art>
          <Picture id="flag" />
        </Art>
      </At>
      <At x={66} y={68} w={16} z={3}>
        <Art>
          <Picture id="trophy" />
        </Art>
      </At>

      <At x={44} y={78} w={20} z={5}>
        <Hand />
      </At>
    </Diorama>
  );
}

/**
 * SORTING FOOD — the first table in the kitchen: the chef, a red apple on
 * one plate, a green apple's shadow on the other, and the green apple on its
 * way there in the hand. The rule is shown, never written.
 */
export function FoodSortIcon() {
  return (
    <Diorama>
      {/* the kitchen: the warm wall, a tiled splashback, the counter's lip,
          the counter */}
      <span className="absolute inset-0" style={{ background: "#FBE7A2" }} />
      <span
        className="absolute inset-x-0"
        style={{
          top: "50%",
          height: "22%",
          background: "repeating-linear-gradient(90deg, #FFF6D8 0 11%, #EBD9A0 11% 12%)",
        }}
      />
      <span
        className="absolute inset-x-0 bottom-0"
        style={{ height: "30%", background: "linear-gradient(#C98A4E, #A86B35)" }}
      />
      <span
        className="absolute inset-x-0"
        style={{ bottom: "28%", height: "4%", background: "#E0A56A" }}
      />

      {/* the chef, behind the counter */}
      <At x={-6} y={22} w={46} z={2}>
        <Art>
          <Picture id="chef" />
        </Art>
      </At>

      {/* the red plate: done */}
      <At x={34} y={62} w={32} z={3}>
        <Art>
          <Plate />
        </Art>
      </At>
      <At x={39} y={44} w={22} z={4}>
        <Art>
          <Picture id="apple" />
        </Art>
      </At>

      {/* the green plate: one shadow still to fill */}
      <At x={66} y={62} w={32} z={3}>
        <Art>
          <Plate />
        </Art>
      </At>
      <At x={71} y={44} w={22} z={4}>
        <span className="block" style={{ filter: "brightness(0)", opacity: 0.75 }}>
          <Art>
            <CountingThing theme="apple" />
          </Art>
        </span>
      </At>

      {/* the green apple, on its way */}
      <At x={46} y={6} w={24} z={5}>
        <Art>
          <CountingThing theme="apple" />
        </Art>
      </At>
      <DottedRoute d="M71 20 Q82 23 83 37" color="#E0457B" head={[83, 39, 175]} />
      <At x={51} y={19} w={20} z={6}>
        <Hand />
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
  "door-count": DoorCountIcon,
  "number-match": NumberMatchIcon,
  "shape-match": ShapeMatchIcon,
  "blend-read": BlendReadIcon,
  "number-safari": NumberSafariIcon,
  "cvc-match": CvcMatchIcon,
  "sort-it": SortItIcon,
  "word-quiz": WordQuizIcon,
  "math-maze": MathMazeIcon,
  "food-sort": FoodSortIcon,
};
