"use client";

import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from "react";

const GAME_COMPONENTS: Record<string, LazyExoticComponent<ComponentType>> = {
  "letter-tracing": lazy(() =>
    import("@games/letter-tracing/LetterTracingGame").then((m) => ({
      default: m.LetterTracingGame,
    }))
  ),
  "jungle-spy": lazy(() =>
    import("@games/jungle-spy/JungleSpyGame").then((m) => ({ default: m.JungleSpyGame }))
  ),
  "letter-hunt": lazy(() =>
    import("@games/letter-hunt/LetterHuntGame").then((m) => ({ default: m.LetterHuntGame }))
  ),
  "magnet-match": lazy(() =>
    import("@games/magnet-match/MagnetMatchGame").then((m) => ({ default: m.MagnetMatchGame }))
  ),
  "dino-dig": lazy(() =>
    import("@games/dino-dig/AlphabetDinoDigGame").then((m) => ({ default: m.AlphabetDinoDigGame }))
  ),
  "letter-treats": lazy(() =>
    import("@games/letter-treats/LetterTreatsGame").then((m) => ({ default: m.LetterTreatsGame }))
  ),
  "feed-the-shark": lazy(() =>
    import("@games/feed-the-shark/FeedTheSharkGame").then((m) => ({ default: m.FeedTheSharkGame }))
  ),
  "space-letters": lazy(() =>
    import("@games/space-letters/SpaceLettersGame").then((m) => ({ default: m.SpaceLettersGame }))
  ),
  "ocean-abc": lazy(() =>
    import("@games/ocean-abc/OceanAbcGame").then((m) => ({ default: m.OceanAbcGame }))
  ),
  "ocean-hunt": lazy(() =>
    import("@games/ocean-hunt/OceanHuntGame").then((m) => ({ default: m.OceanHuntGame }))
  ),
  "pirate-match": lazy(() =>
    import("@games/pirate-match/PirateMatchGame").then((m) => ({ default: m.PirateMatchGame }))
  ),
  "color-paint": lazy(() =>
    import("@games/color-paint/ColorPaintGame").then((m) => ({ default: m.ColorPaintGame }))
  ),
  "counting-numbers": lazy(() =>
    import("@games/counting-numbers/CountingNumbersGame").then((m) => ({
      default: m.CountingNumbersGame,
    }))
  ),
  "door-count": lazy(() =>
    import("@games/door-count/DoorCountGame").then((m) => ({ default: m.DoorCountGame }))
  ),
  "number-match": lazy(() =>
    import("@games/number-match/NumberMatchGame").then((m) => ({ default: m.NumberMatchGame }))
  ),
  "shape-match": lazy(() =>
    import("@games/shape-match/ShapeMatchGame").then((m) => ({ default: m.ShapeMatchGame }))
  ),
  "blend-read": lazy(() =>
    import("@games/blend-read/BlendReadGame").then((m) => ({ default: m.BlendReadGame }))
  ),
  "number-safari": lazy(() =>
    import("@games/number-safari/NumberSafariGame").then((m) => ({ default: m.NumberSafariGame }))
  ),
  "cvc-match": lazy(() =>
    import("@games/cvc-match/CvcMatchGame").then((m) => ({ default: m.CvcMatchGame }))
  ),
  "sort-it": lazy(() =>
    import("@games/sort-it/SortItGame").then((m) => ({ default: m.SortItGame }))
  ),
  "word-quiz": lazy(() =>
    import("@games/word-quiz/WordQuizGame").then((m) => ({ default: m.WordQuizGame }))
  ),
  "math-maze": lazy(() =>
    import("@games/math-maze/MathMazeGame").then((m) => ({ default: m.MathMazeGame }))
  ),
  "food-sort": lazy(() =>
    import("@games/food-sort/FoodSortGame").then((m) => ({ default: m.FoodSortGame }))
  ),
  "find-the-mouse": lazy(() =>
    import("@games/find-the-mouse/FindTheMouseGame").then((m) => ({
      default: m.FindTheMouseGame,
    }))
  ),
  "sesame-activities": lazy(() =>
    import("@games/sesame-activities/SesameActivitiesGame").then((m) => ({
      default: m.SesameActivitiesGame,
    }))
  ),
  "color-shape-friends": lazy(() =>
    import("@games/color-shape-friends/ColorShapeFriendsGame").then((m) => ({
      default: m.ColorShapeFriendsGame,
    }))
  ),
  "pond-numbers": lazy(() =>
    import("@games/pond-numbers/PondNumbersGame").then((m) => ({ default: m.PondNumbersGame }))
  ),
  "jigsaw-fun": lazy(() =>
    import("@games/jigsaw-fun/JigsawFunGame").then((m) => ({ default: m.JigsawFunGame }))
  ),
  "tangram-town": lazy(() =>
    import("@games/tangram-town/TangramTownGame").then((m) => ({ default: m.TangramTownGame }))
  ),
  "on-off": lazy(() => import("@games/on-off/OnOffGame").then((m) => ({ default: m.OnOffGame }))),
  "sort-two-ways": lazy(() =>
    import("@games/sort-two-ways/SortTwoWaysGame").then((m) => ({ default: m.SortTwoWaysGame }))
  ),
  "number-groups": lazy(() =>
    import("@games/number-groups/NumberGroupsGame").then((m) => ({ default: m.NumberGroupsGame }))
  ),
  "number-hunt": lazy(() =>
    import("@games/number-hunt/NumberHuntGame").then((m) => ({ default: m.NumberHuntGame }))
  ),
};

interface GamePlayerProps {
  gameId: string;
}

/**
 * Loads a PlayLab game only in the browser (Howler/canvas). Uses React.lazy
 * inside a Client Component instead of next/dynamic `{ ssr: false }`, which
 * Next.js 16 rejects even when the parent page is a Server Component.
 */
export function GamePlayer({ gameId }: GamePlayerProps) {
  const Game = GAME_COMPONENTS[gameId];

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      {Game ? (
        <Suspense fallback={null}>
          <Game />
        </Suspense>
      ) : null}
    </div>
  );
}
