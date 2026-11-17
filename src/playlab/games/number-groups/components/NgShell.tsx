"use client";

import { useCallback, useState, type ComponentType, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { ROUND_COUNT, type GameVoice, type ModuleInfo } from "@games/number-groups/constants/kit";
import type { ModuleScreen, ModuleStore } from "@games/number-groups/store/createModuleStore";
import { NgHome } from "@games/number-groups/components/NgHome";
import { NgComplete } from "@games/number-groups/components/NgComplete";
import { NgCheckpoint } from "@games/number-groups/components/NgCheckpoint";
import { GuideProvider, type GuideProps } from "@games/number-groups/components/NgGuide";
import { GuidedContext, RoundCountContext } from "@games/number-groups/components/NgGuided";
import { FirstPlayHand } from "@shared/hooks/useIdleHand";
import type { RoundProps } from "@games/number-groups/components/roundProps";

/** GAME_DEV: no `mode="wait"` on the screen router; the leaving screen takes no taps. */
const SCREEN = {
  ...PAGE_TRANSITION,
  exit: { ...PAGE_TRANSITION.exit, pointerEvents: "none" as const },
};

function toBucket(screen: ModuleScreen): "menu" | "play" {
  return screen === "home" ? "menu" : "play";
}

/**
 * THE GAME AROUND THE MODULES — Count & Match and Number Hunt are both this:
 * a title screen of module cards → four rounds of one module → the star card.
 * Each game hands in its own name, store, modules, round components, module
 * miniatures and the world its title screen stands in.
 *
 * A game of ONE module (`single`, with exactly one module) has no cards to
 * pick from: its title screen is the name and one big Play card, and its star
 * card has no "Pick another". Such a game may also play more rounds a run
 * (`roundCount`, the same number its store was made with).
 */
export function NgShell<Id extends string>({
  title,
  voice,
  store,
  modules,
  rounds,
  Mini,
  world,
  children,
  beforeStart,
  guide,
  guided = false,
  single = false,
  roundCount = ROUND_COUNT,
  breakEvery = 0,
}: {
  title: string;
  /** The game's welcome and finish lines (clip ids). */
  voice: GameVoice;
  /** The game's own store (`createModuleStore`), already subscribed to. */
  store: ModuleStore<Id>;
  modules: readonly ModuleInfo<Id>[];
  rounds: Record<Id, ComponentType<RoundProps>>;
  /** A module in miniature, for its home card and the star card. */
  Mini: ComponentType<{ id: Id }>;
  /** Behind the title screen and the star card. */
  world: ReactNode;
  /** Mounted once under the screens (e.g. shared SVG gradients). */
  children?: ReactNode;
  /** See NgHome: lets a game ask something (a level) before a module starts. */
  beforeStart?: (m: Id, go: () => void) => boolean;
  /** Who stands in the teacher's corner, with the bubble (default: the
   *  teacher). A round can still put someone else there with GuideProvider. */
  guide?: ComponentType<GuideProps>;
  /** The guided layout (see NgGuided): everything centred, the instruction in
   *  a thin bar at the top, the teaching hand straight away on round one. */
  guided?: boolean;
  /** One game, one module: a title screen with one big Play card instead of
   *  module cards, and no "Pick another" on the star card. Only takes effect
   *  when `modules` has exactly one entry. */
  single?: boolean;
  /** Rounds a run (default the kit's four) — the store's own count. */
  roundCount?: number;
  /** A long run's breaks: after every this many rounds (not after the last)
   *  a celebration card asks Continue or Back. 0 (default): no breaks. */
  breakEvery?: number;
}) {
  const router = useRouter();
  const { screen, module, round, misses, best } = store;
  const { setScreen, toHome, start, advance, miss, restart, record } = store;

  const exitPortal = useCallback(() => router.push(PORTAL_ROUTE), [router]);

  /** The break card is up (the next round waits behind it). */
  const [paused, setPaused] = useState(false);
  /** Every way into a run clears a break left over from the last one. */
  const startRun = useCallback(
    (m: Id) => {
      setPaused(false);
      start(m);
    },
    [start]
  );
  const replay = useCallback(() => {
    setPaused(false);
    restart();
  }, [restart]);
  const backHome = useCallback(() => {
    setPaused(false);
    toHome();
  }, [toHome]);
  const roundDone = useCallback(() => {
    const next = round + 1;
    advance();
    if (breakEvery > 0 && next < roundCount && next % breakEvery === 0) setPaused(true);
  }, [advance, breakEvery, round, roundCount]);
  const parts = breakEvery > 0 ? Math.ceil(roundCount / breakEvery) : 1;

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "play" && module) setScreen(round >= roundCount ? "complete" : "play");
      else setScreen("home");
    },
    [setScreen, module, round, roundCount]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => toHome(),
    silentScreen: "home",
  });

  const Round: ComponentType<RoundProps> | null = module ? rounds[module] : null;
  const info = modules.find((m) => m.id === module);
  const solo = single && modules.length === 1;

  return (
    <GameStage>
      <GuidedContext.Provider value={guided}>
        <RoundCountContext.Provider value={roundCount}>
          <GuideProvider guide={guide}>
            <div className={`ng-root ${guided ? "ng-root--guided" : ""}`}>
              {children}
              <AnimatePresence>
                {screen === "home" && (
                  <motion.div key="home" className="ng-layer" {...SCREEN}>
                    <NgHome
                      title={title}
                      welcomeClip={voice.welcome}
                      modules={modules}
                      Mini={Mini}
                      world={world}
                      best={best}
                      onPick={startRun}
                      beforeStart={beforeStart}
                      onExitPortal={exitPortal}
                      single={solo}
                    />
                  </motion.div>
                )}
                {screen === "play" && paused && info && (
                  <motion.div key={`break-${round}`} className="ng-layer" {...SCREEN}>
                    <NgCheckpoint
                      info={info}
                      world={world}
                      cheerSeed={round + misses + 5}
                      part={Math.floor(round / breakEvery)}
                      parts={parts}
                      onContinue={() => setPaused(false)}
                      onBack={backHome}
                    />
                  </motion.div>
                )}
                {screen === "play" && !paused && Round && round < roundCount && (
                  <motion.div key={`${module}-${round}`} className="ng-layer" {...SCREEN}>
                    <FirstPlayHand on={guided && round === 0}>
                      <Round
                        round={round}
                        title={title}
                        onDone={roundDone}
                        onMiss={miss}
                        onHome={toHome}
                        onExitPortal={exitPortal}
                      />
                    </FirstPlayHand>
                  </motion.div>
                )}
                {screen === "complete" && info && (
                  <motion.div key="complete" className="ng-layer" {...SCREEN}>
                    <NgComplete
                      info={info}
                      mini={<Mini id={info.id} />}
                      world={world}
                      cheerSeed={modules.indexOf(info) + misses + 2}
                      doneClip={voice.done}
                      misses={misses}
                      onPlayAgain={replay}
                      onChoose={toHome}
                      onExitPortal={exitPortal}
                      onRecord={record}
                      roundCount={roundCount}
                      single={solo}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GuideProvider>
        </RoundCountContext.Provider>
      </GuidedContext.Provider>
    </GameStage>
  );
}
