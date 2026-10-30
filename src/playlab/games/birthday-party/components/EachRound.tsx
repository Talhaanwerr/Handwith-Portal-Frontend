"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence, sayAfter } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { Picture } from "@games/blend-read/components/PictureArt";
import { PlateArt } from "@games/sesame-activities/components/SesameArt";
import { CrossMark } from "@games/math-maze/components/CrossMark";
import { shake } from "@games/find-the-mouse/utils/shake";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, sayNumber, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { PartyTable, PartyWorld } from "@games/birthday-party/components/BdcWorld";
import { GuestHead } from "@games/birthday-party/components/PartyArt";
import { useFillDrag, type Seats } from "@games/birthday-party/hooks/useFillDrag";
import { useHandAt, type HandPath } from "@games/birthday-party/hooks/useHandAt";
import { EACH_ROUNDS, cupcakesWanted, type GuestId } from "@games/birthday-party/constants/rounds";

const ASK = "bdc-ask-each";
const HAS_ONE = "bdc-has-one";
const EVERYONE = "bdc-everyone";
const HOW_MANY = "bdc-how-many";
const COUNT_AGAIN = "mouse-count-again";

/** From the last cupcake down to the question. */
const ASK_AFTER_MS = 900;

/** fill: cupcakes onto plates · full: everyone has one · ask: how many? */
type Phase = "fill" | "full" | "ask";

/** A plate takes one cupcake: a drop on plate k fills plate k, if empty. */
const plateFor = (zone: number, seats: Seats) => (seats[zone] === null ? zone : null);

const cupcake = () => <Picture id="cupcake" />;

/**
 * ONE FOR EACH — one round (ONE-TO-ONE, then NUMERAL → QUANTITY).
 *
 * Two to five friends sit at the party table in party hats, an empty plate
 * in front of each. The tray holds more cupcakes than there are friends.
 * Drag one cupcake onto each plate: the count is said as each lands (one,
 * two, three…) and the friend hops. A plate already full sends a second
 * cupcake gently home. When every friend has one — "Everyone has one!" —
 * the spare cupcakes go away and three big numbers ask how many there are;
 * a wrong number is crossed out and the cupcakes are counted again aloud.
 */
export function EachRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = EACH_ROUNDS[round];
  const n = cupcakesWanted(r);
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const choiceRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const countRun = useRef(0);
  const schedule = useScheduler();
  const [phase, setPhase] = useState<Phase>("fill");
  const [wrong, setWrong] = useState<readonly number[]>([]);
  /** The plate being counted aloud after a wrong number, if any. */
  const [counting, setCounting] = useState<number | null>(null);
  const cast = useMemo(
    () => [
      <span key="c" className="ng-cast">
        <Picture id="cupcake" />
      </span>,
      <span key="g" className="ng-cast bdc-cast-head">
        <GuestHead who={r.guests[0]} paint={0} />
      </span>,
    ],
    [r.guests]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round,
    stageRef,
    cast,
    onDone,
  });

  useSayOnEnter([ASK]);

  const onPlaced = useCallback(
    (_seat: number, count: number, plate: HTMLElement | undefined) => {
      burst(plate);
      sayNumber(count);
      if (count < n) return;
      setPhase("full");
      void sayAfter(EVERYONE);
      void sayAfter(HOW_MANY);
      schedule(() => setPhase("ask"), ASK_AFTER_MS);
    },
    [burst, n, schedule]
  );

  const drag = useFillDrag({
    stageRef,
    seats: n,
    seatFor: plateFor,
    locked: solved || phase !== "fill",
    onPlaced,
    onBounce: (zone) => {
      // a second cupcake on a full plate: the one there wiggles, this one
      // glides home, and the teacher says why
      shake(drag.seatEl(zone) ?? null);
      void playClip(HAS_ONE);
      onMiss();
    },
  });

  /** Count the cupcakes again, aloud, each plate glowing as it is counted. */
  const recount = useCallback(() => {
    const run = ++countRun.current;
    const numbers = Array.from({ length: n }, (_, k) => `number-${k + 1}`);
    void playClip(COUNT_AGAIN)
      .then(() =>
        playSequence(numbers, 220, (k) => {
          if (countRun.current === run) setCounting(k);
        })
      )
      .then(() => {
        if (countRun.current === run) setCounting(null);
      });
  }, [n]);

  useEffect(
    () => () => {
      countRun.current++;
    },
    []
  );

  const pick = useCallback(
    (v: number) => {
      if (isSolved() || phase !== "ask" || wrong.includes(v)) return;
      if (v === n) {
        countRun.current++;
        setCounting(null);
        burst(choiceRefs.current[r.choices.indexOf(v)]);
        playStarPop();
        sayNumber(v);
        finish(boardRef.current);
        return;
      }
      playIncorrectSound();
      setWrong([...wrong, v]);
      onMiss();
      recount();
    },
    [burst, finish, isSolved, n, onMiss, phase, r.choices, recount, wrong]
  );

  const registerChoice = useCallback((i: number, el: HTMLButtonElement | null) => {
    choiceRefs.current[i] = el;
  }, []);

  // ── the idle teaching hand: a cupcake to the first empty plate, or a tap
  // on the right number ──
  const firstFree = drag.filled.indexOf(null);
  const nextPiece = Array.from({ length: r.cupcakes }, (_, p) => p).find((p) => !drag.away(p));
  const handKey = `${phase}-${drag.count}-${wrong.length}`;
  const hand = useHandAt(
    !solved && !drag.busy && counting === null && phase !== "full",
    handKey,
    (): HandPath | null => {
      const root = stageRef.current;
      if (phase === "ask") {
        const p = centreIn(root, choiceRefs.current[r.choices.indexOf(n)]);
        return { fx: p.x, fy: p.y, tx: p.x, ty: p.y };
      }
      if (firstFree < 0 || nextPiece === undefined) return null;
      const a = centreIn(root, drag.homeEl(nextPiece));
      const b = centreIn(root, drag.zoneEl(firstFree));
      return { fx: a.x, fy: a.y, tx: b.x, ty: b.y };
    }
  );

  const prompt =
    phase === "fill"
      ? ASK
      : phase === "full"
        ? EVERYONE
        : counting !== null
          ? COUNT_AGAIN
          : HOW_MANY;

  return (
    <NgStage
      stageRef={stageRef}
      playClass="bdc-play bdc-play--each"
      world={<PartyWorld />}
      round={round}
      solved={solved}
      say={say(clipText(prompt))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {drag.layer(cupcake, "bdc-piece--cupcake")}
          {hand && <TeachingHand key={handKey} {...hand} />}
        </>
      }
    >
      <div ref={boardRef} className="bdc-each-board" style={cssVars({ "--bdc-n": n })}>
        <div className="bdc-party">
          <PartyTable />
          <div className="bdc-seats">
            {r.guests.map((g, k) => (
              <Seat
                key={g}
                index={k}
                who={g}
                full={drag.filled[k] !== null}
                shows={drag.shows(k)}
                lit={drag.over === k && drag.filled[k] === null}
                counted={counting === k}
                registerZone={drag.registerZone}
                registerSeat={drag.registerSeat}
              />
            ))}
          </div>
        </div>

        <div className="bdc-under">
          {phase === "ask" ? (
            <div className="bdc-choices">
              {r.choices.map((v, i) => (
                <NumberButton
                  key={v}
                  index={i}
                  value={v}
                  right={solved && v === n}
                  wrong={wrong.includes(v)}
                  live={!solved}
                  onPick={pick}
                  register={registerChoice}
                />
              ))}
            </div>
          ) : (
            <div className={`bdc-tray ${phase === "full" ? "is-done" : ""}`}>
              {Array.from({ length: r.cupcakes }, (_, p) => (
                <TrayCupcake
                  key={p}
                  piece={p}
                  away={drag.away(p)}
                  locked={solved || phase !== "fill"}
                  onPick={drag.pickUp}
                  register={drag.registerHome}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </NgStage>
  );
}

/** One friend at the table: their head behind it, their plate on it. */
const Seat = memo(function Seat({
  index,
  who,
  full,
  shows,
  lit,
  counted,
  registerZone,
  registerSeat,
}: {
  index: number;
  who: GuestId;
  /** A cupcake is on this plate (or on its way). */
  full: boolean;
  /** …and has landed. */
  shows: boolean;
  /** A carried cupcake is over this empty plate. */
  lit: boolean;
  /** Being counted aloud. */
  counted: boolean;
  registerZone: (k: number, el: HTMLElement | null) => void;
  registerSeat: (k: number, el: HTMLElement | null) => void;
}) {
  return (
    <div className="bdc-seat">
      <motion.span
        className="bdc-seat-head"
        animate={full ? { y: ["0%", "-9%", "0%"] } : { y: "0%" }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <GuestHead who={who} paint={index} />
      </motion.span>
      <span
        ref={(el) => registerZone(index, el)}
        className={`bdc-plate ${lit ? "is-lit" : ""} ${full ? "is-full" : ""} ${
          counted ? "is-counted" : ""
        }`}
        role="group"
        aria-label={full ? `The ${who}'s plate has a cupcake` : `The ${who}'s plate is empty`}
      >
        <span className="bdc-plate-dish">
          <PlateArt />
        </span>
        <span ref={(el) => registerSeat(index, el)} className="bdc-plate-cake">
          {shows && <Picture id="cupcake" />}
        </span>
      </span>
    </div>
  );
});

const TrayCupcake = memo(function TrayCupcake({
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
      ref={(el) => register(piece, el)}
      type="button"
      className={`bdc-piece bdc-piece--cupcake touch-none ${away ? "is-away" : ""}`}
      disabled={locked || away}
      onPointerDown={away || locked ? undefined : (e) => onPick(e, piece)}
      aria-label="A cupcake — drag it onto a plate"
    >
      <Picture id="cupcake" />
    </button>
  );
});

/** One big number to choose at the end. */
const NumberButton = memo(function NumberButton({
  index,
  value,
  right,
  wrong,
  live,
  onPick,
  register,
}: {
  index: number;
  value: number;
  right: boolean;
  wrong: boolean;
  live: boolean;
  onPick: (v: number) => void;
  register: (i: number, el: HTMLButtonElement | null) => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (wrong) shake(ref.current);
  }, [wrong]);
  const can = live && !wrong;
  return (
    <motion.button
      ref={(el) => {
        ref.current = el;
        register(index, el);
      }}
      type="button"
      className={`bdc-num font-rounded font-black ${right ? "is-right" : ""} ${
        wrong ? "is-wrong" : ""
      }`}
      disabled={!can}
      onClick={can ? () => onPick(value) : undefined}
      aria-label={`${value}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.28, ease: "easeOut" }}
    >
      {value}
      {wrong && (
        <span className="ng-cross" aria-hidden="true">
          <CrossMark />
        </span>
      )}
    </motion.button>
  );
});
