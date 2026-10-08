"use client";

import { memo } from "react";
import { Picture } from "@games/blend-read/components/PictureArt";
import { ShapeGlyph } from "@games/shape-match/components/ShapeArt";
import type { HueId } from "@games/shape-match/constants/shapes";
import { Gumdrop, Peppermint } from "@games/letter-treats/components/candy-world/CandyArt";
import { PALETTE } from "@games/letter-treats/components/candy-world/CandyDefs";
import { VOCAB_ART } from "@games/letter-treats/components/candy-world/VocabArt";
import type { Colour, Thing } from "@games/sort-two-ways/constants/boards";

/**
 * THE THINGS — and this game draws none of them. The colour a thing is drawn
 * in comes from its `colour` attribute, the same field the rule reads, so a
 * thing can never look one colour and sort as another.
 *
 *  - coloured shapes: Leo's Puzzles' `ShapeGlyph` in that game's paint;
 *  - animals and things: the portal's Twemoji `Picture`s;
 *  - sweets: Letter Treats' peppermint and gumdrop, through their own
 *    `color` prop (Letter Treats' `CandyDefs` is mounted once by the root);
 *  - shoes: Letter Treats' red trainer and the red Twemoji shoe; a blue one
 *    is the same drawing under a CSS hue filter (`.stw-tint--blue`).
 *
 * Every drawing fills its box; the board sizes the box (and a small thing's
 * box is drawn smaller — `.stw-art--small`).
 */

const SHAPE_HUE: Record<Colour, HueId> = { red: "cherry", blue: "sky", yellow: "sun" };
const SWEET_PAINT: Record<Colour, string> = {
  red: PALETTE.candyRed,
  blue: PALETTE.blueDeep,
  yellow: PALETTE.yellow,
};
const Trainer = VOCAB_ART.shoe;

function Drawing({ thing }: { thing: Thing }) {
  const colour = thing.colour ?? "red";
  switch (thing.look) {
    case "shape":
      return <ShapeGlyph piece={{ shape: thing.shape ?? "circle", hue: SHAPE_HUE[colour] }} />;
    case "peppermint":
      return <Peppermint color={SWEET_PAINT[colour]} />;
    case "gumdrop":
      return <Gumdrop color={SWEET_PAINT[colour]} />;
    case "trainer":
      return <Trainer />;
    case "sneaker":
      return <Picture id="shoe" />;
    default:
      return <Picture id={thing.look} />;
  }
}

/** One thing, filling its box. `shadow` draws it as a black silhouette — the
 *  placeholder for a thing still to come. */
export const ThingArt = memo(function ThingArt({
  thing,
  shadow = false,
}: {
  thing: Thing;
  shadow?: boolean;
}) {
  const recolour =
    thing.colour === "blue" && (thing.look === "trainer" || thing.look === "sneaker")
      ? "stw-tint--blue"
      : "";
  return (
    <span
      className={`stw-art stw-art--${thing.size ?? "full"} stw-art--${thing.look} ${
        shadow ? "stw-silhouette" : recolour
      }`}
      aria-hidden="true"
    >
      <Drawing thing={thing} />
    </span>
  );
});
