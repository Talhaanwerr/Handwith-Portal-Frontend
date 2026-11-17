"use client";

import { motion } from "framer-motion";
import { clipText } from "@shared/audio/voice";
import { LinedUpScene } from "@games/burj-towers/components/TowerMinis";
import { LINED_CLIP } from "@games/burj-towers/constants/rounds";

/**
 * THE PICTURE TO COPY — Line Them Up's little instant photo, pinned in the
 * top-right corner of the stage under the Back to Games pill: a white frame
 * with the thick bottom border, slightly tilted, a strip of tape on top, and
 * in it the round's own three towers (their heights and the gold one)
 * already standing on the stand short to tall. It drops in as the round
 * starts and never takes a touch. Placed by `.bjt-polaroid` (burj-towers.css),
 * always clear of the towers, the places and the pills.
 */
export function Polaroid({ row, gold }: { row: readonly number[]; gold: number }) {
  const order = [0, 1, 2].sort((i, j) => row[i] - row[j]);
  return (
    <motion.div
      className="bjt-polaroid"
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 190, damping: 17, delay: 0.25 }}
      role="img"
      aria-label={`The picture to copy: ${clipText(LINED_CLIP)}`}
    >
      <span className="bjt-polaroid-tilt">
        <span className="bjt-polaroid-photo">
          <LinedUpScene
            heights={order.map((i) => row[i])}
            gold={order.indexOf(gold)}
            skyId="bjt-polaroid-sky"
          />
        </span>
        <span className="bjt-polaroid-tape" aria-hidden="true" />
      </span>
    </motion.div>
  );
}
