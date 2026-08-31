"use client";

import Link from "next/link";
import type { GameMeta } from "@/types/games";
import { GAME_SCENE_ICONS } from "@shared/components/icons/GameSceneIcons";

interface GameCardProps {
  game: GameMeta;
}

export function GameCard({ game }: GameCardProps) {
  const SceneIcon = GAME_SCENE_ICONS[game.id];
  return (
    <Link
      href={`/play/${game.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      style={{
        backgroundColor: game.colors.bg,
        borderColor: game.colors.border,
      }}
      aria-label={`Play ${game.title}`}
    >
      {/* The game's miniature scene — a tiny picture of the gameplay itself.
          The emoji glyph remains only as a fallback for ids without a scene. */}
      <div className="flex items-center justify-center px-6 pt-6 pb-3">
        <div
          className="h-24 w-24 transition-transform duration-200 group-hover:scale-105 sm:h-28 sm:w-28"
          aria-hidden="true"
        >
          {SceneIcon ? (
            <SceneIcon />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-6xl" role="img">
              {game.glyph}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 px-5 pb-6 text-center">
        <h3 className="text-lg leading-tight font-bold" style={{ color: game.colors.text }}>
          {game.title}
        </h3>
        <p className="text-sm opacity-80" style={{ color: game.colors.text }}>
          {game.description}
        </p>
      </div>

      {/* Play indicator */}
      <div
        className="mx-5 mb-5 flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold transition-opacity duration-200 group-hover:opacity-100 sm:opacity-0"
        style={{ backgroundColor: game.colors.border, color: "#fff" }}
      >
        <span>▶</span>
        <span>Play</span>
      </div>
    </Link>
  );
}
