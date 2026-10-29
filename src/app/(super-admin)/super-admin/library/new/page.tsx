"use client";

import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { ContentItemForm } from "@/features/super-admin/library/ContentItemForm";

export default function NewLibraryContentPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Add library content"
        description="Create a game, video, activity, or drawing for the public library."
        action={
          <Link href="/super-admin/library" className="text-sm text-slate-500 hover:text-slate-800">
            ← Back to library
          </Link>
        }
      />
      <ContentItemForm mode="create" />
    </div>
  );
}
