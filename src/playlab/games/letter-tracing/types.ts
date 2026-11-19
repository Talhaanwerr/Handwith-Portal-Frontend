export type Point = [number, number];

export type Module = "uppercase" | "lowercase" | "numbers" | "sequencing";

/** How the child practices each letter: once, or five-star mastery */
export type PracticeMode = "free" | "five-star";

export type GameScreen =
  | "splash"
  | "main-menu"
  | "home"
  | "mode-select"
  | "tracing"
  | "celebration"
  | "completion"
  | "sequencing";

export interface LetterStroke {
  id: string;
  /** Pre-sampled waypoints along the stroke in a 200×200 coordinate space */
  points: Point[];
  /** SVG path data string for rendering the stroke guide */
  pathData: string;
  /** Arrow direction hint label */
  hint?: string;
}

export interface LetterDefinition {
  letter: string;
  strokes: LetterStroke[];
  /** Phonetic label shown to child: "A says Aah" */
  phonetic: string;
}

export type StickerTheme = "garden" | "ocean" | "sky" | "forest" | "safari" | "space";

export interface StickerDefinition {
  id: string;
  name: string;
  /** SVG path data or component key */
  icon: string;
  color: string;
}

export interface GameProgress {
  currentLetterIndex: number;
  completedLetters: string[];
  unlockedStickers: string[];
  currentTheme: StickerTheme;
}
