/**
 * The Pirate World's art palette — ONE set of named colours for every
 * drawing in the theme, which is what makes a ship, a chest and a parrot
 * drawn in different files look like one illustrator's work.
 *
 * This is ART DIRECTION, deliberately local to the artwork per the tokens.ts
 * rule ("a shark's belly colour is not a design token"). UI chrome — pirate
 * buttons, pills, progress — uses the `pirate` family in tokens.ts instead.
 *
 * Conventions the palette encodes:
 *   - outlines are a DARKER SHADE of the fill, never black (the portal's
 *     soft illustration language);
 *   - wood always shades from WOOD_LIGHT at the top to WOOD_DEEP below,
 *     so light falls the same way on every object;
 *   - gold is warm, parchment is cream — treasure glows, paper doesn't.
 */
export const P = {
  // wood (hull, barrels, helm, signs)
  WOOD_LIGHT: "#C08A4F",
  WOOD: "#9A6534",
  WOOD_DEEP: "#6E4522",
  WOOD_LINE: "#54321A",
  WOOD_GOLD: "#E0A85E",

  // sails & parchment
  SAIL: "#FBF3DF",
  SAIL_SHADE: "#EBD9B4",
  PARCH: "#F4E6C4",
  PARCH_DEEP: "#E4CE9E",
  PARCH_EDGE: "#C9A96C",

  // sea & sky
  SEA_DEEP: "#155E86",
  SEA: "#2E86AB",
  SEA_LIGHT: "#5FB4D9",
  FOAM: "#EAF7FD",
  SKY: "#BDE7F7",

  // island
  SAND: "#F2DFA9",
  SAND_DEEP: "#DFC581",
  LEAF: "#4FAE62",
  LEAF_DEEP: "#2F8047",
  TRUNK: "#8A6238",

  // treasure
  GOLD: "#F2C14E",
  GOLD_DEEP: "#D89A2B",
  GOLD_LINE: "#A56E1C",
  GEM_RED: "#E56A6A",
  GEM_TEAL: "#3FBFAE",

  // metal & rope
  IRON: "#5E6B78",
  IRON_DEEP: "#3E4854",
  ROPE: "#D9B173",
  ROPE_DEEP: "#B08A4E",

  // parrot & accents
  PARROT_RED: "#E85D4A",
  PARROT_RED_DEEP: "#C24234",
  PARROT_BLUE: "#3E8FD0",
  PARROT_YELLOW: "#F5C445",
  PARROT_GREEN: "#4FAE62",
  BEAK: "#F0A63C",

  // flag
  FLAG_INK: "#2E3A48",
  FLAG_INK_DEEP: "#1F2833",

  // shared ink for faces/eyes
  INK: "#2D2A32",
  WHITE: "#FFFFFF",
} as const;
