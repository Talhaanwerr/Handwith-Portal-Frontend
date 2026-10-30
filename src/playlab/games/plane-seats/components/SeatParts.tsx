"use client";

import { memo, useEffect, type ReactNode, type Ref } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Thing } from "@games/number-groups/components/SumParts";
import { COAT, type Passenger } from "@games/plane-seats/constants/rounds";

/**
 * The pieces of Plane Seats: a seat, a passenger and the boarding passes.
 * All of them are sized from the `--pls-*` units in
 * plane-seats.css (shares of the stage), so one rule sizes every screen.
 */

/** A shake (a wrong seat): a tween, as framer's springs take two keyframes
 *  only. */
const SHAKE = { x: [0, -10, 9, -5, 0], transition: { duration: 0.4 } };

/**
 * ONE SEAT — a big chunky aeroplane seat with its number on the white
 * headrest cloth. The whole seat is the button. What sits in it (a
 * passenger) is `children`, drawn between the seat's back and its
 * cushion, so a passenger sinks into the seat. `shake` is a
 * counter: each time it goes up, the seat shakes once.
 */
export function Seat({
  n,
  live,
  hint = false,
  taken = false,
  shake = 0,
  onTap,
  seatRef,
  label,
  children,
}: {
  n: number;
  live: boolean;
  hint?: boolean;
  taken?: boolean;
  shake?: number;
  onTap: (n: number) => void;
  seatRef?: Ref<HTMLButtonElement>;
  label: string;
  children?: ReactNode;
}) {
  const controls = useAnimationControls();
  useEffect(() => {
    if (shake) void controls.start(SHAKE);
  }, [shake, controls]);

  return (
    <motion.button
      ref={seatRef}
      type="button"
      className={`pls-seat ${live ? "pls-seat--live" : ""} ${hint ? "pls-seat--hint" : ""} ${
        taken ? "pls-seat--taken" : ""
      }`}
      animate={controls}
      onClick={() => onTap(n)}
      disabled={!live}
      aria-label={label}
    >
      <span className="pls-seat-ring" aria-hidden="true" />
      <SeatBack />
      <span className="pls-seat-num font-rounded font-black" aria-hidden="true">
        {n}
      </span>
      <span className="pls-seat-spot">{children}</span>
      <SeatFront />
    </motion.button>
  );
}

/** The seat's back, its headrest cloth and its shadow on the carpet. */
export const SeatBack = memo(function SeatBack() {
  return (
    <svg className="pls-seat-art" viewBox="0 0 100 120" aria-hidden="true">
      <ellipse cx="50" cy="116" rx="46" ry="4" fill="rgba(20, 30, 70, 0.28)" />
      <rect x="10" y="7" width="80" height="96" rx="20" fill="#1F4F94" />
      <rect x="10" y="3" width="80" height="96" rx="20" fill="#2F6FC4" />
      <rect x="18" y="46" width="64" height="44" rx="12" fill="#3A80D6" />
      <path d="M22 56 H78" stroke="#2A63B0" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M22 72 H78" stroke="#2A63B0" strokeWidth="1.6" strokeLinecap="round" />
      {/* the headrest cloth the number is printed on */}
      <rect x="18" y="8" width="64" height="38" rx="9" fill="#DCE3EC" />
      <rect x="18" y="6" width="64" height="37" rx="9" fill="#FFFFFF" />
    </svg>
  );
});

/** The armrests, the cushion and the feet: drawn in front of a passenger. */
export const SeatFront = memo(function SeatFront() {
  return (
    <svg className="pls-seat-art pls-seat-front" viewBox="0 0 100 120" aria-hidden="true">
      <rect x="44" y="104" width="12" height="12" rx="3" fill="#56606E" />
      <rect x="10" y="104" width="8" height="12" rx="3" fill="#56606E" />
      <rect x="82" y="104" width="8" height="12" rx="3" fill="#56606E" />
      <rect x="6" y="88" width="88" height="20" rx="10" fill="#183E77" />
      <rect x="6" y="82" width="88" height="20" rx="10" fill="#2A63B0" />
      <rect x="14" y="84" width="72" height="5" rx="2.5" fill="#4A8EE0" opacity="0.7" />
      <rect x="0" y="62" width="13" height="40" rx="6" fill="#183E77" />
      <rect x="0" y="58" width="13" height="40" rx="6" fill="#244F91" />
      <rect x="87" y="62" width="13" height="40" rx="6" fill="#183E77" />
      <rect x="87" y="58" width="13" height="40" rx="6" fill="#244F91" />
    </svg>
  );
});

/**
 * A passenger: a Fluent animal face on a little drawn body in their own
 * jumper colour. Fills its box (square), standing in the aisle or sitting.
 */
export const PaxFigure = memo(function PaxFigure({ who }: { who: Passenger }) {
  return (
    <span className="pls-pax-fig">
      <svg className="pls-pax-body" viewBox="0 0 100 60" aria-hidden="true">
        <path d="M12 60 C12 24 30 6 50 6 C70 6 88 24 88 60 Z" fill={COAT[who]} />
        <path
          d="M12 60 C12 24 30 6 50 6 C70 6 88 24 88 60 Z"
          fill="rgba(0,0,0,0.12)"
          transform="translate(0 6)"
        />
        <path
          d="M36 10 L50 26 L64 10"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="pls-pax-head">
        <Thing id={who} />
      </span>
    </span>
  );
});

/** A little aeroplane, seen from above (the boarding pass's stub). */
export function PlaneGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="pls-plane-glyph" aria-hidden="true">
      <path
        d="M12 1.5c.9 0 1.5 1 1.5 2.2v5.4l8 4.6v2.2l-8-2.5v4.8l2.4 1.8v1.7L12 20.8l-3.9.9V20l2.4-1.8v-4.8l-8 2.5v-2.2l8-4.6V3.7c0-1.2.6-2.2 1.5-2.2z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

/** A tick stamped on a used boarding pass. */
function Stamp() {
  return (
    <motion.span
      className="pls-stamp"
      initial={{ scale: 2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 18 }}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24">
        <path
          d="M5 12.5l4.2 4.2L19 7"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.span>
  );
}

/** `n` dots in a little two-wide block — one side of a ticket's sum. */
function Dots({ n }: { n: number }) {
  return (
    <span className="pls-dots">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="pls-dot" />
      ))}
    </span>
  );
}

/**
 * A BOARDING PASS — a coloured stub with a little plane, a perforation, and
 * on the pass itself either the seat's numeral (Seat Numbers) or a dot sum
 * with the numbers under each side and "= ?" (Ticket Sums), whose answer
 * fills in once the passenger has sat down (`used`).
 */
export const Ticket = memo(function Ticket({
  seat,
  sum,
  used,
}: {
  seat: number;
  sum?: readonly [number, number];
  used: boolean;
}) {
  return (
    <div
      className={`pls-ticket ${sum ? "pls-ticket--sum" : ""}`}
      aria-label={sum ? `${sum[0]} plus ${sum[1]}` : `seat ${seat}`}
    >
      <span className="pls-ticket-stub">
        <PlaneGlyph />
        <span className="pls-ticket-code" />
      </span>
      <span className="pls-ticket-body">
        {sum ? (
          <span className="pls-tsum font-rounded font-black">
            <span className="pls-tsum-side">
              <Dots n={sum[0]} />
              <span className="pls-tsum-num">{sum[0]}</span>
            </span>
            <span className="pls-tsum-op">+</span>
            <span className="pls-tsum-side">
              <Dots n={sum[1]} />
              <span className="pls-tsum-num">{sum[1]}</span>
            </span>
            <span className="pls-tsum-op">=</span>
            <motion.span
              key={used ? "done" : "ask"}
              className={`pls-tsum-answer ${used ? "pls-tsum-answer--done" : ""}`}
              initial={used ? { scale: 0.5 } : false}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 320, damping: 14 }}
            >
              {used ? seat : "?"}
            </motion.span>
          </span>
        ) : (
          <span className="pls-ticket-num font-rounded font-black">{seat}</span>
        )}
      </span>
      {used && <Stamp />}
    </div>
  );
});
