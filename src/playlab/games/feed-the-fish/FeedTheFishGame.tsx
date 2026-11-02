"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { ChoiceScreen, type Choice } from "@shared/components/game/ChoiceScreen";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { useHowToPlay } from "@shared/components/ui/HowToPlayGate";
import { useGameSession } from "@shared/hooks/useGameSession";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { playClickSound } from "@shared/audio/sfx";
import { clipText } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { LeavePill } from "@games/jigsaw-fun/components/JfStage";
import { FinaleRain, useFinaleCheer } from "@games/jigsaw-fun/components/Cheer";
import { CandyDefs } from "@games/letter-treats/components/candy-world/CandyDefs";
import { FishArt } from "@games/feed-the-fish/components/FishArt";
import { FeedRound, FtfWorld } from "@games/feed-the-fish/components/FeedRound";
import {
  DONE_CLIP,
  MODULES,
  WELCOME_CLIP,
  type FishHue,
  type ModuleId,
} from "@games/feed-the-fish/constants/rounds";

/** GAME_DEV: no `mode="wait"`; the leaving screen takes no taps. */
const SCREEN = {
  ...PAGE_TRANSITION,
  exit: { ...PAGE_TRANSITION.exit, pointerEvents: "none" as const },
};

type Screen = "pick" | "play" | "done";

const OPTIONS: readonly Choice<ModuleId>[] = [
  {
    value: "everyone",
    preview: "🐠🐟",
    label: "Feed Everyone",
    aria: "Play Feed Everyone: feed every fish until they all sleep",
    variant: "everyone",
  },
  {
    value: "colour",
    preview: "🐡🎨",
    label: "Feed the Colour Fish",
    aria: "Play Feed the Colour Fish: feed the fish of the colour you hear",
    variant: "colour",
  },
];

const CAST: readonly FishHue[] = ["yellow", "pink", "orange", "green"];

/**
 * FEED THE FISH — a calm aquarium for children from two. Tap the water and
 * a flake drops in and sinks; the nearest hungry fish swims over and
 * nibbles it, grows a little, and once full drifts to its seaweed bed and
 * sleeps. Feed Everyone puts 2 to 4 hungry fish in each round; Feed the
 * Colour Fish names one colour and counts that fish's bites aloud.
 */
export function FeedTheFishGame() {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("pick");
  const [mod, setMod] = useState<ModuleId>("everyone");
  const [run, setRun] = useState(0);
  const exit = useCallback(() => router.push(PORTAL_ROUTE), [router]);
  const { gate } = useHowToPlay();

  useGameSession({
    screen,
    step: screen === "pick" ? "menu" : "play",
    onHistoryPop: (step) => setScreen(step === "menu" ? "pick" : "play"),
    onEnter: () => setScreen("pick"),
    silentScreen: "pick",
  });

  return (
    <GameStage>
      <div className="ftf-root">
        {/* Letter Treats' lit gradients, for the fish and the sea friends */}
        <CandyDefs />
        <AnimatePresence>
          {screen === "pick" && (
            <motion.div key="pick" className="ftf-layer" {...SCREEN}>
              <Pick
                onPick={(m) =>
                  gate(() => {
                    setMod(m);
                    setRun((r) => r + 1);
                    setScreen("play");
                  }, m)
                }
                onExit={exit}
              />
            </motion.div>
          )}
          {screen === "play" && (
            <motion.div key={`play-${run}`} className="ftf-layer" {...SCREEN}>
              <FeedRound info={MODULES[mod]} onDone={() => setScreen("done")} />
              <NavPillButton
                label="Back"
                ariaLabel="Back to choosing a game"
                tone="ocean"
                surface="strong"
                pinned
                onClick={() => {
                  playClickSound();
                  setScreen("pick");
                }}
              />
              <LeavePill className="ftf-leave" onExit={exit} />
            </motion.div>
          )}
          {screen === "done" && (
            <motion.div key="done" className="ftf-layer" {...SCREEN}>
              <Done
                seed={run}
                onAgain={() => {
                  playClickSound();
                  setRun((r) => r + 1);
                  setScreen("play");
                }}
                onHome={() => setScreen("pick")}
                onExit={exit}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameStage>
  );
}

function Pick({ onPick, onExit }: { onPick: (m: ModuleId) => void; onExit: () => void }) {
  useSayOnEnter([WELCOME_CLIP]);
  return (
    <ChoiceScreen
      title="Feed the Fish"
      subtitle="Pick a game!"
      backdrop={<FtfWorld />}
      tone="ocean"
      backAriaLabel="Back to the game portal"
      onBack={onExit}
      onPick={onPick}
      options={OPTIONS}
    />
  );
}

function Done({
  seed,
  onAgain,
  onHome,
  onExit,
}: {
  seed: number;
  onAgain: () => void;
  onHome: () => void;
  onExit: () => void;
}) {
  const cheer = cheerFor(seed + 1);
  useFinaleCheer(cheer, DONE_CLIP);
  const cast = useMemo(
    () =>
      CAST.map((h) => (
        <span key={h} className="ftf-cast">
          <FishArt hue={h} mood="content" />
        </span>
      )),
    []
  );
  return (
    <div className="ftf-done">
      <FtfWorld />
      <FinaleRain cast={cast} />
      <NavPillButton
        label="Back"
        ariaLabel="Back to choosing a game"
        tone="ocean"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onHome();
        }}
      />
      <LeavePill className="ftf-leave" onExit={onExit} />
      <div className="ftf-card-wrap">
        <motion.div
          className="ftf-card"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
        >
          <span className="ftf-card-hero" aria-hidden="true">
            {CAST.slice(0, 3).map((h) => (
              <span key={h} className={`ftf-card-fish ftf-card-fish--${h}`}>
                <FishArt hue={h} mood="asleep" />
              </span>
            ))}
          </span>
          <p className="ftf-card-cheer font-rounded font-black">{clipText(cheer)}</p>
          <div className="ftf-card-row">
            <button
              type="button"
              className="ftf-card-btn ftf-card-btn--go font-rounded font-black"
              onClick={onAgain}
            >
              Play again
            </button>
            <button
              type="button"
              className="ftf-card-btn font-rounded font-black"
              onClick={() => {
                playClickSound();
                onHome();
              }}
            >
              Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
