"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/constants";
import { libraryApi } from "@/features/library/api";
import { LibraryContentCard } from "@/features/library/components/LibraryContentCard";
import { ChildSelectModal } from "@/features/library/components/ChildSelectModal";
import {
  AGE_LABELS,
  DIFFICULTY_LABELS,
  DURATION_LABELS,
  TYPE_LABELS,
  labelOrRaw,
} from "@/features/library/labels";
import { canPlayContent } from "@/features/library/tier-access";
import { resolvePlayable } from "@/features/library/playable";
import { ensureLibraryAccessToken } from "@/features/library/ensure-access-token";
import { useLibrary } from "@/providers/library-provider";
import { parseLibrarySessionCookie } from "@/lib/library-session-cookie";
import { libraryTokenManager } from "@/lib/library-token";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-error";

function readLibraryTierFromCookie(): "FREE" | "PREMIUM" | null {
  if (typeof document === "undefined") return null;
  return parseLibrarySessionCookie(document.cookie)?.tier ?? null;
}

export default function LibraryGameDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const router = useRouter();
  const { authMode, hasLibrarySession } = useLibrary();

  const [showChildModal, setShowChildModal] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [playError, setPlayError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["library", "browse", id],
    queryFn: () => libraryApi.browseOne(id),
    enabled: Boolean(id),
  });

  const item = data?.data;

  const libraryTier = authMode === "library" ? readLibraryTierFromCookie() : null;
  const allowed = item ? canPlayContent({ contentTier: item.tier, authMode, libraryTier }) : false;

  const skillTags = item?.tags.filter((t) => t.category === "SKILL_AREA") ?? [];
  const primaryTagId = skillTags[0]?.id;

  const relatedQuery = useQuery({
    queryKey: ["library", "browse", "related", id, primaryTagId, item?.type],
    queryFn: () =>
      libraryApi.browse({
        page: 1,
        limit: 4,
        tagId: primaryTagId,
        type: primaryTagId ? undefined : item?.type,
        sortBy: "playCount",
        sortOrder: "desc",
      }),
    enabled: Boolean(item),
  });

  const related = useMemo(
    () => (relatedQuery.data?.data?.items ?? []).filter((r) => r.id !== id).slice(0, 3),
    [relatedQuery.data, id]
  );

  const childrenQuery = useQuery({
    queryKey: ["library", "children"],
    queryFn: async () => {
      await ensureLibraryAccessToken();
      return libraryApi.listChildren();
    },
    enabled: hasLibrarySession || authMode === "library",
    retry: false,
  });

  const childrenList = (childrenQuery.data?.data ?? []).filter((c) => c.isActive);

  async function goToPlay(childId?: string, sessionId?: string) {
    const qs = new URLSearchParams();
    if (childId) qs.set("childId", childId);
    if (sessionId) qs.set("sessionId", sessionId);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    router.push(`${ROUTES.LIBRARY_GAME}/${id}/play${suffix}`);
  }

  async function startPlayFlow() {
    setPlayError(null);
    if (!item || !allowed) return;

    const playable = resolvePlayable(item);
    if (playable.kind === "unavailable") {
      setPlayError(playable.reason);
      return;
    }

    const token =
      authMode === "library" || hasLibrarySession
        ? await ensureLibraryAccessToken()
        : libraryTokenManager.getAccessToken();

    // Anonymous / portal without library token: play locally without session.
    if (!token) {
      await goToPlay();
      return;
    }

    let kids = childrenList;
    if (kids.length === 0) {
      try {
        const res = await libraryApi.listChildren();
        kids = (res.data ?? []).filter((c) => c.isActive);
      } catch {
        kids = [];
      }
    }

    if (kids.length === 0) {
      setPlayError("Add a child profile before tracking plays.");
      return;
    }

    if (kids.length > 1) {
      setSelectedChildId(kids[0]?.id ?? null);
      setShowChildModal(true);
      return;
    }

    await beginSessionAndPlay(kids[0]!.id);
  }

  async function beginSessionAndPlay(childId: string) {
    setIsStarting(true);
    setPlayError(null);
    try {
      await ensureLibraryAccessToken();
      const res = await libraryApi.startSession({
        childProfileId: childId,
        contentItemId: id,
      });
      const sessionId = res.data?.id;
      await goToPlay(childId, sessionId);
    } catch (err) {
      setPlayError(err instanceof ApiError ? err.message : "Could not start a tracked session.");
      await goToPlay(childId);
    } finally {
      setIsStarting(false);
      setShowChildModal(false);
    }
  }

  if (isLoading) return <p className="text-sm text-stone-500">Loading…</p>;
  if (isError || !item) {
    return (
      <div className="space-y-3">
        <p className="text-stone-700">Content not found or not published.</p>
        <Link href={ROUTES.LIBRARY_BROWSE} className="text-sm text-stone-600 underline">
          Back to browse
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <Link href={ROUTES.LIBRARY_BROWSE} className="text-sm text-stone-500 hover:text-stone-800">
        ← Browse
      </Link>

      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-start">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-100">
            {item.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.thumbnailUrl} alt="" className="aspect-[16/10] w-full object-cover" />
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center text-sm text-stone-400">
                {labelOrRaw(TYPE_LABELS, item.type)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
              {labelOrRaw(TYPE_LABELS, item.type)} · {item.tier === "PREMIUM" ? "Premium" : "Free"}
            </p>
            <h1 className="font-serif text-3xl text-stone-900">{item.title}</h1>
            {item.description && <p className="text-stone-600">{item.description}</p>}
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm text-stone-600 sm:grid-cols-4">
            <div>
              <dt className="text-stone-400">Age</dt>
              <dd>{labelOrRaw(AGE_LABELS, item.ageRange)}</dd>
            </div>
            <div>
              <dt className="text-stone-400">Difficulty</dt>
              <dd>{labelOrRaw(DIFFICULTY_LABELS, item.difficulty)}</dd>
            </div>
            <div>
              <dt className="text-stone-400">Duration</dt>
              <dd>{labelOrRaw(DURATION_LABELS, item.duration)}</dd>
            </div>
            <div>
              <dt className="text-stone-400">Plays</dt>
              <dd>{item.playCount}</dd>
            </div>
          </dl>

          {item.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <li
                  key={tag.id}
                  className="rounded-full bg-stone-200/70 px-2.5 py-0.5 text-xs text-stone-700"
                >
                  {tag.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
          {allowed ? (
            <>
              <h2 className="font-medium text-stone-900">Ready to play?</h2>
              <p className="text-sm text-stone-500">
                {authMode === "library"
                  ? "We'll save this play to the selected child profile when possible."
                  : "You can play free content without an account. Sign in to track progress."}
              </p>
              <Button className="w-full" onClick={startPlayFlow} disabled={isStarting}>
                {isStarting ? "Starting…" : "Play now"}
              </Button>
            </>
          ) : (
            <>
              <h2 className="font-medium text-stone-900">Premium content</h2>
              <p className="text-sm text-stone-500">
                Upgrade to Premium (or sign in with a Premium library account) to play this item.
              </p>
              <div className="flex flex-col gap-2">
                <Link href={ROUTES.LIBRARY_REGISTER}>
                  <Button className="w-full">Create free account</Button>
                </Link>
                <Link href={ROUTES.LIBRARY_LOGIN}>
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
              </div>
            </>
          )}

          {playError && (
            <p role="alert" className="text-sm text-amber-800">
              {playError}
            </p>
          )}

          {authMode === "library" && childrenList.length === 0 && (
            <Link
              href={ROUTES.LIBRARY_SETUP_CHILD}
              className="block text-center text-sm text-stone-600 underline hover:text-stone-900"
            >
              Set up a child profile
            </Link>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-stone-900">Related content</h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {related.map((r) => (
              <li key={r.id}>
                <LibraryContentCard item={r} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {showChildModal && (
        <ChildSelectModal
          childrenList={childrenList}
          selectedId={selectedChildId}
          onSelect={setSelectedChildId}
          onCancel={() => setShowChildModal(false)}
          onConfirm={() => {
            if (selectedChildId) void beginSessionAndPlay(selectedChildId);
          }}
          isStarting={isStarting}
        />
      )}
    </article>
  );
}
