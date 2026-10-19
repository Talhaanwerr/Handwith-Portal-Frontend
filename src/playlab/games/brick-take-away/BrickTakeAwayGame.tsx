"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BrickShell, type PlayApi } from "@games/brick-lab/engine/BrickShell";
import { BrickBoard, type SnapResult } from "@games/brick-lab/engine/BrickBoard";
import { RoundWin } from "@games/brick-lab/engine/RoundWin";
import { RoundDots } from "@games/brick-lab/engine/RoundDots";
import type { Brick } from "@games/brick-lab/engine/geometry";
import { HERO_PLATE } from "@games/brick-lab/constants/models";
import { MATH_PLATE, MATH_SPOT, TAKE_COLOR, TAKE_ROUNDS } from "@games/brick-lab/constants/maths";
import { playClip, playSequence, stopVoice } from "@shared/audio/voice";
import { playStarPop } from "@shared/audio/sfx";
import { cheerFor } from "@shared/audio/cheers";

const HERO: Brick[] = [0, 1, 2].map((y) => ({
  id: `h${y}`,
  x: 3,
  z: 2,
  y,
  w: 2,
  d: 2,
  color: TAKE_COLOR,
}));

/**
 * TAKE AWAY TOWER — first subtraction, by doing it. A tower of four, the card
 * says 4 − 1. The child taps the top brick (or pulls it off) and it comes
 * away; the tower counts what is left. One too many will not come off — the
 * card shows exactly how many to take. The end is read as a sentence: "four
 * take away one is three". Eight towers, nothing past 5, never down to 0.
 */
export function BrickTakeAwayGame() {
  return (
    <BrickShell
      title="Take Away Tower"
      tagline="Take bricks off. How many are left?"
      hero={HERO}
      heroPlate={HERO_PLATE}
      welcomeClip="brick-take-welcome"
      doneClip="brick-take-all"
      play={(api) => <TakeAway api={api} />}
    />
  );
}

const tower = (ri: number): Brick[] =>
  Array.from({ length: TAKE_ROUNDS[ri].from }, (_, y) => ({
    id: `t${ri}-${y}`,
    ...MATH_SPOT,
    y,
    color: TAKE_COLOR,
  }));

function TakeAway({ api }: { api: PlayApi }) {
  const [ri, setRi] = useState(0);
  const [bricks, setBricks] = useState<Brick[]>(() => tower(0));
  const [won, setWon] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { from, take } = TAKE_ROUNDS[ri];
  const left = bricks.length;
  const taken = from - left;

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      stopVoice();
    },
    []
  );

  // "Four take away one."
  useEffect(() => {
    const r = TAKE_ROUNDS[ri];
    const lines = [`number-${r.from}`, "math-take-away", `number-${r.take}`];
    const t = setTimeout(
      () => void playSequence(ri === 0 ? ["brick-take-tap", ...lines] : lines, 150),
      600
    );
    return () => clearTimeout(t);
  }, [ri]);

  // Nothing is ever placed: every drop off the tower takes the brick away.
  const snap = useCallback((): SnapResult | null => null, []);
  const canRemove = useCallback(() => taken < take, [taken, take]);

  const onRemoved = useCallback(() => {
    const nowTaken = taken + 1;
    const nowLeft = left - 1;
    if (nowTaken < take) {
      void playClip(`number-${nowTaken}`);
      return;
    }
    setWon(true);
    playStarPop();
    void playSequence(
      [
        `number-${from}`,
        "math-take-away",
        `number-${take}`,
        "math-is",
        `number-${nowLeft}`,
        cheerFor(ri + 2),
      ],
      140
    );
    timer.current = setTimeout(() => {
      setWon(false);
      if (ri + 1 >= TAKE_ROUNDS.length) {
        api.finish();
        return;
      }
      setBricks(tower(ri + 1));
      setRi(ri + 1);
    }, 4400);
  }, [taken, left, take, from, ri, api]);

  return (
    <BrickBoard
      key={ri}
      plate={MATH_PLATE}
      bricks={bricks}
      onChange={setBricks}
      tray={[]}
      noTray
      tapRemoves
      canRemove={canRemove}
      snap={snap}
      levels={6}
      onRemoved={onRemoved}
      onRejected={() => void playClip("brick-tower-enough")}
      // The top brick glows: "tap here".
      marks={won ? undefined : [{ ...MATH_SPOT, y: left }]}
      locked={won}
      plateColor="#9ED6A6"
      topInset={100}
    >
      <div className="bk-sum-card" aria-label={`${from} take away ${take}`}>
        <span className="bk-sum-part">
          <span className={`bk-sum-num bk-c--${TAKE_COLOR} font-rounded font-black`}>{from}</span>
          <span className="bk-sum-pips" aria-hidden="true">
            {Array.from({ length: from }, (_, i) => (
              <span
                key={i}
                className={`bk-pip bk-c--${TAKE_COLOR} bk-pip--on ${i >= left ? "bk-pip--gone" : ""}`}
              />
            ))}
          </span>
        </span>
        <span className="bk-sum-sign font-rounded font-black">−</span>
        <span className={`bk-sum-part ${won ? "" : "bk-sum-part--now"}`}>
          <span className="bk-sum-num bk-sum-num--take font-rounded font-black">{take}</span>
          <span className="bk-sum-pips" aria-hidden="true">
            {Array.from({ length: take }, (_, i) => (
              <span key={i} className={`bk-pip bk-pip--take ${i < taken ? "bk-pip--on" : ""}`} />
            ))}
          </span>
        </span>
        <span className="bk-sum-sign font-rounded font-black">=</span>
        <motion.span
          key={won ? "answer" : "q"}
          className={`bk-sum-answer font-rounded font-black ${won ? "bk-sum-answer--done" : ""}`}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 16 }}
        >
          {won ? left : "?"}
        </motion.span>
      </div>
      <RoundDots total={TAKE_ROUNDS.length} at={ri} />
      {won && <RoundWin label={`${from} take away ${take} is ${left}!`} />}
    </BrickBoard>
  );
}
