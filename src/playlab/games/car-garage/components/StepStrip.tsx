"use client";

import { memo } from "react";
import { cssVars } from "@shared/styles/cssVars";
import {
  PartArt,
  spotBox,
  type CarBody,
  type CarColourId,
  type PartKind,
} from "@games/car-garage/components/CarArt";
import { STEPS } from "@games/car-garage/constants/rounds";

/**
 * A loose part's picture at its true shape: the box it fills is the part's
 * place on the car (`spotBox`), so the tray piece, the carried piece and the
 * part on the car are one size ratio. `register` gets the picture itself —
 * the drag measures from it, not from the button around it.
 */
export function PieceArt({
  body,
  colour,
  kind,
  withWindows = false,
  register,
}: {
  body: CarBody;
  colour: CarColourId;
  kind: PartKind;
  withWindows?: boolean;
  register?: (el: HTMLElement | null) => void;
}) {
  const b = spotBox(body, kind === "wheel" ? "wheel-0" : kind);
  return (
    <span
      ref={register}
      className="bcg-piece-art"
      style={cssVars({ "--bcg-r": (b.w / b.h).toFixed(3) })}
    >
      <PartArt body={body} colour={colour} kind={kind} withWindows={withWindows} />
    </span>
  );
}

/**
 * THE STEP STRIP — the building order, always in view: body → wheels →
 * roof → windows, each a little picture of this round's own part. The step
 * being built glows, the ones done get a tick, the ones to come wait pale.
 * The wheels' step carries four dots that fill as each wheel goes on — the
 * count the child hears, made visible.
 */
export const StepStrip = memo(function StepStrip({
  body,
  colour,
  now,
  wheelsOn,
}: {
  body: CarBody;
  colour: CarColourId;
  /** The step being built (STEPS.length once the car is whole). */
  now: number;
  wheelsOn: number;
}) {
  return (
    <ol
      className="bcg-steps"
      aria-label={`Step ${Math.min(now + 1, STEPS.length)} of ${STEPS.length}`}
    >
      {STEPS.map((s, i) => (
        <li
          key={s.kind}
          className={`bcg-step ${i === now ? "is-now" : ""} ${i < now ? "is-done" : ""}`}
          aria-current={i === now ? "step" : undefined}
        >
          <span className="bcg-step-pic">
            <PieceArt body={body} colour={colour} kind={s.kind} />
          </span>
          {s.kind === "wheel" && (
            <span className="bcg-step-dots" aria-hidden="true">
              {[0, 1, 2, 3].map((k) => (
                <span key={k} className={`bcg-step-dot ${k < wheelsOn ? "is-on" : ""}`} />
              ))}
            </span>
          )}
          {i < now && (
            <svg viewBox="0 0 24 24" className="bcg-step-tick" aria-hidden="true">
              <circle cx="12" cy="12" r="11" fill="#3DAB72" />
              <path
                d="M6.5 12.5 L10.5 16.5 L17.5 8.5"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </li>
      ))}
    </ol>
  );
});
