"use client";

import "@/playlab/playlab.css";
import { cn } from "@/lib/utils";
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
  "phonics-show": lazy(() =>
    import("@games/phonics-show/PhonicsShowGame").then((m) => ({ default: m.PhonicsShowGame }))
  ),
  "sound-show": lazy(() =>
    import("@games/sound-show/SoundShowGame").then((m) => ({ default: m.SoundShowGame }))
  ),
  "odd-sound": lazy(() =>
    import("@games/odd-sound/OddSoundGame").then((m) => ({ default: m.OddSoundGame }))
  ),
  "drum-beats": lazy(() =>
    import("@games/drum-beats/DrumBeatsGame").then((m) => ({ default: m.DrumBeatsGame }))
  ),
  "burj-lift": lazy(() =>
    import("@games/burj-lift/BurjLiftGame").then((m) => ({ default: m.BurjLiftGame }))
  ),
  "burj-towers": lazy(() =>
    import("@games/burj-towers/TallestTowerGame").then((m) => ({ default: m.TallestTowerGame }))
  ),
  "plane-seats": lazy(() =>
    import("@games/plane-seats/PlaneSeatsGame").then((m) => ({ default: m.PlaneSeatsGame }))
  ),
  "plane-trip": lazy(() =>
    import("@games/plane-trip/PlaneTripGame").then((m) => ({ default: m.PlaneTripGame }))
  ),
  "plane-snacks": lazy(() =>
    import("@games/plane-snacks/PlaneSnacksGame").then((m) => ({ default: m.PlaneSnacksGame }))
  ),
  "rhyme-or-not": lazy(() =>
    import("@games/rhyme-or-not/RhymeOrNotGame").then((m) => ({ default: m.RhymeOrNotGame }))
  ),
  "rhyme-match": lazy(() =>
    import("@games/rhyme-match/RhymeMatchGame").then((m) => ({ default: m.RhymeMatchGame }))
  ),
  "rhyme-families": lazy(() =>
    import("@games/rhyme-families/RhymeFamiliesGame").then((m) => ({
      default: m.RhymeFamiliesGame,
    }))
  ),
  "rhyme-rocket": lazy(() =>
    import("@games/rhyme-rocket/RhymeRocketGame").then((m) => ({ default: m.RhymeRocketGame }))
  ),
  "silly-sandwich": lazy(() =>
    import("@games/silly-sandwich/SillySandwichGame").then((m) => ({
      default: m.SillySandwichGame,
    }))
  ),
  "rhyme-detective": lazy(() =>
    import("@games/rhyme-detective/RhymeDetectiveGame").then((m) => ({
      default: m.RhymeDetectiveGame,
    }))
  ),
  "finish-song": lazy(() =>
    import("@games/finish-song/FinishSongGame").then((m) => ({ default: m.FinishSongGame }))
  ),
  "magic-hat": lazy(() =>
    import("@games/magic-hat/MagicHatGame").then((m) => ({ default: m.MagicHatGame }))
  ),
  "rhyme-train": lazy(() =>
    import("@games/rhyme-train/RhymeTrainGame").then((m) => ({ default: m.RhymeTrainGame }))
  ),
  "shape-circle": lazy(() =>
    import("@games/shape-circle/ShapeCircleGame").then((m) => ({ default: m.ShapeCircleGame }))
  ),
  "shape-square": lazy(() =>
    import("@games/shape-square/ShapeSquareGame").then((m) => ({ default: m.ShapeSquareGame }))
  ),
  "shape-triangle": lazy(() =>
    import("@games/shape-triangle/ShapeTriangleGame").then((m) => ({
      default: m.ShapeTriangleGame,
    }))
  ),
  "shape-rectangle": lazy(() =>
    import("@games/shape-rectangle/ShapeRectangleGame").then((m) => ({
      default: m.ShapeRectangleGame,
    }))
  ),
  "shape-star": lazy(() =>
    import("@games/shape-star/ShapeStarGame").then((m) => ({ default: m.ShapeStarGame }))
  ),
  "words-animals": lazy(() =>
    import("@games/words-animals/WordsAnimalsGame").then((m) => ({ default: m.WordsAnimalsGame }))
  ),
  "words-food": lazy(() =>
    import("@games/words-food/WordsFoodGame").then((m) => ({ default: m.WordsFoodGame }))
  ),
  "words-home": lazy(() =>
    import("@games/words-home/WordsHomeGame").then((m) => ({ default: m.WordsHomeGame }))
  ),
  "words-out": lazy(() =>
    import("@games/words-out/WordsOutGame").then((m) => ({ default: m.WordsOutGame }))
  ),
  "words-body": lazy(() =>
    import("@games/words-body/WordsBodyGame").then((m) => ({ default: m.WordsBodyGame }))
  ),
  "word-builder-a": lazy(() =>
    import("@games/word-builder-a/WordBuilderAGame").then((m) => ({
      default: m.WordBuilderAGame,
    }))
  ),
  "word-builder-e": lazy(() =>
    import("@games/word-builder-e/WordBuilderEGame").then((m) => ({
      default: m.WordBuilderEGame,
    }))
  ),
  "word-builder-i": lazy(() =>
    import("@games/word-builder-i/WordBuilderIGame").then((m) => ({
      default: m.WordBuilderIGame,
    }))
  ),
  "word-builder-o": lazy(() =>
    import("@games/word-builder-o/WordBuilderOGame").then((m) => ({
      default: m.WordBuilderOGame,
    }))
  ),
  "word-builder-u": lazy(() =>
    import("@games/word-builder-u/WordBuilderUGame").then((m) => ({
      default: m.WordBuilderUGame,
    }))
  ),
  "rainbow-words-red": lazy(() =>
    import("@games/rainbow-words-red/RainbowWordsRedGame").then((m) => ({
      default: m.RainbowWordsRedGame,
    }))
  ),
  "rainbow-words-orange": lazy(() =>
    import("@games/rainbow-words-orange/RainbowWordsOrangeGame").then((m) => ({
      default: m.RainbowWordsOrangeGame,
    }))
  ),
  "rainbow-words-yellow": lazy(() =>
    import("@games/rainbow-words-yellow/RainbowWordsYellowGame").then((m) => ({
      default: m.RainbowWordsYellowGame,
    }))
  ),
  "rainbow-words-green": lazy(() =>
    import("@games/rainbow-words-green/RainbowWordsGreenGame").then((m) => ({
      default: m.RainbowWordsGreenGame,
    }))
  ),
  "rainbow-words-blue": lazy(() =>
    import("@games/rainbow-words-blue/RainbowWordsBlueGame").then((m) => ({
      default: m.RainbowWordsBlueGame,
    }))
  ),
  "rainbow-words-indigo": lazy(() =>
    import("@games/rainbow-words-indigo/RainbowWordsIndigoGame").then((m) => ({
      default: m.RainbowWordsIndigoGame,
    }))
  ),
  "rainbow-words-violet": lazy(() =>
    import("@games/rainbow-words-violet/RainbowWordsVioletGame").then((m) => ({
      default: m.RainbowWordsVioletGame,
    }))
  ),
  "our-world-animals": lazy(() =>
    import("@games/our-world-animals/OurWorldAnimalsGame").then((m) => ({
      default: m.OurWorldAnimalsGame,
    }))
  ),
  "our-world-sea": lazy(() =>
    import("@games/our-world-sea/OurWorldSeaGame").then((m) => ({
      default: m.OurWorldSeaGame,
    }))
  ),
  "our-world-road": lazy(() =>
    import("@games/our-world-road/OurWorldRoadGame").then((m) => ({
      default: m.OurWorldRoadGame,
    }))
  ),
  "our-world-food": lazy(() =>
    import("@games/our-world-food/OurWorldFoodGame").then((m) => ({
      default: m.OurWorldFoodGame,
    }))
  ),
  "our-world-play": lazy(() =>
    import("@games/our-world-play/OurWorldPlayGame").then((m) => ({
      default: m.OurWorldPlayGame,
    }))
  ),
  "our-world-body": lazy(() =>
    import("@games/our-world-body/OurWorldBodyGame").then((m) => ({
      default: m.OurWorldBodyGame,
    }))
  ),
  "sticker-studio-garden": lazy(() =>
    import("@games/sticker-studio-garden/StickerStudioGardenGame").then((m) => ({
      default: m.StickerStudioGardenGame,
    }))
  ),
  "sticker-studio-space": lazy(() =>
    import("@games/sticker-studio-space/StickerStudioSpaceGame").then((m) => ({
      default: m.StickerStudioSpaceGame,
    }))
  ),
  "sticker-studio-farm": lazy(() =>
    import("@games/sticker-studio-farm/StickerStudioFarmGame").then((m) => ({
      default: m.StickerStudioFarmGame,
    }))
  ),
  "sticker-studio-park": lazy(() =>
    import("@games/sticker-studio-park/StickerStudioParkGame").then((m) => ({
      default: m.StickerStudioParkGame,
    }))
  ),
  "sticker-studio-street": lazy(() =>
    import("@games/sticker-studio-street/StickerStudioStreetGame").then((m) => ({
      default: m.StickerStudioStreetGame,
    }))
  ),
  "sticker-studio-party": lazy(() =>
    import("@games/sticker-studio-party/StickerStudioPartyGame").then((m) => ({
      default: m.StickerStudioPartyGame,
    }))
  ),
  "colours-road": lazy(() =>
    import("@games/colours-road/ColoursRoadGame").then((m) => ({ default: m.ColoursRoadGame }))
  ),
  "colours-sea": lazy(() =>
    import("@games/colours-sea/ColoursSeaGame").then((m) => ({ default: m.ColoursSeaGame }))
  ),
  "colours-sky": lazy(() =>
    import("@games/colours-sky/ColoursSkyGame").then((m) => ({ default: m.ColoursSkyGame }))
  ),
  "colours-space": lazy(() =>
    import("@games/colours-space/ColoursSpaceGame").then((m) => ({ default: m.ColoursSpaceGame }))
  ),
  "colours-emergency": lazy(() =>
    import("@games/colours-emergency/ColoursEmergencyGame").then((m) => ({
      default: m.ColoursEmergencyGame,
    }))
  ),
  "colours-build": lazy(() =>
    import("@games/colours-build/ColoursBuildGame").then((m) => ({ default: m.ColoursBuildGame }))
  ),
  "fruit-easy": lazy(() =>
    import("@games/fruit-easy/FruitEasyGame").then((m) => ({ default: m.FruitEasyGame }))
  ),
  "fruit-tricky": lazy(() =>
    import("@games/fruit-tricky/FruitTrickyGame").then((m) => ({ default: m.FruitTrickyGame }))
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
  "whats-inside": lazy(() =>
    import("@games/whats-inside/WhatsInsideGame").then((m) => ({ default: m.WhatsInsideGame }))
  ),
  "birthday-party": lazy(() =>
    import("@games/birthday-party/BirthdayPartyGame").then((m) => ({
      default: m.BirthdayPartyGame,
    }))
  ),
  "rocket-countdown": lazy(() =>
    import("@games/rocket-countdown/RocketCountdownGame").then((m) => ({
      default: m.RocketCountdownGame,
    }))
  ),
  "feed-the-fish": lazy(() =>
    import("@games/feed-the-fish/FeedTheFishGame").then((m) => ({ default: m.FeedTheFishGame }))
  ),
  "car-garage": lazy(() =>
    import("@games/car-garage/CarGarageGame").then((m) => ({ default: m.CarGarageGame }))
  ),
};

interface GamePlayerProps {
  gameId: string;
  className?: string;
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
export function GamePlayer({ gameId, className }: GamePlayerProps) {
  const Game = GAME_COMPONENTS[gameId];
  const steps = howToPlayFor(gameId);
  const title = GAMES.find((g) => g.id === gameId)?.title;
  // Keyed by game id, so opening another game shows its own card again.
  const [startedId, setStartedId] = useState<string | null>(null);
  const start = useCallback(() => setStartedId(gameId), [gameId]);
  const gated = GATED_GAMES.has(gameId);
  const started = gated || startedId === gameId || !steps;

  return (
    <div
      className={cn(
        "pl-shell font-rounded relative h-full w-full overflow-hidden bg-white antialiased",
        className
      )}
    >
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
