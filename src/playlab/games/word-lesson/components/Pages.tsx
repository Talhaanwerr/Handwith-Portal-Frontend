"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { motion } from "framer-motion";
import { playPickUpSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence } from "@shared/audio/voice";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { RoundCountContext } from "@games/number-groups/components/NgGuided";
import { slideBack } from "@games/rhyme-match/utils/slideBack";
import { LessonWorld } from "@games/word-lesson/components/LessonWorld";
import { BoxBack, BoxFront, Cover, WlPic } from "@games/word-lesson/components/LessonArt";
import { usePage, usePageHand, wordText } from "@games/word-lesson/components/usePage";
import {
  MEET,
  PEEK,
  PUT,
  PUZZLE,
  SET_ROUNDS,
  setPages,
  SHADOW,
  TRY,
  WHERE,
  picOf,
  shapeOf,
  sayOf,
  type Lesson,
} from "@games/word-lesson/constants/lesson";
import type { HandPath } from "@games/shadow-match/components/useHandAt";

type PageProps = RoundProps & { lesson: Lesson };

const ENTER = { type: "spring", stiffness: 240, damping: 17 } as const;

/** The lesson's frame round every page: its world, the line, the hand. */
function Frame({
  page,
  lesson,
  rp,
  stageRef,
  boardRef,
  solved,
  say,
  cheers,
  hand,
  ghost,
  children,
}: {
  page: string;
  lesson: Lesson;
  rp: RoundProps;
  stageRef: RefObject<HTMLDivElement | null>;
  boardRef: RefObject<HTMLDivElement | null>;
  solved: boolean;
  /** The line in the guide bar (the cheer once the page is won). */
  say: string;
  cheers: ReactNode;
  hand: HandPath | null;
  ghost?: ReactNode;
  children: ReactNode;
}) {
  const stage = (
    <NgStage
      stageRef={stageRef}
      playClass={`wl-play wl-play--${page}`}
      world={<LessonWorld scene={lesson.scene} />}
      round={lesson.sets ? rp.round % SET_ROUNDS : rp.round}
      solved={solved}
      say={say}
      title={rp.title}
      onHome={rp.onHome}
      onExitPortal={rp.onExitPortal}
      overlay={
        <>
          {cheers}
          {ghost}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div ref={boardRef} className={`wl-board wl-board--${page}`}>
        {children}
      </div>
    </NgStage>
  );
  // a set lesson shows one star a page of the SET, not of the whole run
  return lesson.sets ? (
    <RoundCountContext.Provider value={SET_ROUNDS}>{stage}</RoundCountContext.Provider>
  ) : (
    stage
  );
}

/** A picture card: comes in, wiggles when wrong, glows / pulses as a hint. */
function Card({
  word,
  index,
  delay,
  cls,
  wiggle,
  onTap,
  register,
}: {
  word: string;
  index: number;
  delay: number;
  cls: string;
  wiggle: number;
  onTap: (i: number) => void;
  register: (i: number, el: HTMLButtonElement | null) => void;
}) {
  return (
    <motion.button
      type="button"
      ref={(el) => register(index, el)}
      className="wl-card-slot"
      onClick={() => onTap(index)}
      aria-label={word}
      initial={{ opacity: 0, y: 40, scale: 0.6 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...ENTER, delay }}
    >
      <span key={wiggle} className={`wl-wiggle ${wiggle > 0 ? "is-wiggling" : ""}`}>
        <span className={`wl-card ${cls}`}>
          <WlPic src={picOf(word)} />
        </span>
      </span>
    </motion.button>
  );
}

/* ─── 1 · MEET ─────────────────────────────────────────────────────────── */

/** Three cards come in one by one, each named; "Tap each one!" — a tap says
 *  the word and the card bounces; the page is done when all three are tapped. */
export function MeetPage(props: PageProps) {
  const { lesson, round, onDone, onMiss } = props;
  const words = lesson.meet;
  const [shown, setShown] = useState(0);
  const [tapped, setTapped] = useState<readonly boolean[]>([false, false, false]);
  const [bounce, setBounce] = useState<readonly number[]>([0, 0, 0]);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [intro] = useState(() => [...words.map(sayOf), MEET]);
  const p = usePage({
    lesson,
    round,
    words,
    intro,
    onIntroPart: (i) => setShown((s) => Math.max(s, Math.min(i + 1, 3))),
    onDone,
    onMiss,
  });

  // the cards come in even if the names are slow to load
  useEffect(() => {
    const t = setTimeout(() => setShown(3), 3800);
    return () => clearTimeout(t);
  }, []);

  const tap = useCallback(
    (i: number) => {
      if (p.isSolved()) return;
      p.act();
      setShown(3);
      void playClip(sayOf(words[i]));
      setBounce((b) => b.map((n, j) => (j === i ? n + 1 : n)));
      if (tapped[i]) return;
      const next = tapped.map((t, j) => t || j === i);
      setTapped(next);
      playStarPop();
      p.burst(refs.current[i]);
      if (next.every(Boolean)) p.finish(p.boardRef.current);
    },
    [p, tapped, words]
  );
  const register = useCallback((i: number, el: HTMLButtonElement | null) => {
    refs.current[i] = el;
  }, []);

  const next = tapped.indexOf(false);
  const target = useCallback(() => refs.current[next], [next]);
  const hand = usePageHand({
    armed: p.ready && !p.solved && next >= 0 && shown > next,
    resetKey: next,
    misses: 0,
    round,
    stageRef: p.stageRef,
    from: target,
    to: target,
  });

  return (
    <Frame
      page="meet"
      lesson={lesson}
      rp={props}
      stageRef={p.stageRef}
      boardRef={p.boardRef}
      solved={p.solved}
      say={p.say(clipText(MEET))}
      cheers={p.overlay}
      hand={hand}
    >
      <div className="wl-row">
        {words.map((w, i) =>
          i < shown ? (
            <motion.button
              key={w}
              type="button"
              ref={(el) => register(i, el)}
              className="wl-card-slot"
              onClick={() => tap(i)}
              aria-label={w}
              initial={{ opacity: 0, y: -60, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={ENTER}
            >
              <span key={bounce[i]} className={`wl-bounce ${bounce[i] > 0 ? "is-bouncing" : ""}`}>
                <span className={`wl-card ${tapped[i] ? "is-done" : ""}`}>
                  <WlPic src={picOf(w)} />
                  {tapped[i] && <span className="wl-tick" aria-hidden="true" />}
                </span>
              </span>
            </motion.button>
          ) : (
            <span key={w} className="wl-card-slot wl-card-slot--empty" aria-hidden="true" />
          )
        )}
      </div>
    </Frame>
  );
}

/* ─── 2, 3 · WHERE IS IT? and 5 · PEEKABOO ─────────────────────────────── */

/** "Where is the cow?" — tap it. With `peek` the pictures hide behind the
 *  lesson's hiding spots, a corner of each peeking out, and the right spot
 *  opens. Wrong: a wiggle, "Try again!", the ask again, the right one glows;
 *  a second miss and it pulses and the hand shows it. */
export function ChoicePage(
  props: PageProps & { options: readonly string[]; target: string; peek?: boolean }
) {
  const { lesson, round, onDone, onMiss, options, target, peek = false } = props;
  const answer = options.indexOf(target);
  const ask = peek ? PEEK : WHERE;
  const [found, setFound] = useState(false);
  const [wiggle, setWiggle] = useState<readonly number[]>(() => options.map(() => 0));
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [intro] = useState(() => [ask, sayOf(target)]);
  const p = usePage({ lesson, round, words: options, intro, onDone, onMiss });

  const tap = useCallback(
    (i: number) => {
      if (p.isSolved()) return;
      p.act();
      if (i === answer) {
        setFound(true);
        playStarPop();
        void playClip(sayOf(target));
        p.burst(refs.current[i]);
        p.finish(refs.current[i]);
        return;
      }
      setWiggle((w) => w.map((n, j) => (j === i ? n + 1 : n)));
      p.miss();
      void playSequence([TRY, ask, sayOf(target)], 200);
    },
    [answer, ask, p, target]
  );
  const register = useCallback((i: number, el: HTMLButtonElement | null) => {
    refs.current[i] = el;
  }, []);

  const right = useCallback(() => refs.current[answer], [answer]);
  const hand = usePageHand({
    armed: p.ready && !p.solved,
    resetKey: "tap",
    misses: p.misses,
    round,
    stageRef: p.stageRef,
    from: right,
    to: right,
  });
  const hintCls = (i: number) =>
    i !== answer || found
      ? ""
      : p.misses >= 2
        ? "is-hint is-pulse"
        : p.misses >= 1
          ? "is-hint"
          : "";

  return (
    <Frame
      page={peek ? "peek" : `where${options.length}`}
      lesson={lesson}
      rp={props}
      stageRef={p.stageRef}
      boardRef={p.boardRef}
      solved={p.solved}
      say={p.say(`${clipText(ask)} ${wordText(target)}?`)}
      cheers={p.overlay}
      hand={hand}
    >
      <div className="wl-row">
        {options.map((w, i) =>
          peek ? (
            <Spot
              key={w}
              word={w}
              index={i}
              scene={lesson.scene}
              open={found && i === answer}
              cls={hintCls(i)}
              wiggle={wiggle[i]}
              onTap={tap}
              register={register}
            />
          ) : (
            <Card
              key={w}
              word={w}
              index={i}
              delay={0.08 + i * 0.12}
              cls={`${hintCls(i)} ${found && i === answer ? "is-found" : ""}`}
              wiggle={wiggle[i]}
              onTap={tap}
              register={register}
            />
          )
        )}
      </div>
    </Frame>
  );
}

/** A hiding spot: the lesson's cover, the thing's corner peeking over it. */
function Spot({
  word,
  index,
  scene,
  open,
  cls,
  wiggle,
  onTap,
  register,
}: {
  word: string;
  index: number;
  scene: Lesson["scene"];
  open: boolean;
  cls: string;
  wiggle: number;
  onTap: (i: number) => void;
  register: (i: number, el: HTMLButtonElement | null) => void;
}) {
  return (
    <motion.button
      type="button"
      ref={(el) => register(index, el)}
      className="wl-spot-slot"
      onClick={() => onTap(index)}
      aria-label={`Hiding spot ${index + 1}`}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...ENTER, delay: 0.08 + index * 0.12 }}
    >
      <span key={wiggle} className={`wl-wiggle ${wiggle > 0 ? "is-wiggling" : ""}`}>
        <span className={`wl-spot ${cls} ${open ? "is-open" : ""}`}>
          <motion.span
            className="wl-spot-thing"
            animate={open ? { y: "-6%", scale: 1.25 } : { y: "0%", scale: 1 }}
            transition={ENTER}
          >
            <span className={`wl-spot-tilt ${open ? "is-straight" : ""}`}>
              <WlPic src={picOf(word)} />
            </span>
          </motion.span>
          <motion.span
            className="wl-spot-cover"
            animate={open ? { y: "70%", opacity: 0 } : { y: "0%", opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeIn" }}
          >
            <Cover scene={scene} index={index} />
          </motion.span>
        </span>
      </span>
    </motion.button>
  );
}

/* ─── 4 · SHADOW MATCH ─────────────────────────────────────────────────── */

/** One picture, two dark shadows: drag it onto its own. A tap on the picture
 *  says its word. */
export function ShadowPage(props: PageProps) {
  const { lesson, round, onDone, onMiss } = props;
  const { piece, shadows } = lesson.shadow;
  const answer = shadows.indexOf(piece);
  const [placed, setPlaced] = useState(false);
  const [wiggle, setWiggle] = useState(0);
  const pieceRef = useRef<HTMLDivElement>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targets = useRef(new Map<number, HTMLElement>());
  const [intro] = useState(() => [sayOf(piece), SHADOW]);
  const p = usePage({ lesson, round, words: shadows, intro, onDone, onMiss });

  const { dragging, over, start, ghostRef } = useDragDrop<"piece", number>({
    root: p.stageRef,
    targets,
    slopPx: 24,
    onDrop: (_item, target, info) => {
      if (p.isSolved()) return;
      p.act();
      if (!info.moved) {
        void playClip(sayOf(piece));
        return;
      }
      if (target === null) {
        slideBack(p.stageRef.current, pieceRef.current, info);
        return;
      }
      if (target === answer) {
        setPlaced(true);
        playStarPop();
        void playClip(sayOf(piece));
        p.burst(slotRefs.current[answer]);
        p.finish(slotRefs.current[answer]);
        return;
      }
      slideBack(p.stageRef.current, pieceRef.current, info);
      setWiggle((n) => n + 1);
      p.miss();
      void playSequence([TRY, SHADOW], 200);
    },
  });
  const pick = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (p.isSolved()) return;
      p.act();
      if (start(e, "piece")) playPickUpSound();
    },
    [p, start]
  );
  const register = useCallback((i: number, el: HTMLDivElement | null) => {
    slotRefs.current[i] = el;
    if (el) targets.current.set(i, el);
    else targets.current.delete(i);
  }, []);

  const from = useCallback(() => pieceRef.current, []);
  const to = useCallback(() => slotRefs.current[answer], [answer]);
  const hand = usePageHand({
    armed: p.ready && !p.solved && dragging === null,
    resetKey: "drag",
    misses: p.misses,
    round,
    stageRef: p.stageRef,
    from,
    to,
  });

  return (
    <Frame
      page="shadow"
      lesson={lesson}
      rp={props}
      stageRef={p.stageRef}
      boardRef={p.boardRef}
      solved={p.solved}
      say={p.say(clipText(SHADOW))}
      cheers={p.overlay}
      hand={hand}
      ghost={
        dragging !== null && (
          <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
            <span className="ng-carried wl-carried">
              <span className="wl-card">
                <WlPic src={shapeOf(piece)} />
              </span>
            </span>
          </div>
        )
      }
    >
      <div className="wl-targets">
        {shadows.map((w, i) => {
          const done = placed && i === answer;
          const hint =
            !placed && i === answer
              ? p.misses >= 2
                ? "is-hint is-pulse"
                : p.misses >= 1
                  ? "is-hint"
                  : ""
              : "";
          return (
            <div
              key={w}
              ref={(el) => register(i, el)}
              className="wl-card-slot"
              aria-label={`shadow ${i + 1}`}
            >
              <motion.span
                className="wl-in"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...ENTER, delay: 0.1 + i * 0.12 }}
              >
                <span
                  className={`wl-shadow ${hint} ${over === i ? "is-lit" : ""} ${done ? "is-filled" : ""}`}
                >
                  <WlPic src={shapeOf(w)} dark={!done} />
                </span>
              </motion.span>
            </div>
          );
        })}
      </div>
      <div className="wl-home">
        <div
          ref={pieceRef}
          className={`wl-card-slot wl-drag touch-none ${dragging !== null || placed ? "is-away" : ""}`}
          onPointerDown={pick}
          role="button"
          aria-label={`${piece} — drag it onto its shadow`}
        >
          <motion.span
            className="wl-in"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={ENTER}
          >
            <span key={wiggle} className={`wl-wiggle ${wiggle > 0 ? "is-wiggling" : ""}`}>
              <span className="wl-card">
                <WlPic src={shapeOf(piece)} />
              </span>
            </span>
          </motion.span>
        </div>
      </div>
    </Frame>
  );
}

/* ─── 6 · PUT IT AWAY ──────────────────────────────────────────────────── */

/** Two pictures and the lesson's container: "Put the apple in the basket!" —
 *  drag the named one in. A tap on a picture says its word. */
export function PutPage(props: PageProps) {
  const { lesson, round, onDone, onMiss } = props;
  const { options, target } = lesson.put;
  const answer = options.indexOf(target);
  const [placed, setPlaced] = useState(false);
  const [wiggle, setWiggle] = useState<readonly number[]>([0, 0]);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);
  const targets = useRef(new Map<"box", HTMLElement>());
  const [intro] = useState(() => [PUT, sayOf(target), lesson.putIn]);
  const p = usePage({ lesson, round, words: options, intro, onDone, onMiss });

  const { dragging, over, start, ghostRef } = useDragDrop<number, "box">({
    root: p.stageRef,
    targets,
    slopPx: 30,
    onDrop: (item, target_, info) => {
      if (p.isSolved()) return;
      p.act();
      if (!info.moved) {
        void playClip(sayOf(options[item]));
        return;
      }
      if (target_ === null) {
        slideBack(p.stageRef.current, itemRefs.current[item], info);
        return;
      }
      if (item === answer) {
        setPlaced(true);
        playStarPop();
        void playClip(sayOf(target));
        p.burst(boxRef.current);
        p.finish(boxRef.current);
        return;
      }
      slideBack(p.stageRef.current, itemRefs.current[item], info);
      setWiggle((w) => w.map((n, j) => (j === item ? n + 1 : n)));
      p.miss();
      void playSequence([TRY, PUT, sayOf(target), lesson.putIn], 200);
    },
  });
  const pick = useCallback(
    (e: React.PointerEvent<HTMLElement>, i: number) => {
      if (p.isSolved()) return;
      p.act();
      if (start(e, i)) playPickUpSound();
    },
    [p, start]
  );
  const setBox = useCallback((el: HTMLDivElement | null) => {
    boxRef.current = el;
    if (el) targets.current.set("box", el);
    else targets.current.delete("box");
  }, []);

  const from = useCallback(() => itemRefs.current[answer], [answer]);
  const to = useCallback(() => boxRef.current, []);
  const hand = usePageHand({
    armed: p.ready && !p.solved && dragging === null,
    resetKey: "drag",
    misses: p.misses,
    round,
    stageRef: p.stageRef,
    from,
    to,
  });

  return (
    <Frame
      page="put"
      lesson={lesson}
      rp={props}
      stageRef={p.stageRef}
      boardRef={p.boardRef}
      solved={p.solved}
      say={p.say(`${clipText(PUT)} ${wordText(target)} ${clipText(lesson.putIn)}`)}
      cheers={p.overlay}
      hand={hand}
      ghost={
        dragging !== null && (
          <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
            <span className="ng-carried wl-carried">
              <span className="wl-card">
                <WlPic src={picOf(options[dragging])} />
              </span>
            </span>
          </div>
        )
      }
    >
      <div className="wl-items">
        {options.map((w, i) => {
          const hint =
            i === answer && !placed
              ? p.misses >= 2
                ? "is-hint is-pulse"
                : p.misses >= 1
                  ? "is-hint"
                  : ""
              : "";
          return (
            <div
              key={w}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={`wl-card-slot wl-drag touch-none ${dragging === i || (placed && i === answer) ? "is-away" : ""}`}
              onPointerDown={(e) => pick(e, i)}
              role="button"
              aria-label={`${w} — drag it in`}
            >
              <motion.span
                className="wl-in"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...ENTER, delay: 0.08 + i * 0.12 }}
              >
                <span key={wiggle[i]} className={`wl-wiggle ${wiggle[i] > 0 ? "is-wiggling" : ""}`}>
                  <span className={`wl-card ${hint}`}>
                    <WlPic src={picOf(w)} />
                  </span>
                </span>
              </motion.span>
            </div>
          );
        })}
      </div>
      <div ref={setBox} className="wl-box-slot" aria-label="Put it in here">
        <motion.span
          className="wl-in"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...ENTER, delay: 0.3 }}
        >
          <span
            className={`wl-box wl-box--${lesson.scene} ${over === "box" ? "is-lit" : ""} ${placed ? "is-filled" : ""}`}
          >
            <BoxBack scene={lesson.scene} />
            {placed && (
              <motion.span
                className="wl-box-item"
                initial={{ opacity: 0, y: "-60%", scale: 0.6 }}
                animate={{ opacity: 1, y: "0%", scale: 1 }}
                transition={ENTER}
              >
                <WlPic src={picOf(target)} />
              </motion.span>
            )}
            <BoxFront scene={lesson.scene} />
          </span>
        </motion.span>
      </div>
    </Frame>
  );
}

/* ─── SET LESSONS · A FOUR-PIECE PUZZLE ────────────────────────────────── */

/** Where each piece waits in the tray, by page — never in solved order. */
const TRAYS: readonly (readonly number[])[] = [
  [3, 0, 2, 1],
  [1, 3, 0, 2],
  [2, 1, 3, 0],
];
const QUARTERS = [0, 1, 2, 3] as const;

/** One quarter of a word's picture: a window onto the whole picture. */
function Quarter({ word, part }: { word: string; part: number }) {
  return (
    <span className={`wl-puz-win wl-puz-win--${part}`}>
      <WlPic src={picOf(word)} />
    </span>
  );
}

/** "Put the four pieces together!" — the word's picture cut in four; drag
 *  each piece onto its place on the board (a faint picture shows where). A
 *  piece in the wrong place slides home; the last one names the word. */
export function PuzzlePage(props: PageProps & { word: string }) {
  const { lesson, round, onDone, onMiss, word } = props;
  const tray = TRAYS[round % TRAYS.length];
  const [placed, setPlaced] = useState<readonly boolean[]>([false, false, false, false]);
  const placedRef = useRef<boolean[]>([false, false, false, false]);
  const pieceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const boardEl = useRef<HTMLDivElement>(null);
  const targets = useRef(new Map<number, HTMLElement>());
  const words = useMemo(() => [word], [word]);
  const [intro] = useState(() => [PUZZLE]);
  const p = usePage({ lesson, round, words, intro, onDone, onMiss });

  const { dragging, over, start, ghostRef } = useDragDrop<number, number>({
    root: p.stageRef,
    targets,
    slopPx: 24,
    onDrop: (piece, target, info) => {
      if (p.isSolved()) return;
      p.act();
      if (!info.moved) return;
      if (target === piece) {
        placedRef.current[piece] = true;
        setPlaced([...placedRef.current]);
        playStarPop();
        if (placedRef.current.every(Boolean)) {
          void playClip(sayOf(word));
          p.burst(boardEl.current);
          p.finish(boardEl.current);
        }
        return;
      }
      slideBack(p.stageRef.current, pieceRefs.current[piece], info);
      if (target !== null) {
        p.miss();
        void playClip(TRY);
      }
    },
  });
  const pick = useCallback(
    (e: React.PointerEvent<HTMLElement>, piece: number) => {
      if (p.isSolved() || placedRef.current[piece]) return;
      p.act();
      if (start(e, piece)) playPickUpSound();
    },
    [p, start]
  );
  const registerSlot = useCallback((i: number, el: HTMLDivElement | null) => {
    slotRefs.current[i] = el;
    if (el) targets.current.set(i, el);
    else targets.current.delete(i);
  }, []);
  const registerPiece = useCallback((i: number, el: HTMLDivElement | null) => {
    pieceRefs.current[i] = el;
  }, []);

  // the hand shows the next piece still in the tray, and where it goes
  const next = tray.find((i) => !placed[i]) ?? 0;
  const from = useCallback(() => pieceRefs.current[next], [next]);
  const to = useCallback(() => slotRefs.current[next], [next]);
  const hand = usePageHand({
    armed: p.ready && !p.solved && dragging === null,
    resetKey: `puzzle-${next}`,
    misses: p.misses,
    round,
    stageRef: p.stageRef,
    from,
    to,
  });

  return (
    <Frame
      page="puzzle"
      lesson={lesson}
      rp={props}
      stageRef={p.stageRef}
      boardRef={p.boardRef}
      solved={p.solved}
      say={p.say(clipText(PUZZLE))}
      cheers={p.overlay}
      hand={hand}
      ghost={
        dragging !== null && (
          <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
            <span className="ng-carried wl-puz-carried">
              <Quarter word={word} part={dragging} />
            </span>
          </div>
        )
      }
    >
      <motion.div
        ref={boardEl}
        className={`wl-puz-board ${p.solved ? "is-whole" : ""}`}
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={ENTER}
      >
        <span className="wl-puz-guide" aria-hidden="true">
          <WlPic src={picOf(word)} />
        </span>
        {QUARTERS.map((i) => (
          <div
            key={i}
            ref={(el) => registerSlot(i, el)}
            className={`wl-puz-slot ${over === i && !placed[i] ? "is-lit" : ""} ${
              placed[i] ? "is-filled" : ""
            }`}
            aria-label={`place ${i + 1}`}
          >
            {placed[i] && <Quarter word={word} part={i} />}
          </div>
        ))}
      </motion.div>
      <div className="wl-puz-tray">
        {tray.map((i, k) => (
          <div
            key={i}
            ref={(el) => registerPiece(i, el)}
            className={`wl-puz-piece wl-drag touch-none ${
              dragging === i || placed[i] ? "is-away" : ""
            }`}
            onPointerDown={(e) => pick(e, i)}
            role="button"
            aria-label={`piece ${k + 1} — drag it onto the picture`}
          >
            <motion.span
              className="wl-in"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...ENTER, delay: 0.1 + k * 0.08 }}
            >
              <Quarter word={word} part={i} />
            </motion.span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/** A set lesson's pages: the set's three words through SET_ROUNDS pages. */
function SetPage(props: PageProps & { sets: NonNullable<Lesson["sets"]> }) {
  const { lesson, round, sets } = props;
  const step = round % SET_ROUNDS;
  const view = useMemo(() => {
    const pages = setPages(sets[Math.floor(round / SET_ROUNDS) % sets.length]);
    return {
      pages,
      lesson: {
        ...lesson,
        meet: pages.meet,
        peek: pages.peek,
        put: pages.put,
      },
    };
  }, [lesson, round, sets]);
  const pp = { ...props, lesson: view.lesson };
  const { pages } = view;
  if (step === 0) return <MeetPage {...pp} />;
  if (step <= 3) {
    const find = pages.finds[step - 1];
    return <ChoicePage {...pp} options={find.options} target={find.target} />;
  }
  if (step === 4) {
    return <ChoicePage {...pp} options={pages.peek.spots} target={pages.peek.target} peek />;
  }
  if (step === 5) return <PutPage {...pp} />;
  return <PuzzlePage {...pp} word={pages.puzzles[step - 6]} />;
}

/** The lesson's six pages, in the same order in every lesson (a set lesson
 *  plays its sets instead). */
export function LessonPage(props: PageProps) {
  const { lesson, round } = props;
  if (lesson.sets) return <SetPage {...props} sets={lesson.sets} />;
  switch (round) {
    case 0:
      return <MeetPage {...props} />;
    case 1:
      return (
        <ChoicePage {...props} options={lesson.where2.options} target={lesson.where2.target} />
      );
    case 2:
      return (
        <ChoicePage {...props} options={lesson.where3.options} target={lesson.where3.target} />
      );
    case 3:
      return <ShadowPage {...props} />;
    case 4:
      return <ChoicePage {...props} options={lesson.peek.spots} target={lesson.peek.target} peek />;
    default:
      return <PutPage {...props} />;
  }
}
