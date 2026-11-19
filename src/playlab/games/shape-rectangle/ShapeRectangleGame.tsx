"use client";

import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import { ShapeLessonGame } from "@games/shape-lesson/ShapeLessonGame";
import { LESSON_PAGES, type LessonId } from "@games/shape-lesson/constants/lessons";

const useShapeRectangleStore = createModuleStore<LessonId>(
  "shape-rectangle-progress",
  ["rectangle"],
  LESSON_PAGES
);

/**
 * MY SHAPES: RECTANGLE — one lesson of the shapes series for 3–4-year-olds:
 * meet the rectangle, pick it out, find them all, fit it in its home, spot it in
 * real things, and build a picture with it. The engine and every page are
 * the series kit's (`shape-lesson/`); this game is only its shape.
 */
export function ShapeRectangleGame() {
  const store = useShapeRectangleStore();
  return <ShapeLessonGame lesson="rectangle" store={store} />;
}
