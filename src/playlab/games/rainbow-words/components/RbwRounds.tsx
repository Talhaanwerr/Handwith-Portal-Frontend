"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence, playSequenceChecked } from "@shared/audio/voice";
import { cssVars } from "@shared/styles/cssVars";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { usePlayPage } from "@games/number-groups/components/usePlayPage";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { Picture } from "@games/blend-read/components/PictureArt";
import { usePageHand } from "@games/word-lesson/components/usePage";
import { WordPicture } from "@games/cvc-match/components/WordPicture";
import { RbwWorld } from "@games/rainbow-words/components/RbwWorld";
import {
  CATCH,
  FILL,
  FIND,
  LESSONS,
  MEET,
  TAP,
  TRY,
  catchClouds,
  fillOptions,
  findOptions,
  pageOf,
  printed,
  sayOf,
  sentenceClip,
  sentenceText,
  type Lesson,
  type ModuleId,
} from "@games/rainbow-words/constants/rounds";

type PageProps = RoundProps & { id: ModuleId; lesson: Lesson; i: number };

const ENTER = { type: "spring", stiffness: 240, damping: 17 } as const;
const CAST = [0, 1, 2].map((k) => (
  <span key={k} className="ng-cast">
    <Picture id="star" />
  </span>
));

/**
 * What every page shares (the kit's `usePlayPage`): the stage, the
 * celebration — raining stars — the misses, and the page's opening lines.
 */
function usePage({ round, onDone, onMiss }: PageProps, lines: readonly string[]) {
  const [intro] = useState(() => [...lines]);
  return usePlayPage({ round, intro, cast: CAST, onDone, onMiss });
}

/** The frame round every page: the meadow in the lesson's colours. */
function Frame({
  page,
  rp,
  p,
  say,
  hand,
  children,
}: {
  page: string;
  rp: PageProps;
  p: ReturnType<typeof usePage>;
  say: string;
  hand: { fx: number; fy: number; tx: number; ty: number } | null;
  children: ReactNode;
}) {
  return (
    <NgStage
      stageRef={p.stageRef}
      playClass={`rbw-play rbw-play--${page}`}
      world={<RbwWorld lesson={rp.id} />}
      round={rp.round}
      solved={p.solved}
      say={p.say(say)}
      title={rp.title}
      onHome={rp.onHome}
      onExitPortal={rp.onExitPortal}
      overlay={
        <>
          {p.overlay}
          {hand && <TeachingHand fx={hand.fx} fy={hand.fy} tx={hand.tx} ty={hand.ty} />}
        </>
      }
    >
      <div
        className={`rbw-board rbw-board--${page}`}
        style={cssVars({ "--rbw-accent": rp.lesson.accent, "--rbw-edge": rp.lesson.edge })}
      >
        {children}
      </div>
    </NgStage>
  );
}

/** A word on its card; wiggles when it was the wrong one. */
function WordCard({ word, cls = "", wiggle = 0 }: { word: string; cls?: string; wiggle?: number }) {
  return (
    <span key={wiggle} className={`rbw-wiggle ${wiggle > 0 ? "is-wiggling" : ""}`}>
      <span className={`rbw-word font-rounded font-black ${cls}`}>{word}</span>
    </span>
  );
}

/* ─── 1 · MEET ─────────────────────────────────────────────────────────── */

/** The word on one big card: "This word is see." Tap it to hear it; the card
 *  says the word twice more, bouncing each time, and the page is won. */
function MeetPage(props: PageProps) {
  const { lesson, i, round } = props;
  const word = lesson.words[i];
  const cardRef = useRef<HTMLButtonElement>(null);
  const [beat, setBeat] = useState(0);
  const busy = useRef(false);
  const live = useRef(true);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);
  const p = usePage(props, [MEET, sayOf(word), TAP]);
  const { finish, burst, isSolved, act } = p;

  const tap = useCallback(() => {
    if (isSolved() || busy.current) return;
    act();
    busy.current = true;
    playStarPop();
    burst(cardRef.current);
    const clip = sayOf(word);
    void playSequenceChecked([clip, clip, clip], 380, () => {
      if (live.current) setBeat((n) => n + 1);
    }).then(() => {
      if (live.current) finish(cardRef.current);
    });
  }, [act, burst, finish, isSolved, word]);

  const target = useCallback(() => cardRef.current, []);
  const hand = usePageHand({
    armed: p.ready && !p.solved && beat === 0,
    resetKey: "meet",
    misses: 0,
    round,
    stageRef: p.stageRef,
    from: target,
    to: target,
  });

  return (
    <Frame
      page="meet"
      rp={props}
      p={p}
      say={`${clipText(MEET)} ${word}. ${clipText(TAP)}`}
      hand={hand}
    >
      <motion.button
        type="button"
        ref={cardRef}
        className="rbw-slot rbw-slot--big"
        onClick={tap}
        aria-label={`the word ${word}`}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={ENTER}
      >
        <span key={beat} className={`rbw-bounce ${beat > 0 ? "is-bouncing" : ""}`}>
          <span className={`rbw-word font-rounded font-black ${beat > 0 ? "is-found" : ""}`}>
            {word}
          </span>
        </span>
      </motion.button>
    </Frame>
  );
}

/* ─── 2 · FIND and 3 · CATCH ───────────────────────────────────────────── */

/** Word cards (FIND: three, one right) or clouds (CATCH: six, three right):
 *  tap every card that shows the word. Wrong: a wiggle and "Try again!";
 *  after a second miss a right one pulses and the hand shows it. */
function PickPage(props: PageProps & { clouds?: boolean }) {
  const { lesson, i, round, clouds = false } = props;
  const word = lesson.words[i];
  const cards = useMemo(
    () => (clouds ? catchClouds(lesson, i) : findOptions(lesson, i)),
    [clouds, lesson, i]
  );
  const ask = clouds ? CATCH : FIND;
  const [found, setFound] = useState<readonly boolean[]>(() => cards.map(() => false));
  const foundRef = useRef<boolean[]>(cards.map(() => false));
  const [wiggle, setWiggle] = useState<readonly number[]>(() => cards.map(() => 0));
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const rowRef = useRef<HTMLDivElement>(null);
  const p = usePage(props, [ask, sayOf(word)]);
  const { finish, burst, isSolved, act, miss } = p;

  const tap = useCallback(
    (k: number) => {
      if (isSolved() || foundRef.current[k]) return;
      act();
      if (cards[k] === word) {
        foundRef.current[k] = true;
        setFound([...foundRef.current]);
        playStarPop();
        void playClip(sayOf(word));
        burst(refs.current[k]);
        if (cards.every((c, j) => c !== word || foundRef.current[j])) finish(rowRef.current);
        return;
      }
      setWiggle((w) => w.map((n, j) => (j === k ? n + 1 : n)));
      miss();
      void playSequence([TRY, ask, sayOf(word)], 200);
    },
    [act, ask, burst, cards, finish, isSolved, miss, word]
  );

  const next = cards.findIndex((c, k) => c === word && !found[k]);
  const target = useCallback(() => refs.current[Math.max(next, 0)], [next]);
  const hand = usePageHand({
    armed: p.ready && !p.solved && next >= 0,
    resetKey: `pick-${next}`,
    misses: p.misses,
    round,
    stageRef: p.stageRef,
    from: target,
    to: target,
  });

  return (
    <Frame
      page={clouds ? "catch" : "find"}
      rp={props}
      p={p}
      say={`${clipText(ask)} ${word}!`}
      hand={hand}
    >
      <div ref={rowRef} className={clouds ? "rbw-sky" : "rbw-row"}>
        {cards.map((c, k) => (
          <motion.button
            // a word can be on several clouds: its place is its identity
            key={k}
            type="button"
            ref={(el) => {
              refs.current[k] = el;
            }}
            className={`rbw-slot ${clouds ? "rbw-slot--cloud" : ""}`}
            onClick={() => tap(k)}
            aria-label={`the word ${c}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...ENTER, delay: 0.1 + k * 0.08 }}
          >
            <WordCard
              word={c}
              wiggle={wiggle[k]}
              cls={`${clouds ? "rbw-word--cloud" : ""} ${found[k] ? "is-found" : ""} ${
                !found[k] && k === next && p.misses >= 2 ? "is-pulse" : ""
              }`}
            />
          </motion.button>
        ))}
      </div>
    </Frame>
  );
}

/* ─── 4 · FILL ─────────────────────────────────────────────────────────── */

/** A sentence with one word gone, and its picture: tap the word that fits.
 *  The word drops into the gap and the whole sentence is read out. */
function FillPage(props: PageProps) {
  const { id, lesson, i, round } = props;
  const sentence = lesson.sentences[i];
  const shown = useMemo(() => printed(sentence), [sentence]);
  const options = useMemo(() => fillOptions(lesson, i), [lesson, i]);
  const right = sentence.words[sentence.gap].toLowerCase();
  const answer = options.findIndex((w) => w.toLowerCase() === right);
  const [done, setDone] = useState(false);
  const [wiggle, setWiggle] = useState<readonly number[]>([0, 0, 0]);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const lineRef = useRef<HTMLDivElement>(null);
  const live = useRef(true);
  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);
  const p = usePage(props, [FILL]);
  const { finish, burst, isSolved, act, miss } = p;
  const busy = useRef(false);

  const tap = useCallback(
    (k: number) => {
      if (isSolved() || busy.current) return;
      act();
      if (k === answer) {
        busy.current = true;
        setDone(true);
        playStarPop();
        burst(lineRef.current);
        // the page is won once the whole sentence has been read out
        void playSequenceChecked([sentenceClip(id, i)], 0).then(() => {
          if (live.current) finish(lineRef.current);
        });
        return;
      }
      setWiggle((w) => w.map((n, j) => (j === k ? n + 1 : n)));
      miss();
      void playSequence([TRY, FILL], 200);
    },
    [act, answer, burst, finish, i, id, isSolved, miss]
  );

  const target = useCallback(() => refs.current[answer], [answer]);
  const hand = usePageHand({
    armed: p.ready && !p.solved && !done,
    resetKey: "fill",
    misses: p.misses,
    round,
    stageRef: p.stageRef,
    from: target,
    to: target,
  });

  return (
    <Frame
      page="fill"
      rp={props}
      p={p}
      say={done ? sentenceText(sentence) : clipText(FILL)}
      hand={hand}
    >
      <div className="rbw-top">
        <motion.div
          className="rbw-picture"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={ENTER}
        >
          <WordPicture word={sentence.picture} />
        </motion.div>
        <div ref={lineRef} className="rbw-line font-rounded font-black">
          {shown.map((w, k) =>
            k === sentence.gap ? (
              <span key={`${w}-${k}`} className={`rbw-gap ${done ? "is-filled" : ""}`}>
                {done ? w : ""}
              </span>
            ) : (
              <span key={`${w}-${k}`} className="rbw-token">
                {w}
              </span>
            )
          )}
          <span className="rbw-token rbw-token--stop">.</span>
        </div>
      </div>
      <div className="rbw-row rbw-row--options">
        {options.map((w, k) => (
          <motion.button
            key={w}
            type="button"
            ref={(el) => {
              refs.current[k] = el;
            }}
            className={`rbw-slot ${done && k === answer ? "is-away" : ""}`}
            onClick={() => tap(k)}
            aria-label={`the word ${w}`}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...ENTER, delay: 0.2 + k * 0.1 }}
          >
            <WordCard
              word={w}
              wiggle={wiggle[k]}
              cls={!done && k === answer && p.misses >= 2 ? "is-pulse" : ""}
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
  return function RbwRound(props: RoundProps) {
    const { step, i } = pageOf(props.round);
    const pp = { ...props, id, lesson, i };
    if (step === "meet") return <MeetPage {...pp} />;
    if (step === "find") return <PickPage {...pp} />;
    if (step === "catch") return <PickPage {...pp} clouds />;
    return <FillPage {...pp} />;
  };
}
