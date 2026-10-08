"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { GameCard } from "@/features/super-admin/library/GameCard";
import type { GameCategory, GameMeta } from "@/types/games";

type Filter = "all" | GameCategory;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "literacy", label: "Literacy" },
  { value: "cognitive", label: "Cognitive" },
  { value: "numbers", label: "Numbers" },
];

/** The Library grid with a row of category pills above it. */
export function LibraryShelf({ games }: { games: readonly GameMeta[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const shown = filter === "all" ? games : games.filter((game) => game.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={filter === value}
            onClick={() => setFilter(value)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition-colors",
              filter === value
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted border"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {shown.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
