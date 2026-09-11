"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  ITEM_NAMES,
  answerBy,
  answerFor,
  isCorrect,
  itemName,
  paintFor,
  type DoorLevel as Level,
  type ModuleId,
} from "@games/door-count/constants/levels";
import { Door, DustMotes } from "@games/door-count/components/DoorArt";
import { Knob } from "@games/door-count/components/Knob";
import { Confetti } from "@shared/components/game/Confetti";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { registerTarget, toRootPoint } from "@shared/utils/pointer";
import { playClickSound, playCorrectSound, playIncorrectSound } from "@shared/audio/sfx";

/** How long a wrong answer shakes its head before it can be tried again. */
const SHAKE_MS = 460;
/** The doors arrive, the things drop in, and THEN the hand shows what to do
 *  — it must never talk over the reveal it is explaining. */
const HAND_AFTER_MS = 1700;

/** Where a key is born, in the level's own coordinates. */
export interface Point {
  x: number;
  y: number;
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
  onCorrect: (from: Point) => void;
}

/**
 * ONE DOOR PUZZLE.
 *
 *   THE SIGN ASKS → THE CHILD ANSWERS → THE RIGHT DOOR LIGHTS UP → A KEY
 *
 * The answer is always a door. How it is named is the only thing that
 * differs between the two modules: counting is a question about ONE door, so
 * the doors themselves are the buttons; comparing is a question about the
 * whole row, so the answer moves down to a knob per door. Either way a wrong
 * answer shakes and the door it named rattles in its frame — nothing is lost
 * and it can be tried again straight away.
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
  /** Door label → its knob, for the same reason on a comparing level. */
  const knobRefs = useRef<Map<number, HTMLElement>>(new Map());

  const answer = useMemo(() => answerFor(level), [level]);
  const byDoor = answerBy(level) === "door";

  /**
   * THE FIRST ROUND OF A MODULE TEACHES ITSELF.
   *
   * Nobody explains this game to a three-year-old, so on the first door the
   * portal's ghost hand reaches in and does it once: onto the door that holds
   * the right number, or onto the knob that names the right door, whichever
   * this module answers with. It comes in from below and to the right, the
   * way a real hand would, and loops until the child touches anything.
   */
  useEffect(() => {
    if (index !== 0 || touched) return;
    const t = setTimeout(() => {
      const el = (byDoor ? doorRefs : knobRefs).current.get(answer);
      const box = el?.getBoundingClientRect();
      if (!box) return;
      const to = toRootPoint(rootRef.current, box.left + box.width / 2, box.top + box.height / 2);
      setHand({
        fx: to.x + box.width * 0.8,
        fy: to.y + box.height * 0.6,
        tx: to.x,
        ty: to.y,
      });
    }, HAND_AFTER_MS);
    return () => clearTimeout(t);
  }, [index, touched, byDoor, answer]);

  const pick = useCallback(
    (label: number) => {
      if (solved || locked) return;
      // the child is playing now: the teaching hand has done its job
      setTouched(true);
      setHand(null);
      if (!isCorrect(level, label)) {
        playIncorrectSound();
        setWrong(label);
        schedule(() => setWrong(null), SHAKE_MS);
        return;
      }
      playClickSound();
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
              label={door.label}
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

          // COUNT: the door is the button, because the answer IS this door
          return byDoor ? (
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
          ) : (
            <motion.div
              key={door.label}
              className="dc-door-slot"
              ref={(el) => registerTarget(doorRefs.current, door.label, el)}
              {...arrive}
            >
              {art}
            </motion.div>
          );
        })}
      </div>

      {/* MORE & LESS: the answer is about the row, so it lives on the knobs */}
      {!byDoor && (
        <div className="dc-knobs" data-n={level.doors.length}>
          {level.doors.map((door) => (
            <Knob
              key={door.label}
              label={door.label}
              state={
                solved && answer === door.label ? "right" : wrong === door.label ? "wrong" : "idle"
              }
              disabled={solved || locked}
              onPick={() => pick(door.label)}
              elementRef={(el) => registerTarget(knobRefs.current, door.label, el)}
            />
          ))}
        </div>
      )}

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
