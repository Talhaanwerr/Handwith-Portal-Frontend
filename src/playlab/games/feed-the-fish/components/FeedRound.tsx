"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useStopVoiceOnLeave } from "@shared/hooks/useStopVoiceOnLeave";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { GuideBar } from "@shared/components/game/GuideBar";
import { FirstPlayHand, useIdleHand } from "@shared/hooks/useIdleHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { cssVars } from "@shared/styles/cssVars";
import { unit } from "@shared/utils/hash";
import { playChime } from "@shared/audio/sfx";
import { clipText, sayAfter } from "@shared/audio/voice";
import { cheerFor } from "@shared/audio/cheers";
import { BURST_MS, PieceBurst } from "@games/jigsaw-fun/components/Cheer";
import { OceanBackdrop } from "@games/feed-the-shark/components/OceanBackdrop";
import { VOCAB_ART } from "@games/letter-treats/components/candy-world/VocabArt";
import {
  FishArt,
  FlakeArt,
  HeartArt,
  SeaweedArt,
  type FishMood,
} from "@games/feed-the-fish/components/FishArt";
import {
  GROW,
  createTank,
  initialFish,
  type FishView,
  type FlakeView,
} from "@games/feed-the-fish/components/fishTank";
import {
  ASLEEP_CLIP,
  BEDS,
  FEED_CLIP,
  TAP_CLIP,
  type FeedRoundDef,
  type FishDef,
  type ModuleInfo,
} from "@games/feed-the-fish/constants/rounds";

const Turtle = VOCAB_ART.turtle;
const Jelly = VOCAB_ART.jellyfish;
const Octopus = VOCAB_ART.octopus;

const BUBBLES = Array.from({ length: 8 }, (_, i) =>
  cssVars({
    "--ftf-bx": `${(5 + i * 12 + unit(i) * 6).toFixed(1)}%`,
    "--ftf-bs": (0.8 + unit(i * 3 + 1) * 1.4).toFixed(2),
    "--ftf-bd": `${(11 + unit(i * 5 + 2) * 7).toFixed(1)}s`,
    "--ftf-bl": `${(-unit(i * 7 + 3) * 16).toFixed(1)}s`,
  })
);

/**
 * The aquarium: Feed the Shark's water, light and seabed (OceanBackdrop,
 * reused as is), Letter Treats' turtle, jellyfish and octopus drifting in
 * the back, a seaweed bed for each sleeper, and a slow stream of bubbles —
 * every motion a CSS transform.
 */
export const FtfWorld = memo(function FtfWorld() {
  return (
    <div className="ftf-world" aria-hidden="true">
      <div className="ftf-water fs-bg" />
      <span className="ftf-surface" />
      <OceanBackdrop />
      <span className="ftf-friend ftf-friend--turtle">
        <span className="ftf-friend-art">
          <Turtle />
        </span>
      </span>
      <span className="ftf-friend ftf-friend--jelly">
        <span className="ftf-friend-art">
          <Jelly />
        </span>
      </span>
      <span className="ftf-friend ftf-friend--octo">
        <span className="ftf-friend-art">
          <Octopus />
        </span>
      </span>
      {BEDS.map((x, i) => (
        <span
          key={i}
          className={`ftf-weed ftf-weed--${i}`}
          style={cssVars({ "--ftf-wx": `${x * 100}%` })}
        >
          <SeaweedArt />
        </span>
      ))}
      <span className="ftf-bubbles">
        {BUBBLES.map((s, i) => (
          <span key={i} className="ftf-bubble" style={s} />
        ))}
      </span>
    </div>
  );
});

/** One fish. Its place is written onto it by the tank, never rendered. */
const Fish = memo(function Fish({
  i,
  def,
  mood,
  bites,
  setEl,
}: {
  i: number;
  def: FishDef;
  mood: FishMood;
  bites: number;
  setEl: (i: number, el: HTMLElement | null) => void;
}) {
  const ref = useCallback((el: HTMLDivElement | null) => setEl(i, el), [i, setEl]);
  return (
    <div ref={ref} className={`ftf-fish ftf-fish--${mood}`} aria-hidden="true">
      <div className="ftf-fish-bob">
        <div
          className="ftf-fish-grow"
          style={cssVars({ "--ftf-grow": (1 + bites * GROW).toFixed(2) })}
        >
          <div className="ftf-fish-face">
            <div className="ftf-fish-wiggle">
              <FishArt hue={def.hue} mood={mood} />
            </div>
            {mood === "eat" && (
              <span className="ftf-nibble">
                <span />
                <span />
                <span />
              </span>
            )}
          </div>
        </div>
        {(mood === "hungry" || mood === "eat") && (
          <span className="ftf-ask">
            {Array.from({ length: def.bites }, (_, k) => (
              <span key={k} className={`ftf-ask-dot ${k < bites ? "ftf-ask-dot--on" : ""}`} />
            ))}
          </span>
        )}
        {mood === "full" && (
          <span className="ftf-heart">
            <HeartArt />
          </span>
        )}
        {mood === "asleep" && (
          <span className="ftf-zz font-rounded font-black">
            <span>z</span>
            <span>z</span>
            <span>Z</span>
          </span>
        )}
      </div>
    </div>
  );
});

const Flake = memo(function Flake({ v }: { v: FlakeView }) {
  return (
    <span
      className={`ftf-flake ${v.fade ? "ftf-flake--fade" : ""}`}
      style={cssVars({
        "--ftf-fx": `${(v.x * 100).toFixed(2)}cqw`,
        "--ftf-fy": `${(v.y0 * 100).toFixed(2)}cqh`,
        "--ftf-drop": `${(v.drop * 100).toFixed(2)}cqh`,
        "--ftf-fd": `${v.dur.toFixed(2)}s`,
      })}
      aria-hidden="true"
    >
      <span className="ftf-ripple" />
      <span className="ftf-flake-sink">
        <span className="ftf-flake-sway">
          <FlakeArt />
        </span>
      </span>
    </span>
  );
});

/** The hand taps at least this far under the guide bar, never on it. */
const UNDER_BAR = 36;

/** One round: its fish, the flakes in the water, and the idle hand. */
function Tank({
  def,
  countBites,
  onWon,
  onLine,
}: {
  def: FeedRoundDef;
  countBites: boolean;
  onWon: () => void;
  /** A fish's thanks, for the guide bar while it is said. */
  onLine: (id: string, said: Promise<void>) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [fish, setFish] = useState<FishView[]>(() => initialFish(def));
  const [flakes, setFlakes] = useState<FlakeView[]>([]);
  const [tank] = useState(() => createTank(def, { setFish, setFlakes, countBites, onLine }));
  useEffect(() => tank.whenWon(onWon), [tank, onWon]);

  useEffect(() => {
    const el = rootRef.current;
    return el ? tank.attach(el) : undefined;
  }, [tank]);

  const setEl = useCallback((i: number, el: HTMLElement | null) => tank.fishRef(i, el), [tank]);

  // After 7 s with nothing in the water (at once on a first round, inside
  // FirstPlayHand), the hand taps the water above a hungry fish — under the
  // guide bar, and measured again if the screen turns.
  const armed = flakes.length === 0 && fish.some((m) => m.mood === "hungry");
  const idle = useIdleHand(
    armed,
    fish.reduce((s, m) => s + m.bites, 0)
  );
  const [hand, setHand] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!idle) return;
    const measure = () => {
      const p = tank.handPoint();
      const root = rootRef.current;
      const bar = root?.parentElement?.querySelector(".pl-guidebar");
      const floor =
        root && bar
          ? bar.getBoundingClientRect().bottom - root.getBoundingClientRect().top + UNDER_BAR
          : 0;
      setHand(p && { x: p.x, y: Math.max(p.y, floor) });
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [idle, tank]);

  return (
    <div
      ref={rootRef}
      className="ftf-tank"
      onPointerDown={(e) => tank.tap(e.clientX)}
      role="button"
      tabIndex={-1}
      aria-label="Tap the water to drop in food"
    >
      {def.fish.map((d, i) => (
        <Fish key={i} i={i} def={d} mood={fish[i].mood} bites={fish[i].bites} setEl={setEl} />
      ))}
      {flakes.map((f) => (
        <Flake key={f.id} v={f} />
      ))}
      {idle && hand && <TeachingHand fx={hand.x} fy={hand.y} tx={hand.x} ty={hand.y} />}
    </div>
  );
}

/**
 * One module: four rounds in the same aquarium. Each round says its one
 * line, the child feeds until every hungry fish is asleep, a cheer, and the
 * next round's fish swim in. The guide bar at the top centre holds the colour
 * to feed, a dot per round and the line being said: the round's instruction,
 * a fish's thanks while it is said, then "All the fish are asleep!" and the
 * cheer. The first round's hand comes by itself (FirstPlayHand).
 */
export function FeedRound({ info, onDone }: { info: ModuleInfo; onDone: () => void }) {
  const [round, setRound] = useState(0);
  const [won, setWon] = useState(false);
  const [burst, setBurst] = useState<{ x: number; y: number; n: number } | null>(null);
  const schedule = useScheduler();
  const stageRef = useRef<HTMLDivElement>(null);
  const def = info.rounds[round];
  const colour = info.id === "colour";
  /** A line said over the round (thanks, asleep, the cheer), shown while said. */
  const [line, setLine] = useState<string | null>(null);
  const lineSerial = useRef(0);
  const showWhile = useCallback((id: string, said: Promise<void>, keep = false) => {
    const mine = ++lineSerial.current;
    setLine(clipText(id));
    if (!keep)
      void said.then(() => {
        if (lineSerial.current === mine) setLine(null);
      });
  }, []);

  useStopVoiceOnLeave();

  useEffect(() => {
    const clip = def.target ? FEED_CLIP[def.target] : TAP_CLIP;
    if (!clip) return;
    const t = setTimeout(() => void sayAfter(clip), round === 0 ? 900 : 1200);
    return () => clearTimeout(t);
  }, [round, def.target]);

  const handleWon = useCallback(() => {
    setWon(true);
    playChime();
    const el = stageRef.current;
    if (el) {
      setBurst({ x: el.clientWidth / 2, y: el.clientHeight * 0.45, n: round });
      schedule(() => setBurst(null), BURST_MS);
    }
    const cheer = cheerFor(round + (colour ? 4 : 0));
    const asleep = colour ? null : sayAfter(ASLEEP_CLIP);
    const cheered = sayAfter(cheer);
    // the bar: "All the fish are asleep!" while it is said, then the cheer
    // until it has been said (the next round's fish may already be swimming
    // in; its instruction is said after the cheer, and shows then)
    if (asleep) {
      showWhile(ASLEEP_CLIP, asleep, true);
      void asleep.then(() => showWhile(cheer, cheered));
    } else showWhile(cheer, cheered);
    schedule(() => {
      if (round + 1 >= info.rounds.length) {
        onDone();
        return;
      }
      setRound(round + 1);
      setWon(false);
    }, 3600);
  }, [colour, info.rounds.length, onDone, round, schedule, showWhile]);

  const instruction = clipText(def.target ? (FEED_CLIP[def.target] ?? TAP_CLIP) : TAP_CLIP);

  return (
    <div ref={stageRef} className="ftf-stage">
      <FtfWorld />
      <FirstPlayHand on={round === 0}>
        <Tank key={round} def={def} countBites={colour} onWon={handleWon} onLine={showWhile} />
      </FirstPlayHand>
      <GuideBar text={line ?? instruction}>
        {def.target && (
          <span className="ftf-want" aria-hidden="true">
            <FishArt hue={def.target} mood="hungry" />
          </span>
        )}
        {info.rounds.map((_, i) => (
          <span
            key={i}
            className={`ftf-dot ${i < round || (i === round && won) ? "ftf-dot--done" : ""} ${i === round && !won ? "ftf-dot--now" : ""}`}
            role={i === 0 ? "img" : undefined}
            aria-label={i === 0 ? `Round ${round + 1} of ${info.rounds.length}` : undefined}
          />
        ))}
      </GuideBar>
      {burst && <PieceBurst key={`burst-${burst.n}`} x={burst.x} y={burst.y} />}
    </div>
  );
}
