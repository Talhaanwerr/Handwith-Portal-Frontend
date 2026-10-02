"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playCorrectSound, playIncorrectSound, playKnockSound } from "@shared/audio/sfx";
import { playClip, sayAfter, clipText, stopVoice } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { Burrow, type HeadState } from "@games/find-the-mouse/components/Burrow";
import { FtmStage } from "@games/find-the-mouse/components/FtmStage";
import { BURROWS, COUNT_MAX, countRound } from "@games/find-the-mouse/constants/scene";
import { shake } from "@games/find-the-mouse/utils/shake";

const READY_MS = 700;
const SOLVED_MS = 1700;

/** The recorded number clips (public/audio/numbers/N.mp3), indexed value-1. */
const NUMBER_CLIPS = ["number-1", "number-2", "number-3", "number-4", "number-5"] as const;

/** The round's prompt; the first round also says how to count. */
const FIRST_LINES = ["mouse-how-many", "mouse-tap-each"];
const LINES = ["mouse-how-many"];

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

interface FtmCountRoundProps {
  round: number;
  onFound: () => void;
  onMiss: () => void;
  onHome: () => void;
  onExitPortal: () => void;
}

/**
 * COUNT THE MICE — one round.
 *
 * A few mice poke their heads out and wait. Tapping a mouse counts it: a
 * number badge pops onto it and the number is spoken ("one… two… three…"),
 * which is the one-to-one counting the child is practising. Tapping a number
 * tile answers: the right one lights up, is spoken, and every mouse jumps out
 * wearing its number; a wrong one is crossed out for good.
 */
export function FtmCountRound({
  round,
  onFound,
  onMiss,
  onHome,
  onExitPortal,
}: FtmCountRoundProps) {
  const { count, burrows } = useMemo(() => countRound(round), [round]);
  const [shown, setShown] = useState(false);
  const [counted, setCounted] = useState<readonly number[]>([]);
  const [wrongNums, setWrongNums] = useState<readonly number[]>([]);
  const [solved, setSolved] = useState(false);
  /** False once the round is left (Back, Back to Games, unmount): a line that
   *  ends after that must not move a round nobody is looking at. */
  const live = useRef(true);
  /** The number, then "Three mice!" — the round moves on once that is said. */
  const total = useRef<Promise<void>>(Promise.resolve());

  useSayOnEnter(round === 0 ? FIRST_LINES : LINES);

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setShown(true);
      playKnockSound();
    }, READY_MS);
    return () => clearTimeout(t);
  }, [round]);

  // Hold the answer for SOLVED_MS — longer if the total is still being said,
  // so the next round never cuts it off.
  useEffect(() => {
    if (!solved) return;
    let cancelled = false;
    void Promise.all([wait(SOLVED_MS), total.current]).then(() => {
      if (!cancelled && live.current) onFound();
    });
    return () => {
      cancelled = true;
      stopVoice();
    };
  }, [solved, onFound]);

  const countMouse = useCallback(
    (i: number) => {
      if (counted.includes(i)) return;
      void playClip(NUMBER_CLIPS[Math.min(counted.length, COUNT_MAX - 1)]);
      // the last mouse counted: the next step, after its number
      if (counted.length + 1 === count) void sayAfter("mouse-tap-number");
      setCounted([...counted, i]);
    },
    [counted, count]
  );

  const pickNumber = useCallback(
    (value: number) => {
      if (value === count) {
        playCorrectSound();
        void playClip(NUMBER_CLIPS[value - 1]);
        total.current = sayAfter(`mouse-total-${count}`);
        setSolved(true);
        return;
      }
      playIncorrectSound();
      void playClip("mouse-count-again");
      setWrongNums((w) => (w.includes(value) ? w : [...w, value]));
      onMiss();
    },
    [count, onMiss]
  );

  /** Leaving mid-round: silence now, and nothing queued may follow. */
  const leave = (fn: () => void) => () => {
    live.current = false;
    stopVoice();
    fn();
  };

  // Once solved, every mouse wears its number: the ones the child counted in
  // the order they counted them, then the rest.
  const order = solved ? [...counted, ...burrows.filter((b) => !counted.includes(b))] : counted;

  const allCounted = counted.length === count;
  const say = solved
    ? clipText(`mouse-total-${count}`)
    : allCounted
      ? clipText("mouse-tap-number")
      : clipText("mouse-how-many");

  const headFor = (i: number): HeadState => {
    if (!burrows.includes(i) || !shown) return "in";
    return solved ? "popped" : "out";
  };

  return (
    <FtmStage
      mode="count"
      round={round}
      say={say}
      cheer={solved}
      onHome={leave(onHome)}
      onExitPortal={leave(onExitPortal)}
      footer={
        <div className="ftm-nums" role="group" aria-label="How many mice?">
          {Array.from({ length: COUNT_MAX }, (_, k) => (
            <NumberTile
              key={k + 1}
              value={k + 1}
              lit={solved && k + 1 === count}
              wrong={wrongNums.includes(k + 1)}
              onPick={solved || !shown ? null : pickNumber}
            />
          ))}
        </div>
      }
    >
      {BURROWS.map((_, i) => {
        const hasMouse = burrows.includes(i);
        const rank = order.indexOf(i);
        const open = hasMouse && shown && !solved && rank < 0;
        return (
          <Burrow
            key={i}
            index={i}
            hasMouse={hasMouse}
            head={headFor(i)}
            bob
            badge={rank >= 0 ? rank + 1 : null}
            onTap={open ? countMouse : null}
            ariaLabel={hasMouse ? `A mouse${open ? " — tap to count it" : ""}` : `Hole ${i + 1}`}
          />
        );
      })}
    </FtmStage>
  );
}

/** One number tile on the counter. Memoised; the shake runs on the DOM node. */
const NumberTile = memo(function NumberTile({
  value,
  lit,
  wrong,
  onPick,
}: {
  value: number;
  lit: boolean;
  wrong: boolean;
  onPick: ((value: number) => void) | null;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (wrong) shake(ref.current);
  }, [wrong]);

  return (
    <button
      ref={ref}
      type="button"
      className={`ftm-num font-rounded font-black ${lit ? "ftm-num--lit" : ""} ${
        wrong ? "ftm-num--wrong" : ""
      }`}
      disabled={!onPick || wrong}
      onClick={onPick && !wrong ? () => onPick(value) : undefined}
      aria-label={`${value}`}
    >
      <span className="ftm-num-glyph">{value}</span>
      {wrong && (
        <span className="ftm-num-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}
    </button>
  );
});
