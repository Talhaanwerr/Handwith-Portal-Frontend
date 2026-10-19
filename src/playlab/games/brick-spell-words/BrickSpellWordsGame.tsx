"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BrickShell, type PlayApi } from "@games/brick-lab/engine/BrickShell";
import { BrickBoard, type SnapResult } from "@games/brick-lab/engine/BrickBoard";
import { RoundWin } from "@games/brick-lab/engine/RoundWin";
import { RoundDots } from "@games/brick-lab/engine/RoundDots";
import type { Brick, BrickKind } from "@games/brick-lab/engine/geometry";
import type { Landing } from "@games/brick-lab/engine/world";
import { HERO_SPELL, HERO_PLATE } from "@games/brick-lab/constants/models";
import {
  SPELL_WORDS,
  SPELL_PLATE,
  SPELL_W,
  SPELL_Z,
  letterColor,
  spellChoices,
} from "@games/brick-lab/constants/spell";
import { Picture } from "@games/blend-read/components/PictureArt";
import { playClip, playSequence, stopVoice } from "@shared/audio/voice";
import { playClickSound, playStarPop } from "@shared/audio/sfx";
import { cheerFor } from "@shared/audio/cheers";

/**
 * SPELL BRICKS — the literacy game on the brick engine.
 *
 * A picture (cat) and three empty spots on the plate. The tray holds letter
 * bricks — the word's letters and two that are not in it, the brick colours
 * mixed so colour never gives the answer. The child builds the word left to
 * right; each letter brick says its SOUND as it clicks on ("c… a… t…"), and
 * the finished word is sounded out and then said whole: blending, built by
 * hand. A wrong letter bumps back and the needed sound is said again.
 */
export function BrickSpellWordsGame() {
  return (
    <BrickShell
      title="Spell Bricks"
      tagline="Build words with letter bricks"
      hero={HERO_SPELL}
      heroPlate={HERO_PLATE}
      welcomeClip="brick-spell-welcome"
      doneClip="brick-spell-all"
      play={(api) => <Spell api={api} />}
    />
  );
}

function Spell({ api }: { api: PlayApi }) {
  const [wi, setWi] = useState(0);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [won, setWon] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const word = SPELL_WORDS[wi];
  const n = bricks.length;
  const need = word.text[n];

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      stopVoice();
    },
    []
  );

  // Each word opens by being said: "Spell … cat."
  useEffect(() => {
    const lines = wi === 0 ? ["brick-spell-build", SPELL_WORDS[wi].clip] : [SPELL_WORDS[wi].clip];
    const t = setTimeout(() => void playSequence(lines, 200), 600);
    return () => clearTimeout(t);
  }, [wi]);

  const tray: BrickKind[] = useMemo(
    () => (won ? [] : spellChoices(word.text, wi)),
    [won, word.text, wi]
  );

  const snap = useCallback(
    (
      _k: BrickKind,
      free: Landing | null,
      all: readonly Brick[],
      via: string
    ): SnapResult | null => {
      if (via === "drag" && !free) return null;
      if (all.length >= word.text.length) return null;
      return {
        spot: { x: 1 + all.length * SPELL_W, z: SPELL_Z, y: 0, w: SPELL_W, d: SPELL_W },
        ok: true,
      };
    },
    [word.text.length]
  );

  const accept = useCallback(
    (b: Brick, all: readonly Brick[]) => b.tag === word.text[all.length],
    [word.text]
  );

  const onPlaced = useCallback(
    (b: Brick, all: readonly Brick[]) => {
      if (all.length < word.text.length) {
        void playClip(`phonics-${b.tag}`);
        return;
      }
      setWon(true);
      playStarPop();
      // Sound it out, then say it whole: c — a — t … cat!
      void playSequence(
        [...word.text.split("").map((l) => `phonics-${l}`), word.clip, cheerFor(wi + 1)],
        180
      );
      timer.current = setTimeout(() => {
        setWon(false);
        setBricks([]);
        if (wi + 1 >= SPELL_WORDS.length) api.finish(all, SPELL_PLATE);
        else setWi(wi + 1);
      }, 4200);
    },
    [api, wi, word]
  );

  const onRejected = useCallback(() => {
    if (need) void playSequence(["instr-try-again", `phonics-${need}`], 150);
  }, [need]);

  const answer = tray.findIndex((k) => k.tag === need);
  const slots = useMemo(
    () =>
      Array.from({ length: word.text.length }, (_, i) => ({
        x: 1 + i * SPELL_W,
        z: SPELL_Z,
        y: 0,
        w: SPELL_W,
        d: SPELL_W,
      })),
    [word.text.length]
  );

  return (
    <BrickBoard
      key={wi}
      plate={SPELL_PLATE}
      bricks={bricks}
      onChange={setBricks}
      tray={tray}
      editable={false}
      levels={2}
      snap={snap}
      accept={accept}
      onPlaced={onPlaced}
      onRejected={onRejected}
      marks={won ? undefined : slots.slice(n, n + 1)}
      locked={won}
      handFrom={won || answer < 0 ? undefined : answer}
      plateColor="#F6E7C8"
      initialYaw={-0.18}
      topInset={110}
    >
      <div className="bk-spell-card">
        <button
          className="bk-spell-pic"
          onClick={() => {
            playClickSound();
            void playClip(word.clip);
          }}
          aria-label={`Hear the word ${word.text}`}
        >
          <Picture id={word.picture} />
        </button>
        <div className="bk-spell-word" aria-label={`Spell ${word.text}`}>
          {word.text.split("").map((l, i) => (
            <span
              key={i}
              className={`bk-spell-letter bk-c--${letterColor(l, wi)} ${
                i < n ? "bk-spell-letter--on" : ""
              } ${i === n && !won ? "bk-spell-letter--now" : ""}`}
            >
              {i < n ? l : ""}
            </span>
          ))}
        </div>
      </div>
      <RoundDots total={SPELL_WORDS.length} at={wi} />
      {won && <RoundWin label={`You spelled ${word.text}!`} />}
    </BrickBoard>
  );
}
