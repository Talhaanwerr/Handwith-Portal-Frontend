import type { Metadata } from "next";
import { headers } from "next/headers";
import { LIBRARY_STANDALONE_HEADER } from "@/lib/library-host";
import { LibraryProvider } from "@/providers/library-provider";
import { LibraryShell } from "@/features/library/components/LibraryShell";

export const metadata: Metadata = {
  title: {
    default: "Content Library",
    template: "%s | Handwith Library",
  },
  description: "Games, activities, and videos for children — Handwith Content Library",
};

export default async function LibraryLayout({ children }: { children: React.ReactNode }) {
  const h = await headers();
  const isStandalone = h.get(LIBRARY_STANDALONE_HEADER) === "1";

  return (
    <LibraryProvider isStandalone={isStandalone}>
      <LibraryShell>{children}</LibraryShell>
    </LibraryProvider>
  );
}
