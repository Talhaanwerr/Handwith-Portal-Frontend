"use client";

import { useCallback, useMemo } from "react";
import { ChoiceScreen, type Choice } from "@shared/components/game/ChoiceScreen";
import type { PuzzleLevelsProps } from "@games/jigsaw-fun/components/PuzzleShell";
import { cssVars } from "@shared/styles/cssVars";
import { clipText, playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import {
  LEVELS,
  LEVEL_NAMES,
  bestKey,
  starsText,
  type Level,
} from "@games/jigsaw-fun/constants/levels";
import { LeavePill, Playroom } from "@games/jigsaw-fun/components/JfStage";
import {
  CELL,
  cutPaths,
  gridOf,
  pictureSrc,
  sceneOf,
  type ModuleId,
} from "@games/jigsaw-fun/constants/jigsaw";
import { svgUrl } from "@games/jigsaw-fun/utils/svgUrl";

/** A level's real cut lines (knobs and all) as a CSS image. */
function cutLines(module: ModuleId, level: Level): string {
  const { cols, rows } = gridOf(level);
  const paths = cutPaths(module, level)
    .map((d) => `<path d='${d}'/>`)
    .join("");
  return svgUrl(
    `0 0 ${cols * CELL} ${rows * CELL}`,
    `<g fill='none' stroke='white' stroke-width='6' stroke-linejoin='round'>${paths}</g>`
  );
}

/**
 * HOW MANY PIECES? — the portal's shared ChoiceScreen, on the playroom wall.
 * Each plate is an honest sample of its level: the chosen picture cut the way
 * it will be (its real knobbed cut lines, painted by the stylesheet from the
 * custom properties below), the number of pieces, the level's name and the
 * best stars earned at it.
 */
export function JfLevels({
  module,
  best,
  onPick,
  onBack,
  onExitPortal,
}: PuzzleLevelsProps<ModuleId>) {
  const scene = sceneOf(module);
  useSayOnEnter(["jigsaw-how-many"]);
  // the level's name and size, said as it is picked ("Easy! Four pieces.")
  const pick = useCallback(
    (level: Level) => {
      void playClip(`jigsaw-level-${level}`);
      onPick(level);
    },
    [onPick]
  );
  const paint = useMemo(
    () =>
      cssVars({
        "--jf-accent": scene.accent,
        "--jf-sky0": scene.sky[0],
        "--jf-sky1": scene.sky[1],
        "--jf-ground": scene.ground,
        "--jf-pic": `url("${pictureSrc(scene.picture)}")`,
        "--jf-cut-easy": cutLines(module, "easy"),
        "--jf-cut-medium": cutLines(module, "medium"),
        "--jf-cut-hard": cutLines(module, "hard"),
      }),
    [module, scene]
  );
  const options: readonly Choice<Level>[] = LEVELS.map((level) => {
    const { cols, rows } = gridOf(level);
    const n = cols * rows;
    const stars = best[bestKey(module, level)] ?? 0;
    return {
      value: level,
      preview: String(n),
      label: `${LEVEL_NAMES[level]} ${starsText(stars)}`.trim(),
      aria: `${LEVEL_NAMES[level]}: the ${scene.name} in ${n} pieces, ${stars} of 3 stars so far`,
      variant: level,
    };
  });

  return (
    <div className="jf-pick" style={paint}>
      <ChoiceScreen<Level>
        title={`The ${scene.name} jigsaw`}
        subtitle={clipText("jigsaw-how-many")}
        backdrop={<Playroom />}
        tone="kitchen"
        backAriaLabel="Back to the Jigsaw Fun pictures"
        onBack={onBack}
        onPick={pick}
        options={options}
      />
      <LeavePill className="jf-leave" onExit={onExitPortal} />
    </div>
  );
}
