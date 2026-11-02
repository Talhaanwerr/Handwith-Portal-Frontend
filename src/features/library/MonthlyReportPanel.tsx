"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LIBRARY_CHILD_REPORT_QUERY_KEY } from "@/constants/query-keys";
import { libraryApi } from "@/features/library/api";
import { ensureLibraryAccessToken } from "@/features/library/ensure-access-token";
import { downloadMonthlyReportPdf } from "@/features/library/MonthlyReportPdf";

function currentMonthValue(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function MonthlyReportPanel() {
  const [childId, setChildId] = useState("");
  const [month, setMonth] = useState(currentMonthValue);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const childrenQuery = useQuery({
    queryKey: ["library", "children", "report"],
    queryFn: async () => {
      await ensureLibraryAccessToken();
      return libraryApi.listChildren();
    },
  });

  const children = childrenQuery.data?.data ?? [];
  const selectedChildId = childId || children[0]?.id || "";

  const reportQuery = useQuery({
    queryKey: [LIBRARY_CHILD_REPORT_QUERY_KEY, selectedChildId, month],
    queryFn: async () => {
      await ensureLibraryAccessToken();
      return libraryApi.childReport(selectedChildId, month);
    },
    enabled: Boolean(selectedChildId && month),
  });

  const payload = reportQuery.data?.data;
  const chartData = useMemo(
    () =>
      (payload?.report?.skillBreakdown ?? []).map((s) => ({
        skill: s.skill,
        percent: s.percent,
      })),
    [payload]
  );

  async function onDownload() {
    if (!payload?.report) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      await downloadMonthlyReportPdf(payload);
    } catch (e) {
      setDownloadError((e as Error)?.message || "Could not generate PDF");
    } finally {
      setDownloading(false);
    }
  }

  if (childrenQuery.isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  if (!children.length) {
    return (
      <p className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
        Add a child profile before viewing monthly reports.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Child</span>
          <select
            className="h-10 min-w-[180px] rounded-md border border-slate-200 bg-white px-3 text-sm"
            value={selectedChildId}
            onChange={(e) => setChildId(e.target.value)}
          >
            {children.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Month</span>
          <input
            type="month"
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>
        {payload?.report && (
          <Button onClick={onDownload} disabled={downloading}>
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </Button>
        )}
      </div>

      {downloadError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {downloadError}
        </p>
      )}

      {reportQuery.isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      ) : reportQuery.isError || !payload ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load this report.
        </p>
      ) : payload.premiumRequired ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-6">
          <h2 className="text-lg font-semibold text-amber-950">Premium feature</h2>
          <p className="mt-2 text-sm text-amber-900">
            {payload.upgradeHint || "Monthly progress reports are available on Premium accounts."}
          </p>
        </div>
      ) : !payload.report ? (
        <p className="text-sm text-slate-500">No report data.</p>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat
              label="Sessions"
              value={String(payload.report.totalSessions)}
              hint={
                payload.report.previousMonth.sessionsDelta >= 0
                  ? `+${payload.report.previousMonth.sessionsDelta} vs prior month`
                  : `${payload.report.previousMonth.sessionsDelta} vs prior month`
              }
            />
            <Stat label="Total time" value={formatDuration(payload.report.totalTimeSecs)} />
            <Stat label="Most improved" value={payload.report.mostImprovedArea ?? "—"} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-slate-900">Skill area breakdown</h2>
            <div className="mt-3 h-56">
              {chartData.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-500">
                  No skill-tagged play this month.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 24 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                    <YAxis type="category" dataKey="skill" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="percent" name="%" fill="#0f766e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Top 3 games</h2>
            {payload.report.topGames.length === 0 ? (
              <p className="text-sm text-slate-500">No games this month.</p>
            ) : (
              <ol className="space-y-2 text-sm">
                {payload.report.topGames.map((g, i) => (
                  <li key={g.id} className="flex justify-between gap-3">
                    <span>
                      {i + 1}. {g.title}
                    </span>
                    <span className="text-slate-500">{g.plays} plays</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
            <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">
              Encouragement
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate-800">
              {payload.report.encouragement}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="mt-1 text-xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
