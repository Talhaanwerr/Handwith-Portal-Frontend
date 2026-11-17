"use client";

import { memo, useEffect, type ReactNode, type Ref } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Thing } from "@games/number-groups/components/SumParts";
import { PaxFigure, SeatBack, SeatFront } from "@games/plane-seats/components/SeatParts";
import type { Passenger } from "@games/plane-seats/constants/rounds";

/**
 * The pieces of Snack Trolley: a seat with its passenger (Plane Seats' own
 * seat and passenger art, without a number), the thought bubble, the silver
 * trolley and one snack on it. Sized from the `--psn-*` units in
 * plane-snacks.css (shares of the stage), so one rule sizes every screen.
 */

/** A shake (a wrong snack): a tween, as framer's springs take two keyframes
 *  only. */
const SHAKE = { x: [0, -10, 9, -5, 0], transition: { duration: 0.4 } };
/** A happy hop in the seat (a tween: three keyframes). */
const HOP = { y: [0, -14, 0], transition: { duration: 0.5, ease: "easeOut" as const } };

/**
 * ONE SEAT with its passenger — no button (the trolley's snacks are what is
 * tapped). `happy` makes the passenger hop and two hearts float up; what is
 * drawn over the seat (the thought bubble, the snack in their hands) is
 * `children`.
 */
export function SnackSeat({
  who,
  happy,
  seatRef,
  children,
}: {
  who: Passenger;
  happy: boolean;
  seatRef?: Ref<HTMLSpanElement>;
  children?: ReactNode;
}) {
  const controls = useAnimationControls();
  useEffect(() => {
    if (happy) void controls.start(HOP);
  }, [happy, controls]);

  return (
    <span ref={seatRef} className="pls-seat psn-seat">
      <SeatBack />
      <span className="pls-seat-spot">
        <motion.span className="pls-pax pls-pax--seated psn-pax" animate={controls}>
          <PaxFigure who={who} />
        </motion.span>
      </span>
      <SeatFront />
      {happy && <Hearts />}
      {children}
    </span>
  );
}

/** Two little hearts floating up from a happy passenger (CSS, once). */
const Hearts = memo(function Hearts() {
  return (
    <span className="psn-hearts" aria-hidden="true">
      {[0, 1].map((i) => (
        <svg key={i} className={`psn-heart psn-heart--${i}`} viewBox="0 0 24 22">
          <path
            d="M12 21C5 15.6 1 11.8 1 7.2 1 3.8 3.6 1.2 6.8 1.2c2.1 0 4 1.1 5.2 2.9 1.2-1.8 3.1-2.9 5.2-2.9 3.2 0 5.8 2.6 5.8 6 0 4.6-4 8.4-11 13.8z"
            fill="#ff6f91"
          />
          <path
            d="M6 5.6c-1.4.4-2.2 1.6-2.2 3"
            stroke="#ffffff"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
            opacity="0.7"
          />
        </svg>
      ))}
    </span>
  );
});

/** The thought bubble over a passenger's head: the snack they want. */
export function ThoughtBubble({ want }: { want: string }) {
  return (
    <motion.span
      className="psn-bubble"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.4, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 320, damping: 18 }}
      aria-hidden="true"
    >
      <span className="psn-bubble-dot psn-bubble-dot--1" />
      <span className="psn-bubble-dot psn-bubble-dot--2" />
      <span className="psn-bubble-cloud">
        <span className="psn-bubble-pic">
          <Thing id={want} />
        </span>
      </span>
    </motion.span>
  );
}

/**
 * THE TROLLEY — a chunky silver cart: the snacks (`children`) stand on its
 * top shelf, a red airline stripe and two drawers below, a push handle on
 * the right and four little wheels. `rolling` spins the wheels (it rolls in
 * at the start of a round; the roll itself is CSS on `.psn-cart`).
 */
export function Trolley({ rolling, children }: { rolling: boolean; children: ReactNode }) {
  return (
    <div className={`psn-trolley ${rolling ? "psn-trolley--rolling" : ""}`}>
      <div className="psn-trolley-shelf">{children}</div>
      <TrolleyBody />
    </div>
  );
}

/** Everything under the snacks — never re-rendered by a tap. */
const TrolleyBody = memo(function TrolleyBody() {
  return (
    <>
      <span className="psn-trolley-plate" aria-hidden="true" />
      <span className="psn-trolley-body" aria-hidden="true">
        <span className="psn-trolley-stripe" />
        <span className="psn-trolley-drawer">
          <span className="psn-trolley-pull" />
        </span>
        <span className="psn-trolley-drawer">
          <span className="psn-trolley-pull" />
        </span>
      </span>
      <span className="psn-trolley-handle" aria-hidden="true" />
      <span className="psn-trolley-wheels" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className="psn-wheel">
            <span className="psn-wheel-hub" />
          </span>
        ))}
      </span>
    </>
  );
});

/**
 * ONE SNACK on the trolley — the button. The picture inside carries the
 * `layoutId` that flies it to the passenger; once it has gone, the next copy
 * (`copy` + 1) pops back onto the shelf. `shake` is a counter: each time it
 * goes up, the snack shakes once. `hint` rings it in gold.
 */
export function SnackItem({
  id,
  layoutId,
  fresh,
  live,
  hint,
  shake,
  onTap,
  itemRef,
}: {
  id: string;
  layoutId: string;
  /** A copy put back after one was given away: it pops in. */
  fresh: boolean;
  live: boolean;
  hint: boolean;
  shake: number;
  onTap: () => void;
  itemRef?: Ref<HTMLButtonElement>;
}) {
  const controls = useAnimationControls();
  useEffect(() => {
    if (shake) void controls.start(SHAKE);
  }, [shake, controls]);

  return (
    <motion.button
      ref={itemRef}
      type="button"
      className={`psn-item ${live ? "psn-item--live" : ""} ${hint ? "psn-item--hint" : ""}`}
      animate={controls}
      onClick={onTap}
      disabled={!live}
      aria-label={id}
    >
      <span className="psn-item-ring" aria-hidden="true" />
      <span className="psn-item-shadow" aria-hidden="true" />
      <motion.span
        key={layoutId}
        layoutId={layoutId}
        className="psn-item-pic"
        initial={fresh ? { scale: 0 } : false}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 18, delay: fresh ? 0.55 : 0 }}
      >
        <Thing id={id} />
      </motion.span>
    </motion.button>
  );
}

/** A snack drawn still, on a mini trolley (the home card). */
export function StillSnack({ id }: { id: string }) {
  return (
    <span className="psn-item psn-item--still">
      <span className="psn-item-shadow" />
      <span className="psn-item-pic">
        <Thing id={id} />
      </span>
    </span>
  );
}
