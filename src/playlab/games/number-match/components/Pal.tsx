"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/**
 * THE FRIEND.
 *
 * One character, a real picture of them, standing in the scene beside the
 * cards — not a badge, not an avatar in a bubble. There is no frame, no
 * circle crop and no panel behind them: the picture is drawn on white, so
 * `mix-blend-mode: multiply` (in the stylesheet) drops that white against
 * the sky and leaves only the figure, and a soft shadow under them puts them
 * on the ground.
 *
 * Nothing here may create a stacking context around the image or the blend
 * would have nothing to blend with — which is why the IMAGE is the thing
 * Framer animates, never a wrapper around it.
 *
 * The file is dropped in by hand, so a missing one must not leave a broken
 * picture on screen: the whole figure quietly disappears instead.
 */

/** The photo lives in public/games/asset/ — see GAME_DEV.md for the rule.
 *  One line to swap if the friend ever changes. */
const PHOTO = "/games/asset/ch2.jpg";
const NAME = "Your friend";

interface PalProps {
  /** Mid-celebration: both feet off the ground. */
  cheer: boolean;
  /** What is in the speech bubble, if anything. */
  say?: string;
  /** Bigger, for a screen where the friend IS the picture. */
  big?: boolean;
}

/** Two hops, the second smaller, and a wobble. Percentages of their own
 *  height, so the jump is the same shape at every screen size. */
const JUMP = { y: ["0%", "-18%", "0%", "-9%", "0%"], rotate: [0, -5, 5, -2, 0] };
const BREATHE = { y: ["0%", "-1.6%", "0%"], rotate: [0, 0.6, 0] };
/** The shadow tightens as they leave the ground. */
const SHADOW_JUMP = { scaleX: [1, 0.7, 1, 0.84, 1], opacity: [1, 0.5, 1, 0.7, 1] };
const SHADOW_STILL = { scaleX: [1, 1.03, 1], opacity: 1 };

export function Pal({ cheer, say, big }: PalProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  const timing = cheer
    ? { duration: 1.1, ease: "easeOut" as const }
    : { duration: 3.4, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className="nm-pal" data-big={big ? "yes" : undefined}>
      <AnimatePresence>
        {say && (
          <motion.span
            className="nm-pal-says font-rounded font-black"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            {say}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.span
        className="nm-pal-shadow"
        animate={cheer ? SHADOW_JUMP : SHADOW_STILL}
        transition={timing}
        aria-hidden="true"
      />

      <motion.img
        src={PHOTO}
        alt={NAME}
        className="nm-pal-photo"
        animate={cheer ? JUMP : BREATHE}
        transition={timing}
        onError={() => setFailed(true)}
        draggable={false}
      />
    </div>
  );
}
