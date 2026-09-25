"use client";

import type { ReactNode } from "react";
import { Penguin } from "@shared/components/arctic/ArcticAnimals";

/**
 * THE TEN PICTURES, drawn.
 *
 * Every one is inline SVG in the portal's own language — big soft shapes, no
 * outlines, a darker tone under each shape so it sits on the card, and a glint
 * of light where the light would fall. That is the language Numbers 1 – 5,
 * Key Quest and Leo's Puzzles are drawn in, and a pasted-in icon set beside
 * them reads as clip art dropped into a form, which is exactly what this
 * screen looked like before.
 *
 * The penguin is the shared arctic theme's, because this game is set on the
 * ice and that is the penguin the portal already has. The cat and dog ARE
 * drawn here: the shared `AnimalArt` pair is a lavender cat from the tracing
 * cards, and beside a red bus and a brown hen it reads as a different game's
 * artwork wandering in.
 *
 * Each drawing fills a 100×100 box so the card can treat them all alike.
 */

const BOX = "0 0 100 100";

function Art({ children }: { children: ReactNode }) {
  return (
    <svg viewBox={BOX} className="wq-art" aria-hidden="true">
      {children}
    </svg>
  );
}

/** The soft shadow every object stands on. */
function Ground() {
  return <ellipse cx="50" cy="90" rx="30" ry="5" fill="#1A3550" opacity="0.13" />;
}

const Cat = () => (
  <Art>
    <Ground />
    {/* tail, curling out behind */}
    <path
      d="M74 72 Q90 70 88 56 Q86 46 78 48"
      stroke="#F2A03D"
      strokeWidth="7"
      fill="none"
      strokeLinecap="round"
    />
    <ellipse cx="46" cy="64" rx="26" ry="19" fill="#F7B65C" />
    <ellipse cx="46" cy="72" rx="20" ry="9" fill="#E09433" opacity="0.5" />
    {/* the stripes that make it unmistakably a cat */}
    <path
      d="M40 50 L38 60 M52 49 L50 59 M62 52 L60 61"
      stroke="#E09433"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <circle cx="36" cy="40" r="17" fill="#F7B65C" />
    <path d="M24 30 L20 16 L34 24 Z" fill="#F7B65C" />
    <path d="M48 30 L52 16 L38 24 Z" fill="#F7B65C" />
    <path d="M25 28 L23 20 L31 25 Z" fill="#F7C9A0" />
    <path d="M47 28 L49 20 L41 25 Z" fill="#F7C9A0" />
    <circle cx="30" cy="38" r="3.4" fill="#2B2B2B" />
    <circle cx="43" cy="38" r="3.4" fill="#2B2B2B" />
    <circle cx="31" cy="37" r="1.1" fill="#FFFFFF" />
    <circle cx="44" cy="37" r="1.1" fill="#FFFFFF" />
    <path d="M33 45 L36 48 L39 45 Z" fill="#E2735F" />
    <path
      d="M22 44 L10 41 M22 48 L11 50 M50 44 L62 41 M50 48 L61 50"
      stroke="#E09433"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Art>
);

const Dog = () => (
  <Art>
    <Ground />
    <path
      d="M76 66 Q88 60 84 50"
      stroke="#A9743F"
      strokeWidth="7"
      fill="none"
      strokeLinecap="round"
    />
    <ellipse cx="48" cy="64" rx="27" ry="19" fill="#C08A50" />
    <ellipse cx="48" cy="72" rx="21" ry="9" fill="#A9743F" opacity="0.5" />
    <path
      d="M30 78 L28 88 M44 80 L42 90 M56 80 L58 90 M70 78 L72 88"
      stroke="#C08A50"
      strokeWidth="7"
      strokeLinecap="round"
    />
    <circle cx="34" cy="42" r="18" fill="#C08A50" />
    {/* the long soft ears */}
    <ellipse cx="18" cy="42" rx="7" ry="15" fill="#A9743F" />
    <ellipse cx="50" cy="42" rx="7" ry="15" fill="#A9743F" />
    <ellipse cx="34" cy="52" rx="11" ry="8" fill="#E5C79E" />
    <circle cx="34" cy="48" r="4" fill="#2B2B2B" />
    <circle cx="28" cy="38" r="3.4" fill="#2B2B2B" />
    <circle cx="41" cy="38" r="3.4" fill="#2B2B2B" />
    <circle cx="29" cy="37" r="1.1" fill="#FFFFFF" />
    <circle cx="42" cy="37" r="1.1" fill="#FFFFFF" />
    <path
      d="M30 56 Q34 60 38 56"
      stroke="#8A5C2E"
      strokeWidth="2.4"
      fill="none"
      strokeLinecap="round"
    />
  </Art>
);

/** The penguin is the shared arctic bird, sized to this game's box. */
const QuizPenguin = () => (
  <span className="wq-art">
    <Penguin />
  </span>
);

const Bus = () => (
  <Art>
    <Ground />
    {/* body, with the darker underside that gives it weight */}
    <rect x="10" y="26" width="76" height="50" rx="12" fill="#E24B3F" />
    <rect x="10" y="58" width="76" height="18" rx="9" fill="#C43B31" />
    {/* the top deck's windows, then the lower ones */}
    <rect x="17" y="33" width="19" height="14" rx="4" fill="#BFE4F7" />
    <rect x="40" y="33" width="19" height="14" rx="4" fill="#BFE4F7" />
    <rect x="63" y="33" width="16" height="14" rx="4" fill="#BFE4F7" />
    <rect x="17" y="54" width="24" height="13" rx="4" fill="#BFE4F7" />
    <rect x="45" y="54" width="18" height="13" rx="4" fill="#9FD3F0" />
    {/* door */}
    <rect x="67" y="52" width="12" height="24" rx="4" fill="#F2C94C" />
    {/* wheels */}
    <circle cx="28" cy="78" r="9" fill="#2F3B47" />
    <circle cx="28" cy="78" r="4" fill="#8FA3B5" />
    <circle cx="70" cy="78" r="9" fill="#2F3B47" />
    <circle cx="70" cy="78" r="4" fill="#8FA3B5" />
    <rect x="15" y="29" width="30" height="5" rx="2.5" fill="#FFFFFF" opacity="0.35" />
  </Art>
);

const Sun = () => (
  <Art>
    {/* rays first, so the face sits over them */}
    <g fill="#F7B32B">
      <path d="M50 4 L57 20 L43 20 Z" />
      <path d="M50 96 L43 80 L57 80 Z" />
      <path d="M4 50 L20 43 L20 57 Z" />
      <path d="M96 50 L80 57 L80 43 Z" />
      <path d="M17 17 L31 24 L24 31 Z" />
      <path d="M83 83 L69 76 L76 69 Z" />
      <path d="M83 17 L76 31 L69 24 Z" />
      <path d="M17 83 L24 69 L31 76 Z" />
    </g>
    <circle cx="50" cy="50" r="27" fill="#F7B32B" />
    <circle cx="50" cy="50" r="22" fill="#FFD764" />
    <circle cx="41" cy="42" r="7" fill="#FFF0BE" opacity="0.85" />
  </Art>
);

const Hen = () => (
  <Art>
    <Ground />
    {/* tail, then body, so the tail tucks behind */}
    <path d="M20 52 Q6 36 14 30 Q22 34 26 44 Z" fill="#C2703A" />
    <ellipse cx="48" cy="56" rx="26" ry="22" fill="#E08A45" />
    <ellipse cx="48" cy="66" rx="20" ry="11" fill="#C2703A" opacity="0.5" />
    {/* wing */}
    <path d="M38 50 Q52 44 60 56 Q50 64 38 58 Z" fill="#F2A867" />
    {/* head and comb */}
    <circle cx="68" cy="38" r="13" fill="#E08A45" />
    <path d="M60 27 Q63 20 67 27 Q71 19 74 27 Q78 22 79 30 Z" fill="#D94F4F" />
    <path d="M70 48 Q74 54 68 55 Q65 52 66 48 Z" fill="#D94F4F" />
    <circle cx="72" cy="36" r="3" fill="#2B2B2B" />
    <circle cx="73" cy="35" r="1" fill="#FFFFFF" />
    <path d="M80 39 L90 42 L80 45 Z" fill="#F2C94C" />
    {/* legs */}
    <path
      d="M44 76 L42 86 M40 86 L46 86 M56 76 L58 86 M54 86 L60 86"
      stroke="#F2C94C"
      strokeWidth="3.5"
      strokeLinecap="round"
      fill="none"
    />
  </Art>
);

const Rat = () => (
  <Art>
    <Ground />
    {/* the long tail, curling away behind */}
    <path
      d="M76 68 Q92 66 90 54 Q88 46 80 48"
      stroke="#F0B7C8"
      strokeWidth="4.5"
      fill="none"
      strokeLinecap="round"
    />
    <ellipse cx="52" cy="60" rx="27" ry="20" fill="#9AA4B5" />
    <ellipse cx="52" cy="69" rx="21" ry="9" fill="#7E8899" opacity="0.55" />
    {/* head tapering to a snout */}
    <path d="M28 58 Q16 52 12 60 Q16 70 28 66 Z" fill="#9AA4B5" />
    <circle cx="30" cy="54" r="14" fill="#9AA4B5" />
    <circle cx="26" cy="41" r="8" fill="#9AA4B5" />
    <circle cx="26" cy="41" r="4.5" fill="#F0B7C8" />
    <circle cx="41" cy="41" r="7" fill="#9AA4B5" />
    <circle cx="41" cy="41" r="3.8" fill="#F0B7C8" />
    <circle cx="26" cy="54" r="3" fill="#2B2B2B" />
    <circle cx="27" cy="53" r="1" fill="#FFFFFF" />
    <circle cx="13" cy="60" r="3" fill="#F0B7C8" />
    <path d="M16 56 L6 52 M16 64 L6 67" stroke="#7E8899" strokeWidth="2" strokeLinecap="round" />
  </Art>
);

const Tap = () => (
  <Art>
    <Ground />
    {/* the wall plate and the curved spout */}
    <rect x="16" y="30" width="14" height="28" rx="5" fill="#A8B4C4" />
    <path
      d="M30 38 Q56 38 58 56 L58 62"
      stroke="#BCC8D6"
      strokeWidth="13"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M30 35 Q54 35 56 52"
      stroke="#E2EAF2"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    {/* the cross handle */}
    <rect x="34" y="16" width="8" height="18" rx="3" fill="#A8B4C4" />
    <rect x="24" y="10" width="28" height="7" rx="3.5" fill="#BCC8D6" />
    <rect x="34.5" y="4" width="7" height="19" rx="3.5" fill="#BCC8D6" />
    <circle cx="38" cy="13" r="4" fill="#8FA0B2" />
    {/* the drip */}
    <path d="M58 68 Q53 76 58 80 Q63 76 58 68 Z" fill="#5FC0EE" />
    <ellipse cx="58" cy="88" rx="12" ry="3.5" fill="#5FC0EE" opacity="0.5" />
  </Art>
);

const Map = () => (
  <Art>
    <Ground />
    {/* folded paper: three panels, the middle one standing higher */}
    <path d="M14 30 L38 22 L62 30 L86 22 L86 74 L62 82 L38 74 L14 82 Z" fill="#EAF2F8" />
    <path d="M14 30 L38 22 L38 74 L14 82 Z" fill="#DCE8F2" />
    <path d="M62 30 L86 22 L86 74 L62 82 Z" fill="#DCE8F2" />
    {/* the sea, then the land on top of it */}
    <path d="M18 40 L38 33 L62 40 L82 33 L82 66 L62 73 L38 66 L18 73 Z" fill="#9FD3F0" />
    <path d="M28 48 Q40 40 52 48 Q64 56 74 48 L74 62 Q62 68 50 62 Q38 56 28 62 Z" fill="#7FC46A" />
    {/* the route, and the cross that marks the spot */}
    <path
      d="M30 68 Q44 56 54 62 Q64 68 72 56"
      stroke="#E2735F"
      strokeWidth="2.6"
      strokeDasharray="4 4"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M68 50 L76 58 M76 50 L68 58"
      stroke="#D94F4F"
      strokeWidth="3.4"
      strokeLinecap="round"
    />
  </Art>
);

const Pan = () => (
  <Art>
    <Ground />
    {/* the handles sit behind the body */}
    <path
      d="M22 56 Q10 56 10 46"
      stroke="#6F7C8C"
      strokeWidth="7"
      fill="none"
      strokeLinecap="round"
    />
    <path
      d="M78 56 Q90 56 90 46"
      stroke="#6F7C8C"
      strokeWidth="7"
      fill="none"
      strokeLinecap="round"
    />
    <path d="M22 48 L78 48 L72 80 Q50 86 28 80 Z" fill="#8894A6" />
    <path d="M28 80 Q50 86 72 80 L70 72 Q50 78 30 72 Z" fill="#6F7C8C" />
    {/* the lid */}
    <ellipse cx="50" cy="46" rx="31" ry="8" fill="#A8B4C4" />
    <path d="M24 44 Q50 28 76 44 Z" fill="#BCC8D6" />
    <rect x="45" y="24" width="10" height="8" rx="4" fill="#E2735F" />
    <ellipse cx="38" cy="40" rx="8" ry="3" fill="#FFFFFF" opacity="0.4" />
  </Art>
);

const PICTURES: Readonly<Record<string, () => ReactNode>> = {
  bus: Bus,
  cat: Cat,
  sun: Sun,
  hen: Hen,
  penguin: QuizPenguin,
  dog: Dog,
  rat: Rat,
  tap: Tap,
  map: Map,
  pan: Pan,
};

/** The picture for one question word. */
export function QuizPicture({ word }: { word: string }) {
  const Draw = PICTURES[word];
  return Draw ? <Draw /> : null;
}
