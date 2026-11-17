"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { fluentSrc } from "@shared/constants/fluent3d";
import {
  LESSONS,
  MODULES,
  ROUNDS,
  VOICE,
  type ModuleId,
} from "@games/sticker-studio/constants/rounds";
import { StkWorld, makeRound } from "@games/sticker-studio/components/StkRounds";

/** A lesson in miniature for its home card: three of its stickers. */
function StkMini({ id }: { id: ModuleId }) {
  return (
    <span className="stk-mini" aria-hidden="true">
      {LESSONS[id].stickers.slice(0, 3).map((s) => (
        <span key={s} className="stk-mini-pic">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fluentSrc(s) ?? ""} alt="" draggable={false} />
        </span>
      ))}
    </span>
  );
}

/**
 * STICKER STUDIO — one picture-making lesson as its own game. Each
 * `sticker-studio-*` game calls this ONCE at module level with its scene and
 * gets its component back: four stickers are asked for one at a time, then
 * the child makes the picture their own and taps Done.
 *
 * Kit folder, not a game. Count & Match's shell, guided and `single`; every
 * scene is a world another game already draws; the stickers are the Fluent 3D
 * pictures.
 */
export function makeStickerStudio(id: ModuleId): ComponentType {
  const info = MODULES.filter((m) => m.id === id);
  const useStore = createModuleStore(`sticker-studio-${id}-progress`, [id] as const, ROUNDS);
  const rounds = { [id]: makeRound(id) } as Record<ModuleId, ComponentType<RoundProps>>;
  return function StickerStudioLesson() {
    const store = useStore();
    return (
      <div className="apa-game stk-game">
        <NgShell
          title={LESSONS[id].title}
          guided
          single
          roundCount={ROUNDS}
          voice={VOICE}
          store={store}
          modules={info}
          rounds={rounds}
          Mini={StkMini}
          world={<StkWorld id={id} />}
        />
      </div>
    );
  };
}

/** A lesson's Library card: its colour, and three of its stickers scattered
 *  like a picture. Inline SVG only (the Library page does not load
 *  playlab.css). */
export function StickerStudioIcon({ id }: { id: ModuleId }) {
  const l = LESSONS[id];
  const spots = [
    [10, 14, 38],
    [52, 30, 34],
    [24, 54, 36],
  ] as const;
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill={l.accent} opacity="0.28" />
        <rect x="6" y="6" width="88" height="88" rx="14" fill="#FFFFFF" />
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="14"
          fill="none"
          stroke={l.accent}
          strokeWidth="3"
          strokeDasharray="6 5"
        />
        {l.stickers.slice(0, 3).map((s, i) => (
          <image
            key={s}
            href={fluentSrc(s) ?? ""}
            x={spots[i][0]}
            y={spots[i][1]}
            width={spots[i][2]}
            height={spots[i][2]}
          />
        ))}
      </svg>
    </div>
  );
}
