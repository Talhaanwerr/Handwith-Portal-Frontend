"use client";

import { memo } from "react";
import { wordSrc, type Word } from "@games/rhyme-or-not/constants/words";
import { animalPhoto } from "@games/blend-read/components/PictureArt";

/** Animals shown as the portal's real photos. Not mouse: its photo is the
 *  rat's, and both words are in the rhyme games. */
const photoOf = (w: Word) => (w === "mouse" ? null : animalPhoto(w));

/** One rhyme word's picture, filling its box: a real photo for an animal,
 *  else Fluent 3D. Shared by the rhyme games. */
export const RhymePic = memo(function RhymePic({ word }: { word: Word }) {
  const photo = photoOf(word);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={photo ?? wordSrc(word)}
      alt=""
      className={`ryn-pic-img ${photo ? "ryn-pic-img--photo" : ""}`}
      draggable={false}
      aria-hidden="true"
    />
  );
});
