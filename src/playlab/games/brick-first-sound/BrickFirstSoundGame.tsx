"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrickShell, type PlayApi } from "@games/brick-lab/engine/BrickShell";
import { BrickBoard, type SnapResult } from "@games/brick-lab/engine/BrickBoard";
import { RoundWin } from "@games/brick-lab/engine/RoundWin";
import { RoundDots } from "@games/brick-lab/engine/RoundDots";
import type { Brick, BrickKind } from "@games/brick-lab/engine/geometry";
import type { Landing } from "@games/brick-lab/engine/world";
import { HERO_PLATE } from "@games/brick-lab/constants/models";
import { SOUND_POOL, SOUND_WORDS, threeLetters } from "@games/brick-lab/constants/literacy";
import { Picture } from "@games/blend-read/components/PictureArt";
import { playClip, playSequence, stopVoice } from "@shared/audio/voice";
import { playClickSound, playStarPop } from "@shared/audio/sfx";
import { cheerFor } from "@shared/audio/cheers";

const HERO: Brick[] = [
  { id: "h1", x: 1, z: 2, y: 0, w: 2, d: 2, color: "red", tag: "b" },
  { id: "h2", x: 3, z: 2, y: 0, w: 2, d: 2, color: "blue", tag: "s" },
  { id: "h3", x: 5, z: 2, y: 0, w: 2, d: 2, color: "green", tag: "c" },
  { id: "h4", x: 3, z: 2, y: 1, w: 2, d: 2, color: "orange", tag: "a" },
];

/**
 * FIRST SOUND — a picture, three letter bricks, one spot on the plate. Which
 * letter does "ball" start with? The child puts that brick on the spot; it
 * says its sound and then the word ("b… ball!"). A wrong letter bumps back
 * and the word is said again, slowly enough to hear its first sound.
 */
export function BrickFirstSoundGame() {
  return (
    <BrickShell
      title="First Sound"
      tagline="Which letter does it start with?"
      hero={HERO}
      heroPlate={HERO_PLATE}
      welcomeClip="brick-sound-welcome"
      doneClip="brick-sound-all"
      play={(api) => <FirstSound api={api} />}
    />
  );
}

const PLATE = { w: 6, d: 4 };
const SPOT = { x: 2, z: 1, y: 0, w: 2, d: 2 };

function FirstSound({ api }: { api: PlayApi }) {
  const [ri, setRi] = useState(0);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [won, setWon] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const word = SOUND_WORDS[ri];
  const first = word.word[0];

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      stopVoice();
    },
    []
  );

  // "Ball. What sound does it start with?"
  useEffect(() => {
    const w = SOUND_WORDS[ri];
    const t = setTimeout(() => void playSequence([w.clip, "brick-sound-ask"], 250), 600);
    return () => clearTimeout(t);
  }, [ri]);

  const tray: BrickKind[] = useMemo(
    () => (won ? [] : threeLetters(first, SOUND_POOL, ri)),
    [won, first, ri]
  );

  const snap = useCallback(
    (
      _k: BrickKind,
      free: Landing | null,
      all: readonly Brick[],
      via: string
    ): SnapResult | null => {
      if (via === "drag" && !free) return null;
      if (all.length > 0) return null;
      return { spot: SPOT, ok: true };
    },
    []
  );

  const accept = useCallback((b: Brick) => b.tag === first, [first]);

  const onPlaced = useCallback(
    (b: Brick, all: readonly Brick[]) => {
      setWon(true);
      playStarPop();
      void playSequence([`phonics-${b.tag}`, word.clip, cheerFor(ri + 3)], 260);
      timer.current = setTimeout(() => {
        setWon(false);
        setBricks([]);
        if (ri + 1 >= SOUND_WORDS.length) api.finish(all, PLATE);
        else setRi(ri + 1);
      }, 3400);
    },
    [api, ri, word.clip]
  );

  const answer = tray.findIndex((k) => k.tag === first);

  return (
    <BrickBoard
      key={ri}
      plate={PLATE}
      bricks={bricks}
      onChange={setBricks}
      tray={tray}
      editable={false}
      levels={2}
      snap={snap}
      accept={accept}
      onPlaced={onPlaced}
      onRejected={() => void playSequence(["instr-try-again", word.clip], 200)}
      marks={won ? undefined : [SPOT]}
      locked={won}
      handFrom={won || answer < 0 ? undefined : answer}
      plateColor="#BFE3C4"
      initialYaw={-0.3}
      topInset={150}
    >
      <button
        className="bk-sound-card"
        onClick={() => {
          playClickSound();
          void playClip(word.clip);
        }}
        aria-label={`Hear the word ${word.word} again`}
      >
        <span className="bk-sound-pic">
          <Picture id={word.picture} />
        </span>
        <span className="bk-sound-word font-rounded font-black">
          <span className={`bk-sound-first ${won ? "bk-sound-first--on" : ""}`}>
            {won ? first : "?"}
          </span>
          {word.word.slice(1)}
        </span>
      </button>
      <RoundDots total={SOUND_WORDS.length} at={ri} />
      {won && <RoundWin label={`${word.word} starts with ${first}!`} />}
    </BrickBoard>
  );
}
