"use client";

import { displayLetter, type LetterCase } from "@games/dino-dig/store/dinoStore";
import { ALPHABET } from "@games/dino-dig/constants/rounds";

interface AlphabetStripProps {
  /** BIG or small letters — the strip mirrors what the child chose. */
  letterCase: LetterCase;
  /** Highest alphabet index dug up so far (-1 before anything). */
  revealedIndex: number;
  /** The letter on the fossil ring — glows orange. */
  current: string;
  /** Letters currently being played for — outlined until placed. */
  targets: readonly string[];
  /** Letters dropped into a site this round, even if out of order. */
  placed: readonly string[];
}

/**
 * The stone alphabet bar across the top: a…z, carved tiles that light up as the
 * child digs the alphabet out of the ground.
 *
 * It WRAPS rather than squeezing 26 tiles onto one line. A single row on a
 * 360px phone would force ~11px tiles — a progress ribbon nobody can read.
 * Wrapping keeps every tile legible and makes horizontal overflow impossible
 * at any width, which is the constraint that actually matters here.
 */
export function AlphabetStrip({
  letterCase,
  revealedIndex,
  current,
  targets,
  placed,
}: AlphabetStripProps) {
  const dug = revealedIndex + 1;

  return (
    <div
      className="dd-strip flex flex-wrap items-center justify-center gap-[2px] sm:gap-1"
      role="img"
      aria-label={`${dug} of ${ALPHABET.length} letters collected`}
    >
      {ALPHABET.map((letter, i) => {
        const isCurrent = letter === current;
        const isDug = i <= revealedIndex || placed.includes(letter);
        const isTarget = !isCurrent && !isDug && targets.includes(letter);

        // Three states, and only three:
        //   DONE    orange, normal size — banked, quiet
        //   CURRENT golden, glowing, animated, LARGER — the only thing pulling
        //           the eye, so a child always knows what they are looking for
        //   FUTURE  fully gray — deliberately uniform, so the strip never
        //           singles out "the next one" before its turn comes
        const tone = isDug
          ? "dd-tile--done"
          : isCurrent || isTarget
            ? "dd-tile--active"
            : "dd-tile--future";

        const isFuture = tone === "dd-tile--future";

        return (
          <span key={letter} className={`dd-tile ${tone}`} aria-hidden="true">
            {/* A future tile renders NO GLYPH AT ALL — a blank gray stone.
                Dimming the letter was not enough: a child could still read
                ahead and see what was coming, which gives the answer away
                before the round asks for it. The tile still occupies its slot,
                so the strip's length always shows how far there is to go. */}
            {isFuture ? "" : displayLetter(letter, letterCase)}
          </span>
        );
      })}
    </div>
  );
}
