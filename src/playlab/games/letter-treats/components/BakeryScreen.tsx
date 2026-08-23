"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playClip, playSequence, preloadClips, stopVoice } from "@shared/audio/voice";
import { playClickSound, playCorrectSound, playIncorrectSound } from "@shared/audio/sfx";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { CelebrationOverlay } from "@shared/components/game/CelebrationOverlay";
import { useElementSize } from "@shared/hooks/useElementSize";
import { TREAT_ALPHABET, letterData } from "@games/letter-treats/constants/alphabet";
import { CandyScene, Bee } from "@games/letter-treats/components/CandyScene";
import { TreatArt } from "@games/letter-treats/components/TreatArt";
import { useTreatsStore } from "@games/letter-treats/store/treatsStore";

/** The bake, start to finish. Each step is one tap or one swipe - the brief
 *  asked for tactile, not for simulation physics. */
type Step = "find" | "mix" | "pour" | "bake" | "decorate" | "done";

const DECORATIONS = ["cherry", "strawberry", "icing", "blueberry"] as const;
/** Ingredients to find before mixing. Two keeps the phonics point without
 *  turning the bake into a long fetch-quest for a 3-year-old. */
const TO_FIND = 2;
const MIX_TARGET = 5;

function shuffle<T>(a: readonly T[]): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * CANDY BAKERY - Hear -> Choose -> Bake -> Reinforce.
 *
 * Mounted with key={currentLetter} by the game root, so moving to the next
 * letter REMOUNTS this screen and every piece of bake state (step, found,
 * mix count, decoration) resets to its initial value for free. That is why
 * there is no reset effect here: an effect that setState()s a pile of fields
 * on a prop change is just a remount written the long way round.
 *
 * The phonics objective stays visible the whole way through: the target letter
 * and its sound sit in the header on every step, each correct ingredient is
 * blended back ("Banana. Buh - banana."), and the finished treat is named for
 * the letter. Baking is the reward for the phonics, not a replacement for it.
 *
 * One implementation, driven by constants/alphabet.ts. Letters with no edible
 * ingredient (U, X) are excluded from the bakery run by BAKERY_LETTERS rather
 * than having a food invented for them.
 */
export function BakeryScreen({ onBack }: { onBack: () => void }) {
  const { currentLetter, setScreen, markDone, advance } = useTreatsStore();
  const data = letterData(currentLetter);
  const lower = data.letter.toLowerCase();

  const [rootRef, size] = useElementSize<HTMLDivElement>();
  const [step, setStep] = useState<Step>("find");
  const [found, setFound] = useState<string[]>([]);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [mixCount, setMixCount] = useState(0);
  const [decoration, setDecoration] = useState<string | null>(null);
  const [beeMood, setBeeMood] = useState<"idle" | "cheer" | "point">("point");

  /** The tray: the letter's own ingredients plus decoys from other letters. */
  const tray = useMemo(() => {
    const mine = shuffle(data.ingredients).slice(0, TO_FIND);
    const decoys = shuffle(TREAT_ALPHABET.filter((l) => l.letter !== data.letter))
      .flatMap((l) => l.ingredients)
      .filter((i) => !mine.includes(i));
    return shuffle([...mine, ...shuffle(decoys).slice(0, 3)]);
  }, [data]);

  const targets = useMemo(
    () => tray.filter((i) => data.ingredients.includes(i)),
    [tray, data.ingredients]
  );

  useEffect(() => {
    preloadClips([
      `letter-${lower}`,
      `phonics-${lower}`,
      "treat-bakery-intro",
      `treat-find-${lower}`,
      ...tray.map((i) => `treat-word-${i}`),
    ]);
    let cancelled = false;
    // Straight in: Bee greets and asks, with no entrance delay in front of it.
    void playSequence(["treat-bakery-intro", `treat-find-${lower}`], 180).then(() => {
      if (!cancelled) setBeeMood("idle");
    });
    return () => {
      cancelled = true;
      stopVoice();
    };
  }, [lower, tray]);

  const pick = useCallback(
    (id: string) => {
      if (step !== "find" || found.includes(id)) return;

      if (!data.ingredients.includes(id)) {
        playIncorrectSound();
        setWrongId(id);
        setTimeout(() => setWrongId(null), 520);
        void playClip("instr-try-again");
        return;
      }

      playCorrectSound();
      setBeeMood("cheer");
      setTimeout(() => setBeeMood("idle"), 900);
      const next = [...found, id];
      setFound(next);
      // Word, then the sound blended into it - the reinforcement that keeps
      // this a phonics activity rather than a cooking toy.
      void playSequence([`treat-word-${id}`, `treat-blend-${id}`], 150).then(() => {
        if (next.length >= targets.length) setStep("mix");
      });
    },
    [step, found, data.ingredients, targets.length]
  );

  const mix = useCallback(() => {
    playClickSound();
    setMixCount((c) => {
      const n = c + 1;
      if (n >= MIX_TARGET) setStep("pour");
      return n;
    });
  }, []);

  const finish = useCallback(() => {
    playClickSound();
    stopVoice();
    markDone(data.letter);
    if (advance()) setStep("find");
    else setScreen("complete");
  }, [markDone, data.letter, advance, setScreen]);

  return (
    <div
      ref={rootRef}
      className="lt-screen lt-wash-bakery relative flex h-full w-full flex-col items-center px-4 py-3"
    >
      <CandyScene />

      <div className="relative z-10 flex w-full max-w-4xl items-center justify-between">
        <NavPillButton
          label="Letters"
          ariaLabel="Back to the Letter Treat letters"
          tone="plum"
          onClick={() => {
            playClickSound();
            onBack();
          }}
        />
        {/* The phonics objective, present on EVERY step of the bake */}
        <span className="lt-bake-target font-rounded font-black">
          {data.letter}
          {data.lower} says <span className="lt-sound">{data.sound}</span>
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === "find" && (
          <motion.div
            key="find"
            className="relative z-10 flex w-full flex-1 flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="lt-question font-rounded mt-3 text-center font-black">
              Find something that starts with {data.letter}!
            </p>
            <div className="lt-tray relative mt-auto mb-auto flex w-full max-w-4xl flex-wrap items-end justify-center">
              {tray.map((id) => (
                <motion.button
                  key={id}
                  onClick={() => pick(id)}
                  className={`lt-word-btn flex flex-col items-center ${
                    found.includes(id) ? "is-used" : ""
                  }`}
                  whileTap={{ scale: 0.92 }}
                  animate={wrongId === id ? { x: [0, -10, 10, -6, 6, 0] } : { x: 0 }}
                  transition={{ duration: 0.45 }}
                  aria-label={id}
                >
                  <span className="lt-word-art">
                    <TreatArt word={id} label={id} />
                  </span>
                  <span className="lt-word-label font-rounded font-black">{id}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {step === "mix" && (
          <StepPanel
            key="mix"
            title="Mix it up!"
            hint={`Tap the bowl ${MIX_TARGET - mixCount} more times`}
            onTap={mix}
          >
            <motion.div
              className="lt-bowl"
              animate={{ rotate: [0, -8, 8, 0] }}
              transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 0.6 }}
            >
              <Bowl filled={mixCount / MIX_TARGET} />
            </motion.div>
          </StepPanel>
        )}

        {step === "pour" && (
          <StepPanel
            key="pour"
            title="Pour the batter"
            hint="Tap the tray"
            onTap={() => {
              playClickSound();
              setStep("bake");
            }}
          >
            <div className="lt-bowl">
              <Bowl filled={1} />
            </div>
          </StepPanel>
        )}

        {step === "bake" && (
          <StepPanel
            key="bake"
            title="Into the oven!"
            hint="Tap to bake"
            onTap={() => {
              playClickSound();
              void playClip(`letter-${lower}`);
              setStep("decorate");
            }}
          >
            <Oven />
          </StepPanel>
        )}

        {step === "decorate" && (
          <motion.div
            key="decorate"
            className="relative z-10 flex w-full flex-1 flex-col items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="lt-question font-rounded mt-3 text-center font-black">
              Decorate your {data.letter} cake!
            </p>
            <div className="lt-cake-stage mt-auto mb-auto flex flex-col items-center">
              <Cake letter={data.letter} decoration={decoration} />
              <div className="mt-3 flex gap-3">
                {DECORATIONS.map((d) => (
                  <motion.button
                    key={d}
                    onClick={() => {
                      playClickSound();
                      setDecoration(d);
                      setBeeMood("cheer");
                      setTimeout(() => setStep("done"), 900);
                    }}
                    className="lt-deco"
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Decorate with ${d}`}
                  >
                    <TreatArt word={d} label={d} />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Bee mood={beeMood} className="lt-bee-corner absolute z-10" />

      {step === "done" && (
        <CelebrationOverlay tintClassName="lt-celebrate-tint" size={size}>
          <div className="flex flex-col items-center gap-4">
            <Cake letter={data.letter} decoration={decoration} />
            <p className="lt-done-headline font-rounded font-black">A {data.letter} cake!</p>
            <p className="lt-done-sub font-rounded font-black">
              {data.letter} says {data.sound}
            </p>
            <button onClick={finish} className="lt-primary font-rounded font-black">
              Bake another
            </button>
          </div>
        </CelebrationOverlay>
      )}
    </div>
  );
}

/** One tactile step: a title, a hint and one big tappable thing. */
function StepPanel({
  title,
  hint,
  onTap,
  children,
}: {
  title: string;
  hint: string;
  onTap: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="relative z-10 flex w-full flex-1 flex-col items-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <p className="lt-question font-rounded mt-3 text-center font-black">{title}</p>
      <button
        onClick={onTap}
        className="lt-step-target mt-auto mb-auto flex flex-col items-center"
        aria-label={title}
      >
        {children}
        <span className="lt-hint font-rounded mt-2 font-black">{hint}</span>
      </button>
    </motion.div>
  );
}

function Bowl({ filled }: { filled: number }) {
  return (
    <svg viewBox="0 0 120 100" className="h-full w-full">
      <ellipse cx="60" cy="42" rx="44" ry="12" fill="#FFF0F6" />
      <path d="M16 42a44 30 0 0 0 88 0Z" fill="#FFFFFF" stroke="#E8C4D6" strokeWidth="3" />
      <path d="M22 46a38 24 0 0 0 76 0Z" fill="#FFD3A8" style={{ opacity: 0.35 + filled * 0.65 }} />
      <ellipse cx="60" cy="46" rx="34" ry="8" fill="#FFE0BC" opacity={filled} />
    </svg>
  );
}

function Oven() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full">
      <rect
        x="14"
        y="20"
        width="92"
        height="88"
        rx="12"
        fill="#FFC4DC"
        stroke="#E88AB0"
        strokeWidth="3"
      />
      <rect
        x="26"
        y="44"
        width="68"
        height="52"
        rx="9"
        fill="#FFF0F6"
        stroke="#E88AB0"
        strokeWidth="3"
      />
      <circle cx="40" cy="32" r="5" fill="#FFF" />
      <circle cx="58" cy="32" r="5" fill="#FFF" />
      <rect x="34" y="60" width="52" height="8" rx="4" fill="#FFD93D" />
    </svg>
  );
}

function Cake({ letter, decoration }: { letter: string; decoration: string | null }) {
  return (
    <div className="lt-cake relative">
      <svg viewBox="0 0 120 110" className="h-full w-full">
        <rect
          x="18"
          y="58"
          width="84"
          height="38"
          rx="10"
          fill="#FFD3A8"
          stroke="#E0A86E"
          strokeWidth="3"
        />
        <path d="M18 60q14 12 28 0t28 0 28 0v-8H18Z" fill="#FFF0F6" />
        <rect x="18" y="40" width="84" height="20" rx="9" fill="#FF9EC4" />
        <text
          x="60"
          y="80"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="26"
          fontWeight="900"
          fill="#8A4A66"
          fontFamily="Nunito, Varela Round, sans-serif"
        >
          {letter}
        </text>
      </svg>
      {decoration && (
        <span className="lt-cake-deco absolute">
          <TreatArt word={decoration} label={decoration} />
        </span>
      )}
    </div>
  );
}
