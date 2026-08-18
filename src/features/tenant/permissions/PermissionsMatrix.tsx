"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { rolesApi } from "@/lib/roles-api";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { ROLES_QUERY_KEY, PERMISSIONS_QUERY_KEY } from "@/constants/query-keys";
import type { RoleItem, PermissionItem } from "@/types/roles";

export function PermissionsMatrix() {
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");

  const { data: rolesRes, isLoading: loadingRoles } = useQuery({
    queryKey: [ROLES_QUERY_KEY],
    queryFn: rolesApi.list,
  });

  const { data: permsRes, isLoading: loadingPerms } = useQuery({
    queryKey: [PERMISSIONS_QUERY_KEY],
    queryFn: rolesApi.listPermissions,
    staleTime: Infinity,
  });

  const roles: RoleItem[] = rolesRes?.data ?? [];
  const allPermissions = useMemo(() => permsRes?.data ?? [], [permsRes]);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? null;
  const grantedSlugs = useMemo(
    () => new Set(selectedRole?.permissions.map((p) => p.slug) ?? []),
    [selectedRole]
  );

  // Group permissions by module
  const byModule = useMemo(() => {
    const map = new Map<string, PermissionItem[]>();
    for (const p of allPermissions) {
      const list = map.get(p.module) ?? [];
      list.push(p);
      map.set(p.module, list);
    }
    return map;
  }, [allPermissions]);

  const allActions = useMemo(() => {
    const acts = new Set<string>();
    allPermissions.forEach((p) => acts.add(p.action));
    return [...acts];
  }, [allPermissions]);

  const isLoading = loadingRoles || loadingPerms;

  return (
    <div className="space-y-4">
      {/* Role selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-700">View permissions for:</label>
        <Select
          className="w-52"
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
          disabled={isLoading}
        >
          <option value="">— Select a role —</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
        {selectedRole?.isSystem && (
          <span className="text-xs font-medium text-amber-600">System role (read-only)</span>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : !selectedRoleId ? (
          <EmptyState
            icon={ShieldCheck}
            title="Select a role to view permissions"
            description="Choose a role from the dropdown above to see its permission matrix."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-5 py-3 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Module
                  </th>
                  {allActions.map((a) => (
                    <th
                      key={a}
                      className="px-4 py-3 text-center text-xs font-semibold tracking-wide text-slate-500 uppercase"
                    >
                      {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...byModule.entries()].map(([module, perms]) => (
                  <tr key={module} className="border-b border-slate-100 last:border-0">
                    <td className="px-5 py-3 font-medium text-slate-800 capitalize">
                      {module.replace(/-/g, " ")}
                    </td>
                    {allActions.map((action) => {
                      const slug = `${module}:${action}`;
                      const perm = perms.find((p) => p.slug === slug);
                      if (!perm) {
                        return (
                          <td key={action} className="px-4 py-3 text-center text-slate-200">
                            —
                          </td>
                        );
                      }
                      const granted = grantedSlugs.has(slug);
                      return (
                        <td key={action} className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                              granted
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-400"
                            }`}
                            title={`${slug}: ${granted ? "Granted" : "Denied"}`}
                          >
                            {granted ? "✓" : "✗"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
