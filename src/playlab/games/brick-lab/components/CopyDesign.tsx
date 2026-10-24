"use client";

import { useCallback, useMemo, useState } from "react";
import { BrickBoard } from "@games/brick-lab/engine/BrickBoard";
import { ModelView, type PlayApi } from "@games/brick-lab/engine/BrickShell";
import { RoundWin } from "@games/brick-lab/engine/RoundWin";
import type { Brick } from "@games/brick-lab/engine/geometry";
import {
  DESIGNS,
  compareBuild,
  designTray,
  type CopyResult,
  type Design,
} from "@games/brick-lab/constants/designs";
import { playClip } from "@shared/audio/voice";
import { playClickSound, playStarPop } from "@shared/audio/sfx";
import { cheerFor } from "@shared/audio/cheers";
import { useAfterVoice } from "@shared/hooks/useAfterVoice";
import { useSayOnEnter } from "@shared/hooks/useSayOnEnter";

/**
 * COPY THE DESIGN — pick a design, see it beside the plate the whole time,
 * and build the same with the bricks in the tray. "That's it!" checks the
 * build against the design: right → a cheer and back to the designs (with a
 * star on the one just built); not yet → a gentle line saying what to look at
 * and the child simply keeps building. Nothing is lost or timed.
 */
export function CopyDesign({ api }: { api: PlayApi }) {
  const [chosen, setChosen] = useState<number | null>(null);
  const [done, setDone] = useState<ReadonlySet<number>>(new Set());

  if (chosen === null) {
    return (
      <Picker
        done={done}
        onPick={(i) => {
          playClickSound();
          setChosen(i);
        }}
      />
    );
  }
  return (
    <Build
      key={chosen}
      index={chosen}
      design={DESIGNS[chosen]}
      onBack={() => {
        playClickSound();
        setChosen(null);
      }}
      onBuilt={(bricks) => {
        const next = new Set(done).add(chosen);
        setDone(next);
        if (next.size >= DESIGNS.length) api.finish(bricks, DESIGNS[chosen].plate);
        else setChosen(null);
      }}
    />
  );
}

function Picker({ done, onPick }: { done: ReadonlySet<number>; onPick: (i: number) => void }) {
  useSayOnEnter(["brick-copy-pick"]);
  return (
    <div className="bk-pick">
      <h2 className="bk-pick-title font-rounded font-black">Pick a design to build</h2>
      <div className="bk-pick-grid">
        {DESIGNS.map((d, i) => (
          <button
            key={d.id}
            className={`bk-pick-card font-rounded font-black ${done.has(i) ? "bk-pick-card--done" : ""}`}
            onClick={() => onPick(i)}
            aria-label={`${d.name}, ${d.kind}${done.has(i) ? ", built" : ""}`}
          >
            <span className="bk-pick-model">
              <ModelView bricks={d.bricks} plate={d.plate} size={180} />
            </span>
            <span className="bk-pick-name">{d.name}</span>
            <span className="bk-pick-kind">{d.kind}</span>
            {done.has(i) && (
              <span className="bk-pick-star" aria-hidden="true">
                ★
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Upright phones: the reference picture sits above the plate, so keep that
 *  strip clear. Wider screens have it beside the plate. */
function copyInset(h: number, w: number): number {
  if (h < 520) return 66;
  return w < 700 ? 226 : 96;
}

const MESSAGE: Record<CopyResult["hint"], string> = {
  empty: "Put some bricks on the plate!",
  more: "That is a lot of bricks. Take one off.",
  fewer: "Keep going! The picture has more bricks.",
  colours: "Almost! Look at the colours.",
  shape: "Almost! Look at where each brick goes.",
};

function Build({
  index,
  design,
  onBack,
  onBuilt,
}: {
  index: number;
  design: Design;
  onBack: () => void;
  onBuilt: (bricks: readonly Brick[]) => void;
}) {
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [won, setWon] = useState(false);
  const [msg, setMsg] = useState("");
  const { thenAfter } = useAfterVoice();
  const tray = useMemo(() => designTray(design, index), [design, index]);
  const levels = Math.max(4, ...design.bricks.map((b) => b.y + 3));

  useSayOnEnter(["brick-copy-same"]);

  const check = useCallback(() => {
    if (won) return;
    const r = compareBuild(design.bricks, bricks);
    if (!r.same) {
      playClickSound();
      setMsg(MESSAGE[r.hint]);
      void playClip("brick-pattern-look");
      return;
    }
    setMsg("");
    setWon(true);
    playStarPop();
    thenAfter([cheerFor(index + 1), "brick-steps-done"], () => {
      setWon(false);
      onBuilt(bricks);
    });
  }, [won, design.bricks, bricks, index, thenAfter, onBuilt]);

  return (
    <BrickBoard
      plate={design.plate}
      bricks={bricks}
      onChange={(next) => {
        setMsg("");
        setBricks(next);
      }}
      tray={tray}
      levels={levels}
      locked={won}
      plateColor="#8FC9EA"
      topInsetFor={copyInset}
    >
      <div className="bk-ref" aria-label={`Build this: ${design.name}`}>
        <span className="bk-ref-title font-rounded font-black">Build this!</span>
        <ModelView bricks={design.bricks} plate={design.plate} size={220} plateColor="#8FC9EA" />
        <span className="bk-ref-name font-rounded font-black">{design.name}</span>
      </div>
      {msg && (
        <p className="bk-copy-msg font-rounded font-black" role="status">
          {msg}
        </p>
      )}
      <div className="bk-copy-actions">
        <button
          className="bk-btn bk-hud-small font-rounded font-black"
          onClick={onBack}
          aria-label="Back to the designs"
        >
          Designs
        </button>
        <button
          className="bk-btn bk-hud-small font-rounded font-black"
          disabled={won || bricks.length === 0}
          onClick={() => {
            playClickSound();
            setBricks((all) => all.slice(0, -1));
          }}
          aria-label="Undo the last brick"
        >
          Undo
        </button>
        <button
          className="bk-btn bk-hud-small bk-copy-clear font-rounded font-black"
          disabled={won || bricks.length === 0}
          onClick={() => {
            playClickSound();
            setBricks([]);
          }}
          aria-label="Clear the plate"
        >
          Clear
        </button>
        <button
          className="bk-btn bk-btn--go bk-copy-check font-rounded font-black"
          disabled={won || bricks.length === 0}
          onClick={check}
          aria-label="Check my build against the picture"
        >
          That&apos;s it!
        </button>
      </div>
      {won && <RoundWin label={`You built the ${design.name}!`} />}
    </BrickBoard>
  );
}
