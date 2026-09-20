"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { libraryAuthApi } from "@/features/library/auth-api";
import { ApiError } from "@/lib/api-error";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react";

type Status = "pending" | "verifying" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const pending = searchParams.get("pending") === "1";

  const [status, setStatus] = useState<Status>(token ? "verifying" : pending ? "pending" : "error");
  const [errorMessage, setErrorMessage] = useState("Invalid or expired verification link.");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    libraryAuthApi
      .verifyEmail(token)
      .then(async () => {
        // Restore in-memory access token from the httpOnly refresh cookie if present.
        try {
          const refresh = await libraryAuthApi.refresh();
          if (refresh.data?.accessToken) {
            const { libraryTokenManager } = await import("@/lib/library-token");
            libraryTokenManager.setAccessToken(refresh.data.accessToken);
          }
        } catch {
          // Cookie may be missing (opened email on another device) — user can log in.
        }
        setStatus("success");
      })
      .catch((err) => {
        setErrorMessage(
          err instanceof ApiError ? err.message : "Verification failed. Please try again."
        );
        setStatus("error");
      });
  }, [token]);

  async function handleResend() {
    setIsResending(true);
    setResendMessage(null);
    try {
      await libraryAuthApi.resendVerification();
      setResendMessage("Verification email sent. Check your inbox.");
    } catch (err) {
      setResendMessage(
        err instanceof ApiError ? err.message : "Could not resend. Please sign in and try again."
      );
    } finally {
      setIsResending(false);
    }
  }

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-stone-700" />
        <p className="text-sm text-stone-500">Verifying your email…</p>
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
          <Mail className="h-6 w-6 text-amber-700" />
        </div>
        <h2 className="text-lg font-semibold text-stone-900">Check your email</h2>
        <p className="text-sm text-stone-500">
          We sent a verification link. Open it to activate your library account, then add a child
          profile.
        </p>
        {resendMessage && <p className="text-sm text-stone-600">{resendMessage}</p>}
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
        <Link href={ROUTES.LIBRARY_LOGIN} className="text-sm text-stone-500 hover:text-stone-800">
          Already verified? Log in
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
          <CheckCircle2 className="h-6 w-6 text-green-600" />
        </div>
        <h2 className="text-lg font-semibold text-stone-900">Email verified!</h2>
        <p className="text-sm text-stone-500">Next, add a child profile so you can track play.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link href={ROUTES.LIBRARY_SETUP_CHILD}>
            <Button className="mt-2">Set up child profile</Button>
          </Link>
          <Link href={ROUTES.LIBRARY_LOGIN}>
            <Button variant="outline" className="mt-2">
              Sign in
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
        <AlertCircle className="h-6 w-6 text-red-600" />
      </div>
      <h2 className="text-lg font-semibold text-stone-900">Verification failed</h2>
      <p className="text-sm text-stone-500">{errorMessage}</p>
      <Link href={ROUTES.LIBRARY_LOGIN}>
        <Button variant="outline">Back to log in</Button>
      </Link>
    </div>
  );
}

export default function LibraryVerifyEmailPage() {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8">
      <Suspense
        fallback={
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-stone-700" />
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
