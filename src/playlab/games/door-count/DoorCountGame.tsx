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
import { toRootPoint, type RootPoint } from "@shared/utils/pointer";
import { playClickSound, playFanfare, playClinkSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, sayAfter, stopVoice } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { useDoorStore, type DoorScreen } from "@games/door-count/store/doorStore";
import {
  MODULES,
  clearsCorridor,
  keysBefore,
  levelCount,
  type ModuleId,
} from "@games/door-count/constants/levels";
import { DoorLevel } from "@games/door-count/components/DoorLevel";
import { CorridorClear, DoorFinal, DoorHome } from "@games/door-count/components/DoorScreens";
import { Teacher } from "@games/door-count/components/Teacher";
import { FlyingKey, Vault, type KeyFlight } from "@games/door-count/components/Vault";

/** Coarse history bucket: the home screen is "menu", the doors and the end
 *  are "play" — the same grain every other game uses. */
function toBucket(screen: DoorScreen): "menu" | "play" {
  return screen === "home" ? "menu" : "play";
}

/**
 * One door slides away to the left as the next arrives from the right — the
 * corridor moving along, not a card being dealt. The screens themselves
 * (home, doors, the end) use the portal's shared PAGE_TRANSITION.
 */
const SLIDE = {
  initial: { x: "100%" },
  animate: { x: "0%" },
  exit: { x: "-100%" },
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
};

/** Right answer → the key erupts, fills the screen and goes into the vault
 *  → the next door. Long enough for the whole three-act key to play. */
const SOLVED_MS = 3200;
/** How long the double door at the end of a corridor holds the screen. */
const CLEAR_MS = 3000;
/** When the key leaves the middle of the screen: the vault opens to meet it. */
const VAULT_OPEN_MS = 780;
/** How long the vault keeps the light after a key goes in. */
const FLASH_MS = 700;
/** How long after a right answer the narrator says what the key is for — the
 *  praise line first, then this as the key is filling the screen. */
const KEY_LINE_MS = 1100;
/**
 * COUNT THE DOORS.
 *
 * A corridor of numbered doors and one question about them, in two modules
 * the child picks between by opening one of two doors on the home screen:
 *
 *   Count       — "Find 3 apples": tap the door that holds three.
 *   More & Less — "Which door has MORE?": touch the door that has it.
 *
 * The teacher is a real person standing in the corridor watching. Progress is
 * a vault in the wall rather than a bar across the top: every door solved
 * throws a key that erupts out of the doorway, fills the screen, turns over
 * once and drops into the vault, and a vault with all four keys in it swings
 * open the double door at the end of the corridor. The paint changes every
 * single round, and the two modules never open on the same colours.
 */
export function DoorCountGame() {
  const router = useRouter();
  const { screen, moduleId, progress, setScreen, openModule, nextLevel, restartModule } =
    useDoorStore();
  /** The teacher is mid-jump: this door has been answered. */
  const [cheer, setCheer] = useState(false);
  /** The won key is in the air, and where it is going. */
  const [flight, setFlight] = useState<KeyFlight | null>(null);
  /** The key is inside the vault, so its lamp may come on. */
  const [landed, setLanded] = useState(false);
  /** The vault stands open, waiting for the key on its way. */
  const [vaultOpen, setVaultOpen] = useState(false);
  /** The vault is lit from the key that just went in. */
  const [flash, setFlash] = useState(false);
  /** The corridor's double door is open over the top of everything. */
  const [clearing, setClearing] = useState(false);
  const schedule = useScheduler();

  /** The corridor itself, for turning a door's position into a flight path. */
  const canvasRef = useRef<HTMLDivElement>(null);
  /** The mouth of the vault, where a key ends up. */
  const mouthRef = useRef<HTMLElement | null>(null);

  /**
   * Leaving a screen invalidates the celebration already in flight, so a
   * pending "advance" can never fire onto the screen that replaced it.
   */
  const genRef = useRef(0);
  const interrupt = useCallback(() => {
    genRef.current += 1;
    // and nothing queued to be said can follow the child to the next screen
    stopVoice();
    setCheer(false);
    setFlight(null);
    setLanded(false);
    setVaultOpen(false);
    setFlash(false);
    setClearing(false);
  }, []);

  const levelIndex = progress[moduleId];
  const total = levelCount(moduleId);
  const level = MODULES[moduleId].levels[Math.min(levelIndex, total - 1)];
  const playing = screen === "play" && levelIndex < total;
  /** On the two doors: the pill leaves the game. Anywhere else: it comes
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

  const open = useCallback(
    (id: ModuleId) => {
      interrupt();
      openModule(id);
    },
    [interrupt, openModule]
  );

  /**
   * The child got it right. The doors are already opening inside the level;
   * out here the teacher jumps, the key erupts out of the winning doorway and
   * fills the screen before dropping into the vault, and — if that key fills
   * the vault — the corridor's double door opens before the next one.
   */
  const handleCorrect = useCallback(
    (from: RootPoint) => {
      const gen = genRef.current;
      const alive = () => genRef.current === gen;
      setCheer(true);
      // the teacher says it as well as showing it — then, as the key fills
      // the screen, what the key is for
      void playClip(cheerFor(levelIndex));
      schedule(() => {
        if (alive()) void sayAfter("door-key");
      }, KEY_LINE_MS);

      const mouth = mouthRef.current?.getBoundingClientRect();
      const canvas = canvasRef.current?.getBoundingClientRect();
      if (mouth && canvas) {
        const to = toRootPoint(
          canvasRef.current,
          mouth.left + mouth.width / 2,
          mouth.top + mouth.height / 2
        );
        setFlight({
          fromX: from.x,
          fromY: from.y,
          toX: to.x,
          toY: to.y,
          // the key fills the middle of the corridor on its way
          midX: canvas.width / 2,
          midY: canvas.height / 2,
        });
        schedule(() => {
          if (alive()) setVaultOpen(true);
        }, VAULT_OPEN_MS);
        schedule(() => {
          if (alive()) playStarPop();
        }, 260);
      } else {
        // no vault on screen to fly to: the key is simply counted
        setLanded(true);
        playStarPop();
      }

      const lastDoor = levelIndex + 1 >= total;
      if (clearsCorridor(levelIndex) && !lastDoor) {
        schedule(() => {
          if (!alive()) return;
          setClearing(true);
          playFanfare();
          void sayAfter("door-corridor-clear");
        }, SOLVED_MS);
        schedule(() => {
          if (!alive()) return;
          setClearing(false);
          setCheer(false);
          setLanded(false);
          nextLevel();
        }, SOLVED_MS + CLEAR_MS);
        return;
      }

      schedule(() => {
        if (!alive()) return;
        setCheer(false);
        setLanded(false);
        nextLevel();
      }, SOLVED_MS);
    },
    [levelIndex, total, nextLevel, schedule]
  );

  /** The key is in: the vault shuts on it and its lamp comes on. */
  const handleKeyArrive = useCallback(() => {
    const gen = genRef.current;
    setFlight(null);
    setLanded(true);
    setVaultOpen(false);
    setFlash(true);
    // brass on steel: the key is in the vault
    playClinkSound();
    schedule(() => {
      if (genRef.current === gen) setFlash(false);
    }, FLASH_MS);
  }, [schedule]);

  const keys = keysBefore(levelIndex) + (landed ? 1 : 0);

  return (
    <GameStage>
      <div className="dc-root">
        <div className="dc-canvas" ref={canvasRef}>
          {/* Everything lives inside the stage, because a container query
              cannot style the container it is asking about — and the stage is
              where the design unit is declared, so the question about the
              shape of the screen and the answer are about the same box. */}
          <div className="dc-stage">
            <AnimatePresence mode="wait" initial={false}>
              {screen === "home" && (
                <motion.div key="home" className="dc-screen-wrap" {...PAGE_TRANSITION}>
                  <DoorHome progress={progress} onOpen={open} />
                </motion.div>
              )}

              {playing && (
                <motion.div key="play" className="dc-screen-wrap" {...PAGE_TRANSITION}>
                  {/* the doors slide door-to-door inside the screen; the teacher
                      and the vault below stay put while they do */}
                  <AnimatePresence mode="sync" initial={false}>
                    <motion.div key={`${moduleId}-${levelIndex}`} className="dc-slide" {...SLIDE}>
                      <DoorLevel
                        level={level}
                        moduleId={moduleId}
                        index={levelIndex}
                        locked={clearing}
                        onCorrect={handleCorrect}
                      />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              )}

              {screen === "final" && (
                <motion.div key="final" className="dc-screen-wrap" {...PAGE_TRANSITION}>
                  <DoorFinal
                    moduleId={moduleId}
                    onAgain={() => {
                      interrupt();
                      restartModule(moduleId);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {playing && (
              <>
                <Teacher cheer={cheer} say={cheer ? clipText(cheerFor(levelIndex)) : undefined} />
                <Vault
                  keys={keys}
                  open={vaultOpen}
                  flash={flash}
                  mouthRef={(el) => (mouthRef.current = el)}
                />
                {flight && <FlyingKey flight={flight} onArrive={handleKeyArrive} />}
              </>
            )}

            <AnimatePresence>{clearing && <CorridorClear key="clear" />}</AnimatePresence>
          </div>
        </div>

        {/* The portal's own control, where every game puts it, and it goes
            back ONE step: out of a module to the two doors, and out of the
            two doors to the Library. Kitchen is the tone whose ink (#8A5A2E)
            is already the corridor's woodwork. */}
        <NavPillButton
          label={atHome ? "Back to Games" : "Back"}
          ariaLabel={atHome ? "Back to the game portal" : "Back to the two doors"}
          tone="kitchen"
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
