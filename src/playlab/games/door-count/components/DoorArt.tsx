"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { DoorPaint, ItemTheme } from "@games/door-count/constants/levels";
import { Ripple } from "@shared/components/game/Ripple";
import { unit } from "@shared/utils/hash";
import { cssVars } from "@shared/styles/cssVars";

/**
 * Everything this game draws: the doors, the things behind them, the keys
 * they earn, and the big double door at the end of a corridor.
 *
 * The door is the whole game, so it is built properly: an architrave, a dark
 * doorway behind it, and a leaf that swings on its hinge. The leaf is the
 * only moving part — Framer turns it on its `transform`, the hinge comes
 * from `transform-origin` in CSS, and the room behind it never moves.
 */

/* ── The things ───────────────────────────────────────────────────────────── */

const Apple = () => (
  <svg viewBox="0 0 60 60" className="dc-art" aria-hidden="true">
    <path
      d="M30 15 Q31 7 36 5"
      stroke="#7A4A22"
      strokeWidth="3.2"
      strokeLinecap="round"
      fill="none"
    />
    <path d="M32 12 Q44 5 46 13 Q38 17 32 12 Z" fill="#5FAF3A" />
    <path
      d="M30 18 Q16 9 9 23 Q4 37 14 49 Q22 58 30 53 Q38 58 46 49 Q56 37 51 23 Q44 9 30 18 Z"
      fill="#E0413F"
    />
    <path d="M30 53 Q40 57 46 49 Q52 41 51 31 Q48 45 38 51 Z" fill="#C22F33" opacity="0.55" />
    <path
      d="M18 25 Q13 31 15 41"
      stroke="#FF9B98"
      strokeWidth="3.4"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="21" cy="21" r="2.2" fill="#FFC9C7" />
  </svg>
);

const Book = () => (
  <svg viewBox="0 0 60 60" className="dc-art" aria-hidden="true">
    <path d="M8 14 L30 10 L30 50 L8 46 Z" fill="#3F6FBF" />
    <path d="M52 14 L30 10 L30 50 L52 46 Z" fill="#5B8AD6" />
    <path d="M8 14 L30 10 L30 16 L8 20 Z" fill="#5B8AD6" opacity="0.7" />
    <path d="M30 10 L52 14 L52 20 L30 16 Z" fill="#7FA8E8" opacity="0.7" />
    <path
      d="M13 22 L27 19 M13 28 L27 25 M13 34 L27 31"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      opacity="0.6"
      strokeLinecap="round"
    />
    <path
      d="M33 19 L47 22 M33 25 L47 28 M33 31 L47 34"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      opacity="0.6"
      strokeLinecap="round"
    />
    <path d="M30 10 L30 50" stroke="#2B4E8A" strokeWidth="2.4" />
  </svg>
);

const Ball = () => (
  <svg viewBox="0 0 60 60" className="dc-art" aria-hidden="true">
    <circle cx="30" cy="30" r="24" fill="#F0A32E" />
    <path d="M30 6 A24 24 0 0 1 30 54 A16 30 0 0 0 30 6 Z" fill="#E8871A" opacity="0.5" />
    <path d="M6 30 H54 M30 6 V54" stroke="#8A4A10" strokeWidth="2.4" />
    <path
      d="M12 16 Q30 26 48 16 M12 44 Q30 34 48 44"
      stroke="#8A4A10"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="21" cy="19" r="3.2" fill="#FFD9A0" opacity="0.85" />
  </svg>
);

const Pencil = () => (
  <svg viewBox="0 0 60 60" className="dc-art" aria-hidden="true">
    <path d="M16 50 L10 56 L12 47 Z" fill="#3A3A3A" />
    <path d="M12 47 L16 50 L22 42 L17 38 Z" fill="#F2D8A8" />
    <path d="M17 38 L22 42 L46 12 L41 8 Z" fill="#F6C544" />
    <path d="M19.5 40 L44 10" stroke="#E0A81A" strokeWidth="2" />
    <path d="M41 8 L46 12 L50 7 L45 3 Z" fill="#F28AB2" />
    <path d="M39 10 L44 14" stroke="#C9C9C9" strokeWidth="3" />
  </svg>
);

const Star = () => (
  <svg viewBox="0 0 60 60" className="dc-art" aria-hidden="true">
    <path
      d="M30 5 L37.2 22.1 L55.7 23.5 L41.6 35.5 L46 53.5 L30 43.8 L14 53.5 L18.4 35.5 L4.3 23.5 L22.8 22.1 Z"
      fill="#F6C544"
    />
    <path
      d="M30 13 L35 25 L48 26 L38 34.5 L41 47 L30 40.5 L19 47 L22 34.5 L12 26 L25 25 Z"
      fill="#FBDC7A"
    />
    <circle cx="24" cy="24" r="2.6" fill="#FFF3C4" />
  </svg>
);

const PETALS = [0, 72, 144, 216, 288] as const;

const Flower = () => (
  <svg viewBox="0 0 60 60" className="dc-art" aria-hidden="true">
    <path d="M30 38 L30 56" stroke="#5FAF3A" strokeWidth="4" strokeLinecap="round" />
    <path d="M30 48 Q40 42 44 48 Q36 52 30 48 Z" fill="#5FAF3A" />
    {PETALS.map((deg) => (
      <ellipse
        key={deg}
        cx="30"
        cy="13"
        rx="8"
        ry="11"
        fill="#E06AA8"
        transform={`rotate(${deg} 30 27)`}
      />
    ))}
    {PETALS.map((deg) => (
      <ellipse
        key={deg}
        cx="30"
        cy="15"
        rx="4"
        ry="6"
        fill="#F7A6CE"
        opacity="0.9"
        transform={`rotate(${deg} 30 27)`}
      />
    ))}
    <circle cx="30" cy="27" r="7" fill="#F6C544" />
    <circle cx="28" cy="25" r="2.2" fill="#FBE59A" />
  </svg>
);

const ITEM_ART: Record<ItemTheme, () => React.ReactElement> = {
  apple: Apple,
  book: Book,
  ball: Ball,
  pencil: Pencil,
  star: Star,
  flower: Flower,
};

/** One countable thing. */
export function Item({ theme }: { theme: ItemTheme }) {
  const Art = ITEM_ART[theme];
  return <Art />;
}

/* ── The door ─────────────────────────────────────────────────────────────── */

interface DoorProps {
  /**
   * What the plate above the door says — and a door in the CORRIDOR says
   * nothing at all. A three-year-old is being asked to look at the apples,
   * and a number hanging over them is another number in a game about
   * numbers: the one thing in the room that could be mistaken for the
   * answer. Only the home screen's doors are labelled, with the name of the
   * module they open.
   */
  label?: ReactNode;
  /** How many things are inside. */
  count: number;
  paint: DoorPaint;
  theme: ItemTheme;
  /** Shown in the doorway INSTEAD of the things, for a door that holds
   *  something other than a count (the home screen's module doors). */
  inside?: ReactNode;
  /** This door was the answer, and the child just found it. */
  won?: boolean;
  /** The child picked this door and it was not the one: it rattles. */
  rattle?: boolean;
  /** Seconds to wait before arriving, so a row lands one door at a time. */
  delay?: number;
}

/** A door that was picked in error rattles in its frame, the way a locked
 *  one does when you try the handle. */
const RATTLE = { x: [0, -5, 5, -4, 4, -2, 0], rotate: [0, -0.8, 0.8, -0.5, 0.5, 0] };
const STILL = { x: 0, rotate: 0 };

/**
 * THE REVEAL — one animation for every countable thing there is.
 *
 * As the leaf swings back, what is inside drops out of the dark at the top
 * of the room, turns a little, and settles with a bounce, ONE AT A TIME. The
 * stagger is the point: a child's eye is pulled to each thing in turn, which
 * is counting them without being told to. An apple, a book, a ball and a
 * flower all arrive exactly the same way, so the animation never becomes a
 * clue about which thing it is — only about how many.
 */
const REVEAL = {
  initial: { y: "-180%", rotate: -25, scale: 0.4, opacity: 0 },
  animate: { y: "0%", rotate: 0, scale: 1, opacity: 1 },
};
/** Seconds after the door starts opening before the first thing drops. */
const REVEAL_AFTER = 0.45;
/** Seconds between one thing and the next. */
const REVEAL_STAGGER = 0.1;

/**
 * One door in the corridor, standing open on whatever is
 * inside, laid out in a grid a child can count — a single column up to three,
 * two columns above that, so nothing ever turns into a crowd.
 *
 * EVERY DOOR IN THIS GAME IS OPEN. Both questions are about what the child
 * can see, so the leaf's only job is to swing wide as the door arrives, which
 * is why it animates from shut to open rather than being told which it is.
 */
export function Door({ label, count, paint, theme, inside, won, rattle, delay = 0 }: DoorProps) {
  return (
    <motion.div
      className="dc-door"
      data-won={won ? "yes" : undefined}
      // an open door lays a wedge of light on the floor (stylesheet)
      data-open="yes"
      style={cssVars({
        "--dc-leaf": paint.leaf,
        "--dc-panel": paint.panel,
        "--dc-frame": paint.frame,
      })}
      animate={rattle ? RATTLE : STILL}
      transition={rattle ? { duration: 0.45 } : { duration: 0.2 }}
    >
      {/* a named door's plate drops onto its hook as the door arrives */}
      {label !== undefined && (
        <motion.span
          className="dc-door-plate font-rounded font-black"
          initial={{ rotateX: -95, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          transition={{ delay: delay + 0.18, type: "spring", stiffness: 260, damping: 14 }}
        >
          {label}
        </motion.span>
      )}

      <div className="dc-door-frame">
        <div className="dc-door-room">
          {inside ??
            (count > 0 && (
              <div className="dc-door-items" data-n={count}>
                {Array.from({ length: count }, (_, i) => (
                  <motion.span
                    key={i}
                    className="dc-door-item"
                    {...REVEAL}
                    transition={{
                      delay: delay + REVEAL_AFTER + i * REVEAL_STAGGER,
                      type: "spring",
                      stiffness: 260,
                      damping: 14,
                    }}
                  >
                    <Item theme={theme} />
                  </motion.span>
                ))}
              </div>
            ))}
        </div>

        {/* the leaf swings wide as the door arrives */}
        <motion.div
          className="dc-door-leaf"
          initial={{ rotateY: 0 }}
          animate={{ rotateY: -78 }}
          transition={{ delay: delay + 0.12, duration: 0.55, ease: [0.3, 0.7, 0.2, 1] }}
        >
          <DoorLeaf />
        </motion.div>

        {/* the answer sends a shockwave out of the doorway */}
        {won && (
          <div className="dc-shock" aria-hidden="true">
            <Ripple count={2} gap={0.16} size="60%" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
/** The leaf itself: two sunken panels, a brass knob and its plate. The
 *  colours come from the round's paint through CSS variables, so whatever
 *  mounts it decides the paint — including the Library card, which shows
 *  this exact door. */
export function DoorLeaf() {
  return (
    <svg viewBox="0 0 100 200" className="dc-leaf" preserveAspectRatio="none" aria-hidden="true">
      <rect x="0" y="0" width="100" height="200" rx="3" className="dc-leaf-body" />
      <rect x="12" y="14" width="76" height="84" rx="3" className="dc-leaf-panel" />
      <rect x="12" y="112" width="76" height="74" rx="3" className="dc-leaf-panel" />
      <rect x="16" y="18" width="68" height="76" rx="2" className="dc-leaf-inlay" />
      <rect x="16" y="116" width="68" height="66" rx="2" className="dc-leaf-inlay" />
      {/* the light down the hinge edge, and the shadow down the opening edge */}
      <rect x="0" y="0" width="6" height="200" className="dc-leaf-lit" />
      <rect x="92" y="0" width="8" height="200" className="dc-leaf-shade" />
      <circle cx="84" cy="105" r="5.5" className="dc-leaf-knob" />
      <circle cx="82.5" cy="103.5" r="2" className="dc-leaf-knob-shine" />
    </svg>
  );
}

/* ── The keys, and the door they open ─────────────────────────────────────── */

/** A brass key — one per door solved. */
export function Key() {
  return (
    <svg viewBox="0 0 40 100" className="dc-art" aria-hidden="true">
      <circle cx="20" cy="18" r="13" fill="#E8B33D" />
      <circle cx="20" cy="18" r="6" fill="#8A6410" />
      <circle cx="16" cy="13" r="3" fill="#FBE09A" opacity="0.9" />
      <rect x="16" y="29" width="8" height="56" rx="2" fill="#E8B33D" />
      <rect x="16" y="29" width="3" height="56" fill="#FBE09A" opacity="0.7" />
      <rect x="24" y="62" width="10" height="7" rx="1.5" fill="#E8B33D" />
      <rect x="24" y="75" width="8" height="7" rx="1.5" fill="#E8B33D" />
    </svg>
  );
}

/** The steel door of the vault, with its wheel — what swings open to take a
 *  key and clangs shut behind it. */
export function VaultDoor() {
  return (
    <svg viewBox="0 0 100 100" className="dc-art" aria-hidden="true">
      <rect x="0" y="0" width="100" height="100" rx="6" fill="#8C97A6" />
      <rect x="4" y="4" width="92" height="92" rx="4" fill="#A8B3C2" />
      <rect x="9" y="9" width="82" height="82" rx="3" fill="#939FAF" />
      {/* the light catching the top-left edge */}
      <path d="M4 4 L96 4 L90 10 L10 10 Z" fill="#C7D2DE" opacity="0.75" />
      <path d="M4 4 L4 96 L10 90 L10 10 Z" fill="#C7D2DE" opacity="0.55" />
      {/* the wheel */}
      <circle cx="50" cy="50" r="26" fill="#7C8796" />
      <circle cx="50" cy="50" r="21" fill="#B4BFCC" />
      <circle cx="50" cy="50" r="8" fill="#7C8796" />
      <g stroke="#6B7583" strokeWidth="7" strokeLinecap="round">
        <path d="M50 26 L50 40 M50 60 L50 74 M26 50 L40 50 M60 50 L74 50" />
      </g>
      <g stroke="#D6DFE9" strokeWidth="3" strokeLinecap="round">
        <path d="M50 27 L50 39 M27 50 L39 50" />
      </g>
      {/* bolts down the hinge side */}
      <circle cx="15" cy="22" r="3.4" fill="#6B7583" />
      <circle cx="15" cy="50" r="3.4" fill="#6B7583" />
      <circle cx="15" cy="78" r="3.4" fill="#6B7583" />
    </svg>
  );
}

/**
 * The double door at the end of a corridor. Both leaves swing out and the
 * light from the next corridor comes through — the reward for a full board.
 */
export function ExitDoor({ open }: { open: boolean }) {
  return (
    <div className="dc-exit" data-open={open ? "yes" : undefined}>
      <div className="dc-exit-light" />
      {([-1, 1] as const).map((side) => (
        <motion.div
          key={side}
          className={side === -1 ? "dc-exit-leaf dc-exit-leaf--l" : "dc-exit-leaf dc-exit-leaf--r"}
          animate={{ rotateY: open ? side * 72 : 0 }}
          transition={{ duration: 0.9, ease: [0.3, 0.7, 0.2, 1] }}
        >
          <svg
            viewBox="0 0 100 200"
            className="dc-leaf"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <rect x="0" y="0" width="100" height="200" className="dc-exit-body" />
            <rect x="10" y="16" width="80" height="96" rx="4" className="dc-exit-window" />
            <rect x="10" y="126" width="80" height="58" rx="4" className="dc-exit-panel" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

/* ── The corridor's own life ──────────────────────────────────────────────── */

/** Dust in the light: nine specks on fixed paths, so the corridor breathes
 *  without anything being random at render. */
const MOTES = Array.from({ length: 9 }, (_, i) => ({
  x: `${(4 + unit(i * 3) * 92).toFixed(1)}%`,
  y: `${(8 + unit(i * 3 + 1) * 56).toFixed(1)}%`,
  scale: Number((0.6 + unit(i * 3 + 2) * 1.2).toFixed(2)),
  drift: Number(((unit(i * 7) - 0.5) * 70).toFixed(1)),
  rise: Number((-18 - unit(i * 5) * 26).toFixed(1)),
  dur: Number((11 + unit(i * 11) * 9).toFixed(1)),
  delay: Number((unit(i * 13) * 7).toFixed(1)),
}));

export function DustMotes() {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {MOTES.map((m, i) => (
        <motion.span
          key={i}
          className="dc-mote pl-at"
          style={cssVars({ "--pl-x": m.x, "--pl-y": m.y, "--pl-scale": m.scale })}
          animate={{ y: [0, m.rise, 0], x: [0, m.drift, 0], opacity: [0, 0.75, 0] }}
          transition={{ duration: m.dur, delay: m.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}
