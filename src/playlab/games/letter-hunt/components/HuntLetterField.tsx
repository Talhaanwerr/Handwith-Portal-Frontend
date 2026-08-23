"use client";

import { useMemo } from "react";
import { cssVars } from "@shared/styles/cssVars";
import { LETTERS } from "@games/letter-hunt/components/HuntScreens";

/** Rows × columns of the jitter grid. 9 × 8 = 72 candidate positions; a few
 *  are skipped per render so the field never looks like a lattice. */
const ROWS = 9;
const COLS = 8;
/** Roughly one in nine cells is left empty — organic gaps, not a checkerboard. */
const SKIP_CHANCE = 0.11;

interface FieldGlyph {
  id: number;
  letter: string;
  x: number;
  y: number;
  size: number;
  rotate: number;
  opacity: number;
}

/**
 * Small deterministic PRNG (mulberry32). The field must be STABLE across
 * re-renders — React re-renders this level on every tap, and a Math.random()
 * field would re-scatter every single time, which is both distracting and
 * exactly the kind of motion a hunting game must not have behind it.
 */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildField(seed: number): FieldGlyph[] {
  const rand = rng(seed);
  const out: FieldGlyph[] = [];
  let id = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (rand() < SKIP_CHANCE) continue;
      // Cell centre plus a generous jitter — the jitter is what turns a grid
      // into a scatter, while the grid is what guarantees even coverage with
      // no large empty regions and no clumping.
      const x = ((c + 0.5) / COLS) * 100 + (rand() - 0.5) * (100 / COLS) * 0.85;
      const y = ((r + 0.5) / ROWS) * 100 + (rand() - 0.5) * (100 / ROWS) * 0.85;
      const letter = LETTERS[Math.floor(rand() * LETTERS.length)];
      out.push({
        id: id++,
        // mixed case, like a real page of writing
        letter: rand() < 0.4 ? letter.toLowerCase() : letter,
        x: Math.min(97, Math.max(3, x)),
        y: Math.min(97, Math.max(3, y)),
        size: 0.7 + rand() * 1.5, // multiplier on the base font size
        rotate: (rand() - 0.5) * 34,
        opacity: 0.1 + rand() * 0.14,
      });
    }
  }
  return out;
}

/**
 * The alphabet soup behind the hunt.
 *
 * The board used to sit on ~10 drifting letters, which left the screen looking
 * empty and made the ten real cards obvious by sheer isolation. This fills the
 * whole play area with ~65 faint letters so the child genuinely has to SCAN.
 *
 * Three things make it safe to put behind live gameplay:
 *  - `pointer-events: none` on the layer, so it can never intercept a tap
 *    meant for a real card;
 *  - z-0, beneath every gameplay element (all of which are z-10);
 *  - low opacity and no animation, so it reads as texture, not as content
 *    competing with the letters the child is actually hunting.
 *
 * It changes NOTHING about the number of target letters: the board still has
 * exactly five targets among five decoys. These glyphs are not clickable and
 * are hidden from assistive technology.
 */
export function HuntLetterField({ seed }: { seed: number }) {
  const glyphs = useMemo(() => buildField(seed), [seed]);

  return (
    <div className="hunt-field pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      {glyphs.map((g) => (
        <span
          key={g.id}
          className="hunt-field-glyph pl-at font-rounded absolute font-black"
          style={cssVars({
            "--pl-x": `${g.x}%`,
            "--pl-y": `${g.y}%`,
            "--pl-scale": `${g.size}`,
            "--pl-rotate": `${g.rotate}deg`,
            "--pl-opacity": `${g.opacity}`,
          })}
        >
          {g.letter}
        </span>
      ))}
    </div>
  );
}
