"use client";

import { Picture } from "@games/blend-read/components/PictureArt";
import { harderThan, type Level } from "@games/jigsaw-fun/constants/levels";
import { useJigsawFunStore } from "@games/jigsaw-fun/store/jigsawFunStore";
import { PuzzleShell, type PuzzleVoice } from "@games/jigsaw-fun/components/PuzzleShell";
import type { PuzzleCard } from "@games/jigsaw-fun/components/PuzzleHome";
import type { PuzzleFinale } from "@games/jigsaw-fun/components/PuzzleComplete";
import { Playroom } from "@games/jigsaw-fun/components/JfStage";
import { JfLevels } from "@games/jigsaw-fun/components/JfLevels";
import { JigsawRound } from "@games/jigsaw-fun/components/JigsawRound";
import { JigsawBoard } from "@games/jigsaw-fun/components/JigsawArt";
import {
  MODULES,
  MODULE_IDS,
  gridOf,
  sceneOf,
  starsFor,
  type ModuleId,
} from "@games/jigsaw-fun/constants/jigsaw";

const pieceCount = (level: Level) => gridOf(level).cols * gridOf(level).rows;
const allIn = (level: Level) => Array.from({ length: pieceCount(level) }, () => true);

const WORLD = <Playroom roomy />;

/** Each picture's card: its jigsaw at the Hard cut, cut lines and all. */
const CARDS: readonly PuzzleCard<ModuleId>[] = MODULES.map((m) => ({
  id: m.id,
  name: m.name,
  accent: m.accent,
  art: <JigsawBoard module={m.id} level="hard" placed={allIn("hard")} idPrefix="jf-h" />,
  aria: `The ${m.name} jigsaw`,
}));

/** The star card: the picture finished in a gold frame, its animal jumping out. */
function finale(module: ModuleId, level: Level): PuzzleFinale {
  const scene = sceneOf(module);
  return {
    accent: scene.accent,
    cast: [0, 1, 2, 3].map((i) => (
      <span key={i} className="jf-cast">
        <Picture id={scene.picture} />
      </span>
    )),
    art: <JigsawBoard module={module} level={level} placed={allIn(level)} solved idPrefix="jf-f" />,
    hero: <Picture id={scene.picture} />,
    line: `You finished the ${scene.name} in ${pieceCount(level)} pieces!`,
    harderLabel: (up) => `Try ${pieceCount(up)} pieces`,
    lean: -1,
  };
}

/** The narration around the puzzles: hello, the picture picked, and on the
 *  star card the way on (more pieces, or praise for finishing Hard). */
const VOICE: PuzzleVoice<ModuleId> = {
  welcome: "jigsaw-welcome",
  picked: (m) => `jigsaw-start-${m}`,
  finished: (level) => (harderThan(level) ? "jigsaw-done-more" : "jigsaw-done-hard"),
};

/**
 * JIGSAW FUN — pick a picture, pick how many pieces (4, 6 or 9), and put it
 * together: real knobbed pieces, dragged from a puzzle box onto a wooden board
 * in a quiet playroom.
 */
export function JigsawFunGame() {
  const store = useJigsawFunStore();
  return (
    <PuzzleShell
      prefix="jf"
      store={store}
      moduleIds={MODULE_IDS}
      title="Jigsaw Fun"
      subtitle="Pick a picture"
      tone="kitchen"
      world={WORLD}
      cards={CARDS}
      Levels={JfLevels}
      Round={JigsawRound}
      finale={finale}
      starsFor={starsFor}
      voice={VOICE}
    />
  );
}
