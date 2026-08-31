/**
 * The Arctic World's art palette — ONE set of named colours for every
 * drawing in the theme, so glacier, bear and igloo drawn in different files
 * read as one illustrator's work.
 *
 * ART DIRECTION, local to the artwork per the tokens.ts rule; UI chrome
 * (frosted panels, pills, progress) is painted in shared/styles/arctic.css.
 *
 * The theme's light logic:
 *   - snow is never pure flat white: WHITE tops, SNOW_SHADE where it turns
 *     from the sky, SNOW_DEEP in hollows — that gradient IS the majesty;
 *   - ice is blue and slightly translucent-looking (lighter tops, deep
 *     cores), outlines a darker shade of the fill, never black;
 *   - warmth appears ONLY at human things — lantern glass, fire, a scarf,
 *     sled wood (the same wood as the pirate theme: wood is wood) — which
 *     is what makes the camp feel cozy inside the cold.
 */
export const A = {
  // sky
  SKY_TOP: "#1D4E79",
  SKY_MID: "#3E7FB0",
  SKY_LOW: "#9CD4EF",
  MIST: "#DCEEF9",
  MOON: "#F4F8FC",
  STAR: "#E8F4FF",

  // aurora (kept pale on purpose)
  AURORA_TEAL: "#7FE8D8",
  AURORA_BLUE: "#9FD8FF",
  AURORA_VIOLET: "#C9B8F0",

  // mountains (back to front)
  MTN_FAR: "#6FA9CF",
  MTN_MID: "#4A82AC",
  MTN_NEAR: "#33648C",

  // snow
  WHITE: "#FFFFFF",
  SNOW: "#F2F9FE",
  SNOW_SHADE: "#D8EAF6",
  SNOW_DEEP: "#B9D6E9",
  SNOW_LINE: "#8FB8D4",

  // ice
  ICE_LIGHT: "#CFF0FF",
  ICE: "#A8DCF0",
  ICE_MID: "#7FC8EA",
  ICE_DEEP: "#3E8FC4",
  ICE_CORE: "#2B6C9A",
  ICE_LINE: "#1E5478",
  CRYSTAL: "#E4F7FF",

  // rock & rope
  ROCK: "#7C93A6",
  ROPE: "#D9B173",
  ROCK_DEEP: "#5A7080",

  // animals
  BEAR: "#F6F1E7",
  BEAR_SHADE: "#DFD5C4",
  BEAR_LINE: "#B8A98F",
  PENGUIN_INK: "#2E3A48",
  PENGUIN_DEEP: "#1F2833",
  FOX: "#F8FAFC",
  FOX_SHADE: "#DCE6EE",
  FOX_LINE: "#A9BCCB",
  SEAL: "#8FA8BC",
  SEAL_DEEP: "#6C8699",
  NARWHAL: "#9FB8CC",
  NARWHAL_DEEP: "#7A97AE",
  OWL: "#FBFDFF",
  OWL_MARK: "#C9D6E2",

  // warm accents — the cozy exceptions
  WOOD: "#9A6534",
  WOOD_DEEP: "#6E4522",
  WOOD_LINE: "#54321A",
  FIRE: "#F5A83C",
  FIRE_DEEP: "#E2712B",
  GLOW: "#FFE9B8",
  SCARF: "#E56A6A",
  SCARF_DEEP: "#C24234",
  CARROT: "#F0A63C",

  // shared ink for eyes
  INK: "#2D2A32",
} as const;
