"use client";

import { useCallback, useMemo, useState } from "react";
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
import { playClip, playSequence } from "@shared/audio/voice";
import { useAfterVoice, useIntro } from "@shared/hooks/useAfterVoice";
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
/** The strip the picture card needs at the top: picture + letter spots (tall
 *  screens) or one short row (short screens). Mirrors .bk-spell-card sizes. */
function spellInset(h: number, w: number): number {
  if (h < 520) return 118;
  const pic = Math.min(230, Math.max(120, h * 0.26));
  // Narrow (upright phone) screens keep the card below the two pills.
  return pic + 100 + (w < 700 ? 56 : 0);
}

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
  const { thenAfter } = useAfterVoice();
  const word = SPELL_WORDS[wi];
  const n = bricks.length;
  const need = word.text[n];

  // Each word opens by being said: "Spell … cat." The board holds still until
  // the whole line has been said, so an early tap cannot cut it off.
  const intro = useIntro(
    wi === 0 ? ["brick-spell-build", SPELL_WORDS[wi].clip] : [SPELL_WORDS[wi].clip],
    wi
  );
  const busy = intro || won;

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
      // Sound it out, then say it whole: c — a — t … cat! The next word (or the
      // star card) comes only once the whole line has finished playing.
      thenAfter(
        [...word.text.split("").map((l) => `phonics-${l}`), word.clip, cheerFor(wi + 1)],
        () => {
          setWon(false);
          setBricks([]);
          if (wi + 1 >= SPELL_WORDS.length) api.finish(all, SPELL_PLATE);
          else setWi(wi + 1);
        },
        180
      );
    },
    [api, wi, word, thenAfter]
  );

  const onRejected = useCallback(() => {
    if (need) void playSequence(["instr-try-again", `phonics-${need}`], 150);
  }, [need]);

  // Replay the word — only while nothing required is being said, so a tap
  // can never cut the instruction or the celebration off.
  const hear = useCallback(() => {
    if (busy) return;
    playClickSound();
    void playClip(word.clip);
  }, [busy, word.clip]);

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
      locked={busy}
      handFrom={busy || answer < 0 ? undefined : answer}
      plateColor="#F6E7C8"
      initialYaw={-0.18}
      topInsetFor={spellInset}
    >
      <div className="bk-spell-card">
        <button
          className="bk-spell-pic"
          onClick={hear}
          disabled={busy}
          aria-label={`Hear the word ${word.text}`}
        >
          <Picture id={word.picture} photo />
        </button>
        <div className="bk-spell-row">
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
          <button
            className="bk-spell-hear"
            onClick={hear}
            disabled={busy}
            aria-label="Hear the word again"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
              <path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z" />
            </svg>
          </button>
        </div>
      </div>
      <RoundDots total={SPELL_WORDS.length} at={wi} />
      {won && <RoundWin label={`You spelled ${word.text}!`} />}
    </BrickBoard>
  );
}
