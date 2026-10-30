/**
 * The puzzle games' shared terms (Jigsaw Fun and Tangram Town): a child picks
 * a picture, then how hard, and plays that one puzzle. What "harder" means is
 * each game's own — more pieces in a jigsaw, less of a guide in a tangram.
 */

export type Level = "easy" | "medium" | "hard";

export const LEVELS: readonly Level[] = ["easy", "medium", "hard"];

export const LEVEL_NAMES: Record<Level, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

/**
 * What a drop on the board comes to, as each game's `judgeDrop` decides it:
 * the place (index) the piece goes into, "miss" (another piece's empty place
 * — the piece goes back with a nudge), or null (open ground or a filled
 * place — it just goes back).
 */
export type Verdict = number | "miss" | null;

/** The next level up, or null from the top one. */
export function harderThan(level: Level): Level | null {
  return LEVELS[LEVELS.indexOf(level) + 1] ?? null;
}

/** Stars earned, as text for a choice plate's label ("★★"; none: ""). */
export function starsText(stars: number): string {
  return "★".repeat(stars);
}

/** Where a picture's best stars at one level are kept (`"lion/easy"`). */
export function bestKey(module: string, level: Level): string {
  return `${module}/${level}`;
}

/**
 * A numeric seed for `cheerFor`, so the praise varies from picture to picture
 * and level to level (a string seed would only use its first letter). `extra`
 * shifts it — the star card passes its misses, so its word can differ from the
 * board's.
 */
export function cheerSeed(pictureIndex: number, level: Level, extra = 0): number {
  return pictureIndex * LEVELS.length + LEVELS.indexOf(level) + extra;
}
