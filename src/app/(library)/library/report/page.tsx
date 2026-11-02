"use client";

import { MonthlyReportPanel } from "@/features/library/MonthlyReportPanel";

export default function LibraryReportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Monthly progress report</h1>
        <p className="mt-1 text-sm text-slate-600">
          Premium parents can review skill progress and download a PDF summary.
        </p>
      </div>
      <MonthlyReportPanel />
    </div>
  );
}
