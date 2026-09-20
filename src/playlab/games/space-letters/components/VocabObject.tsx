"use client";

import { useState } from "react";
import { ANCHOR_ART, getLetterWord, objectPhotoPath } from "@games/space-letters/constants/vocab";

/**
 * The object beside the puzzle — a real photo where one exists, the pastel
 * SVG illustration where it does not.
 *
 * Same photo-first contract as letter-tracing's AnchorWordCard, including
 * the remount-on-letter key: without it, one failed image would leave
 * `photoFailed` stuck true and push every later letter onto SVG for the
 * rest of the session.
 */
export function VocabObject({ letter }: { letter: string }) {
  return <VocabObjectInner key={letter.toUpperCase()} letter={letter} />;
}

function VocabObjectInner({ letter }: { letter: string }) {
  const key = letter.toUpperCase();
  const Art = ANCHOR_ART[key];
  const word = getLetterWord(letter);
  const [photoFailed, setPhotoFailed] = useState(false);

  if (!word) return null;

  return (
    <div className="sap-object" role="img" aria-label={`${word} — the word for this letter`}>
      <div className="sap-object-img">
        {!photoFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={objectPhotoPath(word)}
            alt=""
            className="h-full w-full rounded-2xl object-cover"
            onError={() => setPhotoFailed(true)}
            draggable={false}
          />
        ) : (
          Art && <Art />
        )}
      </div>
      <p className="sap-object-word font-rounded font-black">{word}</p>
    </div>
  );
}
