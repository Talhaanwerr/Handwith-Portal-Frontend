"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { NavPillButton } from "@shared/components/ui/NavPillButton";
import { FigureBreak } from "@shared/components/game/FigureBreak";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { useDragDrop, type DropInfo } from "@shared/hooks/useDragDrop";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { registerTarget, toRootPoint } from "@shared/utils/pointer";
import { cheerFor } from "@shared/audio/cheers";
import { clipText, playClip, sayAfter, stopVoice } from "@shared/audio/voice";
import { wordClip } from "@shared/audio/wordClips";
import {
  playClickSound,
  playCorrectSound,
  playPickUpSound,
  playSnapSound,
  playStarPop,
  playThudSound,
} from "@shared/audio/sfx";
import { Picture } from "@games/blend-read/components/PictureArt";
import { Teacher } from "@games/door-count/components/Teacher";
import { Playroom } from "@games/jigsaw-fun/components/JfStage";
import { PieceBurst, RoundCheer } from "@games/jigsaw-fun/components/Cheer";
import { ThingArt } from "@games/sort-two-ways/components/ThingArt";
import {
  BOARDS,
  MODULE_IDS,
  bankOrder,
  boardAt,
  landingWord,
  looseOf,
  slotsOf,
  trayOf,
  type ModuleId,
  type Thing,
} from "@games/sort-two-ways/constants/boards";

/** How far past a tray's edge a drop still counts — about 1.3× the tray. */
const DROP_SLOP_PX = 30;
/** A thing gliding into its place, or back to where it came from. */
const GLIDE_MS = 220;
const BURST_MS = 900;
/** From the last thing landing to the cheer. */
const SOLVED_PAUSE_MS = 450;
/** The dim-and-rise between the two sorts (FigureBreak runs 2.3 s); the new
 *  sort is dealt at its middle, while the teacher is up. */
const BREAK_MS = 2300;
const BREAK_SWAP_MS = 1100;
/** The set's big cheer, before the next set (or the star card). */
const SET_CHEER_MS = 3000;
/** "Now sort them another way!" — the teacher's line as the board dims. */
const BREAK_CLIP = "sort2-another-way";
/** "Hmm, that one goes in the other tray." */
const WRONG_CLIP = "sort2-wrong";

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Glide {
  key: number;
  thing: Thing;
  /** Where the finger let go, and how big the carried thing was drawn. */
  from: { x: number; y: number; w: number };
  /** The art box it settles into. */
  to: Box;
  /** Into its tray (true) or back to the bank (false). */
  home: boolean;
}

interface Progress {
  board: number;
  /** Dropped on the right tray (gone from the bank). */
  placed: ReadonlySet<string>;
  /** Finished gliding in (drawn in its slot). */
  landed: ReadonlySet<string>;
}

const NONE: ReadonlySet<string> = new Set();

interface SortRoundProps {
  module: ModuleId;
  /** 0–3 — this component lives for one SET (boards 2s and 2s + 1). */
  board: number;
  onAdvance: () => void;
  onMiss: () => void;
  onHome: () => void;
  onExitPortal: () => void;
}

/**
 * ONE SET, SORTED TWO WAYS.
 *
 *   drag a thing onto the tray where it belongs → it glides into its
 *     silhouette and confetti flies out of it; the word for the rule is said
 *     ("blue", "circle", "big") and the teacher hops
 *   drop it on the other tray → a soft thud and it glides back to the bank
 *     (a miss, for the stars — nothing else happens)
 *   drop it on open ground → it glides back; that is a child changing mind
 *   all four in → the teacher cheers; after the FIRST sort the board dims,
 *     the teacher rises — "Now sort them another way!" — and the same six
 *     things are dealt again under the second rule; after the SECOND sort a
 *     star stamps down and the set's things rain with the confetti.
 */
export function SortRound({
  module,
  board,
  onAdvance,
  onMiss,
  onHome,
  onExitPortal,
}: SortRoundProps) {
  const { set, board: rule, sort } = boardAt(module, board);
  const loose = useMemo(() => looseOf(set, rule), [set, rule]);
  const bank = useMemo(() => bankOrder(set, rule), [set, rule]);
  const trays = useMemo(() => [slotsOf(set, rule, 0), slotsOf(set, rule, 1)] as const, [set, rule]);
  const cheerId = useMemo(
    () => cheerFor(MODULE_IDS.indexOf(module) * BOARDS + board),
    [board, module]
  );

  const [progress, setProgress] = useState<Progress>({ board, placed: NONE, landed: NONE });
  // a new board deals everything out again
  const placed = progress.board === board ? progress.placed : NONE;
  const landed = progress.board === board ? progress.landed : NONE;
  const solved = landed.size >= loose.length;

  const [glides, setGlides] = useState<Glide[]>([]);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);
  const [hop, setHop] = useState(false);
  const [phase, setPhase] = useState<"play" | "cheer" | "break" | "set">("play");
  const [stamp, setStamp] = useState<{ x: number; y: number } | null>(null);
  const [hand, setHand] = useState<{ fx: number; fy: number; tx: number; ty: number } | null>(null);
  const [touched, setTouched] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const ghostArt = useRef<HTMLSpanElement>(null);
  const trayRefs = useRef(new Map<number, HTMLElement>());
  const slotRefs = useRef(new Map<string, HTMLElement>());
  const bankRefs = useRef(new Map<string, HTMLElement>());
  const glideKey = useRef(0);
  const landedRef = useRef<{ board: number; ids: ReadonlySet<string> }>({ board, ids: NONE });
  const schedule = useScheduler();

  useEffect(() => () => stopVoice(), []);
  // each board's prompt as it is dealt (the set's first, then after the
  // break the second), queued behind whatever is still being said
  useSayOnEnter([rule.clip]);

  /* ── Measuring ────────────────────────────────────────────────────────── */

  const boxOf = useCallback((el: Element | null | undefined): Box | null => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const p = toRootPoint(rootRef.current, r.left + r.width / 2, r.top + r.height / 2);
    return { x: p.x, y: p.y, w: r.width, h: r.height };
  }, []);
  const artOf = (el: HTMLElement | undefined) => el?.querySelector(".stw-art") ?? el;

  /* ── Finishing a board ────────────────────────────────────────────────── */

  const finishBoard = useCallback(() => {
    schedule(() => {
      setPhase("cheer");
      playCorrectSound();
      void playClip(cheerId);
      if (sort === 0) {
        // the first rule is done: dim, the teacher rises, the same things
        // come back loose under the second rule
        schedule(() => {
          setPhase("break");
          void sayAfter(BREAK_CLIP);
        }, 1100);
        schedule(() => {
          setGlides([]);
          onAdvance();
        }, 1100 + BREAK_SWAP_MS);
        schedule(() => setPhase("play"), 1100 + BREAK_MS);
      } else {
        const b = boxOf(boardRef.current);
        setStamp(b ? { x: b.x + b.w / 2 - b.h * 0.08, y: b.y - b.h / 2 + b.h * 0.08 } : null);
        setPhase("set");
        schedule(onAdvance, SET_CHEER_MS);
      }
    }, SOLVED_PAUSE_MS);
  }, [schedule, cheerId, sort, onAdvance, boxOf]);

  /* ── Gliding ──────────────────────────────────────────────────────────── */

  const glideDone = useCallback(
    (g: Glide) => {
      setGlides((all) => all.filter((x) => x.key !== g.key));
      if (!g.home) return;
      // counted in a ref, not read back from state: two glides can land in
      // the same frame, and each must see the other
      const mine = landedRef.current.board === board ? landedRef.current.ids : new Set<string>();
      const next = new Set(mine).add(g.thing.id);
      landedRef.current = { board, ids: next };
      const last = next.size >= loose.length;
      setProgress((p) => ({ ...p, board, landed: next }));
      playSnapSound();
      schedule(playStarPop, 90);
      const said = wordClip(landingWord(rule, g.thing));
      if (said) void playClip(said);
      const id = ++glideKey.current;
      setBursts((b) => [...b, { id, x: g.to.x, y: g.to.y }]);
      schedule(() => setBursts((b) => b.filter((x) => x.id !== id)), BURST_MS);
      setHop(true);
      schedule(() => setHop(false), 700);
      if (last) finishBoard();
    },
    [board, loose.length, rule, schedule, finishBoard]
  );

  /* ── Dropping ─────────────────────────────────────────────────────────── */

  const drop = useCallback(
    (thing: Thing, target: number | null, info: DropInfo) => {
      if (!info.moved) return; // a tap is never a drop
      const carried =
        ghostArt.current?.querySelector(".stw-art")?.getBoundingClientRect().width ?? 60;
      const from = { x: info.x, y: info.y, w: carried };
      const right = target !== null && target === trayOf(rule, thing);
      const to = boxOf(
        artOf(right ? slotRefs.current.get(thing.id) : bankRefs.current.get(thing.id))
      );
      if (right) {
        setProgress((p) => ({
          board,
          placed: new Set(p.board === board ? p.placed : NONE).add(thing.id),
          landed: p.board === board ? p.landed : NONE,
        }));
        setHand(null);
      } else if (target !== null) {
        playThudSound();
        void playClip(WRONG_CLIP);
        onMiss();
      }
      const key = ++glideKey.current;
      if (to) setGlides((all) => [...all, { key, thing, from, to, home: right }]);
      else if (right) glideDone({ key, thing, from, to: { ...from, h: carried }, home: true });
    },
    [rule, board, boxOf, onMiss, glideDone]
  );

  const { dragging, over, start, ghostRef } = useDragDrop<Thing, number>({
    root: rootRef,
    targets: trayRefs,
    slopPx: DROP_SLOP_PX,
    onDrop: drop,
  });

  const pickUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>, thing: Thing) => {
      if (phase !== "play" || !start(e, thing)) return;
      setTouched(true);
      setHand(null);
      playPickUpSound();
    },
    [phase, start]
  );

  const registerBank = useCallback(
    (id: string, el: HTMLElement | null) => registerTarget(bankRefs.current, id, el),
    []
  );

  /* ── The hand ─────────────────────────────────────────────────────────── */

  const busy = glides.length > 0;
  const showNextMove = useCallback(() => {
    const thing = bank.find((t) => !placed.has(t.id));
    if (!thing) return;
    const a = boxOf(bankRefs.current.get(thing.id));
    const b = boxOf(slotRefs.current.get(thing.id));
    if (a && b) setHand({ fx: a.x, fy: a.y, tx: b.x, ty: b.y });
  }, [bank, placed, boxOf]);

  // the very first board, untouched: the hand shows the first move at once
  const demo = board === 0 && !touched && placed.size === 0;
  // after that it comes back whenever the child has been still for 7 s
  const idle = useIdleHand(
    phase === "play" && !dragging && !busy && !solved,
    `${board}:${placed.size}`
  );

  useEffect(() => {
    if (!demo || phase !== "play") return;
    const t = setTimeout(() => {
      showNextMove();
      // after the board's prompt (and the card's line before it), not over it
      void sayAfter("instr-watch-carefully");
    }, 900);
    return () => clearTimeout(t);
  }, [demo, phase, showNextMove]);

  useEffect(() => {
    if (!idle) return;
    const raf = requestAnimationFrame(showNextMove);
    return () => cancelAnimationFrame(raf);
  }, [idle, showNextMove]);

  useEffect(() => {
    if (!hand) return;
    const onResize = () => showNextMove();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [hand, showNextMove]);

  /* ── Drawing ──────────────────────────────────────────────────────────── */

  const returning = useMemo(
    () => new Set(glides.filter((g) => !g.home).map((g) => g.thing.id)),
    [glides]
  );
  const cheering = phase !== "play";
  const say = clipText(cheering ? cheerId : rule.clip);
  const cast = useMemo(
    () =>
      set.things.slice(0, 4).map((t) => (
        <span key={t.id} className="stw-cast">
          <ThingArt thing={t} />
        </span>
      )),
    [set]
  );

  return (
    <div ref={rootRef} className={`stw-screen stw-play stw-play--${module}`}>
      <Playroom />

      <div className="stw-trail" role="img" aria-label={`Board ${board + 1} of ${BOARDS}`}>
        {Array.from({ length: BOARDS }, (_, i) => (
          <span
            key={i}
            className={`stw-trail-item ${
              i < board || (i === board && solved) ? "is-done" : i === board ? "is-now" : ""
            }`}
          >
            <Picture id="star" />
          </span>
        ))}
      </div>

      <div className="stw-main">
        <div ref={boardRef} className={`stw-board ${solved ? "is-solved" : ""}`}>
          {([0, 1] as const).map((t) => (
            <div
              key={`${board}-${t}`}
              ref={(el) => registerTarget(trayRefs.current, t, el)}
              className={`stw-tray ${over === t ? "stw-tray--lit" : ""}`}
              role="group"
              aria-label={`Tray for ${rule.trays[t].value} things`}
            >
              {trays[t].map((thing, i) => {
                const shown = i === 0 || landed.has(thing.id);
                return (
                  <span
                    key={thing.id}
                    ref={(el) => registerTarget(slotRefs.current, thing.id, el)}
                    className={`stw-slot ${shown ? "is-full" : ""}`}
                  >
                    {shown ? (
                      <motion.span
                        className="stw-slot-art"
                        initial={i === 0 ? { scale: 0.5, opacity: 0 } : false}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 18,
                          delay: i === 0 ? 0.1 + t * 0.12 : 0,
                        }}
                      >
                        <ThingArt thing={thing} />
                      </motion.span>
                    ) : (
                      <span className="stw-slot-art">
                        <ThingArt thing={thing} shadow />
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          ))}
        </div>

        <div className={`stw-side ${phase === "break" ? "is-away" : ""}`}>
          <motion.p
            key={say}
            className="stw-bubble font-rounded font-black"
            initial={{ opacity: 0, y: 8, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            aria-hidden="true"
          >
            {say}
          </motion.p>
          <div className="stw-side-row">
            <div className="stw-bank">
              {bank.map((thing, i) => (
                <BankButton
                  key={`${board}-${thing.id}`}
                  thing={thing}
                  order={i}
                  used={placed.has(thing.id)}
                  hidden={dragging?.id === thing.id || returning.has(thing.id)}
                  locked={phase !== "play"}
                  onPick={pickUp}
                  register={registerBank}
                />
              ))}
            </div>
            <div className="stw-teacher-slot stw-teacher-slot--play" aria-hidden="true">
              <Teacher cheer={hop || cheering} />
            </div>
          </div>
        </div>
      </div>

      <p className="stw-sr" aria-live="polite">
        {say}
      </p>

      {glides.map((g) => (
        <GlideThing key={g.key} glide={g} onDone={glideDone} />
      ))}
      {bursts.map((b) => (
        <PieceBurst key={b.id} x={b.x} y={b.y} />
      ))}

      {dragging && (
        <div ref={ghostRef} className="stw-ghost pl-drag-ghost" aria-hidden="true">
          <span ref={ghostArt} className="stw-ghost-art">
            <ThingArt thing={dragging} />
          </span>
        </div>
      )}

      {hand && !dragging && phase === "play" && (demo || idle) && <TeachingHand {...hand} />}

      {phase === "set" && stamp && (
        <RoundCheer cast={cast} stampX={stamp.x} stampY={stamp.y} label={say} />
      )}
      <AnimatePresence>
        {phase === "break" && (
          <FigureBreak key="break" label={clipText(BREAK_CLIP)}>
            <span className="stw-break-teacher">
              <Teacher cheer say={clipText(BREAK_CLIP)} />
            </span>
          </FigureBreak>
        )}
      </AnimatePresence>

      <NavPillButton
        label="Back"
        ariaLabel="Back to the Sort Two Ways title"
        tone="kitchen"
        surface="strong"
        pinned
        onClick={() => {
          playClickSound();
          onHome();
        }}
      />
      <button
        type="button"
        className="stw-leave pl-exit-pill font-rounded font-black"
        onClick={() => {
          playClickSound();
          onExitPortal();
        }}
        aria-label="Back to the game portal"
      >
        Back to Games
      </button>
    </div>
  );
}

/** One white round button in the bank. Memoised: a drag re-renders the
 *  round, and only the button whose state changed should follow. */
const BankButton = memo(function BankButton({
  thing,
  order,
  used,
  hidden,
  locked,
  onPick,
  register,
}: {
  thing: Thing;
  order: number;
  used: boolean;
  hidden: boolean;
  locked: boolean;
  onPick: (e: React.PointerEvent<HTMLButtonElement>, thing: Thing) => void;
  register: (id: string, el: HTMLElement | null) => void;
}) {
  return (
    <motion.button
      type="button"
      ref={(el) => register(thing.id, el)}
      className={`stw-source ${used ? "is-used" : ""} ${hidden ? "is-carried" : ""}`}
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 320, damping: 18, delay: 0.15 + order * 0.08 }}
      disabled={used || locked}
      onPointerDown={used || locked ? undefined : (e) => onPick(e, thing)}
      aria-label={`${thing.name} — drag it to its tray`}
    >
      <span className="stw-source-art">
        <ThingArt thing={thing} />
      </span>
    </motion.button>
  );
});

/** A thing gliding (transform only, run by the browser) from where the
 *  finger let go into the box it settles in, then reporting back. */
function GlideThing({ glide, onDone }: { glide: Glide; onDone: (g: Glide) => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });
  useEffect(() => {
    const el = ref.current;
    const { from, to } = glide;
    let fired = false;
    const finish = () => {
      if (fired) return;
      fired = true;
      done.current(glide);
    };
    if (!el || typeof el.animate !== "function") {
      finish();
      return;
    }
    // the animation's own finish can wait on a frame that a throttled or
    // backgrounded page never paints; the thing lands on time regardless
    const backstop = setTimeout(finish, GLIDE_MS + 60);
    const s = to.w > 0 ? from.w / to.w : 1;
    const anim = el.animate(
      [
        { transform: `translate(${from.x - to.x}px, ${from.y - to.y}px) scale(${s})` },
        { transform: "translate(0, 0) scale(1)" },
      ],
      { duration: GLIDE_MS, easing: "cubic-bezier(0.2, 0.8, 0.3, 1)", fill: "both" }
    );
    anim.onfinish = finish;
    return () => {
      anim.onfinish = null;
      clearTimeout(backstop);
    };
  }, [glide]);

  const { to } = glide;
  return (
    <span
      ref={ref}
      className="stw-glide"
      style={{
        left: to.x,
        top: to.y,
        width: to.w,
        height: to.h,
        marginLeft: -to.w / 2,
        marginTop: -to.h / 2,
      }}
      aria-hidden="true"
    >
      <ThingArt thing={glide.thing} />
    </span>
  );
}
