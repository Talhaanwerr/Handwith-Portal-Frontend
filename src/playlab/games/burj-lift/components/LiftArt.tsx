"use client";

import { memo, type ReactNode, type Ref } from "react";
import { motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";
import { Thing } from "@games/number-groups/components/SumParts";
import { KidArt } from "@games/burj-lift/components/KidArt";
import { COLOUR_PAINT, type Colour, type Kid } from "@games/burj-lift/constants/rounds";

/**
 * Burj Lift's own pieces (styles in `burj-lift/styles/burj-lift.css`, all
 * `bjl-` classes, no SVG ids): the chunky arrow, the balloon, a floor's sign,
 * what a child wants (a bubble or a balloon), and the glass lift car with its
 * doors and its rider. The tower and the world are Burj Khalifa's
 * (`BurjTower`, `DubaiWorld`), never redrawn here; the children are KidArt.
 */

export type LiftDir = "up" | "down";

/** A fat arrow, pointing up or down. Coloured by `currentColor`. */
export function LiftArrow({ dir, className = "" }: { dir: LiftDir; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={`bjl-arrow ${className}`} aria-hidden="true">
      <g transform={dir === "down" ? "rotate(180 20 20)" : undefined}>
        <path
          d="M20 3 L37 21 H27 V36 Q27 38 25 38 H15 Q13 38 13 36 V21 H3 Z"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}

/** A party balloon on a long string, in one colour (face and darker edge);
 *  the string's end is the bottom centre of the box. */
export function Balloon({ face, edge }: { face: string; edge: string }) {
  return (
    <svg viewBox="0 0 40 90" className="bjl-balloon-art" aria-hidden="true">
      <path
        d="M20 44 Q14 54 21 63 Q27 72 19 81 Q17 85 20 90"
        fill="none"
        stroke="#6b5a3a"
        strokeWidth="1.6"
      />
      <path d="M17 43 H23 L21.5 46.5 H18.5 Z" fill={edge} />
      <ellipse cx="20" cy="22" rx="17" ry="20.5" fill={edge} />
      <ellipse cx="20" cy="21" rx="15.4" ry="19" fill={face} />
      <ellipse cx="13.5" cy="13" rx="4" ry="6.5" fill="#ffffff" opacity="0.45" />
    </svg>
  );
}

/** A colour, as a glossy square tile (a floor's sign in Colour Floors). */
function Swatch({ colour }: { colour: Colour }) {
  const paint = COLOUR_PAINT[colour];
  return (
    <span
      className="bjl-swatch"
      style={cssVars({ "--bjl-face": paint.face, "--bjl-edge": paint.edge })}
    />
  );
}

/** A floor's number in its green disc (the tower games' number badge). */
function FloorNumber({ n }: { n: number }) {
  return <span className="bjl-num font-rounded font-black">{n}</span>;
}

/**
 * A FLOOR'S SIGN — a white plate in a gold frame: the floor's picture (or its
 * colour) and its number, big. `here` lights it while the lift stands at the
 * floor; `reached` turns the frame green when a child has got out there.
 */
export const FloorSign = memo(function FloorSign({
  n,
  pic,
  colour,
  here,
  reached,
  signRef,
}: {
  n: number;
  pic?: string;
  colour?: Colour;
  here: boolean;
  reached: boolean;
  signRef?: Ref<HTMLSpanElement>;
}) {
  return (
    <span
      ref={signRef}
      className={`bjl-sign ${here ? "bjl-sign--here" : ""} ${reached ? "bjl-sign--reached" : ""}`}
    >
      <span className="bjl-sign-face">
        {pic ? <Thing id={pic} /> : colour ? <Swatch colour={colour} /> : null}
      </span>
      <FloorNumber n={n} />
    </span>
  );
});

/**
 * WHAT A CHILD WANTS — Up or Down?: a speech bubble with the picture and the
 * number of their floor (the floor's own sign, small); Colour Floors: a
 * balloon of their floor's colour. `tail` is the side the bubble points to.
 */
export function Wish({
  n,
  pic,
  colour,
  tail,
}: {
  n: number;
  pic?: string;
  colour?: Colour;
  tail: "down" | "left";
}) {
  if (colour)
    return (
      <span className="bjl-wish bjl-wish--balloon" aria-hidden="true">
        <Balloon {...COLOUR_PAINT[colour]} />
      </span>
    );
  return (
    <span className={`bjl-wish bjl-wish--bubble bjl-wish--${tail}`} aria-hidden="true">
      <span className="bjl-wish-pic">{pic && <Thing id={pic} />}</span>
      <FloorNumber n={n} />
    </span>
  );
}

/** What the rider is doing: standing in the car, or stepping out happy. */
export type RiderPhase = "in" | "out";

/**
 * THE LIFT CAR — a glass cabin in a gold frame, a pulley box on top and a sill
 * below, two glass doors that slide open (`open`) and shut. A rider (a new
 * `riderKey`) stands inside behind the glass; `riderPhase="out"` makes them
 * hop out to the left, onto the floor the car has stopped at, cheering, and
 * go in. `glow` rings the cabin while a child is carried ("drop me here"),
 * brighter when the finger is over it. `wish` is drawn beside the cabin.
 *
 * The ride itself is the car's CSS `translate` (`.bjl-car`, from
 * `--bjl-level`), never a framer transform, so the rider's own hop is free.
 */
export function LiftCar({
  rider,
  riderKey,
  riderPhase,
  open,
  glow,
  wish,
  carRef,
  cabinRef,
  seatRef,
  level,
}: {
  rider: Kid | null;
  riderKey: string | number;
  riderPhase: RiderPhase;
  open: boolean;
  glow: "none" | "open" | "over";
  wish?: ReactNode;
  carRef?: Ref<HTMLDivElement>;
  /** The drop target: the cabin. */
  cabinRef?: Ref<HTMLSpanElement>;
  /** Where a rider stands (a carried child flies to it). */
  seatRef?: Ref<HTMLSpanElement>;
  /** The stop the car is at, or riding to: 0 (the ground) to 4. */
  level: number;
}) {
  const out = riderPhase === "out";
  return (
    <div ref={carRef} className="bjl-car" style={cssVars({ "--bjl-level": level })}>
      <span className="bjl-car-cap" aria-hidden="true" />
      <span ref={cabinRef} className={`bjl-car-cabin bjl-car-cabin--${glow}`} aria-hidden="true">
        <span className="bjl-car-back" />
        <span ref={seatRef} className="bjl-rider-seat">
          {rider && (
            <motion.span
              key={riderKey}
              className="bjl-rider"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={
                out
                  ? {
                      x: ["0%", "-60%", "-120%", "-120%", "-120%"],
                      y: ["0%", "-34%", "0%", "-12%", "0%"],
                      opacity: [1, 1, 1, 1, 0],
                      scale: 1,
                    }
                  : { x: "0%", y: "0%", opacity: 1, scale: 1 }
              }
              transition={
                out
                  ? { duration: 1, times: [0, 0.28, 0.55, 0.75, 1], ease: "easeOut" }
                  : { duration: 0.2, ease: "easeOut" }
              }
            >
              <KidArt who={rider} pose={out ? "cheer" : "stand"} />
            </motion.span>
          )}
        </span>
        <span className="bjl-car-doors">
          <span className={`bjl-door bjl-door--l ${open ? "bjl-door--open" : ""}`} />
          <span className={`bjl-door bjl-door--r ${open ? "bjl-door--open" : ""}`} />
        </span>
        <span className="bjl-car-glass" />
      </span>
      <span className="bjl-car-sill" aria-hidden="true" />
      {wish && <span className="bjl-car-wish">{wish}</span>}
    </div>
  );
}
