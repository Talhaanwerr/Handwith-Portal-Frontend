"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  THERAPY_CHILDREN_QUERY_KEY,
  THERAPY_LIBRARY_HISTORY_QUERY_KEY,
} from "@/constants/query-keys";
import { therapyApi } from "@/lib/therapy-api";

function formatDuration(secs: number | null): string {
  if (secs == null) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function TherapyReportsPanel() {
  const [childId, setChildId] = useState("");

  const childrenQuery = useQuery({
    queryKey: [THERAPY_CHILDREN_QUERY_KEY, "reports"],
    queryFn: () => therapyApi.listChildren({ page: 1, limit: 100, activeOnly: true }),
  });

  const historyQuery = useQuery({
    queryKey: [THERAPY_LIBRARY_HISTORY_QUERY_KEY, childId],
    queryFn: () => therapyApi.libraryHistory(childId, { page: 1, limit: 50 }),
    enabled: Boolean(childId),
  });

  const children = childrenQuery.data?.data?.items ?? [];
  const history = historyQuery.data?.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="h-10 min-w-[220px] rounded-md border border-slate-200 bg-white px-3 text-sm"
          value={childId}
          onChange={(e) => setChildId(e.target.value)}
        >
          <option value="">Select child…</option>
          {children.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {!childId ? (
        <p className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
          Select a child to view independent library play history (read-only context).
        </p>
      ) : historyQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      ) : (
        <>
          {history?.note && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {history.note}
            </p>
          )}
          {history?.linkedLibraryChildren?.length ? (
            <p className="text-xs text-slate-500">
              Linked library profiles: {history.linkedLibraryChildren.map((c) => c.name).join(", ")}
            </p>
          ) : null}
          {!history?.items?.length ? (
            <p className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
              No completed library sessions for this child.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Content</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Score</th>
                    <th className="px-4 py-3 font-medium">Completion</th>
                    <th className="px-4 py-3 font-medium">Homework</th>
                  </tr>
                </thead>
                <tbody>
                  {history.items.map((row) => (
                    <tr key={row.id} className="border-t border-slate-100">
                      <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                        {new Date(row.playedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">{row.content.title}</p>
                        <p className="text-xs text-slate-400">{row.content.type}</p>
                      </td>
                      <td className="px-4 py-3">{formatDuration(row.durationSecs)}</td>
                      <td className="px-4 py-3">{row.score ?? "—"}</td>
                      <td className="px-4 py-3">
                        {row.completionPct != null ? `${row.completionPct}%` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        {row.homeworkAssignmentId ? (
                          <span className="text-emerald-700">Linked</span>
                        ) : (
                          <span className="text-slate-400">Independent</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
