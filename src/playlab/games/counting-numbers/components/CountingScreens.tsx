"use client";

import { motion } from "framer-motion";
import { Character, CHARACTER_NAMES } from "@games/counting-numbers/components/Characters";
import { Thing, ANT_COLORS } from "@games/counting-numbers/components/CountingArt";
import { StarBurst } from "@games/counting-numbers/components/Placement";
import type { CharacterId } from "@games/counting-numbers/constants/levels";
import { Confetti } from "@shared/components/game/Confetti";
import { cssVars } from "@shared/styles/cssVars";

/**
 * The screens around the levels: the title, the friend who pops up between
 * levels, the pause sheet, and the summary at the end.
 */

/** TITLE — the name of the game over five ants, Pip waving from the corner,
 *  and a strip below. Tap anywhere to begin. */
export function TitleScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="cn-title cn-scene--field">
      <button type="button" className="cn-tap" onClick={onStart} aria-label="Start" />
      <motion.div
        className="cn-friend cn-title-friend"
        initial={{ y: "40%", opacity: 0 }}
        animate={{ y: ["0%", "-3%", "0%"], opacity: 1 }}
        transition={{
          opacity: { duration: 0.4, delay: 0.5 },
          y: { duration: 2.4, delay: 0.5, repeat: Infinity, ease: "easeInOut" },
        }}
        aria-hidden="true"
      >
        <Character id="pip" pose="wave" />
      </motion.div>
      <span className="cn-title-badge font-rounded font-black">
        <span className="cn-title-badge-top">123</span>
        <span className="cn-title-badge-sign">PLAYLAB</span>
      </span>
      <motion.h1
        className="cn-title-heading font-rounded font-black"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
      >
        Numbers 1 - 5
      </motion.h1>
      <div className="cn-title-ants" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n, i) => (
          <motion.span
            key={n}
            className="cn-title-ant"
            style={cssVars({ "--pl-color": ANT_COLORS[i] })}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.08, type: "spring", stiffness: 240, damping: 18 }}
          >
            <span className="cn-title-ant-number font-rounded font-black">{n}</span>
            <span className="cn-title-ant-thing">
              <Thing theme="ant" />
            </span>
          </motion.span>
        ))}
      </div>
      <span className="cn-title-strip font-rounded font-black">Counting Numbers 1-5</span>
    </div>
  );
}

/** A friend rises up from below the screen to cheer, waves, and drops away
 *  again while the screen stays dimmed. */
export function CelebrationBreak({ id }: { id: CharacterId }) {
  return (
    <motion.div
      className="cn-break"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-label={`${CHARACTER_NAMES[id]} is cheering!`}
    >
      <Confetti count={40} />
      <StarBurst delay={0.6} />
      <motion.div
        className="cn-break-friend"
        initial={{ y: "110%" }}
        animate={{ y: ["110%", "0%", "-8%", "0%", "0%", "110%"] }}
        transition={{ duration: 2.3, times: [0, 0.28, 0.42, 0.55, 0.75, 1], ease: "easeInOut" }}
      >
        <motion.div
          className="h-full w-full"
          animate={{ rotate: [0, -6, 6, -6, 6, 0] }}
          transition={{ delay: 0.7, duration: 1.0, ease: "easeInOut" }}
        >
          <Character id={id} pose="cheer" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

/** PAUSED — everything under it waits. One big way back in. */
export function PauseSheet({ onResume }: { onResume: () => void }) {
  return (
    <motion.div
      className="cn-pause"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button type="button" className="cn-pause-play" onClick={onResume} aria-label="Play">
        <svg viewBox="0 0 40 40" className="h-full w-full" aria-hidden="true">
          <path d="M13 8 L32 20 L13 32 Z" fill="#FFFFFF" />
        </svg>
      </button>
    </motion.div>
  );
}

/** THE END — what was learned, stars from the middle, confetti all the way
 *  down, and the whole cast dancing. Tap anywhere to play again. */
export function FinalScreen({ onAgain }: { onAgain: () => void }) {
  return (
    <div className="cn-final">
      <button type="button" className="cn-tap" onClick={onAgain} aria-label="Play again" />
      <StarBurst delay={0.3} />
      <Confetti count={48} />
      <span className="cn-title-badge font-rounded font-black">
        <span className="cn-title-badge-top">123</span>
        <span className="cn-title-badge-sign">PLAYLAB</span>
      </span>
      <motion.h1
        className="cn-final-heading font-rounded font-black"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 16 }}
      >
        We learned about
        <br />
        numbers and counting!
      </motion.h1>
      <div className="cn-final-cast" aria-hidden="true">
        {(["momo", "dot", "pip", "rusty"] as const).map((id, i) => (
          <motion.span
            key={id}
            className={`cn-final-friend cn-final-friend--${id}`}
            animate={{ y: [0, -10, 0], rotate: [0, i % 2 ? 4 : -4, 0] }}
            transition={{ duration: 1.1 + i * 0.15, repeat: Infinity, ease: "easeInOut" }}
          >
            <Character id={id} pose="cheer" />
          </motion.span>
        ))}
      </div>
    </div>
  );
}
