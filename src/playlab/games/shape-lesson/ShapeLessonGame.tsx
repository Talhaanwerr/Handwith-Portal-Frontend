"use client";

import type { ComponentType } from "react";
import { NgShell } from "@games/number-groups/components/NgShell";
import type { GameVoice, ModuleInfo } from "@games/number-groups/constants/kit";
import type { ModuleStore } from "@games/number-groups/store/createModuleStore";
import type { RoundProps } from "@games/number-groups/components/roundProps";
import {
  LESSONS,
  LESSON_PAGES,
  VOICE_OF,
  moduleOf,
  type LessonId,
} from "@games/shape-lesson/constants/lessons";
import { LessonContext } from "@games/shape-lesson/components/lessonKit";
import { MshWorld } from "@games/shape-lesson/components/MshWorld";
import { LessonMini } from "@games/shape-lesson/components/LessonMini";
import { MeetPage } from "@games/shape-lesson/components/MeetPage";
import { WhichPage } from "@games/shape-lesson/components/WhichPage";
import { AllPage } from "@games/shape-lesson/components/AllPage";
import { PuzzlePage } from "@games/shape-lesson/components/PuzzlePage";
import { WorldPage } from "@games/shape-lesson/components/WorldPage";
import { BuildPage } from "@games/shape-lesson/components/BuildPage";

/** The six pages, in the order every lesson plays them. */
const PAGES: readonly ComponentType<RoundProps>[] = [
  MeetPage,
  WhichPage,
  AllPage,
  PuzzlePage,
  WorldPage,
  BuildPage,
];

/** One "round" of the shell is one page of the lesson. */
function LessonRound(props: RoundProps) {
  const Page = PAGES[Math.min(props.round, PAGES.length - 1)];
  return <Page {...props} />;
}

const ROUNDS: Record<LessonId, ComponentType<RoundProps>> = {
  circle: LessonRound,
  square: LessonRound,
  triangle: LessonRound,
  rectangle: LessonRound,
  star: LessonRound,
};

/** Each lesson's one module and voice, made once. */
const MODULES: Record<LessonId, readonly ModuleInfo<LessonId>[]> = {
  circle: [moduleOf("circle")],
  square: [moduleOf("square")],
  triangle: [moduleOf("triangle")],
  rectangle: [moduleOf("rectangle")],
  star: [moduleOf("star")],
};
const VOICES: Record<LessonId, GameVoice> = {
  circle: VOICE_OF("circle"),
  square: VOICE_OF("square"),
  triangle: VOICE_OF("triangle"),
  rectangle: VOICE_OF("rectangle"),
  star: VOICE_OF("star"),
};

/**
 * MY SHAPES — the lesson engine every shape game is: Count & Match's shell in
 * its guided layout, one module, six pages (MEET · WHICH ONE? · TAP THEM ALL ·
 * PUZZLE · IN MY WORLD · BUILD A PICTURE). A lesson's game hands in its shape
 * and its own store; everything else comes from the lesson's data.
 */
export function ShapeLessonGame({
  lesson,
  store,
}: {
  lesson: LessonId;
  store: ModuleStore<LessonId>;
}) {
  const L = LESSONS[lesson];
  return (
    <div className={`apa-game msh-game msh-game--${lesson}`}>
      <LessonContext.Provider value={lesson}>
        <NgShell
          title={L.title}
          guided
          single
          roundCount={LESSON_PAGES}
          voice={VOICES[lesson]}
          store={store}
          modules={MODULES[lesson]}
          rounds={ROUNDS}
          Mini={LessonMini}
          world={<MshWorld scene={L.scene} />}
        />
      </LessonContext.Provider>
    </div>
  );
}
