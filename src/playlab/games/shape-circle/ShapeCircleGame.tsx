"use client";

import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import { ShapeLessonGame } from "@games/shape-lesson/ShapeLessonGame";
import { LESSON_PAGES, type LessonId } from "@games/shape-lesson/constants/lessons";

const useShapeCircleStore = createModuleStore<LessonId>(
  "shape-circle-progress",
  ["circle"],
  LESSON_PAGES
);

/**
 * MY SHAPES: CIRCLE — one lesson of the shapes series for 3–4-year-olds:
 * meet the circle, pick it out, find them all, fit it in its home, spot it in
 * real things, and build a picture with it. The engine and every page are
 * the series kit's (`shape-lesson/`); this game is only its shape.
 */
export function ShapeCircleGame() {
  const store = useShapeCircleStore();
  return <ShapeLessonGame lesson="circle" store={store} />;
}
