"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playClickSound, playIncorrectSound, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence } from "@shared/audio/voice";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { Thing } from "@games/number-groups/components/SumParts";
import { CabinWorld } from "@games/plane-seats/components/CabinWorld";
import {
  BigWindow,
  ChoiceCard,
  EyeGlyph,
  FlyPast,
} from "@games/plane-snacks/components/WindowParts";
import {
  AGAIN_CLIP,
  ASK_FLYER,
  FACES_RIGHT,
  LOOK_CLIP,
  WINDOW_ROUNDS,
} from "@games/plane-snacks/constants/rounds";

/** One fly-past across the window: slow (rounds 1–2), quick (rounds 3–4),
 *  and the happy wave once it has been found. */
const SLOW_MS = 3400;
const FAST_MS = 1900;
const HAPPY_MS = 2600;
/** From "Watch carefully!" to the fly-past. */
const LOOK_MS = 1500;

/**
 * wait  — "Watch carefully!", nothing to tap yet
 * fly   — something is flying past (the pictures wait, if they are out)
 * ask   — "Which one now?": tap a picture, or Look again
 * happy — found: it flies past again, slowly, waving
 */
type Phase = "wait" | "fly" | "ask" | "happy";

/**
 * ONE ROUND OF WINDOW SPY — three sightings.
 *
 * "Watch carefully!" Something flies past outside, right to left. Then
 * "Which one now?" and three pictures pop up: the right one makes it come
 * back and wave past the window (the round's cheer does the praising). A wrong one
 * shakes, "Try again!", the right one glows. "Look again" flies it past
 * once more, at no cost. After the third sighting the round is won.
 */
export function WindowRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = WINDOW_ROUNDS[round];
  const stageRef = useRef<HTMLDivElement>(null);
  const winRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const schedule = useScheduler();
  const [sight, setSight] = useState(0);
  const [phase, setPhase] = useState<Phase>("wait");
  /** Bumped for every fly-past: a new key flies it again. */
  const [flight, setFlight] = useState(0);
  /** The pictures are out (after the first fly-past of a sighting). */
  const [shown, setShown] = useState(false);
  const [misses, setMisses] = useState(0);
  const [shakes, setShakes] = useState<Readonly<Record<number, number>>>({});
  /** Set the moment something starts, so two quick taps never start two. */
  const busyRef = useRef(true);

  const s = r.sightings[sight];
  const rightAt = s.choices.indexOf(s.flyer);
  const flyMs = r.fast ? FAST_MS : SLOW_MS;

  const cast = useMemo(
    () =>
      r.sightings.map((x) => (
        <span key={x.flyer} className="ng-cast">
          <Thing id={x.flyer} />
        </span>
      )),
    [r.sightings]
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + 59,
    stageRef,
    cast,
    onDone,
  });

  /** Fly it past, then ask (again). */
  const flyThenAsk = useCallback(() => {
    busyRef.current = true;
    setFlight((f) => f + 1);
    setPhase("fly");
    schedule(() => {
      busyRef.current = false;
      setShown(true);
      setPhase("ask");
      void playSequence([ASK_FLYER]);
    }, flyMs + 200);
  }, [flyMs, schedule]);

  // every sighting: "Watch carefully!", then the fly-past
  useEffect(() => {
    busyRef.current = true;
    const t = setTimeout(
      () => {
        void playSequence([LOOK_CLIP]);
        schedule(flyThenAsk, LOOK_MS);
      },
      sight === 0 ? 500 : 0
    );
    return () => clearTimeout(t);
  }, [sight, schedule, flyThenAsk]);

  const lookAgain = useCallback(() => {
    if (busyRef.current || phase !== "ask" || isSolved()) return;
    playClickSound();
    void playClip(AGAIN_CLIP);
    flyThenAsk();
  }, [phase, isSolved, flyThenAsk]);

  const pick = useCallback(
    (i: number) => {
      if (busyRef.current || phase !== "ask" || isSolved()) return;
      if (i !== rightAt) {
        playIncorrectSound();
        void playClip("instr-try-again");
        setShakes((m) => ({ ...m, [i]: (m[i] ?? 0) + 1 }));
        setMisses((m) => m + 1);
        onMiss();
        return;
      }
      busyRef.current = true;
      playStarPop();
      burst(cardRefs.current[i]);
      setFlight((f) => f + 1);
      setPhase("happy");
      schedule(() => {
        if (sight + 1 === r.sightings.length) {
          finish(winRef.current);
          return;
        }
        setMisses(0);
        setShakes({});
        setShown(false);
        setPhase("wait");
        setSight(sight + 1);
      }, HAPPY_MS + 250);
    },
    [phase, isSolved, rightAt, onMiss, burst, schedule, sight, r.sightings.length, finish]
  );

  // the idle hand (and a miss) points at the right picture
  const asking = phase === "ask" && !solved;
  const idle = useIdleHand(asking, `${sight}-${misses}`);
  const hint = asking && (idle || misses > 0);
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!idle) return;
    const raf = requestAnimationFrame(() =>
      setHand(centreIn(stageRef.current, cardRefs.current[rightAt]))
    );
    return () => cancelAnimationFrame(raf);
  }, [idle, rightAt]);

  const happy = phase === "happy";
  const flying = phase === "fly" || happy;
  /** The guide bar's line: "Watch carefully!" until the first fly-past is
   *  over, "Look again!" while it flies past again, then the question — or
   *  "Try again!" after a wrong picture, until the right one is tapped. */
  const line =
    phase === "wait" || (phase === "fly" && !shown)
      ? LOOK_CLIP
      : phase === "fly"
        ? AGAIN_CLIP
        : phase === "ask" && misses > 0
          ? "instr-try-again"
          : ASK_FLYER;

  return (
    <NgStage
      stageRef={stageRef}
      playClass="psn-play psn-play--window"
      world={<CabinWorld />}
      round={round}
      solved={solved}
      say={say(clipText(line))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {idle && hand && <TeachingHand fx={hand.x} fy={hand.y} tx={hand.x} ty={hand.y} />}
        </>
      }
    >
      <div className="psn-spy">
        <BigWindow
          winRef={winRef}
          below={
            shown &&
            !happy &&
            !solved && (
              <button
                type="button"
                className={`psn-again font-rounded font-black ${asking ? "psn-again--live" : ""}`}
                onClick={lookAgain}
                disabled={!asking}
              >
                <EyeGlyph />
                <span>{clipText(AGAIN_CLIP)}</span>
              </button>
            )
          }
        >
          {flight > 0 && (flying || phase === "ask") && (
            <FlyPast
              id={s.flyer}
              flightKey={flight}
              ms={happy ? HAPPY_MS : flyMs}
              mirror={FACES_RIGHT.has(s.flyer)}
              climb={FACES_RIGHT.has(s.flyer)}
              happy={happy}
            />
          )}
        </BigWindow>

        <div className="psn-choices">
          {shown &&
            s.choices.map((id, i) => (
              <ChoiceCard
                key={`${sight}-${id}`}
                id={id}
                index={i}
                live={asking}
                hint={hint && i === rightAt}
                right={happy && i === rightAt}
                shake={shakes[i] ?? 0}
                onTap={() => pick(i)}
                cardRef={(el) => {
                  cardRefs.current[i] = el;
                }}
              />
            ))}
        </div>
      </div>
    </NgStage>
  );
}
