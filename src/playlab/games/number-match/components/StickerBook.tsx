"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ROUNDS_PER_PAGE,
  STICKERS,
  TOTAL_ROUNDS,
  pageOf,
  type Thing,
} from "@games/number-match/constants/rounds";
import { Sticker, ThingArt } from "@games/number-match/components/MatchArt";
import { Pal } from "@games/number-match/components/Pal";
import { CelebrationMotif } from "@shared/components/game/CelebrationMotif";
import { Confetti } from "@shared/components/game/Confetti";
import { GodRays } from "@shared/components/game/GodRays";
import { Ripple } from "@shared/components/game/Ripple";
import { sayAfter } from "@shared/audio/voice";

/**
 * THE REWARD IS A STICKER BOOK.
 *
 * Not a bar that creeps along the top: a real book with three pages of four
 * slots, and every round won is a sticker of the thing that round was about
 * — count the cupcakes, keep the cupcake. The book is the only record of
 * progress in the game, and the child can see at a glance both what they
 * have and how much page is left.
 *
 * Three moments use it, in rising order of noise:
 *   · a round won  → the sticker arrives and slaps into the next slot
 *   · a page full  → the page turns over, with everything on it
 *   · the book full → every sticker at once, and both friends
 */

/** A sticker sits slightly crooked, the way a child would put it down. The
 *  tilt is fixed per slot, so it never changes under the same sticker. */
const TILTS = [-6, 4, -3, 7];

/* ── One page ────────────────────────────────────────────────────────────── */

export function BookPage({
  page,
  filled,
  landing,
}: {
  /** 1-based page number. */
  page: number;
  /** How many slots on THIS page already have a sticker. */
  filled: number;
  /** The slot a sticker is arriving in right now, if any. */
  landing?: number;
}) {
  const first = (page - 1) * ROUNDS_PER_PAGE;
  return (
    <div className="nm-page">
      <p className="nm-page-no font-rounded font-black">Page {page}</p>
      <div className="nm-page-slots">
        {Array.from({ length: ROUNDS_PER_PAGE }, (_, i) => {
          const thing: Thing | undefined = STICKERS[first + i];
          const has = i < filled;
          return (
            <span className="nm-page-slot" key={i} data-has={has ? "yes" : undefined}>
              {has && thing && (
                <motion.span
                  className="nm-page-sticker"
                  initial={landing === i ? { scale: 0, rotate: -40 } : false}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 12 }}
                >
                  <Sticker thing={thing} tilt={TILTS[i % TILTS.length]} />
                </motion.span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ── A round won ─────────────────────────────────────────────────────────── */

/** How long the sticker fills the screen before it drops into the book. */
const SLAP_MS = 1100;

/**
 * The sticker for the round just won: it bursts up big enough to fill the
 * room, turns over once, and slaps down into the next empty slot.
 */
export function StickerReward({ index }: { index: number }) {
  /** "A sticker! One more for your book!" — as it arrives. */
  useEffect(() => {
    void sayAfter("pals-sticker");
  }, []);

  /** The sticker has landed in the book. */
  const [stuck, setStuck] = useState(false);
  const page = pageOf(index);
  const slot = index % ROUNDS_PER_PAGE;
  const thing = STICKERS[index];

  useEffect(() => {
    const t = setTimeout(() => setStuck(true), SLAP_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      className="nm-reward"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.28 }}
      role="status"
      aria-label={`A ${thing} sticker for your book`}
    >
      {/* light pouring in behind the sticker, the portal's own */}
      <GodRays />

      <motion.p
        className="nm-reward-title font-rounded font-black"
        initial={{ scale: 0.5, opacity: 0, y: "-30%" }}
        animate={{ scale: 1, opacity: 1, y: "0%" }}
        transition={{ type: "spring", stiffness: 240, damping: 14 }}
      >
        A sticker!
      </motion.p>

      <motion.div
        className="nm-book"
        data-open="yes"
        animate={stuck ? { rotate: [0, -1.6, 1.2, 0] } : { rotate: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <BookPage page={page} filled={stuck ? slot + 1 : slot} landing={stuck ? slot : undefined} />
      </motion.div>

      {/* the sticker itself, huge, on its way down into the page */}
      {!stuck && (
        <motion.span
          className="nm-reward-fly"
          initial={{ scale: 0.2, rotate: -30, opacity: 0 }}
          animate={{
            scale: [0.2, 3.2, 3.2, 0.9],
            rotate: [-30, 0, 340, 360],
            opacity: [0, 1, 1, 1],
          }}
          transition={{ duration: SLAP_MS / 1000, times: [0, 0.3, 0.68, 1], ease: "easeInOut" }}
          aria-hidden="true"
        >
          <Sticker thing={thing} />
        </motion.span>
      )}

      {/* it lands: rings out of the page, and a shower of the thing itself */}
      {stuck && (
        <>
          <Ripple count={3} gap={0.14} />
          <Confetti count={30} />
          <CelebrationMotif
            motif="sparkle"
            count={10}
            extras={[<ThingArt key="t" thing={thing} />]}
            extraEvery={3}
          />
        </>
      )}

      <Pal cheer big say="One more!" />
    </motion.div>
  );
}

/* ── A page full ─────────────────────────────────────────────────────────── */

/** When the finished page lifts off and turns over. */
const TURN_AT_MS = 900;

/**
 * Four stickers fill a page, so the page turns: it lifts at the corner,
 * swings over, and the next blank page is waiting underneath.
 */
export function PageTurn({ page }: { page: number }) {
  const [turning, setTurning] = useState(false);
  const last = page * ROUNDS_PER_PAGE >= TOTAL_ROUNDS;

  useEffect(() => {
    // "Page one is full! Nice work!" — as the page lifts
    void sayAfter("pals-page-" + page);
    const t = setTimeout(() => setTurning(true), TURN_AT_MS);
    return () => clearTimeout(t);
  }, [page]);

  return (
    <motion.div
      className="nm-turn"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-label={`Page ${page} is full`}
    >
      <GodRays />

      <motion.p
        className="nm-turn-title font-rounded font-black"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 13 }}
      >
        Page {page} is full!
      </motion.p>

      <div className="nm-book nm-book--turning">
        {/* the next page, waiting underneath */}
        {!last && <BookPage page={page + 1} filled={0} />}

        <motion.div
          className="nm-turn-leaf"
          initial={{ rotateY: 0 }}
          animate={{ rotateY: turning ? -168 : 0 }}
          transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
        >
          <BookPage page={page} filled={ROUNDS_PER_PAGE} />
        </motion.div>
      </div>

      <Confetti count={44} />
      <CelebrationMotif motif="sparkle" count={14} />
      <Pal cheer say="Nice work!" />
    </motion.div>
  );
}
