"use client";

import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { playPickUpSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence } from "@shared/audio/voice";
import { cssVars } from "@shared/styles/cssVars";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { usePlayPage } from "@games/number-groups/components/usePlayPage";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { slideBack } from "@games/rhyme-match/utils/slideBack";
import { usePageHand } from "@games/word-lesson/components/usePage";
import { LessonWorld } from "@games/word-lesson/components/LessonWorld";
import {
  LESSONS,
  ODD,
  PICK,
  SORT,
  TRY,
  oddItems,
  pageOf,
  picOf,
  pickItems,
  placeClip,
  sayOf,
  sortItems,
  type Lesson,
  type ModuleId,
  type Place,
} from "@games/our-world/constants/rounds";

type PageProps = RoundProps & { lesson: Lesson; half: number };
type Page = ReturnType<typeof usePlayPage>;

const ENTER = { type: "spring", stiffness: 240, damping: 17 } as const;

/** A thing's picture. */
function Pic({ thing }: { thing: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={picOf(thing)} alt="" className="owd-pic" draggable={false} />;
}

/** What rains in a page's cheer: its own things. */
const castOf = (things: readonly string[]) =>
  things.map((t) => (
    <span key={t} className="ng-cast">
      <Pic thing={t} />
    </span>
  ));

/** The frame round every page: the park, the line, the hand. */
function Frame({
  page,
  rp,
  p,
  say,
  hand,
  ghost,
  children,
}: {
  page: string;
  rp: PageProps;
  p: Page;
  say: string;
  hand: { fx: number; fy: number; tx: number; ty: number } | null;
  ghost?: ReactNode;
  children: ReactNode;
}) {
  return (
    <NgStage
      stageRef={p.stageRef}
      playClass={`owd-play owd-play--${page}`}
      world={<LessonWorld scene="park" />}
      round={rp.round}
      solved={p.solved}
      say={p.say(say)}
      title={rp.title}
      onHome={rp.onHome}
      onExitPortal={rp.onExitPortal}
      overlay={
        <>
          {p.overlay}
          {ghost}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div className={`owd-board owd-board--${page}`}>{children}</div>
    </NgStage>
  );
}

/** A place: its sign's picture over its name, in its own colour. */
function PlaceSign({ place, cls = "" }: { place: Place; cls?: string }) {
  return (
    <span
      className={`owd-place ${cls}`}
      style={cssVars({ "--owd-accent": place.accent, "--owd-edge": place.edge })}
    >
      <span className="owd-place-pic">
        <Pic thing={place.sign} />
      </span>
      <span className="owd-place-name font-rounded font-black">{clipText(placeClip(place))}</span>
    </span>
  );
}

/** A thing on its white card; wiggles when it was the wrong one. */
function Card({ thing, cls = "", wiggle = 0 }: { thing: string; cls?: string; wiggle?: number }) {
  return (
    <span key={wiggle} className={`owd-wiggle ${wiggle > 0 ? "is-wiggling" : ""}`}>
      <span className={`owd-card ${cls}`}>
        <Pic thing={thing} />
      </span>
    </span>
  );
}

/* ─── 1 · SORT ─────────────────────────────────────────────────────────── */

/** Two places and four things: drag each thing to the place it belongs in.
 *  A right drop names the thing and it stays in the place; a wrong one slides
 *  home and the right place glows. Tapping a place says its name. */
function SortPage(props: PageProps) {
  const { lesson, half, round } = props;
  const items = useMemo(() => sortItems(lesson, half), [lesson, half]);
  const cast = useMemo(() => castOf(items.map((i) => i.thing)), [items]);
  const [placed, setPlaced] = useState<readonly boolean[]>([false, false, false, false]);
  const placedRef = useRef<boolean[]>([false, false, false, false]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const placeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const targets = useRef(new Map<number, HTMLElement>());
  const boardRef = useRef<HTMLDivElement>(null);
  const p = usePlayPage({ ...props, intro: [SORT], cast });

  const { dragging, over, start, ghostRef } = useDragDrop<number, number>({
    root: p.stageRef,
    targets,
    slopPx: 24,
    onDrop: (k, place, info) => {
      if (p.isSolved()) return;
      p.act();
      const item = items[k];
      if (!info.moved) {
        void playClip(sayOf(item.thing));
        return;
      }
      if (place === item.place) {
        placedRef.current[k] = true;
        setPlaced([...placedRef.current]);
        playStarPop();
        void playClip(sayOf(item.thing));
        p.burst(placeRefs.current[place]);
        if (placedRef.current.every(Boolean)) p.finish(boardRef.current);
        return;
      }
      slideBack(p.stageRef.current, cardRefs.current[k], info);
      if (place !== null) {
        p.miss();
        void playClip(TRY);
      }
    },
  });
  const pick = useCallback(
    (e: React.PointerEvent<HTMLElement>, k: number) => {
      if (p.isSolved() || placedRef.current[k]) return;
      p.act();
      if (start(e, k)) playPickUpSound();
    },
    [p, start]
  );
  const registerPlace = useCallback((i: number, el: HTMLDivElement | null) => {
    placeRefs.current[i] = el;
    if (el) targets.current.set(i, el);
    else targets.current.delete(i);
  }, []);
  const registerCard = useCallback((i: number, el: HTMLDivElement | null) => {
    cardRefs.current[i] = el;
  }, []);

  const next = Math.max(
    placed.findIndex((d) => !d),
    0
  );
  const from = useCallback(() => cardRefs.current[next], [next]);
  const to = useCallback(() => placeRefs.current[items[next].place], [items, next]);
  const hand = usePageHand({
    armed: p.ready && !p.solved && dragging === null,
    resetKey: `sort-${next}`,
    misses: p.misses,
    round,
    stageRef: p.stageRef,
    from,
    to,
  });

  const placeEl = (i: number) => {
    const place = lesson.places[i];
    const inside = items.filter((it, k) => it.place === i && placed[k]);
    return (
      <div
        ref={(el) => registerPlace(i, el)}
        className={`owd-bin ${over === i ? "is-lit" : ""} ${
          p.misses >= 1 && dragging === null && items[next].place === i && !p.solved
            ? "is-hint"
            : ""
        }`}
        style={cssVars({ "--owd-accent": place.accent, "--owd-edge": place.edge })}
        onClick={() => void playClip(placeClip(place))}
        role="button"
        aria-label={clipText(placeClip(place))}
      >
        <PlaceSign place={place} />
        <span className="owd-bin-things">
          {inside.map((it) => (
            <span key={it.thing} className="owd-bin-thing">
              <Pic thing={it.thing} />
            </span>
          ))}
        </span>
      </div>
    );
  };

  return (
    <Frame
      page="sort"
      rp={props}
      p={p}
      say={clipText(SORT)}
      hand={hand}
      ghost={
        dragging !== null && (
          <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
            <span className="ng-carried owd-carried">
              <Card thing={items[dragging].thing} />
            </span>
          </div>
        )
      }
    >
      <div ref={boardRef} className="owd-bins">
        {placeEl(0)}
        {placeEl(1)}
      </div>
      <div className="owd-row">
        {items.map((it, k) => (
          <div
            key={it.thing}
            ref={(el) => registerCard(k, el)}
            className={`owd-slot owd-drag touch-none ${dragging === k || placed[k] ? "is-away" : ""}`}
            onPointerDown={(e) => pick(e, k)}
            role="button"
            aria-label={`${it.thing} — drag it where it belongs`}
          >
            <motion.span
              className="owd-in"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...ENTER, delay: 0.15 + k * 0.1 }}
            >
              <Card thing={it.thing} />
            </motion.span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* ─── 2 · PICK and 3 · ODD ─────────────────────────────────────────────── */

/** Tap the one right card. PICK shows a place and asks which thing belongs
 *  there; ODD shows four things and asks which does not belong. Wrong: a
 *  wiggle and "Try again!"; after a second miss the right one pulses. */
function TapPage(props: PageProps & { odd?: boolean }) {
  const { lesson, half, round, odd = false } = props;
  const data = useMemo(() => {
    if (odd) {
      const o = oddItems(lesson, half);
      return { items: o.items, answer: o.odd, place: null as Place | null };
    }
    const pk = pickItems(lesson, half);
    return {
      items: pk.items,
      answer: pk.items.findIndex((i) => i.place === pk.place),
      place: lesson.places[pk.place],
    };
  }, [lesson, half, odd]);
  const { items, answer, place } = data;
  const ask = odd ? ODD : PICK;
  const cast = useMemo(() => castOf(items.map((i) => i.thing)), [items]);
  const [found, setFound] = useState(false);
  const [wiggle, setWiggle] = useState<readonly number[]>(() => items.map(() => 0));
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [intro] = useState(() => (place ? [placeClip(place), ask] : [ask]));
  const p = usePlayPage({ ...props, intro, cast });
  const { finish, burst, isSolved, act, miss } = p;

  const tap = useCallback(
    (k: number) => {
      if (isSolved()) return;
      act();
      if (k === answer) {
        setFound(true);
        playStarPop();
        void playClip(sayOf(items[k].thing));
        burst(refs.current[k]);
        finish(refs.current[k]);
        return;
      }
      setWiggle((w) => w.map((n, j) => (j === k ? n + 1 : n)));
      miss();
      void playSequence([TRY, ask], 200);
    },
    [act, answer, ask, burst, finish, isSolved, items, miss]
  );

  const target = useCallback(() => refs.current[answer], [answer]);
  const hand = usePageHand({
    armed: p.ready && !p.solved,
    resetKey: "tap",
    misses: p.misses,
    round,
    stageRef: p.stageRef,
    from: target,
    to: target,
  });

  return (
    <Frame page={odd ? "odd" : "pick"} rp={props} p={p} say={clipText(ask)} hand={hand}>
      {place && (
        <motion.button
          type="button"
          className="owd-ask"
          style={cssVars({ "--owd-accent": place.accent, "--owd-edge": place.edge })}
          onClick={() => void playClip(placeClip(place))}
          aria-label={clipText(placeClip(place))}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={ENTER}
        >
          <PlaceSign place={place} cls="owd-place--ask" />
        </motion.button>
      )}
      <div className="owd-row">
        {items.map((it, k) => (
          <motion.button
            key={it.thing}
            type="button"
            ref={(el) => {
              refs.current[k] = el;
            }}
            className="owd-slot"
            onClick={() => tap(k)}
            aria-label={it.thing}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...ENTER, delay: 0.15 + k * 0.1 }}
          >
            <Card
              thing={it.thing}
              wiggle={wiggle[k]}
              cls={`${found && k === answer ? "is-found" : ""} ${
                !found && k === answer && p.misses >= 2 ? "is-pulse" : ""
              }`}
            />
          </motion.button>
        ))}
      </div>
    </Frame>
  );
}

/** A lesson's round component, made ONCE per lesson at module level. */
export function makeRound(id: ModuleId) {
  const lesson = LESSONS[id];
  return function OwdRound(props: RoundProps) {
    const { step, half } = pageOf(props.round);
    const pp = { ...props, lesson, half };
    if (step === "sort") return <SortPage {...pp} />;
    if (step === "pick") return <TapPage {...pp} />;
    return <TapPage {...pp} odd />;
  };
}
