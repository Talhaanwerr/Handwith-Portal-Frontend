"use client";

import { useCallback, type ComponentType, type ReactNode } from "react";
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
}) {
  const router = useRouter();
  const { screen, module, round, misses, best } = store;
  const { setScreen, toHome, start, advance, miss, restart, record } = store;

  const exitPortal = useCallback(() => router.push(PORTAL_ROUTE), [router]);

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "play" && module) setScreen(round >= ROUND_COUNT ? "complete" : "play");
      else setScreen("home");
    },
    [setScreen, module, round]
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

  return (
    <GameStage>
      <div className="ng-root">
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
                onPick={start}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}
          {screen === "play" && Round && round < ROUND_COUNT && (
            <motion.div key={`${module}-${round}`} className="ng-layer" {...SCREEN}>
              <Round
                round={round}
                title={title}
                onDone={advance}
                onMiss={miss}
                onHome={toHome}
                onExitPortal={exitPortal}
              />
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
                onPlayAgain={restart}
                onChoose={toHome}
                onExitPortal={exitPortal}
                onRecord={record}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameStage>
  );
}
