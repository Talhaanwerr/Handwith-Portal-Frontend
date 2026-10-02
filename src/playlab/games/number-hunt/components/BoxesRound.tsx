"use client";

import { memo, useCallback, useMemo, useRef } from "react";
import { clipText, playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { cssVars } from "@shared/styles/cssVars";
import { NgStage } from "@games/number-groups/components/NgStage";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import { useMatchDrag } from "@games/number-groups/hooks/useMatchDrag";
import { ROUND_COUNT } from "@games/number-groups/constants/kit";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { ClassroomWorld } from "@games/number-hunt/components/NhWorlds";
import { QuantityCard } from "@games/number-hunt/components/QuantityCard";
import { BOX_ROUNDS, boxTray, type GroupLook } from "@games/number-hunt/constants/rounds";

/** The round's ask — said on arrival and shown in the teacher's bubble. */
const ASK = "numhunt-boxes";

/** The three boxes' paint, left to right (Pond Numbers' mode colours). */
const BIN_PAINT = [
  { face: "#E5484D", edge: "#B8363A" },
  { face: "#2E7FD6", edge: "#1F5FA6" },
  { face: "#3DAB72", edge: "#2B8A57" },
] as const;

/**
 * GROUP BOXES — one round (drag a GROUP to a NUMERAL).
 *
 * Three open boxes stand in the classroom, each with its number on the front
 * and an empty place above it. Three quantity cards wait on top, shuffled.
 * Drag each whole card into the box with its number: the number is said and
 * confetti flies out of the box as the card drops in. A wrong box sends it
 * gliding home.
 */
export function BoxesRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = BOX_ROUNDS[round];
  const tray = useMemo(() => boxTray(round), [round]);
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const cast = useMemo(
    () =>
      [0, 1].map((i) => (
        <span key={i} className="ng-cast">
          <QuantityCard look={r.look} count={1 + i} />
        </span>
      )),
    [r.look]
  );
  const { solved, burst, finish, say, overlay } = useRoundCelebration({
    cheerSeed: ROUND_COUNT + round,
    stageRef,
    cast,
    onDone,
  });

  useSayOnEnter([ASK]);

  /** A wrong place: the miss counts, and the teacher asks for a recount. */
  const missed = useCallback(() => {
    onMiss();
    void playClip("mouse-count-again");
  }, [onMiss]);

  const onPlaced = useCallback((_k: number, el: HTMLElement | undefined) => burst(el), [burst]);
  const onAllPlaced = useCallback(() => finish(boardRef.current), [finish]);

  const drag = useMatchDrag({
    stageRef,
    answers: r.numbers,
    locked: solved,
    onMiss: missed,
    onPlaced,
    onAllPlaced,
  });

  const piece = useCallback((v: number) => <QuantityCard look={r.look} count={v} />, [r.look]);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="nh-play--boxes"
      world={<ClassroomWorld />}
      round={round}
      solved={solved}
      say={say(clipText(ASK))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {drag.layer(piece, "nh-piece--qcard")}
        </>
      }
    >
      <div ref={boardRef} className="nh-boxes-board">
        <div className="ng-tray nh-tray--qcards">
          {tray.map((v) => (
            <TrayCard
              key={v}
              value={v}
              look={r.look}
              away={drag.away(v)}
              locked={solved}
              onPick={drag.pickUp}
              register={drag.registerHome}
            />
          ))}
        </div>

        <div className="nh-bins">
          {r.numbers.map((n, k) => (
            <Bin
              key={n}
              index={k}
              number={n}
              look={r.look}
              filled={drag.placed[k]}
              lit={drag.over === k}
              register={drag.registerTarget}
              registerSeat={drag.registerSeat}
            />
          ))}
        </div>
      </div>
    </NgStage>
  );
}

/** One open box: its number on the front, the place above where a card drops in. */
const Bin = memo(function Bin({
  index,
  number,
  look,
  filled,
  lit,
  register,
  registerSeat,
}: {
  index: number;
  number: number;
  look: GroupLook;
  /** The card in it, once placed. */
  filled: number | undefined;
  /** A carried card is over this box. */
  lit: boolean;
  register: (k: number, el: HTMLElement | null) => void;
  registerSeat: (k: number, el: HTMLElement | null) => void;
}) {
  return (
    <div
      ref={(el) => register(index, el)}
      className={`nh-bin ${lit ? "is-lit" : ""} ${filled !== undefined ? "is-full" : ""}`}
      style={cssVars({
        "--nh-bin": BIN_PAINT[index].face,
        "--nh-bin-edge": BIN_PAINT[index].edge,
      })}
      role="group"
      aria-label={filled !== undefined ? `Box ${number} — full` : `Box ${number}`}
    >
      <span className="nh-bin-back" aria-hidden="true" />
      <span ref={(el) => registerSeat(index, el)} className="nh-bin-slot" aria-hidden="true">
        {filled !== undefined && <QuantityCard look={look} count={filled} />}
      </span>
      <span className="nh-bin-front" aria-hidden="true">
        <span className="nh-bin-num font-rounded font-black">{number}</span>
      </span>
    </div>
  );
});

const TrayCard = memo(function TrayCard({
  value,
  look,
  away,
  locked,
  onPick,
  register,
}: {
  value: number;
  look: GroupLook;
  away: boolean;
  locked: boolean;
  onPick: (e: React.PointerEvent<HTMLElement>, value: number) => void;
  register: (v: number, el: HTMLElement | null) => void;
}) {
  return (
    <button
      ref={(el) => register(value, el)}
      type="button"
      className={`ng-piece nh-piece--qcard touch-none ${away ? "is-away" : ""}`}
      disabled={locked}
      onPointerDown={away || locked ? undefined : (e) => onPick(e, value)}
      aria-label={`A card with ${value} ${look === "dots" ? "dot" : look}${
        value === 1 ? "" : "s"
      } — drag it to box ${value}`}
    >
      <QuantityCard look={look} count={value} />
    </button>
  );
});
