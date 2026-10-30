"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  playIncorrectSound,
  playPickUpSound,
  playPlaceSound,
  playStarPop,
} from "@shared/audio/sfx";
import { clipText, playClip, sayAfter } from "@shared/audio/voice";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import type { RootPoint } from "@shared/utils/pointer";
import { Picture } from "@games/blend-read/components/PictureArt";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import { ROUND_COUNT } from "@games/number-groups/constants/kit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { Chest, RIM, Sparkles } from "@games/whats-inside/components/Chest";
import { CoveWorld } from "@games/whats-inside/components/WsiWorld";
import {
  HOP_MS,
  OPEN_LID,
  SINK_MS,
  SWAP_MS,
  TOY_PICTURE,
  WHERE_ROUNDS,
  answerChest,
  finalPlaces,
  nameClip,
  whereClip,
} from "@games/whats-inside/constants/rounds";

const WATCH = "instr-watch-carefully";
const EMPTY = "wsi-empty";
/** The toy is half as wide as its chest (`--wsi-toy` in the stylesheet). */
const TOY_SHARE = 0.5;
/** From the screen landing to the toy appearing; then how long it waits. */
const READY_MS = 900;
const SHOW_MS = 1200;

/**
 * ready → show (the toy stands above the chests) → hop (a lid opens and the
 * toy hops in) → drop / sink (it sinks into the chest) → shut (the lid
 * closes) → swap (from round 3: two chests slowly change places) → ask →
 * found.
 */
type Phase = "ready" | "show" | "hop" | "drop" | "sink" | "shut" | "swap" | "ask" | "found";

/**
 * WHERE DID IT GO? — one round (WATCH, then TAP the chest).
 *
 * "Watch carefully!" A toy stands above 2–3 closed chests on the beach, then
 * one lid opens, the toy hops in and the lid shuts. From round 3 two chests
 * then slide slowly past each other, once — one over, one in front, so the
 * eye can follow. "Where is the ball?" Tap a chest: the right one opens and
 * the toy pops out with its name; a wrong one opens empty, with a soft
 * sound, and stays crossed out. Nothing is timed: the child takes as long
 * as they like.
 */
export function WhereRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = WHERE_ROUNDS[round];
  const hideIn = answerChest(r);
  const final = useMemo(() => finalPlaces(r), [r]);
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLSpanElement>(null);
  const chestRefs = useRef(new Map<number, HTMLButtonElement>());
  const schedule = useScheduler();
  const [phase, setPhase] = useState<Phase>("ready");
  const [hop, setHop] = useState<RootPoint | null>(null);
  const [opened, setOpened] = useState<readonly number[]>([]);

  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast">
          <Picture id={TOY_PICTURE[r.toy]} />
        </span>
      )),
    [r.toy]
  );
  const { solved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: ROUND_COUNT + round,
    stageRef,
    cast,
    onDone,
  });

  // the show: it waits for the screen to land and for "Watch carefully!", so
  // the first round's music stall can never eat the hop
  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
    const said = wait(450).then(() => (cancelled ? undefined : sayAfter(WATCH)));
    void wait(READY_MS).then(() => {
      if (cancelled) return;
      setPhase("show");
      playPickUpSound();
      void Promise.all([said, wait(SHOW_MS)]).then(() => {
        if (cancelled) return;
        const board = boardRef.current?.getBoundingClientRect();
        const start = startRef.current?.getBoundingClientRect();
        const chest = chestRefs.current.get(hideIn)?.getBoundingClientRect();
        if (board && start && chest)
          setHop({
            x: chest.left + chest.width / 2 - (start.left + start.width / 2),
            y:
              chest.top +
              chest.height * RIM -
              chest.width * TOY_SHARE * 0.5 -
              (start.top + start.height / 2),
          });
        setPhase("hop");
        schedule(() => setPhase("drop"), HOP_MS);
        schedule(() => setPhase("sink"), HOP_MS + 60);
        schedule(() => {
          setPhase("shut");
          playPlaceSound();
        }, HOP_MS + SINK_MS);
        const asked = r.swap ? HOP_MS + SINK_MS + 700 + SWAP_MS + 250 : HOP_MS + SINK_MS + 600;
        if (r.swap) schedule(() => setPhase("swap"), HOP_MS + SINK_MS + 700);
        schedule(() => {
          setPhase("ask");
          void sayAfter(whereClip(r.toy));
        }, asked);
      });
    });
    return () => {
      cancelled = true;
    };
  }, [hideIn, r.swap, r.toy, schedule]);

  const tap = useCallback(
    (k: number) => {
      if (phase !== "ask" || opened.includes(k)) return;
      setOpened((o) => [...o, k]);
      const el = chestRefs.current.get(k);
      if (k !== hideIn) {
        playIncorrectSound();
        void playClip(EMPTY);
        onMiss();
        return;
      }
      setPhase("found");
      burst(el);
      playStarPop();
      void playClip(nameClip(r.toy));
      finish(el);
    },
    [burst, finish, hideIn, onMiss, opened, phase, r.toy]
  );

  const register = useCallback((k: number, el: HTMLButtonElement | null) => {
    if (el) chestRefs.current.set(k, el);
    else chestRefs.current.delete(k);
  }, []);

  // ── the idle teaching hand: it points at the chest the toy is in ──
  const idle = useIdleHand(phase === "ask", opened.length);
  const [hand, setHand] = useState<RootPoint | null>(null);
  useEffect(() => {
    if (!idle) return;
    const measure = () => setHand(centreIn(stageRef.current, chestRefs.current.get(hideIn)));
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [idle, hideIn]);

  const swapped = r.swap !== null && (phase === "swap" || phase === "ask" || phase === "found");
  const toyIn = phase !== "ready" && phase !== "show" && phase !== "hop";
  const toyArt = useMemo(() => <Picture id={TOY_PICTURE[r.toy]} />, [r.toy]);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="wsi-play wsi-play--where"
      world={<CoveWorld />}
      round={round}
      solved={solved}
      say={say(clipText(phase === "ask" || phase === "found" ? whereClip(r.toy) : WATCH))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {idle && hand && (
            <TeachingHand fx={hand.x + 40} fy={hand.y + 60} tx={hand.x} ty={hand.y} />
          )}
        </>
      }
    >
      <div
        ref={boardRef}
        className="wsi-board wsi-board--where"
        style={cssVars({ "--wsi-n": r.chests })}
      >
        <span ref={startRef} className="wsi-start" aria-hidden="true">
          {(phase === "show" || phase === "hop") && (
            <motion.span
              className="wsi-hopper"
              initial={{ opacity: 0, scale: 0.3, x: 0, y: 0 }}
              animate={
                phase === "hop" && hop
                  ? {
                      opacity: 1,
                      scale: 1,
                      x: [0, hop.x * 0.5, hop.x],
                      y: [0, Math.min(0, hop.y) - 60, hop.y],
                    }
                  : { opacity: 1, scale: 1, x: 0, y: 0 }
              }
              transition={
                phase === "hop"
                  ? { duration: HOP_MS / 1000, times: [0, 0.45, 1], ease: "easeInOut" }
                  : { type: "spring", stiffness: 220, damping: 15 }
              }
              aria-hidden="true"
            >
              {toyArt}
            </motion.span>
          )}
        </span>

        <div className="wsi-row">
          {Array.from({ length: r.chests }, (_, k) => {
            const isToy = k === hideIn;
            const open =
              opened.includes(k) ||
              (isToy && (phase === "hop" || phase === "drop" || phase === "sink"));
            const goesUp = r.swap !== null && k === r.swap[0];
            return (
              <ChestSlot
                key={`${round}-${k}`}
                index={k}
                shift={swapped ? final[k] - k : 0}
                arc={phase === "swap" && r.swap?.includes(k) ? (goesUp ? "up" : "down") : null}
                lid={open ? OPEN_LID : 0}
                toy={isToy && toyIn ? toyArt : null}
                rise={isToy && phase === "found" ? 1.08 : isToy && phase === "drop" ? 1 : 0}
                wrong={opened.includes(k) && !isToy}
                found={isToy && phase === "found"}
                live={phase === "ask" && !opened.includes(k)}
                onTap={tap}
                register={register}
              />
            );
          })}
        </div>
      </div>
    </NgStage>
  );
}

const ARC_UP = ["0%", "-26%", "0%"];
const ARC_DOWN = ["0%", "12%", "0%"];

/** One chest on the sand, in its place; it slides to another place when the
 *  chests swap (by its own width — a place is exactly one chest wide). */
const ChestSlot = memo(function ChestSlot({
  index,
  shift,
  arc,
  lid,
  toy,
  rise,
  wrong,
  found,
  live,
  onTap,
  register,
}: {
  index: number;
  /** How many places it has moved. */
  shift: number;
  arc: "up" | "down" | null;
  lid: number;
  toy: React.ReactNode;
  rise: number;
  wrong: boolean;
  found: boolean;
  live: boolean;
  onTap: (k: number) => void;
  register: (k: number, el: HTMLButtonElement | null) => void;
}) {
  return (
    <motion.div
      className={`wsi-slot ${arc === "down" ? "is-front" : ""}`}
      initial={false}
      animate={{
        x: `${shift * 100}%`,
        y: arc === "up" ? ARC_UP : arc === "down" ? ARC_DOWN : "0%",
      }}
      transition={{ duration: SWAP_MS / 1000, ease: "easeInOut" }}
    >
      <button
        ref={(el) => register(index, el)}
        type="button"
        className={`wsi-chest-btn ${wrong ? "is-wrong" : ""}`}
        disabled={!live}
        onClick={live ? () => onTap(index) : undefined}
        aria-label={`Chest ${index + 1}`}
      >
        {found && (
          <motion.span
            className="wsi-sparkles"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            aria-hidden="true"
          >
            <Sparkles />
          </motion.span>
        )}
        <Chest lid={lid} toy={toy} rise={rise} inside={lid !== 0} />
        {wrong && (
          <span className="ng-cross" aria-hidden="true">
            <CrossMark />
          </span>
        )}
      </button>
    </motion.div>
  );
});
