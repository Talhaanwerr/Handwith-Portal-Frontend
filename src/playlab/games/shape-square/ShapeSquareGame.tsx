"use client";

import { createModuleStore } from "@games/number-groups/store/createModuleStore";
import { ShapeLessonGame } from "@games/shape-lesson/ShapeLessonGame";
import { LESSON_PAGES, type LessonId } from "@games/shape-lesson/constants/lessons";

const useShapeSquareStore = createModuleStore<LessonId>(
  "shape-square-progress",
  ["square"],
  LESSON_PAGES
);

/**
 * MY SHAPES: SQUARE — one lesson of the shapes series for 3–4-year-olds:
 * meet the square, pick it out, find them all, fit it in its home, spot it in
 * real things, and build a picture with it. The engine and every page are
 * the series kit's (`shape-lesson/`); this game is only its shape.
 */
export function ShapeSquareGame() {
  const store = useShapeSquareStore();
  return <ShapeLessonGame lesson="square" store={store} />;
}
