"use client";

import { useMemo } from "react";
import { ChoiceScreen, type Choice } from "@shared/components/game/ChoiceScreen";
import type { PuzzleLevelsProps } from "@games/jigsaw-fun/components/PuzzleShell";
import { cssVars } from "@shared/styles/cssVars";
import {
  LEVELS,
  LEVEL_NAMES,
  bestKey,
  starsText,
  type Level,
} from "@games/jigsaw-fun/constants/levels";
import { LeavePill } from "@games/jigsaw-fun/components/JfStage";
import { Studio } from "@games/tangram-town/components/Studio";
import { guideImage } from "@games/tangram-town/components/TangramArt";
import { GUIDES, figureOf, type Guide, type ModuleId } from "@games/tangram-town/constants/tangram";

/** The plate's one word for its guide — for the grown-up reading along. */
const GUIDE_WORD: Record<Guide, string> = { colour: "Colours", lines: "Lines", none: "No lines" };

/**
 * HOW MUCH HELP? — the portal's shared ChoiceScreen, in the studio. Each
 * plate is an honest sample of its level: the chosen figure's empty board
 * exactly as it will look (coloured outlines, plain outlines, the silhouette
 * alone — painted by the stylesheet from the custom properties below), with
 * the level's name and the best stars earned at it.
 */
export function TtLevels({
  module,
  best,
  onPick,
  onBack,
  onExitPortal,
}: PuzzleLevelsProps<ModuleId>) {
  const fig = figureOf(module);
  const paint = useMemo(
    () =>
      cssVars({
        "--tt-accent": fig.accent,
        "--tt-guide-easy": guideImage(fig, GUIDES.easy),
        "--tt-guide-medium": guideImage(fig, GUIDES.medium),
        "--tt-guide-hard": guideImage(fig, GUIDES.hard),
      }),
    [fig]
  );
  const options: readonly Choice<Level>[] = LEVELS.map((level) => {
    const stars = best[bestKey(module, level)] ?? 0;
    return {
      value: level,
      preview: GUIDE_WORD[GUIDES[level]],
      label: `${LEVEL_NAMES[level]} ${starsText(stars)}`.trim(),
      aria: `${LEVEL_NAMES[level]}: build the ${fig.name} ${GUIDE_WORD[GUIDES[level]].toLowerCase()}, ${stars} of 3 stars so far`,
      variant: level,
    };
  });

  return (
    <div className="tt-pick" style={paint}>
      <ChoiceScreen<Level>
        title={`Build the ${fig.name}`}
        subtitle="How much help?"
        backdrop={<Studio />}
        tone="ocean"
        backAriaLabel="Back to the Tangram Town pictures"
        onBack={onBack}
        onPick={onPick}
        options={options}
      />
      <LeavePill className="tt-leave" onExit={onExitPortal} />
    </div>
  );
}
