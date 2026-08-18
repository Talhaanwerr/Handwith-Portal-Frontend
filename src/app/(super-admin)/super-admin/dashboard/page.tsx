import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Users,
  DollarSign,
  AlertTriangle,
  Activity,
  TrendingUp,
  Clock,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";

export const metadata: Metadata = { title: "Dashboard" };

// Placeholder stats — replace with real API data in Prompt 9 (Users CRUD)
const STATS = [
  {
    label: "Total Tenants",
    value: "—",
    icon: Building2,
    iconClass: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Active Tenants",
    value: "—",
    icon: Activity,
    iconClass: "bg-green-50",
    iconColor: "text-green-600",
  },
  {
    label: "Trial Tenants",
    value: "—",
    icon: Clock,
    iconClass: "bg-yellow-50",
    iconColor: "text-yellow-600",
  },
  {
    label: "Suspended",
    value: "—",
    icon: AlertTriangle,
    iconClass: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    label: "Total Users",
    value: "—",
    icon: Users,
    iconClass: "bg-purple-50",
    iconColor: "text-purple-600",
  },
  {
    label: "Monthly Revenue",
    value: "—",
    icon: DollarSign,
    iconClass: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
  {
    label: "Failed Payments",
    value: "—",
    icon: XCircle,
    iconClass: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    label: "New This Month",
    value: "—",
    icon: TrendingUp,
    iconClass: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
];

const RECENT_LOGS = [
  { action: "Tenant created", subject: "Acme Corp", time: "2 min ago", status: "active" },
  { action: "User suspended", subject: "john@doe.com", time: "15 min ago", status: "suspended" },
  { action: "Plan upgraded", subject: "Globex Inc", time: "1 hr ago", status: "active" },
  { action: "Tenant cancelled", subject: "Initech", time: "3 hrs ago", status: "cancelled" },
  { action: "Payment failed", subject: "Umbrella Co", time: "5 hrs ago", status: "error" },
];

export default function SuperAdminDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Platform-wide overview and management"
        action={
          <Link
            href="/super-admin/tenants/create"
            className="bg-primary hover:bg-primary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition"
          >
            + New Tenant
          </Link>
        }
      />

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            iconClassName={`${s.iconClass} [&>svg]:${s.iconColor}`}
          />
        ))}
      </div>

      {/* Recent activity */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Recent Audit Logs</h2>
          <Link href="/super-admin/audit-logs" className="text-primary text-xs hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {RECENT_LOGS.map((log, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{log.action}</p>
                <p className="truncate text-xs text-slate-400">{log.subject}</p>
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-3">
                <StatusBadge status={log.status} />
                <span className="text-xs text-slate-400">{log.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
