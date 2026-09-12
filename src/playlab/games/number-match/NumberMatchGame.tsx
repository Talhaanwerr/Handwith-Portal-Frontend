"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { useGameSession } from "@shared/hooks/useGameSession";
import { useScheduler } from "@shared/hooks/useScheduler";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { playClickSound, playFanfare } from "@shared/audio/sfx";
import { clipText, playClip, stopVoice } from "@shared/audio/voice";
import { useMatchStore, type MatchScreen } from "@games/number-match/store/matchStore";
import { ROUNDS, TOTAL_ROUNDS, completesPage, pageOf } from "@games/number-match/constants/rounds";
import { Drift } from "@games/number-match/components/MatchArt";
import { RoundBoard } from "@games/number-match/components/RoundBoard";
import { MatchFinal, MatchHome } from "@games/number-match/components/MatchScreens";
import { PageTurn, StickerReward } from "@games/number-match/components/StickerBook";
import { Pal } from "@games/number-match/components/Pal";

/** Coarse history bucket: the start screen is "menu", the cards and the end
 *  are "play" — the same grain every other game uses. */
function toBucket(screen: MatchScreen): "menu" | "play" {
  return screen === "home" ? "menu" : "play";
}

/** One round slides away to the left as the next arrives from the right. */
const SLIDE = {
  initial: { x: "100%" },
  animate: { x: "0%" },
  exit: { x: "-100%" },
  transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] as const },
};

/** How long the won board holds — confetti, the friends jumping — before the
 *  sticker screen takes over. */
const CHEER_MS = 1000;
/** How long the sticker screen keeps the screen. */
const REWARD_MS = 2700;
/** How long a page takes to fill up and turn over. */
const TURN_MS = 3000;

/**
 * What the friends say, in turn.
 *
 * These are the portal's EXISTING cheer clips, and the words come out of the
 * manifest rather than being typed here — so what is on screen and what is
 * spoken can never drift apart, and this game needs no new audio recorded.
 */
const PRAISE_CLIPS = [
  "cheer-well-done",
  "cheer-great-job",
  "cheer-amazing",
  "cheer-you-did-it",
  "cheer-wonderful",
] as const;

/**
 * NUMBER MATCH.
 *
 * Twelve rounds of one puzzle: cards holding different numbers of the same
 * thing, an empty socket under each, and those numbers loose in a tray. Put
 * each number under the card it counts.
 *
 * Progress is a sticker book rather than a bar across the top. Every round
 * won is a sticker of the thing that round was about — it bursts up big
 * enough to fill the room and slaps down into the next slot — and four
 * stickers fill a page, which turns. Two friends stand either side of the
 * cards the whole time and jump when a round is won.
 */
export function NumberMatchGame() {
  const router = useRouter();
  const { screen, done, setScreen, start, nextRound, restart } = useMatchStore();
  /** The friends are mid-jump: this round has been won. */
  const [cheer, setCheer] = useState(false);
  /** The sticker screen is over the top of the cards. */
  const [reward, setReward] = useState(false);
  /** The page is turning over the top of everything. */
  const [turning, setTurning] = useState(false);
  const schedule = useScheduler();

  /**
   * Leaving a screen invalidates the celebration already in flight, so a
   * pending "next round" can never fire onto the screen that replaced it.
   */
  const genRef = useRef(0);
  const interrupt = useCallback(() => {
    genRef.current += 1;
    stopVoice();
    setCheer(false);
    setReward(false);
    setTurning(false);
  }, []);

  const playing = screen === "play" && done < TOTAL_ROUNDS;
  const round = ROUNDS[Math.min(done, TOTAL_ROUNDS - 1)];
  /** On the start screen the pill leaves the game; anywhere else it comes
   *  back here first. */
  const atHome = screen === "home";

  const handlePop = useCallback(
    (bucket: string) => {
      interrupt();
      setScreen(bucket === "menu" ? "home" : "play");
    },
    [interrupt, setScreen]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => setScreen("home"),
  });

  const open = useCallback(() => {
    interrupt();
    start();
  }, [interrupt, start]);

  /**
   * Every socket is full. The friends jump, then the round's sticker arrives
   * and goes into the book, and — if that sticker filled a page — the page
   * turns before the next round.
   */
  const handleSolved = useCallback(() => {
    const gen = genRef.current;
    const alive = () => genRef.current === gen;
    setCheer(true);
    void playClip(PRAISE_CLIPS[done % PRAISE_CLIPS.length]);

    schedule(() => {
      if (!alive()) return;
      setCheer(false);
      setReward(true);
    }, CHEER_MS);

    const lastRound = done + 1 >= TOTAL_ROUNDS;
    if (completesPage(done) && !lastRound) {
      schedule(() => {
        if (!alive()) return;
        setReward(false);
        setTurning(true);
        playFanfare();
      }, CHEER_MS + REWARD_MS);
      schedule(
        () => {
          if (!alive()) return;
          setTurning(false);
          nextRound();
        },
        CHEER_MS + REWARD_MS + TURN_MS
      );
      return;
    }

    schedule(() => {
      if (!alive()) return;
      setReward(false);
      nextRound();
    }, CHEER_MS + REWARD_MS);
  }, [done, schedule, nextRound]);

  const say = cheer ? clipText(PRAISE_CLIPS[done % PRAISE_CLIPS.length]) : undefined;

  return (
    <GameStage>
      <div className="nm-root">
        <div className="nm-canvas">
          {/* the sky drifts behind every screen, so it never restarts when
              one screen replaces another */}
          <Drift />

          <AnimatePresence mode="wait" initial={false}>
            {screen === "home" && (
              <motion.div key="home" className="nm-screen-wrap" {...PAGE_TRANSITION}>
                <MatchHome
                  done={done}
                  onStart={open}
                  onRestart={() => {
                    interrupt();
                    restart();
                  }}
                />
              </motion.div>
            )}

            {playing && (
              <motion.div key="play" className="nm-screen-wrap" {...PAGE_TRANSITION}>
                {/* the cards slide round to round inside the screen; the two
                    friends below stay where they are while they do */}
                <AnimatePresence mode="sync" initial={false}>
                  <motion.div key={done} className="nm-slide" {...SLIDE}>
                    <RoundBoard
                      round={round}
                      index={done}
                      locked={cheer || reward || turning}
                      onSolved={handleSolved}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}

            {screen === "final" && (
              <motion.div key="final" className="nm-screen-wrap" {...PAGE_TRANSITION}>
                <MatchFinal
                  onAgain={() => {
                    interrupt();
                    restart();
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {playing && <Pal cheer={cheer} say={say} />}

          <AnimatePresence>
            {reward && <StickerReward key="reward" index={done} />}
            {turning && <PageTurn key="turn" page={pageOf(done)} />}
          </AnimatePresence>
        </div>

        {/* The portal's own control, where every game puts it. It goes back
            ONE step: out of the cards to the start screen, and out of the
            start screen to the Library. */}
        <NavPillButton
          label={atHome ? "Back to Games" : "Back"}
          ariaLabel={atHome ? "Back to the game portal" : "Back to the start screen"}
          tone="plum"
          surface="strong"
          pinned
          onClick={() => {
            playClickSound();
            if (atHome) {
              router.push(PORTAL_ROUTE);
              return;
            }
            interrupt();
            setScreen("home");
          }}
        />
      </div>
    </GameStage>
  );
}
