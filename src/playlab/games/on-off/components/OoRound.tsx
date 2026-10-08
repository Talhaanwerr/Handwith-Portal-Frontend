"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { cssVars } from "@shared/styles/cssVars";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import {
  playCorrectSound,
  playPickUpSound,
  playSnapSound,
  playStarPop,
  playThudSound,
} from "@shared/audio/sfx";
import { clipText, playClip, stopVoice } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { Picture } from "@games/blend-read/components/PictureArt";
import { PieceBurst, RoundCheer } from "@games/jigsaw-fun/components/Cheer";
import { OoStage } from "@games/on-off/components/OoStage";
import { SurfaceArt, boxVars } from "@games/on-off/components/OoArt";
import {
  HIT_SCALE,
  ROUNDS,
  bubbleBox,
  floorDepth,
  homeBox,
  WRONG_CLIP,
  promptFor,
  roundClips,
  surfaceBox,
  targetBox,
} from "@games/on-off/constants/scenes";

/** The glide into the silhouette (or back home): 150–250 ms, ease-out. */
const GLIDE_S = 0.2;
const GLIDE = { duration: GLIDE_S, ease: "easeOut" as const };
/** The round cheer lands with the thing — the moment its glide ends. */
const LAND_MS = GLIDE_S * 1000;
/** RoundCheer's star stamp springs in this long after the cheer mounts. */
const STAMP_MS = 150;
const BURST_MS = 900;
/** How long the finished scene stays up before the next round. */
const ADVANCE_MS = 2600;

interface RoundProps {
  /** Index into ROUNDS. */
  round: number;
  onDone: () => void;
  onMiss: () => void;
  onHome: () => void;
  onExitPortal: () => void;
}

interface StageRect {
  cx: number;
  cy: number;
  w: number;
  h: number;
}

/** An element's box in the stage's own pixels (the drag engine's frame). */
function rectIn(el: HTMLElement, root: HTMLElement): StageRect {
  const r = el.getBoundingClientRect();
  const s = root.getBoundingClientRect();
  return {
    cx: r.left - s.left + r.width / 2,
    cy: r.top - s.top + r.height / 2,
    w: r.width,
    h: r.height,
  };
}

/**
 * ONE ROUND — the only mechanic in the game, the same whichever way round.
 *
 * The silhouette (the thing itself, blacked out) shows exactly where the
 * thing belongs: ON the surface, or OFF it on the floor. Drag the thing
 * there — it follows the finger — and let go anywhere inside a box 1.3× the
 * silhouette: confetti bursts out of the silhouette at once and the thing
 * glides the last bit into place; as it lands the teacher jumps and cheers,
 * a star stamps down and the trail's star lights, and the scene stays put
 * before the next round. Let go anywhere else and it glides back to where
 * it came from with a soft thud (a miss for the stars), and nothing else.
 * After 7 s without a touch the teaching hand shows the move.
 */
export function OoRound({ round, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const { scene, dir } = ROUNDS[round];
  const prompt = promptFor(scene, dir);
  // a numeric seed: the rotation walks the five cheers round by round
  const cheerId = useMemo(() => cheerFor(round), [round]);
  // the round's own lines; a pairing with no recording is just silence
  const clips = roundClips(scene, dir);
  const has = (id: string) => clipText(id) !== "";
  useSayOnEnter(has(clips.prompt) ? [clips.prompt] : []);

  /** Dropped on the silhouette: the thing is gliding in, or there. */
  const [placed, setPlaced] = useState(false);
  /** Landed: the cheer is on, its star stamped at this stage point. */
  const [stamp, setStamp] = useState<{ x: number; y: number } | null>(null);
  const [flight, setFlight] = useState<{ id: number; dx: number; dy: number; k: number } | null>(
    null
  );
  const [burst, setBurst] = useState<{ id: number; x: number; y: number } | null>(null);
  const [hand, setHand] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const thingRef = useRef<HTMLButtonElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  /** An empty map: the one target is judged by our own 1.3× box below. */
  const targets = useRef(new Map<string, HTMLElement>());
  /** Where the finger holds the thing (px from its centre, at target size),
   *  its size in the hand, and how much bigger it was where it was picked up. */
  const [grab, setGrab] = useState({ ox: 0, oy: 0, size: 0, k: 1 });
  const flights = useRef(0);
  const schedule = useScheduler();

  useEffect(() => () => stopVoice(), []);

  const { dragging, start, ghostRef } = useDragDrop<number, string>({
    root: stageRef,
    targets,
    slopPx: 0,
    onDrop: (_item, _target, info) => {
      const root = stageRef.current;
      const home = thingRef.current;
      const goal = targetRef.current;
      if (!root || !home || !goal || !info.moved) return;
      // where the thing's centre was let go (the finger held it off-centre)
      const cx = info.x - grab.ox;
      const cy = info.y - grab.oy;
      const t = rectIn(goal, root);
      const hitW = (t.w * HIT_SCALE) / 2;
      const hitH = (t.h * HIT_SCALE) / 2;
      const id = ++flights.current;

      if (Math.abs(cx - t.cx) <= hitW && Math.abs(cy - t.cy) <= hitH) {
        // this frame: only the glide and the burst, so nothing delays them
        setPlaced(true);
        setFlight({ id, dx: cx - t.cx, dy: cy - t.cy, k: 1 });
        setBurst({ id, x: t.cx, y: t.cy });
        playSnapSound();
        schedule(() => setBurst((b) => (b && b.id === id ? null : b)), BURST_MS);
        // the landing: teacher, words, trail star, and the one spoken line
        // ("The teddy is on the bed!") — the cheer word stays in the bubble
        const at = { x: t.cx + t.w * 0.55, y: t.cy - t.h * 0.5 };
        schedule(() => {
          setStamp(at);
          playCorrectSound();
          if (has(clips.placed)) void playClip(clips.placed);
          else void playClip(cheerId);
        }, LAND_MS);
        schedule(playStarPop, LAND_MS + STAMP_MS);
        schedule(onDone, ADVANCE_MS);
        return;
      }

      // anywhere else: glide home; a real attempt away from home is a miss
      const h = rectIn(home, root);
      setFlight({ id, dx: cx - h.cx, dy: cy - h.cy, k: grab.size / h.w });
      if (Math.hypot(cx - h.cx, cy - h.cy) > h.w * 0.6) {
        playThudSound();
        void playClip(WRONG_CLIP[dir]);
        onMiss();
      }
    },
  });

  // The idle teaching hand: after 7 s without a touch it drags the thing
  // (from its bubble, or from its seat on the surface) to the silhouette.
  // Measured when it is due, against the drag engine's root, and on resize.
  const idle = useIdleHand(!placed && dragging === null, round);
  useEffect(() => {
    if (!idle) return;
    let frame = 0;
    const measure = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const root = stageRef.current;
        const from = thingRef.current;
        const to = targetRef.current;
        if (!root || !from || !to) return;
        const a = rectIn(from, root);
        const b = rectIn(to, root);
        setHand({ fx: a.cx, fy: a.cy, tx: b.cx, ty: b.cy });
      });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [idle]);

  const pickUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const el = thingRef.current;
      const goal = targetRef.current;
      if (placed || !el || !goal) return;
      const r = el.getBoundingClientRect();
      const size = goal.getBoundingClientRect().width;
      // the thing shrinks from its bubble size to its target size in the
      // hand, and the finger keeps the same spot on it
      const k = size / r.width;
      setGrab({
        ox: (e.clientX - (r.left + r.width / 2)) * k,
        oy: (e.clientY - (r.top + r.height / 2)) * k,
        size,
        k: r.width / size,
      });
      if (start(e, 0)) playPickUpSound();
    },
    [placed, start]
  );

  const landed = stamp !== null;
  const home = boxVars(homeBox(scene, dir, "land"), homeBox(scene, dir, "port"));
  const goal = boxVars(targetBox(scene, dir, "land"), targetBox(scene, dir, "port"));
  const label = landed
    ? `${clipText(cheerId)} ${clipText(clips.placed)}`.trim()
    : clipText(clips.prompt) || `${prompt.before} ${prompt.word} ${prompt.after}`;
  const cast = useMemo(
    () =>
      [0, 1, 2].map((i) => (
        <span key={i} className="jf-cast">
          <Picture id={scene.thing} />
        </span>
      )),
    [scene.thing]
  );

  // Keys below are namespaced: the thing (re-keyed per glide so each glide
  // starts from where it was let go) and the burst count from the same
  // flight id, and as siblings they must never share a key.
  return (
    <OoStage
      stageRef={stageRef}
      backdrop={scene.backdrop}
      floor={{ land: floorDepth(scene, "land"), port: floorDepth(scene, "port") }}
      round={round}
      done={landed}
      bubbleKey={landed ? "cheer" : "prompt"}
      label={label}
      bubble={
        landed ? (
          <span className="oo-says-cheer">{clipText(cheerId)}</span>
        ) : (
          <>
            {prompt.before} <em className={`oo-word oo-word--${dir}`}>{prompt.word}</em>{" "}
            {prompt.after}
          </>
        )
      }
      onHome={onHome}
      onExitPortal={onExitPortal}
    >
      <div
        className={`oo-at oo-surface oo-surface--${scene.surface}`}
        style={boxVars(surfaceBox(scene, "land"), surfaceBox(scene, "port"))}
        aria-hidden="true"
      >
        <SurfaceArt id={scene.surface} />
      </div>

      {dir === "on" && (
        <motion.div
          className="oo-at oo-bubble"
          style={boxVars(bubbleBox("land"), bubbleBox("port"))}
          initial={false}
          animate={placed ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeIn" }}
          onPointerDown={placed ? undefined : pickUp}
          aria-hidden="true"
        />
      )}

      <div
        ref={targetRef}
        className={`oo-at oo-shadow ${placed ? "is-filled" : ""}`}
        style={goal}
        aria-hidden="true"
      >
        <Picture id={scene.thing} />
      </div>

      <motion.button
        key={flight ? `glide-${flight.id}` : "rest"}
        ref={thingRef}
        type="button"
        className={`oo-at oo-thing ${dragging !== null ? "is-lifted" : ""}`}
        style={placed ? goal : home}
        initial={flight ? { x: flight.dx, y: flight.dy, scale: flight.k } : false}
        animate={{ x: 0, y: 0, scale: 1 }}
        transition={GLIDE}
        onPointerDown={placed ? undefined : pickUp}
        disabled={placed}
        aria-label={`The ${scene.thingName} — drag it ${prompt.word.toLowerCase()} the ${
          scene.surfaceName
        }`}
      >
        <Picture id={scene.thing} />
      </motion.button>

      {burst && <PieceBurst key={`burst-${burst.id}`} x={burst.x} y={burst.y} />}
      {stamp && <RoundCheer cast={cast} stampX={stamp.x} stampY={stamp.y} label={label} />}

      {idle && hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}

      {dragging !== null && (
        <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
          <span
            className="oo-ghost-art"
            style={cssVars({
              "--oo-gs": `${grab.size}px`,
              "--oo-gx": `${-grab.size / 2 - grab.ox}px`,
              "--oo-gy": `${-grab.size / 2 - grab.oy}px`,
              "--oo-gk": grab.k,
              "--oo-go": `${grab.size / 2 + grab.ox}px ${grab.size / 2 + grab.oy}px`,
            })}
          >
            <Picture id={scene.thing} />
          </span>
        </div>
      )}
    </OoStage>
  );
}
