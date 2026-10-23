"use client";

import {
  lazy,
  Suspense,
  useCallback,
  useState,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import { GAMES } from "@/constants/games";
import { HowToPlay } from "@shared/components/ui/HowToPlay";
import { HowToPlayProvider } from "@shared/components/ui/HowToPlayGate";
import { GATED_GAMES, howToPlayFor } from "@shared/constants/howToPlay";

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
  "brick-lab": lazy(() =>
    import("@games/brick-lab/BrickLabGame").then((m) => ({ default: m.BrickLabGame }))
  ),
  "brick-build-steps": lazy(() =>
    import("@games/brick-build-steps/BrickBuildStepsGame").then((m) => ({
      default: m.BrickBuildStepsGame,
    }))
  ),
  "brick-pattern-wall": lazy(() =>
    import("@games/brick-pattern-wall/BrickPatternWallGame").then((m) => ({
      default: m.BrickPatternWallGame,
    }))
  ),
  "brick-spell-words": lazy(() =>
    import("@games/brick-spell-words/BrickSpellWordsGame").then((m) => ({
      default: m.BrickSpellWordsGame,
    }))
  ),
  "brick-count-sort": lazy(() =>
    import("@games/brick-count-sort/BrickCountSortGame").then((m) => ({
      default: m.BrickCountSortGame,
    }))
  ),
  "brick-first-sound": lazy(() =>
    import("@games/brick-first-sound/BrickFirstSoundGame").then((m) => ({
      default: m.BrickFirstSoundGame,
    }))
  ),
  "brick-abc-tower": lazy(() =>
    import("@games/brick-abc-tower/BrickAbcTowerGame").then((m) => ({
      default: m.BrickAbcTowerGame,
    }))
  ),
  "brick-plus-tower": lazy(() =>
    import("@games/brick-plus-tower/BrickPlusTowerGame").then((m) => ({
      default: m.BrickPlusTowerGame,
    }))
  ),
  "tiny-toy-shop": lazy(() =>
    import("@games/tiny-toy-shop/TinyToyShopGame").then((m) => ({ default: m.TinyToyShopGame }))
  ),
  "number-train": lazy(() =>
    import("@games/number-train/NumberTrainGame").then((m) => ({ default: m.NumberTrainGame }))
  ),
  "silly-robot": lazy(() =>
    import("@games/silly-robot/SillyRobotGame").then((m) => ({ default: m.SillyRobotGame }))
  ),
  "shadow-match": lazy(() =>
    import("@games/shadow-match/ShadowMatchGame").then((m) => ({ default: m.ShadowMatchGame }))
  ),
  "animal-repair": lazy(() =>
    import("@games/animal-repair/AnimalRepairGame").then((m) => ({ default: m.AnimalRepairGame }))
  ),
  "sock-case": lazy(() =>
    import("@games/sock-case/SockCaseGame").then((m) => ({ default: m.SockCaseGame }))
  ),
};

interface GamePlayerProps {
  gameId: string;
}

/**
 * Loads a PlayLab game only in the browser (Howler/canvas). Uses React.lazy
 * inside a Client Component instead of next/dynamic `{ ssr: false }`, which
 * Next.js 16 rejects even when the parent page is a Server Component.
 *
 * Every game shows the shared "How to Play" card. A game that calls
 * `useHowToPlay().gate` from its own Play button / module cards (GATED_GAMES)
 * opens it right after the child picks what to play, over its own title
 * screen. Any other game shows it first, before the game is mounted, so no
 * music or narration starts behind it. Either way nothing starts until the
 * child presses Play.
 */
export function GamePlayer({ gameId }: GamePlayerProps) {
  const Game = GAME_COMPONENTS[gameId];
  const steps = howToPlayFor(gameId);
  const title = GAMES.find((g) => g.id === gameId)?.title;
  // Keyed by game id, so opening another game shows its own card again.
  const [startedId, setStartedId] = useState<string | null>(null);
  const start = useCallback(() => setStartedId(gameId), [gameId]);
  const gated = GATED_GAMES.has(gameId);
  const started = gated || startedId === gameId || !steps;

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      {Game ? (
        started ? (
          <HowToPlayProvider gameId={gameId} title={title}>
            <Suspense fallback={null}>
              <Game />
            </Suspense>
          </HowToPlayProvider>
        ) : (
          <HowToPlay gameTitle={title} steps={steps} onPlay={start} onClose={start} />
        )
      ) : null}
    </div>
  );
}
