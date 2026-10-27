"use client";

import { memo, useCallback, useRef, type ReactNode, type RefObject } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { playClickSound } from "@shared/audio/sfx";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { CarLift } from "@games/car-garage/components/GarageWorld";
import { CAR_H, boxVars, type Box } from "@games/car-garage/components/CarArt";

/** How long the finished car takes to roll down the ramp and away. */
export const DRIVE_MS = 1500;
/** The lift's height under the wheels, in car units (its platform to the ground). */
const LIFT_UNITS = 32;

/** A soft "beep beep" — two of the portal's gentle taps, the second a beat
 *  later. No new sound: nothing loud or sudden on a garage yard. */
export function playHonk(): void {
  playClickSound();
  setTimeout(playClickSound, 170);
}

/**
 * The finished car leaving: it rolls to the front of the lift, down the ramp
 * and off the right of the stage, on a slow tween; `then()` follows on the
 * clock. The car is moved by transform only; its slot is placed by layout.
 */
export function useDriveOff(stageRef: RefObject<HTMLDivElement | null>) {
  const controls = useAnimationControls();
  const slotRef = useRef<HTMLDivElement>(null);
  const schedule = useScheduler();
  const drive = useCallback(
    (then?: () => void) => {
      const stage = stageRef.current?.getBoundingClientRect();
      const car = slotRef.current?.getBoundingClientRect();
      const dx = stage && car ? stage.right - car.left + 40 : 1400;
      const drop = car ? (car.height * LIFT_UNITS) / CAR_H : 30;
      void controls.start({
        x: [0, dx * 0.12, dx],
        y: [0, drop, drop],
        transition: { duration: DRIVE_MS / 1000, times: [0, 0.3, 1], ease: "easeIn" },
      });
      if (then) schedule(then, DRIVE_MS);
    },
    [controls, schedule, stageRef]
  );
  return { controls, slotRef, drive };
}

/**
 * The bay: the lift, and the car standing on it. `children` is the car's own
 * layer (the CarArt and its drop targets, laid over it in car units).
 */
export const CarBay = memo(function CarBay({
  slotRef,
  controls,
  children,
}: {
  slotRef: RefObject<HTMLDivElement | null>;
  controls: ReturnType<typeof useAnimationControls>;
  children: ReactNode;
}) {
  return (
    <div className="bcg-rig">
      <span className="bcg-lift">
        <CarLift />
      </span>
      <motion.div ref={slotRef} className="bcg-car-slot" initial={false} animate={controls}>
        {children}
      </motion.div>
    </div>
  );
});

/** A box laid over the car in its own units — a drop target or a seat. */
export function SpotBox({
  box,
  className,
  register,
}: {
  box: Box;
  className: string;
  register: (el: HTMLElement | null) => void;
}) {
  return (
    <span
      ref={register}
      className={`bcg-at-box ${className}`}
      style={cssVars(boxVars(box))}
      aria-hidden="true"
    />
  );
}
