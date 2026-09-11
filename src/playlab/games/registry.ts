import type { GameMeta } from "@shared/types/game";

/**
 * THE game registry — the single place a new game is announced to the portal.
 *
 * Adding a game:
 *   1. Create src/games/<id>/ with its components/store/data
 *   2. Create src/app/games/<id>/page.tsx rendering it
 *   3. Add one entry here — the portal homepage picks it up automatically
 */
export const GAMES: readonly GameMeta[] = [
  {
    id: "letter-tracing",
    title: "ABC",
    description: "Trace letters & numbers",
    glyph: "✏️",
    route: "/play/letter-tracing",
    colors: { bg: "#DDD5F5", border: "#A882E8", text: "#7C5CBF" },
  },
  {
    id: "jungle-spy",
    title: "Jungle Spy",
    description: "Find the hiding letters",
    glyph: "🔍",
    route: "/play/jungle-spy",
    colors: { bg: "#C8F0D8", border: "#66CC94", text: "#3DAA72" },
  },
  {
    id: "letter-hunt",
    title: "Letter Hunt",
    description: "Find the matching letters",
    glyph: "🅰️",
    route: "/play/letter-hunt",
    colors: { bg: "#FFE1EC", border: "#FF8FA3", text: "#D14D82" },
  },
  {
    id: "magnet-match",
    title: "Magnet Match",
    description: "Alphabet soup with the chef",
    glyph: "🍲",
    route: "/play/magnet-match",
    colors: { bg: "#FBE7A2", border: "#E8B33D", text: "#8A5A2E" },
  },
  {
    id: "dino-dig",
    title: "Dino Dig",
    description: "Feed dinos & bridge the river",
    glyph: "🦕",
    route: "/play/dino-dig",
    colors: { bg: "#CFF1F4", border: "#00C4CC", text: "#0A1A3A" },
  },
  {
    id: "letter-treats",
    title: "Letter Treats",
    description: "Phonics in Candy World",
    glyph: "🧁",
    route: "/play/letter-treats",
    colors: { bg: "#FFD3E4", border: "#FF9EC4", text: "#C2417A" },
  },
  {
    id: "feed-the-shark",
    title: "Feed the Shark",
    description: "Match big & small letters",
    glyph: "🦈",
    route: "/play/feed-the-shark",
    colors: { bg: "#D4EEFF", border: "#74B9FF", text: "#2980B9" },
  },
  {
    id: "space-letters",
    title: "Space ABC",
    description: "Discover letters among the stars",
    glyph: "🚀",
    route: "/play/space-letters",
    colors: { bg: "#0B1330", border: "#5B7FFF", text: "#FFFFFF" },
  },
  {
    id: "ocean-abc",
    title: "Ocean ABC",
    description: "Build, pop & write letters",
    glyph: "🫧",
    route: "/play/ocean-abc",
    colors: { bg: "#114A70", border: "#6FC7EF", text: "#FFFFFF" },
  },
  {
    id: "ocean-hunt",
    title: "Ocean Hunt",
    description: "Find the missing letter",
    glyph: "\u{1F50E}",
    route: "/play/ocean-hunt",
    colors: { bg: "#0E5A86", border: "#FFD93D", text: "#FFFFFF" },
  },
  {
    id: "pirate-match",
    title: "Pirate Match",
    description: "Match letters to treasures",
    glyph: "\u{1F99C}",
    route: "/play/pirate-match",
    colors: { bg: "#5C3A1C", border: "#E9B44C", text: "#FFFFFF" },
  },
  {
    id: "color-paint",
    title: "Color & Paint",
    description: "Pick the colour, paint the picture",
    glyph: "🖍️",
    route: "/play/color-paint",
    // Candy Land's card colours — this game lives in that world.
    colors: { bg: "#FFD3E4", border: "#FF9EC4", text: "#C2417A" },
    hidden: true,
  },
  {
    id: "counting-numbers",
    title: "Numbers 1 - 5",
    description: "Count and find the missing numbers",
    glyph: "🔢",
    route: "/play/counting-numbers",
    colors: { bg: "#E6F0A8", border: "#C5DD3A", text: "#4F6A0C" },
    hidden: true,
  },
  {
    id: "door-count",
    title: "Count the Doors",
    description: "Count doors, compare, collect keys",
    glyph: "🚪",
    route: "/play/door-count",
    colors: { bg: "#F0E6D2", border: "#C98A3F", text: "#6B4A1E" },
  },
  {
    id: "number-match",
    title: "Number Match",
    description: "Count the cards, fill the sticker book",
    glyph: "🔟",
    route: "/play/number-match",
    colors: { bg: "#E7DEFA", border: "#9A6CE0", text: "#5F3A9C" },
  },
];
