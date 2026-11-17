"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { playPickUpSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence, playSequenceChecked } from "@shared/audio/voice";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { usePlayPage } from "@games/number-groups/components/usePlayPage";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { slideBack } from "@games/rhyme-match/utils/slideBack";
import { usePageHand } from "@games/word-lesson/components/usePage";
import { SiteScene } from "@games/cvc-match/components/SiteScene";
import { WordPicture } from "@games/cvc-match/components/WordPicture";
import {
  BUILD,
  HEAR,
  MISSING,
  TRY,
  missingFor,
  pageOf,
  sayOf,
  soundOf,
  trayFor,
  type ModuleId,
} from "@games/word-builder/constants/rounds";

type PageProps = RoundProps & { word: string; wi: number };

const ENTER = { type: "spring", stiffness: 240, damping: 17 } as const;
/** From the last letter to the whole word being said. */
const WORD_MS = 450;
/** HEAR IT: how many more times the word is sounded out after the child's
 *  own taps ("b, e, d — bed", twice more), and the gap between its parts. */
const ECHOES = 2;
const ECHO_GAP_MS = 320;

/**
 * What the three pages share (the kit's `usePlayPage`): the stage, the
 * celebration — raining the word's picture — the misses, and the page's
 * opening line.
 */
function usePage({ round, word, onDone, onMiss }: PageProps, line: string) {
  const cast = useMemo(
    () => [
      <span key={word} className="ng-cast">
        <WordPicture word={word} />
      </span>,
    ],
    [word]
  );
  const [intro] = useState(() => [line]);
  return usePlayPage({ round, intro, cast, onDone, onMiss });
}

/** The frame round every page: the site, the picture card, the letters. */
function Frame({
  page,
  rp,
  p,
  say,
  hand,
  ghost,
  pictureRef,
  children,
}: {
  page: string;
  rp: PageProps;
  p: ReturnType<typeof usePage>;
  say: string;
  hand: { fx: number; fy: number; tx: number; ty: number } | null;
  ghost?: ReactNode;
  pictureRef?: (el: HTMLDivElement | null) => void;
  children: ReactNode;
}) {
  return (
    <NgStage
      stageRef={p.stageRef}
      playClass={`wbd-play wbd-play--${page}`}
      world={<SiteScene calm />}
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
      <div className="wbd-board">
        <motion.div
          ref={pictureRef}
          className="wbd-picture"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={ENTER}
        >
          <WordPicture word={rp.word} />
        </motion.div>
        <div className="wbd-side">{children}</div>
      </div>
    </NgStage>
  );
}

/** A letter on its tile. */
function Tile({ letter, cls = "" }: { letter: string; cls?: string }) {
  return <span className={`wbd-tile font-rounded font-black ${cls}`}>{letter}</span>;
}

/* ─── 1 · HEAR IT ──────────────────────────────────────────────────────── */

/** The word on three tiles: tap each to hear its sound (it lights up); when
 *  all three have been heard the whole word is said — and then the game
 *  sounds it out again, ECHOES more times, each tile bouncing as its sound is
 *  said. Only then is the page won. */
function HearPage(props: PageProps) {
  const { word, round } = props;
  const letters = useMemo(() => word.split(""), [word]);
  const [heard, setHeard] = useState<readonly boolean[]>([false, false, false]);
  const heardRef = useRef<boolean[]>([false, false, false]);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);
  /** The tile whose sound is being said in the echo (3 = the whole word). */
  const [saying, setSaying] = useState(-1);
  const echoing = useRef(false);
  const live = useRef(true);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);
  const p = usePage(props, HEAR);
  const { finish, burst, isSolved, act } = p;

  const tap = useCallback(
    (i: number) => {
      if (isSolved() || echoing.current) return;
      act();
      const first = !heardRef.current[i];
      heardRef.current[i] = true;
      setHeard([...heardRef.current]);
      if (first && heardRef.current.every(Boolean)) {
        // the child's last tap and the word, then the whole word sounded out
        // again ECHOES times; the page is won when the last echo has been said
        echoing.current = true;
        playStarPop();
        burst(rowRef.current);
        const once = [...letters.map(soundOf), sayOf(word)];
        const ids = [soundOf(letters[i]), sayOf(word)];
        for (let k = 0; k < ECHOES; k++) ids.push(...once);
        void playSequenceChecked(ids, ECHO_GAP_MS, (part) => {
          if (!live.current) return;
          setSaying(part === 0 ? i : part === 1 ? 3 : (part - 2) % once.length);
        }).then(() => {
          if (!live.current) return;
          setSaying(-1);
          finish(rowRef.current);
        });
        return;
      }
      void playClip(soundOf(letters[i]));
    },
    [act, burst, finish, isSolved, letters, word]
  );

  const next = heard.findIndex((h) => !h);
  const target = useCallback(() => refs.current[Math.max(next, 0)], [next]);
  const hand = usePageHand({
    armed: p.ready && !p.solved && next >= 0,
    resetKey: `hear-${next}`,
    misses: 0,
    round,
    stageRef: p.stageRef,
    from: target,
    to: target,
  });

  return (
    <Frame page="hear" rp={props} p={p} say={clipText(HEAR)} hand={hand}>
      <div ref={rowRef} className="wbd-row">
        {letters.map((l, i) => (
          <motion.button
            key={l}
            type="button"
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="wbd-slot wbd-slot--tap"
            onClick={() => tap(i)}
            aria-label={`the letter ${l}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...ENTER, delay: 0.15 + i * 0.14 }}
          >
            <Tile
              letter={l}
              cls={`${heard[i] ? "is-heard" : ""} ${saying === i || saying === 3 ? "is-saying" : ""}`}
            />
          </motion.button>
        ))}
      </div>
    </Frame>
  );
}

/* ─── 2 · BUILD IT ─────────────────────────────────────────────────────── */

/** Three empty places and four letters (one does not belong): drag each
 *  letter into its place. A right letter says its sound; the last one says
 *  the word. A wrong one slides home; the right place glows after a miss. */
function BuildPage(props: PageProps) {
  const { word, wi, round } = props;
  const tray = useMemo(() => trayFor(word, wi), [word, wi]);
  const [filled, setFilled] = useState<readonly boolean[]>([false, false, false]);
  const filledRef = useRef<boolean[]>([false, false, false]);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);
  const targets = useRef(new Map<number, HTMLElement>());
  const p = usePage(props, BUILD);

  const { dragging, over, start, ghostRef } = useDragDrop<number, number>({
    root: p.stageRef,
    targets,
    slopPx: 24,
    onDrop: (tile, slot, info) => {
      if (p.isSolved()) return;
      p.act();
      const letter = tray[tile];
      if (!info.moved) {
        void playClip(soundOf(letter));
        return;
      }
      if (slot !== null && !filledRef.current[slot] && word[slot] === letter) {
        filledRef.current[slot] = true;
        setFilled([...filledRef.current]);
        playStarPop();
        if (filledRef.current.every(Boolean)) {
          void playSequence([soundOf(letter), sayOf(word)], WORD_MS);
          p.burst(rowRef.current);
          p.finish(rowRef.current);
        } else void playClip(soundOf(letter));
        return;
      }
      slideBack(p.stageRef.current, tileRefs.current[tile], info);
      if (slot !== null) {
        p.miss();
        void playClip(TRY);
      }
    },
  });
  const used = useCallback(
    (tile: number) => filled[word.indexOf(tray[tile])] === true,
    [filled, tray, word]
  );
  const pick = useCallback(
    (e: React.PointerEvent<HTMLElement>, tile: number) => {
      if (p.isSolved()) return;
      p.act();
      if (start(e, tile)) playPickUpSound();
    },
    [p, start]
  );
  const registerSlot = useCallback((i: number, el: HTMLDivElement | null) => {
    slotRefs.current[i] = el;
    if (el) targets.current.set(i, el);
    else targets.current.delete(i);
  }, []);
  const registerTile = useCallback((i: number, el: HTMLDivElement | null) => {
    tileRefs.current[i] = el;
  }, []);

  // the hand shows the next empty place and the letter that goes in it
  const next = Math.max(
    filled.findIndex((f) => !f),
    0
  );
  const from = useCallback(() => tileRefs.current[tray.indexOf(word[next])], [next, tray, word]);
  const to = useCallback(() => slotRefs.current[next], [next]);
  const hand = usePageHand({
    armed: p.ready && !p.solved && dragging === null,
    resetKey: `build-${next}`,
    misses: p.misses,
    round,
    stageRef: p.stageRef,
    from,
    to,
  });

  return (
    <Frame
      page="build"
      rp={props}
      p={p}
      say={clipText(BUILD)}
      hand={hand}
      ghost={
        dragging !== null && (
          <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
            <span className="ng-carried wbd-carried">
              <Tile letter={tray[dragging]} />
            </span>
          </div>
        )
      }
    >
      <div ref={rowRef} className="wbd-row">
        {word.split("").map((l, i) => (
          <div
            key={l}
            ref={(el) => registerSlot(i, el)}
            className={`wbd-slot wbd-slot--drop ${filled[i] ? "is-filled" : ""} ${
              over === i && !filled[i] ? "is-lit" : ""
            } ${!filled[i] && i === next && p.misses >= 1 ? "is-hint" : ""}`}
            aria-label={`place ${i + 1}`}
          >
            {filled[i] && <Tile letter={l} cls="is-heard" />}
          </div>
        ))}
      </div>
      <div className="wbd-tray">
        {tray.map((l, i) => (
          <div
            key={l}
            ref={(el) => registerTile(i, el)}
            className={`wbd-slot wbd-drag touch-none ${
              dragging === i || (word.includes(l) && used(i)) ? "is-away" : ""
            }`}
            onPointerDown={(e) => pick(e, i)}
            role="button"
            aria-label={`the letter ${l} — drag it into the word`}
          >
            <motion.span
              className="wbd-in"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...ENTER, delay: 0.2 + i * 0.1 }}
            >
              <Tile letter={l} />
            </motion.span>
          </div>
        ))}
      </div>
    </Frame>
  );
}

/* ─── 3 · WHAT'S MISSING ───────────────────────────────────────────────── */

/** The word with one letter gone and three letters to choose from: tap the
 *  one that fits. Wrong: a wiggle and "Try again!"; after a second miss the
 *  right letter pulses. */
function MissingPage(props: PageProps) {
  const { word, wi, round } = props;
  const { at, options } = useMemo(() => missingFor(word, wi), [word, wi]);
  const answer = options.indexOf(word[at]);
  const [found, setFound] = useState(false);
  const [wiggle, setWiggle] = useState<readonly number[]>([0, 0, 0]);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);
  const p = usePage(props, MISSING);
  const { finish, burst, isSolved, act, miss } = p;

  const tap = useCallback(
    (i: number) => {
      if (isSolved()) return;
      act();
      if (i === answer) {
        setFound(true);
        playStarPop();
        void playSequence([soundOf(options[i]), sayOf(word)], WORD_MS);
        burst(rowRef.current);
        finish(rowRef.current);
        return;
      }
      setWiggle((w) => w.map((n, j) => (j === i ? n + 1 : n)));
      miss();
      void playSequence([TRY, MISSING], 200);
    },
    [act, answer, burst, finish, isSolved, miss, options, word]
  );

  const right = useCallback(() => refs.current[answer], [answer]);
  const hand = usePageHand({
    armed: p.ready && !p.solved,
    resetKey: "missing",
    misses: p.misses,
    round,
    stageRef: p.stageRef,
    from: right,
    to: right,
  });

  return (
    <Frame page="missing" rp={props} p={p} say={clipText(MISSING)} hand={hand}>
      <div ref={rowRef} className="wbd-row">
        {word.split("").map((l, i) =>
          i === at && !found ? (
            <div
              key={l}
              className="wbd-slot wbd-slot--drop wbd-slot--gap"
              aria-label="missing letter"
            >
              <span className="wbd-gap font-rounded font-black">?</span>
            </div>
          ) : (
            <div key={l} className="wbd-slot">
              <Tile letter={l} cls={i === at ? "is-heard" : ""} />
            </div>
          )
        )}
      </div>
      <div className="wbd-tray">
        {options.map((l, i) => (
          <motion.button
            key={l}
            type="button"
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={`wbd-slot wbd-slot--tap ${found && i === answer ? "is-away" : ""}`}
            onClick={() => tap(i)}
            aria-label={`the letter ${l}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...ENTER, delay: 0.2 + i * 0.1 }}
          >
            <span key={wiggle[i]} className={`wbd-wiggle ${wiggle[i] > 0 ? "is-wiggling" : ""}`}>
              <Tile letter={l} cls={!found && i === answer && p.misses >= 2 ? "is-pulse" : ""} />
            </span>
          </motion.button>
        ))}
      </div>
    </Frame>
  );
}

/** A lesson's round component, made ONCE per lesson at module level. */
export function makeRound(module: ModuleId) {
  return function WbdRound(props: RoundProps) {
    const { word, wi, step } = pageOf(module, props.round);
    const pp = { ...props, word, wi };
    if (step === "hear") return <HearPage {...pp} />;
    if (step === "build") return <BuildPage {...pp} />;
    return <MissingPage {...pp} />;
  };
}
