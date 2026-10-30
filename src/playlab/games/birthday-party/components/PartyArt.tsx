"use client";

import { memo, type ReactElement } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";
import { VOCAB_ART } from "@games/letter-treats/components/candy-world/VocabArt";
import { BirdArt, BoArt, RubyArt } from "@games/sesame-activities/components/SesameArt";
import type { FriendId, GuestId } from "@games/birthday-party/constants/rounds";

/**
 * BIRTHDAY PARTY'S PROPS — only what the portal did not already draw: a party
 * hat, a candle (with its flame and the puff when it is blown out), the
 * birthday cake without candles (Twemoji's has its own), and the age badge.
 * Everything that sits at the party is reused: Letter Treats' animal heads
 * (`VOCAB_ART`), Play Street Pals' Ruby, Bo and Percy and the penguin, and
 * Twemoji's cupcake. Drawn in the same chunky, soft-shaded style: lit
 * bodies, a darker side, a solid bottom edge.
 */

/* ── Party hats ───────────────────────────────────────────────────────────── */

const HAT_PAINT = [
  { main: "#FF7EA8", side: "#D9507F", dot: "#FFF3B0", brim: "#FFD93D" },
  { main: "#54A0FF", side: "#2E74CF", dot: "#FFFFFF", brim: "#FF9EC4" },
  { main: "#3DCB8A", side: "#239A63", dot: "#FFF3B0", brim: "#FFA868" },
  { main: "#A98BE0", side: "#7C5CC4", dot: "#FFFFFF", brim: "#FFD93D" },
  { main: "#FFA868", side: "#E07B3C", dot: "#FFFFFF", brim: "#54A0FF" },
] as const;

/** A cone party hat with dots, a brim and a pom-pom. */
export const PartyHat = memo(function PartyHat({ paint }: { paint: number }) {
  const c = HAT_PAINT[paint % HAT_PAINT.length];
  return (
    <svg viewBox="0 0 40 52" aria-hidden="true">
      <path d="M20 6 L36 45 Q20 51 4 45 Z" fill={c.main} />
      <path d="M20 6 L36 45 Q31 47.6 26.5 48.6 Z" fill={c.side} />
      <g fill={c.dot}>
        <circle cx="18.4" cy="20" r="2.2" />
        <circle cx="23.6" cy="30" r="2.6" />
        <circle cx="14" cy="34" r="2.4" />
        <circle cx="28" cy="41" r="2.2" />
        <circle cx="17" cy="43" r="2.4" />
      </g>
      <path
        d="M3 44.6 Q20 51.6 37 44.6 Q38.2 48 36 49.4 Q20 55 4 49.4 Q1.8 48 3 44.6 Z"
        fill={c.brim}
      />
      <circle cx="20" cy="6" r="5.2" fill={c.brim} />
      <circle cx="18.4" cy="4.6" r="1.8" fill="#FFFFFF" opacity="0.65" />
    </svg>
  );
});

/** Where a hat sits on each head, as shares of the head's square box: the
 *  hat's centre, the line its brim rests on, and its tilt. */
const HAT_ON: Record<GuestId | FriendId, { x: number; y: number; tilt: number }> = {
  bear: { x: 50, y: 28, tilt: -8 },
  cat: { x: 50, y: 32, tilt: 0 },
  dog: { x: 50, y: 25, tilt: 6 },
  monkey: { x: 50, y: 26, tilt: -6 },
  frog: { x: 50, y: 31, tilt: 0 },
  tiger: { x: 50, y: 27, tilt: -6 },
  lion: { x: 50, y: 16, tilt: 0 },
  elephant: { x: 50, y: 33, tilt: 5 },
  ruby: { x: 50, y: 30, tilt: -4 },
  bo: { x: 52, y: 30, tilt: 6 },
  bird: { x: 50, y: 24, tilt: -6 },
  penguin: { x: 50, y: 18, tilt: 6 },
};

function Hat({ who, paint }: { who: GuestId | FriendId; paint: number }) {
  const at = HAT_ON[who];
  return (
    <span
      className="bdc-hat"
      style={cssVars({
        "--bdc-hat-x": `${at.x}%`,
        "--bdc-hat-y": `${at.y}%`,
        "--bdc-hat-r": `${at.tilt}deg`,
      })}
      aria-hidden="true"
    >
      <PartyHat paint={paint} />
    </span>
  );
}

/* ── The guests and the birthday friend ───────────────────────────────────── */

/** A guest's head in a party hat, square, for behind the table. */
export const GuestHead = memo(function GuestHead({ who, paint }: { who: GuestId; paint: number }) {
  const Art = VOCAB_ART[who];
  return (
    <span className="bdc-head">
      <span className="bdc-head-art">
        <Art />
      </span>
      <Hat who={who} paint={paint} />
    </span>
  );
});

const PenguinArt = VOCAB_ART.penguin;

const FRIEND_ART: Record<FriendId, (happy: boolean) => ReactElement> = {
  bo: (happy) => <BoArt mood={happy ? "happy" : "idle"} />,
  ruby: (happy) => <RubyArt mood={happy ? "happy" : "idle"} wave={happy} />,
  bird: (happy) => <BirdArt happy={happy} />,
  penguin: () => <PenguinArt />,
};

/** The birthday friend, whole, in a party hat. */
export const BirthdayFriend = memo(function BirthdayFriend({
  who,
  happy,
}: {
  who: FriendId;
  happy: boolean;
}) {
  return (
    <span className={`bdc-friend-fig bdc-friend-fig--${who}`}>
      <span className="bdc-friend-art">{FRIEND_ART[who](happy)}</span>
      <Hat who={who} paint={3} />
    </span>
  );
});

/* ── The age badge ────────────────────────────────────────────────────────── */

/** The rosette's scallops, worked out once at load. */
const SCALLOPS = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  return {
    x: Number((50 + Math.cos(a) * 46).toFixed(1)),
    y: Number((46 + Math.sin(a) * 46).toFixed(1)),
  };
});

/** A rosette badge with the friend's age on it. */
export const AgeBadge = memo(function AgeBadge({ age }: { age: number }) {
  return (
    <span className="bdc-badge">
      <svg viewBox="0 0 100 120" aria-hidden="true">
        <path d="M30 70 L18 116 L32 108 L40 120 L50 76 Z" fill="#E5484D" />
        <path d="M70 70 L82 116 L68 108 L60 120 L50 76 Z" fill="#B8363A" />
        {SCALLOPS.map((p, i) => (
          <circle key={`e${i}`} cx={p.x} cy={p.y + 2.4} r="10" fill="#E0A93A" />
        ))}
        {SCALLOPS.map((p, i) => (
          <circle key={`f${i}`} cx={p.x} cy={p.y} r="10" fill="#FFD466" />
        ))}
        <circle cx="50" cy="48.4" r="40" fill="#E0A93A" />
        <circle cx="50" cy="46" r="40" fill="#FFD466" />
        <circle cx="50" cy="46" r="32" fill="#FFFFFF" />
      </svg>
      <span className="bdc-badge-num font-rounded font-black">{age}</span>
    </span>
  );
});

/* ── The cake ─────────────────────────────────────────────────────────────── */

/** A wide birthday cake on its plate, with nothing on top: the candles stand
 *  in their own row over the cream. Drawn on 300 × 116 and stretched to the
 *  box (a wider screen gets a wider cake, never a taller one); the middle
 *  line of the top, where the candles stand, is at y = 40 — 34.5% down. */
export const CakeArt = memo(function CakeArt() {
  return (
    <svg
      className="bdc-cake-art"
      viewBox="0 0 300 116"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* the plate */}
      <ellipse cx="150" cy="104" rx="148" ry="12" fill="#D9CCE8" />
      <ellipse cx="150" cy="100" rx="146" ry="11" fill="#FFFFFF" />
      {/* the sponge, a short wide drum */}
      <path d="M18 40 L18 92 Q150 114 282 92 L282 40 Z" fill="#FFB3CB" />
      <path d="M200 40 L282 40 L282 92 Q250 99 200 102 Z" fill="#F28FB0" opacity="0.6" />
      {/* the cream filling */}
      <path d="M18 66 Q150 86 282 66 L282 76 Q150 96 18 76 Z" fill="#FFF4DE" />
      {/* the icing on top, running down the front in drips */}
      <ellipse cx="150" cy="40" rx="132" ry="20" fill="#FFE3EE" />
      <path
        d="M18 40 Q18 58 28 58 Q36 58 36 50 Q40 66 50 66 Q60 66 60 54 Q70 62 84 62 Q96 62 98 54
           Q104 70 118 70 Q130 70 132 58 Q142 64 156 64 Q168 64 170 56 Q178 72 192 72 Q204 72 206 58
           Q216 64 230 64 Q242 64 244 54 Q252 66 264 66 Q276 66 278 54 Q282 50 282 40
           Q282 60 150 60 Q18 60 18 40 Z"
        fill="#FF7EA8"
      />
      <ellipse cx="150" cy="38.4" rx="128" ry="17" fill="#FFE3EE" />
      <ellipse cx="104" cy="31" rx="54" ry="5" fill="#FFFFFF" opacity="0.55" />
      {/* sprinkles on the sponge */}
      <g strokeWidth="4" strokeLinecap="round">
        <path d="M46 84 l8 -3" stroke="#54A0FF" />
        <path d="M86 90 l6 4" stroke="#FFD93D" />
        <path d="M128 94 l8 -2" stroke="#3DCB8A" />
        <path d="M172 94 l6 3" stroke="#A98BE0" />
        <path d="M214 90 l8 -3" stroke="#FFD93D" />
        <path d="M252 84 l6 4" stroke="#54A0FF" />
      </g>
    </svg>
  );
});

/* ── The candles ──────────────────────────────────────────────────────────── */

const CANDLE_PAINT = [
  { stick: "#FFFFFF", band: "#FF7EA8" },
  { stick: "#FFFFFF", band: "#54A0FF" },
  { stick: "#FFF6C8", band: "#3DCB8A" },
  { stick: "#FFFFFF", band: "#A98BE0" },
  { stick: "#FFF6C8", band: "#FFA868" },
  { stick: "#FFFFFF", band: "#FFC93D" },
] as const;

/** A striped candle with its wick — 40 × 70; the wick's tip is at y = 4. */
export const CandleStick = memo(function CandleStick({ paint }: { paint: number }) {
  const c = CANDLE_PAINT[paint % CANDLE_PAINT.length];
  return (
    <svg className="bdc-candle-stick" viewBox="0 0 40 70" aria-hidden="true">
      <path
        d="M20 14 Q18.6 9 21 4"
        stroke="#5A4632"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="11" y="16" width="18" height="54" rx="5" fill={c.band} />
      <rect x="11" y="14" width="18" height="54" rx="5" fill={c.stick} />
      <g fill={c.band}>
        <path d="M11 24 L29 18 L29 25 L11 31 Z" />
        <path d="M11 38 L29 32 L29 39 L11 45 Z" />
        <path d="M11 52 L29 46 L29 53 L11 59 Z" />
      </g>
      <rect x="14" y="18" width="3" height="44" rx="1.5" fill="#FFFFFF" opacity="0.7" />
    </svg>
  );
});

/** The flame on a lit candle — it pops on, and flickers slowly (CSS). */
function Flame() {
  return (
    <motion.span
      className="bdc-flame"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.2, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <span className="bdc-flame-flicker">
        <svg viewBox="0 0 40 48" aria-hidden="true">
          <circle cx="20" cy="28" r="18" fill="#FFD966" opacity="0.32" />
          <path d="M20 4 Q31 21 27 32 Q24 41 20 41 Q16 41 13 32 Q9 21 20 4 Z" fill="#FFA726" />
          <path
            d="M20 16 Q26 26 24 32 Q22.6 37 20 37 Q17.4 37 16 32 Q14 26 20 16 Z"
            fill="#FFF3A0"
          />
        </svg>
      </span>
    </motion.span>
  );
}

/** Three little clouds that rise and fade from a blown-out wick (CSS). */
function Puff() {
  return (
    <span className="bdc-puff" aria-hidden="true">
      <span className="bdc-puff-bit" />
      <span className="bdc-puff-bit" />
      <span className="bdc-puff-bit" />
    </span>
  );
}

/** One candle: the stick, its flame while lit, and a puff once blown out. */
export const Candle = memo(function Candle({
  paint,
  lit,
  blown,
}: {
  paint: number;
  lit: boolean;
  blown: boolean;
}) {
  return (
    <span className="bdc-candle">
      <AnimatePresence>{lit && <Flame key="flame" />}</AnimatePresence>
      {blown && <Puff />}
      <CandleStick paint={paint} />
    </span>
  );
});
