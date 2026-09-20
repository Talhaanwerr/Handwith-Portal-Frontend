"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/constants";
import { libraryApi } from "@/features/library/api";
import { ensureLibraryAccessToken } from "@/features/library/ensure-access-token";
import { resolvePlayable } from "@/features/library/playable";
import { GamePlayer } from "@/features/super-admin/library/GamePlayer";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type Summary = {
  durationSecs: number;
  score: number | null;
  completionPct: number | null;
  skillLabels: string[];
};

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

function LibraryPlayContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id;
  const sessionId = searchParams.get("sessionId");

  const startedAt = useRef<number | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["library", "browse", id],
    queryFn: () => libraryApi.browseOne(id),
    enabled: Boolean(id),
  });

  const item = data?.data;
  const playable = useMemo(() => (item ? resolvePlayable(item) : null), [item]);

  useEffect(() => {
    startedAt.current = Date.now();
  }, [id]);

  async function finishPlay() {
    if (!item || isFinishing) return;
    setIsFinishing(true);

    const start = startedAt.current ?? Date.now();
    const durationSecs = Math.max(1, Math.round((Date.now() - start) / 1000));
    const completionPct = Math.min(100, Math.round((durationSecs / 120) * 100));
    const skillLabels = item.tags.filter((t) => t.category === "SKILL_AREA").map((t) => t.label);

    if (sessionId) {
      try {
        await ensureLibraryAccessToken();
        await libraryApi.completeSession(sessionId, {
          durationSecs,
          completionPct,
          score: null,
        });
      } catch {
        // Still show local summary if API fails.
      }
    }

    setSummary({
      durationSecs,
      score: null,
      completionPct,
      skillLabels,
    });
    setIsFinishing(false);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-stone-600" />
      </div>
    );
  }

  if (isError || !item || !playable) {
    return (
      <div className="space-y-3 p-6">
        <p className="text-stone-700">Could not load this activity.</p>
        <Link href={ROUTES.LIBRARY_BROWSE} className="text-sm underline">
          Back to browse
        </Link>
      </div>
    );
  }

  if (summary) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
        <p className="text-sm font-medium tracking-wide text-stone-500 uppercase">
          Session complete
        </p>
        <h1 className="font-serif text-3xl text-stone-900">Well done!</h1>
        <p className="text-stone-600">
          You practiced <span className="font-medium text-stone-900">{item.title}</span>.
        </p>
        <dl className="grid w-full grid-cols-2 gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-left text-sm">
          <div>
            <dt className="text-stone-400">Time</dt>
            <dd className="font-medium text-stone-900">{formatDuration(summary.durationSecs)}</dd>
          </div>
          <div>
            <dt className="text-stone-400">Completion</dt>
            <dd className="font-medium text-stone-900">{summary.completionPct}%</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-stone-400">Skills</dt>
            <dd className="font-medium text-stone-900">
              {summary.skillLabels.length > 0 ? summary.skillLabels.join(", ") : "General practice"}
            </dd>
          </div>
        </dl>
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={() => router.push(`${ROUTES.LIBRARY_GAME}/${id}`)}>
            Back to details
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => router.push(ROUTES.LIBRARY_BROWSE)}
          >
            Browse more
          </Button>
        </div>
      </div>
    );
  }

  if (playable.kind === "unavailable") {
    return (
      <div className="mx-auto max-w-lg space-y-4 px-4 py-12 text-center">
        <h1 className="font-serif text-2xl text-stone-900">{item.title}</h1>
        <p className="text-sm text-stone-600">{playable.reason}</p>
        <Link href={`${ROUTES.LIBRARY_GAME}/${id}`}>
          <Button variant="outline">Back</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[70vh] flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-stone-900">{item.title}</p>
          <p className="text-xs text-stone-500">Playing in library</p>
        </div>
        <Button variant="outline" size="sm" onClick={finishPlay} disabled={isFinishing}>
          {isFinishing ? "Saving…" : "I'm done"}
        </Button>
      </div>

      <div className="relative min-h-[60vh] flex-1 overflow-hidden rounded-2xl border border-stone-200 bg-white">
        {playable.kind === "playlab" ? (
          <GamePlayer gameId={playable.gameId} />
        ) : (
          <iframe
            title={item.title}
            src={playable.url}
            className="h-full min-h-[60vh] w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
}

export default function LibraryPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-stone-600" />
        </div>
      }
    >
      <LibraryPlayContent />
    </Suspense>
  );
}
