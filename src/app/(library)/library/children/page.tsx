"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { libraryApi } from "@/features/library/api";
import { ApiError } from "@/lib/api-error";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const CHILDREN_QUERY_KEY = ["library", "children"] as const;

export default function LibraryChildrenPage() {
  const qc = useQueryClient();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: CHILDREN_QUERY_KEY,
    queryFn: () => libraryApi.listChildren(),
  });

  const children = data?.data ?? [];
  const loadError =
    actionError ??
    (isError
      ? error instanceof ApiError
        ? error.message
        : "Could not load child profiles."
      : null);

  async function handleRemove(id: string) {
    setRemovingId(id);
    setActionError(null);
    try {
      await libraryApi.deleteChild(id);
      await qc.invalidateQueries({ queryKey: CHILDREN_QUERY_KEY });
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not remove profile.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-stone-900">Child profiles</h1>
          <p className="mt-1 text-sm text-stone-600">
            Free accounts can add 1 child. Premium accounts can add up to 5.
          </p>
        </div>
        <Link href={ROUTES.LIBRARY_SETUP_CHILD}>
          <Button>Add child</Button>
        </Link>
      </div>

      {loadError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {loadError}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-stone-600" />
        </div>
      ) : children.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
          <p className="text-sm text-stone-600">No child profiles yet.</p>
          <Link
            href={ROUTES.LIBRARY_SETUP_CHILD}
            className="mt-3 inline-block text-sm font-medium text-stone-900 underline"
          >
            Create the first one
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {children.map((child) => (
            <li
              key={child.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white px-4 py-3"
            >
              <div>
                <p className="font-medium text-stone-900">{child.name}</p>
                <p className="text-xs text-stone-500">
                  {child.dateOfBirth
                    ? `Born ${new Date(child.dateOfBirth).toLocaleDateString()}`
                    : "No date of birth"}
                  {Array.isArray(child.primaryInterests) && child.primaryInterests.length > 0
                    ? ` · ${(child.primaryInterests as string[]).join(", ")}`
                    : ""}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={removingId === child.id}
                onClick={() => handleRemove(child.id)}
              >
                {removingId === child.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Link
        href={ROUTES.LIBRARY_DASHBOARD}
        className="inline-block text-sm text-stone-500 hover:text-stone-800"
      >
        ← Back to dashboard
      </Link>
    </div>
  );
}
