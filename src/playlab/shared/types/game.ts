/** Metadata every portal game provides for its card on the homepage. */
export interface GameMeta {
  id: string;
  title: string;
  description: string;
  /** Big glyph/emoji shown on the card (portal cards are visual-first) */
  glyph: string;
  route: string;
  /** Pastel card colors, matching the game's own identity */
  colors: { bg: string; border: string; text: string };
}

/**
 * The two ways an alphabet game can be played, shared by Letter Tracing and
 * Letter Hunt: Free = one repetition per letter, five-star = five, one gold
 * star each. Lives with the types rather than with the picker component so a
 * zustand store can reference it without importing a React component.
 */
export type PlayMode = "free" | "five-star";
