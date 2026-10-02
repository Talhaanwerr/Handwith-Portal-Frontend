import type { Metadata } from "next";
import { Library } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { LibraryShelf } from "@/features/super-admin/library/LibraryShelf";
import { GAMES } from "@/constants/games";

export const metadata: Metadata = { title: "Library" };

export default function LibraryPage() {
  /** Games still being worked on keep their entry — and their /play route —
   *  but are not offered on the shelf. */
  const shelf = GAMES.filter((game) => !game.hidden);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Game Library"
        description="Browse and launch educational games for children"
      />

      {shelf.length === 0 ? (
        <EmptyState
          icon={Library}
          title="No games available"
          description="Games will appear here once they are added to the registry."
        />
      ) : (
        <LibraryShelf games={shelf} />
      )}
    </div>
  );
}
