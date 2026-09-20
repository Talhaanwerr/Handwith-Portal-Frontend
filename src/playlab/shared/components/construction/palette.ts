/**
 * The Construction Site's art palette — ONE set of named colours for every
 * drawing in the theme (the pirate/arctic convention), so an excavator, a
 * half-built house and a traffic cone read as one illustrator's site.
 *
 * The theme's colour logic:
 *   - MACHINE YELLOW is the star and belongs ONLY to machines — instantly
 *     recognisable because nothing else wears it;
 *   - safety orange marks the things that say "careful here" (cones,
 *     barriers, vests, signs);
 *   - the ground is warm dirt and sand, structures are concrete greys and
 *     brick red, wood is the SAME wood as the other themes (wood is wood);
 *   - outlines are darker shades of their fill, never black.
 */
export const C = {
  // machines
  YELLOW: "#F2B824",
  YELLOW_DEEP: "#D89A12",
  YELLOW_LINE: "#A87408",
  CAB_GLASS: "#BDE3F4",

  // safety
  ORANGE: "#F07F2E",
  ORANGE_DEEP: "#CC5F14",
  VEST: "#FFB833",
  HAZARD_INK: "#33302B",

  // steel & concrete
  STEEL: "#8C99A6",
  STEEL_DEEP: "#65727F",
  STEEL_LINE: "#4A5560",
  CONCRETE: "#C9CDD2",
  CONCRETE_DEEP: "#A6ACB4",
  CHARCOAL: "#3A3F45",
  TRACK: "#4A4F55",

  // ground
  DIRT: "#B07A46",
  DIRT_DEEP: "#8A5B30",
  DIRT_LINE: "#6E4522",
  SAND: "#E8CE9A",
  SAND_DEEP: "#D4B678",
  GRAVEL: "#B4B9BE",

  // building
  BRICK: "#C75B45",
  BRICK_DEEP: "#A03F2D",
  WOOD: "#C08A4F",
  WOOD_MID: "#9A6534",
  WOOD_DEEP: "#6E4522",
  WOOD_LINE: "#54321A",
  ROOF: "#7A4A38",

  // sky & greenery
  SKY_TOP: "#79C4E8",
  SKY_LOW: "#CFEAF7",
  SUN: "#FFD873",
  LEAF: "#6FAE62",
  LEAF_DEEP: "#4C8544",

  // people
  SKIN: "#F2C49A",
  SKIN_DEEP: "#D9A272",
  SHIRT: "#4A7FB5",
  PANTS: "#5A6472",

  // paper
  BLUEPRINT: "#2E6FA8",
  BLUEPRINT_LINE: "#EAF4FB",
  PAPER: "#F7F2E6",

  WHITE: "#FFFFFF",
  INK: "#2D2A32",
} as const;
