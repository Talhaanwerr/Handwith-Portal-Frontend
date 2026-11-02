"use client";

import { memo, type ReactNode, type Ref } from "react";
import { motion } from "framer-motion";
import { Picture } from "@games/blend-read/components/PictureArt";
import { VOCAB_ART } from "@games/letter-treats/components/candy-world/VocabArt";
import { SpaceScene } from "@games/space-letters/components/SpaceScene";

/**
 * ROCKET COUNTDOWN'S WORLD AND PROPS. The world is Space ABC's space scene,
 * reused as it is (drawn wide and tall; its CSS shows the one that fits).
 * The rocket, the astronaut and the star are Letter Treats' (`VOCAB_ART`),
 * the planet is Twemoji's. Drawn here only what nothing ships: the launch
 * pad with its lights, the launch tower, a fuel cell, the fuel tank and the
 * Go! lever — chunky and soft-shaded like the rest.
 */

const RocketArt = VOCAB_ART.rocket;
const AstronautArt = VOCAB_ART.astronaut;
const StarArt = VOCAB_ART.star;

/** Space behind every screen. Nothing in it moves. */
export const SpaceWorld = memo(function SpaceWorld() {
  return (
    <div className="rkc-space" aria-hidden="true">
      <SpaceScene />
      <SpaceScene tall />
    </div>
  );
});

/** Where the rocket goes, as travel from where it stands (stage pixels). */
export interface Flight {
  dx: number;
  dy: number;
  /** How small it is when it gets there. */
  scale: number;
  /** The first straight-up rise, before it turns (pixels). */
  lift: number;
}

/** Seconds from lift-off to landing. Smooth and short. */
export const FLIGHT_S = 2.6;

/**
 * The rocket on its launch pad. The pad's front hides the rocket's flame
 * while it waits; a row of lights on the pad switches on one by one; a puff
 * of smoke rolls out each time `puff` changes. With a `flight` it lifts off
 * (a tween of transform only), its big flame lit, and travels there.
 */
export const RocketOnPad = memo(function RocketOnPad({
  lamps,
  lit,
  puff,
  flight,
  rocketRef,
  window: windowNum,
}: {
  /** How many lights the pad has (0 for none). */
  lamps: number;
  /** How many are on. */
  lit: number;
  /** Changes for every puff of smoke (0: none yet). */
  puff: number;
  flight: Flight | null;
  rocketRef?: Ref<HTMLSpanElement>;
  /** The number in the rocket's fuel window, if it has one. */
  window?: number;
}) {
  return (
    <div className="rkc-launch">
      <motion.span
        ref={rocketRef}
        className={`rkc-rocket ${flight ? "is-flying" : ""}`}
        animate={
          flight
            ? {
                x: [0, 0, flight.dx * 0.4, flight.dx],
                y: [0, -flight.lift, flight.dy * 0.7, flight.dy],
                scale: [1, 1, (1 + flight.scale) / 2, flight.scale],
                rotate: [0, 0, flight.dx > 0 ? 24 : 0, 0],
              }
            : { x: 0, y: 0, scale: 1, rotate: 0 }
        }
        transition={
          flight
            ? { duration: FLIGHT_S, times: [0, 0.2, 0.62, 1], ease: "easeInOut" }
            : { duration: 0 }
        }
      >
        {flight && (
          <span className="rkc-exhaust" aria-hidden="true">
            <span className="rkc-exhaust-flame" />
          </span>
        )}
        <span className="rkc-rocket-art">
          <RocketArt />
        </span>
        {windowNum !== undefined && (
          <span className="rkc-window font-rounded font-black">{windowNum}</span>
        )}
      </motion.span>
      <span className="rkc-pad">
        <span className="rkc-pad-deck" />
        <span className="rkc-pad-front">
          {Array.from({ length: lamps }, (_, k) => (
            <span key={k} className={`rkc-lamp ${k < lit ? "is-on" : ""}`} />
          ))}
        </span>
      </span>
      {puff > 0 && (
        <span key={puff} className="rkc-smoke" aria-hidden="true">
          <span className="rkc-smoke-bit" />
          <span className="rkc-smoke-bit" />
          <span className="rkc-smoke-bit" />
          <span className="rkc-smoke-bit" />
        </span>
      )}
    </div>
  );
});

/** The planet the rocket flies to, with the astronaut waiting by it. */
export const Destination = memo(function Destination({
  planetRef,
  landed,
}: {
  planetRef?: Ref<HTMLSpanElement>;
  landed: boolean;
}) {
  return (
    <div className="rkc-dest">
      <span className={`rkc-astronaut ${landed ? "is-happy" : ""}`}>
        <AstronautArt />
      </span>
      <span ref={planetRef} className="rkc-planet">
        <Picture id="planet" />
      </span>
    </div>
  );
});

/** A big star with its number — one place on the launch tower. */
export const NumberStar = memo(function NumberStar({ n }: { n: number }) {
  return (
    <span className="rkc-star">
      <span className="rkc-star-art">
        <StarArt />
      </span>
      <span className="rkc-star-num font-rounded font-black">{n}</span>
    </span>
  );
});

/** The launch tower: a red-and-white lattice with arms for the stars. */
export function Tower({ children }: { children: ReactNode }) {
  return (
    <div className="rkc-tower">
      <span className="rkc-tower-mast" aria-hidden="true" />
      <div className="rkc-tower-grid">{children}</div>
    </div>
  );
}

/** A fuel cell: a glowing star battery. 60 × 70. */
export const FuelCell = memo(function FuelCell() {
  return (
    <svg className="rkc-cell-art" viewBox="0 0 60 70" aria-hidden="true">
      <circle cx="30" cy="38" r="30" fill="#FFE27A" opacity="0.28" />
      <rect x="22" y="4" width="16" height="9" rx="3" fill="#C9902A" />
      <rect x="22" y="3" width="16" height="8" rx="3" fill="#FFD466" />
      <rect x="10" y="12" width="40" height="56" rx="10" fill="#2C3F8C" />
      <rect x="10" y="10" width="40" height="56" rx="10" fill="#5B7FFF" />
      <rect x="10" y="40" width="40" height="26" rx="10" fill="#3C56B8" opacity="0.6" />
      <rect x="15" y="14" width="6" height="40" rx="3" fill="#FFFFFF" opacity="0.35" />
      <path
        d="M30 22 L34 31 L44 32 L36.6 38.6 L38.8 48 L30 43 L21.2 48 L23.4 38.6 L16 32 L26 31 Z"
        fill="#FFE27A"
      />
      <path d="M30 43 L38.8 48 L36.6 38.6 L44 32 L35 34 Z" fill="#F2B823" opacity="0.6" />
    </svg>
  );
});

/** A full place in the tank: a lit bar with a star. */
export function FuelBar() {
  return (
    <span className="rkc-bar">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3 L14.6 9 L21 9.5 L16.2 13.7 L17.6 20 L12 16.7 L6.4 20 L7.8 13.7 L3 9.5 L9.4 9 Z"
          fill="#FFFFFF"
        />
      </svg>
    </span>
  );
}
