"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/schemas/auth";
import { useAuthStore } from "@/store/auth-store";
import { ApiError } from "@/lib/api-error";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Eye, EyeOff, Loader2 } from "lucide-react";

function LoginForm() {
  const { login, isLoading } = useAuthStore();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const [showPassword, setShowPassword] = useState(false);

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
      await login(data, redirect ?? undefined);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError("root", { message });
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold text-slate-900">Welcome back</h2>
        <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
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

        <FormField label="Email" error={errors.email?.message}>
          <Input
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </FormField>

        <FormField
          label={
            <span className="flex items-center justify-between">
              Password
              <Link
                href="/forgot-password"
                className="text-primary text-xs font-normal hover:underline"
              >
                Forgot password?
              </Link>
            </span>
          }
          error={errors.password?.message}
        >
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
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
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-10">
          <Loader2 className="text-primary h-6 w-6 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
