"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
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
import { Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { LIBRARY_ANALYTICS_QUERY_KEY } from "@/constants/query-keys";
import { adminLibraryApi } from "@/lib/admin-library-api";

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-4">
      <p className="text-xs font-medium tracking-wide text-slate-500 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

function cumulativeGrowth(points: { date: string; count: number }[]) {
  let running = 0;
  return points.map((p) => {
    running += p.count;
    return { date: p.date.slice(5), newUsers: p.count, cumulative: running };
  });
}

export function LibraryAnalyticsDashboard() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [LIBRARY_ANALYTICS_QUERY_KEY],
    queryFn: () => adminLibraryApi.getAnalytics(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-7 w-7 animate-spin text-slate-500" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return <ErrorState title="Could not load analytics" onRetry={() => refetch()} />;
  }

  const a = data.data;
  const growth = cumulativeGrowth(a.charts.userGrowth);
  const sessions = a.charts.sessionsLast30Days.map((p) => ({
    date: p.date.slice(5),
    sessions: p.count,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library analytics"
        description="Platform-wide Content Library usage"
        action={
          <Link href="/super-admin/library" className="text-sm text-slate-500 hover:text-slate-800">
            ← Content library
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total parents" value={String(a.users.total)} />
        <StatCard label="Free / Premium" value={`${a.users.free} / ${a.users.premium}`} />
        <StatCard
          label="Active this week"
          value={String(a.users.activeThisWeek)}
          hint={`${a.users.activeThisMonth} this month`}
        />
        <StatCard
          label="Sessions / hours"
          value={`${a.sessions.total} / ${a.sessions.totalHours}h`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">User growth (90 days)</h2>
          <p className="mb-3 text-xs text-slate-500">New registrations per day + cumulative</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="cumulative"
                  name="Cumulative users"
                  stroke="#0f766e"
                  fill="#99f6e4"
                  fillOpacity={0.45}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Sessions (30 days)</h2>
          <p className="mb-3 text-xs text-slate-500">Completed play sessions per day</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="sessions" name="Sessions" fill="#334155" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Top 10 most played</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Title</th>
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Tier</th>
                <th className="px-4 py-2 font-medium">Plays</th>
              </tr>
            </thead>
            <tbody>
              {a.topContent.map((item, i) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-4 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/super-admin/library/${item.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-slate-600">{item.type}</td>
                  <td className="px-4 py-2 text-slate-600">{item.tier}</td>
                  <td className="px-4 py-2 font-medium">{item.playCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
