"use client";

import { useCallback, useState } from "react";
import { BrickShell, type PlayApi, type ShellModule } from "@games/brick-lab/engine/BrickShell";
import { BrickBoard } from "@games/brick-lab/engine/BrickBoard";
import {
  COLORS,
  type Brick,
  type BrickColor,
  type BrickKind,
} from "@games/brick-lab/engine/geometry";
import { HERO_HOUSE, HERO_PLATE, HERO_TOWER } from "@games/brick-lab/constants/models";
import { CopyDesign } from "@games/brick-lab/components/CopyDesign";
import { playClickSound } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";

const MODULES: readonly ShellModule[] = [
  {
    id: "copy",
    label: "Copy the Design",
    hero: HERO_TOWER,
    heroPlate: HERO_PLATE,
    doneClip: "brick-lab-done",
    play: (api) => <CopyDesign api={api} />,
  },
  {
    id: "free",
    label: "Free Build",
    hero: HERO_HOUSE,
    heroPlate: HERO_PLATE,
    doneClip: "brick-lab-done",
    play: (api) => <FreeBuild api={api} />,
  },
];

/**
 * BRICK LAB — two ways to build. "Copy the Design" is guided: pick a design,
 * see it beside the plate, rebuild it and get checked. "Free Build" is free
 * building on a big green plate. Pick a colour, drag any of
 * eight brick sizes on, stack, turn, move and take off. When the child says
 * they are done, their own model is what the star card shows.
 */
export function BrickLabGame() {
  return (
    <BrickShell
      title="Brick Lab"
      tagline="Pick a game!"
      hero={HERO_HOUSE}
      heroPlate={HERO_PLATE}
      welcomeClip="brick-lab-welcome"
      modules={MODULES}
    />
  );
}

const PLATE = { w: 14, d: 10 };
const SIZES: Array<[number, number]> = [
  [1, 1],
  [1, 2],
  [1, 3],
  [1, 4],
  [2, 2],
  [2, 3],
  [2, 4],
  [1, 6],
];
const SWATCHES = Object.keys(COLORS) as BrickColor[];

/** The child's model on a plate just big enough for it, for the star card. */
function cropped(bricks: readonly Brick[]) {
  const x0 = Math.min(...bricks.map((b) => b.x)) - 1;
  const z0 = Math.min(...bricks.map((b) => b.z)) - 1;
  const x1 = Math.max(...bricks.map((b) => b.x + b.w)) + 1;
  const z1 = Math.max(...bricks.map((b) => b.z + b.d)) + 1;
  return {
    bricks: bricks.map((b) => ({ ...b, x: b.x - x0, z: b.z - z0 })),
    plate: { w: Math.max(4, x1 - x0), d: Math.max(4, z1 - z0) },
  };
}

function FreeBuild({ api }: { api: PlayApi }) {
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [color, setColor] = useState<BrickColor>("red");
  useSayOnEnter(["brick-lab-drag"]);

  const tray: BrickKind[] = SIZES.map(([w, d]) => ({ w, d, color }));

  const onPlaced = useCallback((b: Brick) => {
    const clip = COLORS[b.color].clip;
    if (clip) void playClip(clip);
  }, []);

  return (
    <BrickBoard
      plate={PLATE}
      bricks={bricks}
      onChange={setBricks}
      tray={tray}
      levels={6}
      onPlaced={onPlaced}
    >
      {/* The colours, as a paint-pot bar along the bottom of the play area:
          in the tray they pushed the bigger bricks off the screen. */}
      <div className="bk-swatches bk-swatches--bar" role="radiogroup" aria-label="Brick colour">
        {SWATCHES.map((c) => (
          <button
            key={c}
            role="radio"
            aria-checked={c === color}
            aria-label={COLORS[c].name}
            className={`bk-swatch bk-c--${c} ${c === color ? "bk-swatch--on" : ""}`}
            onClick={() => {
              playClickSound();
              setColor(c);
              const clip = COLORS[c].clip;
              if (clip) void playClip(clip);
            }}
          />
        ))}
      </div>
      <div className="bk-hud">
        <button
          className="bk-btn bk-hud-small font-rounded font-black"
          disabled={bricks.length === 0}
          onClick={() => {
            playClickSound();
            // Undo: take off the brick put on last (one nothing rests on).
            setBricks((all) => all.slice(0, -1));
          }}
          aria-label="Undo the last brick"
        >
          Undo
        </button>
        <button
          className="bk-btn bk-hud-small font-rounded font-black"
          disabled={bricks.length === 0}
          onClick={() => {
            playClickSound();
            setBricks([]);
          }}
          aria-label="Clear the plate"
        >
          Clear
        </button>
        <span className="bk-count font-rounded font-black" aria-live="polite">
          {bricks.length}
        </span>
        <button
          className="bk-btn bk-btn--go bk-hud-done font-rounded font-black"
          disabled={bricks.length === 0}
          onClick={() => {
            playClickSound();
            const m = cropped(bricks);
            api.finish(m.bricks, m.plate);
          }}
        >
          I&apos;m done!
        </button>
      </div>
    </BrickBoard>
  );
}
