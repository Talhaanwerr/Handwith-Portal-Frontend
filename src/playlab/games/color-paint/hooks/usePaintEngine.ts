"use client";

import { useCallback, useEffect, useRef, type PointerEvent, type RefObject } from "react";
import { useElementSize } from "@shared/hooks/useElementSize";
import { ART_BOX, type PaintRegion } from "@games/color-paint/constants/activities";

/** Share of the MAIN part that counts as painted. Well under everything: a
 *  four-year-old scribbles the middle and calls it done, and the game should
 *  agree with them. Module-private — the outside world learns about completion
 *  through `onMainComplete`, never by comparing against this. */
const COMPLETE_AT = 0.5;

/** Brush width in art units — thick enough that three or four strokes cover
 *  an apple, which is the whole feel of the thing. */
const BRUSH = 24;

/** Backing store of the offscreen paint layer. It is the source of truth for
 *  what has been painted — the visible canvas only ever shows a copy — so a
 *  resize or a rotation re-blits it instead of losing the child's work. */
const PAINT_PX = 512;

/** Count coverage on every Nth move as well as on lift, so a long scribble
 *  that never lifts still completes without waiting. */
const COUNT_EVERY = 10;

interface PaintEngineOptions {
  /** The object's paintable parts. The FIRST one is the main part, and its
   *  coverage is what finishes the round. */
  regions: readonly PaintRegion[];
  /** What the brush lays down; null while no crayon has been chosen. */
  color: string | null;
  /** Fires once, when the main part is sufficiently covered. */
  onMainComplete: () => void;
}

export interface PaintEngine {
  /** Bind to the visible canvas. Sized by CSS; the engine handles the DPR. */
  canvasRef: RefObject<HTMLCanvasElement | null>;
  onPointerDown: (e: PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (e: PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (e: PointerEvent<HTMLCanvasElement>) => void;
  /** Wipe the picture and start the object again. */
  clear: () => void;
}

/**
 * The painting engine: strokes in, "the main part is coloured" out.
 *
 * NO ANIMATION LOOP. Paint happens when the pointer moves; coverage is counted
 * when the pointer lifts, and every COUNT_EVERY moves so a long unbroken
 * scribble still finishes on time. Nothing runs between touches — the screen
 * only changes when the child changes it.
 *
 * NOTHING HERE IS REACT STATE. Paint lives on a canvas and coverage is a
 * number checked against a threshold; neither is something a view renders, so
 * neither causes a render. The one thing the outside world learns is that the
 * main part is done.
 *
 * FORGIVING BY CONSTRUCTION, twice over. A stroke is clipped to whichever part
 * it STARTED in, so scribbling past the edge of the apple lays no paint
 * outside it AND cannot spill into the leaf next door. The child never has to
 * be neat, and the picture never gets messy.
 *
 * The visible canvas is a viewport onto an offscreen layer. Strokes go to the
 * layer in art units; the canvas blits it. That is what makes the engine
 * object-agnostic (it only ever knows ART_BOX) and lets a resize re-blit
 * rather than wipe.
 */
export function usePaintEngine({
  regions,
  color,
  onMainComplete,
}: PaintEngineOptions): PaintEngine {
  const [canvasRef, size] = useElementSize<HTMLCanvasElement>();

  const paintRef = useRef<HTMLCanvasElement | null>(null);
  /** One Path2D per region, in the same order as `regions`. */
  const pathsRef = useRef<Path2D[]>([]);
  /** Pixel area of the main part, so coverage is a share of it. */
  const mainPixelsRef = useRef(0);
  /** The part this stroke is confined to — chosen on pointer-down. */
  const activeRef = useRef<Path2D | null>(null);
  const lastRef = useRef<{ x: number; y: number } | null>(null);
  const movesRef = useRef(0);
  const doneRef = useRef(false);
  const onMainCompleteRef = useRef(onMainComplete);

  useEffect(() => {
    onMainCompleteRef.current = onMainComplete;
  });

  /* ── The paint layer: rebuilt when the object changes ─────────────────── */

  useEffect(() => {
    const layer = document.createElement("canvas");
    layer.width = PAINT_PX;
    layer.height = PAINT_PX;
    paintRef.current = layer;
    pathsRef.current = regions.map((r) => new Path2D(r.path));

    // How many pixels the MAIN part covers, so completion is a share of the
    // thing being asked about and not of the square around it.
    const scratch = document.createElement("canvas");
    scratch.width = PAINT_PX;
    scratch.height = PAINT_PX;
    const sctx = scratch.getContext("2d", { willReadFrequently: true });
    if (sctx && pathsRef.current[0]) {
      sctx.scale(PAINT_PX / ART_BOX, PAINT_PX / ART_BOX);
      sctx.fill(pathsRef.current[0]);
      mainPixelsRef.current = countPainted(sctx);
    }

    doneRef.current = false;
    movesRef.current = 0;
    lastRef.current = null;
    activeRef.current = null;
  }, [regions]);

  /* ── The visible canvas: a DPR-correct copy of the layer ─────────────── */

  const blit = useCallback(() => {
    const canvas = canvasRef.current;
    const layer = paintRef.current;
    if (!canvas || !layer) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(layer, 0, 0, canvas.width, canvas.height);
  }, [canvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || size.w === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(size.w * dpr);
    canvas.height = Math.round(size.h * dpr);
    blit();
  }, [size, canvasRef, blit]);

  /* ── Strokes ─────────────────────────────────────────────────────────── */

  /** Pointer position in art units. */
  const toArt = useCallback((e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * ART_BOX,
      y: ((e.clientY - rect.top) / rect.height) * ART_BOX,
    };
  }, []);

  /**
   * Which part is under this point? Later regions win, so a small part drawn
   * on top of a big one (the flower's middle) is the one you hit.
   *
   * The point is passed in ART_BOX units, UNSCALED. `isPointInPath` tests in
   * the context's current user space, and this context's transform is identity
   * — `stroke` does its scaling inside a save/restore — so user space is the
   * path's own 0–ART_BOX space. Scaling the point to the layer's pixel size
   * first (which an earlier version did) tested at 0–512 against a path that
   * only spans 0–200, so every hit-test missed, `regionAt` always returned
   * null, and pointer-down bailed before laying a single stroke: the crayon
   * was chosen and the apple simply would not paint.
   */
  const regionAt = useCallback((x: number, y: number): Path2D | null => {
    const ctx = paintRef.current?.getContext("2d");
    if (!ctx) return null;
    for (let i = pathsRef.current.length - 1; i >= 0; i--) {
      if (ctx.isPointInPath(pathsRef.current[i], x, y)) return pathsRef.current[i];
    }
    return null;
  }, []);

  const stroke = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const layer = paintRef.current;
      const clip = activeRef.current;
      if (!layer || !clip || !color) return;
      const ctx = layer.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.save();
      ctx.scale(PAINT_PX / ART_BOX, PAINT_PX / ART_BOX);
      // The clip IS the forgiveness: outside this part, the brush does nothing.
      ctx.clip(clip);
      ctx.strokeStyle = color;
      ctx.lineWidth = BRUSH;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.restore();
      blit();
    },
    [color, blit]
  );

  /** Is the main part covered enough? Fires onMainComplete exactly once. */
  const measure = useCallback(() => {
    if (doneRef.current) return;
    const layer = paintRef.current;
    const ctx = layer?.getContext("2d", { willReadFrequently: true });
    const main = pathsRef.current[0];
    if (!ctx || !main || mainPixelsRef.current === 0) return;
    if (countPainted(ctx, main) / mainPixelsRef.current >= COMPLETE_AT) {
      doneRef.current = true;
      onMainCompleteRef.current();
    }
  }, []);

  const onPointerDown = useCallback(
    (e: PointerEvent<HTMLCanvasElement>) => {
      if (!color) return;
      const p = toArt(e);
      const region = regionAt(p.x, p.y);
      // A touch outside every part does nothing at all — no stroke to start,
      // so a stray tap on the paper can never leave a mark.
      if (!region) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      activeRef.current = region;
      lastRef.current = p;
      // A tap with no movement still leaves a dot — a child's first touch
      // should always do something.
      stroke(p, p);
    },
    [color, toArt, regionAt, stroke]
  );

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLCanvasElement>) => {
      const last = lastRef.current;
      if (!last) return;
      const p = toArt(e);
      stroke(last, p);
      lastRef.current = p;
      movesRef.current += 1;
      if (movesRef.current % COUNT_EVERY === 0) measure();
    },
    [toArt, stroke, measure]
  );

  const onPointerUp = useCallback(
    (e: PointerEvent<HTMLCanvasElement>) => {
      if (!lastRef.current) return;
      lastRef.current = null;
      activeRef.current = null;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      measure();
    },
    [measure]
  );

  const clear = useCallback(() => {
    const layer = paintRef.current;
    const ctx = layer?.getContext("2d");
    if (!ctx || !layer) return;
    ctx.clearRect(0, 0, layer.width, layer.height);
    movesRef.current = 0;
    blit();
    // `doneRef` is deliberately NOT reset. The round has already been won and
    // the Next button already offered; wiping the picture is the child choosing
    // to paint it again, not the game taking the win back.
  }, [blit]);

  return { canvasRef, onPointerDown, onPointerMove, onPointerUp, clear };
}

/** Pixels with ink on them — within `clip` when one is given. */
function countPainted(ctx: CanvasRenderingContext2D, clip?: Path2D): number {
  const { width, height } = ctx.canvas;
  if (!clip) {
    const data = ctx.getImageData(0, 0, width, height).data;
    let n = 0;
    for (let i = 3; i < data.length; i += 4) if (data[i] > 0) n += 1;
    return n;
  }

  // Counting inside one part: copy the layer, keep only what falls inside the
  // path, and count that. `destination-in` does the masking on the GPU rather
  // than testing hundreds of thousands of points one at a time.
  const mask = document.createElement("canvas");
  mask.width = width;
  mask.height = height;
  const mctx = mask.getContext("2d", { willReadFrequently: true });
  if (!mctx) return 0;
  mctx.drawImage(ctx.canvas, 0, 0);
  mctx.globalCompositeOperation = "destination-in";
  mctx.scale(width / ART_BOX, height / ART_BOX);
  mctx.fill(clip);
  return countPainted(mctx);
}
