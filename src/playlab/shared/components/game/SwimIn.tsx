"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cssVars } from "@shared/styles/cssVars";

/** One creature arriving for the celebration. */
export interface Swimmer {
  node: ReactNode;
  /** Where it settles, as percentages of the celebration area. */
  x: string;
  y: string;
  /** Seconds before it sets off. Stagger these — a shoal arrives one by one. */
  delay: number;
  /** Which edge it swims in from. A swimmer is mirrored whenever its drawing
   *  would otherwise swim backwards. */
  from: "left" | "right";
  /** The way the DRAWING faces as drawn — most of the art looks right; the
   *  whale looks left. Right by default. */
  faces?: "left" | "right";
  /** Rendered width; defaults to a comfortable celebration size. */
  size?: string;
}

interface SwimInProps {
  swimmers: readonly Swimmer[];
}

/** Mirror the drawing when the way it faces is not the way it is going:
 *  coming from the right means heading left. */
function flipped(from: "left" | "right", faces: "left" | "right" = "right"): boolean {
  return (from === "right") !== (faces === "left");
}

/**
 * Creatures swimming into a celebration from the edges of the water.
 *
 * The ocean's answer to the jungle's friends popping in: instead of springing
 * up from a spot, each one glides in from off-screen with a slow ease-out,
 * then settles into a gentle bob for as long as the celebration lasts. Three
 * water games share this so none of them owns a shoal of its own.
 *
 * Centred on its point by MARGIN, never by transform — Framer owns the
 * transform for the glide, and a CSS translate here would be overwritten (the
 * bug that once drew Jungle Spy's letters from their corners).
 *
 * Clipped by its own wrapper: a swimmer starts 180px past its edge, and left
 * unclipped that would widen the overlay's scroll area for the glide.
 */
export function SwimIn({ swimmers }: SwimInProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {swimmers.map((s, i) => (
        <motion.div
          key={i}
          className={`pl-swim pl-at ${flipped(s.from, s.faces) ? "is-flipped" : ""}`}
          style={cssVars({
            "--pl-x": s.x,
            "--pl-y": s.y,
            "--pl-size": s.size ?? "clamp(48px, 11vmin, 100px)",
          })}
          aria-hidden="true"
          initial={{ x: s.from === "left" ? -180 : 180, opacity: 0 }}
          animate={{ x: 0, opacity: 1, y: [0, -8, 0, -5, 0] }}
          transition={{
            x: { delay: s.delay, duration: 0.95, ease: [0.22, 1, 0.36, 1] },
            opacity: { delay: s.delay, duration: 0.3 },
            // the bob starts once it has arrived, and keeps going
            y: { delay: s.delay + 0.95, duration: 2.6, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          {s.node}
        </motion.div>
      ))}
    </div>
  );
}

/** One creature crossing the whole scene. */
export interface Crosser {
  node: ReactNode;
  /** Height it swims at, as a percentage of the celebration area. */
  y: string;
  /** Seconds before it sets off. */
  delay: number;
  /** Seconds the crossing takes — a whale is slow, a shoal is quick. */
  dur: number;
  /** The edge it enters from; it leaves by the other one. */
  from: "left" | "right";
  /** The way the drawing faces as drawn. Right by default. */
  faces?: "left" | "right";
  size?: string;
}

interface SwimAcrossProps {
  crossers: readonly Crosser[];
}

/**
 * Creatures swimming right across the celebration and out the other side —
 * a whale passing in the distance, a shoal darting through.
 *
 * A crosser starts just outside one edge and travels a screen and a half of
 * viewport width, so it is fully gone before its transition ends whatever the
 * screen's shape. Same box and centring as SwimIn; same clipping wrapper.
 */
export function SwimAcross({ crossers }: SwimAcrossProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {crossers.map((c, i) => (
        <motion.div
          key={i}
          className={`pl-swim pl-at ${flipped(c.from, c.faces) ? "is-flipped" : ""}`}
          style={cssVars({
            "--pl-x": c.from === "left" ? "-25%" : "125%",
            "--pl-y": c.y,
            "--pl-size": c.size ?? "clamp(64px, 16vmin, 150px)",
          })}
          aria-hidden="true"
          initial={{ x: 0, y: 0 }}
          animate={{ x: c.from === "left" ? "150vw" : "-150vw", y: [0, -10, 0, 8, 0] }}
          transition={{
            x: { delay: c.delay, duration: c.dur, ease: "linear" },
            // a couple of slow undulations over the crossing
            y: { delay: c.delay, duration: c.dur / 2, repeat: 1, ease: "easeInOut" },
          }}
        >
          {c.node}
        </motion.div>
      ))}
    </div>
  );
}
