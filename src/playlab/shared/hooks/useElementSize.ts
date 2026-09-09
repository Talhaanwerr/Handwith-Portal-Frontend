"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export interface ElementSize {
  w: number;
  h: number;
}

/**
 * Measures a rendered element and returns its pixel size.
 *
 * Every full-screen celebration in the portal sizes its confetti canvas from
 * the ACTUAL rendered root rather than window.innerWidth/innerHeight. That is
 * not a preference: each game screen renders inside a transformed Framer
 * Motion ancestor (PAGE_TRANSITION animates scale), and position:fixed plus
 * viewport dimensions break inside a transformed parent — the symptom is
 * confetti bunching to one side of the screen. Measuring the element itself
 * is immune to that, which is why all six screens did it by hand before this
 * hook existed.
 *
 * The 360×640 seed matches the previous per-screen defaults exactly, so the
 * very first frame (before layout is measurable) is unchanged.
 *
 * MEASUREMENT IS CONTINUOUS, via ResizeObserver. It used to be a single
 * measure-on-mount, with an opt-in `trackResize` that nothing ever opted into,
 * and that produced two live bugs: a device rotated mid-round left the
 * celebration canvas at the previous orientation's size (confetti covering
 * only part of a landscape screen), and any stage whose first measurement
 * landed before layout settled kept the 360×640 seed for its whole life. An
 * observer costs nothing on a screen that never resizes and removes the entire
 * class of staleness.
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>(): [
  RefObject<T | null>,
  ElementSize,
] {
  const ref = useRef<T>(null);
  const [size, setSize] = useState<ElementSize>({ w: 360, h: 640 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      // Ignore a zero measurement (element detached or display:none mid-exit
      // animation) — keeping the last good size beats collapsing the canvas.
      if (w === 0 || h === 0) return;
      setSize((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };

    measure();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, size];
}
