"use client";

import { memo, type ReactNode, type Ref } from "react";
import { motion } from "framer-motion";
import { BasketArt, PegArt, SockArt } from "@games/sock-case/components/SockArt";
import type { Sock } from "@games/sock-case/constants/rounds";

/**
 * The pieces both Sock Case boards are built from: a length of washing line
 * between two wall hooks, a sock hanging on it from a peg, an empty peg
 * waiting for a sock, and the laundry basket.
 *
 * A line is a row of equal slots, each drawing its own piece of rope, so two
 * rows side by side read as one line (landscape) and the same two rows
 * stacked read as two lines (portrait) — the CSS decides, nothing measures.
 */

/** A length of washing line holding `children` (its slots). `ends` says which
 *  ends have a wall hook. */
export function LineRow({
  ends = "both",
  lineRef,
  children,
}: {
  ends?: "both" | "left" | "right";
  lineRef?: Ref<HTMLDivElement>;
  children: ReactNode;
}) {
  return (
    <div ref={lineRef} className={`skc-line skc-line--${ends}`}>
      <span className="skc-rope" aria-hidden="true" />
      <span className="skc-hook skc-hook--l" aria-hidden="true" />
      <span className="skc-hook skc-hook--r" aria-hidden="true" />
      <div className="skc-slots">{children}</div>
    </div>
  );
}

/** The happy swing of a pair, about its peg. A tween: more than two keyframes. */
const SWING = { rotate: [0, 9, -7, 4, -2, 0] };
const STILL = { rotate: 0 };

/** A sock hanging from its peg; `swing` changes to make it swing once. */
export const HangingSock = memo(function HangingSock({
  sock,
  swing,
}: {
  sock: Sock;
  /** Any new value starts one swing; 0 hangs still. */
  swing: number;
}) {
  return (
    <>
      <motion.span
        key={swing}
        className="skc-hang"
        animate={swing ? SWING : STILL}
        transition={{ duration: 1.3, ease: "easeInOut" }}
      >
        <SockArt sock={sock} />
      </motion.span>
      <span className="skc-peg" aria-hidden="true">
        <PegArt />
      </span>
    </>
  );
});

/** The laundry basket behind a row of socks (`children`). */
export function Basket({ children, small = false }: { children?: ReactNode; small?: boolean }) {
  return (
    <div className={`skc-basket ${small ? "skc-basket--small" : ""}`}>
      <span className="skc-basket-art" aria-hidden="true">
        <BasketArt />
      </span>
      <div className="skc-basket-row">{children}</div>
    </div>
  );
}
