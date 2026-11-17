"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { animate, motion } from "framer-motion";
import {
  playChime,
  playClickSound,
  playDoorOpenSound,
  playIncorrectSound,
  playPickUpSound,
  playSnapSound,
} from "@shared/audio/sfx";
import { clipText, playClip, sayAfter } from "@shared/audio/voice";
import { useDragDrop } from "@shared/hooks/useDragDrop";
import { useIdleHand } from "@shared/hooks/useIdleHand";
import { useScheduler } from "@shared/hooks/useScheduler";
import { TeachingHand } from "@shared/components/game/TeachingHand";
import { cssVars } from "@shared/styles/cssVars";
import { NgStage } from "@games/number-groups/components/NgStage";
import { centreIn, sayNumber, useRoundCelebration } from "@games/number-groups/components/NgKit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { Thing } from "@games/number-groups/components/SumParts";
import {
  BurjFloor,
  BurjGlow,
  BurjPodium,
  BurjSpire,
  floorShape,
} from "@shared/components/dubai/BurjTower";
import { DubaiWorld } from "@shared/components/dubai/DubaiWorld";
import { KidArt } from "@games/burj-lift/components/KidArt";
import {
  FloorSign,
  LiftArrow,
  LiftCar,
  Wish,
  type LiftDir,
} from "@games/burj-lift/components/LiftArt";
import {
  DOWN_CLIP,
  FLOORS,
  FLOOR_COLOURS,
  FLOOR_PICS,
  ROUNDS,
  TRIPS,
  dragClip,
  upClip,
  type Kid,
  type ModuleId,
} from "@games/burj-lift/constants/rounds";

/** One floor's ride (the car's CSS tween in burj-lift.css is this long too). */
const MOVE_MS = 560;
/** A child walking up to the lift. */
const WALK_MS = 850;
/** A carried child settling into the car, or gliding back to the sand. */
const SNAP_MS = 220;
const BACK_MS = 260;
/** From the car stopping at the child's floor to the next step: the hop out. */
const HOP_MS = 1100;
/** When, in the hop, the child's face appears in their floor's window. */
const HOME_AT = 650;

/** The tower's tiers: the ground floor (tier 0, the short lobby the lift
 *  waits at) and floors 1–4 (tiers 1–4). */
const TIERS = FLOORS + 1;
/** Where the shaft stands, in width units right of the tower's centre line. */
const SHAFT_AT = 1.05;
/** How far each tier's right edge is from the shaft (its bracket's length). */
const REACH = Array.from({ length: TIERS }, (_, i) => {
  const { width, shift } = floorShape(i, TIERS);
  return SHAFT_AT - (shift + width / 2);
});
const TIER_LIST = Array.from({ length: TIERS }, (_, i) => i);
const FLOOR_LIST = Array.from({ length: FLOORS }, (_, i) => i + 1);

/** walk: the child walks up · board: waiting to be dragged in · up: riding
 *  up, press by press · out: stepping out on their floor · down: the empty
 *  lift brought back to the ground. */
type Phase = "walk" | "board" | "up" | "out" | "down";

interface Flight {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  scale: number;
  ms: number;
}
interface HandPath {
  fx: number;
  fy: number;
  tx: number;
  ty: number;
  key: string;
}

/** A wrong button shakes (a tween: five keyframes). */
function shake(el: Element | null | undefined) {
  if (el) void animate(el, { x: [0, -10, 9, -5, 0] }, { duration: 0.4 });
}

/** A child as they wait on the sand (and as they are carried): the figure,
 *  and what they want over their head (a bubble) or in their hand (a balloon). */
function Passenger({
  who,
  floor,
  updown,
  pose,
}: {
  who: Kid;
  floor: number;
  updown: boolean;
  pose: "stand" | "cheer";
}) {
  return (
    <span className="bjl-pax">
      <span className="bjl-pax-fig">
        <KidArt who={who} pose={pose} />
      </span>
      {updown ? (
        <Wish n={floor} pic={FLOOR_PICS[floor - 1]} tail="down" />
      ) : (
        <Wish n={floor} colour={FLOOR_COLOURS[floor - 1]} tail="down" />
      )}
    </span>
  );
}

/**
 * ONE ROUND OF LIFT RIDES — three children, a girl and a boy taking turns.
 *
 * A child walks up to the open lift with their wish (Up or Down?: a bubble
 * with their floor's picture and number; Colour Floors: a balloon of its
 * colour) — "Drag her into the lift!". Dropped on the cabin they stand
 * inside and the doors shut (anywhere else they glide back to the sand).
 * "Press up to her floor!": every press of ⬆ rides ONE floor and says its
 * number; at their floor the lift stops by itself and they hop out happy
 * (their face then looks out of that floor's window). "Now bring the lift
 * down!": every press of ⬇ rides one floor down; at the ground the doors open
 * for the next child. After the third child the round is won. The wrong
 * button shakes, "Try again!", and the right one glows (`onMiss`); a press
 * while the lift is riding the right way is remembered (one), never lost.
 */
export function LiftRoundOf({
  module,
  round,
  title,
  onDone,
  onMiss,
  onHome,
  onExitPortal,
}: RoundProps & { module: ModuleId }) {
  const r = ROUNDS[module][round];
  const updown = module === "updown";
  const time = updown ? "day" : "dusk";
  const stageRef = useRef<HTMLDivElement>(null);
  const floorsRef = useRef<HTMLDivElement>(null);
  const kidRef = useRef<HTMLButtonElement>(null);
  const seatRef = useRef<HTMLSpanElement>(null);
  const btnRefs = useRef<Record<LiftDir, HTMLButtonElement | null>>({ up: null, down: null });
  const signRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const targets = useRef(new Map<number, HTMLElement>());
  const schedule = useScheduler();

  const [trip, setTrip] = useState(0);
  const [phase, setPhase] = useState<Phase>("walk");
  /** The stop the car is at (or riding to): 0 = the ground, 1–4 the floors. */
  const [level, setLevel] = useState(0);
  const [moving, setMoving] = useState(false);
  /** A wrong button was pressed in this step: "Try again!", the right one glows. */
  const [missed, setMissed] = useState(false);
  /** How many children have got to their floor (their faces in the windows). */
  const [home, setHome] = useState(0);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [slop, setSlop] = useState(24);
  const flightId = useRef(0);
  /** The truth at once, for presses and timers that come before a re-render. */
  const live = useRef({ trip: 0, phase: "walk" as Phase, level: 0, moving: false, pending: false });

  const t = r[trip];

  const cast = useMemo(
    () => [
      <span key="girl" className="ng-cast">
        <KidArt who="girl" pose="cheer" />
      </span>,
      <span key="boy" className="ng-cast">
        <KidArt who="boy" pose="cheer" />
      </span>,
      <span key="star" className="ng-cast">
        <Thing id="star" />
      </span>,
    ],
    []
  );
  const { solved, isSolved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: round + (updown ? 31 : 37),
    stageRef,
    cast,
    onDone,
  });

  const toPhase = (p: Phase) => {
    live.current.phase = p;
    setPhase(p);
  };

  // a child walks up to the lift, then "Drag her into the lift!"
  useEffect(() => {
    if (phase !== "walk") return;
    const id = setTimeout(
      () => {
        live.current.phase = "board";
        setPhase("board");
        void sayAfter(dragClip(r[trip].who));
      },
      WALK_MS + (trip === 0 ? 350 : 0)
    );
    return () => clearTimeout(id);
  }, [phase, trip, r]);

  // ── the drag: the child from the sand into the cabin ──
  const registerCabin = (el: HTMLSpanElement | null) => {
    if (el) targets.current.set(0, el);
    else targets.current.delete(0);
  };

  function fly(from: { x: number; y: number }, to: Element | null, scale: number, ms: number) {
    const end = centreIn(stageRef.current, to);
    const f: Flight = {
      id: ++flightId.current,
      x: from.x,
      y: from.y,
      dx: end.x - from.x,
      dy: end.y - from.y,
      scale,
      ms,
    };
    setFlight(f);
    // landing is on the CLOCK, never on the animation's own callback
    schedule(() => setFlight((now) => (now?.id === f.id ? null : now)), ms);
  }

  function boardIn(from: { x: number; y: number }) {
    const seat = seatRef.current?.getBoundingClientRect().height ?? 0;
    const kid = kidRef.current?.querySelector(".bjl-pax-fig")?.getBoundingClientRect().height ?? 0;
    playSnapSound();
    // (still "board" while it flies; a flight blocks a second pick-up)
    fly(from, seatRef.current, seat > 0 && kid > 0 ? seat / kid : 1, SNAP_MS);
    schedule(() => {
      toPhase("up");
      setMissed(false);
      void sayAfter(upClip(r[live.current.trip].who));
    }, SNAP_MS);
  }

  const { dragging, over, start, ghostRef } = useDragDrop<number, number>({
    root: stageRef,
    targets,
    slopPx: slop,
    onDrop: (_kid, target, info) => {
      if (!info.moved) return;
      if (target === 0 && live.current.phase === "board") boardIn(info);
      else fly(info, kidRef.current?.querySelector(".bjl-pax-fig") ?? null, 1, BACK_MS);
    },
  });

  const pickUp = (e: PointerEvent<HTMLButtonElement>) => {
    if (live.current.phase !== "board" || flight || isSolved()) return;
    const cab = targets.current.get(0)?.getBoundingClientRect();
    if (cab) setSlop(Math.round(Math.min(cab.width, cab.height) * 0.45));
    if (start(e, live.current.trip)) playPickUpSound();
  };

  // ── the buttons: one press, one floor ──
  function stepOut() {
    const g = live.current;
    const last = g.trip + 1 >= TRIPS;
    toPhase("out");
    playChime();
    burst(signRefs.current[r[g.trip].to - 1]);
    schedule(() => setHome((h) => h + 1), HOME_AT);
    schedule(() => {
      if (last) finish(floorsRef.current);
      else {
        toPhase("down");
        setMissed(false);
        void sayAfter(DOWN_CLIP);
      }
    }, HOP_MS);
  }

  function groundFloor() {
    const g = live.current;
    playDoorOpenSound();
    g.trip += 1;
    setTrip(g.trip);
    setMissed(false);
    toPhase("walk");
  }

  function arrive() {
    const g = live.current;
    g.moving = false;
    setMoving(false);
    if (g.phase === "up" && g.level === r[g.trip].to) {
      g.pending = false;
      stepOut();
    } else if (g.phase === "down" && g.level === 0) {
      g.pending = false;
      groundFloor();
    } else if (g.pending) {
      g.pending = false;
      ride(g.phase === "up" ? "up" : "down");
    }
  }

  function ride(dir: LiftDir) {
    const g = live.current;
    g.level += dir === "up" ? 1 : -1;
    g.moving = true;
    setLevel(g.level);
    setMoving(true);
    setMissed(false);
    playClickSound();
    if (g.level >= 1) sayNumber(g.level);
    schedule(arrive, MOVE_MS);
  }

  const press = (dir: LiftDir) => {
    const g = live.current;
    if (isSolved() || (g.phase !== "up" && g.phase !== "down")) return;
    const want: LiftDir = g.phase;
    if (g.moving) {
      if (dir === want) g.pending = true;
      return;
    }
    if (dir !== want) {
      playIncorrectSound();
      void playClip("instr-try-again");
      shake(btnRefs.current[dir]);
      setMissed(true);
      onMiss();
      return;
    }
    ride(dir);
  };

  // ── the teaching hand: the drag into the lift, then the button to press ──
  const want: LiftDir | null = phase === "up" ? "up" : phase === "down" ? "down" : null;
  const waiting =
    !solved &&
    !moving &&
    flight === null &&
    dragging === null &&
    (phase === "board" || want !== null);
  const handKey = `${trip}-${phase}-${level}`;
  const idle = useIdleHand(waiting, handKey);
  const [hand, setHand] = useState<HandPath | null>(null);
  useEffect(() => {
    if (!idle) return;
    const measure = () => {
      const root = stageRef.current;
      if (phase === "board") {
        const a = centreIn(root, kidRef.current?.querySelector(".bjl-pax-fig"));
        const b = centreIn(root, targets.current.get(0));
        setHand({ fx: a.x, fy: a.y, tx: b.x, ty: b.y, key: handKey });
      } else if (phase === "up" || phase === "down") {
        const p = centreIn(root, btnRefs.current[phase]);
        setHand({ fx: p.x, fy: p.y, tx: p.x, ty: p.y, key: handKey });
      }
    };
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [idle, phase, handKey]);
  const showHand = idle && hand?.key === handKey ? hand : null;

  // ── what is said, in the guide bar ──
  const line = missed
    ? "instr-try-again"
    : phase === "walk" || phase === "board"
      ? dragClip(t.who)
      : phase === "down"
        ? DOWN_CLIP
        : upClip(t.who);

  const stopped = !moving;
  const riding = phase === "up" || phase === "out";
  const atGround = phase === "walk" || phase === "board";
  const carried = (pose: "stand" | "cheer") => (
    <span className="bjl-carried">
      <Passenger who={t.who} floor={t.to} updown={updown} pose={pose} />
    </span>
  );
  const away = dragging !== null || (flight !== null && atGround) || !atGround;

  return (
    <NgStage
      stageRef={stageRef}
      playClass={`bjl-play bjl-play--${module}`}
      world={<DubaiWorld time={time} />}
      round={round}
      solved={solved}
      say={say(clipText(line))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {flight && (
            <motion.div
              key={flight.id}
              className="ng-flight pl-at"
              style={cssVars({ "--pl-x": `${flight.x}px`, "--pl-y": `${flight.y}px` })}
              initial={{ x: 0, y: 0, scale: 1 }}
              animate={{ x: flight.dx, y: flight.dy, scale: flight.scale }}
              transition={{ duration: flight.ms / 1000, ease: "easeOut" }}
              aria-hidden="true"
            >
              {carried("stand")}
            </motion.div>
          )}
          {dragging !== null && (
            <div ref={ghostRef} className="pl-drag-ghost" aria-hidden="true">
              {carried("cheer")}
            </div>
          )}
          {showHand && (
            <TeachingHand
              key={showHand.key}
              fx={showHand.fx}
              fy={showHand.fy}
              tx={showHand.tx}
              ty={showHand.ty}
            />
          )}
        </>
      }
    >
      <div className="bjl-board" data-phase={phase}>
        <div className="bjl-row">
          {/* a sign beside every floor: its picture (or colour) and its number */}
          <div className="bjl-signs">
            {FLOOR_LIST.map((n) => (
              <span key={n} className="bjl-signrow" style={cssVars({ "--bjl-i": n - 1 })}>
                <FloorSign
                  n={n}
                  pic={updown ? FLOOR_PICS[n - 1] : undefined}
                  colour={updown ? undefined : FLOOR_COLOURS[n - 1]}
                  here={stopped && level === n}
                  reached={phase === "out" && t.to === n}
                  signRef={(el) => {
                    signRefs.current[n - 1] = el;
                  }}
                />
              </span>
            ))}
          </div>

          <div className="bjl-towerbox">
            {!updown && <BurjGlow strength={0.9} className="bjl-glow" />}
            <span className="bjk-spire-slot bjl-spire-slot">
              <BurjSpire time={time} />
            </span>
            <div ref={floorsRef} className="bjk-floors">
              {TIER_LIST.map((i) => {
                const kid = r.slice(0, home).find((x) => x.to === i);
                return (
                  <div key={i} className={`bjk-slot ${i === 0 ? "bjl-lobby" : ""}`}>
                    <BurjFloor
                      index={i}
                      floors={TIERS}
                      time={time}
                      lit={!updown || (i > 0 && stopped && level === i)}
                    >
                      {kid && (
                        <motion.span
                          className="bjl-window-kid"
                          initial={{ scale: 0.3, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 420, damping: 15 }}
                        >
                          <KidArt who={kid.who} pose="cheer" head />
                        </motion.span>
                      )}
                    </BurjFloor>
                  </div>
                );
              })}
            </div>
            <BurjPodium time={time} />
          </div>

          {/* the lift: two rails, a bracket to every floor, the car */}
          <div className="bjl-shaft">
            <span className="bjl-rail bjl-rail--l" aria-hidden="true" />
            <span className="bjl-rail bjl-rail--r" aria-hidden="true" />
            <span className="bjl-shaft-top" aria-hidden="true" />
            {FLOOR_LIST.map((i) => (
              <span
                key={i}
                className="bjl-arm"
                style={cssVars({ "--bjl-i": i, "--bjl-reach": REACH[i] })}
                aria-hidden="true"
              />
            ))}
            <LiftCar
              rider={riding && flight === null ? t.who : null}
              riderKey={trip}
              riderPhase={phase === "out" ? "out" : "in"}
              open={atGround || phase === "out"}
              glow={dragging !== null ? (over === 0 ? "over" : "open") : "none"}
              wish={
                phase === "up" && flight === null ? (
                  updown ? (
                    <Wish n={t.to} pic={FLOOR_PICS[t.to - 1]} tail="left" />
                  ) : (
                    <Wish n={t.to} colour={FLOOR_COLOURS[t.to - 1]} tail="left" />
                  )
                ) : null
              }
              cabinRef={registerCabin}
              seatRef={seatRef}
              level={level}
            />
          </div>

          {/* beside the lift: who rides next, waiting on the sand, and the
              call station (beside them; held upright, over them) */}
          <div className="bjl-side">
            <div className="bjl-yard">
              <motion.button
                key={trip}
                ref={kidRef}
                type="button"
                className={`bjl-pax-btn ${away ? "is-away" : ""} ${
                  phase === "walk" ? "bjl-pax-btn--walk" : ""
                }`}
                initial={{ x: "70%", opacity: 0 }}
                animate={{ x: "0%", opacity: 1 }}
                transition={{ duration: WALK_MS / 1000, ease: "easeOut" }}
                onPointerDown={pickUp}
                disabled={solved}
                aria-label={t.who === "girl" ? "drag her into the lift" : "drag him into the lift"}
              >
                <Passenger who={t.who} floor={t.to} updown={updown} pose="stand" />
              </motion.button>
            </div>

            {/* the call station: up above, down below */}
            <div className="bjl-station">
              <span className="bjl-panel">
                {(["up", "down"] as const).map((dir) => (
                  <button
                    key={dir}
                    ref={(el) => {
                      btnRefs.current[dir] = el;
                    }}
                    type="button"
                    className={`bjl-go bjl-go--${dir} ${want && stopped ? "bjl-go--live" : ""} ${
                      want === dir && (missed || showHand) ? "bjl-go--hint" : ""
                    }`}
                    onClick={() => press(dir)}
                    disabled={solved}
                    aria-label={dir === "up" ? "lift up one floor" : "lift down one floor"}
                  >
                    <LiftArrow dir={dir} className="bjl-go-arrow" />
                  </button>
                ))}
              </span>
              <span className="bjl-post" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </NgStage>
  );
}

export function UpDownRound(props: RoundProps) {
  return <LiftRoundOf {...props} module="updown" />;
}
export function MatchRound(props: RoundProps) {
  return <LiftRoundOf {...props} module="match" />;
}
