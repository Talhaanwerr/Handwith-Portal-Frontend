"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText } from "@shared/audio/voice";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { ALL_COUNT, TRY, allClip, nameClip } from "@games/shape-lesson/constants/lessons";
import { MshWorld } from "@games/shape-lesson/components/MshWorld";
import { ShapeArt } from "@games/shape-lesson/components/ShapeArt";
import {
  boxClass,
  sayNow,
  useLesson,
  useMisses,
  useOpening,
  usePageHand,
} from "@games/shape-lesson/components/lessonKit";

/**
 * Page 3 — TAP THEM ALL. Five shapes scattered over the scene, three of them
 * the lesson's (different colours and sizes). "Tap all the circles!" Each
 * circle tapped says its name and pops into the star counter at the top; the
 * others wiggle, say their own name and "Try again!", and the circles still
 * to find glow. Three found wins the page.
 */
export function AllPage({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const L = useLesson();
  const field = L.field;
  const stageRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [found, setFound] = useState<readonly number[]>([]);
  const [wiggle, setWiggle] = useState<{ at: number; n: number }>({ at: -1, n: 0 });

  const cast = useMemo(
    () =>
      field
        .filter((f) => f.shape === L.id)
        .map((f) => (
          <span key={f.hue} className="ng-cast">
            <ShapeArt shape={f.shape} hue={f.hue} />
          </span>
        )),
    [L.id, field]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });
  const { misses, miss } = useMisses(onMiss);
  const { ready, act } = useOpening([allClip(L.id)]);

  const tap = useCallback(
    (i: number) => {
      if (isSolved() || found.includes(i)) return;
      act();
      const el = itemRefs.current[i];
      if (field[i].shape === L.id) {
        const next = [...found, i];
        setFound(next);
        playStarPop();
        burst(el);
        void sayNow([nameClip(L.id)]);
        if (next.length >= ALL_COUNT) finish(counterRef.current);
        return;
      }
      playIncorrectSound();
      setWiggle((w) => ({ at: i, n: w.n + 1 }));
      void sayNow([nameClip(field[i].shape), TRY]);
      miss();
    },
    [L.id, act, burst, field, finish, found, isSolved, miss]
  );

  const next = field.findIndex((f, i) => f.shape === L.id && !found.includes(i));
  const at = useCallback(() => itemRefs.current[next], [next]);
  const hand = usePageHand({
    round,
    armed: ready && !solved && next >= 0,
    misses,
    resetKey: found.length,
    stageRef,
    from: at,
    to: at,
  });

  const line =
    found.length > 0
      ? clipText(nameClip(L.id))
      : misses > 0
        ? clipText(TRY)
        : clipText(allClip(L.id));

  return (
    <NgStage
      stageRef={stageRef}
      playClass={`msh-play msh-play--all msh-play--${L.id}`}
      world={<MshWorld scene={L.scene} />}
      round={round}
      solved={solved}
      say={say(line)}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div className="msh-all">
        <div ref={counterRef} className="msh-counter" aria-label={`${found.length} found`}>
          {Array.from({ length: ALL_COUNT }, (_, k) => {
            const f = found[k];
            return (
              <span key={k} className={`msh-count-slot ${f !== undefined ? "is-full" : ""}`}>
                <svg viewBox="0 0 100 100" className="msh-count-star" aria-hidden="true">
                  <path
                    d="M50 6 L62 37 L95 38 L69 58 L78 91 L50 72 L22 91 L31 58 L5 38 L38 37 Z"
                    strokeLinejoin="round"
                  />
                </svg>
                {f !== undefined && (
                  <motion.span
                    className="msh-count-shape"
                    initial={{ opacity: 0, scale: 2.2 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 14 }}
                  >
                    <ShapeArt shape={field[f].shape} hue={field[f].hue} />
                  </motion.span>
                )}
              </span>
            );
          })}
        </div>
        <div className="msh-field">
          {field.map((f, i) => {
            const gone = found.includes(i);
            const glow = misses > 0 && f.shape === L.id && !gone;
            return (
              <span
                key={i}
                className={`msh-field-item msh-size--${f.size} ${boxClass(f.shape)}`}
                style={
                  {
                    "--x": `${f.x}%`,
                    "--y": `${f.y}%`,
                    "--px": `${f.px}%`,
                    "--py": `${f.py}%`,
                  } as CSSProperties
                }
              >
                <motion.span
                  className="msh-field-in"
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={gone ? { opacity: 0, scale: 0.2 } : { opacity: 1, scale: 1 }}
                  transition={
                    gone
                      ? { duration: 0.3 }
                      : { delay: 0.08 * i, type: "spring", stiffness: 240, damping: 16 }
                  }
                >
                  <span
                    className={`msh-halo ${glow ? "is-on" : ""} ${glow && misses > 1 && i === next ? "is-big" : ""}`}
                    aria-hidden="true"
                  />
                  <button
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    type="button"
                    className="msh-tap msh-field-shape"
                    onClick={() => tap(i)}
                    disabled={gone}
                    aria-label={f.shape}
                  >
                    <span
                      key={wiggle.at === i ? wiggle.n : 0}
                      className={`msh-wiggle msh-bob ${wiggle.at === i && wiggle.n > 0 ? "is-wiggling" : ""}`}
                      style={{ animationDelay: `${-0.7 * i}s` }}
                    >
                      <ShapeArt shape={f.shape} hue={f.hue} />
                    </span>
                  </button>
                </motion.span>
              </span>
            );
          })}
        </div>
      </div>
    </NgStage>
  );
}
