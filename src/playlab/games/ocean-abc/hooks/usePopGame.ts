"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  EXIT_MS,
  LANES,
  MAX_ALIVE,
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
  /** A pop — the view plays the sound and says the letter. `caught` is true
   *  when it was a parachute, taken on its way down. */
  onPop: (caught: boolean) => void;
  /** A decoy tapped; receives the glyph so the view can say that letter. */
  onWrong: (glyph: string) => void;
}

export interface PopGame {
  /** The bubbles to render. Positions are NOT here — see `register`. */
  bubbles: readonly Bubble[];
  /** Pops so far — the numerator of "2 / 5". */
  correct: number;
  /** The bubble wobbling from a wrong tap, if any. */
  wrongId: number | null;
  /** The parachute just caught, flashing its catch, if any. */
  caughtId: number | null;
  tap: (id: number) => void;
  /** Bind a bubble's element so the frame loop can move it. */
  register: (id: number, el: HTMLElement | null) => void;
}

/**
 * The Bubble Pop round: spawning, motion, and what a tap means. The rules
 * themselves — what parachutes, what escapes, what a tap does — live in
 * constants/pop.ts; this is the clock and the bookkeeping around them.
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
}: PopGameOptions): PopGame {
  const [bubbles, setBubbles] = useState<readonly Bubble[]>([]);
  const [correct, setCorrect] = useState(0);
  const [wrongId, setWrongId] = useState<number | null>(null);
  const [caughtId, setCaughtId] = useState<number | null>(null);

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
  const handlersRef = useRef({ onGoalReached, onPop, onWrong });
  useEffect(() => {
    handlersRef.current = { onGoalReached, onPop, onWrong };
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
  // brand-new game — the portal's remount-per-round pattern. All that is left
  // to do is cancel timers on the way out, so nothing from a finished round
  // can fire into the next one.
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

      const alive = simRef.current.filter((b) => !isFinished(b.phase));
      const room = MAX_ALIVE - alive.length;

      if (room > 0) {
        const group = Math.min(rollGroupSize(random), room);
        const lanesInUse = new Set(alive.map((b) => b.x));

        Array.from({ length: group }).forEach(() => {
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
          });
        });
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
   *  board has drained. */
  const inMotion = bubbles.some((b) => !isFinished(b.phase));

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
      moved.forEach(paint);

      // Re-render only when a bubble actually changed phase; plain movement
      // reached the DOM above without React's involvement.
      if (moved.some((b, i) => before[i]?.phase !== b.phase)) publish();

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

  // Every ending is final: a finished bubble leaves after its exit beat, and
  // nothing comes back. (Bubbles used to be revived after a miss, which is how
  // the water filled with letters the child had already dealt with.)
  const retiringRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    bubbles
      .filter((b) => isFinished(b.phase) && !retiringRef.current.has(b.id))
      .forEach((b) => {
        retiringRef.current.add(b.id);
        later(() => {
          retiringRef.current.delete(b.id);
          simRef.current = simRef.current.filter((p) => p.id !== b.id);
          nodesRef.current.delete(b.id);
          publish();
        }, EXIT_MS);
      });
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

      if (outcome === "wrong") {
        // A decoy says its own name and LEAVES. Not a punishment: nothing is
        // lost, it just does not come back to crowd out the letters still to
        // find.
        bubble.phase = "dismissed";
        setWrongId(id);
        later(() => setWrongId(null), 400);
        handlers.onWrong(bubble.glyph);
        publish();
        return;
      }

      // A pop — from a rising bubble, or from a parachute caught on its way
      // down: the second chance, taken. Either way the letter is found.
      const caught = bubble.phase === "parachuting";
      bubble.phase = "popped";
      if (caught) {
        setCaughtId(id);
        later(() => setCaughtId(null), 500);
      }
      publish();
      handlers.onPop(caught);

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

  return { bubbles, correct, wrongId, caughtId, tap, register };
}
