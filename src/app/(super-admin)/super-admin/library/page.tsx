import type { Metadata } from "next";
import { Library } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { GameCard } from "@/features/super-admin/library/GameCard";
import { GAMES } from "@/constants/games";

export const metadata: Metadata = { title: "Library" };

export default function LibraryPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Game Library"
        description="Browse and launch educational games for children"
      />

      {GAMES.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No games available"
          description="Games will appear here once they are added to the registry."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {GAMES.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      )}
    </div>
  );
}
