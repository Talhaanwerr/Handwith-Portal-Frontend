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

/** One in-flight verify per token — survives Strict Mode remount. */
const verifyPromises = new Map<string, Promise<void>>();

async function clearLocalLibrarySession() {
  const { libraryTokenManager } = await import("@/lib/library-token");
  const { clearLibrarySessionCookie } = await import("@/lib/library-session-cookie");
  libraryTokenManager.clearAll();
  clearLibrarySessionCookie();
  try {
    const { useLibraryAuthStore } = await import("@/features/library/auth-store");
    useLibraryAuthStore.getState().clearSession();
  } catch {
    // Store may be unavailable outside provider; cookie/token clear is enough.
  }
}

function verifyEmailOnce(token: string): Promise<void> {
  const existing = verifyPromises.get(token);
  if (existing) return existing;

  const promise = libraryAuthApi
    .verifyEmail(token)
    .then(async () => {
      // Require a fresh login after verify — no auto session / setup-child shortcut.
      await clearLocalLibrarySession();
    })
    .catch((err) => {
      verifyPromises.delete(token);
      throw err;
    });

  verifyPromises.set(token, promise);
  return promise;
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const pending = searchParams.get("pending") === "1";
  const alreadyVerified = searchParams.get("verified") === "1";

  const [status, setStatus] = useState<Status>(
    alreadyVerified ? "success" : token ? "verifying" : pending ? "pending" : "error"
  );
  const [errorMessage, setErrorMessage] = useState("Invalid or expired verification link.");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!token || alreadyVerified) return;
    let cancelled = false;

    verifyEmailOnce(token)
      .then(() => {
        if (cancelled) return;
        // Full navigation so header drops unverified Log out / Verify chrome.
        window.location.replace(`${ROUTES.LIBRARY_VERIFY_EMAIL}?verified=1`);
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMessage(
          err instanceof ApiError ? err.message : "Verification failed. Please try again."
        );
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [token, alreadyVerified]);

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
          We sent a verification link. Open it to activate your library account, then sign in to add
          a child profile.
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
        <p className="text-sm text-stone-500">
          Sign in to continue, then you can add a child profile and start playing.
        </p>
        <Link href={ROUTES.LIBRARY_LOGIN}>
          <Button className="mt-2">Sign in</Button>
        </Link>
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
