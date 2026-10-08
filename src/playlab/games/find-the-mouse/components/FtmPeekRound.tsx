"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playCorrectSound, playIncorrectSound, playKnockSound } from "@shared/audio/sfx";
import { playClip, sayAfter, clipText, stopVoice } from "@shared/audio/voice";
import { Burrow, type HeadState } from "@games/find-the-mouse/components/Burrow";
import { FtmStage } from "@games/find-the-mouse/components/FtmStage";
import { BURROWS, peekBurrow, peekClue, peekMs } from "@games/find-the-mouse/constants/scene";

/** Beats of a round, in ms. READY lets the screen finish arriving before the
 *  mouse shows (the first build peeked during the cross-fade and the child
 *  saw it for a fraction of a second); SOLVED holds the celebration. */
const READY_MS = 900;
const SOLVED_MS = 1500;
/** The beat useSayOnEnter waits before a screen's first line. */
const SAY_MS = 450;
/** A child who has not tapped a hole for this long hears the nudge, once. */
const IDLE_MS = 7000;

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type Phase = "ready" | "peek" | "ask" | "solved";

interface FtmPeekRoundProps {
  round: number;
  onFound: () => void;
  onMiss: () => void;
  onHome: () => void;
  onExitPortal: () => void;
}

/**
 * PEEK-A-MOUSE — one round.
 *
 * ready → the mouse pokes its head out of one hole (peek) → it ducks back in,
 * leaving a clue showing (its tail, its ears, or a foot — `peekClue`), and
 * every hole starts to pulse (ask) → the child taps a hole. The right hole
 * and the mouse jumps out with a burst; a wrong hole is crossed out and can't
 * be tapped again (GAME_DEV's wrong-answer rule), so the choices narrow and
 * every round ends in a find. Remounted per round (keyed by round).
 */
export function FtmPeekRound({ round, onFound, onMiss, onHome, onExitPortal }: FtmPeekRoundProps) {
  const target = useMemo(() => peekBurrow(round), [round]);
  const clue = peekClue(round);
  const [phase, setPhase] = useState<Phase>("ready");
  const [wrong, setWrong] = useState<readonly number[]>([]);
  /** False once the round is left (Back, Back to Games, unmount): a line that
   *  ends after that must not move a round nobody is looking at. */
  const live = useRef(true);
  /** "Squeak! You found me!" — the round moves on once it has been said. */
  const found = useRef<Promise<void>>(Promise.resolve());
  const nudged = useRef(false);

  useEffect(() => {
    live.current = true;
    return () => {
      live.current = false;
    };
  }, []);

  // "Watch the mouse!" first, and the mouse waits for it: on the first round
  // the mode card's line is still playing, and a peek under it went unheard.
  // The hide timer starts only once the peek has begun. The first round opens
  // at the same moment the shared background music is synthesised on the main
  // thread (a second or two on a phone); timed from mount, the mouse's whole
  // window could elapse inside that stall and it would barely be seen.
  useEffect(() => {
    let cancelled = false;
    let hide: ReturnType<typeof setTimeout> | undefined;
    const said = wait(SAY_MS).then(() => (cancelled ? undefined : sayAfter("mouse-watch")));
    void Promise.all([wait(READY_MS), said]).then(() => {
      if (cancelled || !live.current) return;
      setPhase("peek");
      playKnockSound();
      hide = setTimeout(() => {
        if (!live.current) return;
        setPhase("ask");
        void sayAfter("mouse-where");
      }, peekMs(round));
    });
    return () => {
      cancelled = true;
      clearTimeout(hide);
    };
  }, [round]);

  // One quiet nudge if the holes pulse and nothing is tapped; a wrong tap
  // starts the wait again.
  useEffect(() => {
    if (phase !== "ask" || nudged.current) return;
    const t = setTimeout(() => {
      if (!live.current) return;
      nudged.current = true;
      void sayAfter("mouse-idle-peek");
    }, IDLE_MS);
    return () => clearTimeout(t);
  }, [phase, wrong]);

  // Hold the find for SOLVED_MS — longer if the mouse is still squeaking, so
  // the next round never cuts its line off.
  useEffect(() => {
    if (phase !== "solved") return;
    let cancelled = false;
    void Promise.all([wait(SOLVED_MS), found.current]).then(() => {
      if (!cancelled && live.current) onFound();
    });
    return () => {
      cancelled = true;
      stopVoice();
    };
  }, [phase, onFound]);

  const tap = useCallback(
    (i: number) => {
      if (i === target) {
        playCorrectSound();
        found.current = playClip("mouse-found-me");
        setPhase("solved");
        return;
      }
      playIncorrectSound();
      void playClip("mouse-wrong-hole");
      setWrong((w) => (w.includes(i) ? w : [...w, i]));
      onMiss();
    },
    [target, onMiss]
  );

  /** Leaving mid-round: silence now, and nothing queued may follow. */
  const leave = (fn: () => void) => () => {
    live.current = false;
    stopVoice();
    fn();
  };

  const say =
    phase === "ask"
      ? clipText("mouse-where")
      : phase === "solved"
        ? clipText("mouse-found-me")
        : clipText("mouse-watch");

  const headFor = (i: number): HeadState => {
    if (i !== target) return "in";
    if (phase === "peek") return "out";
    if (phase === "solved") return "popped";
    if (phase === "ask" && clue === "ears") return "peek";
    return "in";
  };

  return (
    <FtmStage
      mode="peek"
      round={round}
      say={say}
      cheer={phase === "solved"}
      onHome={leave(onHome)}
      onExitPortal={leave(onExitPortal)}
    >
      {BURROWS.map((_, i) => {
        const open = phase === "ask" && !wrong.includes(i);
        return (
          <Burrow
            key={i}
            index={i}
            hasMouse={i === target}
            head={headFor(i)}
            hint={open}
            wrong={wrong.includes(i)}
            clue={i === target && phase === "ask" && clue !== "ears" ? clue : null}
            onTap={open ? tap : null}
            ariaLabel={open ? `Hole ${i + 1} — is the mouse in here?` : `Hole ${i + 1}`}
          />
        );
      })}
    </FtmStage>
  );
}
