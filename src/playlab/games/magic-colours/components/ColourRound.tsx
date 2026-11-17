"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { motion, type TargetAndTransition } from "framer-motion";
import { playFanfare, playStarPop } from "@shared/audio/sfx";
import { clipText, playClip, playSequence, sayAfter } from "@shared/audio/voice";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { VEHICLES, type Exit, type Part } from "@games/magic-colours/constants/vehicles";
import {
  MODULE_IDS,
  ROUNDS,
  TAP_CLIP,
  colourClip,
  nameClip,
  type ModuleId,
} from "@games/magic-colours/constants/rounds";
import { VehiclePicture, type PopAt } from "@games/magic-colours/components/VehiclePicture";
import { WORLDS } from "@games/magic-colours/components/McWorlds";

/** From the last part's colour to its name showing in the bar. */
const NAME_MS = 900;
/** The name stays in the bar at least this long before the vehicle goes. */
const ALIVE_MIN_MS = 1800;
/** If the name line cannot be heard (stopped, missing), come alive anyway. */
const ALIVE_LATEST_MS = 4200;

/** How each kind of vehicle leaves. Tweens: these carry three keyframes. */
const EXITS: Record<Exit, TargetAndTransition> = {
  drive: {
    x: ["0%", "-4%", "135%"],
    y: ["0%", "-3%", "0%"],
    transition: { duration: 1.5, times: [0, 0.22, 1], ease: "easeIn" },
  },
  sail: {
    x: ["0%", "2%", "130%"],
    y: ["0%", "-2%", "0%"],
    transition: { duration: 2, times: [0, 0.3, 1], ease: "easeIn" },
  },
  fly: {
    x: ["0%", "6%", "130%"],
    y: ["0%", "4%", "-70%"],
    transition: { duration: 1.6, times: [0, 0.25, 1], ease: "easeIn" },
  },
  rise: {
    x: ["0%", "0%", "20%"],
    y: ["0%", "-4%", "-140%"],
    transition: { duration: 1.8, times: [0, 0.25, 1], ease: "easeIn" },
  },
};

/**
 * ONE PICTURE TO COLOUR — tap a part, its colour pops in.
 *
 * The vehicle rolls (or floats) in as a line drawing and is named: "Fire
 * engine! Tap each part." (the bar shows the same). Every blank part is a
 * button: a tap spreads its colour out from the finger, throws a little
 * burst and names the colour ("That one is red."). A coloured part takes no
 * more taps. When the last one is in, the vehicle's name is said again
 * ("Fire engine!") and it comes alive — away down the road, up into the sky,
 * off across the sea or out into space — and the round is won. No wrong
 * taps exist.
 */
export function ColourRoundOf({
  module,
  round,
  title,
  onDone,
  onHome,
  onExitPortal,
}: RoundProps & { module: ModuleId }) {
  const vehicle = VEHICLES[ROUNDS[module][round]];
  const stageRef = useRef<HTMLDivElement>(null);
  const picRef = useRef<HTMLDivElement>(null);
  const [coloured, setColoured] = useState<ReadonlySet<string>>(() => new Set());
  const [pops, setPops] = useState<Readonly<Record<string, PopAt>>>({});
  /** The lines being said: its name and "Tap each part!", then each colour
   *  as it is named, then its name again. */
  const [line, setLine] = useState<readonly string[]>(() => [nameClip(vehicle.id), TAP_CLIP]);
  const [alive, setAlive] = useState(false);
  const done = coloured.size === vehicle.parts.length;

  // the finished vehicle, raining in the cheer
  const cast = useMemo(() => {
    const all = new Set(vehicle.parts.map((p) => p.id));
    return [0, 1].map((i) => (
      <span key={i} className="ng-cast">
        <VehiclePicture vehicle={vehicle} coloured={all} />
      </span>
    ));
  }, [vehicle]);
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + 31 + MODULE_IDS.indexOf(module) * 6,
    stageRef,
    cast,
    onDone,
  });

  useEffect(() => {
    const t = setTimeout(() => void playSequence([nameClip(vehicle.id), TAP_CLIP]), 500);
    return () => clearTimeout(t);
  }, [vehicle.id]);

  // the last colour is in: its colour is named, then the vehicle's own name,
  // and then it comes alive
  useEffect(() => {
    if (!done) return;
    let gone = false;
    let went = false;
    let said = false;
    let shown = false;
    const go = () => {
      if (gone || went) return;
      went = true;
      setAlive(true);
      playFanfare();
      finish(picRef.current);
    };
    const name = nameClip(vehicle.id);
    // away only when the name has been said AND has sat in the bar a moment
    void sayAfter(name).then(() => {
      said = true;
      if (shown) go();
    });
    const show = setTimeout(() => setLine([name]), NAME_MS);
    const least = setTimeout(() => {
      shown = true;
      if (said) go();
    }, ALIVE_MIN_MS);
    const latest = setTimeout(go, ALIVE_LATEST_MS);
    return () => {
      gone = true;
      clearTimeout(show);
      clearTimeout(least);
      clearTimeout(latest);
    };
  }, [done, finish, vehicle.id]);

  const tap = useCallback(
    (p: Part, at: PopAt, el: Element) => {
      if (isSolved() || coloured.has(p.id)) return;
      setColoured((s) => new Set(s).add(p.id));
      setPops((m) => ({ ...m, [p.id]: at }));
      setLine([colourClip(p.colour)]);
      playStarPop();
      void playClip(colourClip(p.colour));
      burst(el);
    },
    [isSolved, coloured, burst]
  );

  // the hand taps the next white part
  const next = vehicle.parts.find((p) => !coloured.has(p.id));
  const idle = useIdleHand(!!next && !solved, coloured.size);
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!idle || !next) return;
    const raf = requestAnimationFrame(() =>
      setHand(
        centreIn(
          stageRef.current,
          picRef.current?.querySelector(`[data-at="${next.id}"]`) ?? picRef.current
        )
      )
    );
    return () => cancelAnimationFrame(raf);
  }, [idle, next]);

  const World = WORLDS[vehicle.terrain];

  return (
    <NgStage
      stageRef={stageRef}
      playClass={`mgc-play ${vehicle.grounded ? "mgc-play--ground" : "mgc-play--air"}`}
      world={<World />}
      round={round}
      solved={solved}
      say={say(line.map(clipText).join(" "))}
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
      <div className="mgc-board">
        <div ref={picRef} className="mgc-frame">
          <motion.div
            className={`mgc-vehicle ${vehicle.grounded ? "mgc-vehicle--ground" : "mgc-vehicle--air"}`}
            initial={{
              x: vehicle.exit === "rise" ? "0%" : "-120%",
              y: vehicle.exit === "rise" ? "60%" : "0%",
            }}
            animate={alive ? EXITS[vehicle.exit] : { x: "0%", y: "0%" }}
            transition={{ type: "tween", duration: 0.9, ease: "easeOut" }}
          >
            <VehiclePicture
              vehicle={vehicle}
              coloured={coloured}
              pops={pops}
              onTap={tap}
              className="mgc-svg"
            />
          </motion.div>
        </div>
      </div>
    </NgStage>
  );
}

/** Each theme's round, for its game's NgShell `rounds`. */
export const THEME_ROUNDS = Object.fromEntries(
  MODULE_IDS.map((m) => {
    function ThemeRound(props: RoundProps) {
      return <ColourRoundOf {...props} module={m} />;
    }
    return [m, ThemeRound];
  })
) as Record<ModuleId, ComponentType<RoundProps>>;
