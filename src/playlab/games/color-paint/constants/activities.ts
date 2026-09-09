import type { PaintColorId } from "@games/color-paint/constants/colors";

/**
 * The things a child paints, in order.
 *
 * ONE ENTRY PER OBJECT is the whole game: the engine, the crayon row, the
 * canvas and the finale all read this list, so adding an object is adding a
 * row here.
 *
 * An object is made of PARTS, not of one blob. The apple has a body and a
 * leaf; the flower has petals and a middle. That is what turns colouring-in
 * into a picture the child makes choices about — they colour the apple red
 * because they were asked to, and then the leaf green because they want to.
 * `details` are the remaining stroke-only lines (a stem, a vein) that sit
 * over the paint and give the shape its character without being paintable.
 */
export interface PaintRegion {
  id: string;
  /** Closed path in ART_BOX units. Paint inside it is clipped to it. */
  path: string;
  /** The colour this part is "meant" to be. On the MAIN part it is the
   *  lesson; elsewhere it is only a suggestion the child may ignore. */
  suggested: PaintColorId;
}

export interface PaintActivity {
  id: string;
  /** Shown above the canvas. */
  label: string;
  /** Says the object's name on arrival. */
  wordClip: string;
  /** The colour the round asks for — always the first region's suggestion. */
  target: PaintColorId;
  /** The crayons on the row while the child is still being asked. */
  choices: readonly PaintColorId[];
  /** First entry is the MAIN part: the one the prompt is about, and the one
   *  whose coverage finishes the round. */
  regions: readonly PaintRegion[];
  details: readonly string[];
}

/** Side of the square every outline is drawn in. */
export const ART_BOX = 200;

/** Thickness of the coloring-book line, in ART_BOX units. */
export const OUTLINE_WIDTH = 9;

export const ACTIVITIES: readonly PaintActivity[] = [
  {
    id: "apple",
    label: "Apple",
    wordClip: "treat-word-apple",
    target: "red",
    choices: ["red", "blue", "yellow"],
    regions: [
      {
        id: "body",
        suggested: "red",
        path: "M100 62 C126 40 172 52 174 108 C176 152 140 184 100 178 C60 184 24 152 26 108 C28 52 74 40 100 62 Z",
      },
      {
        id: "leaf",
        suggested: "green",
        path: "M112 36 C130 24 152 28 150 46 C132 54 116 50 112 36 Z",
      },
    ],
    details: ["M100 62 C100 50 104 40 112 30"],
  },
  {
    id: "banana",
    label: "Banana",
    wordClip: "treat-word-banana",
    target: "yellow",
    choices: ["yellow", "green", "purple"],
    regions: [
      {
        id: "body",
        suggested: "yellow",
        path: "M38 116 C44 54 112 22 168 44 C150 62 130 98 112 134 C94 166 62 176 38 116 Z",
      },
    ],
    details: ["M62 120 C74 88 106 62 148 48"],
  },
  {
    id: "leaf",
    label: "Leaf",
    wordClip: "treat-word-leaf",
    target: "green",
    choices: ["green", "orange", "red"],
    regions: [
      {
        id: "blade",
        suggested: "green",
        path: "M100 22 C162 48 172 130 100 178 C28 130 38 48 100 22 Z",
      },
    ],
    details: [
      "M100 40 L100 170",
      "M100 80 C118 88 130 100 140 116",
      "M100 80 C82 88 70 100 60 116",
    ],
  },
  {
    id: "cloud",
    label: "Cloud",
    wordClip: "paint-word-cloud",
    target: "blue",
    choices: ["blue", "pink", "yellow"],
    regions: [
      {
        id: "cloud",
        suggested: "blue",
        path: "M56 150 C26 150 20 112 46 104 C40 70 84 58 100 84 C110 50 164 56 162 96 C190 96 194 140 166 150 Z",
      },
      { id: "sun", suggested: "yellow", path: "M176 46 A26 26 0 1 1 124 46 A26 26 0 1 1 176 46 Z" },
    ],
    details: [],
  },
  {
    id: "orange",
    label: "Orange",
    wordClip: "treat-word-orange",
    target: "orange",
    choices: ["orange", "purple", "blue"],
    regions: [
      {
        id: "fruit",
        suggested: "orange",
        path: "M172 112 A68 68 0 1 1 36 112 A68 68 0 1 1 172 112 Z",
      },
      {
        id: "leaf",
        suggested: "green",
        path: "M108 34 C126 22 148 28 146 46 C128 54 110 48 108 34 Z",
      },
    ],
    details: ["M100 46 C100 38 102 34 108 30"],
  },
  {
    id: "flower",
    label: "Flower",
    wordClip: "treat-word-flower",
    target: "pink",
    choices: ["pink", "green", "orange"],
    regions: [
      {
        id: "petals",
        suggested: "pink",
        path: "M100 26 C118 52 148 44 152 72 C178 84 166 116 148 124 C158 152 128 162 114 146 C100 172 68 160 70 138 C42 148 30 118 48 102 C26 82 46 52 68 60 C66 34 92 22 100 26 Z",
      },
      {
        id: "middle",
        suggested: "yellow",
        path: "M124 98 A24 24 0 1 1 76 98 A24 24 0 1 1 124 98 Z",
      },
    ],
    details: [],
  },
  {
    id: "grape",
    label: "Grape",
    wordClip: "paint-word-grape",
    target: "purple",
    choices: ["purple", "red", "blue"],
    regions: [
      {
        id: "bunch",
        suggested: "purple",
        path: "M100 52 C130 52 142 76 150 98 C170 108 166 142 146 152 C142 182 106 192 90 172 C58 182 38 152 54 132 C34 116 44 80 70 76 C70 58 84 52 100 52 Z",
      },
      {
        id: "leaf",
        suggested: "green",
        path: "M104 30 C122 16 148 22 146 42 C126 50 106 44 104 30 Z",
      },
    ],
    details: [
      "M100 52 C100 42 102 36 106 32",
      "M118 100 A16 16 0 1 1 86 100 A16 16 0 1 1 118 100 Z",
      "M92 140 A16 16 0 1 1 60 140 A16 16 0 1 1 92 140 Z",
      "M146 136 A16 16 0 1 1 114 136 A16 16 0 1 1 146 136 Z",
    ],
  },
];
