import type { Metadata } from "next";
import { AccountGateSignOut } from "@/components/ui/account-gate-sign-out";

export const metadata: Metadata = {
  title: "Account Suspended",
};

export default function AccountSuspendedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
        <span className="text-4xl">⚠️</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Account Suspended</h1>
      <p className="mt-3 max-w-md text-sm text-slate-500">
        Your account has been suspended. This may be due to a billing issue or a violation of our
        terms of service. Please contact support to resolve this.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <a
          href="mailto:support@example.com"
          className="bg-primary hover:bg-primary/90 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition"
        >
          Contact Support
        </a>
        <AccountGateSignOut />
      </div>
    </div>
  );
}
