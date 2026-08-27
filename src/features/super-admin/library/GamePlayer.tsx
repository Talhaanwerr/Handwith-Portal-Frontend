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
