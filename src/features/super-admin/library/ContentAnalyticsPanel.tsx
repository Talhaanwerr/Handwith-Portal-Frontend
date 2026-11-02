"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminContentItem } from "@/lib/admin-library-api";

const AGE_LABELS: Record<string, string> = {
  AGE_2_4: "2–4",
  AGE_5_7: "5–7",
  AGE_8_10: "8–10",
  AGE_11_PLUS: "11+",
  UNKNOWN: "Unknown",
};

function formatDuration(secs: number | null | undefined): string {
  if (secs == null) return "—";
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export function ContentAnalyticsPanel({
  stats,
}: {
  stats: NonNullable<AdminContentItem["stats"]>;
}) {
  const plays = (stats.playsOverTime ?? []).map((p) => ({
    date: p.date.slice(5),
    plays: p.count,
  }));
  const ages = (stats.ageBreakdown ?? []).map((a) => ({
    bucket: AGE_LABELS[a.bucket] ?? a.bucket,
    count: a.count,
  }));

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">Content analytics</h2>
        <p className="text-xs text-slate-500">Last 90 days of completed sessions</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Avg duration" value={formatDuration(stats.avgDurationSecs)} />
        <MiniStat label="Therapy assignments" value={String(stats.therapyAssignmentCount ?? 0)} />
        <MiniStat label="Session count" value={String(stats.sessionCount)} />
        <MiniStat label="Unique children" value={String(stats.uniqueChildren)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium text-slate-600">Plays over time</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={plays}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="plays"
                  stroke="#0f766e"
                  fill="#99f6e4"
                  fillOpacity={0.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-slate-600">Age breakdown</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ages}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="bucket" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <p className="text-[11px] font-medium tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
