"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrickShell, type PlayApi, type ShellModule } from "@games/brick-lab/engine/BrickShell";
import { BrickBoard, type SnapResult } from "@games/brick-lab/engine/BrickBoard";
import { ChipRain, RoundWin } from "@games/brick-lab/engine/RoundWin";
import { RoundDots } from "@games/brick-lab/engine/RoundDots";
import type { Brick, BrickKind } from "@games/brick-lab/engine/geometry";
import type { Landing } from "@games/brick-lab/engine/world";
import { HERO_PLATE } from "@games/brick-lab/constants/models";
import { ABC_RUN_SETS, inkColor, threeLetters } from "@games/brick-lab/constants/literacy";
import { playSequence } from "@shared/audio/voice";
import { useAfterVoice, useIntro } from "@shared/hooks/useAfterVoice";
import { playStarPop } from "@shared/audio/sfx";
import { cheerFor } from "@shared/audio/cheers";

/** A little tower of the first `n` letters, for a module card. */
const heroOf = (n: number): Brick[] =>
  "ABCDEFGHIJ"
    .slice(0, n)
    .split("")
    .map((l, i) => ({
      id: `h${i}`,
      x: 3,
      z: 2,
      y: i,
      w: 2,
      d: 2,
      color: (["red", "blue", "green", "orange", "purple"] as const)[i % 5],
      tag: l,
    }));

const MODULES: readonly ShellModule[] = [
  {
    id: "three",
    label: "3 Letters",
    hero: heroOf(3),
    heroPlate: HERO_PLATE,
    doneClip: "brick-abc-all",
    play: (api) => <AbcTower api={api} runs={ABC_RUN_SETS.three} />,
  },
  {
    id: "five",
    label: "5 Letters",
    hero: heroOf(5),
    heroPlate: HERO_PLATE,
    doneClip: "brick-abc-all",
    play: (api) => <AbcTower api={api} runs={ABC_RUN_SETS.five} />,
  },
  {
    id: "ten",
    label: "10 Letters",
    hero: heroOf(10),
    heroPlate: HERO_PLATE,
    doneClip: "brick-abc-all",
    play: (api) => <AbcTower api={api} runs={ABC_RUN_SETS.ten} />,
  },
];

/**
 * ABC TOWER — the alphabet, one brick at a time, straight up. Each tower is
 * a run of letters — 3 (ABC, DEF…), 5 (A–E, F–J…) or 10 (A–J, K–T, U–Z),
 * picked on the title screen: the first brick is already down, and the child
 * stacks the letter that comes next, choosing from three. Each right brick
 * says its letter name, then "Great job!", with a light fall of confetti; a
 * finished tower is read back from the bottom up.
 */
export function BrickAbcTowerGame() {
  return (
    <BrickShell
      title="ABC Tower"
      tagline="Stack the letters in order"
      hero={heroOf(5)}
      heroPlate={HERO_PLATE}
      welcomeClip="brick-abc-welcome"
      modules={MODULES}
    />
  );
}

const PLATE = { w: 4, d: 4 };
const AT = { x: 1, z: 1, w: 2, d: 2 };
const up = (l: string) => l.toUpperCase();

function startOf(runs: readonly string[], ri: number): Brick[] {
  const l = runs[ri][0];
  return [{ id: `a${ri}-0`, ...AT, y: 0, color: inkColor(l, ri), tag: up(l) }];
}

function AbcTower({ api, runs }: { api: PlayApi; runs: readonly string[] }) {
  const [ri, setRi] = useState(0);
  const [bricks, setBricks] = useState<Brick[]>(() => startOf(runs, 0));
  // Bumped on every right letter: a light fall of confetti, then cleared.
  const [sparkle, setSparkle] = useState(0);
  const sparkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (sparkTimer.current) clearTimeout(sparkTimer.current);
    },
    []
  );
  const [won, setWon] = useState(false);
  const { thenAfter } = useAfterVoice();
  const run = runs[ri];
  const n = bricks.length;
  const next = run[n];

  const introLines = useMemo(() => [`letter-${runs[ri][0]}`, "brick-abc-next"], [ri, runs]);
  const intro = useIntro(introLines, ri);
  const busy = intro || won;

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
        // Every right letter: its name, then "Great job!", and a little confetti.
        void playSequence([`letter-${(b.tag ?? "").toLowerCase()}`, "cheer-great-job"], 150);
        setSparkle((k) => k + 1);
        if (sparkTimer.current) clearTimeout(sparkTimer.current);
        sparkTimer.current = setTimeout(() => setSparkle(0), 2600);
        return;
      }
      setWon(true);
      playStarPop();
      // Read the tower back, bottom to top: A, B, C, D, E!
      thenAfter(
        [...run.split("").map((l) => `letter-${l}`), cheerFor(ri + 2)],
        () => {
          setWon(false);
          if (ri + 1 >= runs.length) {
            api.finish(all, PLATE);
            return;
          }
          setBricks(startOf(runs, ri + 1));
          setRi(ri + 1);
        },
        120
      );
    },
    [api, ri, run, runs, thenAfter]
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
      levels={run.length + 1}
      snap={snap}
      accept={accept}
      onPlaced={onPlaced}
      onRejected={() => {
        if (next) void playSequence(["instr-try-again", `letter-${run[n - 1]}`], 200);
      }}
      locked={busy}
      handFrom={busy || answer < 0 ? undefined : answer}
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
      {sparkle > 0 && <ChipRain key={sparkle} count={14} />}
      <RoundDots total={runs.length} at={ri} />
      {won && <RoundWin label={`${up(run[0])} to ${up(run[run.length - 1])}!`} />}
    </BrickBoard>
  );
}
