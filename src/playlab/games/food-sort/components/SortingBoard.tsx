"use client";

import { Fragment, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  homeOf,
  itemsOf,
  rowColourOf,
  tableIntro,
  type Activity,
  type Bin,
  type Item,
} from "@games/food-sort/constants/activities";
import { FoodArt } from "@games/food-sort/components/FoodArt";
import { Helper } from "@games/food-sort/components/Helper";
import { Plate } from "@games/counting-numbers/components/CountingArt";
import { Picture } from "@games/blend-read/components/PictureArt";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { ProgressBar } from "@shared/components/ui/ProgressBar";
import { Burst } from "@shared/components/game/Burst";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { FigureBreak } from "@shared/components/game/FigureBreak";
import { useDragDrop, type DropInfo } from "@shared/hooks/useDragDrop";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { registerTarget, toRootPoint } from "@shared/utils/pointer";
import { cheerFor } from "@shared/audio/cheers";
import { playClip, sayAfter } from "@shared/audio/voice";
import { wordClip } from "@shared/audio/wordClips";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import {
  playCelebrationSound,
  playClickSound,
  playIncorrectSound,
  playPickUpSound,
  playSnapSound,
} from "@shared/audio/sfx";

/** The whole place is the target — a preschooler aims at a plate, not at
 *  the silhouette inside it. */
const DROP_SLOP_PX = 28;
/** Nothing placed for this long and the hand shows the next move. */
const IDLE_HINT_MS = 7000;
/** How long the dimmed celebration holds the finished board. */
const BREAK_MS = 2400;
/** The chef's taste of an apple, before the celebration. */
const EAT_MS = 1700;

/** "Not this one": the place shakes its head, run by the browser on the
 *  element itself — no state, no re-render. */
const SHAKE: Keyframe[] = [
  { transform: "translateX(0)" },
  { transform: "translateX(-8px)" },
  { transform: "translateX(8px)" },
  { transform: "translateX(-5px)" },
  { transform: "translateX(5px)" },
  { transform: "translateX(0)" },
];

/** The reference's confetti: little squares in six colours. */
const CONFETTI_COLORS = ["#E0413F", "#3F6FBF", "#F6C544", "#5FAF3A", "#F28AB2", "#F28A2E"] as const;

interface SortingBoardProps {
  activity: Activity;
  index: number;
  total: number;
  /** The first board: the hand shows the first move at once. */
  first: boolean;
  onNext: () => void;
  onBack: () => void;
  onExitPortal: () => void;
}

interface Hand {
  fx: number;
  fy: number;
  tx: number;
  ty: number;
}

/**
 * ONE ACTIVITY.
 *
 *   drag a thing onto the place with its silhouette → it snaps into that
 *     silhouette, confetti puffs from it, the helper hops, its word is said
 *   drop it on the wrong place → a soft "no", the place shakes, the thing
 *     goes home — nothing is counted
 *   drop it on open ground → nothing at all; that is a child changing mind
 *   the last one in → the board dims, the chef cheers ON TOP of the finished
 *     board (it stays visible underneath), then Next
 *
 * The hand is the only instruction: it shows the first move straight away on
 * the first board, and comes back to show the next move whenever the child
 * has been still for a while.
 */
export function SortingBoard({
  activity,
  index,
  total,
  first,
  onNext,
  onBack,
  onExitPortal,
}: SortingBoardProps) {
  const [filled, setFilled] = useState<ReadonlySet<string>>(new Set());
  const [cheer, setCheer] = useState(false);

  const [puffAt, setPuffAt] = useState<string | null>(null);
  const [eating, setEating] = useState(false);
  const [breakOn, setBreakOn] = useState(false);
  const [finished, setFinished] = useState(false);
  const [hand, setHand] = useState<Hand | null>(null);
  const [touched, setTouched] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const binRefs = useRef<Map<string, HTMLElement>>(new Map());
  const looseRefs = useRef<Map<string, HTMLElement>>(new Map());
  const schedule = useScheduler();
  useSayOnEnter(tableIntro(activity, index));

  const items = useMemo(() => itemsOf(activity), [activity]);
  const loose = useMemo(
    () => activity.loose.map((id) => items.get(id)).filter((i): i is Item => Boolean(i)),
    [activity, items]
  );
  const complete = filled.size >= loose.length;

  const confettiPieces = useMemo<readonly ReactNode[]>(
    () =>
      CONFETTI_COLORS.map((c) => (
        <span key={c} className="sf-confetti" style={cssVars({ "--pl-color": c })} />
      )),
    []
  );

  /* ── Dropping ─────────────────────────────────────────────────────────── */

  const drop = useCallback(
    (item: Item, target: string | null, info: DropInfo) => {
      if (!info.moved || !target || complete) return;
      const home = homeOf(activity, item.id);
      if (!home || target !== home.id) {
        playIncorrectSound();
        void playClip("instr-try-again");
        if (target)
          binRefs.current.get(target)?.animate(SHAKE, { duration: 400, easing: "ease-in-out" });
        return;
      }

      playSnapSound();
      const said = wordClip(item.word);
      if (said) void playClip(said);
      const next = new Set(filled).add(item.id);
      setFilled(next);
      setPuffAt(item.id);
      setHand(null);
      setCheer(true);
      schedule(() => setCheer(false), 700);

      if (next.size >= loose.length) {
        // the last one: the chef's taste on the apple table, then the cheer on
        // top of the finished board, then Next
        const eat = activity.id === "apples" ? EAT_MS : 0;
        if (eat) schedule(() => setEating(true), 450);
        schedule(() => {
          setEating(false);
          playCelebrationSound();
          void sayAfter(cheerFor(activity.id));
          setBreakOn(true);
        }, 450 + eat);
        schedule(
          () => {
            setBreakOn(false);
            setFinished(true);
          },
          450 + eat + BREAK_MS
        );
      }
    },
    [activity, filled, loose.length, complete, schedule]
  );

  const { dragging, over, start, ghostRef } = useDragDrop<Item, string>({
    root: rootRef,
    targets: binRefs,
    slopPx: DROP_SLOP_PX,
    onDrop: drop,
  });

  const startDrag = useCallback(
    (e: React.PointerEvent<HTMLElement>, item: Item) => {
      if (complete || !start(e, item)) return;
      setTouched(true);
      setHand(null);
      playPickUpSound();
    },
    [complete, start]
  );

  /* ── The hand ─────────────────────────────────────────────────────────── */

  /** Measure the next move: the first thing still loose, to its place. */
  const showNextMove = useCallback(() => {
    const item = loose.find((i) => !filled.has(i.id));
    if (!item) return;
    const home = homeOf(activity, item.id);
    const from = looseRefs.current.get(item.id);
    const to = home ? binRefs.current.get(home.id) : undefined;
    if (!from || !to) return;
    const centre = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return toRootPoint(rootRef.current, r.left + r.width / 2, r.top + r.height / 2);
    };
    const a = centre(from);
    const b = centre(to);
    setHand({ fx: a.x, fy: a.y, tx: b.x, ty: b.y });
  }, [activity, loose, filled]);

  // re-armed by every placement; at once on a first board nobody has touched
  useEffect(() => {
    if (complete || dragging) return;
    const soon = first && !touched && filled.size === 0;
    const t = setTimeout(
      () => {
        showNextMove();
        // the first demonstration comes with the portal's own recorded line
        if (soon) void playClip("instr-watch-carefully");
      },
      soon ? 900 : IDLE_HINT_MS
    );
    return () => clearTimeout(t);
  }, [complete, dragging, first, touched, filled.size, showNextMove]);

  // a rotated screen moves everything; the hand is measured again
  useEffect(() => {
    if (!hand) return;
    const onResize = () => showNextMove();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [hand, showNextMove]);

  /* ── Drawing ──────────────────────────────────────────────────────────── */

  const sizeClass = (item: Item) => (item.size ? `sf-thing--${item.size}` : "");

  const renderBin = (bin: Bin) => (
    <div
      key={bin.id}
      ref={(el) => registerTarget(binRefs.current, bin.id, el)}
      className={`sf-bin sf-bin--${bin.look} ${over === bin.id ? "sf-bin--lit" : ""}`}
      role="group"
      aria-label={bin.aria}
    >
      {bin.look === "plate" && (
        <span className="sf-plate" aria-hidden="true">
          <Plate />
        </span>
      )}
      <div className="sf-slots">
        {bin.slots.map((slot) => {
          const shown = slot.given || filled.has(slot.item.id);
          return (
            <span
              key={slot.item.id}
              className={`sf-slot sf-thing ${sizeClass(slot.item)} ${shown ? "" : "sf-slot--empty"}`}
            >
              {shown ? (
                <motion.span
                  className="sf-thing-art"
                  initial={slot.given ? false : { scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 320, damping: 16 }}
                >
                  <FoodArt art={slot.item.art} />
                </motion.span>
              ) : (
                // the silhouette: the same drawing, colour taken out
                <span className="sf-thing-art sf-silhouette" aria-hidden="true">
                  <FoodArt art={slot.item.art} />
                </span>
              )}
              {puffAt === slot.item.id && (
                <span className="sf-puff" aria-hidden="true">
                  <Burst
                    pieces={confettiPieces}
                    count={24}
                    reach={[8, 28]}
                    gravity
                    size="clamp(5px, 1.3vmin, 12px)"
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );

  const renderLoose = (item: Item) => {
    const used = filled.has(item.id);
    const colour = activity.layout === "rows" ? rowColourOf(activity, item.id) : null;
    return (
      <div key={item.id} className={`sf-loose-slot ${colour ? `sf-card--${colour}` : ""}`}>
        <button
          type="button"
          ref={(el) => registerTarget(looseRefs.current, item.id, el)}
          className={`sf-loose sf-thing ${sizeClass(item)} ${used ? "sf-loose--used" : ""} ${
            dragging?.id === item.id ? "sf-loose--dragging" : ""
          }`}
          onPointerDown={(e) => startDrag(e, item)}
          disabled={used || complete}
          aria-label={`${item.word} — put it where it belongs`}
        >
          <span className="sf-thing-art">
            <FoodArt art={item.art} />
          </span>
        </button>
      </div>
    );
  };

  const centreHelper = activity.helper === "chef";

  return (
    <div ref={rootRef} className={`sf-play sf-scene--${activity.scene}`}>
      <NavPillButton
        label="Back"
        ariaLabel="Back to the Sorting Food title"
        tone="kitchen"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onBack();
        }}
      />
      <button
        type="button"
        className="sf-leave pl-exit-pill font-rounded font-black"
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
        aria-label="Back to the game portal"
      >
        Back to Games
      </button>

      <div className="sf-topbar">
        <span className="sf-round font-rounded font-black">
          {index + 1} / {total}
        </span>
        <ProgressBar
          value={filled.size / loose.length}
          trackClassName="sf-progress-bar"
          fillClassName="sf-progress-fill"
          ariaLabel={`${filled.size} of ${loose.length} sorted`}
        />
      </div>

      {/* how many places the table has, so a four-row or three-card table
          can size itself down to fit a phone held sideways */}
      <div className={`sf-board sf-board--${activity.layout} sf-board--n${activity.bins.length}`}>
        {activity.layout === "pair" ? (
          <>
            <div className={`sf-bins ${centreHelper ? "sf-bins--helper" : ""}`}>
              {/* the chef stands after the first place, between it and the rest */}
              {activity.bins.map((bin, i) => (
                <Fragment key={bin.id}>
                  {renderBin(bin)}
                  {i === 0 && centreHelper && (
                    <div className="sf-helper-slot">
                      <Helper cheer={cheer || breakOn} eating={eating} />
                    </div>
                  )}
                </Fragment>
              ))}
            </div>
            <div className="sf-tray">{loose.map(renderLoose)}</div>
          </>
        ) : (
          <>
            <div className="sf-rows">{activity.bins.map(renderBin)}</div>
            <div className="sf-bank">{loose.map(renderLoose)}</div>
          </>
        )}
      </div>

      {activity.helper === "chef-corner" && (
        <div className="sf-helper-corner">
          <Helper cheer={cheer || breakOn} />
        </div>
      )}

      {/* the thing under the finger */}
      {dragging && (
        <div ref={ghostRef} className="sf-ghost pl-drag-ghost" aria-hidden="true">
          <span className={`sf-thing sf-thing--carry ${sizeClass(dragging)}`}>
            <span className="sf-thing-art">
              <FoodArt art={dragging.art} />
            </span>
          </span>
        </div>
      )}

      {hand && !dragging && !complete && <TeachingHand {...hand} />}

      <AnimatePresence>
        {breakOn && (
          <FigureBreak key="break" label="The chef is cheering!">
            <span className="sf-chef-big">
              <Picture id="chef" />
            </span>
          </FigureBreak>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {finished && (
          <motion.div
            key="next"
            className="sf-next-wrap"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            <button
              type="button"
              className="sf-next font-rounded font-black"
              onClick={() => {
                playClickSound();
                onNext();
              }}
            >
              <span aria-hidden="true">➜</span> {index + 1 >= total ? "Finish" : "Next"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
