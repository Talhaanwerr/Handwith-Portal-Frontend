"use client";

import { useCallback, useState } from "react";
import { useScheduler } from "@shared/hooks/useScheduler";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";
import { playCorrectSound, playIncorrectSound } from "@shared/audio/sfx";
import { playClip, sayAfter, stopVoice } from "@shared/audio/voice";
import {
  answerFor,
  optionLabel,
  wrongClipFor,
  type TapOption,
  type TapRound as TapRoundData,
} from "@games/color-shape-friends/constants/rounds";
import { BerryArt } from "@games/color-shape-friends/components/Friends";
import { HeldCard } from "@games/color-shape-friends/components/HeldCard";
import { EaselArt } from "@games/color-shape-friends/components/SceneDecor";
import {
  ShapeTapButton,
  type TapState,
} from "@games/color-shape-friends/components/ShapeTapButton";

interface TapRoundProps {
  /** "colors" lays the tiles on Berry's shelf; "shapes" stands them on easels. */
  module: "colors" | "shapes";
  round: TapRoundData;
  onMiss: () => void;
  onSolved: () => void;
}

/** How long the right answer's sparkle plays before the next round. */
const NEXT_MS = 1100;

/**
 * One round of the Colors or Shapes module — the same mechanic in both: tap
 * the one tile the plate asks for. A wrong tile shakes once and stays crossed
 * out (it cannot be tapped again) and counts as a miss; the right one ticks
 * and sparkles, Berry cheers, and the round moves on. Mounted fresh per round
 * (keyed by the root), so no state leaks from one round into the next.
 */
export function TapRound({ module, round, onMiss, onSolved }: TapRoundProps) {
  const [wrongIds, setWrongIds] = useState<ReadonlySet<string>>(new Set());
  const [solved, setSolved] = useState(false);
  const schedule = useScheduler();
  const answer = answerFor(round);

  // "Find the red one!" — queued, so it waits for the card's "Colors! …" line
  useSayOnEnter([round.clip]);

  const tap = useCallback(
    (option: TapOption) => {
      if (solved || wrongIds.has(option.id)) return;
      if (option.id === answer.id) {
        playCorrectSound();
        // drop a re-ask still waiting from a wrong tap; the next round asks anew
        stopVoice();
        setSolved(true);
        schedule(onSolved, NEXT_MS);
      } else {
        playIncorrectSound();
        // "That one is blue." — then the question again
        void playClip(wrongClipFor(module, option));
        void sayAfter(round.clip);
        onMiss();
        setWrongIds((cur) => new Set(cur).add(option.id));
      }
    },
    [solved, wrongIds, answer, schedule, onSolved, onMiss, module, round.clip]
  );

  const stateOf = (option: TapOption): TapState =>
    solved && option.id === answer.id ? "found" : wrongIds.has(option.id) ? "wrong" : "idle";

  return (
    <div className={`csf-stage csf-stage--${module}`}>
      <div className="csf-guide">
        <BerryArt mood={solved ? "cheer" : "point"} />
        {!solved &&
          (module === "colors" ? (
            <HeldCard kind="color" hue={answer.hue} />
          ) : (
            <HeldCard kind="shape" shape={answer.shape} />
          ))}
      </div>

      {module === "colors" ? (
        <div className="csf-table">
          <div className="csf-table-items">
            {round.options.map((option) => (
              <ShapeTapButton
                key={option.id}
                option={option}
                state={stateOf(option)}
                onTap={tap}
                ariaLabel={optionLabel(option)}
              />
            ))}
          </div>
          <div className="csf-table-top" />
          <div className="csf-table-legs">
            <span />
            <span />
          </div>
        </div>
      ) : (
        <div className="csf-easels">
          {round.options.map((option) => (
            <div key={option.id} className="csf-easel">
              <span className="csf-easel-art">
                <EaselArt />
              </span>
              <span className="csf-easel-canvas">
                <ShapeTapButton
                  option={option}
                  surface="canvas"
                  state={stateOf(option)}
                  onTap={tap}
                  ariaLabel={optionLabel(option)}
                />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
