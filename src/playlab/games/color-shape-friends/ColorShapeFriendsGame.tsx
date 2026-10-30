"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { useGameSession } from "@shared/hooks/useGameSession";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { playClickSound } from "@shared/audio/sfx";
import { clipText, stopVoice } from "@shared/audio/voice";
import {
  useColorShapeFriendsStore,
  type CsfScreen,
} from "@games/color-shape-friends/store/colorShapeFriendsStore";
import {
  PICK_CLIP,
  SORTER_BOARDS,
  TAP_ROUNDS,
  promptFor,
  roundCount,
  starsFor,
} from "@games/color-shape-friends/constants/rounds";
import { Playroom } from "@games/color-shape-friends/components/Playroom";
import { Hud } from "@games/color-shape-friends/components/Hud";
import { HomeScreen } from "@games/color-shape-friends/components/HomeScreen";
import { TapRound } from "@games/color-shape-friends/components/TapRound";
import { SorterRound } from "@games/color-shape-friends/components/SorterRound";
import { CompleteScreen } from "@games/color-shape-friends/components/CompleteScreen";

/** Coarse history buckets: the title screen is "menu", a module and its
 *  finish card are "play" — the grain every other game uses. */
function toBucket(screen: CsfScreen): "menu" | "play" {
  return screen === "home" ? "menu" : "play";
}

/** Cross-fading screens, per GAME_DEV.md: never `mode="wait"`; the screen on
 *  its way out takes no taps. */
const SCREEN = {
  ...PAGE_TRANSITION,
  exit: { ...PAGE_TRANSITION.exit, pointerEvents: "none" as const },
};

const HOME_PROMPT = clipText(PICK_CLIP);

/**
 * COLOR & SHAPE FRIENDS — three calm little modules in Berry's playroom.
 *
 * The title screen offers three cards; each module is ONE mechanic repeated
 * in the same layout with new content every round, a progress bar across
 * the rounds, and a star card at the end (Math Maze's and Number Safari's
 * shape):
 *
 *   Colors — six rounds of "Find the red one!" on Berry's shelf
 *   Shapes — six rounds of "Tap the triangle!" on three easels
 *   Sorter — four boards of blocks to put in their matching holes
 *
 * The playroom and the HUD (plate, bar, the two pills) are mounted once
 * here; only the round in front of them changes. Berry (an original red
 * furry character — see components/Friends.tsx) hosts every screen.
 */
export function ColorShapeFriendsGame() {
  const router = useRouter();
  const screen = useColorShapeFriendsStore((s) => s.screen);
  const active = useColorShapeFriendsStore((s) => s.module);
  const round = useColorShapeFriendsStore((s) => s.round);
  const misses = useColorShapeFriendsStore((s) => s.misses);
  const best = useColorShapeFriendsStore((s) => s.best);
  const goHome = useColorShapeFriendsStore((s) => s.goHome);
  const begin = useColorShapeFriendsStore((s) => s.begin);
  const addMiss = useColorShapeFriendsStore((s) => s.addMiss);
  const nextRound = useColorShapeFriendsStore((s) => s.nextRound);

  const handlePop = useCallback(
    (bucket: string) => {
      if (bucket === "menu") goHome();
    },
    [goHome]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => goHome(), // always enter through the title screen
    silentScreen: "home",
  });

  const exitPortal = useCallback(() => {
    playClickSound();
    router.push(PORTAL_ROUTE);
  }, [router]);

  const total = roundCount(active);
  const tapRound = active === "sorter" ? null : TAP_ROUNDS[active][round];
  const board = active === "sorter" ? SORTER_BOARDS[round] : null;

  return (
    <GameStage>
      <div className="csf-root" data-screen={screen} data-module={active}>
        <Playroom />

        <AnimatePresence initial={false}>
          {screen === "home" && (
            <motion.div key="home" className="csf-screen-wrap" {...SCREEN}>
              <HomeScreen best={best} onPick={begin} />
            </motion.div>
          )}
          {screen === "play" && (
            <motion.div key={`${active}-${round}`} className="csf-screen-wrap" {...SCREEN}>
              {tapRound && active !== "sorter" && (
                <TapRound module={active} round={tapRound} onMiss={addMiss} onSolved={nextRound} />
              )}
              {board && <SorterRound board={board} onMiss={addMiss} onSolved={nextRound} />}
            </motion.div>
          )}
          {screen === "complete" && (
            <motion.div key="complete" className="csf-screen-wrap" {...SCREEN}>
              <CompleteScreen
                module={active}
                stars={starsFor(misses)}
                onAgain={() => begin(active)}
                onChoose={goHome}
                onExitPortal={exitPortal}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {screen === "home" && <Hud prompt={HOME_PROMPT} showTitle progress={null} />}
        {screen === "play" && (
          <Hud prompt={promptFor(active, round)} showTitle={false} progress={round / total} />
        )}

        {/* Top-left: on the title screen it leaves the game; inside a module
            it goes back to the title screen, the game's home. */}
        {screen === "home" && (
          <NavPillButton
            label="Back to Games"
            ariaLabel="Back to the game portal"
            tone="kitchen"
            surface="strong"
            pinned
            onClick={exitPortal}
          />
        )}
        {screen === "play" && (
          <>
            <NavPillButton
              label="Back"
              ariaLabel="Back to choosing a game"
              tone="kitchen"
              surface="strong"
              pinned
              onClick={() => {
                playClickSound();
                stopVoice(); // a queued round prompt must not follow us home
                goHome();
              }}
            />
            <div className="pl-exit-pill csf-exit">
              <NavPillButton
                label="Back to Games"
                ariaLabel="Back to the game portal"
                tone="kitchen"
                surface="strong"
                onClick={exitPortal}
              />
            </div>
          </>
        )}
      </div>
    </GameStage>
  );
}
