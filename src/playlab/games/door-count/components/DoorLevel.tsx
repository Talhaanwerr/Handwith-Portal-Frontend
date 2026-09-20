"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ITEM_NAMES,
  answerFor,
  isCorrect,
  itemName,
  paintFor,
  type DoorLevel as Level,
  type ModuleId,
} from "@games/door-count/constants/levels";
import { Door, DustMotes } from "@games/door-count/components/DoorArt";
import { Confetti } from "@shared/components/game/Confetti";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { registerTarget, toRootPoint, type RootPoint } from "@shared/utils/pointer";
import { playCorrectSound, playDoorOpenSound, playKnockSound } from "@shared/audio/sfx";
import { sayAfter } from "@shared/audio/voice";

/** How long a wrong answer shakes its head before it can be tried again. */
const SHAKE_MS = 460;
/** The doors arrive, the things drop in, the narrator asks the question, and
 *  THEN the hand shows what to do. On a module's first door that is two lines
 *  of narration first — the module announcing itself, then the question — and
 *  the hand's own line is queued behind them, so it can never talk over the
 *  question it is answering however long the question takes. */
const HAND_AFTER_MS = 5400;
/** How long the narrator waits before asking, so the doors have arrived. */
const ASK_AFTER_MS = 400;

/** The narrator's line for this door's sign — one recorded clip per question,
 *  named the way the manifest has named them since the game was built. */
function askClip(level: Level): string {
  if (level.ask.kind === "find") return `door-find-${level.ask.count}-${level.theme}`;
  return `door-which-${level.ask.want}-${level.theme}`;
}

/** And the module announcing itself, on its first door. */
function startClip(moduleId: ModuleId): string {
  return moduleId === "count" ? "door-start-count" : "door-start-compare";
}

interface DoorLevelProps {
  level: Level;
  moduleId: ModuleId;
  /** 0-based within the module: picks the paint for this round's doors. */
  index: number;
  /** Input is ignored while a celebration is playing over the top. */
  locked: boolean;
  /**
   * The child just got it right. The point is where the winning door is, so
   * the game can throw a key out of it.
   */
  onCorrect: (from: RootPoint) => void;
}

/**
 * ONE DOOR PUZZLE.
 *
 *   THE SIGN ASKS → THE CHILD ANSWERS → THE RIGHT DOOR LIGHTS UP → A KEY
 *
 * The answer is always a door, and the way to give it is always to touch
 * that door. Counting asks about ONE door and comparing asks about the whole
 * row, but the child's hand does the same thing either way: it goes to the
 * door it means. A door touched in error rattles in its frame — nothing is
 * lost, and it can be tried again straight away.
 *
 * The teacher and the vault are not here: they belong to the game, which
 * keeps them still while this scene slides away to the next door.
 */
export function DoorLevel({ level, moduleId, index, locked, onCorrect }: DoorLevelProps) {
  const [solved, setSolved] = useState(false);
  const [wrong, setWrong] = useState<number | null>(null);
  const schedule = useScheduler();

  /** The ghost hand showing the very first round how it is played, and
   *  whether the child has already touched something. */
  const [hand, setHand] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);
  const [touched, setTouched] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  /** Door label → its slot, so a key can fly out of the right doorway. */
  const doorRefs = useRef<Map<number, HTMLElement>>(new Map());

  const answer = useMemo(() => answerFor(level), [level]);

  /**
   * THE FIRST ROUND OF A MODULE TEACHES ITSELF.
   *
   * Nobody explains this game to a three-year-old, so on the first door the
   * portal's ghost hand reaches in and does it once: straight onto the door
   * that answers the question. It comes in from below and to the right, the
   * way a real hand would, and loops until the child touches anything.
   */
  /** THE SIGN IS READ ALOUD, once the doors have arrived — after the module
   *  has announced itself, if this is its first door. Queued, never cut. */
  useEffect(() => {
    const t = setTimeout(() => {
      if (index === 0) void sayAfter(startClip(moduleId));
      void sayAfter(askClip(level));
    }, ASK_AFTER_MS);
    return () => clearTimeout(t);
  }, [level, index, moduleId]);

  useEffect(() => {
    if (index !== 0 || touched) return;
    const t = setTimeout(() => {
      const el = doorRefs.current.get(answer);
      const box = el?.getBoundingClientRect();
      if (!box) return;
      const to = toRootPoint(rootRef.current, box.left + box.width / 2, box.top + box.height / 2);
      setHand({
        fx: to.x + box.width * 0.8,
        fy: to.y + box.height * 0.6,
        tx: to.x,
        ty: to.y,
      });
      void sayAfter("door-demo-door");
    }, HAND_AFTER_MS);
    return () => clearTimeout(t);
  }, [index, touched, answer]);

  const pick = useCallback(
    (label: number) => {
      if (solved || locked) return;
      // the child is playing now: the teaching hand has done its job
      setTouched(true);
      setHand(null);
      if (!isCorrect(level, label)) {
        // a knuckle on wood, not a buzzer: this door is simply not the one
        playKnockSound();
        setWrong(label);
        schedule(() => setWrong(null), SHAKE_MS);
        return;
      }
      playDoorOpenSound();
      playCorrectSound();
      setSolved(true);

      // where the key is born: the middle of the winning doorway
      const el = doorRefs.current.get(answer);
      const box = el?.getBoundingClientRect();
      const from = box
        ? toRootPoint(rootRef.current, box.left + box.width / 2, box.top + box.height / 2)
        : { x: 0, y: 0 };
      onCorrect(from);
    },
    [solved, locked, level, schedule, onCorrect, answer]
  );

  return (
    <div className="dc-level" ref={rootRef}>
      <DustMotes />
      <QuestionSign level={level} />

      <div className="dc-doors" data-n={level.doors.length}>
        {level.doors.map((door, i) => {
          const delay = 0.08 + i * 0.1;
          const art = (
            <Door
              count={door.count}
              paint={paintFor(moduleId, index, i)}
              theme={level.theme}
              won={solved && answer === door.label}
              rattle={wrong === door.label}
              delay={delay}
            />
          );
          const arrive = {
            initial: { y: "8%", opacity: 0 },
            animate: { y: "0%", opacity: 1 },
            transition: { delay, duration: 0.35, ease: "easeOut" as const },
          };

          // THE DOOR IS THE BUTTON, in both modules. Whether the question is
          // "find three apples" or "which door has more", the answer is a
          // door the child is already looking at — so they reach for it,
          // rather than for something underneath that stands for it.
          return (
            <motion.button
              key={door.label}
              type="button"
              className="dc-door-slot dc-door-slot--tappable"
              ref={(el) => registerTarget(doorRefs.current, door.label, el)}
              disabled={solved || locked}
              aria-label={`Door ${door.label}, ${door.count} ${itemName(level.theme, door.count)}`}
              onClick={() => pick(door.label)}
              {...arrive}
            >
              {art}
            </motion.button>
          );
        })}
      </div>

      {/* the first round of a module shows how it is played */}
      {hand && !solved && <TeachingHand {...hand} />}

      {solved && <Confetti count={38} />}
    </div>
  );
}

/**
 * The question, on a sign hanging over the corridor.
 *
 * The word or number the question turns on is the whole lesson, so it is the
 * biggest thing on the sign and it is coloured: the number in gold, MORE in
 * green, FEWER in amber. A child who cannot read the sentence can still read
 * the one part that changes.
 */
function QuestionSign({ level }: { level: Level }) {
  const question: ReactNode =
    level.ask.kind === "find" ? (
      <>
        {/* one book, not one books — the sign is read aloud to a child */}
        Find <Big word="count">{level.ask.count}</Big> {itemName(level.theme, level.ask.count)}
      </>
    ) : (
      <>
        Which door has{" "}
        <Big word={level.ask.want === "more" ? "more" : "less"}>
          {level.ask.want === "more" ? "MORE" : "FEWER"}
        </Big>{" "}
        {ITEM_NAMES[level.theme]}?
      </>
    );

  return (
    <motion.div
      className="dc-sign"
      initial={{ y: "-120%", rotate: -3 }}
      animate={{ y: "0%", rotate: 0 }}
      transition={{ type: "spring", stiffness: 160, damping: 14 }}
    >
      <span className="dc-sign-rope dc-sign-rope--l" aria-hidden="true" />
      <span className="dc-sign-rope dc-sign-rope--r" aria-hidden="true" />
      <p className="dc-sign-text font-rounded font-black">{question}</p>
    </motion.div>
  );
}

/** The word — or the number — the question turns on. */
function Big({ word, children }: { word: "more" | "less" | "count"; children: ReactNode }) {
  return (
    <strong className="dc-sign-big" data-word={word}>
      {children}
    </strong>
  );
}
