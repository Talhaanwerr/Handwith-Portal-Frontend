"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
  type RefObject,
} from "react";
import { useScheduler } from "@shared/hooks/useScheduler";
import { toRootPoint, type RootPoint } from "@shared/utils/pointer";
import { playCorrectSound } from "@shared/audio/sfx";
import { clipText, playClip, sayAfter, stopVoice } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { PieceBurst, RoundCheer } from "@games/jigsaw-fun/components/Cheer";

/**
 * What every round of both games shares: the confetti that flies out of a
 * right answer, the round's cheer, and the clock that moves on. All of it is
 * Jigsaw Fun's celebration kit (`PieceBurst`, `RoundCheer`), so a right answer
 * here feels exactly like a piece clicking in there.
 *
 * The celebrations live in their own little store and their own layer
 * (`NgCheers`): a burst re-renders that layer and nothing else — never the
 * board, the world or the teacher — so its first frame is not kept waiting.
 */

/** How long a burst stays mounted. */
const BURST_MS = 900;
/** From the last right answer to the next round. */
const ROUND_MS = 2800;

/** Say a number now (a right answer, the number asked for) — the recorded
 *  clips `number-1` … `number-5`. */
export function sayNumber(n: number): void {
  void playClip(`number-${n}`);
}

/** The centre of an element, in the stage's own coordinates. */
export function centreIn(root: HTMLElement | null, el: Element | null | undefined): RootPoint {
  if (!el) return { x: 0, y: 0 };
  const r = el.getBoundingClientRect();
  return toRootPoint(root, r.left + r.width / 2, r.top + r.height / 2);
}

interface FxState {
  bursts: readonly { id: number; x: number; y: number }[];
  /** Where the round's star stamps down, once the round is won. */
  stamp: RootPoint | null;
}

/** A tiny external store for one round's celebrations. */
function createFx() {
  let state: FxState = { bursts: [], stamp: null };
  const subs = new Set<() => void>();
  const set = (next: FxState) => {
    state = next;
    subs.forEach((f) => f());
  };
  return {
    get: () => state,
    subscribe: (f: () => void) => {
      subs.add(f);
      return () => {
        subs.delete(f);
      };
    },
    burst: (b: FxState["bursts"][number]) => set({ ...state, bursts: [...state.bursts, b] }),
    unburst: (id: number) => set({ ...state, bursts: state.bursts.filter((b) => b.id !== id) }),
    cheer: (stamp: RootPoint) => set({ ...state, stamp }),
  };
}
type Fx = ReturnType<typeof createFx>;

/** The round's celebration layer — the only thing a burst re-renders. */
const NgCheers = memo(function NgCheers({
  fx,
  cast,
  label,
}: {
  fx: Fx;
  cast: readonly ReactNode[];
  label: string;
}) {
  const { bursts, stamp } = useSyncExternalStore(fx.subscribe, fx.get, fx.get);
  return (
    <>
      {bursts.map((b) => (
        <PieceBurst key={b.id} x={b.x} y={b.y} />
      ))}
      {stamp && <RoundCheer cast={cast} stampX={stamp.x} stampY={stamp.y} label={label} />}
    </>
  );
});

/**
 * The round's celebrations. `burst(el)` throws confetti out of an element the
 * moment it is right; `finish(el)` wins the round — the teacher jumps and says
 * the cheer, confetti falls with the round's own things among it, a star
 * stamps down on `el`, and the next round follows. The burst gets its first
 * frame to itself: the board, the teacher and the cheer follow on the next.
 */
export function useRoundCelebration({
  cheerSeed,
  stageRef,
  cast,
  onDone,
}: {
  /** Picks the round's cheer (`cheerFor`). */
  cheerSeed: number;
  stageRef: RefObject<HTMLDivElement | null>;
  /** What rains in the cheer — the round's own things. Memoise it. */
  cast: readonly ReactNode[];
  onDone: () => void;
}) {
  const schedule = useScheduler();
  const [fx] = useState(createFx);
  const [solved, setSolved] = useState(false);
  const solvedRef = useRef(false);
  const burstId = useRef(0);
  const cheerId = useMemo(() => cheerFor(cheerSeed), [cheerSeed]);

  useEffect(() => () => stopVoice(), []);

  const burst = useCallback(
    (el: Element | null | undefined) => {
      const id = ++burstId.current;
      fx.burst({ id, ...centreIn(stageRef.current, el) });
      schedule(() => fx.unburst(id), BURST_MS);
    },
    [fx, schedule, stageRef]
  );

  const finish = useCallback(
    (stampOn: Element | null | undefined) => {
      if (solvedRef.current) return;
      solvedRef.current = true;
      const root = stageRef.current;
      let stamp: RootPoint = { x: 0, y: 0 };
      if (root && stampOn) {
        const a = root.getBoundingClientRect();
        const r = stampOn.getBoundingClientRect();
        stamp = { x: r.right - a.left - r.width * 0.06, y: r.top - a.top + r.height * 0.08 };
      }
      requestAnimationFrame(() =>
        schedule(() => {
          setSolved(true);
          fx.cheer(stamp);
        }, 0)
      );
      schedule(() => {
        playCorrectSound();
        void sayAfter(cheerId);
      }, 350);
      schedule(onDone, ROUND_MS);
    },
    [cheerId, fx, onDone, schedule, stageRef]
  );

  /** The teacher's line: the round's prompt, then the cheer once it is won. */
  const say = (prompt: string) => (solved ? clipText(cheerId) : prompt);

  const overlay = <NgCheers fx={fx} cast={cast} label={clipText(cheerId)} />;

  /** True from the winning move on (before the board has re-rendered). */
  const isSolved = useCallback(() => solvedRef.current, []);

  return { solved, isSolved, burst, finish, say, overlay };
}
