"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import type { RootPoint } from "@shared/utils/pointer";
import { Picture } from "@games/blend-read/components/PictureArt";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { shake } from "@games/find-the-mouse/utils/shake";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { Chest, Sparkles } from "@games/whats-inside/components/Chest";
import { CoveWorld } from "@games/whats-inside/components/WsiWorld";
import {
  OPEN_LID,
  PEEKS,
  PEEK_LIDS,
  PEEK_ROUNDS,
  TOY_PICTURE,
  nameClip,
  peekChoices,
  peekStep,
  type ToyId,
} from "@games/whats-inside/constants/rounds";

const ASK = "wsi-peek-ask";
const MORE = "wsi-peek-more";

/**
 * PEEK & GUESS — one round (TAP the picture of what is inside).
 *
 * The chest's lid is lifted a crack and the top of a toy peeks out over the
 * rim. Big picture cards wait below (2 in the first round, then 3). Tap the
 * toy it is: the lid swings wide, the toy pops up out of the chest with a
 * sparkle and its name is said. A wrong card shakes and is crossed out — and
 * the toy rises a little further out of the chest: a bigger hint every time.
 */
export function PeekRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = PEEK_ROUNDS[round];
  const choices = useMemo(() => peekChoices(round), [round]);
  const stageRef = useRef<HTMLDivElement>(null);
  const chestRef = useRef<HTMLDivElement>(null);
  const refs = useRef(new Map<ToyId, HTMLButtonElement>());
  const [wrong, setWrong] = useState<readonly ToyId[]>([]);
  const [found, setFound] = useState(false);

  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast">
          <Picture id={TOY_PICTURE[r.toy]} />
        </span>
      )),
    [r.toy]
  );
  const { solved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });

  useSayOnEnter([ASK]);

  const tap = useCallback(
    (t: ToyId) => {
      if (found || wrong.includes(t)) return;
      const el = refs.current.get(t);
      if (t !== r.toy) {
        playIncorrectSound();
        void playClip(MORE);
        shake(el ?? null);
        setWrong((w) => [...w, t]);
        onMiss();
        return;
      }
      setFound(true);
      burst(chestRef.current);
      playStarPop();
      void playClip(nameClip(r.toy));
      finish(chestRef.current);
    },
    [burst, finish, found, onMiss, r.toy, wrong]
  );

  const register = useCallback((t: ToyId, el: HTMLButtonElement | null) => {
    if (el) refs.current.set(t, el);
    else refs.current.delete(t);
  }, []);

  // ── the idle teaching hand: it points at the right picture ──
  const idle = useIdleHand(!found, wrong.length);
  const [hand, setHand] = useState<RootPoint | null>(null);
  useEffect(() => {
    if (!idle) return;
    const measure = () => setHand(centreIn(stageRef.current, refs.current.get(r.toy)));
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [idle, r.toy]);

  const step = peekStep(wrong.length);
  const toy = useMemo(() => <Picture id={TOY_PICTURE[r.toy]} />, [r.toy]);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="wsi-play wsi-play--peek"
      world={<CoveWorld />}
      round={round}
      solved={solved}
      say={say(clipText(wrong.length ? MORE : ASK))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {idle && hand && (
            <TeachingHand fx={hand.x + 40} fy={hand.y + 60} tx={hand.x} ty={hand.y} />
          )}
        </>
      }
    >
      <div className="wsi-board wsi-board--peek">
        <div ref={chestRef} className="wsi-chest-spot" role="img" aria-label="A treasure chest">
          {found && (
            <motion.span
              className="wsi-sparkles"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 14 }}
              aria-hidden="true"
            >
              <Sparkles />
            </motion.span>
          )}
          <Chest
            lid={found ? OPEN_LID : PEEK_LIDS[step]}
            toy={toy}
            rise={found ? 1.08 : PEEKS[step]}
            inside
          />
        </div>
        <div className="wsi-choices">
          {choices.map((t) => (
            <ChoiceCard
              key={t}
              toy={t}
              wrong={wrong.includes(t)}
              right={found && t === r.toy}
              live={!found}
              onTap={tap}
              register={register}
            />
          ))}
        </div>
      </div>
    </NgStage>
  );
}

const ChoiceCard = memo(function ChoiceCard({
  toy,
  wrong,
  right,
  live,
  onTap,
  register,
}: {
  toy: ToyId;
  wrong: boolean;
  right: boolean;
  live: boolean;
  onTap: (t: ToyId) => void;
  register: (t: ToyId, el: HTMLButtonElement | null) => void;
}) {
  const can = live && !wrong;
  return (
    <button
      ref={(el) => register(toy, el)}
      type="button"
      className={`wsi-card ${wrong ? "is-wrong" : ""} ${right ? "is-right" : ""}`}
      disabled={!can}
      onClick={can ? () => onTap(toy) : undefined}
      aria-label={`Is it the ${toy}?`}
    >
      <span className="wsi-card-pic">
        <Picture id={TOY_PICTURE[toy]} />
      </span>
      {wrong && (
        <span className="ng-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}
    </button>
  );
});
