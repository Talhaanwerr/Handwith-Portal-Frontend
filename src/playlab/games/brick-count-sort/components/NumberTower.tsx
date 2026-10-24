"use client";

import { useCallback, useState } from "react";
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
import { playClip, playSequence } from "@shared/audio/voice";
import { playClickSound, playStarPop } from "@shared/audio/sfx";
import { cheerFor } from "@shared/audio/cheers";
import { useAfterVoice, useIntro } from "@shared/hooks/useAfterVoice";

/** Bricks the child may stack beyond the number asked, so reaching the number
 *  is something they must notice — not something the game does for them. */
const EXTRA = 2;

/**
 * NUMBER TOWER module — "Build a tower of five." The child stacks bricks on
 * one spot; every brick says its number and the counter turns over to it.
 * The game does NOT finish by itself when the fifth brick lands: the child may
 * keep stacking (two bricks past the number), and must decide the tower is
 * right and tap "That's it!". Too few or too many is met gently — the tower
 * is counted aloud and the child can take a brick off and try again. Past
 * number + 2 a brick will not click on. Six towers, 3 up to 10.
 */
export function NumberTower({ api }: { api: PlayApi }) {
  const [round, setRound] = useState(0);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [won, setWon] = useState(false);
  const [tries, setTries] = useState(0);
  const target = TOWER_TARGETS[round];
  const cap = target + EXTRA;
  const count = bricks.length;
  const { thenAfter } = useAfterVoice();

  // Each tower opens with its number: "Build a tower of … five." The board
  // holds still until the whole line has been said.
  const intro = useIntro(["brick-tower-build", `number-${target}`], round, 500);
  const busy = intro || won;

  const next = TOWER_RAINBOW[Math.min(count, TOWER_RAINBOW.length - 1)];
  const tray: BrickKind[] = won ? [] : [{ w: 2, d: 2, color: next }];

  const snap = useCallback(
    (kind: BrickKind, free: unknown, all: readonly Brick[], via: string): SnapResult | null => {
      if (via === "drag" && !free) return null;
      const spot = { ...TOWER_SPOT, y: all.length };
      return { spot, ok: all.length < cap && kind.w === 2 && kind.d === 2 };
    },
    [cap]
  );

  // Placing a brick only counts it — it never ends the round.
  const onPlaced = useCallback((_b: Brick, all: readonly Brick[]) => {
    void playClip(`number-${all.length}`);
  }, []);

  const onRejected = useCallback(() => {
    void playClip("brick-tower-enough");
  }, []);

  const onRemoved = useCallback(() => {
    // `bricks` here is the list before the removal.
    const n = bricks.length - 1;
    if (n > 0) void playClip(`number-${n}`);
  }, [bricks.length]);

  const takeOff = useCallback(() => {
    if (busy || bricks.length === 0) return;
    playClickSound();
    const n = bricks.length - 1;
    setBricks(bricks.slice(0, -1));
    if (n > 0) void playClip(`number-${n}`);
  }, [busy, bricks]);

  const check = useCallback(() => {
    if (busy) return;
    if (count !== target) {
      // Not yet: count what is there, then ask to count again. No buzzer.
      setTries((t) => t + 1);
      playClickSound();
      void playSequence(
        count > 0 ? [`number-${count}`, "mouse-count-again"] : ["mouse-count-again"],
        150
      );
      return;
    }
    setWon(true);
    playStarPop();
    thenAfter([`number-${count}`, cheerFor(round + count)], () => {
      setWon(false);
      setBricks([]);
      if (round + 1 >= TOWER_TARGETS.length) api.finish();
      else setRound(round + 1);
    });
  }, [api, busy, count, round, target, thenAfter]);

  const state = count === target ? "done" : count > target ? "over" : "";

  return (
    <BrickBoard
      key={round}
      plate={TOWER_PLATE}
      bricks={bricks}
      onChange={setBricks}
      tray={tray}
      levels={Math.max(6, cap + 1)}
      snap={snap}
      onPlaced={onPlaced}
      onRejected={onRejected}
      onRemoved={onRemoved}
      marks={count === 0 ? [{ ...TOWER_SPOT, y: 0 }] : undefined}
      locked={busy}
      handFrom={count < target && !busy ? 0 : undefined}
      plateColor="#5B8FD6"
      topInsetFor={towerInset}
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
          key={`${count}-${tries}`}
          className={`bk-tower-count font-rounded font-black ${
            state ? `bk-tower-count--${state}` : ""
          }`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 15 }}
          aria-label={`${count} bricks`}
        >
          {count}
        </motion.span>
      </div>
      <div className="bk-tower-dock">
        <button
          className="bk-btn bk-tower-off font-rounded font-black"
          onClick={takeOff}
          disabled={busy || count === 0}
          aria-label="Take the top brick off"
        >
          − 1
        </button>
        <button
          className={`bk-btn bk-btn--go bk-tower-check font-rounded font-black ${
            count === target && !busy ? "bk-tower-check--ready" : ""
          }`}
          onClick={check}
          disabled={busy || count === 0}
          aria-label={`That's it! Check my tower of ${target}`}
        >
          That&apos;s it!
        </button>
      </div>
      <RoundDots total={TOWER_TARGETS.length} at={round} />
      {won && <RoundWin label={`A tower of ${target}!`} />}
    </BrickBoard>
  );
}

/** The strip kept clear for the number card at the top. */
function towerInset(h: number, w: number): number {
  return h < 520 ? 70 : 110 + (w < 700 ? 8 : 0);
}
