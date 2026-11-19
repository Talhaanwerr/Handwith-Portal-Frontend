"use client";

import { useEffect, useState, type CSSProperties, type RefObject } from "react";
import { GuideBar } from "@shared/components/game/GuideBar";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { clipText } from "@shared/audio/voice";

/**
 * The guide every show on this stage shares — Phonics Game Show, Sound Show
 * and Odd Sound Out: the thin bar at the top centre (how far the show has
 * got, and the line being said right now) and the teaching hand that taps
 * the right answer for a child who is waiting.
 */

/** The words of a spoken line made of these clips, with the voice's pause
 *  between each part: "s … sun … Great job!". */
export function lineText(ids: readonly string[]): string {
  return ids
    .map((id) => clipText(id))
    .filter(Boolean)
    .join(" … ");
}

/**
 * The guide bar: one little key per question (done, the one being played,
 * still to come — the current one turns green as soon as it is answered) and
 * the line being said. The keys sit in two short rows, so fifteen of them
 * take no more room than a few of the shared bar's stars.
 */
export function ShowGuideBar({
  index,
  total,
  solved,
  text,
}: {
  /** 0-based question being played. */
  index: number;
  total: number;
  /** The question has just been answered right. */
  solved: boolean;
  text: string;
}) {
  const done = index + (solved ? 1 : 0);
  return (
    <GuideBar text={text}>
      <span
        className="pgs-progress"
        style={{ "--pgs-cols": Math.ceil(total / 2) } as CSSProperties}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-label={`${done} of ${total} done`}
      >
        {Array.from({ length: total }, (_, slot) => (
          <span
            key={slot}
            className={`pgs-progress-seg ${slot < done ? "pgs-progress-seg--done" : ""} ${
              slot === index && !solved ? "pgs-progress-seg--now" : ""
            }`}
          />
        ))}
      </span>
    </GuideBar>
  );
}

/** A point in the screen's own coordinates. */
interface Point {
  x: number;
  y: number;
}

/**
 * The teaching hand, tapping `target` while `show` is true. The tap point is
 * measured in a frame once the hand is needed (never during render) and again
 * whenever the screen changes size, against `root` — the screen the hand is
 * mounted in. `resetKey` is the idle clock's: a point measured for an older
 * wait (the last question's answer) is never shown.
 */
export function ShowHand({
  show,
  resetKey,
  root,
  target,
}: {
  show: boolean;
  resetKey: string;
  root: RefObject<HTMLElement | null>;
  target: RefObject<HTMLElement | null>;
}) {
  const [at, setAt] = useState<{ point: Point; key: string } | null>(null);

  useEffect(() => {
    if (!show) return;
    const measure = () => {
      const r = root.current?.getBoundingClientRect();
      const t = target.current?.getBoundingClientRect();
      setAt(
        r && t
          ? {
              point: { x: t.left + t.width / 2 - r.left, y: t.top + t.height / 2 - r.top },
              key: resetKey,
            }
          : null
      );
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [show, resetKey, root, target]);

  if (!show || !at || at.key !== resetKey) return null;
  const { x, y } = at.point;
  return <TeachingHand fx={x} fy={y} tx={x} ty={y} />;
}
