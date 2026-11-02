"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants";
import { THERAPY_MY_HOMEWORK_QUERY_KEY } from "@/constants/query-keys";
import { resolvePlayable } from "@/features/library/playable";
import type { LibraryContentItem } from "@/features/library/api";
import { GamePlayer } from "@/features/super-admin/library/GamePlayer";
import { therapyApi, type TherapyContentCard } from "@/lib/therapy-api";
import { useQueryClient } from "@tanstack/react-query";

function toLibraryItem(c: TherapyContentCard): LibraryContentItem {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    type: c.type,
    embedUrl: c.embedUrl ?? null,
    fileId: c.fileId ?? null,
    thumbnailUrl: c.thumbnailUrl,
    tier: (c.tier as "FREE" | "PREMIUM") || "FREE",
    ageRange: c.ageRange,
    difficulty: c.difficulty,
    duration: c.duration,
    playCount: c.playCount,
    tags: c.tags,
  };
}

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export default function HomeworkPlayPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const homeworkId = params.id;

  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [content, setContent] = useState<TherapyContentCard | null>(null);
  const [starting, setStarting] = useState(true);
  const [isFinishing, setIsFinishing] = useState(false);
  const [summary, setSummary] = useState<{
    durationSecs: number;
    completionPct: number;
  } | null>(null);
  const startedAt = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setStarting(true);
      setError(null);
      try {
        const res = await therapyApi.startHomeworkPlay(homeworkId);
        if (cancelled) return;
        if (!res.data) throw new Error("Could not start homework play");
        setSessionId(res.data.sessionId);
        setContent(res.data.content);
        startedAt.current = Date.now();
      } catch (e) {
        if (!cancelled) {
          setError((e as Error)?.message || "Could not start homework play");
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [homeworkId]);

  const playable = useMemo(
    () => (content ? resolvePlayable(toLibraryItem(content)) : null),
    [content]
  );

  async function finishPlay() {
    if (!sessionId || isFinishing) return;
    setIsFinishing(true);
    const start = startedAt.current ?? Date.now();
    const durationSecs = Math.max(1, Math.round((Date.now() - start) / 1000));
    const completionPct = Math.min(100, Math.round((durationSecs / 120) * 100));

    try {
      await therapyApi.completeHomeworkSession(sessionId, {
        durationSecs,
        completionPct,
        score: null,
      });
      qc.invalidateQueries({ queryKey: [THERAPY_MY_HOMEWORK_QUERY_KEY] });
    } catch {
      // Still show local summary
    }

    setSummary({ durationSecs, completionPct });
    setIsFinishing(false);
  }

  if (starting) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    );
  }

  if (error || !content || !playable || playable.kind === "unavailable") {
    return (
      <div className="mx-auto max-w-md space-y-4 px-4 py-12 text-center">
        <p className="text-slate-700">
          {error ||
            (playable && playable.kind === "unavailable"
              ? playable.reason
              : "Could not load this activity.")}
        </p>
        <Button asChild variant="outline">
          <Link href={ROUTES.THERAPY_MY_HOMEWORK}>Back to homework</Link>
        </Button>
      </div>
    );
  }

  if (summary) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-5 px-4 text-center">
        <p className="text-sm font-medium tracking-wide text-slate-500 uppercase">
          Homework complete
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">Well done!</h1>
        <p className="text-slate-600">
          You finished <span className="font-medium text-slate-900">{content.title}</span>. Homework
          is marked completed for your therapist.
        </p>
        <dl className="grid w-full grid-cols-2 gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left text-sm">
          <div>
            <dt className="text-slate-400">Time</dt>
            <dd className="font-medium text-slate-900">{formatDuration(summary.durationSecs)}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Completion</dt>
            <dd className="font-medium text-slate-900">{summary.completionPct}%</dd>
          </div>
        </dl>
        <Button onClick={() => router.push(ROUTES.THERAPY_MY_HOMEWORK)}>Back to homework</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
            Homework play
          </p>
          <h1 className="text-xl font-semibold text-slate-900">{content.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={ROUTES.THERAPY_MY_HOMEWORK}>Cancel</Link>
          </Button>
          <Button onClick={finishPlay} disabled={isFinishing}>
            {isFinishing && <Loader2 className="h-4 w-4 animate-spin" />}
            Finish
          </Button>
        </div>
      </div>

      {playable.kind === "playlab" ? (
        <div className="relative h-[70vh] overflow-hidden rounded-xl border border-slate-200 bg-white">
          <GamePlayer gameId={playable.gameId} />
        </div>
      ) : (
        <iframe
          title={content.title}
          src={playable.url}
          className="h-[70vh] w-full rounded-xl border border-slate-200 bg-white"
          allow="fullscreen; autoplay"
        />
      )}
    </div>
  );
}
