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
    route: "/games/letter-tracing",
    colors: { bg: "#DDD5F5", border: "#A882E8", text: "#7C5CBF" },
  },
  {
    id: "jungle-spy",
    title: "Jungle Spy",
    description: "Find the hiding letters",
    glyph: "🔍",
    route: "/games/jungle-spy",
    colors: { bg: "#C8F0D8", border: "#66CC94", text: "#3DAA72" },
  },
  {
    id: "letter-hunt",
    title: "Letter Hunt",
    description: "Find the matching letters",
    glyph: "🅰️",
    route: "/games/letter-hunt",
    colors: { bg: "#FFE1EC", border: "#FF8FA3", text: "#D14D82" },
  },
  {
    id: "magnet-match",
    title: "Magnet Match",
    description: "Alphabet soup with the chef",
    glyph: "🍲",
    route: "/games/magnet-match",
    colors: { bg: "#FBE7A2", border: "#E8B33D", text: "#8A5A2E" },
  },
  {
    id: "dino-dig",
    title: "Dino Dig",
    description: "Feed dinos & bridge the river",
    glyph: "🦕",
    route: "/games/dino-dig",
    colors: { bg: "#CFF1F4", border: "#00C4CC", text: "#0A1A3A" },
  },
  {
    id: "letter-treats",
    title: "Letter Treats",
    description: "Phonics in Candy World",
    glyph: "🧁",
    route: "/games/letter-treats",
    colors: { bg: "#FFD3E4", border: "#FF9EC4", text: "#C2417A" },
  },
  {
    id: "feed-the-shark",
    title: "Feed the Shark",
    description: "Match big & small letters",
    glyph: "🦈",
    route: "/games/feed-the-shark",
    colors: { bg: "#D4EEFF", border: "#74B9FF", text: "#2980B9" },
  },
] as const;
