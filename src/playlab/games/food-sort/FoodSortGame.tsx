"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { playClickSound } from "@shared/audio/sfx";
import { CandyDefs } from "@games/letter-treats/components/candy-world/CandyDefs";
import { KitchenBackdrop } from "@games/magnet-match/components/KitchenBackdrop";
import { useFoodSortStore, type FoodScreen } from "@games/food-sort/store/foodSortStore";
import { moduleById, type ModuleId } from "@games/food-sort/constants/activities";
import { SortingBoard } from "@games/food-sort/components/SortingBoard";
import { AllDone, PickScreen, SplashScreen } from "@games/food-sort/components/FoodScreens";

/** Coarse history buckets, so the browser Back button walks the game the way
 *  a child walked in: title → which module → playing. */
function toBucket(screen: FoodScreen): "menu" | "pick" | "play" {
  if (screen === "splash") return "menu";
  if (screen === "pick") return "pick";
  return "play";
}

/**
 * The portal's page transition, plus one rule: a screen on its way OUT takes
 * no taps. Screens cross-fade rather than waiting for each other — waiting let
 * a second screen change, arriving while a screen was still leaving, strand
 * that screen on show while the game had moved on underneath it.
 */
const SCREEN = {
  ...PAGE_TRANSITION,
  exit: { ...PAGE_TRANSITION.exit, pointerEvents: "none" as const },
};

/**
 * SORTING FOOD — four modules of sorting tables a child picks between:
 * Colours, Shapes, Sizes and Kitchen, four tables each, easiest first. The
 * first tables are the reference's five screens; the rest follow the same
 * idea with harder rules (three and four places, no colour hints, three
 * sizes, food or toys, hot or cold).
 *
 * One board component plays every table from data. The kitchen is Magnet
 * Match's, the chef is Blend & Seek's picture, the food is Letter Treats',
 * the cookies and shapes are Leo's Puzzles', and the picker, the drag, the
 * hand, the confetti and the cheer are the portal's shared kit.
 */
export function FoodSortGame() {
  const router = useRouter();
  const screen = useFoodSortStore((s) => s.screen);
  const moduleId = useFoodSortStore((s) => s.module);
  const index = useFoodSortStore((s) => s.index);
  const finished = useFoodSortStore((s) => s.finished);
  const setScreen = useFoodSortStore((s) => s.setScreen);
  const begin = useFoodSortStore((s) => s.begin);
  const next = useFoodSortStore((s) => s.next);

  const current = moduleById(moduleId);
  const total = current.activities.length;

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("splash");
      else if (bucket === "pick") setScreen("pick");
      else setScreen(index >= total ? "done" : "play");
    },
    [setScreen, index, total]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => setScreen("splash"),
    silentScreen: "splash",
  });

  const exitPortal = useCallback(() => {
    playClickSound();
    router.push(PORTAL_ROUTE);
  }, [router]);

  const toPick = useCallback(() => setScreen("pick"), [setScreen]);
  const pick = useCallback((m: ModuleId) => begin(m), [begin]);

  const activity = current.activities[Math.min(index, total - 1)];

  return (
    <GameStage>
      <div className="sf-root">
        {/* the fruit art's gradients, once for the whole game */}
        <CandyDefs />
        {/* Magnet Match's kitchen — wall, stove, shelves, counter — behind
            every screen; each table is a crisp panel standing in front of it */}
        <KitchenBackdrop />

        <AnimatePresence>
          {screen === "splash" && (
            <motion.div key="splash" className="absolute inset-0" {...SCREEN}>
              <SplashScreen onStart={toPick} onExitPortal={exitPortal} />
            </motion.div>
          )}

          {screen === "pick" && (
            <motion.div key="pick" className="absolute inset-0" {...SCREEN}>
              <PickScreen finished={finished} onPick={pick} onBack={() => setScreen("splash")} />
            </motion.div>
          )}

          {screen === "play" && index < total && (
            <motion.div key={activity.id} className="absolute inset-0" {...SCREEN}>
              {/* keyed by table — every table starts clean */}
              <SortingBoard
                activity={activity}
                index={index}
                total={total}
                first={index === 0}
                onNext={next}
                onBack={toPick}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}

          {screen === "done" && (
            <motion.div key="done" className="absolute inset-0" {...SCREEN}>
              <AllDone
                label={current.label}
                tables={total}
                onAgain={() => begin(moduleId)}
                onChoose={toPick}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameStage>
  );
}
