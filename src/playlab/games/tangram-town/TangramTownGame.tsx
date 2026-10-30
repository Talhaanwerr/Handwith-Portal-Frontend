"use client";

import { Picture } from "@games/blend-read/components/PictureArt";
import { LEVEL_NAMES, type Level } from "@games/jigsaw-fun/constants/levels";
import { PuzzleShell } from "@games/jigsaw-fun/components/PuzzleShell";
import type { PuzzleCard } from "@games/jigsaw-fun/components/PuzzleHome";
import type { PuzzleFinale } from "@games/jigsaw-fun/components/PuzzleComplete";
import { useTangramTownStore } from "@games/tangram-town/store/tangramTownStore";
import { Studio } from "@games/tangram-town/components/Studio";
import { TtLevels } from "@games/tangram-town/components/TtLevels";
import { TangramRound } from "@games/tangram-town/components/TangramRound";
import { FigureSvg, TanPiece } from "@games/tangram-town/components/TangramArt";
import {
  ALL_PLACED,
  FIGURES,
  GUIDES,
  MODULE_IDS,
  PIECE_COLORS,
  figureOf,
  starsFor,
  type Guide,
  type ModuleId,
} from "@games/tangram-town/constants/tangram";

const WORLD = <Studio roomy />;

/** Each picture's card: the finished tangram in its seven colours. */
const CARDS: readonly PuzzleCard<ModuleId>[] = FIGURES.map((f) => ({
  id: f.id,
  name: f.name,
  accent: f.accent,
  art: <FigureSvg fig={f} filled={ALL_PLACED} guide="none" />,
  aria: `Build the ${f.name}`,
}));

/** What the star card says the child built it with. */
const BUILT_WITH: Record<Guide, string> = {
  colour: "with the colours",
  lines: "with the lines",
  none: "with no lines",
};

/** The star card: the figure on a framed canvas, its pieces bobbing, a trophy. */
function finale(module: ModuleId, level: Level): PuzzleFinale {
  const fig = figureOf(module);
  return {
    accent: fig.accent,
    cast: fig.slots.map((s, i) => (
      <span key={i} className="jf-cast">
        <TanPiece slot={s} color={PIECE_COLORS[i]} />
      </span>
    )),
    art: <FigureSvg fig={fig} filled={ALL_PLACED} guide="none" wave />,
    hero: <Picture id="trophy" />,
    line: `You built the ${fig.name} ${BUILT_WITH[GUIDES[level]]}!`,
    harderLabel: (up) => `Try ${LEVEL_NAMES[up]}`,
    lean: 1,
  };
}

/**
 * TANGRAM TOWN — pick a picture, pick how much help (coloured outlines, plain
 * outlines, or the silhouette alone), and build it from the seven tangram
 * pieces, in a quiet art studio.
 */
export function TangramTownGame() {
  const store = useTangramTownStore();
  return (
    <PuzzleShell
      prefix="tt"
      store={store}
      moduleIds={MODULE_IDS}
      title="Tangram Town"
      subtitle="Pick a picture to build"
      tone="ocean"
      world={WORLD}
      cards={CARDS}
      Levels={TtLevels}
      Round={TangramRound}
      finale={finale}
      starsFor={starsFor}
      voice={{ welcome: "tangram-welcome" }}
    />
  );
}
