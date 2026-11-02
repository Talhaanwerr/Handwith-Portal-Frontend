"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/page-header";
import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { ContentItemForm } from "@/features/super-admin/library/ContentItemForm";
import { ContentAnalyticsPanel } from "@/features/super-admin/library/ContentAnalyticsPanel";
import { adminLibraryApi } from "@/lib/admin-library-api";
import { LIBRARY_CONTENT_QUERY_KEY } from "@/constants/query-keys";

export default function EditLibraryContentPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const query = useQuery({
    queryKey: [LIBRARY_CONTENT_QUERY_KEY, id],
    queryFn: () => adminLibraryApi.getContent(id),
    enabled: Boolean(id),
  });

  if (query.isLoading) {
    return <LoadingSkeleton className="h-64 w-full" />;
  }

  if (query.isError || !query.data?.data) {
    return <ErrorState title="Content not found" onRetry={() => query.refetch()} />;
  }

  const item = query.data.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Edit content"
        description={item.title}
        action={
          <Link href="/super-admin/library" className="text-sm text-slate-500 hover:text-slate-800">
            ← Back to library
          </Link>
        }
      />
      {item.stats ? <ContentAnalyticsPanel stats={item.stats} /> : null}
      <ContentItemForm key={item.id} mode="edit" initial={item} />
    </div>
  );
}
