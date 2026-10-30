/** The Library's filter pills: what a game mainly teaches. */
export type GameCategory = "literacy" | "cognitive" | "numbers";

/** Metadata every game in the Library provides for its card. */
export interface GameMeta {
  id: string;
  title: string;
  description: string;
  category: GameCategory;
  /** Emoji/glyph shown prominently on the card */
  glyph: string;
  /** Route suffix relative to PlayLab origin, e.g. "/games/letter-tracing" */
  route: string;
  /** Pastel card identity colors, matching the game's own visual theme */
  colors: {
    bg: string;
    border: string;
    text: string;
  };
  /**
   * Kept out of the Library grid while the game is being worked on. The game
   * itself is untouched and `/play/<id>` still opens it, so it can be tested
   * without being offered to children yet.
   */
  hidden?: boolean;
}
