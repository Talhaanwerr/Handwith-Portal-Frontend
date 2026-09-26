"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SiteWorker, type WorkerPose } from "@shared/components/construction/SiteCrew";

/** What the builder is doing right now. */
export type WorkerMood = "plan" | "cheer" | "oops" | "wave";

const POSE: Record<WorkerMood, WorkerPose> = {
  // studying the site plan while the child works the maze out
  plan: "blueprint",
  cheer: "thumbsup",
  oops: "standing",
  wave: "standing",
};

/** Every move is a tween: multi-keyframe arrays never go on a spring. */
const MOVES: Record<WorkerMood, { y?: string[]; rotate?: number[] }> = {
  plan: { y: ["0%", "-1.5%", "0%"], rotate: [0, 0, 0] },
  cheer: { y: ["0%", "-16%", "0%", "-8%", "0%"], rotate: [0, -4, 4, -2, 0] },
  // a kindly head-shake: "not that one"
  oops: { y: ["0%", "0%", "0%"], rotate: [0, -6, 6, -4, 4, 0] },
  wave: { y: ["0%", "-3%", "0%"], rotate: [0, 3, -3, 0] },
};

/**
 * THE BUILDER — the shared construction crew's worker, standing on Word
 * Site's building site beside the maze and reacting to every tap: he reads
 * the site plan while the child thinks, throws a thumbs-up and jumps when a
 * number is right, and shakes his head (kindly) when it is not. The pose is
 * the drawing's own; the motion is here.
 *
 * `say` puts the recorded cheer being played in a bubble over his head —
 * the words always come from the clip, never typed twice.
 */
export function MazeWorker({ mood, say }: { mood: WorkerMood; say?: string }) {
  const still = mood === "plan" || mood === "wave";
  return (
    <div className="mz-worker">
      <AnimatePresence>
        {say && (
          <motion.span
            className="mz-says font-rounded font-black"
            initial={{ opacity: 0, y: 8, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            {say}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.div
        key={mood}
        className="mz-worker-body"
        animate={MOVES[mood]}
        transition={
          still
            ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
            : { duration: mood === "cheer" ? 1 : 0.5, ease: "easeOut" }
        }
      >
        <SiteWorker className="mz-worker-svg" pose={POSE[mood]} />
      </motion.div>
    </div>
  );
}
