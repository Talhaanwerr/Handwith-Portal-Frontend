"use client";

import { memo, useCallback, useMemo, useRef } from "react";
import { clipText, playClip } from "@shared/audio/voice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { Chip, Socket, ThingArt } from "@games/number-match/components/MatchArt";
import { thingName, type Thing } from "@games/number-match/constants/rounds";
import { GroupFace } from "@games/number-groups/components/GroupFace";
import { NgStage } from "@games/number-groups/components/NgStage";
import { PlayroomWorld } from "@games/number-groups/components/NgWorlds";
import { useRoundCelebration } from "@games/number-groups/components/NgKit";
import { useMatchDrag } from "@games/number-groups/hooks/useMatchDrag";
import { ROUND_COUNT } from "@games/number-groups/constants/kit";
import { CARD_ROUNDS, cardTray } from "@games/number-groups/constants/rounds";
import type { RoundProps } from "@games/number-groups/components/roundProps";

/** The round's ask — said on arrival and shown in the teacher's bubble. */
const ASK = "count-match-numbers";

/**
 * NUMBER CARDS — one round (drag a NUMERAL to a GROUP).
 *
 * Three tall white cards stand on the playroom table, each with a group of
 * Number Pals' things counted out above a line and an empty slot below it.
 * The three numerals wait in a row under them, shuffled. Drag each numeral
 * into the card with that many: the number is said and confetti flies out of
 * the card as it settles in. A wrong card sends it gliding home.
 */
export function CardsRound({ round, title, onDone, onMiss, onHome, onExitPortal }: RoundProps) {
  const r = CARD_ROUNDS[round];
  const tray = useMemo(() => cardTray(round), [round]);
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const cast = useMemo(
    () =>
      [0, 1, 2].map((i) => (
        <span key={i} className="ng-cast">
          <ThingArt thing={r.thing} />
        </span>
      )),
    [r.thing]
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
    answers: r.counts,
    locked: solved,
    onMiss: missed,
    onPlaced,
    onAllPlaced,
  });

  const piece = useCallback((v: number) => <Chip value={v} />, []);

  return (
    <NgStage
      stageRef={stageRef}
      playClass="ng-play--cards"
      world={<PlayroomWorld />}
      round={round}
      solved={solved}
      say={say(clipText(ASK))}
      title={title}
      onHome={onHome}
      onExitPortal={onExitPortal}
      overlay={
        <>
          {overlay}
          {drag.layer(piece, "ng-piece--chip")}
        </>
      }
    >
      <div ref={boardRef} className="ng-cards-board">
        <div className="ng-cards-row">
          {r.counts.map((count, k) => (
            <NumberCard
              key={k}
              index={k}
              thing={r.thing}
              count={count}
              filled={drag.placed[k]}
              lit={drag.over === k}
              open={drag.dragging !== null}
              register={drag.registerTarget}
            />
          ))}
        </div>

        <div
          className={`ng-tray ${
            Object.keys(drag.placed).length >= r.counts.length ? "is-empty" : ""
          }`}
        >
          {tray.map((v) => (
            <TrayChip
              key={v}
              value={v}
              away={drag.away(v)}
              locked={solved}
              onPick={drag.pickUp}
              register={drag.registerHome}
            />
          ))}
        </div>
      </div>
    </NgStage>
  );
}

/** One tall card: its group above the line, its slot (or its numeral) below. */
const NumberCard = memo(function NumberCard({
  index,
  thing,
  count,
  filled,
  lit,
  open,
  register,
}: {
  index: number;
  thing: Thing;
  count: number;
  /** The numeral in the slot, once placed. */
  filled: number | undefined;
  /** A carried numeral is over this card. */
  lit: boolean;
  /** Something is being carried: the empty slot opens up. */
  open: boolean;
  register: (k: number, el: HTMLElement | null) => void;
}) {
  return (
    <div className={`ng-ncard ${filled !== undefined ? "is-solved" : ""}`}>
      <div className="ng-ncard-group">
        <GroupFace count={count} art={<ThingArt thing={thing} />} />
      </div>
      <span className="ng-ncard-rule" aria-hidden="true" />
      <div
        ref={(el) => register(index, el)}
        className={`ng-ncard-slot ${lit ? "is-lit" : ""}`}
        role="group"
        aria-label={
          filled !== undefined
            ? `${filled} ${thingName(thing, filled)}`
            : `The card with ${count} ${thingName(thing, count)} — its number goes here`
        }
      >
        {filled !== undefined ? (
          <span className="ng-ncard-chip">
            <Chip value={filled} big />
          </span>
        ) : (
          <Socket open={open} />
        )}
      </div>
    </div>
  );
});

const TrayChip = memo(function TrayChip({
  value,
  away,
  locked,
  onPick,
  register,
}: {
  value: number;
  away: boolean;
  locked: boolean;
  onPick: (e: React.PointerEvent<HTMLElement>, value: number) => void;
  register: (v: number, el: HTMLElement | null) => void;
}) {
  return (
    <button
      ref={(el) => register(value, el)}
      type="button"
      className={`ng-piece ng-piece--chip touch-none ${away ? "is-away" : ""}`}
      disabled={locked}
      onPointerDown={away || locked ? undefined : (e) => onPick(e, value)}
      aria-label={`Number ${value} — drag it to the card with ${value}`}
    >
      <Chip value={value} />
    </button>
  );
});
