"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { type Thing } from "@games/number-match/constants/rounds";

/**
 * EVERYTHING THIS GAME DRAWS.
 *
 * Twelve things to count, the card they sit on, the socket under it, the
 * number chip in the tray, and the sticker a round wins. All flat vector
 * with a heavy outline — one visual language, so a cupcake and a boat feel
 * like they came out of the same box of stickers.
 *
 * Every drawing fits a 40 × 40 box and fills its span, so the layout sizes
 * the things and the art never has to know how big it is.
 */

const OUTLINE = "#2E2A3D";

/* ── The twelve things ───────────────────────────────────────────────────── */

const THINGS: Record<Thing, ReactNode> = {
  cupcake: (
    <>
      <path d="M11 18h18l-2.4 14a2 2 0 0 1-2 1.7h-9.2a2 2 0 0 1-2-1.7Z" fill="#E39A63" />
      <path d="M14.6 18v15.7M20 18v15.7M25.4 18v15.7" stroke="#C67F4B" strokeWidth="1.4" />
      <path
        d="M9.5 18c0-3 2.2-4.6 4.3-4.4C14.4 10.4 16.9 8.6 20 8.6s5.6 1.8 6.2 5c2.1-.2 4.3 1.4 4.3 4.4Z"
        fill="#FFF1F5"
      />
      <circle cx="20" cy="6.6" r="2.6" fill="#E0413F" />
      <path d="M20 4.4c.6-1.4 1.8-2 2.6-1.8" stroke="#5FAF3A" strokeWidth="1.5" fill="none" />
      <path d="M14 15.4h2.4M22 13.6h2.6M17.6 11.8h1.8" stroke="#7FC7F0" strokeWidth="1.6" />
    </>
  ),
  apple: (
    <>
      <path
        d="M20 11c6.6-3.4 12 1.4 12 8.4C32 27 26.6 34 20 34S8 27 8 19.4C8 12.4 13.4 7.6 20 11Z"
        fill="#E0413F"
      />
      <path d="M13.6 15.2c1.2-1.8 3-2.6 4.4-2.4" stroke="#FF8A87" strokeWidth="2.4" fill="none" />
      <path d="M20 11V6.4" stroke="#8A5A2E" strokeWidth="2.4" />
      <path d="M20.6 8.4c2.4-3 5.6-3.2 7-2.4.4 3-2.4 5.4-7 4.6Z" fill="#5FAF3A" />
    </>
  ),
  balloon: (
    <>
      <path
        d="M20 30.4c-1 1.6-2.6 2.6-2.6 4.4 0 1.4 1.2 2.2 2.6 2.2s2.6-.8 2.6-2.2c0-1.8-1.6-2.8-2.6-4.4Z"
        stroke={OUTLINE}
        strokeWidth="1.4"
        fill="none"
      />
      <ellipse cx="20" cy="17" rx="10" ry="12.4" fill="#F06AA0" />
      <path d="M15.6 11.6c1-1.8 2.6-2.8 4-3" stroke="#FFC0DA" strokeWidth="2.6" fill="none" />
      <path d="m17.6 29.2 2.4 2.4 2.4-2.4Z" fill="#D14D82" />
    </>
  ),
  fish: (
    <>
      <path d="m32 20 6-6v12Z" fill="#F6A93B" />
      <ellipse cx="19" cy="20" rx="13" ry="9.4" fill="#F6C544" />
      <path d="M19 10.6c2 2.6 2 16.2 0 18.8" stroke="#E0A017" strokeWidth="1.6" fill="none" />
      <circle cx="11" cy="17.4" r="2.4" fill="#FFFFFF" />
      <circle cx="10.4" cy="17.4" r="1.2" fill={OUTLINE} />
      <path d="M14 25.6c2.6 1.4 5.4 1.4 8 0" stroke="#E0A017" strokeWidth="1.6" fill="none" />
    </>
  ),
  duck: (
    <>
      <ellipse cx="20" cy="26" rx="12" ry="8" fill="#F6C544" />
      <circle cx="27" cy="14.6" r="7" fill="#FFD75E" />
      <path d="M33 13.4h5.4l-2.6 3.4Z" fill="#F08A2E" />
      <circle cx="27.6" cy="13" r="1.6" fill={OUTLINE} />
      <path d="M10 25c2.6-3 6.4-3.4 9-1.6" stroke="#E0A017" strokeWidth="1.8" fill="none" />
    </>
  ),
  star: (
    <path
      d="m20 5 4.6 9.4 10.4 1.5-7.5 7.3 1.8 10.3L20 28.6l-9.3 4.9 1.8-10.3L5 15.9l10.4-1.5Z"
      fill="#F6C544"
    />
  ),
  bug: (
    <>
      <path d="M20 8v4M14.6 9.4l2 3.4M25.4 9.4l-2 3.4" stroke={OUTLINE} strokeWidth="1.6" />
      <circle cx="20" cy="14.6" r="4.4" fill={OUTLINE} />
      <path
        d="M8 25.4C8 18.8 13.4 15 20 15s12 3.8 12 10.4C32 31 26.6 35 20 35S8 31 8 25.4Z"
        fill="#E0413F"
      />
      <path d="M20 15v20" stroke={OUTLINE} strokeWidth="1.6" />
      <circle cx="14.6" cy="23" r="2.2" fill={OUTLINE} />
      <circle cx="25.4" cy="23" r="2.2" fill={OUTLINE} />
      <circle cx="15.6" cy="29.6" r="1.8" fill={OUTLINE} />
      <circle cx="24.4" cy="29.6" r="1.8" fill={OUTLINE} />
    </>
  ),
  flower: (
    <>
      <path d="M20 32v-9" stroke="#5FAF3A" strokeWidth="2.4" />
      <path d="M20 28c-3.4 0-5.4-2-5.4-4 3.4 0 5.4 2 5.4 4Z" fill="#5FAF3A" />
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse
          key={a}
          cx="20"
          cy="9.4"
          rx="4.2"
          ry="6"
          fill="#B98AE0"
          transform={`rotate(${a} 20 17)`}
        />
      ))}
      <circle cx="20" cy="17" r="4.4" fill="#F6C544" />
    </>
  ),
  kite: (
    <>
      <path
        d="M20 28.4c-1 2.4-3.4 3-3.4 5.2M20 33.6c1.4.4 2.6-.4 3.4-1.4"
        stroke={OUTLINE}
        strokeWidth="1.4"
        fill="none"
      />
      <path d="M20 4 32 17 20 30 8 17Z" fill="#4FA3E0" />
      <path d="M20 4v26M8 17h24" stroke="#FFFFFF" strokeWidth="1.6" />
      <path d="M20 4 32 17 20 30Z" fill="#7FC7F0" opacity="0.7" />
    </>
  ),
  leaf: (
    <>
      <path d="M8 32C6 18 16 6 32 6c2 16-8 26-24 26Z" fill="#5FAF3A" />
      <path d="M8 32C14 22 22 14 31 7" stroke="#3C8526" strokeWidth="1.8" fill="none" />
      <path
        d="M14 25c2-3 0-6-1.4-7.4M22 17c2.4-2.4 1.4-6 .6-7.4"
        stroke="#3C8526"
        strokeWidth="1.4"
        fill="none"
      />
    </>
  ),
  boat: (
    <>
      <path d="M19 6 30 20H19Z" fill="#E0413F" />
      <path d="M17 8 8 20h9Z" fill="#FFFFFF" stroke={OUTLINE} strokeWidth="1.2" />
      <path d="M18 5v16" stroke={OUTLINE} strokeWidth="1.8" />
      <path d="M5 22h30l-4.4 9a2 2 0 0 1-1.8 1.1H11.2a2 2 0 0 1-1.8-1.1Z" fill="#8A5A2E" />
      <path d="M7 26h26" stroke="#6A421F" strokeWidth="1.6" />
    </>
  ),
  bell: (
    <>
      <path
        d="M11 27c0-2 1.6-3 1.6-7.4C12.6 13.4 15.6 9 20 9s7.4 4.4 7.4 10.6C27.4 24 29 25 29 27Z"
        fill="#F6C544"
      />
      <path d="M9 27h22v3.4H9Z" fill="#E0A017" />
      <circle cx="20" cy="33.4" r="2.8" fill="#E0A017" />
      <circle cx="20" cy="7.4" r="2.2" fill="#E0A017" />
      <path d="M16 15.6c.6-2.6 2-4 3.4-4.4" stroke="#FFEAA6" strokeWidth="2" fill="none" />
    </>
  ),
};

/** One thing, drawn to fill its span. */
export function ThingArt({ thing }: { thing: Thing }) {
  return (
    <svg viewBox="0 0 40 40" className="nm-art" aria-hidden="true">
      {THINGS[thing]}
    </svg>
  );
}

/* ── The sky ─────────────────────────────────────────────────────────────── */

/** Which things drift past, and where they start. Fixed, because a random at
 *  render would move them on every re-render of the board. */
const DRIFTERS: readonly { thing: Thing; top: number; size: number; secs: number }[] = [
  { thing: "balloon", top: 8, size: 7, secs: 34 },
  { thing: "kite", top: 20, size: 6, secs: 46 },
  { thing: "star", top: 5, size: 4, secs: 40 },
  { thing: "cupcake", top: 30, size: 5, secs: 52 },
];

/**
 * Things drifting slowly across the sky behind the game.
 *
 * Ambient only: it never moves fast enough to pull an eye off the cards, and
 * it carries the game's own drawings rather than generic shapes, so the
 * background belongs to this game and not to a template.
 */
export function Drift() {
  return (
    <div className="nm-sky" aria-hidden="true">
      {DRIFTERS.map((d, i) => (
        <motion.span
          key={i}
          className="nm-drift"
          style={{ top: `${d.top}%`, width: `${d.size}%` }}
          initial={{ left: "-12%" }}
          animate={{ left: "112%", y: ["0%", "-14%", "0%"] }}
          transition={{
            left: { duration: d.secs, repeat: Infinity, ease: "linear", delay: i * 5 },
            y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <ThingArt thing={d.thing} />
        </motion.span>
      ))}
    </div>
  );
}

/* ── The card ────────────────────────────────────────────────────────────── */

/** The green tick that lands on a card once its number is underneath it. */
function Tick() {
  return (
    <motion.span
      className="nm-tick"
      initial={{ scale: 0, rotate: -40 }}
      animate={{ scale: [0, 1.35, 1], rotate: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 40" className="nm-art">
        <circle cx="20" cy="20" r="18" fill="#5faf3a" />
        <path
          d="m11 20.5 6 6 12-13"
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.span>
  );
}

/** Where the things sit inside a card, so a count reads as a shape as well
 *  as a number. Deterministic: the layout is the count, never a random. */
export function Card({
  thing,
  count,
  paint,
  solved,
  delay = 0,
}: {
  thing: Thing;
  count: number;
  paint: { face: string; edge: string };
  solved: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      className="nm-card"
      data-solved={solved ? "yes" : undefined}
      style={{ background: paint.face, borderColor: paint.edge }}
      initial={{ y: "14%", opacity: 0, rotate: -2 }}
      animate={solved ? { y: "-4%", opacity: 1, rotate: 0 } : { y: "0%", opacity: 1, rotate: 0 }}
      transition={
        solved
          ? { type: "spring", stiffness: 300, damping: 16 }
          : { delay, duration: 0.4, ease: "easeOut" }
      }
    >
      {solved && <Tick />}
      {Array.from({ length: count }, (_, i) => (
        <motion.span
          key={i}
          className="nm-thing"
          data-at={`${i + 1}-of-${count}`}
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: delay + 0.24 + i * 0.09,
            type: "spring",
            stiffness: 300,
            damping: 15,
          }}
        >
          <ThingArt thing={thing} />
        </motion.span>
      ))}
    </motion.div>
  );
}

/* ── The socket and the chip ─────────────────────────────────────────────── */

/** The hole under a card, waiting for its number. */
export function Socket({ open }: { open: boolean }) {
  return (
    <motion.span
      className="nm-socket-hole"
      aria-hidden="true"
      animate={open ? { scale: [1, 1.12, 1] } : { scale: 1 }}
      transition={open ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
    />
  );
}

/** A number, in the tray or sunk into a socket. */
export function Chip({ value, big }: { value: number; big?: boolean }) {
  return (
    <span className="nm-chip-face" data-big={big ? "yes" : undefined}>
      <span className="nm-chip-glyph font-rounded font-black">{value}</span>
    </span>
  );
}

/* ── The sticker ─────────────────────────────────────────────────────────── */

/** A won round, die-cut with a white border the way a real sticker is. */
export function Sticker({ thing, tilt = 0 }: { thing: Thing; tilt?: number }) {
  return (
    <span className="nm-sticker" style={{ rotate: `${tilt}deg` }}>
      <span className="nm-sticker-art">
        <ThingArt thing={thing} />
      </span>
    </span>
  );
}
