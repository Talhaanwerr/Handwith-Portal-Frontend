"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { AccountGateSignOut } from "@/components/ui/account-gate-sign-out";
import { authApi } from "@/lib/auth";
import { tokenManager } from "@/lib/token";
import { setSessionCookie } from "@/lib/session-cookie";
import { ROUTES } from "@/constants";
import type { TenantStatus, UserRole } from "@/types";

export function AccountPendingActions() {
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");

  async function checkAgain() {
    setChecking(true);
    setMessage("");
    try {
      const refresh = await authApi.refresh();
      if (refresh.data?.accessToken) {
        tokenManager.setAccessToken(refresh.data.accessToken);
      }
      const me = await authApi.me();
      const data = me.data;
      if (!data) throw new Error("Could not load account");

      const role: UserRole = data.isSuperAdmin ? "SUPER_ADMIN" : "TENANT_USER";
      if (data.tenantStatus) {
        setSessionCookie({ role, tenantStatus: data.tenantStatus as TenantStatus });
      } else {
        setSessionCookie({ role });
      }

      if (data.tenantStatus === "ACTIVE" || data.tenantStatus === "TRIAL") {
        window.location.href = ROUTES.TENANT_DASHBOARD;
        return;
      }

      setMessage("Still pending. Ask Super Admin to Activate your tenant, then try again.");
    } catch {
      setMessage("Could not refresh status. Sign out and try logging in again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="mt-8 flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={checkAgain}
        disabled={checking}
        className="bg-primary hover:bg-primary/90 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition disabled:opacity-50"
      >
        {checking ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Checking…
          </span>
        ) : (
          "Check again"
        )}
      </button>
      <AccountGateSignOut />
      {message && <p className="max-w-sm text-sm text-slate-500">{message}</p>}
    </div>
  );
}
