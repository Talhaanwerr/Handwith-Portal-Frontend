"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ROUTES } from "@/constants";
import { libraryApi } from "@/features/library/api";
import { LibraryContentCard } from "@/features/library/components/LibraryContentCard";
import { useLibrary } from "@/providers/library-provider";

function ContentRow({
  title,
  href,
  items,
  isLoading,
  isError,
  emptyText,
}: {
  title: string;
  href: string;
  items: NonNullable<Awaited<ReturnType<typeof libraryApi.browse>>["data"]>["items"];
  isLoading: boolean;
  isError: boolean;
  emptyText: string;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-xl font-semibold text-stone-900">{title}</h2>
        <Link href={href} className="text-sm text-stone-600 hover:text-stone-900">
          View all
        </Link>
      </div>

      {isLoading && <p className="text-sm text-stone-500">Loading content…</p>}
      {isError && (
        <p className="text-sm text-amber-800">
          Could not load content yet. Make sure the backend library APIs are running.
        </p>
      )}
      {!isLoading && !isError && items.length === 0 && (
        <p className="rounded-lg border border-dashed border-stone-300 bg-white/50 px-4 py-8 text-center text-sm text-stone-500">
          {emptyText}
        </p>
      )}
      {items.length > 0 && (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id}>
              <LibraryContentCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function LibraryHomePage() {
  const { isStandalone, authMode } = useLibrary();
  const showAuthCta = authMode === "anonymous";

  const featured = useQuery({
    queryKey: ["library", "browse", "featured"],
    queryFn: () => libraryApi.browse({ page: 1, limit: 6, sortBy: "playCount", sortOrder: "desc" }),
  });

  const newest = useQuery({
    queryKey: ["library", "browse", "newest"],
    queryFn: () => libraryApi.browse({ page: 1, limit: 6, sortBy: "createdAt", sortOrder: "desc" }),
  });

  const mostPlayed = useQuery({
    queryKey: ["library", "browse", "most-played"],
    queryFn: () => libraryApi.browse({ page: 1, limit: 6, sortBy: "playCount", sortOrder: "desc" }),
  });

  return (
    <div className="space-y-14">
      <section className="space-y-4">
        <p className="text-sm font-medium tracking-wide text-stone-500 uppercase">
          {isStandalone ? "Handwith Content Library" : "Portal · Content Library"}
        </p>
        <h1 className="max-w-2xl font-serif text-4xl leading-tight text-stone-900 md:text-5xl">
          Practice skills at home with games, activities, and videos
        </h1>
        <p className="max-w-xl text-lg text-stone-600">
          Browse free content without an account. Sign in to track progress for your child.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href={ROUTES.LIBRARY_BROWSE}
            className="rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800"
          >
            Browse library
          </Link>
          {showAuthCta && (
            <>
              <Link
                href={ROUTES.LIBRARY_REGISTER}
                className="rounded-md border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
              >
                Create free account
              </Link>
              <Link
                href={ROUTES.LIBRARY_LOGIN}
                className="rounded-md px-4 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </section>

      <ContentRow
        title="Featured"
        href={`${ROUTES.LIBRARY_BROWSE}?sort=playCount`}
        items={featured.data?.data?.items ?? []}
        isLoading={featured.isLoading}
        isError={featured.isError}
        emptyText="No featured content yet. Popular items will appear here as families play."
      />

      <ContentRow
        title="Newly added"
        href={`${ROUTES.LIBRARY_BROWSE}?sort=createdAt`}
        items={newest.data?.data?.items ?? []}
        isLoading={newest.isLoading}
        isError={newest.isError}
        emptyText="No published content yet. Super Admin can add items via the library content APIs."
      />

      <ContentRow
        title="Most played"
        href={`${ROUTES.LIBRARY_BROWSE}?sort=playCount`}
        items={mostPlayed.data?.data?.items ?? []}
        isLoading={mostPlayed.isLoading}
        isError={mostPlayed.isError}
        emptyText="Play counts will show here once families start games."
      />
    </div>
  );
}
