"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Burst } from "@shared/components/game/Burst";
import { Confetti } from "@shared/components/game/Confetti";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { playCorrectSound } from "@shared/audio/sfx";
import { askFor, loosePieces, type SceneRound } from "@games/shape-match/constants/modules";
import { SCENES, spotsOf } from "@games/shape-match/constants/scenes";
import { THING_NAMES } from "@games/shape-match/constants/things";
import { ScenePicture, Thing } from "@games/shape-match/components/SceneArt";
import { Banner } from "@games/shape-match/components/Banner";
import { Tick, Twinkle } from "@games/shape-match/components/ShapeArt";
import { FLIGHT_MS, SHAKE_MS, useCarry } from "@games/shape-match/hooks/useCarry";
import { useDemoHand } from "@games/shape-match/hooks/useDemoHand";

/**
 * THE PICTURE — put the missing things back where they belong.
 *
 *   A PICTURE WITH THINGS MISSING → THOSE THINGS IN THE TRAY → PUT THEM BACK
 *
 * Every gap is a whole thing that has gone missing — the sun, the tree, the
 * cat — drawn faint where it belongs. A three-year-old does not have to work
 * out what a piece is a piece OF: they can see a sun, and they can see the
 * sun-shaped gap, and that is the entire puzzle.
 *
 * It is the same gesture as the first round (see `useCarry`), and it answers
 * back the same way: the thing lifts when it is touched, leans as it travels,
 * the gap lights up as it comes near, and it is pulled in and settles. A thing
 * carried to the wrong gap wobbles and walks itself home.
 */

/** A small, quick spray of sparkle when a thing goes back. Constants: Burst
 *  memoises on them. */
const SPARK_REACH = [8, 20] as const;
const SPARK_ARC = [-170, -10] as const;

interface SceneBoardProps {
  round: SceneRound;
  /** Fixes the order of the tray — the module's place in the game. */
  seed: number;
  locked: boolean;
  /** Show the child how it is played, unasked. */
  teach: boolean;
  /** One thing went back: the character reacts. */
  onGreet: () => void;
  /** A thing was carried to the wrong gap. */
  onWrong: () => void;
  /** The picture is whole. Must be stable. */
  onSolved: () => void;
}

export function SceneBoard({
  round,
  seed,
  locked,
  teach,
  onGreet,
  onWrong,
  onSolved,
}: SceneBoardProps) {
  /** Spot index → the thing is back in it. */
  const [placed, setPlaced] = useState<Record<number, boolean>>({});

  const scene = SCENES[round.scene];
  const spots = useMemo(() => spotsOf(scene), [scene]);
  const tray = useMemo(() => loosePieces(round.scene, seed), [round.scene, seed]);
  const solved = spots.every((_, i) => placed[i]);

  const isOpen = useCallback((spot: number) => !placed[spot], [placed]);
  /** A thing only ever fits its own gap. */
  const fits = useCallback((id: number, spot: number) => id === spot, []);

  const onPlaced = useCallback(
    (id: number) => {
      setPlaced((current) => ({ ...current, [id]: true }));
      onGreet();
    },
    [onGreet]
  );

  const {
    rootRef,
    registerPiece,
    registerHole,
    picked,
    drag,
    flight,
    near,
    wrong,
    bump,
    touches,
    touchCount,
    startDrag,
    tapPiece,
    tapHole,
    centreOfPiece,
    centreOfHole,
  } = useCarry({ locked: locked || solved, isOpen, fits, onPlaced, onRefused: onWrong });

  useEffect(() => {
    if (!solved) return;
    playCorrectSound();
    onSolved();
  }, [solved, onSolved]);

  /** The first picture of the game shows how it is done, once, unasked: the
   *  hand takes the first thing in the tray back to its own gap. */
  const route = useCallback(() => {
    const first = tray[0];
    if (first === undefined) return null;
    return { from: centreOfPiece(first), to: centreOfHole(first) };
  }, [tray, centreOfPiece, centreOfHole]);

  const hand = useDemoHand({ teach, touches, touchCount, route });

  const sparks = useMemo(() => [<Twinkle key="a" />, <Twinkle key="b" fill="#7FE0FF" />], []);
  const name = (id: number) => THING_NAMES[scene.pieces[id]];
  const carried = drag?.id ?? flight?.id ?? null;

  return (
    <div ref={rootRef} className="sm-board" data-kind="scene">
      <Banner text={askFor(round)} />

      <motion.div
        className="sm-scene"
        data-night={scene.night ? "yes" : undefined}
        data-solved={solved ? "yes" : undefined}
        animate={solved ? { scale: [1, 1.03, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* the picture itself — sky, ground and its furniture. The things that
            can be moved are drawn below, so they can be animated and answered
            to. */}
        <ScenePicture scene={scene} hide={spots.map((_, i) => i)} />

        {/* and the things that have gone missing */}
        {spots.map((spot, i) => {
          const back = placed[i];
          const style = cssVars({
            "--sm-x": spot.x + "%",
            "--sm-y": spot.y + "%",
            "--sm-w": spot.size + "%",
          });

          if (back) {
            return (
              <motion.span
                key={"p" + i}
                className="sm-scene-thing"
                style={style}
                initial={{ scale: 0.84 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 16 }}
              >
                <Thing art={spot.art} />
                <span className="sm-scene-tick" aria-hidden="true">
                  <Tick />
                </span>
                <Burst
                  pieces={sparks}
                  count={8}
                  arc={SPARK_ARC}
                  reach={SPARK_REACH}
                  size="26%"
                  gravity
                />
              </motion.span>
            );
          }

          return (
            <button
              key={"p" + i}
              type="button"
              className="sm-gap"
              style={style}
              data-bump={bump === i ? "yes" : undefined}
              data-near={near === i ? "yes" : undefined}
              data-open={picked !== null ? "yes" : undefined}
              ref={(el) => registerHole(i, el)}
              onClick={() => tapHole(i)}
              disabled={locked}
              aria-label={"The " + name(i) + " is missing from here"}
            >
              <span className="sm-gap-ghost" aria-hidden="true">
                <Thing art={spot.art} />
              </span>
            </button>
          );
        })}
      </motion.div>

      <div className="sm-panel sm-panel--tray" data-things="yes">
        {tray.map((id) => {
          const gone = placed[id] || flight?.id === id;
          return (
            <motion.button
              key={id}
              type="button"
              className="sm-thing touch-none"
              ref={(el) => registerPiece(id, el)}
              data-picked={picked === id ? "yes" : undefined}
              data-used={gone ? "yes" : undefined}
              data-carried={carried === id ? "yes" : undefined}
              disabled={gone || locked}
              onPointerDown={(event) => startDrag(event, id)}
              onClick={() => tapPiece(id)}
              aria-label={"The " + name(id) + " — put it back in the picture"}
              aria-pressed={picked === id}
              animate={
                wrong === id
                  ? { rotate: [0, -7, 7, -5, 5, 0] }
                  : { rotate: 0, scale: picked === id ? 1.1 : 1 }
              }
              transition={
                wrong === id
                  ? { duration: SHAKE_MS / 1000 }
                  : { type: "spring", stiffness: 340, damping: 20 }
              }
            >
              <Thing art={scene.pieces[id]} />
            </motion.button>
          );
        })}
      </div>

      {/* the thing under the finger: lifted, leaning the way it is moved */}
      {drag && (
        <motion.span
          className="sm-ghost"
          data-thing="yes"
          style={cssVars({ "--sm-x": drag.x + "px", "--sm-y": drag.y + "px" })}
          animate={{ rotate: drag.tilt }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          aria-hidden="true"
        >
          <Thing art={scene.pieces[drag.id]} />
        </motion.span>
      )}

      {/* and on its way: pulled into the gap, or wobbling home */}
      {flight && (
        <motion.span
          className="sm-flight"
          data-thing="yes"
          data-home={flight.home ? "yes" : undefined}
          style={cssVars({ "--sm-x": flight.fx + "px", "--sm-y": flight.fy + "px" })}
          initial={{ x: 0, y: 0, rotate: 0 }}
          animate={
            flight.home
              ? { x: flight.tx - flight.fx, y: flight.ty - flight.fy, rotate: [0, -8, 8, -5, 0] }
              : { x: flight.tx - flight.fx, y: flight.ty - flight.fy, rotate: 0 }
          }
          transition={
            flight.home
              ? { duration: SHAKE_MS / 1000, ease: "easeInOut" }
              : { type: "spring", stiffness: 420, damping: 22, duration: FLIGHT_MS / 1000 }
          }
          aria-hidden="true"
        >
          <Thing art={scene.pieces[flight.id]} />
        </motion.span>
      )}

      {hand && hand.at === touches && !solved && (
        <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />
      )}
      {solved && <Confetti count={36} />}
    </div>
  );
}
