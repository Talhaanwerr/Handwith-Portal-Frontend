"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, sayAfter } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { Picture, type PictureId } from "@games/blend-read/components/PictureArt";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { shake } from "@games/find-the-mouse/utils/shake";
import { NgStage } from "@games/number-groups/components/NgStage";
import { sayNumber, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { RoomWorld } from "@games/number-hunt/components/NhWorlds";
import { FIND_ROUNDS, findTargets } from "@games/number-hunt/constants/rounds";

/** Said (after the number) when only one is left to find. */
const ONE_MORE = "pond-one-more";

/**
 * FIND THE NUMBER — one round (TAP ALL).
 *
 * Six everyday things stand about Berry's playroom, each wearing a big
 * numeral. "Find every 5!" — each one wearing it throws confetti and gets a
 * gold ring when tapped (the number is said); a wrong one shakes and is
 * crossed out. The round is won when every one is found.
 */
export function FindRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = FIND_ROUNDS[round];
  const targets = useMemo(() => findTargets(r), [r]);
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [found, setFound] = useState<readonly number[]>([]);
  const [wrong, setWrong] = useState<readonly number[]>([]);
  const cast = useMemo(
    () =>
      targets.slice(0, 2).map((i) => (
        <span key={i} className="ng-cast">
          <Picture id={r.objects[i].picture} />
        </span>
      )),
    [r, targets]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });

  /** "Find every two!" — said, and shown, from one clip. */
  const ask = `numhunt-find-${r.target}`;
  useSayOnEnter([ask]);

  const tap = useCallback(
    (i: number) => {
      if (isSolved() || found.includes(i) || wrong.includes(i)) return;
      if (r.objects[i].tag === r.target) {
        const next = [...found, i];
        setFound(next);
        burst(refs.current[i]);
        playStarPop();
        sayNumber(r.target);
        if (next.length >= targets.length) finish(boardRef.current);
        else if (targets.length - next.length === 1) void sayAfter(ONE_MORE);
        return;
      }
      playIncorrectSound();
      void playClip("numhunt-find-wrong");
      setWrong([...wrong, i]);
      onMiss();
    },
    [burst, finish, found, isSolved, onMiss, r, targets.length, wrong]
  );

  const register = useCallback((i: number, el: HTMLButtonElement | null) => {
    refs.current[i] = el;
  }, []);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="nh-play--find"
      world={<RoomWorld />}
      round={round}
      solved={solved}
      say={say(clipText(targets.length - found.length === 1 ? ONE_MORE : ask))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={overlay}
    >
      <div ref={boardRef} className="nh-find-board">
        {r.objects.map((o, i) => (
          <FindThing
            key={`${round}-${i}`}
            index={i}
            picture={o.picture}
            tag={o.tag}
            found={found.includes(i)}
            wrong={wrong.includes(i)}
            live={!solved}
            onTap={tap}
            register={register}
          />
        ))}
      </div>
    </NgStage>
  );
}

const FindThing = memo(function FindThing({
  index,
  picture,
  tag,
  found,
  wrong,
  live,
  onTap,
  register,
}: {
  index: number;
  picture: PictureId;
  tag: number;
  found: boolean;
  wrong: boolean;
  live: boolean;
  onTap: (i: number) => void;
  register: (i: number, el: HTMLButtonElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (wrong) shake(ref.current);
  }, [wrong]);

  const can = live && !wrong && !found;
  return (
    <motion.button
      ref={(el) => {
        ref.current = el;
        register(index, el);
      }}
      type="button"
      className={`nh-obj ${found ? "is-found" : ""} ${wrong ? "is-wrong" : ""}`}
      disabled={!can}
      onClick={can ? () => onTap(index) : undefined}
      aria-label={`${picture} with the number ${tag}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 + index * 0.06, duration: 0.3, ease: "easeOut" }}
    >
      <span className="nh-obj-pic">
        <Picture id={picture} />
      </span>
      <span className="nh-obj-tag font-rounded font-black">{tag}</span>
      {wrong && (
        <span className="ng-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}
    </motion.button>
  );
});
