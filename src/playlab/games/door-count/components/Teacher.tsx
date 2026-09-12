"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** The photo lives in public/games/asset/ — see GAME_DEV.md for the rule. */
const TEACHER_PHOTO = "/games/asset/teacher.jpg";

/**
 * THE TEACHER — a real photograph of a person standing in the corridor beside
 * the doors, who jumps when the child gets it right.
 *
 * He is not in a frame and not a sticker: the photo is a drawing on white, so
 * `mix-blend-mode: multiply` (in the stylesheet) drops the white against the
 * wall behind him and leaves only the figure, and a soft shadow under his
 * shoes puts him on the floor. Nothing here may create a stacking context
 * around the image or the blend would have nothing to blend with — which is
 * why the IMAGE is the thing Framer animates, not a wrapper around it.
 *
 * If the file is missing the whole figure quietly disappears rather than
 * leaving a broken image in the corridor — the pattern Jungle Spy uses.
 */

interface TeacherProps {
  /** Mid-celebration: both feet off the ground. */
  cheer: boolean;
  /** What is in the speech bubble, if anything. */
  say?: string;
}

/** Two hops, the second smaller, and a wobble. Percentages of his own
 *  height, so the jump is the same shape at every screen size. */
const JUMP = { y: ["0%", "-20%", "0%", "-11%", "0%"], rotate: [0, -4, 4, -2, 0] };
const BREATHE = { y: ["0%", "-1.5%", "0%"], rotate: 0 };
/** The shadow tightens as he leaves the ground. */
const SHADOW_JUMP = { scaleX: [1, 0.72, 1, 0.84, 1], opacity: [1, 0.55, 1, 0.7, 1] };
const SHADOW_STILL = { scaleX: 1, opacity: 1 };

export function Teacher({ cheer, say }: TeacherProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;

  const timing = cheer
    ? { duration: 1.1, ease: "easeOut" as const }
    : { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div className="dc-teacher">
      <AnimatePresence>
        {say && (
          <motion.span
            className="dc-teacher-says font-rounded font-black"
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            {say}
          </motion.span>
        )}
      </AnimatePresence>

      <motion.span
        className="dc-teacher-shadow"
        animate={cheer ? SHADOW_JUMP : SHADOW_STILL}
        transition={timing}
        aria-hidden="true"
      />

      <motion.img
        src={TEACHER_PHOTO}
        alt="Your teacher"
        className="dc-teacher-photo"
        animate={cheer ? JUMP : BREATHE}
        transition={timing}
        onError={() => setFailed(true)}
        draggable={false}
      />
    </div>
  );
}
