"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { playSequence, preloadClips, stopVoice } from "@shared/audio/voice";
import { playClickSound } from "@shared/audio/sfx";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { CASE_SEPARATOR, letterData } from "@games/letter-treats/constants/alphabet";
import { CandyScene, Bee } from "@games/letter-treats/components/CandyScene";
import { TreatArt } from "@games/letter-treats/components/TreatArt";
import { HandDemo, HAND_DEMO_MS, HAND_TAP_AT_MS } from "@games/letter-treats/components/HandDemo";
import { Sparkle, CANDY } from "@games/letter-treats/components/candy-world/CandyArt";

/** Gap between "A" and "A says ah" - long enough to hear them as two ideas. */
const NAME_SOUND_GAP_MS = 220;
/** Gap between "apple" and "ah... apple". */
const WORD_BLEND_GAP_MS = 160;
const LETTER_PULSE_MS = 600;
const BEE_CHEER_MS = 900;
/** Breath between the intro finishing and the hand appearing. */
const DEMO_DELAY_MS = 500;
const SPARKLE_COLOURS = [
  CANDY.white,
  CANDY.vanilla,
  CANDY.pinkLight,
  CANDY.cyan,
  CANDY.white,
  CANDY.lavenderLight,
];

interface LetterScreenProps {
  letter: string;
  onBack: () => void;
  /** Hand over to the challenge for this letter. */
  onPlay: () => void;
}

/**
 * LETTER SCREEN - one big letter, five things that start with it.
 *
 * Audio (recorded clips only, led by REAL clip ends, never timers):
 *   open     -> "A."  "A says ah."
 *   tap Aa   -> "A."  "A says ah."
 *   tap word -> "apple."  "ah... apple."
 * Nothing else talks on this screen.
 *
 * Hand demonstration: after the intro, a hand glides onto the first picture
 * and taps it; the picture responds exactly as it would for the child, then
 * the hand fades. It runs once, never blocks - the child's first tap anywhere
 * removes it.
 *
 * Composition: letter centred, five pictures in fixed slots around it, the
 * Practice action centred at the bottom with Bee beside it, on the calm
 * backdrop (sky + hills only). Mounted with key={letter} by the router.
 */
export function LetterScreen({ letter, onBack, onPlay }: LetterScreenProps) {
  const data = letterData(letter);
  const lower = data.lower;

  const [beeMood, setBeeMood] = useState<"idle" | "cheer" | "point">("point");
  const [pulseLetter, setPulseLetter] = useState(false);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [explored, setExplored] = useState<string[]>([]);
  const [celebrate, setCelebrate] = useState(false);
  const [demo, setDemo] = useState<"waiting" | "running" | "done">("waiting");
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const allExplored = explored.length >= data.vocabulary.length;

  const later = useCallback((fn: () => void, ms: number) => {
    timersRef.current.push(setTimeout(fn, ms));
  }, []);

  /** The one response a picture has - used by the child AND by the hand demo.
   *  A plain function (the React Compiler memoizes it); the demo effect reads
   *  it through a ref so it never re-runs when state changes. */
  const respond = (id: string) => {
    setActiveWord(id);
    setBeeMood("cheer");
    later(() => setBeeMood("idle"), BEE_CHEER_MS);
    setExplored((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      if (next.length === data.vocabulary.length) {
        later(() => setCelebrate(true), 600);
        later(() => setCelebrate(false), 2400);
      }
      return next;
    });
    void playSequence([`treat-word-${id}`, `treat-blend-${id}`], WORD_BLEND_GAP_MS).then(() =>
      setActiveWord((cur) => (cur === id ? null : cur))
    );
  };
  const respondRef = useRef(respond);
  useEffect(() => {
    respondRef.current = respond;
  });

  // Intro: speak at once, then hand over to the demonstration.
  useEffect(() => {
    preloadClips([
      `letter-${lower}`,
      `phonics-${lower}`,
      ...data.vocabulary.flatMap((v) => [`treat-word-${v.id}`, `treat-blend-${v.id}`]),
    ]);
    let cancelled = false;
    void playSequence([`letter-${lower}`, `phonics-${lower}`], NAME_SOUND_GAP_MS, (i) => {
      if (cancelled) return;
      setPulseLetter(i === 0);
      if (i === 1) setBeeMood("idle");
    }).then(() => {
      if (cancelled) return;
      setPulseLetter(false);
      later(() => setDemo((d) => (d === "waiting" ? "running" : d)), DEMO_DELAY_MS);
    });
    const timers = timersRef.current;
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      timers.length = 0;
      stopVoice();
    };
  }, [lower, data.vocabulary, later]);

  // The demonstration: the hand "taps" the first picture at HAND_TAP_AT_MS.
  const demoWord = data.vocabulary[0].id;
  useEffect(() => {
    if (demo !== "running") return;
    const tap = setTimeout(() => respondRef.current(demoWord), HAND_TAP_AT_MS);
    const end = setTimeout(() => setDemo("done"), HAND_DEMO_MS);
    return () => {
      clearTimeout(tap);
      clearTimeout(end);
    };
  }, [demo, demoWord]);

  /** Any real tap ends the demonstration immediately. */
  const endDemo = () => setDemo("done");

  const tapLetter = () => {
    endDemo();
    setPulseLetter(true);
    later(() => setPulseLetter(false), LETTER_PULSE_MS);
    void playSequence([`letter-${lower}`, `phonics-${lower}`], NAME_SOUND_GAP_MS);
  };

  const tapWord = (id: string) => {
    endDemo();
    respond(id);
  };

  return (
    <div className="lt-screen lt-wash relative h-full w-full overflow-hidden">
      <CandyScene variant="calm" />

      <NavPillButton
        label="Letters"
        ariaLabel="Back to the alphabet"
        tone="plum"
        pinned
        onClick={() => {
          playClickSound();
          stopVoice();
          onBack();
        }}
      />

      <div className="ab-stage absolute z-10">
        <motion.button
          onClick={tapLetter}
          className="ab-letter absolute flex items-center justify-center"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={pulseLetter ? { scale: [1, 1.08, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
          transition={{ duration: pulseLetter ? 0.5 : 0.45, ease: [0.22, 1, 0.36, 1] }}
          whileTap={{ scale: 0.94 }}
          aria-label={`The letter ${data.letter}. Tap to hear its name and sound.`}
        >
          <span className="ab-letter-glow" aria-hidden="true" />
          {/* "A / a", not "Aa". The pair is split into three elements rather
              than one text node because the candy treatment is built from two
              pseudo-element copies of `attr(data-letter)` — a rim behind and a
              gloss in front. One text node would force the separator through
              that same treatment at full letter size, which both dominates the
              pair and makes the string wide enough to overflow a phone. Each
              case carries its own data-letter, so both keep the full effect,
              and the slash is styled independently as the quiet divider it is. */}
          <span className="ab-glyph font-rounded font-black">
            <span className="ab-glyph-part" data-letter={data.letter}>
              {data.letter}
            </span>
            <span className="ab-glyph-sep" aria-hidden="true">
              {CASE_SEPARATOR}
            </span>
            <span className="ab-glyph-part" data-letter={lower}>
              {lower}
            </span>
          </span>
          <AnimatePresence>
            {celebrate && (
              <span className="ab-burst" aria-hidden="true">
                {SPARKLE_COLOURS.map((c, i) => (
                  <motion.span
                    key={i}
                    className={`ab-burst-spark ab-burst-spark-${i + 1}`}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.2, 0.9, 0], opacity: [0, 1, 1, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.6, delay: i * 0.08, ease: "easeOut" }}
                  >
                    <Sparkle color={c} />
                  </motion.span>
                ))}
              </span>
            )}
          </AnimatePresence>
        </motion.button>

        {data.vocabulary.map((w, i) => {
          const isActive = activeWord === w.id;
          const isExplored = explored.includes(w.id);
          return (
            <motion.button
              key={w.id}
              onClick={() => tapWord(w.id)}
              className={`ab-object ab-slot-${i + 1} absolute flex flex-col items-center justify-center ${
                isExplored ? "is-explored" : ""
              }`}
              initial={{ scale: 0, opacity: 0 }}
              animate={isActive ? { scale: [1, 1.14, 1], opacity: 1 } : { scale: 1, opacity: 1 }}
              transition={
                isActive
                  ? { duration: 0.45 }
                  : { duration: 0.45, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }
              }
              whileTap={{ scale: 0.9 }}
              aria-label={w.label}
            >
              <span className={`ab-object-plate ${isActive ? "is-active" : ""}`}>
                <span className="ab-object-art">
                  <TreatArt word={w.id} label={w.label} />
                </span>
              </span>
              <span className="ab-object-label font-rounded font-black">{w.label}</span>
            </motion.button>
          );
        })}

        {/* the hand sits in the first picture's slot and taps it */}
        <AnimatePresence>
          {demo === "running" && (
            <div className="ab-hand-anchor ab-slot-1 absolute" aria-hidden="true">
              <HandDemo />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* action row: Bee points at Practice, centred under the content */}
      <div className="ab-action absolute z-10 flex items-end justify-center">
        <Bee mood={beeMood} className="ab-action-bee" />
        <motion.button
          onClick={() => {
            playClickSound();
            stopVoice();
            onPlay();
          }}
          className="lt-go font-rounded flex items-center gap-3 font-black"
          animate={allExplored ? { scale: [1, 1.08, 1] } : { scale: 1 }}
          transition={{ duration: 1.2, repeat: allExplored ? Infinity : 0 }}
          whileTap={{ scale: 0.92 }}
          aria-label={`Go - play the ${data.letter} game`}
        >
          <span className="lt-go-icon" aria-hidden="true">
            <Sparkle color={CANDY.white} />
          </span>
          GO
        </motion.button>
      </div>
    </div>
  );
}
