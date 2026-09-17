"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { useGameSession } from "@shared/hooks/useGameSession";
import { useScheduler } from "@shared/hooks/useScheduler";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { playClickSound } from "@shared/audio/sfx";
import { clipText, playClip, sayAfter, stopVoice } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { useShapeStore, type ShapeScreen } from "@games/shape-match/store/shapeStore";
import {
  MODULES,
  ROUNDS_PER_MODULE,
  TOTAL_MODULES,
  roundAt,
  type Round,
} from "@games/shape-match/constants/modules";
import { Meadow } from "@games/shape-match/components/Meadow";
import { Leo, type LeoMood } from "@games/shape-match/components/Leo";
import { MatchBoard } from "@games/shape-match/components/MatchBoard";
import { CombineBoard } from "@games/shape-match/components/CombineBoard";
import { JigsawBoard } from "@games/shape-match/components/JigsawBoard";
import { SceneBoard } from "@games/shape-match/components/SceneBoard";
import { AnimalMeadow } from "@games/shape-match/components/AnimalMeadow";
import { ModuleDone } from "@games/shape-match/components/ModuleDone";
import { ShapeHome } from "@games/shape-match/components/ShapeHome";

/** Coarse history bucket: the picker is "menu", everything else is "play" —
 *  the same grain every other game uses. */
function toBucket(screen: ShapeScreen): "menu" | "play" {
  return screen === "home" ? "menu" : "play";
}

/** One round slides away to the left as the next arrives from the right. */
const SLIDE = {
  initial: { x: "100%" },
  animate: { x: "0%" },
  exit: { x: "-100%" },
  transition: { duration: 0.42, ease: [0.4, 0, 0.2, 1] as const },
};

/** How long the won board holds while Leo does his whole celebration — he
 *  notices, grins, throws his arms up, bounces, and points at what the child
 *  made, and none of that should be cut off by the next round arriving. */
const CHEER_MS = 2100;
/** The beat between two activities: the board goes, the meadow comes back,
 *  Leo says what is coming, and only then does the next board arrive. */
const INTERLUDE_MS = 1000;
/** How long Leo's little "yes!" lasts after a single piece goes in. */
const REACT_MS = 700;
/** And how long his sympathetic head shake lasts after one does not fit. */
const OOPS_MS = 900;
/** He looks at the new board for this long before settling. */
const WATCH_MS = 1300;
/** Nobody has touched anything for this long: he leans in and points at the
 *  answers — never at the RIGHT answer, just at where the answers are. */
const IDLE_HINT_MS = 4500;

/** What the narrator says as each board arrives — the banner, read aloud. */
function lineFor(round: Round): string {
  if (round.kind === "match") return "leo-match";
  if (round.kind === "combine") return "leo-combine";
  if (round.kind === "jigsaw") return "leo-jigsaw";
  if (round.kind === "scene") return "leo-scene-" + round.scene;
  return "leo-visitors";
}

/** And what he says in the meadow between two boards, about the next one. */
function nextLineFor(round: Round | undefined): string {
  if (round?.kind === "combine") return "leo-next-puzzle";
  if (round?.kind === "jigsaw") return "leo-next-jigsaw";
  if (round?.kind === "scene") return "leo-next-picture";
  if (round?.kind === "visitors") return "leo-next-visitors";
  return "leo-next-more";
}

/** How long a new board waits before it is read out: it is still sliding in. */
const ASK_AFTER_MS = 350;

/** Where the game is inside a round. */
type Phase = "play" | "cheer" | "interlude";

/** What Leo is doing about it, over and above the phase. */
type Aside = "none" | "yes" | "oops";

/**
 * SHAPES & PICTURES.
 *
 * A meadow, a lion cub called Leo, and eight modules to choose from. Each is
 * the same six beats:
 *
 *   MATCH    triangle on triangle, square on square
 *   COMBINE  [shape] + [shape] + [shape] = [?], four cards, one right
 *   COMBINE  again, with a different three
 *   JIGSAW   the picture in three tall pieces, one missing
 *   PICTURE  the picture missing its things — put them back
 *   MEET     four animals wander in to be said hello to
 *
 * LEO IS IN THE GAME, not beside it. He looks at each new board, watches the
 * child work, points at the answers if nothing has been touched for a few
 * seconds, bounces when a piece goes in, shakes his head kindly when one does
 * not, and runs a whole celebration when a round is won.
 *
 * The meadow is mounted ONCE, behind every screen, so the sky never restarts
 * between activities: the child looks up and it is the same afternoon.
 */
export function ShapeMatchGame() {
  const router = useRouter();
  const store = useShapeStore();
  const { screen, round, finished, openModule, nextRound, nextModule, goHome, resetAll } = store;
  const moduleIndex = store.module;
  const [phase, setPhase] = useState<Phase>("play");
  const [aside, setAside] = useState<Aside>("none");
  /** The board he has finished looking over — anything else means he is still
   *  taking this one in. Derived, so nothing has to be set on arrival. */
  const [settled, setSettled] = useState(-1);
  /** Nothing has been touched for a while. */
  const [nudging, setNudging] = useState(false);
  const schedule = useScheduler();

  /**
   * Leaving a screen invalidates the celebration already in flight, so a
   * pending "next round" can never fire onto the screen that replaced it.
   */
  const genRef = useRef(0);
  /**
   * THE ROUND THAT HAS ALREADY BEEN WON. A board reports "solved" from an
   * effect, and an effect can fire again as the screen re-renders around it
   * — a second `nextRound` from the same board would skip the one after it.
   * So a win is counted once per board, and the meadow effect below resets
   * this the moment a new board arrives.
   */
  const solvedSeed = useRef(-1);
  const interrupt = useCallback(() => {
    genRef.current += 1;
    stopVoice();
    setPhase("play");
    setAside("none");
  }, []);

  const playing = screen === "play";
  const current = roundAt(moduleIndex, round);
  const next = roundAt(moduleIndex, round + 1);
  /** The first module teaches every kind of round, ONCE — round 2 is the
   *  second three-piece puzzle, and a child who has just been shown that one
   *  does not need showing again. */
  const teach = moduleIndex === 0 && round !== 2;
  /** Fixes the cards, the tray and the missing piece for this round. */
  const seed = moduleIndex * ROUNDS_PER_MODULE + round;
  const atHome = screen === "home";

  /* ── Leo's attention ───────────────────────────────────────────────────── */

  /** A new board: he looks it over before settling down to watch. */
  const watching = playing && settled !== seed;

  useEffect(() => {
    if (!playing) return;
    // a fresh board: nothing about it has been won yet
    solvedSeed.current = -1;
    const settle = setTimeout(() => setSettled(seed), WATCH_MS);
    return () => clearTimeout(settle);
  }, [playing, seed]);

  /** THE BANNER IS READ ALOUD as each board slides in. */
  const line = current ? lineFor(current) : null;
  const kind = current?.kind;

  useEffect(() => {
    if (!playing || !line) return;
    // queued: it waits for "Now a puzzle!" to finish rather than cutting it
    const ask = setTimeout(() => void sayAfter(line), ASK_AFTER_MS);
    return () => clearTimeout(ask);
  }, [playing, seed, line]);

  /**
   * NOTHING HAS BEEN TOUCHED FOR A WHILE. Any pointer anywhere counts as the
   * child being busy, which is why this listens on the window rather than
   * asking every board to report in.
   */
  const nudgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playing) return;
    const wake = () => {
      setNudging(false);
      if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
      nudgeTimer.current = setTimeout(() => {
        setNudging(true);
        // he says it as well as pointing — except to the animals, where there
        // is nothing to put anywhere
        if (kind !== "visitors") void sayAfter("leo-hint");
      }, IDLE_HINT_MS);
    };
    wake();
    window.addEventListener("pointerdown", wake, true);
    return () => {
      window.removeEventListener("pointerdown", wake, true);
      if (nudgeTimer.current) clearTimeout(nudgeTimer.current);
    };
  }, [playing, seed, kind]);

  const handlePop = useCallback(
    (bucket: string) => {
      interrupt();
      if (bucket === "menu") goHome();
    },
    [interrupt, goHome]
  );

  useGameSession({
    screen,
    step: toBucket(screen),
    onHistoryPop: handlePop,
    onEnter: () => goHome(),
  });

  /** ONE PIECE WENT IN — not the whole round, just one piece. */
  const react = useCallback(() => {
    setAside("yes");
    schedule(() => setAside("none"), REACT_MS);
  }, [schedule]);

  /** AND ONE DID NOT FIT. A head shake and a worried little face, nothing more. */
  const commiserate = useCallback(() => {
    setAside("oops");
    void playClip("leo-oops");
    schedule(() => setAside("none"), OOPS_MS);
  }, [schedule]);

  /** A STRING, not the round object. `roundAt` now hands back the same round
   *  every time (the module's six are built once and kept), but a dependency
   *  that is a plain value cannot go stale on an identity change again — and a
   *  fresh object in this callback's dependencies is exactly what once made it
   *  fire twice and skip a round. */
  const nextLine = nextLineFor(next);

  /**
   * The round is won.
   *
   *   LEO CELEBRATES → THE MEADOW → THE NEXT ROUND
   *
   * The meadow beat in the middle matters: without it two activities snap into
   * each other and a small child never gets the moment of "that one is
   * finished" before the next thing starts. The last round of a module skips
   * it, because the party is the beat.
   */
  const handleSolved = useCallback(() => {
    if (solvedSeed.current === seed) return;
    solvedSeed.current = seed;
    const generation = genRef.current;
    const alive = () => genRef.current === generation;
    const lastOfModule = round + 1 >= ROUNDS_PER_MODULE;

    setAside("none");
    setPhase("cheer");
    void playClip(cheerFor(seed));

    if (lastOfModule) {
      schedule(() => {
        if (!alive()) return;
        setPhase("play");
        nextRound();
      }, CHEER_MS);
      return;
    }

    schedule(() => {
      if (!alive()) return;
      setPhase("interlude");
      void sayAfter(nextLine);
    }, CHEER_MS);
    schedule(() => {
      if (!alive()) return;
      setPhase("play");
      nextRound();
    }, CHEER_MS + INTERLUDE_MS);
  }, [round, seed, nextLine, schedule, nextRound]);

  /** What Leo is doing, in order of what matters most. */
  const mood: LeoMood =
    phase === "cheer"
      ? "cheer"
      : aside === "yes"
        ? "cheer"
        : aside === "oops"
          ? "oops"
          : phase === "interlude"
            ? "wave"
            : nudging
              ? "point"
              : watching
                ? "watch"
                : "idle";

  const say =
    phase === "cheer"
      ? clipText(cheerFor(seed))
      : phase === "interlude"
        ? next?.kind === "combine"
          ? "Now a puzzle!"
          : next?.kind === "jigsaw"
            ? "Which piece is gone?"
            : next?.kind === "scene"
              ? "Now a picture!"
              : next?.kind === "visitors"
                ? "Look who is coming!"
                : "One more!"
        : undefined;

  return (
    <GameStage>
      <div className="sm-root">
        <div className="sm-canvas">
          <div className="sm-stage">
            {/* the sky and the grass live behind every screen, so they never
                restart when one screen replaces another */}
            <Meadow />

            <AnimatePresence mode="wait" initial={false}>
              {screen === "home" && (
                <motion.div key="home" className="sm-screen-wrap" {...PAGE_TRANSITION}>
                  <ShapeHome
                    finished={finished}
                    onOpen={(index) => {
                      interrupt();
                      openModule(index);
                    }}
                    onReset={() => {
                      interrupt();
                      resetAll();
                    }}
                  />
                </motion.div>
              )}

              {playing && current && (
                <motion.div key="play" className="sm-screen-wrap" {...PAGE_TRANSITION}>
                  {/* the boards slide round to round; Leo stays where he is
                      while they do */}
                  <AnimatePresence mode="sync" initial={false}>
                    {phase !== "interlude" && (
                      <motion.div key={seed} className="sm-slide" {...SLIDE}>
                        {current.kind === "match" && (
                          <MatchBoard
                            pieces={current.pieces}
                            seed={seed}
                            locked={phase !== "play"}
                            teach={teach}
                            onGreet={react}
                            onWrong={commiserate}
                            onSolved={handleSolved}
                          />
                        )}
                        {current.kind === "combine" && (
                          <CombineBoard
                            set={current.set}
                            seed={seed}
                            locked={phase !== "play"}
                            teach={teach}
                            onWrong={commiserate}
                            onSolved={handleSolved}
                          />
                        )}
                        {current.kind === "jigsaw" && (
                          <JigsawBoard
                            scene={current.scene}
                            seed={seed}
                            locked={phase !== "play"}
                            teach={teach}
                            onWrong={commiserate}
                            onSolved={handleSolved}
                          />
                        )}
                        {current.kind === "scene" && (
                          <SceneBoard
                            round={current}
                            seed={seed}
                            locked={phase !== "play"}
                            teach={teach}
                            onGreet={react}
                            onWrong={commiserate}
                            onSolved={handleSolved}
                          />
                        )}
                        {current.kind === "visitors" && (
                          <AnimalMeadow
                            scene={current.scene}
                            seed={moduleIndex}
                            locked={phase !== "play"}
                            onGreet={react}
                            onSolved={handleSolved}
                          />
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {screen === "done" && MODULES[moduleIndex] && (
                <motion.div key="done" className="sm-screen-wrap" {...PAGE_TRANSITION}>
                  <ModuleDone
                    outing={MODULES[moduleIndex]}
                    index={moduleIndex}
                    hasNext={moduleIndex + 1 < TOTAL_MODULES}
                    onNext={() => {
                      interrupt();
                      nextModule();
                    }}
                    onHome={() => {
                      interrupt();
                      goHome();
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {playing && <Leo mood={mood} say={say} />}
          </div>
        </div>

        {/* The portal's own control, where every game puts it. It goes back ONE
            step: out of a module to the pictures, and out of the pictures to
            the Library. */}
        <NavPillButton
          label={atHome ? "Back to Games" : "Pictures"}
          ariaLabel={atHome ? "Back to the game portal" : "Back to all the pictures"}
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
            goHome();
          }}
        />
      </div>
    </GameStage>
  );
}
