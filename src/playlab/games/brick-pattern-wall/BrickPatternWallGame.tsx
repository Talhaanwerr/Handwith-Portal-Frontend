"use client";

import { useCallback, useMemo, useState } from "react";
import { BrickShell, type PlayApi } from "@games/brick-lab/engine/BrickShell";
import { BrickBoard, type SnapResult } from "@games/brick-lab/engine/BrickBoard";
import { RoundWin } from "@games/brick-lab/engine/RoundWin";
import { RoundDots } from "@games/brick-lab/engine/RoundDots";
import { COLORS, type Brick, type BrickKind } from "@games/brick-lab/engine/geometry";
import type { Landing } from "@games/brick-lab/engine/world";
import {
  B,
  HERO_PATTERN,
  PATTERNS,
  PATTERN_W,
  patternChoices,
  patternColor,
  patternPlate,
} from "@games/brick-lab/constants/models";
import { playClip } from "@shared/audio/voice";
import { useAfterVoice, useIntro } from "@shared/hooks/useAfterVoice";
import { playStarPop } from "@shared/audio/sfx";
import { cheerFor } from "@shared/audio/cheers";

/**
 * PATTERN WALL — red, blue, red, blue … what comes next?
 *
 * A row of bricks on a long plate repeats a pattern; the glowing spot at the
 * end is the next one to fill. Patterns grow from AB to AAB, ABB, ABC and
 * ABCD. Predictable, quiet, and the whole answer is always in view — the
 * pattern itself. A brick of the wrong colour just bumps softly back.
 */
export function BrickPatternWallGame() {
  return (
    <BrickShell
      title="Pattern Wall"
      tagline="What comes next?"
      hero={HERO_PATTERN}
      heroPlate={{ w: 8, d: 6 }}
      welcomeClip="brick-pattern-welcome"
      doneClip="brick-pattern-all"
      play={(api) => <Wall api={api} />}
    />
  );
}

const ROW_Z = 1;

function givenBricks(li: number): Brick[] {
  const p = PATTERNS[li];
  return Array.from({ length: p.given }, (_, i) =>
    B(`g${li}-${i}`, i * PATTERN_W, ROW_Z, 0, PATTERN_W, 2, patternColor(p, i))
  );
}

function Wall({ api }: { api: PlayApi }) {
  const [li, setLi] = useState(0);
  const [bricks, setBricks] = useState<Brick[]>(() => givenBricks(0));
  const [won, setWon] = useState(false);
  const { thenAfter } = useAfterVoice();
  const level = PATTERNS[li];
  const plate = patternPlate(level);
  const n = bricks.length;
  const slot = { x: n * PATTERN_W, z: ROW_Z, y: 0, w: PATTERN_W, d: 2 };

  // Read the pattern aloud as the level opens, then ask. The board holds still
  // until the whole line is said, so a tap cannot cut the instruction off.
  const introLines = useMemo(() => {
    const seq: string[] = [];
    for (let i = 0; i < PATTERNS[li].given; i++) {
      const clip = COLORS[patternColor(PATTERNS[li], i)].clip;
      if (clip) seq.push(clip);
    }
    seq.push("brick-pattern-next");
    return seq;
  }, [li]);
  const intro = useIntro(introLines, li);
  const busy = intro || won;

  const tray: BrickKind[] = useMemo(
    () => patternChoices(level, li).map((color) => ({ w: PATTERN_W, d: 2, color })),
    [level, li]
  );

  const snap = useCallback(
    (
      _k: BrickKind,
      free: Landing | null,
      all: readonly Brick[],
      via: string
    ): SnapResult | null => {
      if (via === "drag" && !free) return null;
      return { spot: { x: all.length * PATTERN_W, z: ROW_Z, y: 0, w: PATTERN_W, d: 2 }, ok: true };
    },
    []
  );

  const accept = useCallback(
    (b: Brick, all: readonly Brick[]) => b.color === patternColor(level, all.length),
    [level]
  );

  const onPlaced = useCallback(
    (b: Brick, all: readonly Brick[]) => {
      if (all.length < level.length) {
        const clip = COLORS[b.color].clip;
        if (clip) void playClip(clip);
        return;
      }
      setWon(true);
      playStarPop();
      thenAfter([cheerFor(li + 1), "brick-pattern-done"], () => {
        setWon(false);
        if (li + 1 >= PATTERNS.length) {
          api.finish(all, plate);
          return;
        }
        setBricks(givenBricks(li + 1));
        setLi(li + 1);
      });
    },
    [api, level.length, li, plate, thenAfter]
  );

  // The hand shows the RIGHT brick, never a wrong one.
  const answer = tray.findIndex((k) => k.color === patternColor(level, n));

  return (
    <BrickBoard
      key={li}
      plate={plate}
      bricks={bricks}
      onChange={setBricks}
      tray={tray}
      editable={false}
      levels={3}
      snap={snap}
      accept={accept}
      onPlaced={onPlaced}
      onRejected={() => void playClip("brick-pattern-look")}
      marks={won ? undefined : [slot]}
      locked={busy}
      handFrom={busy || answer < 0 ? undefined : answer}
      plateColor="#F3C85A"
      initialYaw={-0.32}
    >
      <RoundDots total={PATTERNS.length} at={li} />
      {won && <RoundWin label="The pattern is finished!" />}
    </BrickBoard>
  );
}
