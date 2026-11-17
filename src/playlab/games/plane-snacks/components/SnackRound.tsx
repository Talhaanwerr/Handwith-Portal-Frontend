"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence } from "@shared/audio/voice";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { Thing } from "@games/number-groups/components/SumParts";
import { CabinWorld } from "@games/plane-seats/components/CabinWorld";
import {
  SnackItem,
  SnackSeat,
  ThoughtBubble,
  Trolley,
} from "@games/plane-snacks/components/SnackParts";
import { ASK_SNACK, SNACK_ROUNDS, snackName, yumClip } from "@games/plane-snacks/constants/rounds";

/** The trolley rolling in (the CSS roll on `.psn-cart` is given this). */
const ROLL_MS = 1300;
/** The least time from a snack given to the next passenger asking. */
const SERVE_MS = 1500;
/** To the passenger: a shared layout animation carries the very same snack. */
const FLY = { type: "spring" as const, stiffness: 170, damping: 21 };

type Phase = "roll" | "ask" | "serve";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Where a snack given away came from: its place on the trolley, and which
 *  copy (each place is restocked after a snack leaves it). */
interface Given {
  slot: number;
  copy: number;
}

/**
 * ONE ROUND OF SNACK TROLLEY — three passengers, left to right.
 *
 * The trolley rolls down the aisle. A thought bubble pops up over the first
 * passenger: "What does this friend want?" Tap that snack on the trolley and
 * it flies into their hands, its name is said, they hop and say thank you,
 * and the trolley is restocked. A wrong snack shakes, "Try again!", and the
 * right one glows. When the third passenger has their snack the round is won.
 * Taps while the trolley rolls or a snack is flying do nothing.
 */
export function SnackRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = SNACK_ROUNDS[round];
  const stageRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const schedule = useScheduler();
  /** The passenger asking (0–2). */
  const [order, setOrder] = useState(0);
  const [phase, setPhase] = useState<Phase>("roll");
  /** Per passenger served so far: where their snack came from. */
  const [given, setGiven] = useState<readonly Given[]>([]);
  /** Per trolley place: how many snacks have left it. */
  const [stock, setStock] = useState<readonly number[]>(() => r.tray.map(() => 0));
  /** Wrong snacks for this passenger (the right one glows after one). */
  const [misses, setMisses] = useState(0);
  const [shakes, setShakes] = useState<Readonly<Record<number, number>>>({});
  /** Set the moment a snack is given, so two quick taps never give two. */
  const busyRef = useRef(false);

  const o = r.orders[order];
  const wantSlot = r.tray.indexOf(o.want);

  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const cast = useMemo(
    () =>
      r.tray.map((id) => (
        <span key={id} className="ng-cast">
          <Thing id={id} />
        </span>
      )),
    [r.tray]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + 53,
    stageRef,
    cast,
    onDone,
  });

  // the trolley rolls in, then the first passenger asks
  useEffect(() => {
    schedule(() => {
      setPhase("ask");
      void playSequence([ASK_SNACK]);
    }, ROLL_MS + 150);
  }, [schedule]);

  const pick = useCallback(
    (slot: number) => {
      if (busyRef.current || phase !== "ask" || isSolved()) return;
      if (slot !== wantSlot) {
        playIncorrectSound();
        void playClip("instr-try-again");
        setShakes((s) => ({ ...s, [slot]: (s[slot] ?? 0) + 1 }));
        setMisses((m) => m + 1);
        onMiss();
        return;
      }
      busyRef.current = true;
      playStarPop();
      burst(itemRefs.current[slot]);
      setGiven((g) => [...g, { slot, copy: stock[slot] }]);
      setStock((st) => st.map((c, i) => (i === slot ? c + 1 : c)));
      setPhase("serve");
      const k = order;
      void Promise.all([playSequence([snackName(o.want), yumClip(k)], 150), wait(SERVE_MS)]).then(
        () => {
          if (!alive.current) return;
          if (k + 1 === r.orders.length) {
            finish(rowRef.current);
            return;
          }
          busyRef.current = false;
          setMisses(0);
          setOrder(k + 1);
          setPhase("ask");
          void playSequence([ASK_SNACK]);
        }
      );
    },
    [phase, isSolved, wantSlot, onMiss, burst, stock, order, o.want, r.orders.length, finish]
  );

  // the idle hand (and a miss) points at the snack in the bubble
  const asking = phase === "ask" && !solved;
  const idle = useIdleHand(asking, `${order}-${misses}`);
  const hint = asking && (idle || misses > 0);
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!idle) return;
    const raf = requestAnimationFrame(() =>
      setHand(centreIn(stageRef.current, itemRefs.current[wantSlot]))
    );
    return () => cancelAnimationFrame(raf);
  }, [idle, wantSlot]);

  const snackId = (slot: number, copy: number) => `psn-snack-${round}-${slot}-${copy}`;
  /** The guide bar's line: the question; "Try again!" after a wrong snack,
   *  until the right one is tapped; the thank-you while the snack flies over. */
  const line = phase === "serve" ? yumClip(order) : misses > 0 ? "instr-try-again" : ASK_SNACK;

  return (
    <NgStage
      stageRef={stageRef}
      playClass="psn-play psn-play--snacks"
      world={<CabinWorld />}
      round={round}
      solved={solved}
      say={say(clipText(line))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {idle && hand && <TeachingHand fx={hand.x} fy={hand.y} tx={hand.x} ty={hand.y} />}
        </>
      }
    >
      <LayoutGroup>
        <div className="psn-board">
          <div ref={rowRef} className="psn-row">
            {r.orders.map((x, k) => {
              const g = given[k];
              return (
                <SnackSeat key={x.who} who={x.who} happy={!!g}>
                  <AnimatePresence>
                    {phase === "ask" && order === k && !solved && (
                      <ThoughtBubble key="bubble" want={x.want} />
                    )}
                  </AnimatePresence>
                  {g && (
                    <motion.span
                      layoutId={snackId(g.slot, g.copy)}
                      className="psn-lap"
                      transition={FLY}
                    >
                      <Thing id={r.tray[g.slot]} />
                    </motion.span>
                  )}
                </SnackSeat>
              );
            })}
          </div>

          {/* the aisle: the trolley rolls in from the right */}
          <div className="psn-aisle">
            <div className="psn-cart">
              <Trolley rolling={phase === "roll"}>
                {r.tray.map((id, slot) => (
                  <SnackItem
                    key={slot}
                    id={id}
                    layoutId={snackId(slot, stock[slot])}
                    fresh={stock[slot] > 0}
                    live={asking}
                    hint={hint && slot === wantSlot}
                    shake={shakes[slot] ?? 0}
                    onTap={() => pick(slot)}
                    itemRef={(el) => {
                      itemRefs.current[slot] = el;
                    }}
                  />
                ))}
              </Trolley>
            </div>
          </div>
        </div>
      </LayoutGroup>
    </NgStage>
  );
}
