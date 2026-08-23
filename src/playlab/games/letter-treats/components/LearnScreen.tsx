"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playClip, playSequence, preloadClips, stopVoice } from "@shared/audio/voice";
import { playClickSound } from "@shared/audio/sfx";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { letterData } from "@games/letter-treats/constants/alphabet";
import { CandyScene, Bee } from "@games/letter-treats/components/CandyScene";
import { TreatArt } from "@games/letter-treats/components/TreatArt";
import { useTreatsStore } from "@games/letter-treats/store/treatsStore";

/**
 * ALPHABET LEARN - See -> Hear -> Explore.
 *
 * ONE implementation for all 26 letters; everything on screen comes from
 * constants/alphabet.ts. There are no per-letter screens.
 *
 * The intro is choreographed from REAL audio durations rather than guessed
 * timers - the same pattern Letter Tracing uses, and for the same reason: a
 * fixed timeout either talks over itself on a slow clip or leaves dead air on
 * a fast one. playSequence resolves when a clip genuinely ends.
 *
 *   1. "The letter A."          (letter name)
 *   2. "A makes an ah sound."   (letter name + phonic sound)
 *   3. "Tap the pictures!"      (hand over to the child)
 *
 * The child can tap at any point; tapping stops the intro rather than queueing
 * behind it, because a 2-year-old who taps expects a response now.
 */
/**
 * ORBIT GEOMETRY - every number below is derived from the layout spec, and the
 * constraints are proven here rather than eyeballed. The stage is a square of
 * 88.5vmin, centred in the viewport, and every circle is a percentage of it,
 * so at a standard viewport the real sizes are:
 *
 *   letter circle  50.8% of stage = 45.0vmin   (spec: 40-50% of vmin)
 *   bubble         18.6% of stage = 16.5vmin   (spec: 15-18% of vmin)
 *   orbit radius   40.7% of stage = 36.0vmin
 *
 * Proofs against the spec:
 *   breathing room  40.7 - 25.4(centre r) - 9.3(bubble r) = 6.0% = 5.3vmin >= 4  OK
 *   bubble spacing  chord 2R sin36 = 47.8% vs 18.6% diameter - 29% clear air   OK
 *   screen margin   stage edge sits (100-88.5)/2 = 5.75vmin from the viewport  OK
 *   tap target      16.5vmin at a 320px phone = 52px >= 44px                   OK
 *
 * Five slots, 72 degrees apart, the FIRST at 12 o'clock exactly as specified.
 */
const ORBIT_RADIUS = 40.7;
const ORBIT_SLOTS: readonly { x: number; y: number }[] = Array.from({ length: 5 }, (_, i) => {
  const angle = (-90 + i * 72) * (Math.PI / 180);
  return {
    x: 50 + ORBIT_RADIUS * Math.cos(angle),
    y: 50 + ORBIT_RADIUS * Math.sin(angle),
  };
});

export function LearnScreen() {
  const { currentLetter, setScreen } = useTreatsStore();
  const data = letterData(currentLetter);
  const lower = data.letter.toLowerCase();

  const [beeMood, setBeeMood] = useState<"idle" | "cheer" | "point">("point");
  const [pulseLetter, setPulseLetter] = useState(false);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [explored, setExplored] = useState<string[]>([]);
  /** True once the intro has finished OR been interrupted by a tap. Nothing
   *  may restart the intro after this - see the tap handlers below. */
  const introDoneRef = useRef(false);

  useEffect(() => {
    const clips = [
      `letter-${lower}`,
      `phonics-${lower}`,
      ...data.vocabulary.map((v) => `treat-word-${v.id}`),
    ];
    preloadClips(clips);

    let cancelled = false;
    // Speak immediately - no entrance delay. The letter is already on screen.
    void playSequence([`letter-${lower}`, `phonics-${lower}`], 200, (i) => {
      if (cancelled) return;
      if (i === 0) setPulseLetter(true);
      if (i === 1) setBeeMood("idle");
    }).then(() => {
      if (cancelled || introDoneRef.current) return;
      introDoneRef.current = true;
      void playClip("treat-tap-pictures");
    });

    return () => {
      cancelled = true;
      introDoneRef.current = false;
      stopVoice();
    };
  }, [lower, data.vocabulary]);

  /** Tapping Aa: letter NAME then the SOUND - the distinction this game exists
   *  to teach, so it is always spoken as two separate clips, never merged. */
  const tapLetter = useCallback(() => {
    introDoneRef.current = true;
    playClickSound();
    setPulseLetter(true);
    setTimeout(() => setPulseLetter(false), 600);
    void playSequence([`letter-${lower}`, `phonics-${lower}`], 200);
  }, [lower]);

  /** Tapping a picture: "Apple. Ah - apple." Word, then sound-blended word. */
  const tapWord = useCallback((id: string) => {
    introDoneRef.current = true;
    playClickSound();
    setActiveWord(id);
    setBeeMood("cheer");
    setTimeout(() => setBeeMood("idle"), 900);
    setExplored((prev) => (prev.includes(id) ? prev : [...prev, id]));
    void playSequence([`treat-word-${id}`, `treat-blend-${id}`], 160).then(() =>
      setActiveWord(null)
    );
  }, []);

  const allExplored = explored.length >= data.vocabulary.length;

  return (
    <div className="lt-screen lt-wash relative h-full w-full overflow-hidden">
      <CandyScene />

      {/* header floats over the scene; the orbit centres on the VIEWPORT, not
          on the space left under the header - that is what makes the letter
          circle the exact focal point of the screen on every device */}
      <div className="absolute top-3 right-4 left-4 z-20 flex items-center justify-between">
        <NavPillButton
          label="Home"
          ariaLabel="Back to Letter Treats home"
          tone="plum"
          onClick={() => {
            playClickSound();
            stopVoice();
            setScreen("home");
          }}
        />
        <span className="lt-explored font-rounded font-black">
          {explored.length} / {data.vocabulary.length}
        </span>
      </div>

      {/* ── The orbit: big letter circle centre, five bubbles around it ──
          absolute inset-0 + m-auto on a fixed square = geometrically centred
          on both axes, independent of everything else on the screen */}
      <div className="lt-orbit absolute inset-0 z-10 m-auto">
        {/* centre - the letter pair, the strongest thing on screen by design */}
        <motion.button
          onClick={tapLetter}
          className="lt-letter-circle absolute flex items-center justify-center"
          whileTap={{ scale: 0.94 }}
          animate={pulseLetter ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          aria-label={`The letter ${data.letter}. Tap to hear its name and sound.`}
        >
          <span className="lt-glyph font-rounded font-black">
            {data.letter}
            {data.lower}
          </span>
        </motion.button>

        {/* satellites - one vocabulary object per orbit slot */}
        {data.vocabulary.map((w, i) => {
          const slot = ORBIT_SLOTS[i % ORBIT_SLOTS.length];
          const isExplored = explored.includes(w.id);
          return (
            <motion.button
              key={w.id}
              onClick={() => tapWord(w.id)}
              className={`lt-bubble absolute flex flex-col items-center justify-center ${
                isExplored ? "is-explored" : ""
              }`}
              style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
              initial={{ scale: 0, opacity: 0 }}
              whileTap={{ scale: 0.9 }}
              animate={
                activeWord === w.id ? { scale: [1, 1.16, 1], opacity: 1 } : { scale: 1, opacity: 1 }
              }
              transition={{ duration: 0.45, delay: activeWord ? 0 : i * 0.07 }}
              aria-label={w.label}
            >
              <span className="lt-bubble-art">
                <TreatArt word={w.id} label={w.label} />
              </span>
              <span className="lt-bubble-label font-rounded font-black">{w.label}</span>
            </motion.button>
          );
        })}
      </div>

      <p className="lt-sound-line font-rounded absolute right-0 bottom-2 left-0 z-10 text-center font-black">
        {data.letter} says <span className="lt-sound">{data.sound}</span>
      </p>

      {/* corners: Bee lower-left, action lower-right - the orbit's circular
          footprint leaves both corners free at every aspect ratio, so neither
          can ever overlap a bubble */}
      <Bee mood={beeMood} className="lt-bee-learn absolute z-10" />

      <motion.button
        onClick={() => {
          playClickSound();
          stopVoice();
          setScreen("practice");
        }}
        className="lt-primary lt-primary-corner font-rounded absolute z-10 font-black"
        animate={allExplored ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 1.4, repeat: allExplored ? Infinity : 0 }}
      >
        {allExplored ? "Let's practise!" : "Practise"}
      </motion.button>
    </div>
  );
}
