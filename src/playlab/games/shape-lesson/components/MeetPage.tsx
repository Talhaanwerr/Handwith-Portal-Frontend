"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playStarPop } from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { meetClip, nameClip } from "@games/shape-lesson/constants/lessons";
import { MshWorld } from "@games/shape-lesson/components/MshWorld";
import { ShapeArt } from "@games/shape-lesson/components/ShapeArt";
import { Sparkles } from "@games/shape-lesson/components/Sparkles";
import {
  boxClass,
  useLesson,
  useOpening,
  usePageHand,
} from "@games/shape-lesson/components/lessonKit";

/**
 * Page 1 — MEET. One big shape in the middle of the scene, gently breathing:
 * "This is a circle! Tap it." One tap: it bounces, sparkles fly, its name is
 * said, and the page is won.
 */
export function MeetPage({ round, title, onDone, onHome, onExitPortal }: RoundProps) {
  const L = useLesson();
  const stageRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLButtonElement>(null);
  const [pops, setPops] = useState(0);
  const cast = useMemo(
    () => [
      <span key="a" className="ng-cast">
        <ShapeArt shape={L.id} hue={L.hue} />
      </span>,
    ],
    [L]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });
  const { ready, act } = useOpening([meetClip(L.id)]);

  const tap = useCallback(() => {
    if (isSolved()) return;
    act();
    setPops((n) => n + 1);
    playStarPop();
    burst(shapeRef.current);
    void playClip(nameClip(L.id));
    finish(shapeRef.current);
  }, [L.id, act, burst, finish, isSolved]);

  const at = useCallback(() => shapeRef.current, []);
  const hand = usePageHand({
    round,
    armed: ready && !solved,
    misses: 0,
    resetKey: "meet",
    stageRef,
    from: at,
    to: at,
  });

  return (
    <NgStage
      stageRef={stageRef}
      playClass={`msh-play msh-play--meet msh-play--${L.id}`}
      world={<MshWorld scene={L.scene} />}
      round={round}
      solved={solved}
      say={say(pops > 0 ? clipText(nameClip(L.id)) : clipText(meetClip(L.id)))}
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
      <div className="msh-meet">
        <span className="msh-spot" aria-hidden="true" />
        <motion.span
          className="msh-meet-in"
          initial={{ opacity: 0, scale: 0.4 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
        >
          <button
            ref={shapeRef}
            type="button"
            className={`msh-tap msh-meet-shape ${boxClass(L.id)}`}
            onClick={tap}
            aria-label={`This is a ${L.id}. Tap it.`}
          >
            <span key={pops} className={`msh-breathe ${pops > 0 ? "is-popped" : ""}`}>
              <ShapeArt shape={L.id} hue={L.hue} />
            </span>
          </button>
          {pops > 0 && <Sparkles key={pops} />}
        </motion.span>
      </div>
    </NgStage>
  );
}
