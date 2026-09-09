import type { GameMeta } from "@/types/games";

/**
 * Central game registry for the Library feature.
 * Mirrors PlayLab's src/games/registry.ts — add/remove games in both places.
 *
 * Each entry maps to a PlayLab route: ${NEXT_PUBLIC_PLAYLAB_URL}${route}
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
  },
] as const;
