"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { libraryApi, INTEREST_OPTIONS } from "@/features/library/api";
import { ApiError } from "@/lib/api-error";
import { ROUTES } from "@/constants";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LibrarySetupChildPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canContinueStep1 = useMemo(() => name.trim().length >= 1, [name]);

  function toggleInterest(label: string) {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  }

  async function handleFinish() {
    setIsSaving(true);
    setError(null);
    try {
      await libraryApi.createChild({
        name: name.trim(),
        dateOfBirth: dateOfBirth || undefined,
        primaryInterests: interests,
      });
      router.push(ROUTES.LIBRARY_DASHBOARD);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save child profile.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-2xl border border-stone-200 bg-white p-8">
      <div className="space-y-1 text-center">
        <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">
          Step {step} of 3
        </p>
        <h1 className="font-serif text-2xl text-stone-900">Set up a child profile</h1>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-stone-600">Child name and date of birth.</p>
          <FormField label="Child name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
          </FormField>
          <FormField label="Date of birth">
            <Input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </FormField>
          <Button className="w-full" disabled={!canContinueStep1} onClick={() => setStep(2)}>
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-stone-600">Pick the areas that matter most (optional).</p>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((label) => {
              const selected = interests.includes(label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleInterest(label)}
                  className={cn(
                    "rounded-md border px-3 py-1.5 text-sm transition-colors",
                    selected
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 bg-white text-stone-700 hover:border-stone-400"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button className="flex-1" onClick={() => setStep(3)}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 text-center">
          <p className="text-sm text-stone-600">
            Ready to save <span className="font-medium text-stone-900">{name.trim()}</span>
            {interests.length > 0 ? ` · ${interests.join(", ")}` : ""}.
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setStep(2)}
              disabled={isSaving}
            >
              Back
            </Button>
            <Button className="flex-1" onClick={handleFinish} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : (
                "Finish"
              )}
            </Button>
          </div>
          <Link
            href={ROUTES.LIBRARY_DASHBOARD}
            className="block text-sm text-stone-500 hover:text-stone-800"
          >
            Skip for now
          </Link>
        </div>
      )}
    </div>
  );
}
