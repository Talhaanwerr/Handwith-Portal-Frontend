"use client";

import { LESSONS, type LessonId } from "@games/shape-lesson/constants/lessons";
import { ShapeArt } from "@games/shape-lesson/components/ShapeArt";

/** A lesson in miniature (the star card): its shape, big, in its colour. */
export function LessonMini({ id }: { id: LessonId }) {
  return (
    <span className="ng-mini msh-mini" data-module={id} aria-hidden="true">
      <span className={`msh-mini-shape msh-box--${id}`}>
        <ShapeArt shape={id} hue={LESSONS[id].hue} />
      </span>
    </span>
  );
}
