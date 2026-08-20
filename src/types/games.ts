/** Metadata every game in the Library provides for its card. */
export interface GameMeta {
  id: string;
  title: string;
  description: string;
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
}
