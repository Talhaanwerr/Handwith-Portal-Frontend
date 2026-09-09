"use client";

import { useImperativeHandle, type RefObject } from "react";
import type { PaintActivity } from "@games/color-paint/constants/activities";
import type { PaintColor } from "@games/color-paint/constants/colors";
import { usePaintEngine } from "@games/color-paint/hooks/usePaintEngine";
import { ObjectOutline } from "@games/color-paint/components/ObjectOutline";

/** What the level can ask the easel to do. */
export interface PaintCanvasHandle {
  clear: () => void;
}

interface PaintCanvasProps {
  activity: PaintActivity;
  /** The chosen crayon; null until the child has picked one. */
  color: PaintColor | null;
  onMainComplete: () => void;
  /** Lets the level's "Start over" button reach the engine's clear(). */
  handleRef: RefObject<PaintCanvasHandle | null>;
}

/**
 * The easel: a white card with the outline drawn on it and a canvas beneath
 * the drawing that the child paints into.
 *
 * Layering matters. The canvas sits UNDER the outline, so paint fills the
 * shapes and the ink line stays on top of it — the way a real colouring book
 * works. The engine keeps every stroke inside the part it began in, so the
 * card never shows paint where it should not be, however wild the scribble.
 */
export function PaintCanvas({ activity, color, onMainComplete, handleRef }: PaintCanvasProps) {
  const { canvasRef, onPointerDown, onPointerMove, onPointerUp, clear } = usePaintEngine({
    regions: activity.regions,
    color: color?.fill ?? null,
    onMainComplete,
  });

  useImperativeHandle(handleRef, () => ({ clear }), [clear]);

  return (
    <div className={`cp-frame ${color ? "is-ready" : ""}`}>
      <canvas
        ref={canvasRef}
        className={`cp-canvas ${color ? "" : "is-idle"}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="img"
        aria-label={
          color
            ? `Painting the ${activity.label.toLowerCase()} with the ${color.label} crayon`
            : `An outline of ${activity.label.toLowerCase()}, waiting to be painted`
        }
      />
      <ObjectOutline activity={activity} className="cp-outline" />
    </div>
  );
}
