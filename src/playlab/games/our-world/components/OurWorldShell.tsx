"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import { fluentSrc } from "@shared/constants/fluent3d";
import { LessonWorld } from "@games/word-lesson/components/LessonWorld";
import { LESSONS, MODULES, ROUNDS, VOICE, type ModuleId } from "@games/our-world/constants/rounds";
import { makeRound } from "@games/our-world/components/OwdRounds";

/** A lesson in miniature for its home card: one thing from each place. */
function OwdMini({ id }: { id: ModuleId }) {
  return (
    <span className="owd-mini" aria-hidden="true">
      {LESSONS[id].places.map((p) => (
        <span key={p.key} className="owd-mini-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fluentSrc(p.things[0]) ?? ""} alt="" draggable={false} />
        </span>
      ))}
    </span>
  );
}

/**
 * OUR WORLD — one lesson as its own game. Each `our-world-*` game calls this
 * ONCE at module level with its lesson and gets its component back: two
 * places and eight things, sorted, picked and checked for the odd one out. A
 * break card (Continue / Back) comes half-way.
 *
 * Kit folder, not a game. Count & Match's shell, guided and `single`; the
 * park is First Words'; the pictures are the Fluent 3D set.
 */
export function makeOurWorld(id: ModuleId): ComponentType {
  const info = MODULES.filter((m) => m.id === id);
  const useStore = createModuleStore(`our-world-${id}-progress`, [id] as const, ROUNDS);
  const rounds = { [id]: makeRound(id) } as Record<ModuleId, ComponentType<RoundProps>>;
  return function OurWorldLesson() {
    const store = useStore();
    return (
      <div className="apa-game owd-game">
        <NgShell
          title={LESSONS[id].title}
          guided
          single
          roundCount={ROUNDS}
          breakEvery={3}
          voice={VOICE}
          store={store}
          modules={info}
          rounds={rounds}
          Mini={OwdMini}
          world={<LessonWorld scene="park" />}
        />
      </div>
    );
  };
}

/** A lesson's Library card: a sky, the grass, and one thing from each of its
 *  two places on white cards. Inline SVG only (the Library page does not load
 *  playlab.css). */
export function OurWorldIcon({ id }: { id: ModuleId }) {
  const l = LESSONS[id];
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill="#A9DEF7" />
        <rect y="70" width="100" height="30" fill="#7CC35E" />
        {l.places.map((p, i) => (
          <g
            key={p.key}
            transform={`translate(${8 + i * 46} ${i === 0 ? 26 : 34}) rotate(${i === 0 ? -6 : 6} 19 19)`}
          >
            <rect x="0" y="3" width="38" height="38" rx="9" fill={p.edge} />
            <rect x="0" y="0" width="38" height="38" rx="9" fill="#FFFFFF" />
            <image href={fluentSrc(p.things[0]) ?? ""} x="5" y="5" width="28" height="28" />
          </g>
        ))}
      </svg>
    </div>
  );
}
