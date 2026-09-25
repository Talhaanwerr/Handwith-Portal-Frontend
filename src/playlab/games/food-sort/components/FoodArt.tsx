"use client";

import { VOCAB_ART } from "@games/letter-treats/components/candy-world/VocabArt";
import { Thing as CountingThing } from "@games/counting-numbers/components/CountingArt";
import { ShapeGlyph } from "@games/shape-match/components/ShapeArt";
import type { ShapeId } from "@games/shape-match/constants/shapes";
import type { ArtId } from "@games/food-sort/constants/activities";

/**
 * THE PICTURES — and this game draws none of them.
 *
 *  - The fruit is Letter Treats' vocabulary art (it needs that game's
 *    `CandyDefs` gradients mounted once, which the game root does).
 *  - The green apple is Numbers 1 – 5's.
 *  - Cookies and blue shapes are Leo's Puzzles' shapes: a blue shape is the
 *    sky paint, a cookie is the same outline in baked-orange paint with a few
 *    chocolate chips dropped on it — so a triangle cookie and a blue triangle
 *    are the SAME triangle, which is the point of the shapes round.
 *
 * Every drawing fills its box; the board decides how big it is.
 */

/** Where the chips sit on each cookie, inside Leo's 40 x 40 shape box. */
const CHIPS: Record<"circle" | "square" | "triangle" | "rectangle", readonly [number, number][]> = {
  circle: [
    [14, 15],
    [24, 13],
    [20, 22],
    [13, 26],
    [27, 25],
  ],
  square: [
    [13, 14],
    [25, 13],
    [19, 21],
    [12, 27],
    [27, 26],
  ],
  triangle: [
    [20, 18],
    [14, 28],
    [25, 27],
  ],
  rectangle: [
    [10, 17],
    [20, 15],
    [29, 18],
    [15, 24],
    [26, 24],
  ],
};

function Cookie({ shape }: { shape: keyof typeof CHIPS }) {
  return (
    <span className="sf-art-stack">
      <ShapeGlyph piece={{ shape: shape as ShapeId, hue: "mango" }} />
      <svg viewBox="0 0 40 40" className="sf-art-chips" aria-hidden="true">
        {CHIPS[shape].map(([x, y]) => (
          <ellipse key={`${x}-${y}`} cx={x} cy={y} rx="2.1" ry="1.7" fill="#6B3A1E" />
        ))}
      </svg>
    </span>
  );
}

export function FoodArt({ art }: { art: ArtId }) {
  switch (art) {
    case "apple-green":
      return <CountingThing theme="apple" />;
    case "cookie-round":
      return <Cookie shape="circle" />;
    case "cookie-square":
      return <Cookie shape="square" />;
    case "cookie-triangle":
      return <Cookie shape="triangle" />;
    case "cookie-rectangle":
      return <Cookie shape="rectangle" />;
    case "shape-circle":
      return <ShapeGlyph piece={{ shape: "circle", hue: "sky" }} />;
    case "shape-square":
      return <ShapeGlyph piece={{ shape: "square", hue: "sky" }} />;
    case "shape-triangle":
      return <ShapeGlyph piece={{ shape: "triangle", hue: "sky" }} />;
    case "shape-rectangle":
      return <ShapeGlyph piece={{ shape: "rectangle", hue: "sky" }} />;
    default: {
      const Draw = VOCAB_ART[art === "apple-red" ? "apple" : art];
      return Draw ? <Draw /> : null;
    }
  }
}
