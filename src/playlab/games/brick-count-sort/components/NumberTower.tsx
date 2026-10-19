"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { PlayApi } from "@games/brick-lab/engine/BrickShell";
import { BrickBoard, type SnapResult } from "@games/brick-lab/engine/BrickBoard";
import type { Brick, BrickKind } from "@games/brick-lab/engine/geometry";
import {
  TOWER_PLATE,
  TOWER_RAINBOW,
  TOWER_SPOT,
  TOWER_TARGETS,
} from "@games/brick-lab/constants/models";
import { RoundWin } from "@games/brick-lab/engine/RoundWin";
import { RoundDots } from "@games/brick-lab/engine/RoundDots";
import { playClip, playSequence, stopVoice } from "@shared/audio/voice";
import { playStarPop } from "@shared/audio/sfx";
import { cheerFor } from "@shared/audio/cheers";

/**
 * NUMBER TOWER module — "Build a tower of five." The child stacks bricks on
 * one spot; every brick says its number and the counter turns over to it.
 * The tower stops at exactly the number asked: a brick too many will not
 * click on, and a brick lifted off counts back down. Six towers, 3 up to 10.
 */
export function NumberTower({ api }: { api: PlayApi }) {
  const [round, setRound] = useState(0);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [won, setWon] = useState(false);
  const target = TOWER_TARGETS[round];
  const count = bricks.length;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Each tower opens with its number: "Build a tower of … five."
  useEffect(() => {
    const t = setTimeout(
      () => void playSequence(["brick-tower-build", `number-${target}`], 120),
      500
    );
    return () => clearTimeout(t);
  }, [target]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      stopVoice();
    },
    []
  );

  const next = TOWER_RAINBOW[Math.min(count, TOWER_RAINBOW.length - 1)];
  const tray: BrickKind[] = won ? [] : [{ w: 2, d: 2, color: next }];

  const snap = useCallback(
    (kind: BrickKind, free: unknown, all: readonly Brick[], via: string): SnapResult | null => {
      if (via === "drag" && !free) return null;
      const spot = { ...TOWER_SPOT, y: all.length };
      return { spot, ok: all.length < target && kind.w === 2 && kind.d === 2 };
    },
    [target]
  );

  const onPlaced = useCallback(
    (_b: Brick, all: readonly Brick[]) => {
      const n = all.length;
      if (n < target) {
        void playClip(`number-${n}`);
        return;
      }
      setWon(true);
      playStarPop();
      void playSequence([`number-${n}`, cheerFor(round + n)], 200);
      timer.current = setTimeout(() => {
        setWon(false);
        setBricks([]);
        if (round + 1 >= TOWER_TARGETS.length) api.finish();
        else setRound(round + 1);
      }, 2600);
    },
    [api, round, target]
  );

  const onRejected = useCallback(() => {
    void playClip("brick-tower-enough");
  }, []);

  const onRemoved = useCallback(() => {
    // `bricks` here is the list before the removal.
    const n = bricks.length - 1;
    if (n > 0) void playClip(`number-${n}`);
  }, [bricks.length]);

  return (
    <BrickBoard
      key={round}
      plate={TOWER_PLATE}
      bricks={bricks}
      onChange={setBricks}
      tray={tray}
      levels={Math.max(6, target + 1)}
      snap={snap}
      onPlaced={onPlaced}
      onRejected={onRejected}
      onRemoved={onRemoved}
      marks={count === 0 ? [{ ...TOWER_SPOT, y: 0 }] : undefined}
      locked={won}
      handFrom={count < target ? 0 : undefined}
      plateColor="#5B8FD6"
      topInset={100}
    >
      <div className="bk-tower-card" aria-live="polite">
        <span className="bk-tower-goal font-rounded font-black">{target}</span>
        <div className="bk-tower-pips" aria-hidden="true">
          {Array.from({ length: target }, (_, i) => (
            <span
              key={i}
              className={`bk-pip bk-c--${TOWER_RAINBOW[i]} ${i < count ? "bk-pip--on" : ""}`}
            />
          ))}
        </div>
        <motion.span
          key={count}
          className={`bk-tower-count font-rounded font-black ${count === target ? "bk-tower-count--done" : ""}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 15 }}
          aria-label={`${count} bricks`}
        >
          {count}
        </motion.span>
      </div>
      <RoundDots total={TOWER_TARGETS.length} at={round} />
      {won && <RoundWin label={`A tower of ${target}!`} />}
    </BrickBoard>
  );
}
