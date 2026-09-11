"use client";

import { motion } from "framer-motion";
import {
  ROUNDS_PER_PAGE,
  STICKERS,
  TOTAL_ROUNDS,
  pageOf,
} from "@games/number-match/constants/rounds";
import { Sticker, ThingArt } from "@games/number-match/components/MatchArt";
import { Pal } from "@games/number-match/components/Pal";
import { BookPage } from "@games/number-match/components/StickerBook";
import { Button } from "@shared/components/ui/Button";
import { CelebrationMotif } from "@shared/components/game/CelebrationMotif";
import { Confetti } from "@shared/components/game/Confetti";
import { GodRays } from "@shared/components/game/GodRays";
import { playClickSound } from "@shared/audio/sfx";

/**
 * The screens either side of the game: the one it opens on, and the one it
 * ends on. There is no menu in between — the game is one thing, so the first
 * thing the child does is start it.
 */

/* ── THE START ───────────────────────────────────────────────────────────── */

interface HomeProps {
  /** Rounds already won, so a part-finished book shows itself. */
  done: number;
  onStart: () => void;
  onRestart: () => void;
}

/** A sticker sits slightly crooked, the way a child would put it down. Fixed
 *  per slot, so it never shifts under the same sticker. */
const COVER_TILT = [-7, 5, -4, 6, 4, -5, 7, -3, -6, 4, -4, 6];

/**
 * THE START SCREEN IS THE STICKER BOOK'S COVER.
 *
 * Not a title and a sample of the puzzle: the thing the child is collecting,
 * held up so they can see exactly what they have and exactly how much is
 * still empty. Twelve slots, the ones already won filled in — that is the
 * whole proposition of the game in one picture, and it is also the only
 * progress display, so a returning child sees their own book, not a menu.
 *
 * The cover itself is the start button. A four-year-old should not have to
 * find a small word to begin.
 */
export function MatchHome({ done, onStart, onRestart }: HomeProps) {
  const started = done > 0 && done < TOTAL_ROUNDS;
  const start = () => {
    playClickSound();
    onStart();
  };

  return (
    <div className="nm-screen nm-home">
      <motion.h1
        className="nm-title font-rounded font-black"
        initial={{ y: "-60%", opacity: 0, rotate: -3 }}
        animate={{ y: "0%", opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 13 }}
      >
        Number Match
      </motion.h1>

      <motion.button
        type="button"
        className="nm-cover"
        onClick={start}
        aria-label={
          started ? `Keep going. ${done} of ${TOTAL_ROUNDS} stickers collected` : "Start the game"
        }
        initial={{ y: "22%", opacity: 0, rotate: -4 }}
        animate={{ y: "0%", opacity: 1, rotate: -1.4 }}
        transition={{ type: "spring", stiffness: 150, damping: 14, delay: 0.12 }}
        whileHover={{ rotate: 0, y: "-2%" }}
        whileTap={{ scale: 0.97 }}
      >
        <span className="nm-cover-spine" aria-hidden="true" />

        <span className="nm-cover-title font-rounded font-black">My Sticker Book</span>

        <span className="nm-cover-grid" aria-hidden="true">
          {STICKERS.map((thing, i) => (
            <motion.span
              className="nm-cover-slot"
              key={i}
              data-has={i < done ? "yes" : undefined}
              initial={i < done ? { scale: 0, rotate: -30 } : false}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                delay: 0.3 + i * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 14,
              }}
            >
              {i < done ? (
                <Sticker thing={thing} tilt={COVER_TILT[i % COVER_TILT.length]} />
              ) : (
                <span className="nm-cover-ghost">
                  <ThingArt thing={thing} />
                </span>
              )}
            </motion.span>
          ))}
        </span>

        <span className="nm-cover-count font-rounded font-black">
          {done} of {TOTAL_ROUNDS} stickers
        </span>

        {/* a slow shine across the cover, so it reads as something to pick up */}
        <motion.span
          className="nm-cover-shine"
          aria-hidden="true"
          initial={{ left: "-40%" }}
          animate={{ left: "120%" }}
          transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 3.4, ease: "easeInOut" }}
        />
      </motion.button>

      <motion.div
        className="nm-home-buttons"
        initial={{ y: "40%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
      >
        <Button size="lg" aria-label={started ? "Keep going" : "Start the game"} onClick={start}>
          {started ? "Keep going" : "Start"}
        </Button>
        {done > 0 && (
          <Button
            size="sm"
            variant="secondary"
            aria-label="Start a new sticker book"
            onClick={() => {
              playClickSound();
              onRestart();
            }}
          >
            New book
          </Button>
        )}
      </motion.div>

      <Pal cheer={false} say="Count with me!" />
    </div>
  );
}

/* ── THE END ─────────────────────────────────────────────────────────────── */

export function MatchFinal({ onAgain }: { onAgain: () => void }) {
  const pages = Math.ceil(TOTAL_ROUNDS / ROUNDS_PER_PAGE);

  return (
    <div className="nm-screen nm-final">
      <GodRays />

      <motion.h1
        className="nm-title font-rounded font-black"
        initial={{ y: "-50%", opacity: 0, scale: 0.7 }}
        animate={{ y: "0%", opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 12 }}
      >
        The book is full!
      </motion.h1>

      <div className="nm-final-book">
        {Array.from({ length: pages }, (_, i) => (
          <motion.div
            key={i}
            className="nm-final-page"
            initial={{ y: "26%", opacity: 0, rotate: i % 2 ? 5 : -5 }}
            animate={{ y: "0%", opacity: 1, rotate: i % 2 ? 1.5 : -1.5 }}
            transition={{ delay: 0.2 + i * 0.18, type: "spring", stiffness: 170, damping: 14 }}
          >
            <BookPage page={pageOf(i * ROUNDS_PER_PAGE)} filled={ROUNDS_PER_PAGE} />
          </motion.div>
        ))}
      </div>

      <motion.p
        className="nm-final-count font-rounded font-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        {TOTAL_ROUNDS} rounds · {TOTAL_ROUNDS} stickers
      </motion.p>

      <div className="nm-home-buttons">
        <Button
          size="lg"
          aria-label="Play again with a new sticker book"
          onClick={() => {
            playClickSound();
            onAgain();
          }}
        >
          Play again
        </Button>
      </div>

      <Pal cheer say="Every one!" />
      <Confetti count={54} />
      <CelebrationMotif motif="sparkle" count={16} />
    </div>
  );
}
