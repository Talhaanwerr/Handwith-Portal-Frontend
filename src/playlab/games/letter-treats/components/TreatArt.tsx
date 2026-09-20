"use client";

import { VOCAB_ART } from "@games/letter-treats/components/candy-world/VocabArt";

/**
 * Word -> illustration. Every Candy ABC vocabulary word is drawn in
 * candy-world/VocabArt (one illustration family, one light). A word that has
 * no picture yet - there are none today, but data edits happen - falls back
 * to CandyToken: a styled sweet with the word's initial, so a gap reads as
 * part of the world rather than as a broken image.
 */

function CandyToken({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full">
      <circle cx="50" cy="50" r="40" fill="url(#cg-pink)" />
      <circle cx="50" cy="50" r="40" fill="url(#cg-shadow)" opacity="0.35" />
      <ellipse cx="38" cy="34" rx="8" ry="5" fill="url(#cg-spec)" />
      <text
        x="50"
        y="50"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="34"
        fontWeight="900"
        fill="#FFFFFF"
        fontFamily="Nunito, Varela Round, sans-serif"
      >
        {label.charAt(0).toUpperCase()}
      </text>
    </svg>
  );
}

/** Does a real illustration exist for this word? */
export function hasRealArt(word: string): boolean {
  return Boolean(VOCAB_ART[word]);
}

/** The picture for a vocabulary word. */
export function TreatArt({ word, label }: { word: string; label?: string }) {
  const Vocab = VOCAB_ART[word];
  if (Vocab) return <Vocab />;
  return <CandyToken label={label ?? word} />;
}
