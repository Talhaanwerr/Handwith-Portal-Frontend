import type { Metadata } from "next";
import { AccountPendingActions } from "@/components/ui/account-pending-actions";

export const metadata: Metadata = {
  title: "Account Not Active",
};

export default function AccountPendingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-200">
        <span className="text-4xl text-slate-600">⏳</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Your account is not active yet</h1>
      <p className="mt-3 max-w-md text-sm text-slate-500">
        Your workspace is still pending activation. You can sign in, but you cannot use the
        dashboard until a Super Admin activates your tenant.
      </p>
      <AccountPendingActions />
    </div>
  );
}
