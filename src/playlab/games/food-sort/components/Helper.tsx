"use client";

import { motion } from "framer-motion";
import { Picture } from "@games/blend-read/components/PictureArt";
import { FoodArt } from "@games/food-sort/components/FoodArt";

interface HelperProps {
  /** A thing just landed right: a hop. */
  cheer: boolean;
  /** The apple table is done: the chef tastes one. */
  eating?: boolean;
}

/** Breathing while the child works; a hop when something lands right; a
 *  chew when he tastes. Tweens throughout — a spring takes two keyframes. */
const BREATHE = { y: ["0%", "-2%", "0%"], scaleY: [1, 1, 1] };
const HOP = { y: ["0%", "-12%", "0%"], scaleY: [1, 1, 1] };
const CHEW = { y: ["0%", "0%", "0%"], scaleY: [1, 0.93, 1] };

/**
 * THE CHEF — the kitchen's own grown-up, standing at the table while the
 * child sorts. He is Blend & Seek's chef picture (the same Twemoji family as
 * the rest of the portal's pictures), so no new artwork. On the apple table
 * he tastes one at the end: the apple flies from above into his mouth and he
 * chews — the reference's big eating moment, done with what already ships.
 *
 * Decorative: the board says everything in pictures and sounds, so he is
 * aria-hidden and never takes a tap.
 */
export function Helper({ cheer, eating = false }: HelperProps) {
  const motionNow = eating ? CHEW : cheer ? HOP : BREATHE;
  return (
    <div className="sf-helper" aria-hidden="true">
      <motion.div
        className="sf-helper-body"
        animate={motionNow}
        transition={
          eating
            ? { duration: 0.3, delay: 0.6, repeat: 2, ease: "easeInOut" }
            : cheer
              ? { duration: 0.6, ease: "easeOut" }
              : { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
        }
      >
        <Picture id="chef" />
      </motion.div>

      {eating && (
        // from above his head into his mouth, then gone
        <motion.span
          className="sf-helper-snack"
          initial={{ x: "120%", y: "-230%", scale: 1, opacity: 1 }}
          animate={{ x: "0%", y: "0%", scale: 0, opacity: [1, 1, 0] }}
          transition={{ duration: 0.7, ease: "easeIn" }}
        >
          <FoodArt art="apple-red" />
        </motion.span>
      )}
    </div>
  );
}
