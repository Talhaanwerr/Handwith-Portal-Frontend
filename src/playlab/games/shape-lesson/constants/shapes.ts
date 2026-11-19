import type { ShapeId } from "@games/shape-lesson/constants/lessons";

/** Star points around (50, 53): five tips, five dips. Fixed, never random. */
const STAR = Array.from({ length: 10 }, (_, i) => {
  const a = ((-90 + i * 36) * Math.PI) / 180;
  const r = i % 2 === 0 ? 46 : 20;
  return `${(50 + r * Math.cos(a)).toFixed(1)} ${(53 + r * Math.sin(a)).toFixed(1)}`;
});

/** Every shape in one 100 × 100 box; corners are rounded by the stroke. */
export const SHAPE_PATHS: Readonly<Record<ShapeId, string>> = {
  circle: "M8 50 A42 42 0 1 0 92 50 A42 42 0 1 0 8 50 Z",
  square: "M12 12 H88 V88 H12 Z",
  triangle: "M50 9 L93 86 H7 Z",
  rectangle: "M4 26 H96 V74 H4 Z",
  star: `M${STAR.join(" L")} Z`,
  heart: "M50 86 C22 68 6 50 10 31 C14 14 37 10 50 28 C63 10 86 14 90 31 C94 50 78 68 50 86 Z",
};

/** Where the gloss sits on each shape (a soft white blob, top-left). */
export const SHINE: Readonly<Record<ShapeId, readonly [number, number, number, number]>> = {
  circle: [32, 30, 12, 7],
  square: [30, 28, 11, 6],
  triangle: [42, 44, 7, 5],
  rectangle: [22, 38, 11, 5],
  star: [42, 36, 6, 4],
  heart: [28, 30, 9, 5],
};
