"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { THERAPY_MY_HOMEWORK_QUERY_KEY } from "@/constants/query-keys";
import { ROUTES } from "@/constants";
import { therapyApi } from "@/lib/therapy-api";

export function MyHomeworkPanel() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [THERAPY_MY_HOMEWORK_QUERY_KEY],
    queryFn: () => therapyApi.listMyHomework({ page: 1, limit: 50 }),
  });

  const items = data?.data?.items ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {(error as Error)?.message || "Could not load homework."}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
        No homework assigned to your children yet.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((hw) => (
        <li
          key={hw.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900">
              {hw.title || hw.content?.title || "Homework"} — {hw.therapyChild.name}
            </p>
            <p className="mt-1 text-sm text-slate-600">{hw.instructions}</p>
            {hw.content && <p className="mt-1 text-xs text-slate-500">Game: {hw.content.title}</p>}
            {hw.gameCompletedLabel && (
              <p className="mt-2 text-sm font-medium text-emerald-700">{hw.gameCompletedLabel}</p>
            )}
            <p className="mt-1 text-xs text-slate-400">
              Status: {hw.status}
              {hw.dueDate ? ` · Due ${new Date(hw.dueDate).toLocaleDateString()}` : ""}
            </p>
          </div>
          {hw.contentItemId && hw.status !== "CANCELLED" && hw.status !== "COMPLETED" && (
            <Button asChild>
              <Link href={`${ROUTES.THERAPY_MY_HOMEWORK}/${hw.id}/play`}>
                <Play className="h-4 w-4" />
                Play Game
              </Link>
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
