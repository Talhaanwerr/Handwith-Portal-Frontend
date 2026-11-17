"use client";

import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import { ShapeLessonGame } from "@games/shape-lesson/ShapeLessonGame";
import { LESSON_PAGES, type LessonId } from "@games/shape-lesson/constants/lessons";

const useShapeTriangleStore = createModuleStore<LessonId>(
  "shape-triangle-progress",
  ["triangle"],
  LESSON_PAGES
);

/**
 * MY SHAPES: TRIANGLE — one lesson of the shapes series for 3–4-year-olds:
 * meet the triangle, pick it out, find them all, fit it in its home, spot it in
 * real things, and build a picture with it. The engine and every page are
 * the series kit's (`shape-lesson/`); this game is only its shape.
 */
export function ShapeTriangleGame() {
  const store = useShapeTriangleStore();
  return <ShapeLessonGame lesson="triangle" store={store} />;
}
