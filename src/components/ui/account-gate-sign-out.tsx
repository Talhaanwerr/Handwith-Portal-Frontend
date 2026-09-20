"use client";

import { clearSessionCookie } from "@/lib/session-cookie";
import { tokenManager } from "@/lib/token";
import { ROUTES } from "@/constants";

/** Clears local session hint and sends the user to login. */
export function AccountGateSignOut() {
  function handleSignOut() {
    tokenManager.clearAll();
    clearSessionCookie();
    window.location.href = ROUTES.LOGIN;
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="rounded-lg border border-slate-300 bg-white px-6 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      Sign out
    </button>
  );
}
