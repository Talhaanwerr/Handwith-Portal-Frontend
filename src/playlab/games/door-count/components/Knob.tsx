"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/**
 * THE ANSWER IS A DOOR KNOB.
 *
 * A round brass knob on a backplate, big enough for a small hand, carrying
 * the door it names: a little door with its number on it, and the words
 * "Door 3" underneath for a grown-up. One knob per door, so "which door has
 * MORE?" is answered by NAMING a door rather than by reaching for it.
 *
 * It TURNS under the finger like a real knob, and stays turned once it has
 * opened the doors. A wrong knob shakes its head and springs back. Nothing
 * is ever taken away.
 */

interface KnobProps {
  /** The door this knob names. */
  label: number;
  /** `right` locks it open and green; `wrong` shakes it and lets go. */
  state: "idle" | "right" | "wrong";
  disabled: boolean;
  onPick: () => void;
  /** Hands the button back, so the teaching hand knows where to point. */
  elementRef?: (el: HTMLElement | null) => void;
}

const SHAKE = { x: [0, -9, 9, -7, 7, 0] };

export function Knob({ label, state, disabled, onPick, elementRef }: KnobProps) {
  /** Held down right now — the knob is mid-turn. */
  const [pressed, setPressed] = useState(false);
  const turned = pressed || state === "right";

  return (
    <motion.button
      type="button"
      className="dc-knob"
      ref={elementRef}
      data-state={state}
      onClick={onPick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      disabled={disabled}
      aria-label={`Door ${label}`}
      animate={state === "wrong" ? SHAKE : { x: 0, scale: state === "right" ? 1.08 : 1 }}
      transition={
        state === "wrong" ? { duration: 0.42 } : { type: "spring", stiffness: 320, damping: 18 }
      }
    >
      <motion.span
        className="dc-knob-face"
        animate={{ rotate: turned ? 26 : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
      >
        <span className="dc-knob-door">
          <svg viewBox="0 0 60 80" className="dc-art" aria-hidden="true">
            <rect x="6" y="4" width="48" height="76" rx="4" fill="#F2E4C4" />
            <rect x="11" y="9" width="38" height="71" rx="3" fill="#C98A3F" />
            <rect x="16" y="14" width="28" height="28" rx="2" fill="#A86C28" />
            <circle cx="44" cy="52" r="3.4" fill="#F6E0A0" />
          </svg>
          <span className="dc-knob-door-n font-rounded font-black">{label}</span>
        </span>
      </motion.span>
      <span className="dc-knob-label font-rounded font-black">Door {label}</span>
    </motion.button>
  );
}

/**
 * More is a tall stack going up; less is one block going down.
 *
 * The game never asks the child to choose between these two words — the
 * answer is always a door — but the pair IS what the More & Less module
 * teaches, so the home screen puts both behind its door, where a picture has
 * to say what is inside.
 */
export function WordArt({ word }: { word: "more" | "less" }) {
  const more = word === "more";
  return (
    <svg viewBox="0 0 60 60" className="dc-art" aria-hidden="true">
      {more ? (
        <>
          <rect x="10" y="40" width="16" height="12" rx="2" fill="#2F8F4F" />
          <rect x="10" y="27" width="16" height="12" rx="2" fill="#3FA862" />
          <rect x="10" y="14" width="16" height="12" rx="2" fill="#57C47D" />
          <path
            d="M42 48 L42 18 M42 18 L34 27 M42 18 L50 27"
            stroke="#2F8F4F"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      ) : (
        <>
          <rect x="10" y="40" width="16" height="12" rx="2" fill="#D98A28" />
          <path
            d="M42 14 L42 44 M42 44 L34 35 M42 44 L50 35"
            stroke="#C9721A"
            strokeWidth="5"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}
