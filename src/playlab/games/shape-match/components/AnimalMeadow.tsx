"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Burst } from "@shared/components/game/Burst";
import { playStarPop, playPickUpSound } from "@shared/audio/sfx";
import { playClip } from "@shared/audio/voice";
import type { SceneId } from "@games/shape-match/constants/scenes";
import {
  visitorCount,
  visitorsOf,
  type Entrance,
  type Visitor,
} from "@games/shape-match/constants/visitors";
import { Thing } from "@games/shape-match/components/SceneArt";
import { Twinkle } from "@games/shape-match/components/ShapeArt";
import { Banner } from "@games/shape-match/components/Banner";

/**
 * THE VISITORS — the last round of a module, and the only one with nothing to
 * get wrong.
 *
 * Four animals wander into the meadow from four different edges, each in ITS
 * OWN WAY — the rabbit's ears come up over the edge before the rest of it, the
 * cat puts its head round the side and looks before it runs in, the penguin
 * comes straight up out of the snow, the bird comes down out of the sky. They
 * look around. Touch one and it jumps, spins, wobbles or swells
 * with delight, throws a handful of sparkle in the air, and strolls back out
 * the way it came. When all four have been said hello to, the module is done.
 *
 * Everything here is cause and effect with nothing in between: no scores, no
 * right answers, no state change that is not also a movement.
 */

/** How long a greeting lasts before the animal heads home. */
const GREET_MS = 900;
/** And how long it takes to wander off. */
const LEAVE_MS = 700;

/** Where it starts: off the screen, on the edge it comes in from. Where it
 *  comes to REST is in the stylesheet, by edge — the free corners of a wide
 *  screen and a tall one are in different places, and the banner and Leo are
 *  in different places too. */
function offstage(visitor: Visitor): { x: string; y: string } {
  if (visitor.edge === "left") return { x: "-220%", y: "0%" };
  if (visitor.edge === "right") return { x: "220%", y: "0%" };
  if (visitor.edge === "bottom") return { x: "0%", y: "220%" };
  return { x: "0%", y: "-220%" };
}

/** How long each arrival takes, in seconds. The board waits this long before
 *  it calls an animal "here", because an animal that peeks has to peek. */
const LENGTH: Record<Entrance, number> = {
  hop: 1.6,
  peek: 1.8,
  rise: 1.2,
  flutter: 1.5,
  amble: 1.4,
  glide: 1.3,
};

/**
 * THE WAY IN. Each of these is a different arrival, not the same arrival at a
 * different speed — and each one belongs to the animal doing it.
 *
 *   HOP      the ears come up over the edge first, then the whole rabbit
 *   PEEK     a head round the side, a long look, and then it runs in
 *   RISE     straight up out of the ground, and a bounce at the top
 *   FLUTTER  down out of the sky, tipping from side to side
 *   AMBLE    a slow walk in, rocking from foot to foot
 *   GLIDE    a smooth curve in, the way a fish crosses a tank
 */
function arrival(visitor: Visitor) {
  const away = offstage(visitor);
  const delay = visitor.delay;
  const duration = LENGTH[visitor.entrance];
  const sideways = visitor.edge === "left" || visitor.edge === "right";
  /** Most of the way back out again — where a peeking head or a pair of ears
   *  is still mostly offstage, but the top of it can be seen. */
  const brim = visitor.edge === "left" ? "-62%" : visitor.edge === "right" ? "62%" : "62%";

  if (visitor.entrance === "hop") {
    // EARS FIRST: up to the brim, a pause with only the top showing, then the
    // rest of the rabbit in two hops
    return {
      initial: { ...away, rotate: 0, scale: 1 },
      animate: sideways
        ? { x: [away.x, brim, brim, "0%"], y: ["0%", "-8%", "0%", "0%"], rotate: [0, -5, 5, 0] }
        : { y: [away.y, brim, brim, "-18%", "0%"], x: "0%", rotate: [0, 0, -4, 4, 0] },
      transition: {
        duration,
        delay,
        ease: "easeOut" as const,
        times: sideways ? [0, 0.3, 0.62, 1] : [0, 0.28, 0.58, 0.82, 1],
      },
    };
  }

  if (visitor.entrance === "peek") {
    // A HEAD ROUND THE SIDE, a look about, and then it runs
    return {
      initial: { ...away, rotate: 0, scale: 1 },
      animate: sideways
        ? { x: [away.x, brim, brim, brim, "0%"], rotate: [0, 8, -8, 6, 0], y: "0%" }
        : { y: [away.y, brim, brim, "0%"], rotate: [0, 6, -6, 0], x: "0%" },
      transition: {
        duration,
        delay,
        ease: [0.6, 0, 0.2, 1] as const,
        times: sideways ? [0, 0.22, 0.44, 0.66, 1] : [0, 0.24, 0.6, 1],
      },
    };
  }

  if (visitor.entrance === "rise") {
    // STRAIGHT UP OUT OF THE GROUND, and a bounce when it gets there — the
    // bounce belongs to the SPRING, which takes two keyframes and no more
    return {
      initial: { ...away, rotate: 0, scale: 0.7 },
      animate: { x: "0%", y: "0%", scale: 1, rotate: 0 },
      transition: { type: "spring" as const, stiffness: 90, damping: 9, delay },
    };
  }

  if (visitor.entrance === "flutter") {
    // DOWN OUT OF THE SKY, tipping from side to side all the way
    return {
      initial: { ...away, rotate: 18, scale: 1 },
      animate: {
        x: ["0%", "-16%", "12%", "-6%", "0%"],
        y: [away.y, "34%", "-10%", "8%", "0%"],
        rotate: [18, -14, 10, -6, 0],
      },
      transition: { duration, delay, ease: "easeInOut" as const },
    };
  }

  if (visitor.entrance === "amble") {
    // A SLOW WALK IN, rocking from one foot to the other
    return {
      initial: { ...away, rotate: 0, scale: 1 },
      animate: {
        x: "0%",
        y: ["0%", "-5%", "0%", "-5%", "0%"],
        rotate: [0, -4, 4, -4, 0],
      },
      transition: { duration, delay, ease: "easeOut" as const },
    };
  }

  // GLIDE: a smooth curve in, the way a fish crosses a tank
  return {
    initial: { ...away, rotate: -6, scale: 1 },
    animate: { x: "0%", y: ["0%", "-10%", "6%", "0%"], rotate: [-6, 4, -2, 0] },
    transition: { duration, delay, ease: [0.25, 0.6, 0.3, 1] as const },
  };
}

/** What a touch looks like. */
function greeting(visitor: Visitor) {
  if (visitor.greeting === "jump") {
    return { y: ["0%", "-40%", "0%", "-16%", "0%"], rotate: [0, -8, 8, 0] };
  }
  if (visitor.greeting === "spin") return { rotate: [0, 370], scale: [1, 1.12, 1] };
  if (visitor.greeting === "wobble") {
    return { rotate: [0, -16, 16, -10, 10, 0], scale: [1, 1.08, 1] };
  }
  return { scale: [1, 1.42, 0.94, 1.12, 1] };
}

/** And the way out: back the way it came, waving. */
function departure(visitor: Visitor) {
  const away = offstage(visitor);
  return {
    x: away.x,
    y: away.y,
    rotate: visitor.edge === "left" ? -18 : 18,
    opacity: [1, 1, 0.9],
  };
}

interface OneProps {
  visitor: Visitor;
  /** It has been said hello to. */
  onGreet: () => void;
  /** And now it has gone. */
  onGone: () => void;
  locked: boolean;
}

function Animal({ visitor, onGreet, onGone, locked }: OneProps) {
  const [state, setState] = useState<"coming" | "here" | "greeting" | "leaving">("coming");
  const way = arrival(visitor);

  /** Touched: it greets, throws sparkle, and heads home. */
  const touch = useCallback(() => {
    if (state === "greeting" || state === "leaving" || locked) return;
    setState("greeting");
    playStarPop();
    // and it is greeted by name
    void playClip("leo-hello-" + visitor.art);
    onGreet();
  }, [state, locked, onGreet, visitor.art]);

  /** It has arrived. ON THE CLOCK, never on the animation's own completion
   *  callback: an animation the browser decides not to finish would otherwise
   *  leave an animal stuck halfway in forever. */
  useEffect(() => {
    if (state !== "coming") return;
    const timer = setTimeout(
      () => setState("here"),
      (visitor.delay + LENGTH[visitor.entrance] + 0.2) * 1000
    );
    return () => clearTimeout(timer);
  }, [state, visitor.delay, visitor.entrance]);

  useEffect(() => {
    if (state !== "greeting") return;
    const timer = setTimeout(() => setState("leaving"), GREET_MS);
    return () => clearTimeout(timer);
  }, [state]);

  useEffect(() => {
    if (state !== "leaving") return;
    const timer = setTimeout(onGone, LEAVE_MS);
    return () => clearTimeout(timer);
  }, [state, onGone]);

  /** Once it has arrived it breathes, and peeks about. */
  const waiting = {
    y: ["0%", "-5%", "0%"],
    rotate: visitor.edge === "left" ? [0, 5, 0, -3, 0] : [0, -5, 0, 3, 0],
  };

  const sparks = useMemo(
    () => [
      <Twinkle key="a" />,
      <Twinkle key="b" fill="#FF7EB6" />,
      <Twinkle key="c" fill="#7FE0FF" />,
    ],
    []
  );

  const animate =
    state === "greeting"
      ? greeting(visitor)
      : state === "leaving"
        ? departure(visitor)
        : state === "here"
          ? waiting
          : way.animate;

  const transition =
    state === "greeting"
      ? { duration: GREET_MS / 1000, ease: "easeOut" as const }
      : state === "leaving"
        ? { duration: LEAVE_MS / 1000, ease: "easeIn" as const }
        : state === "here"
          ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const }
          : way.transition;

  return (
    <motion.button
      type="button"
      className="sm-visitor"
      data-edge={visitor.edge}
      data-state={state}
      initial={way.initial}
      animate={animate}
      transition={transition}
      onClick={touch}
      disabled={state === "leaving"}
      aria-label={"Say hello to the " + visitor.art}
      whileTap={{ scale: 0.92 }}
    >
      <Thing art={visitor.art} />
      {state === "greeting" && <Burst pieces={sparks} count={12} size="22%" />}
    </motion.button>
  );
}

interface MeadowProps {
  scene: SceneId;
  /** Which module this is — the greetings rotate with it. */
  seed: number;
  locked: boolean;
  /** Somebody was said hello to: the character reacts. */
  onGreet: () => void;
  /** Everybody has been. Must be stable. */
  onSolved: () => void;
}

export function AnimalMeadow({ scene, seed, locked, onGreet, onSolved }: MeadowProps) {
  const visitors = useMemo(() => visitorsOf(scene, seed), [scene, seed]);
  const [gone, setGone] = useState<number[]>([]);
  const total = visitorCount(scene);
  const done = gone.length >= total;

  useEffect(() => {
    if (!done) return;
    onSolved();
  }, [done, onSolved]);

  const greet = useCallback(() => {
    playPickUpSound();
    onGreet();
  }, [onGreet]);

  return (
    <div className="sm-board" data-kind="visitors">
      <Banner text="Who is here? Say hello!" />

      <AnimatePresence>
        {visitors.map((visitor, i) =>
          gone.includes(i) ? null : (
            <Animal
              key={visitor.art + i}
              visitor={visitor}
              locked={locked}
              onGreet={greet}
              onGone={() => setGone((sofar) => (sofar.includes(i) ? sofar : [...sofar, i]))}
            />
          )
        )}
      </AnimatePresence>

      {/* how many friends are still to meet, as dots rather than a number */}
      <div className="sm-hellos" aria-label={gone.length + " of " + total + " friends met"}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className="sm-hello" data-met={i < gone.length ? "yes" : undefined} />
        ))}
      </div>
    </div>
  );
}
