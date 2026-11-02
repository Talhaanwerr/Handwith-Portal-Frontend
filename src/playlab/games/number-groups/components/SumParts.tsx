"use client";

import { memo, type Ref } from "react";
import { motion } from "framer-motion";
import { fluentSrc } from "@shared/constants/fluent3d";

/**
 * The pieces the toddler maths games share: one picture (`Thing`), the picture
 * sum along the top (`SumStrip`), and one tappable thing that can be counted
 * (`CountPiece`). Styles in number-groups/styles/sum-parts.css (apa-*: they
 * began as Apple Basket's).
 */

/** One Fluent picture (the apple, the cupcake), never dragged, never read out. */
export function Thing({ id }: { id: string }) {
  const src = fluentSrc(id);
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="apa-thing" draggable={false} aria-hidden="true" />
  );
}

/** `n` little pictures side by side — one side of the sum. */
function Group({ id, n }: { id: string; n: number }) {
  return (
    <span className="apa-sum-group">
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className="apa-sum-pic">
          <Thing id={id} />
        </span>
      ))}
    </span>
  );
}

/**
 * THE SUM, IN PICTURES — "🍎🍎 + 🍎 = ?" — with the numbers under each side,
 * so the written sum is always beside the things it counts (an empty `id`
 * shows the numbers alone — Frog Hop counts pads, not things). The answer box
 * shows "?" until the child has counted, then the total, big and green.
 */
export const SumStrip = memo(function SumStrip({
  id,
  a,
  b,
  op,
  result,
}: {
  id: string;
  a: number;
  b: number;
  op: "+" | "−";
  /** The total once counted; null while it is still a question. */
  result: number | null;
}) {
  return (
    <div className="apa-sum" aria-label={`${a} ${op === "+" ? "plus" : "take away"} ${b}`}>
      <span className="apa-sum-side">
        {id && <Group id={id} n={a} />}
        <span className="apa-sum-num font-rounded font-black">{a}</span>
      </span>
      <span className="apa-sum-op font-rounded font-black">{op}</span>
      <span className="apa-sum-side">
        {id && <Group id={id} n={b} />}
        <span className="apa-sum-num font-rounded font-black">{b}</span>
      </span>
      <span className="apa-sum-op font-rounded font-black">=</span>
      <motion.span
        key={result ?? "ask"}
        className={`apa-sum-answer font-rounded font-black ${
          result !== null ? "apa-sum-answer--done" : ""
        }`}
        initial={result !== null ? { scale: 0.5 } : false}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 14 }}
      >
        {result ?? "?"}
      </motion.span>
    </div>
  );
});

/**
 * One thing to tap: glowing and bobbing while it is waiting to be tapped
 * (`live`), and wearing its number once it has been counted (`count`).
 */
export function CountPiece({
  id,
  live,
  count,
  onTap,
  pieceRef,
  label,
}: {
  id: string;
  live: boolean;
  count: number | null;
  onTap: () => void;
  pieceRef?: Ref<HTMLButtonElement>;
  label: string;
}) {
  return (
    <button
      ref={pieceRef}
      type="button"
      className={`apa-piece ${live ? "apa-piece--live" : ""} ${
        count !== null ? "apa-piece--counted" : ""
      }`}
      onClick={onTap}
      disabled={!live}
      aria-label={label}
    >
      <Thing id={id} />
      {count !== null && (
        <motion.span
          className="apa-badge font-rounded font-black"
          initial={{ scale: 0.3, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 360, damping: 15 }}
        >
          {count}
        </motion.span>
      )}
    </button>
  );
}
