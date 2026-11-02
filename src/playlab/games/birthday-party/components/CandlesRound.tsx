"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { playChime, playClickSound, playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence, sayAfter } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, sayNumber, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { PartyWorld } from "@games/birthday-party/components/BdcWorld";
import { CakeArt, Candle, CandleStick } from "@games/birthday-party/components/PartyArt";
import { GuideProvider } from "@games/number-groups/components/NgGuide";
import { CandleGuestContext, CandleGuide } from "@games/birthday-party/components/PartyGuide";
import { useFillDrag, type Seats } from "@games/birthday-party/hooks/useFillDrag";
import { useHandAt, type HandPath } from "@games/birthday-party/hooks/useHandAt";
import { CANDLE_ROUNDS, spotOrder } from "@games/birthday-party/constants/rounds";

const I_AM = "bdc-i-am";
const ASK = "bdc-ask-candles";
const BLOW = "bdc-blow";
const COUNT_AGAIN = "mouse-count-again";

/** Between one candle lighting and the next. */
const LIGHT_EVERY_MS = 420;
/** How long the friend's "I am…" bubble stays up. */
const TALK_MS = 3200;

/** place: candles on and off · check: counting a wrong set · light: the
 *  candles catch one by one · blow: blow them out · won. */
type Phase = "place" | "check" | "light" | "blow" | "won";

const candle = (p: number) => <CandleStick paint={p} />;

/**
 * CANDLES ON THE CAKE — one round (NUMERAL → QUANTITY, then counting down).
 *
 * The birthday friend wears a badge with their age — "I am 3!" Drag candles
 * from the tray onto the big cake (each one is counted as it goes on); tap a
 * candle on the cake to take it off again. "Done!" appears after the first
 * candle. The right number: the candles light one by one, the friend says
 * "Blow them out!", and each tapped flame goes out in a puff while the
 * candles still burning are counted down. The wrong number is never crossed
 * out — it is a set being built: the candles on the cake are counted aloud,
 * the friend shows their badge again, and the child fixes it.
 */
export function CandlesRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = CANDLE_ROUNDS[round];
  const order = useMemo(() => spotOrder(r.candles), [r.candles]);
  const stageRef = useRef<HTMLDivElement>(null);
  const cakeRef = useRef<HTMLDivElement | null>(null);
  const doneRef = useRef<HTMLButtonElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const spotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const checkRun = useRef(0);
  const schedule = useScheduler();
  const [phase, setPhase] = useState<Phase>("place");
  const [lit, setLit] = useState<readonly number[]>([]);
  const [blown, setBlown] = useState<readonly number[]>([]);
  const [counting, setCounting] = useState<number | null>(null);
  const [talking, setTalking] = useState(true);
  /** The number just said, shown big on the cake: candles on it while
   *  placing, candles still burning while blowing (4, 3, 2, 1). */
  const [tally, setTally] = useState<number | null>(null);
  /** A countdown number is being said: the next flame waits for it, so every
   *  number is heard whole instead of cut off by the next tap. */
  const sayingRef = useRef(false);
  const cast = useMemo(
    () => [
      <span key="c" className="ng-cast bdc-cast-candle">
        <CandleStick paint={0} />
      </span>,
      <span key="d" className="ng-cast bdc-cast-candle">
        <CandleStick paint={1} />
      </span>,
    ],
    []
  );
  const { solved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + 4,
    stageRef,
    cast,
    onDone,
  });

  // "I am three!" — then what to do
  useSayOnEnter([I_AM, `number-${r.age}`, ASK]);
  useEffect(() => {
    schedule(() => setTalking(false), TALK_MS);
  }, [schedule]);
  useEffect(
    () => () => {
      checkRun.current++;
    },
    []
  );

  /** The cake is one drop zone: a candle takes the next free spot, from the
   *  middle of the cake outwards. */
  const spotFor = useCallback(
    (_zone: number, seats: Seats) => order.find((k) => seats[k] === null) ?? null,
    [order]
  );

  const drag = useFillDrag({
    stageRef,
    seats: r.candles,
    seatFor: spotFor,
    locked: solved || phase !== "place",
    onPlaced: (_seat, count) => {
      sayNumber(count);
      setTally(count);
    },
  });

  /** The spots with a candle, left to right — the order they are counted in. */
  const onCake = drag.filled.flatMap((p, k) => (p === null ? [] : [k]));

  /** Show the badge again: it bounces, and the friend says their age. */
  const showAge = useCallback(() => {
    badgeRef.current?.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }],
      { duration: 700, easing: "ease-in-out", iterations: 2 }
    );
    setTalking(true);
    schedule(() => setTalking(false), TALK_MS);
  }, [schedule]);

  const done = useCallback(() => {
    if (phase !== "place" || drag.busy || onCake.length === 0) return;
    playClickSound();
    if (onCake.length === r.age) {
      // the right number: they light, one by one, from the left
      setPhase("light");
      onCake.forEach((k, i) =>
        schedule(
          () => {
            setLit((all) => [...all, k]);
            playChime();
          },
          300 + i * LIGHT_EVERY_MS
        )
      );
      schedule(
        () => {
          setPhase("blow");
          setTally(onCake.length);
          void sayAfter(BLOW);
        },
        300 + onCake.length * LIGHT_EVERY_MS + 200
      );
      return;
    }
    // not the right number: count what is there, then show the age again
    playIncorrectSound();
    onMiss();
    setPhase("check");
    const run = ++checkRun.current;
    const spots = [...onCake];
    void playClip(COUNT_AGAIN)
      .then(() =>
        playSequence(
          spots.map((_, i) => `number-${i + 1}`),
          220,
          (i) => {
            if (checkRun.current !== run) return;
            setCounting(spots[i]);
            setTally(i + 1);
          }
        )
      )
      .then(() => {
        if (checkRun.current !== run) return;
        setCounting(null);
        setPhase("place");
        showAge();
        void sayAfter(I_AM);
        void sayAfter(`number-${r.age}`);
      });
  }, [drag.busy, onCake, onMiss, phase, r.age, schedule, showAge]);

  const { filled, remove, registerSeat } = drag;
  const tapSpot = useCallback(
    (k: number) => {
      if (phase === "place") {
        if (filled[k] === null) return;
        remove(k);
        const left = onCake.length - 1;
        if (left > 0) sayNumber(left);
        setTally(left > 0 ? left : null);
        return;
      }
      if (phase !== "blow" || !lit.includes(k) || sayingRef.current) return;
      const stillLit = lit.filter((x) => x !== k);
      setLit(stillLit);
      setBlown((all) => [...all, k]);
      playClickSound();
      if (stillLit.length > 0) {
        setTally(stillLit.length);
        sayingRef.current = true;
        void playClip(`number-${stillLit.length}`).then(() => {
          sayingRef.current = false;
        });
        return;
      }
      setTally(null);
      setPhase("won");
      burst(cakeRef.current);
      playStarPop();
      finish(cakeRef.current);
    },
    [burst, filled, finish, lit, onCake.length, phase, remove]
  );

  const registerSpot = useCallback((k: number, el: HTMLButtonElement | null) => {
    spotRefs.current[k] = el;
  }, []);

  // ── the idle teaching hand ──
  const count = drag.count;
  const nextPiece = Array.from({ length: r.candles }, (_, p) => p).find((p) => !drag.away(p));
  const nextSpot = order.find((k) => drag.filled[k] === null);
  const handKey = `${phase}-${count}-${lit.length}`;
  const hand = useHandAt(
    !solved && !drag.busy && (phase === "place" || phase === "blow"),
    handKey,
    (): HandPath | null => {
      const root = stageRef.current;
      const tap = (el: Element | null | undefined) => {
        const p = centreIn(root, el);
        return { fx: p.x, fy: p.y, tx: p.x, ty: p.y };
      };
      if (phase === "blow") return lit.length > 0 ? tap(spotRefs.current[lit[0]]) : null;
      if (count === r.age) return tap(doneRef.current);
      if (count > r.age) return tap(spotRefs.current[onCake[onCake.length - 1]]);
      if (nextPiece === undefined || nextSpot === undefined) return null;
      const a = centreIn(root, drag.homeEl(nextPiece));
      const b = centreIn(root, spotRefs.current[nextSpot]);
      return { fx: a.x, fy: a.y, tx: b.x, ty: b.y };
    }
  );

  const prompt =
    phase === "check" ? COUNT_AGAIN : phase === "light" || phase === "blow" ? BLOW : ASK;
  const ageLine = clipText(I_AM);
  // the birthday friend is the guide: big in the teacher's corner, their
  // badge on, "I am 3!" in their bubble first and then what to do
  const guest = useMemo(() => ({ who: r.friend, age: r.age, badgeRef }), [r.friend, r.age]);
  const bubble = talking && ageLine ? `${ageLine} ${r.age}!` : clipText(prompt);

  return (
    <CandleGuestContext.Provider value={guest}>
      <GuideProvider guide={CandleGuide}>
        <NgStage
          stageRef={stageRef}
          playClass="bdc-play bdc-play--candles"
          world={<PartyWorld />}
          round={round}
          solved={solved}
          say={say(bubble)}
          title={title}
          onHome={onHome}
          onExitPortal={onExitPortal}
          overlay={
            <>
              {overlay}
              {drag.layer(candle, "bdc-piece--candle")}
              {hand && <TeachingHand key={handKey} {...hand} />}
            </>
          }
        >
          <div className="bdc-candles-board">
            <div className="bdc-friend">
              <div className="bdc-done-slot">
                <AnimatePresence>
                  {phase === "place" && count > 0 && (
                    <motion.button
                      key="done"
                      ref={doneRef}
                      type="button"
                      className="bdc-done font-rounded font-black"
                      onClick={done}
                      aria-label="Done — light the candles"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          d="M5 12.5 L10 17.5 L19 7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Done!
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="bdc-cake-col">
              <div
                ref={(el) => {
                  cakeRef.current = el;
                  drag.registerZone(0, el);
                }}
                className={`bdc-cake ${drag.over === 0 ? "is-lit" : ""}`}
                role="group"
                aria-label={`The cake — ${count} candle${count === 1 ? "" : "s"} on it`}
              >
                <div className="bdc-spots">
                  {Array.from({ length: r.candles }, (_, k) => (
                    <Spot
                      key={k}
                      index={k}
                      piece={drag.filled[k]}
                      shows={drag.shows(k)}
                      lit={lit.includes(k)}
                      blown={blown.includes(k)}
                      counted={counting === k}
                      live={phase === "place" || (phase === "blow" && lit.includes(k))}
                      onTap={tapSpot}
                      registerSpot={registerSpot}
                      registerSeat={registerSeat}
                    />
                  ))}
                </div>
                <CakeArt />
                {tally !== null && (
                  <motion.span
                    key={tally}
                    className="bdc-tally font-rounded font-black"
                    aria-live="polite"
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 15 }}
                  >
                    {tally}
                  </motion.span>
                )}
              </div>

              <div className={`bdc-tray bdc-tray--candles ${phase !== "place" ? "is-done" : ""}`}>
                {Array.from({ length: r.candles }, (_, p) => (
                  <TrayCandle
                    key={p}
                    piece={p}
                    away={drag.away(p)}
                    locked={solved || phase !== "place"}
                    onPick={drag.pickUp}
                    register={drag.registerHome}
                  />
                ))}
              </div>
            </div>
          </div>
        </NgStage>
      </GuideProvider>
    </CandleGuestContext.Provider>
  );
}

/** A place for a candle on the cake — empty, or a candle you can tap. */
const Spot = memo(function Spot({
  index,
  piece,
  shows,
  lit,
  blown,
  counted,
  live,
  onTap,
  registerSpot,
  registerSeat,
}: {
  index: number;
  piece: number | null;
  shows: boolean;
  lit: boolean;
  blown: boolean;
  counted: boolean;
  /** It can be tapped now: taken off (placing) or blown out (blowing). */
  live: boolean;
  onTap: (k: number) => void;
  registerSpot: (k: number, el: HTMLButtonElement | null) => void;
  /** The candle-sized place inside, where a carried candle lands. */
  registerSeat: (k: number, el: HTMLElement | null) => void;
}) {
  const has = piece !== null && shows;
  return (
    <button
      ref={(el) => registerSpot(index, el)}
      type="button"
      className={`bdc-spot ${has ? "has-candle" : ""} ${counted ? "is-counted" : ""}`}
      disabled={!has || !live}
      onClick={has && live ? () => onTap(index) : undefined}
      aria-label={
        !has ? "An empty place on the cake" : lit ? "Blow out this candle" : "Take this candle off"
      }
    >
      <span ref={(el) => registerSeat(index, el)} className="bdc-spot-seat">
        {has && <Candle paint={piece} lit={lit} blown={blown} />}
      </span>
    </button>
  );
});

const TrayCandle = memo(function TrayCandle({
  piece,
  away,
  locked,
  onPick,
  register,
}: {
  piece: number;
  away: boolean;
  locked: boolean;
  onPick: (e: React.PointerEvent<HTMLElement>, piece: number) => void;
  register: (p: number, el: HTMLElement | null) => void;
}) {
  return (
    <button
      type="button"
      className={`bdc-piece bdc-candle-btn touch-none ${away ? "is-away" : ""}`}
      disabled={locked || away}
      onPointerDown={away || locked ? undefined : (e) => onPick(e, piece)}
      aria-label="A candle — drag it onto the cake"
    >
      {/* the home is the candle itself, not the wider button, so a candle
          flies onto the cake at its own size */}
      <span ref={(el) => register(piece, el)} className="bdc-piece--candle">
        <CandleStick paint={piece} />
      </span>
    </button>
  );
});
