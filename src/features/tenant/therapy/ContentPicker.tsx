"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { libraryApi, type LibraryContentItem } from "@/features/library/api";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (item: LibraryContentItem) => void;
};

/**
 * Plain browse picker for therapists (Phase 9.4).
 * No AI ranking — filters via public GET /library/browse.
 */
export function ContentPicker({ open, onClose, onSelect }: Props) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tagId, setTagId] = useState("");

  const tagsQuery = useQuery({
    queryKey: ["library", "tags", "SKILL_AREA"],
    queryFn: () => libraryApi.tags("SKILL_AREA"),
    enabled: open,
  });

  const browseQuery = useQuery({
    queryKey: ["library", "browse", "picker", search, type, difficulty, tagId],
    queryFn: () =>
      libraryApi.browse({
        page: 1,
        limit: 24,
        search: search.trim() || undefined,
        type: type || undefined,
        difficulty: difficulty || undefined,
        tagId: tagId || undefined,
        sortBy: "playCount",
        sortOrder: "desc",
      }),
    enabled: open,
  });

  const skillTags = tagsQuery.data?.data?.tags ?? [];
  const items = browseQuery.data?.data?.items ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="flex max-h-[85vh] max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Attach library content</DialogTitle>
          <DialogDescription>
            Browse Content Library games and activities. Select one to attach.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute top-2.5 left-2.5 h-4 w-4 text-slate-400" />
            <Input
              className="pl-8"
              placeholder="Search title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All types</option>
            <option value="GAME">Game</option>
            <option value="VIDEO">Video</option>
            <option value="ACTIVITY">Activity</option>
            <option value="DRAWING">Drawing</option>
          </select>
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">All difficulty</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          <select
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            value={tagId}
            onChange={(e) => setTagId(e.target.value)}
          >
            <option value="">All skill areas</option>
            {skillTags.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {browseQuery.isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">No content matched.</p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className="flex w-full gap-3 rounded-lg border border-slate-200 bg-white p-3 text-left transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    {item.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnailUrl}
                        alt=""
                        className="h-14 w-14 shrink-0 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-400">
                        {item.type}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500">
                        {item.type} · {item.difficulty} · {item.tier}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {item.tags
                          .filter((t) => t.category === "SKILL_AREA")
                          .map((t) => t.label)
                          .join(", ") || "—"}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
