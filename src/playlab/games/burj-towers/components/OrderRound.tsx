"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { playIncorrectSound, playPickUpSound, playSnapSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence, sayAfter } from "@shared/audio/voice";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { toRootPoint, type RootPoint } from "@shared/utils/pointer";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { Thing } from "@games/number-groups/components/SumParts";
import { DubaiWorld } from "@shared/components/dubai/DubaiWorld";
import { Tower } from "@games/burj-towers/components/Tower";
import { Polaroid } from "@games/burj-towers/components/Polaroid";
import { BACK_MS, SNAP_MS, useFlights } from "@games/burj-towers/components/useFlights";
import {
  LINED_CLIP,
  ORDER_CLIP,
  ORDER_ROUNDS,
  TRY_AGAIN_CLIP,
  shortToTall,
} from "@games/burj-towers/constants/rounds";

/** The light show: from the last tower landing to the first spire lighting,
 *  then one spire after another, then the round is won. */
const SHOW_AT = 650;
const SHOW_STEP = 420;
/** How long the bar shows "Try again!" after a wrong drop. */
const RETRY_MS = 2200;
const PLACES = [0, 1, 2] as const;

/** A tower being carried: which one (its place in the row), and where the
 *  finger holds it — from the finger to the tower's foot, so it does not
 *  jump to the finger's middle when picked up. */
interface Carry {
  i: number;
  gx: number;
  gy: number;
}

/** A box's foot — the middle of its bottom edge — in the stage's coordinates. */
function footIn(root: HTMLElement | null, el: Element | null | undefined): RootPoint {
  if (!el) return { x: 0, y: 0 };
  const b = el.getBoundingClientRect();
  return toRootPoint(root, b.left + b.width / 2, b.bottom);
}

/**
 * LINE THEM UP — one round of putting in order, on a Dubai evening.
 *
 * Three towers of different heights stand in a jumbled row; a stand of three
 * places waits beside them, a gold ramp under it growing from thin to thick
 * (short to tall); in the top-right corner a little tilted polaroid shows the
 * same three towers already lined up — the picture to copy. "Put them in
 * order, from short to tall!" The child DRAGS a whole tower (the finger
 * keeps its hold where it picked it up) onto the stand; the next empty place
 * glows, and a place lights up while a tower is over it. The shortest on the
 * first place glides in and stands there, then the middle one, then the
 * tallest. Any other tower, or a wrong place, glides back to the row, "Try
 * again!", and the right tower glows. When all three are lined up their
 * spires light one after another, "Short, taller, tallest!", and the round is
 * won.
 */
export function OrderRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = ORDER_ROUNDS[round];
  const shape = Math.max(...r.row);
  const order = useMemo(() => shortToTall(r), [r]);
  const stageRef = useRef<HTMLDivElement>(null);
  const standRef = useRef<HTMLDivElement>(null);
  const places = useRef(new Map<number, HTMLElement>());
  const pads = useRef<(HTMLSpanElement | null)[]>([]);
  const homes = useRef<(HTMLDivElement | null)[]>([]);
  const towerEls = useRef<(HTMLDivElement | null)[]>([]);
  const floorsRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const schedule = useScheduler();
  /** The row's towers (by place in the row) standing on the stand, in order. */
  const [placed, setPlaced] = useState<readonly number[]>([]);
  /** The same, the moment a drop is judged right (before the tower lands). */
  const placedRef = useRef<readonly number[]>([]);
  const [miss, setMiss] = useState<{ at: number; n: number } | null>(null);
  /** The bar says "Try again!" (the miss it belongs to), for a moment. */
  const [retry, setRetry] = useState<number | null>(null);
  /** How many spires are lit in the light show. */
  const [lights, setLights] = useState(0);
  /** The line has been said (no drags before it). */
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const [slop, setSlop] = useState(20);
  const lined = placed.length === 3;
  const next = order[placed.length];
  const flights = useFlights<number>();

  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast">
          <Thing id="star" />
        </span>
      )),
    []
  );
  const { solved, isSolved, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + 47,
    stageRef,
    cast,
    onDone,
  });

  useEffect(() => {
    const t = setTimeout(() => {
      readyRef.current = true;
      setReady(true);
      void playSequence([ORDER_CLIP]);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  /** All three are in: the spires light one by one, then the round is won. */
  const lightShow = useCallback(() => {
    for (const k of [1, 2, 3])
      schedule(
        () => {
          setLights(k);
          playStarPop();
          if (k === 1) void sayAfter(LINED_CLIP);
        },
        SHOW_AT + (k - 1) * SHOW_STEP
      );
    schedule(() => finish(standRef.current), SHOW_AT + 3 * SHOW_STEP);
  }, [schedule, finish]);

  const { dragging, over, start, ghostRef } = useDragDrop<Carry, number>({
    root: stageRef,
    targets: places,
    slopPx: slop,
    // only the empty places take a tower (a drop on a full one is no drop)
    isEligible: (k) => k >= placedRef.current.length,
    onDrop: (c, k, info) => {
      const from = { x: info.x + c.gx, y: info.y + c.gy };
      const back = () =>
        flights.fly(c.i, from, footIn(stageRef.current, homes.current[c.i]), { ms: BACK_MS });
      const done = placedRef.current;
      if (!info.moved || k === null || isSolved()) {
        back();
        return;
      }
      if (k !== done.length || c.i !== order[done.length]) {
        playIncorrectSound();
        void playClip(TRY_AGAIN_CLIP);
        const n = (miss?.n ?? 0) + 1;
        setMiss({ at: c.i, n });
        setRetry(n);
        schedule(() => setRetry((v) => (v === n ? null : v)), RETRY_MS);
        onMiss();
        back();
        return;
      }
      const now = [...done, c.i];
      placedRef.current = now;
      setMiss(null);
      setRetry(null);
      flights.fly(c.i, from, footIn(stageRef.current, places.current.get(k)), {
        ms: SNAP_MS,
        land: () => {
          playSnapSound();
          setPlaced(now);
          if (now.length === 3) lightShow();
        },
      });
    },
  });

  const pickUp = useCallback(
    (e: PointerEvent<HTMLElement>, i: number) => {
      const done = placedRef.current;
      if (!readyRef.current || done.length === 3 || done.includes(i) || isSolved()) return;
      const foot = footIn(null, towerEls.current[i]);
      const place = places.current.get(0)?.getBoundingClientRect();
      if (place) setSlop(Math.round(place.width * 0.15));
      if (start(e, { i, gx: foot.x - e.clientX, gy: foot.y - e.clientY })) {
        playPickUpSound();
        setRetry(null);
      }
    },
    [isSolved, start]
  );

  // the idle hand (and a miss) shows the next tower going to its place
  const carried = dragging?.i;
  const waiting = ready && !lined && !solved && dragging === null && !flights.busy;
  const idle = useIdleHand(waiting, `${placed.length}-${miss?.n ?? 0}`);
  const hint = ready && !lined && !solved && (idle || miss !== null);
  const [hand, setHand] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);
  useEffect(() => {
    if (!idle || next === undefined) return;
    const raf = requestAnimationFrame(() => {
      const a = centreIn(stageRef.current, floorsRefs.current[next]);
      const b = centreIn(stageRef.current, pads.current[placed.length]);
      setHand({ fx: a.x, fy: a.y, tx: b.x, ty: b.y });
    });
    return () => cancelAnimationFrame(raf);
  }, [idle, next, placed.length]);

  /** Tower `i` of the row: in the row, on the stand (at `spot`), or a picture
   *  of it (`copy`: under the finger, or gliding). */
  const tower = (i: number, where: "row" | "stand" | "copy", spot = 0) => {
    const lit = where === "stand" && lights > spot;
    const inRow = where === "row";
    return (
      <Tower
        floors={r.row[i]}
        shape={shape}
        variant={r.gold === i ? "gold" : "glass"}
        time="dusk"
        grab={inRow && !lined ? (e) => pickUp(e, i) : undefined}
        away={inRow && (carried === i || flights.flying((t) => t === i))}
        hint={inRow && hint && i === next && carried !== i}
        shine={lit}
        glow={lit ? 1 : 0}
        towerRef={
          inRow
            ? (el) => {
                towerEls.current[i] = el;
              }
            : undefined
        }
        floorsRef={
          inRow
            ? (el) => {
                floorsRefs.current[i] = el;
              }
            : undefined
        }
        label={where === "copy" ? undefined : r.gold === i ? "the gold tower" : "a silver tower"}
      />
    );
  };

  const sizes = cssVars({ "--bjt-n": shape });
  return (
    <NgStage
      stageRef={stageRef}
      playClass="bjt-play bjt-play--order"
      world={<DubaiWorld time="dusk" />}
      round={round}
      solved={solved}
      say={say(clipText(retry !== null ? TRY_AGAIN_CLIP : lined ? LINED_CLIP : ORDER_CLIP))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          <Polaroid row={r.row} gold={r.gold} />
          {overlay}
          <div className="bjt-carry" style={sizes}>
            {flights.layer((i) => (
              <span className="bjt-carried-tower">{tower(i, "copy")}</span>
            ))}
            {dragging !== null && (
              <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
                <span
                  className="bjt-grab-at"
                  style={cssVars({
                    "--bjt-gx": `${dragging.gx}px`,
                    "--bjt-gy": `${dragging.gy}px`,
                  })}
                >
                  <span className="bjt-carried-tower bjt-carried--lifted">
                    {tower(dragging.i, "copy")}
                  </span>
                </span>
              </div>
            )}
          </div>
          {idle && hand && (
            <TeachingHand key={placed.length} fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />
          )}
        </>
      }
    >
      <div className="bjt-board" style={sizes}>
        {/* the jumbled row */}
        <div className="bjt-row">
          {PLACES.map((i) => (
            <div
              key={i}
              ref={(el) => {
                homes.current[i] = el;
              }}
              className="bjt-place"
            >
              {!placed.includes(i) && tower(i, "row")}
            </div>
          ))}
        </div>

        {/* the stand: three places, short to tall */}
        <div ref={standRef} className="bjt-stand">
          <div className="bjt-stand-places">
            {PLACES.map((k) => (
              <div
                key={k}
                ref={(el) => {
                  if (el) places.current.set(k, el);
                  else places.current.delete(k);
                }}
                className={`bjt-place bjt-place--stand ${
                  ready && !lined && !solved && k === placed.length ? "bjt-place--next" : ""
                } ${over === k ? "bjt-place--over" : ""}`}
              >
                <span
                  ref={(el) => {
                    pads.current[k] = el;
                  }}
                  className="bjt-pad"
                  aria-hidden="true"
                />
                {placed[k] !== undefined && tower(placed[k], "stand", k)}
              </div>
            ))}
          </div>
          <span className="bjt-ramp" aria-hidden="true" />
        </div>
      </div>
    </NgStage>
  );
}
