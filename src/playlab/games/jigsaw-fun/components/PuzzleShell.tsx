"use client";

import { useCallback, useMemo, type ComponentType, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import type { NavTone } from "@shared/components/ui/NavPillButton";
import { cheerFor } from "@shared/audio/cheers";
import { playClip } from "@shared/audio/voice";
import { cheerSeed, type Level } from "@games/jigsaw-fun/constants/levels";
import type { PuzzleScreen, PuzzleState } from "@games/jigsaw-fun/store/puzzleStore";
import { PuzzleHome, type PuzzleCard } from "@games/jigsaw-fun/components/PuzzleHome";
import { PuzzleComplete, type PuzzleFinale } from "@games/jigsaw-fun/components/PuzzleComplete";

/** What a game's level picker is handed. */
export interface PuzzleLevelsProps<M extends string> {
  module: M;
  best: Partial<Record<string, number>>;
  onPick: (level: Level) => void;
  onBack: () => void;
  onExitPortal: () => void;
}

/** What a game's puzzle board is handed. */
export interface PuzzleRoundProps<M extends string> {
  module: M;
  level: Level;
  onMiss: () => void;
  onSolved: () => void;
  onHome: () => void;
  onExitPortal: () => void;
}

/** A game's narration around its puzzles — each a manifest clip id. */
export interface PuzzleVoice<M extends string> {
  /** Said when the pictures appear. */
  welcome?: string;
  /** Said the moment a picture is picked ("Let's make the lion!"). */
  picked?: (module: M) => string | undefined;
  /** Said on the star card once its cheer has finished. */
  finished?: (level: Level) => string | undefined;
}

/** GAME_DEV: no `mode="wait"` on the screen router; the leaving screen takes no taps. */
const SCREEN = {
  ...PAGE_TRANSITION,
  exit: { ...PAGE_TRANSITION.exit, pointerEvents: "none" as const },
};

/** Browser Back walks the game the way a child walked in: pictures → how
 *  hard → the puzzle (and its star card). */
function toBucket(screen: PuzzleScreen): "menu" | "level" | "play" {
  if (screen === "home") return "menu";
  if (screen === "level") return "level";
  return "play";
}

/**
 * THE GAME AROUND THE PUZZLES — Jigsaw Fun and Tangram Town are both this:
 * the pictures → how hard (the game's `Levels`) → one puzzle (its `Round`) →
 * the star card. Each game hands in its store, words, world, picture cards,
 * level picker, board and what its star card shows; the screens, history,
 * music and cheers are the same.
 */
export function PuzzleShell<M extends string>({
  prefix,
  store,
  moduleIds,
  title,
  subtitle,
  tone,
  world,
  cards,
  Levels,
  Round,
  finale,
  starsFor,
  voice,
}: {
  /** The game's class prefix ("jf", "tt"). */
  prefix: string;
  /** The game's store (`createPuzzleStore`), already subscribed to. */
  store: PuzzleState<M>;
  moduleIds: readonly M[];
  title: string;
  subtitle: string;
  tone: NavTone;
  /** Behind the picker and the star card (the roomy version of the world). */
  world: ReactNode;
  cards: readonly PuzzleCard<M>[];
  Levels: ComponentType<PuzzleLevelsProps<M>>;
  Round: ComponentType<PuzzleRoundProps<M>>;
  finale: (module: M, level: Level) => PuzzleFinale;
  starsFor: (misses: number) => number;
  /** What the game says on its own screens (optional: silent without). */
  voice?: PuzzleVoice<M>;
}) {
  const router = useRouter();
  const { screen, module, level, misses, best, setScreen, toHome, choose, play, miss, finish } =
    store;

  const exitPortal = useCallback(() => router.push(PORTAL_ROUTE), [router]);
  const picked = voice?.picked;
  const pick = useCallback(
    (m: M) => {
      const clip = picked?.(m);
      if (clip) void playClip(clip);
      choose(m);
    },
    [picked, choose]
  );

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu" || !module) setScreen("home");
      else if (bucket === "level") setScreen("level");
      else play(level);
    },
    [setScreen, play, module, level]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => toHome(),
    silentScreen: "home",
  });

  // the puzzle on screen reports itself done — and only itself (see finish)
  const solved = useCallback(() => {
    if (module) finish(module, level);
  }, [finish, module, level]);
  const pictureIndex = module ? moduleIds.indexOf(module) : 0;
  const card = useMemo(
    () => (module && screen === "complete" ? finale(module, level) : null),
    [finale, module, level, screen]
  );

  return (
    <GameStage>
      <div className={`${prefix}-root`}>
        <AnimatePresence>
          {screen === "home" && (
            <motion.div key="home" className={`${prefix}-layer`} {...SCREEN}>
              <PuzzleHome
                prefix={prefix}
                title={title}
                subtitle={subtitle}
                tone={tone}
                world={world}
                cards={cards}
                best={best}
                welcome={voice?.welcome}
                onPick={pick}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}
          {screen === "level" && module && (
            <motion.div key={`level-${module}`} className={`${prefix}-layer`} {...SCREEN}>
              <Levels
                module={module}
                best={best}
                onPick={play}
                onBack={toHome}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}
          {screen === "play" && module && (
            <motion.div key={`${module}-${level}`} className={`${prefix}-layer`} {...SCREEN}>
              <Round
                module={module}
                level={level}
                onMiss={miss}
                onSolved={solved}
                onHome={toHome}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}
          {screen === "complete" && card && (
            <motion.div key="complete" className={`${prefix}-layer`} {...SCREEN}>
              <PuzzleComplete
                prefix={prefix}
                world={world}
                finale={card}
                level={level}
                stars={starsFor(misses)}
                cheerId={cheerFor(cheerSeed(pictureIndex, level, misses + 1))}
                afterCheer={voice?.finished?.(level)}
                onPlay={play}
                onChoose={toHome}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameStage>
  );
}
