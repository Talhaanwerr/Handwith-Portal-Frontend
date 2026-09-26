"use client";

/**
 * PICTURE ART — one picture per id, for the word-matching grid.
 *
 * Every picture (`cat`, `unicorn`, `crown`, ...) is a Twemoji SVG — Twitter's
 * open-source emoji set (CC-BY 4.0, https://twemoji.twitter.com — attribution
 * required if this game is published) — served as a static file from
 * `public/games/blend-read/icons/<id>.svg`, the same "game images live under
 * public/games/<game-id>/" convention every other PlayLab game already uses.
 * Twemoji was chosen over hand-drawn art because it is professionally
 * illustrated and internally consistent across all ~70 pictures this game
 * needs — cat, cake, unicorn and crown all read as the same polished family
 * of icons, which no small set of new sketches was going to match. It is a
 * deliberate exception to reusing the portal's own pastel illustrations
 * (AnimalArt, DoorArt): mixing Twemoji's bolder outline style with the
 * portal's softer flat style in the SAME grid would look inconsistent, so
 * this game does not reuse lion/snake/whale/apple/star from those files
 * anymore even though it did in an earlier pass.
 *
 * Two exceptions still render inline:
 *   - `glue` has no Twemoji glyph, so it keeps a small hand-drawn stand-in.
 *   - `mice` reuses the single mouse-face icon three times (Twemoji has one
 *     mouse, not a crowd) so the picture still reads as plural.
 */

const ICON_BASE = "/games/blend-read/icons";

export type PictureId =
  // level 1
  | "cat"
  | "dog"
  | "sun"
  | "hat"
  | "fox"
  | "bed"
  | "cup"
  | "box"
  | "bus"
  | "hen"
  // level 2
  | "ship"
  | "frog"
  | "star"
  | "crab"
  | "plum"
  | "drum"
  | "flag"
  | "shell"
  | "nest"
  | "clam"
  // level 3
  | "cake"
  | "house"
  | "spoon"
  | "juice"
  | "mice"
  | "toes"
  | "bowl"
  | "blue"
  | "train"
  | "mouse"
  // level 4
  | "clock"
  | "thumb"
  | "cheese"
  | "queen"
  | "whale"
  | "brush"
  | "chair"
  | "crown"
  | "teeth"
  | "shoe"
  // level 5
  | "lion"
  | "snake"
  | "toys"
  | "cloud"
  | "meat"
  | "bike"
  | "cube"
  | "chef"
  | "tie"
  | "unicorn"
  // distractor pool
  | "ball"
  | "horse"
  | "bone"
  | "acorn"
  | "ruler"
  | "telephone"
  | "medal"
  | "cupcake"
  | "paper"
  | "mountain"
  | "dolphin"
  | "girl"
  | "apple"
  | "bear"
  | "family"
  | "bird"
  | "glue"
  | "trophy"
  | "spider"
  | "planet";

/** Every id EXCEPT the two special-cased below is a plain Twemoji file. */
function IconImg({ id }: { id: PictureId }) {
  return (
    <img
      src={`${ICON_BASE}/${id}.svg`}
      alt=""
      className="br-pic-img"
      draggable={false}
      aria-hidden="true"
    />
  );
}

/** No Twemoji glyph exists for "glue" — a small hand-drawn stand-in. */
function GlueArt() {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <ellipse cx="50" cy="90" rx="20" ry="4" fill="#1A1A2E" opacity="0.13" />
      <rect
        x="32"
        y="30"
        width="36"
        height="56"
        rx="6"
        fill="#5FAF3A"
        stroke="#3D8A28"
        strokeWidth="2.2"
      />
      <rect x="38" y="16" width="24" height="18" rx="3" fill="#3D8A28" />
      <rect
        x="42"
        y="8"
        width="16"
        height="10"
        rx="2"
        fill="#E8E8E8"
        stroke="#C9C2D6"
        strokeWidth="1.4"
      />
      <rect x="36" y="40" width="28" height="34" rx="3" fill="#FFFFFF" opacity="0.9" />
      <text x="50" y="60" textAnchor="middle" fontSize="13" fontWeight="900" fill="#3D8A28">
        glue
      </text>
    </svg>
  );
}

/** Twemoji has one mouse face, not a crowd — three of it, for the plural. */
function MiceArt() {
  return (
    <div className="br-pic-group" aria-hidden="true">
      <img src={`${ICON_BASE}/mice.svg`} alt="" className="br-pic-group-item" draggable={false} />
      <img src={`${ICON_BASE}/mice.svg`} alt="" className="br-pic-group-item" draggable={false} />
      <img src={`${ICON_BASE}/mice.svg`} alt="" className="br-pic-group-item" draggable={false} />
    </div>
  );
}

/** The picture for one card. */
export function Picture({ id }: { id: PictureId }) {
  if (id === "glue") return <GlueArt />;
  if (id === "mice") return <MiceArt />;
  return <IconImg id={id} />;
}
