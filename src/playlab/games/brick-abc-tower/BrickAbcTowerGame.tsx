"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrickShell, type PlayApi } from "@games/brick-lab/engine/BrickShell";
import { BrickBoard, type SnapResult } from "@games/brick-lab/engine/BrickBoard";
import { RoundWin } from "@games/brick-lab/engine/RoundWin";
import { RoundDots } from "@games/brick-lab/engine/RoundDots";
import type { Brick, BrickKind } from "@games/brick-lab/engine/geometry";
import type { Landing } from "@games/brick-lab/engine/world";
import { HERO_PLATE } from "@games/brick-lab/constants/models";
import { ABC_RUNS, inkColor, threeLetters } from "@games/brick-lab/constants/literacy";
import { playClip, playSequence, stopVoice } from "@shared/audio/voice";
import { playStarPop } from "@shared/audio/sfx";
import { cheerFor } from "@shared/audio/cheers";

const HERO: Brick[] = ["A", "B", "C", "D"].map((l, i) => ({
  id: `h${i}`,
  x: 3,
  z: 2,
  y: i,
  w: 2,
  d: 2,
  color: (["red", "blue", "green", "orange"] as const)[i],
  tag: l,
}));

/**
 * ABC TOWER — the alphabet, one brick at a time, straight up. Each tower is
 * a run of letters (A–E, F–J, K–O, P–T, U–Z): the first brick is already
 * down, and the child stacks the letter that comes next, choosing from
 * three. Each brick says its letter name as it clicks on; a finished tower
 * is read back from the bottom up.
 */
export function BrickAbcTowerGame() {
  return (
    <BrickShell
      title="ABC Tower"
      tagline="Stack the letters in order"
      hero={HERO}
      heroPlate={HERO_PLATE}
      welcomeClip="brick-abc-welcome"
      doneClip="brick-abc-all"
      play={(api) => <AbcTower api={api} />}
    />
  );
}

const PLATE = { w: 4, d: 4 };
const AT = { x: 1, z: 1, w: 2, d: 2 };
const up = (l: string) => l.toUpperCase();

function startOf(ri: number): Brick[] {
  const l = ABC_RUNS[ri][0];
  return [{ id: `a${ri}-0`, ...AT, y: 0, color: inkColor(l, ri), tag: up(l) }];
}

function AbcTower({ api }: { api: PlayApi }) {
  const [ri, setRi] = useState(0);
  const [bricks, setBricks] = useState<Brick[]>(() => startOf(0));
  const [won, setWon] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const run = ABC_RUNS[ri];
  const n = bricks.length;
  const next = run[n];

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      stopVoice();
    },
    []
  );

  useEffect(() => {
    const t = setTimeout(
      () => void playSequence([`letter-${ABC_RUNS[ri][0]}`, "brick-abc-next"], 250),
      600
    );
    return () => clearTimeout(t);
  }, [ri]);

  // Wrong choices are letters from around this run, so the child has to know
  // the order, not just spot a stranger.
  const pool = useMemo(() => {
    const all = "abcdefghijklmnopqrstuvwxyz";
    const i = all.indexOf(run[0]);
    return all.slice(Math.max(0, i - 2), Math.min(26, i + run.length + 2));
  }, [run]);

  const tray: BrickKind[] = useMemo(
    () =>
      won || !next
        ? []
        : threeLetters(next, pool.replace(run.slice(0, n), ""), ri * 7 + n).map((k) => ({
            ...k,
            tag: up(k.tag ?? ""),
          })),
    [won, next, pool, run, n, ri]
  );

  const snap = useCallback(
    (
      _k: BrickKind,
      free: Landing | null,
      all: readonly Brick[],
      via: string
    ): SnapResult | null => {
      if (via === "drag" && !free) return null;
      return { spot: { ...AT, y: all.length }, ok: all.length < run.length };
    },
    [run.length]
  );

  const accept = useCallback(
    (b: Brick, all: readonly Brick[]) => b.tag === up(run[all.length] ?? ""),
    [run]
  );

  const onPlaced = useCallback(
    (b: Brick, all: readonly Brick[]) => {
      if (all.length < run.length) {
        void playClip(`letter-${(b.tag ?? "").toLowerCase()}`);
        return;
      }
      setWon(true);
      playStarPop();
      // Read the tower back, bottom to top: A, B, C, D, E!
      void playSequence([...run.split("").map((l) => `letter-${l}`), cheerFor(ri + 2)], 120);
      timer.current = setTimeout(
        () => {
          setWon(false);
          if (ri + 1 >= ABC_RUNS.length) {
            api.finish(all, PLATE);
            return;
          }
          setBricks(startOf(ri + 1));
          setRi(ri + 1);
        },
        3600 + run.length * 350
      );
    },
    [api, ri, run]
  );

  const answer = tray.findIndex((k) => k.tag === up(next ?? ""));

  return (
    <BrickBoard
      key={ri}
      plate={PLATE}
      bricks={bricks}
      onChange={setBricks}
      tray={tray}
      editable={false}
      levels={7}
      snap={snap}
      accept={accept}
      onPlaced={onPlaced}
      onRejected={() => {
        if (next) void playSequence(["instr-try-again", `letter-${run[n - 1]}`], 200);
      }}
      locked={won}
      handFrom={won || answer < 0 ? undefined : answer}
      plateColor="#C9B6F2"
      initialYaw={-0.35}
      topInset={110}
    >
      <div className="bk-abc-card" aria-label={`Letters ${run.toUpperCase()}`}>
        {run.split("").map((l, i) => (
          <span
            key={l}
            className={`bk-abc-cell bk-c--${inkColor(l, ri)} ${i < n ? "bk-abc-cell--on" : ""} ${
              i === n && !won ? "bk-abc-cell--now" : ""
            }`}
          >
            {i < n ? up(l) : i === n && !won ? "?" : ""}
          </span>
        ))}
      </div>
      <RoundDots total={ABC_RUNS.length} at={ri} />
      {won && <RoundWin label={`${up(run[0])} to ${up(run[run.length - 1])}!`} />}
    </BrickBoard>
  );
}
