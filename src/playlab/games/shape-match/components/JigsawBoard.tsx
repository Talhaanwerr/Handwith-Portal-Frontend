"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Burst } from "@shared/components/game/Burst";
import { Confetti } from "@shared/components/game/Confetti";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { playCorrectSound } from "@shared/audio/sfx";
import { JIGSAW_PIECES, jigsawChoices, missingPiece } from "@games/shape-match/constants/modules";
import { SCENES, type SceneId } from "@games/shape-match/constants/scenes";
import { ScenePicture } from "@games/shape-match/components/SceneArt";
import { Twinkle } from "@games/shape-match/components/ShapeArt";
import { Banner } from "@games/shape-match/components/Banner";
import { FLIGHT_MS, SHAKE_MS, useCarry } from "@games/shape-match/hooks/useCarry";
import { useDemoHand } from "@games/shape-match/hooks/useDemoHand";

/**
 * THE JIGSAW — which piece is missing?
 *
 * The picture stands in three tall pieces with one of them taken out, and the
 * three pieces sit underneath: the one that belongs, and the other two parts
 * of the same picture. Every wrong answer is a real piece of the real picture,
 * so a child has to look at the HOLE rather than pick the odd one out.
 *
 * One piece to find, and it is a third of a picture wide — big enough for a
 * three-year-old to aim at and big enough to recognise. Carry it over, or tap
 * it and tap the gap.
 */

const SPARK_REACH = [10, 26] as const;
const SPARK_ARC = [-170, -10] as const;

/** One gap on this board. */
const SLOT = 0;

interface JigsawBoardProps {
  scene: SceneId;
  /** Fixes which piece is missing and the order of the choices. */
  seed: number;
  locked: boolean;
  teach: boolean;
  /** A piece was carried to the gap that does not belong there. */
  onWrong: () => void;
  /** The picture is whole. Must be stable. */
  onSolved: () => void;
}

/** One tall piece of the picture: the whole picture drawn three times too
 *  wide, behind a window showing only this third of it. */
function Strip({ scene, at }: { scene: SceneId; at: number }) {
  return (
    <span className="sm-strip-window" aria-hidden="true">
      <span
        className="sm-strip-inner"
        style={cssVars({ "--sm-cols": String(JIGSAW_PIECES), "--sm-col": String(at) })}
      >
        <ScenePicture scene={SCENES[scene]} />
      </span>
    </span>
  );
}

export function JigsawBoard({ scene, seed, locked, teach, onWrong, onSolved }: JigsawBoardProps) {
  const missing = useMemo(() => missingPiece(scene, seed), [scene, seed]);
  const choices = useMemo(() => jigsawChoices(scene, seed), [scene, seed]);
  const right = choices.indexOf(missing);
  const [done, setDone] = useState(false);

  const isOpen = useCallback(() => !done, [done]);
  const fits = useCallback((id: number) => id === right, [right]);
  const onPlaced = useCallback(() => setDone(true), []);

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
  } = useCarry({ locked: locked || done, isOpen, fits, onPlaced, onRefused: onWrong });

  useEffect(() => {
    if (!done) return;
    playCorrectSound();
    onSolved();
  }, [done, onSolved]);

  const route = useCallback(
    () => ({ from: centreOfPiece(right), to: centreOfHole(SLOT) }),
    [right, centreOfPiece, centreOfHole]
  );

  const hand = useDemoHand({ teach, touches, touchCount, route });

  const sparks = useMemo(() => [<Twinkle key="a" />, <Twinkle key="b" fill="#FF7EB6" />], []);
  const carried = drag?.id ?? flight?.id ?? null;

  return (
    <div ref={rootRef} className="sm-board" data-kind="jigsaw">
      <Banner text="Which piece is missing?" />

      <motion.div
        className="sm-jigsaw"
        data-solved={done ? "yes" : undefined}
        animate={done ? { scale: [1, 1.04, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {Array.from({ length: JIGSAW_PIECES }, (_, at) => {
          if (at !== missing) {
            return (
              <span className="sm-strip" key={at}>
                <Strip scene={scene} at={at} />
              </span>
            );
          }
          if (done) {
            return (
              <motion.span
                className="sm-strip"
                key={at}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 520, damping: 16 }}
              >
                <Strip scene={scene} at={at} />
                <Burst
                  pieces={sparks}
                  count={10}
                  arc={SPARK_ARC}
                  reach={SPARK_REACH}
                  size="18%"
                  gravity
                />
              </motion.span>
            );
          }
          return (
            <button
              type="button"
              className="sm-strip sm-strip--gap"
              key={at}
              ref={(el) => registerHole(SLOT, el)}
              onClick={() => tapHole(SLOT)}
              disabled={locked}
              data-near={near === SLOT ? "yes" : undefined}
              data-open={picked !== null ? "yes" : undefined}
              data-bump={bump === SLOT ? "yes" : undefined}
              aria-label="The missing piece of the picture goes here"
            >
              <span className="sm-strip-mark" aria-hidden="true" />
            </button>
          );
        })}
      </motion.div>

      <div className="sm-panel sm-panel--tray" data-strips="yes">
        {choices.map((at, id) => {
          const gone = (done && id === right) || flight?.id === id;
          return (
            <motion.button
              key={id}
              type="button"
              className="sm-strip-choice touch-none"
              ref={(el) => registerPiece(id, el)}
              data-picked={picked === id ? "yes" : undefined}
              data-used={gone ? "yes" : undefined}
              data-carried={carried === id ? "yes" : undefined}
              disabled={gone || locked}
              onPointerDown={(event) => startDrag(event, id)}
              onClick={() => tapPiece(id)}
              aria-label="A piece of the picture"
              aria-pressed={picked === id}
              animate={
                wrong === id
                  ? { rotate: [0, -5, 5, -3, 3, 0] }
                  : { rotate: 0, scale: picked === id ? 1.08 : 1 }
              }
              transition={
                wrong === id
                  ? { duration: SHAKE_MS / 1000 }
                  : { type: "spring", stiffness: 340, damping: 20 }
              }
            >
              <Strip scene={scene} at={at} />
            </motion.button>
          );
        })}
      </div>

      {drag && (
        <motion.span
          className="sm-ghost"
          data-strip="yes"
          style={cssVars({ "--sm-x": drag.x + "px", "--sm-y": drag.y + "px" })}
          animate={{ rotate: drag.tilt }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          aria-hidden="true"
        >
          <Strip scene={scene} at={choices[drag.id]} />
        </motion.span>
      )}

      {flight && (
        <motion.span
          className="sm-flight"
          data-strip="yes"
          data-home={flight.home ? "yes" : undefined}
          style={cssVars({ "--sm-x": flight.fx + "px", "--sm-y": flight.fy + "px" })}
          initial={{ x: 0, y: 0, rotate: 0 }}
          animate={
            flight.home
              ? { x: flight.tx - flight.fx, y: flight.ty - flight.fy, rotate: [0, -6, 6, -4, 0] }
              : { x: flight.tx - flight.fx, y: flight.ty - flight.fy, rotate: 0 }
          }
          transition={
            flight.home
              ? { duration: SHAKE_MS / 1000, ease: "easeInOut" }
              : { type: "spring", stiffness: 420, damping: 22, duration: FLIGHT_MS / 1000 }
          }
          aria-hidden="true"
        >
          <Strip scene={scene} at={choices[flight.id]} />
        </motion.span>
      )}

      {hand && hand.at === touches && !done && (
        <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />
      )}
      {done && <Confetti count={32} />}
    </div>
  );
}
