"use client";

import { fluentSrc } from "@shared/constants/fluent3d";
import { Picture, animalPhoto, type PictureId } from "@games/blend-read/components/PictureArt";
import type { CvcWord } from "@games/cvc-match/constants/words";

/** The ten CVC words whose picture Blend & Seek already serves. Those are
 *  reused from that game rather than downloaded a second time; the other forty
 *  live in this game's own icon folder. */
const SHARED = new Set<string>([
  "cat",
  "hat",
  "bed",
  "hen",
  "dog",
  "fox",
  "box",
  "bus",
  "cup",
  "sun",
]);

const ICON_BASE = "/games/cvc-match/icons";

/**
 * The picture for one CVC word.
 *
 * The picture is Fluent Emoji 3D (MIT, see public/games/fluent3d/LICENSE.txt),
 * the same set Blend & Seek uses, so every word looks like it belongs to one
 * family. A word with no 3D picture falls back to its older flat file.
 */
export function WordPicture({ word }: { word: CvcWord }) {
  if (SHARED.has(word)) return <Picture id={word as PictureId} photo />;
  // real animals (a pup is a dog) are photos, like Jungle Spy's
  const photo = animalPhoto(word);
  if (photo)
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo}
        alt=""
        className="cv-pic-img cv-pic-photo"
        draggable={false}
        aria-hidden="true"
      />
    );
  return (
    // a static SVG of known size, the way every other game serves these
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={fluentSrc(word) ?? `${ICON_BASE}/${word}.svg`}
      alt=""
      className="cv-pic-img"
      draggable={false}
      aria-hidden="true"
    />
  );
}
