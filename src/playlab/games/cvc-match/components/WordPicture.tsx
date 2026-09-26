"use client";

import { Picture, type PictureId } from "@games/blend-read/components/PictureArt";
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
 * Both halves of the set are Twemoji (CC-BY 4.0, https://twemoji.twitter.com —
 * attribution required if this game is published), which is the point: the
 * forty new pictures were taken from the SAME set Blend & Seek already uses,
 * so a `pig` sits beside a `cat` without one of them looking hand-drawn.
 */
export function WordPicture({ word }: { word: CvcWord }) {
  if (SHARED.has(word)) return <Picture id={word as PictureId} />;
  return (
    // a static SVG of known size, the way every other game serves these
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${ICON_BASE}/${word}.svg`}
      alt=""
      className="cv-pic-img"
      draggable={false}
      aria-hidden="true"
    />
  );
}
