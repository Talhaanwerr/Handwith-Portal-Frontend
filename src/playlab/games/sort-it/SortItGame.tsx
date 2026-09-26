"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { playClickSound } from "@shared/audio/sfx";
import { useSortStore, type SortScreen } from "@games/sort-it/store/sortStore";
import { activitiesFor, type Rule } from "@games/sort-it/constants/activities";
import { SortBoard } from "@games/sort-it/components/SortBoard";
import { AllDone, ModuleScreen, SplashScreen } from "@games/sort-it/components/SortScreens";

function toBucket(screen: SortScreen): "menu" | "pick" | "play" {
  if (screen === "splash") return "menu";
  if (screen === "pick") return "pick";
  return "play";
}

/**
 * SORT IT — classification for the pre-reading age.
 *
 * Two boards, a pile of things, and a rule shown rather than stated: each
 * board opens with one worked example and silhouettes of what is still to
 * come. Four activities alternate between sorting by SIZE (the same picture,
 * big and small) and sorting by KIND (food or animal, things that go or
 * animals) — one engine, because correctness is a comparison of groups and
 * never of positions.
 *
 * Every picture is Blend & Seek's Twemoji set and the grown-up is Key Quest's
 * teacher; the silhouettes are those same pictures with the colour taken out.
 */
export function SortItGame() {
  const router = useRouter();
  const { screen, rule, index, setScreen, beginModule, next } = useSortStore();

  const activities = activitiesFor(rule);
  const activity = activities[Math.min(index, activities.length - 1)];

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") setScreen("splash");
      else if (bucket === "pick") setScreen("pick");
      else setScreen(index >= activities.length ? "complete" : "play");
    },
    [setScreen, index, activities.length]
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

  const pick = useCallback((r: Rule) => beginModule(r), [beginModule]);

  return (
    <GameStage>
      <div className="so-root">
        <AnimatePresence mode="wait">
          {screen === "splash" && (
            <motion.div key="splash" className="absolute inset-0" {...PAGE_TRANSITION}>
              <SplashScreen onStart={() => setScreen("pick")} onExitPortal={exitPortal} />
            </motion.div>
          )}

          {screen === "pick" && (
            <motion.div key="pick" className="absolute inset-0" {...PAGE_TRANSITION}>
              <ModuleScreen onPick={pick} onBack={() => setScreen("splash")} />
            </motion.div>
          )}

          {screen === "play" && index < activities.length && (
            <motion.div key={activity.id} className="absolute inset-0" {...PAGE_TRANSITION}>
              {/* keyed by activity — every board mounts empty */}
              <SortBoard
                activity={activity}
                index={index}
                total={activities.length}
                onSolved={next}
                onBack={() => setScreen("pick")}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}

          {screen === "complete" && (
            <motion.div key="complete" className="absolute inset-0" {...PAGE_TRANSITION}>
              <AllDone onAgain={() => setScreen("pick")} onExitPortal={exitPortal} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameStage>
  );
}
