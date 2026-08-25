"use client";

import { motion } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { playClickSound } from "@shared/audio/sfx";
import { useDinoStore, type LetterCase } from "@games/dino-dig/store/dinoStore";
import { DinoBackdrop } from "@games/dino-dig/components/DinoBackdrop";

/**
 * BIG LETTERS / small letters — the same two-plate case picker Space ABC and
 * Ocean ABC open with, dressed for the dino world. Both modes pass through
 * it: feed goes straight to play from here, River Crossing goes on to its
 * Start-from-A / Continue doorway.
 *
 * The choice is display-only downstream: every data structure and audio clip
 * id stays canonical uppercase, and each surface renders the chosen case.
 */
export function DinoCaseSelect() {
  const { mode, setScreen, pickCase } = useDinoStore();

  const pick = (c: LetterCase) => {
    playClickSound();
    pickCase(c);
  };

  const options: { c: LetterCase; title: string; preview: string; aria: string }[] = [
    { c: "upper", title: "BIG LETTERS", preview: "ABC", aria: "Play with big letters" },
    { c: "lower", title: "small letters", preview: "abc", aria: "Play with small letters" },
  ];

  return (
    <div className="dd-bg relative flex h-full w-full flex-col items-center justify-center gap-7 overflow-y-auto px-6 py-8">
      <DinoBackdrop />

      <NavPillButton
        label="Back"
        ariaLabel="Back to the game picker"
        tone="dino"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          setScreen("splash");
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center gap-1 text-center"
        initial={{ y: -12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <h1 className="font-rounded text-3xl font-black text-white drop-shadow-md md:text-5xl">
          Which letters?
        </h1>
        <p className="font-rounded text-dino-ink mt-1 rounded-full bg-white/85 px-4 py-1 text-xs font-bold md:text-sm">
          {mode === "stones" ? "For your river crossing" : "For your hungry dinos"}
        </p>
      </motion.div>

      <div className="relative z-10 flex flex-wrap items-center justify-center gap-6">
        {options.map((o, i) => (
          <motion.button
            key={o.c}
            onClick={() => pick(o.c)}
            className={`dd-case-btn dd-case-btn--${o.c} flex flex-col items-center justify-center gap-2`}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.12 + i * 0.08, type: "spring", stiffness: 260, damping: 20 }}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.04 }}
            aria-label={o.aria}
          >
            <span className="dd-case-preview font-rounded font-black">{o.preview}</span>
            <span className="dd-case-title font-rounded font-black">{o.title}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
