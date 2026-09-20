"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { libraryRegisterSchema, type LibraryRegisterInput } from "@/schemas/auth";
import { useLibraryAuthStore } from "@/features/library/auth-store";
import { ApiError } from "@/lib/api-error";
import { ROUTES } from "@/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Loader2 } from "lucide-react";

export default function LibraryRegisterPage() {
  const { register: registerAccount, isLoading } = useLibraryAuthStore();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LibraryRegisterInput>({
    resolver: zodResolver(libraryRegisterSchema),
  });

  async function onSubmit(data: LibraryRegisterInput) {
    try {
      await registerAccount({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
      setError("root", { message });
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-2xl border border-stone-200 bg-white p-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-2xl text-stone-900">Create library account</h1>
        <p className="text-sm text-stone-600">
          Free for parents. Verify your email, then add a child profile to start.
        </p>
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

        <div className="grid grid-cols-2 gap-3">
          <FormField label="First name" error={errors.firstName?.message} required>
            <Input
              autoComplete="given-name"
              aria-invalid={!!errors.firstName}
              {...register("firstName")}
            />
          </FormField>
          <FormField label="Last name" error={errors.lastName?.message} required>
            <Input
              autoComplete="family-name"
              aria-invalid={!!errors.lastName}
              {...register("lastName")}
            />
          </FormField>
        </div>

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
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </FormField>

        <FormField label="Confirm password" error={errors.confirmPassword?.message} required>
          <Input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
        </FormField>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      <div className="flex flex-col gap-2 text-center text-sm">
        <Link href={ROUTES.LIBRARY_LOGIN} className="text-stone-600 hover:text-stone-900">
          Already have an account? Log in
        </Link>
        <Link href={ROUTES.LIBRARY} className="text-stone-500 hover:text-stone-800">
          ← Back to library
        </Link>
      </div>
    </div>
  );
}
