"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { useLibraryAuthStore } from "@/features/library/auth-store";
import { ApiError } from "@/lib/api-error";
import { ROUTES } from "@/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Loader2 } from "lucide-react";

function LibraryLoginForm() {
  const { login, isLoading } = useLibraryAuthStore();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginInput) {
    try {
      await login(data.email, data.password, redirect ?? undefined);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError("root", { message });
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-stone-200 bg-white p-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-2xl text-stone-900">Library log in</h1>
        <p className="text-sm text-stone-600">Sign in to manage children and track play history.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {errors.root.message}
          </div>
        )}

        <FormField label="Email" error={errors.email?.message} required>
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FormField>

        <FormField label="Password" error={errors.password?.message} required>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="flex flex-col gap-2 text-center text-sm">
        <Link href={ROUTES.LIBRARY_REGISTER} className="text-stone-600 hover:text-stone-900">
          Need an account? Sign up
        </Link>
        <Link href={ROUTES.LIBRARY} className="text-stone-500 hover:text-stone-800">
          ← Back to library
        </Link>
      </div>
    </div>
  );
}

export default function LibraryLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">
          Loading…
        </div>
      }
    >
      <LibraryLoginForm />
    </Suspense>
  );
}
