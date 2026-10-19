"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { BrickShell, type PlayApi } from "@games/brick-lab/engine/BrickShell";
import { BrickBoard, type SnapResult } from "@games/brick-lab/engine/BrickBoard";
import { RoundWin } from "@games/brick-lab/engine/RoundWin";
import { RoundDots } from "@games/brick-lab/engine/RoundDots";
import type { Brick, BrickKind } from "@games/brick-lab/engine/geometry";
import { HERO_PLATE } from "@games/brick-lab/constants/models";
import {
  ADD_COLOR,
  FIRST_COLOR,
  MATH_PLATE,
  MATH_SPOT,
  PLUS_ROUNDS,
} from "@games/brick-lab/constants/maths";
import { playClip, playSequence, stopVoice } from "@shared/audio/voice";
import { playStarPop } from "@shared/audio/sfx";
import { cheerFor } from "@shared/audio/cheers";

const HERO: Brick[] = [
  { id: "h1", x: 3, z: 2, y: 0, w: 2, d: 2, color: FIRST_COLOR },
  { id: "h2", x: 3, z: 2, y: 1, w: 2, d: 2, color: FIRST_COLOR },
  { id: "h3", x: 3, z: 2, y: 2, w: 2, d: 2, color: ADD_COLOR },
];

/**
 * PLUS TOWER — first sums, built. The card says 2 + 1. The child stacks the
 * red bricks first (the tray only offers red until there are two), then the
 * blue ones; every brick says the running count, and the finished tower is
 * read as a sentence: "two plus one makes three". The sum is the tower — the
 * child can see the two parts in its two colours. Eight sums, all up to 5.
 */
export function BrickPlusTowerGame() {
  return (
    <BrickShell
      title="Plus Tower"
      tagline="Build the sum, brick by brick"
      hero={HERO}
      heroPlate={HERO_PLATE}
      welcomeClip="brick-plus-welcome"
      doneClip="brick-plus-all"
      play={(api) => <Plus api={api} />}
    />
  );
}

function Plus({ api }: { api: PlayApi }) {
  const [ri, setRi] = useState(0);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [won, setWon] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { a, b } = PLUS_ROUNDS[ri];
  const sum = a + b;
  const n = bricks.length;
  // Red until the first number is built, then blue.
  const color = n < a ? FIRST_COLOR : ADD_COLOR;

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      stopVoice();
    },
    []
  );

  // "Two plus one." — the sum, read as it opens.
  useEffect(() => {
    const r = PLUS_ROUNDS[ri];
    const lines = [`number-${r.a}`, "math-plus", `number-${r.b}`];
    const t = setTimeout(
      () => void playSequence(ri === 0 ? ["brick-plus-build", ...lines] : lines, 150),
      600
    );
    return () => clearTimeout(t);
  }, [ri]);

  // A cue when the colour changes: "Now add the blue ones."
  const prevColor = useRef(color);
  useEffect(() => {
    if (prevColor.current !== color && color === ADD_COLOR && !won)
      void playClip("brick-plus-now-blue");
    prevColor.current = color;
  }, [color, won]);

  const tray: BrickKind[] = won ? [] : [{ w: 2, d: 2, color }];

  const snap = useCallback(
    (_k: BrickKind, free: unknown, all: readonly Brick[], via: string): SnapResult | null => {
      if (via === "drag" && !free) return null;
      return { spot: { ...MATH_SPOT, y: all.length }, ok: all.length < sum };
    },
    [sum]
  );

  const onPlaced = useCallback(
    (_b: Brick, all: readonly Brick[]) => {
      const k = all.length;
      if (k < sum) {
        void playClip(`number-${k}`);
        return;
      }
      setWon(true);
      playStarPop();
      void playSequence(
        [
          `number-${a}`,
          "math-plus",
          `number-${b}`,
          "math-makes",
          `number-${sum}`,
          cheerFor(ri + 1),
        ],
        140
      );
      timer.current = setTimeout(() => {
        setWon(false);
        setBricks([]);
        if (ri + 1 >= PLUS_ROUNDS.length) api.finish();
        else setRi(ri + 1);
      }, 4200);
    },
    [a, b, sum, ri, api]
  );

  const red = Math.min(n, a);
  const blue = Math.max(0, n - a);

  return (
    <BrickBoard
      key={ri}
      plate={MATH_PLATE}
      bricks={bricks}
      onChange={setBricks}
      tray={tray}
      editable={false}
      levels={6}
      snap={snap}
      onPlaced={onPlaced}
      onRejected={() => void playClip("brick-tower-enough")}
      marks={n === 0 ? [{ ...MATH_SPOT, y: 0 }] : undefined}
      locked={won}
      handFrom={won ? undefined : 0}
      plateColor="#F3C85A"
      topInset={100}
    >
      <div className="bk-sum-card" aria-label={`${a} plus ${b}`}>
        <SumPart count={a} filled={red} color={FIRST_COLOR} now={!won && n < a} />
        <span className="bk-sum-sign font-rounded font-black">+</span>
        <SumPart count={b} filled={blue} color={ADD_COLOR} now={!won && n >= a} />
        <span className="bk-sum-sign font-rounded font-black">=</span>
        <motion.span
          key={won ? "answer" : n}
          className={`bk-sum-answer font-rounded font-black ${won ? "bk-sum-answer--done" : ""}`}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 16 }}
        >
          {won ? sum : n > 0 ? n : "?"}
        </motion.span>
      </div>
      <RoundDots total={PLUS_ROUNDS.length} at={ri} />
      {won && <RoundWin label={`${a} plus ${b} makes ${sum}!`} />}
    </BrickBoard>
  );
}

/** One number of the sum: the numeral over its row of brick dots, filling in
 *  as the child builds that part. */
function SumPart({
  count,
  filled,
  color,
  now,
}: {
  count: number;
  filled: number;
  color: string;
  now: boolean;
}) {
  return (
    <span className={`bk-sum-part ${now ? "bk-sum-part--now" : ""}`}>
      <span className={`bk-sum-num bk-c--${color} font-rounded font-black`}>{count}</span>
      <span className="bk-sum-pips" aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <span key={i} className={`bk-pip bk-c--${color} ${i < filled ? "bk-pip--on" : ""}`} />
        ))}
      </span>
    </span>
  );
}
