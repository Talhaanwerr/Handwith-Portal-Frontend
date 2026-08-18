"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { authApi } from "@/lib/auth";
import { ApiError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type Status = "verifying" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<Status>(token ? "verifying" : "error");
  const [errorMessage, setErrorMessage] = useState("Invalid or expired verification link.");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setErrorMessage(
          err instanceof ApiError ? err.message : "Verification failed. Please try again."
        );
        setStatus("error");
      });
  }, [token]);

  async function handleResend() {
    setIsResending(true);
    // TODO: wire up resend-verification endpoint when available
    await new Promise((r) => setTimeout(r, 1000));
    setIsResending(false);
  }

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <p className="text-sm text-slate-500">Verifying your email…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Email verified!</h2>
        <p className="text-sm text-slate-500">Your email has been successfully verified.</p>
        <Link href="/login">
          <Button className="mt-2">Continue to sign in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h2 className="text-lg font-semibold text-slate-900">Verification failed</h2>
      <p className="text-sm text-slate-500">{errorMessage}</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" disabled={isResending} onClick={handleResend}>
          {isResending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Resend verification email"
          )}
        </Button>
        <Link href="/login">
          <Button variant="ghost">Back to sign in</Button>
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center gap-4 py-6 text-center">
          <Loader2 className="text-primary h-8 w-8 animate-spin" />
          <p className="text-sm text-slate-500">Loading…</p>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
