"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/**
 * The photo lives in public/games/asset/ — see GAME_DEV.md for the rule.
 *
 * This is a TRIMMED copy of the supplied `bigsmall.webp`: the original is a
 * 677×369 canvas whose character only occupies 277×336 of it, so nearly sixty
 * percent of its width is transparent. Sized by its box he came out looking
 * tiny no matter how wide the box was, because most of the box was empty. The
 * original file is left untouched beside this one.
 */
const PAL_PHOTO = "/games/asset/bigsmall-trimmed.png";

/**
 * THE PAL who stands between the two boards.
 *
 * He is the reference's presenter: not a decoration off to one side but the
 * thing IN the middle of the comparison, so a child's eye crosses him going
 * from one board to the other. He bobs while they work and hops when something
 * lands right.
 *
 * Same contract as Key Quest's teacher, for the same reason: if the file is
 * missing he disappears rather than leaving a broken image between the boards,
 * and the IMAGE is what Framer animates so nothing wraps it in a stacking
 * context.
 */
const HOP = { y: ["0%", "-14%", "0%", "-7%", "0%"], rotate: [0, -4, 4, -2, 0] };
const BREATHE = { y: ["0%", "-2%", "0%"], rotate: 0 };

export function BigSmallPal({ cheer }: { cheer: boolean }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  return (
    <motion.img
      src={PAL_PHOTO}
      alt=""
      className="so-pal-photo"
      animate={cheer ? HOP : BREATHE}
      // multi-keyframe arrays are a tween; a spring takes two keyframes only
      transition={
        cheer
          ? { duration: 1, ease: "easeOut" }
          : { duration: 3.4, repeat: Infinity, ease: "easeInOut" }
      }
      onError={() => setFailed(true)}
      draggable={false}
      aria-hidden="true"
    />
  );
}
