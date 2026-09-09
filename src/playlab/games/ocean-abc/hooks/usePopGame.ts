"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  EXIT_MS,
  LANES,
  MAX_ALIVE,
  MAX_RESCUES,
  SCALES,
  TARGET_EVERY,
  TARGET_GOAL,
  makeRandom,
  rollGroupSize,
  rollSpawnGap,
  isFinished,
  seedFor,
  stepBubbles,
  tapOutcome,
  type Bubble,
  type PopMode,
} from "@games/ocean-abc/constants/pop";

interface PopGameOptions {
  /** The glyph the child is hunting, already cased. */
  target: string;
  /** Decoy glyphs, already cased. */
  decoys: readonly string[];
  /** Canonical letter — seeds the round so a replay deals the same rhythm. */
  letter: string;
  mode: PopMode;
  /** Fires once, when "5 Times" reaches its goal. */
  onGoalReached: () => void;
  /** Correct pop — the view plays the sound and says the letter. */
  onPop: () => void;
  /** Wrong bubble tapped; receives the glyph so it can say that letter. */
  onWrong: (glyph: string) => void;
  /** A parachute was caught. */
  onRescue: () => void;
}

export interface PopGame {
  /** The bubbles to render. Positions are NOT here — see `register`. */
  bubbles: readonly Bubble[];
  /** Correct pops so far — the numerator of "Correct: 2 / 5". */
  correct: number;
  /** The bubble wobbling from a wrong tap, if any. */
  wrongId: number | null;
  /** The bubble that just flashed a rescue, if any. */
  rescuedId: number | null;
  tap: (id: number) => void;
  /** Bind a bubble's element so the frame loop can move it. */
  register: (id: number, el: HTMLElement | null) => void;
}

/**
 * The Bubble Pop round: spawning, motion, and what a tap means.
 *
 * WHY A HOOK. The stage used to be one component holding nine hard-coded
 * bubbles, their CSS phase offsets and their tap handling together. Adding
 * progressive spawning and the parachute rescue to that would have meant
 * timers and lifecycle flags threaded through the render body. Splitting the
 * rules (constants/pop.ts), the loop (here) and the view (PopStage) keeps each
 * small enough to reason about, and makes the lifecycle testable without a DOM.
 *
 * ONE SOURCE OF TRUTH. `simRef` is the simulation; React state is a derived
 * snapshot published only when the RENDER LIST changes — a bubble spawns,
 * changes phase, or leaves. Positions never enter state at all: the frame loop
 * writes them straight onto the bound elements as CSS custom properties. That
 * is what keeps a moving screen at a handful of renders per round instead of
 * sixty a second, and it removes the whole class of bug where a re-render
 * rewinds a bubble to the position it had when state was last written.
 */
export function usePopGame({
  target,
  decoys,
  letter,
  mode,
  onGoalReached,
  onPop,
  onWrong,
  onRescue,
}: PopGameOptions): PopGame {
  const [bubbles, setBubbles] = useState<readonly Bubble[]>([]);
  const [correct, setCorrect] = useState(0);
  const [wrongId, setWrongId] = useState<number | null>(null);
  const [rescuedId, setRescuedId] = useState<number | null>(null);

  const simRef = useRef<Bubble[]>([]);
  const nodesRef = useRef<Map<number, HTMLElement>>(new Map());
  const nextIdRef = useRef(0);
  const spawnedRef = useRef(0);
  const goalReachedRef = useRef(false);
  const randomRef = useRef(makeRandom(seedFor(letter, mode)));
  /** Every pending timeout, so a round that ends mid-flight cleans up. */
  const timersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Callbacks live in a ref so the spawn and frame effects never re-run just
  // because the component re-rendered with fresh closures. Written in an
  // effect rather than during render — a ref is not readable or writable
  // while rendering.
  const handlersRef = useRef({ onGoalReached, onPop, onWrong, onRescue });
  useEffect(() => {
    handlersRef.current = { onGoalReached, onPop, onWrong, onRescue };
  });

  /** Publish the simulation to React. The only thing that re-renders. */
  const publish = useCallback(() => {
    setBubbles(simRef.current.map((b) => ({ ...b })));
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timersRef.current.delete(id);
      fn();
    }, ms);
    timersRef.current.add(id);
  }, []);

  const register = useCallback((id: number, el: HTMLElement | null) => {
    if (el) nodesRef.current.set(id, el);
    else nodesRef.current.delete(id);
  }, []);

  /** Write one bubble's position onto its element. */
  const paint = useCallback((b: Bubble) => {
    const el = nodesRef.current.get(b.id);
    if (!el) return;
    el.style.setProperty("--pl-x", `${(b.x * 100).toFixed(2)}%`);
    el.style.setProperty("--pl-y", `${(b.y * 100).toFixed(2)}%`);
  }, []);

  /* ── Round lifecycle ──────────────────────────────────────────────────── */

  // NO RESET LOGIC, deliberately. OceanLevel keys the Pop stage by letter and
  // case, so every round mounts a brand-new component and therefore a
  // brand-new game — the portal's remount-per-round pattern. Clearing state in
  // an effect instead would mean one render of the previous letter's board
  // before the reset landed, and a whole class of "did I remember to reset
  // that ref?" bugs. All that is left to do is cancel timers on the way out,
  // so nothing from a finished round can fire into the next one.
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  /* ── Spawning ─────────────────────────────────────────────────────────── */

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const random = randomRef.current;

    const release = () => {
      if (cancelled) return;
      // The round is won — stop releasing. The chain simply ends here rather
      // than being cancelled from outside, so the last bubbles already in the
      // water still finish their rise while the celebration plays.
      if (goalReachedRef.current) return;

      const alive = simRef.current.filter((b) => b.phase === "rising" || b.phase === "parachuting");
      const room = MAX_ALIVE - alive.length;

      if (room > 0) {
        const group = Math.min(rollGroupSize(random), room);
        const lanesInUse = new Set(alive.map((b) => b.x));

        for (let n = 0; n < group; n++) {
          // Guarantee a target at least every TARGET_EVERY bubbles, so a child
          // hunting one letter always has something to hunt.
          const due = spawnedRef.current % TARGET_EVERY === TARGET_EVERY - 1;
          const isTarget = due || random() < 0.4;
          const glyph = isTarget
            ? target
            : (decoys[Math.floor(random() * decoys.length)] ?? target);

          // Prefer a lane nothing is currently occupying, so two bubbles never
          // rise as one column.
          const free = LANES.filter((l) => !lanesInUse.has(l));
          const pool = free.length ? free : LANES;
          const x = pool[Math.floor(random() * pool.length)];
          lanesInUse.add(x);

          const id = nextIdRef.current++;
          spawnedRef.current++;
          simRef.current.push({
            id,
            glyph,
            isTarget,
            phase: "rising",
            x,
            y: 0,
            scale: SCALES[id % SCALES.length],
            rescues: 0,
          });
        }
        publish();
      }

      timer = setTimeout(release, rollSpawnGap(random));
    };

    // A short beat before the first release, so the stage is not already busy
    // when the child arrives.
    timer = setTimeout(release, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [target, decoys, letter, mode, publish]);

  /* ── Motion ───────────────────────────────────────────────────────────── */

  /** Is anything actually moving? The frame loop exists to move bubbles, so
   *  with none in flight there is nothing for it to do — during the opening
   *  beat before the first spawn, and again once the goal is reached and the
   *  board has drained. Without this the loop span at 60fps over an empty
   *  array for the whole celebration. */
  const inMotion = bubbles.some((b) => b.phase === "rising" || b.phase === "parachuting");

  useEffect(() => {
    if (!inMotion) return;
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      // Clamped so a backgrounded tab does not resume with one enormous step
      // that teleports every bubble off the top.
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      const before = simRef.current;
      const moved = stepBubbles(before, dt);
      simRef.current = moved;

      let phaseChanged = false;
      for (let i = 0; i < moved.length; i++) {
        paint(moved[i]);
        if (before[i] && before[i].phase !== moved[i].phase) phaseChanged = true;
      }

      // Re-render only when a bubble actually changed phase; plain movement
      // reached the DOM above without React's involvement.
      if (phaseChanged) publish();

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inMotion, paint, publish]);

  // Newly mounted bubbles need their first position before the next frame, or
  // they would flash at the element's default spot for one paint.
  useEffect(() => {
    simRef.current.forEach(paint);
  }, [bubbles, paint]);

  /* ── Retirement ───────────────────────────────────────────────────────── */

  // A finished bubble leaves after its exit beat. A missed one with rescues
  // left is sent back to the sea bed instead of retiring: the mechanic is a
  // second chance, not a punishment.
  const retiringRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    for (const b of bubbles) {
      if (!isFinished(b.phase)) continue;
      if (retiringRef.current.has(b.id)) continue;
      retiringRef.current.add(b.id);

      // Only a MISSED bubble earns another rise. A dismissed one was ruled out
      // by the child on purpose, and a popped one is done.
      const revive = b.phase === "missed" && b.rescues < MAX_RESCUES;
      later(() => {
        retiringRef.current.delete(b.id);
        const found = simRef.current.find((p) => p.id === b.id);
        if (!found) return;
        if (revive) {
          found.phase = "rising";
          found.y = 0;
          found.rescues += 1;
        } else {
          simRef.current = simRef.current.filter((p) => p.id !== b.id);
          nodesRef.current.delete(b.id);
        }
        publish();
      }, EXIT_MS);
    }
  }, [bubbles, later, publish]);

  /* ── Tapping ──────────────────────────────────────────────────────────── */

  const tap = useCallback(
    (id: number) => {
      // Read from the simulation, not from the rendered snapshot: a very fast
      // second tap can arrive before React has published the first one.
      const bubble = simRef.current.find((b) => b.id === id);
      const outcome = tapOutcome(bubble);
      if (outcome === "ignored" || !bubble) return;

      const handlers = handlersRef.current;

      if (outcome === "rescued") {
        // Caught on the way down: it turns back into a bubble and rises again,
        // so the child gets the pop they missed.
        bubble.phase = "rising";
        bubble.rescues += 1;
        setRescuedId(id);
        later(() => setRescuedId(null), 500);
        handlers.onRescue();
        publish();
        return;
      }

      if (outcome === "wrong") {
        // The letter says its own name and LEAVES. It used to wobble and carry
        // on rising, which meant a letter the child had already ruled out came
        // back round as a parachute, and again after that — the water filled
        // up with rejected letters and crowded out the ones still to find.
        // Still not a punishment: nothing is lost, the wobble and the name
        // play exactly as before, the letter just does not come back.
        bubble.phase = "dismissed";
        setWrongId(id);
        later(() => setWrongId(null), 400);
        handlers.onWrong(bubble.glyph);
        publish();
        return;
      }

      bubble.phase = "popped";
      publish();
      handlers.onPop();

      setCorrect((n) => {
        const next = n + 1;
        if (mode === "five" && next >= TARGET_GOAL && !goalReachedRef.current) {
          goalReachedRef.current = true;
          later(() => handlersRef.current.onGoalReached(), 900);
        }
        return next;
      });
    },
    [mode, later, publish]
  );

  return { bubbles, correct, wrongId, rescuedId, tap, register };
}
