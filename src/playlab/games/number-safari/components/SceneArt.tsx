"use client";

import { Picture } from "@games/blend-read/components/PictureArt";
import { Thing as CountingThing } from "@games/counting-numbers/components/CountingArt";
import type { Theme } from "@games/number-safari/constants/levels";

/**
 * THE THINGS THIS GAME COUNTS — and it draws none of them.
 *
 * `ant` is Numbers 1 – 5's own ant, imported rather than redrawn, because the
 * ants-on-a-leaf screen is the one this game was asked to carry over and a
 * second ant that was almost the same would be the worse of two ants.
 * Everything else is one of the seventy Twemoji pictures Blend & Seek already
 * serves from `public/games/blend-read/icons/` — professionally drawn, all in
 * one family, and already paid for in bytes the moment that game loaded.
 *
 * Both arrive as different elements (`<svg>` from one, `<img>` from the other)
 * carrying the OTHER games' class names, so the sizing lives on the wrapper
 * here — `.ns-thing :is(svg, img)` in this game's stylesheet — and neither
 * import has to be trusted to stay the size it is today.
 */
export function Thing({ theme, index = 0 }: { theme: Theme; index?: number }) {
  return (
    <span className="ns-thing">
      {theme === "ant" ? <CountingThing theme="ant" index={index} /> : <Picture id={theme} />}
    </span>
  );
}

/** One piece of the star shower that ends a level. */
export function Spark() {
  return (
    <svg viewBox="0 0 24 24" className="ns-spark" aria-hidden="true">
      <path
        d="M12 1 L14.6 8.6 L22.4 9.2 L16.4 14.2 L18.3 21.8 L12 17.6 L5.7 21.8 L7.6 14.2 L1.6 9.2 L9.4 8.6 Z"
        fill="#F6C544"
      />
      <path d="M12 5 L13.6 9.8 L18.4 10.2 L14.6 13.4 L15.8 18 L12 15.4 Z" fill="#FFE59A" />
    </svg>
  );
}
