"use client";

import type { ComponentType, ReactNode } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import type { ModuleStore } from "@games/number-groups/store/createModuleStore";
import { LessonWorld } from "@games/word-lesson/components/LessonWorld";
import { LessonPage } from "@games/word-lesson/components/Pages";
import { WlPic } from "@games/word-lesson/components/LessonArt";
import {
  SET_ROUNDS,
  lessonRounds,
  picOf,
  type Lesson,
  type LessonModule,
} from "@games/word-lesson/constants/lesson";

export interface LessonKit {
  rounds: Record<LessonModule, ComponentType<RoundProps>>;
  Mini: ComponentType<{ id: LessonModule }>;
  world: ReactNode;
}

/**
 * One lesson's parts for NgShell, made ONCE at module level by each
 * `words-*` game (`const KIT = makeLesson(LESSON)`), so the components stay
 * the same from render to render.
 */
export function makeLesson(lesson: Lesson): LessonKit {
  function Round(props: RoundProps) {
    return <LessonPage {...props} lesson={lesson} />;
  }
  /** The lesson in miniature: its first two words on cards. */
  function Mini({ id }: { id: LessonModule }) {
    return (
      <span
        className={`ng-mini wl-mini wl-game--${lesson.scene}`}
        data-module={id}
        aria-hidden="true"
      >
        {lesson.meet.slice(0, 2).map((w) => (
          <span key={w} className="wl-mini-card">
            <WlPic src={picOf(w)} />
          </span>
        ))}
      </span>
    );
  }
  return { rounds: { learn: Round }, Mini, world: <LessonWorld scene={lesson.scene} /> };
}

/**
 * MY FIRST WORDS — a lesson: Count & Match's shell, guided and `single`
 * (the title, one big Play button over the lesson's room, six pages, the
 * star card). Every lesson plays the same six pages in its own room.
 */
export function WordLessonShell({
  lesson,
  store,
  kit,
}: {
  lesson: Lesson;
  store: ModuleStore<LessonModule>;
  kit: LessonKit;
}) {
  return (
    <div className={`apa-game wl-game wl-game--${lesson.scene}`}>
      <NgShell
        title={lesson.title}
        guided
        single
        roundCount={lessonRounds(lesson)}
        breakEvery={lesson.sets ? SET_ROUNDS : 0}
        voice={lesson.voice}
        store={store}
        modules={[lesson.module]}
        rounds={kit.rounds}
        Mini={kit.Mini}
        world={kit.world}
      />
    </div>
  );
}

/**
 * A lesson's Library card: its room's colours, a floor, and two of its words
 * on white cards. Inline SVG and images only (the Library page does not load
 * playlab.css). Nothing moves.
 */
export function LessonIcon({
  sky,
  floor,
  edge,
  words,
}: {
  sky: string;
  floor: string;
  edge: string;
  words: readonly [string, string];
}) {
  return (
    <div
      className="pointer-events-none relative aspect-square w-full overflow-hidden rounded-[22%]"
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 block h-full w-full">
        <rect width="100" height="100" fill={sky} />
        <rect y="70" width="100" height="30" fill={floor} />
        {words.map((w, i) => (
          <g
            key={w}
            transform={`translate(${8 + i * 46} ${i === 0 ? 26 : 34}) rotate(${i === 0 ? -6 : 6} 19 19)`}
          >
            <rect x="0" y="3" width="38" height="38" rx="9" fill={edge} />
            <rect x="0" y="0" width="38" height="38" rx="9" fill="#FFFFFF" />
            <image href={picOf(w)} x="5" y="5" width="28" height="28" />
          </g>
        ))}
      </svg>
    </div>
  );
}
