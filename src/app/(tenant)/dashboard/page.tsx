import type { Metadata } from "next";
import { Users, ShieldCheck, Activity, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

export const metadata: Metadata = { title: "Dashboard" };

const STATS = [
  { label: "Total Users", value: "—", icon: Users },
  { label: "Active Roles", value: "—", icon: ShieldCheck },
  { label: "Recent Activities", value: "—", icon: Activity },
  { label: "Reports", value: "—", icon: BarChart3 },
];

export default function TenantDashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="Welcome to your workspace" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
        ))}
      </div>

      {/* Quick links */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Quick Access</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Manage Users", href: "/users" },
            { label: "Roles & Perms", href: "/roles" },
            { label: "Activity Logs", href: "/activity-logs" },
            { label: "Settings", href: "/settings" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="hover:text-primary flex items-center justify-center rounded-lg border border-slate-200 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
