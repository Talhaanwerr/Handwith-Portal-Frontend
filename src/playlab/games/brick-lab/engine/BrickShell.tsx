"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { GameStage } from "@shared/components/game/GameStage";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { useGameSession } from "@shared/hooks/useGameSession";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { PAGE_TRANSITION } from "@shared/constants/transitions";
import { PORTAL_ROUTE } from "@shared/constants/routes";
import { playClickSound } from "@shared/audio/sfx";
import { clipText, playClip } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { Playroom, LeavePill } from "@games/jigsaw-fun/components/JfStage";
import { useFinaleCheer } from "@games/jigsaw-fun/components/Cheer";
import { GodRays } from "@shared/components/game/GodRays";
import { BrickRain, ChipRain } from "./RoundWin";
import { BRICK_H, drawOrder, type Brick, type View } from "./geometry";
import { BrickArt, BrickDefsHost, LooseBrick, PlateArt } from "./BrickArt";

/** GAME_DEV: no `mode="wait"`; the leaving screen takes no taps. */
const SCREEN = {
  ...PAGE_TRANSITION,
  exit: { ...PAGE_TRANSITION.exit, pointerEvents: "none" as const },
};

type Screen = "splash" | "play" | "done";

export interface PlayApi {
  /** The whole game is finished: show the star card — with the child's own
   *  model on it when one is given. */
  finish: (model?: readonly Brick[], plate?: { w: number; d: number }) => void;
  /** Back to this game's own title screen. */
  home: () => void;
  exit: () => void;
}

interface BrickShellProps {
  title: string;
  /** One line under the title. */
  tagline: string;
  /** A little model shown on the title screen. */
  hero: readonly Brick[];
  heroPlate: { w: number; d: number };
  /** Spoken as the title screen opens. */
  welcomeClip?: string;
  /** Spoken on the star card after the cheer. */
  doneClip?: string;
  /** One activity: the Play button starts it. */
  play?: (api: PlayApi) => ReactNode;
  /** Or several: the title screen shows one card per module instead. */
  modules?: readonly ShellModule[];
  /** The world behind every screen; default: the playroom. */
  world?: ReactNode;
}

export interface ShellModule {
  id: string;
  label: string;
  /** Spoken when the card is tapped, before play starts. */
  clip?: string;
  hero: readonly Brick[];
  heroPlate: { w: number; d: number };
  plateColor?: string;
  doneClip?: string;
  play: (api: PlayApi) => ReactNode;
}

/**
 * The frame every brick game shares: a title screen with the game's own
 * little model, the play screen the game draws, and a star card; the pill
 * navigation (Back → this game's title, Back to Games → the portal); the
 * session (music, history); and the one shared set of brick gradients.
 */
export function BrickShell({
  title,
  tagline,
  hero,
  heroPlate,
  welcomeClip,
  doneClip,
  play,
  modules,
  world,
}: BrickShellProps) {
  const [mod, setMod] = useState(0);
  const active = modules?.[mod];
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>("splash");
  const [run, setRun] = useState(0);

  const exit = useCallback(() => router.push(PORTAL_ROUTE), [router]);
  const home = useCallback(() => setScreen("splash"), []);
  const [made, setMade] = useState<{
    bricks: readonly Brick[];
    plate: { w: number; d: number };
  } | null>(null);
  const finish = useCallback((model?: readonly Brick[], plate?: { w: number; d: number }) => {
    setMade(model && plate ? { bricks: model, plate } : null);
    setScreen("done");
  }, []);

  useGameSession({
    screen,
    step: screen === "splash" ? "menu" : "play",
    onHistoryPop: (step) => setScreen(step === "menu" ? "splash" : "play"),
    onEnter: () => setScreen("splash"),
  });

  const api = useMemo(() => ({ finish, home, exit }), [finish, home, exit]);

  return (
    <GameStage>
      <div className="bk-root">
        <BrickDefsHost />
        <AnimatePresence>
          {screen === "splash" && (
            <motion.div key="splash" className="bk-layer" {...SCREEN}>
              <Splash
                title={title}
                tagline={tagline}
                hero={hero}
                heroPlate={heroPlate}
                welcomeClip={welcomeClip}
                modules={modules}
                world={world}
                onPlay={(i) => {
                  playClickSound();
                  setMod(i);
                  setRun((r) => r + 1);
                  setScreen("play");
                }}
                onExit={exit}
              />
            </motion.div>
          )}
          {screen === "play" && (
            <motion.div key={`play-${run}`} className="bk-layer" {...SCREEN}>
              {world ?? <Playroom />}
              <NavPillButton
                label="Back"
                ariaLabel="Back to the start of this game"
                tone="builder"
                surface="strong"
                pinned
                onClick={() => {
                  playClickSound();
                  home();
                }}
              />
              <LeavePill className="bk-leave" onExit={exit} />
              {active ? active.play(api) : play?.(api)}
            </motion.div>
          )}
          {screen === "done" && (
            <motion.div key="done" className="bk-layer" {...SCREEN}>
              <Done
                title={title}
                hero={made?.bricks ?? active?.hero ?? hero}
                heroPlate={made?.plate ?? active?.heroPlate ?? heroPlate}
                seed={run + title.length}
                doneClip={active?.doneClip ?? doneClip}
                onAgain={() => {
                  playClickSound();
                  setRun((r) => r + 1);
                  setScreen("play");
                }}
                onHome={home}
                world={world}
                onExit={exit}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GameStage>
  );
}

/** A small fixed model, drawn with the board's own renderer. */
export function ModelView({
  bricks,
  plate,
  size,
  yaw = -0.62,
  pitch = 0.62,
  levels,
  plateColor,
}: {
  bricks: readonly Brick[];
  plate: { w: number; d: number };
  size: number;
  yaw?: number;
  pitch?: number;
  levels?: number;
  plateColor?: string;
}) {
  const lv = levels ?? Math.max(2, ...bricks.map((b) => b.y + 1));
  const diag = Math.hypot(plate.w, plate.d);
  const tall = lv * BRICK_H * Math.cos(pitch);
  const scale = Math.min(
    (size * 0.92) / diag,
    (size * 0.9) / (diag * Math.sin(pitch) + tall + 0.6)
  );
  const view: View = {
    yaw,
    pitch,
    scale,
    ox: size / 2,
    oy: size / 2 + (tall * scale) / 2,
    cx: plate.w / 2,
    cz: plate.d / 2,
  };
  const ordered = drawOrder(bricks, view);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="bk-model" aria-hidden="true">
      <PlateArt w={plate.w} d={plate.d} view={view} color={plateColor} />
      {ordered.map((b) => (
        <g key={b.id}>
          <BrickArt brick={b} view={view} />
        </g>
      ))}
    </svg>
  );
}

function Splash({
  title,
  tagline,
  hero,
  heroPlate,
  welcomeClip,
  modules,
  world,
  onPlay,
  onExit,
}: {
  title: string;
  tagline: string;
  hero: readonly Brick[];
  heroPlate: { w: number; d: number };
  welcomeClip?: string;
  modules?: readonly ShellModule[];
  world?: ReactNode;
  onPlay: (module: number) => void;
  onExit: () => void;
}) {
  useSayOnEnter(welcomeClip ? [welcomeClip] : []);
  return (
    <div className="bk-splash">
      {world ?? <Playroom roomy />}
      <NavPillButton
        label="Back to Games"
        ariaLabel="Back to the game portal"
        tone="builder"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onExit();
        }}
      />
      <div className="bk-splash-col pl-safe-center">
        {!modules && (
          <motion.div
            className="bk-splash-hero"
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 180, damping: 18 }}
          >
            <ModelView bricks={hero} plate={heroPlate} size={420} />
          </motion.div>
        )}
        <h1 className="bk-title font-rounded font-black">{title}</h1>
        <p className="bk-tagline font-rounded font-bold">{tagline}</p>
        {modules ? (
          <div className="bk-modules">
            {modules.map((m, i) => (
              <motion.button
                key={m.id}
                className="bk-module font-rounded font-black"
                onClick={() => {
                  if (m.clip) void playClip(m.clip);
                  onPlay(i);
                }}
                initial={{ y: 18, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 + i * 0.08, type: "spring", stiffness: 240, damping: 20 }}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.04 }}
                aria-label={`Play ${m.label}`}
              >
                <span className="bk-module-model">
                  <ModelView
                    bricks={m.hero}
                    plate={m.heroPlate}
                    size={220}
                    plateColor={m.plateColor}
                  />
                </span>
                <span className="bk-module-label">{m.label}</span>
              </motion.button>
            ))}
          </div>
        ) : (
          <motion.button
            className="bk-play font-rounded font-black"
            onClick={() => onPlay(0)}
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.04 }}
            aria-label={`Play ${title}`}
          >
            <span className="bk-play-brick">
              <LooseBrick w={2} d={2} color="yellow" size={54} />
            </span>
            Play
          </motion.button>
        )}
      </div>
    </div>
  );
}

function Done({
  title,
  hero,
  heroPlate,
  seed,
  doneClip,
  onAgain,
  onHome,
  world,
  onExit,
}: {
  title: string;
  hero: readonly Brick[];
  heroPlate: { w: number; d: number };
  seed: number;
  doneClip?: string;
  onAgain: () => void;
  onHome: () => void;
  world?: ReactNode;
  onExit: () => void;
}) {
  const cheer = cheerFor(seed);
  useFinaleCheer(cheer, doneClip);
  return (
    <div className="bk-done">
      {world ?? <Playroom roomy />}
      <GodRays />
      <ChipRain count={40} />
      <BrickRain count={18} />
      <NavPillButton
        label="Back"
        ariaLabel="Back to the start of this game"
        tone="builder"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onHome();
        }}
      />
      <LeavePill className="bk-leave" onExit={onExit} />
      <div className="bk-splash-col pl-safe-center">
        <motion.div
          className="bk-done-card"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
        >
          <ModelView bricks={hero} plate={heroPlate} size={260} />
          <p className="bk-done-cheer font-rounded font-black">{clipText(cheer)}</p>
          <p className="bk-tagline font-rounded font-bold">{title}</p>
          <div className="bk-done-row">
            <button className="bk-btn bk-btn--go font-rounded font-black" onClick={onAgain}>
              Play again
            </button>
            <button
              className="bk-btn font-rounded font-black"
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
