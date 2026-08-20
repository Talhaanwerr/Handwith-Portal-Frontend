"use client";

import Link from "next/link";
import type { GameMeta } from "@/types/games";

interface GameCardProps {
  game: GameMeta;
}

export function GameCard({ game }: GameCardProps) {
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
      {/* Glyph */}
      <div className="flex items-center justify-center px-6 pt-8 pb-4">
        <span
          className="text-6xl transition-transform duration-200 group-hover:scale-110 sm:text-7xl"
          role="img"
          aria-hidden="true"
        >
          {game.glyph}
        </span>
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
