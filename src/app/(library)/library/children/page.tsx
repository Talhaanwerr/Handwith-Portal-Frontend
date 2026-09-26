"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { INTEREST_OPTIONS, libraryApi, type ChildProfile } from "@/features/library/api";
import { ApiError } from "@/lib/api-error";
import { ROUTES } from "@/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CHILDREN_QUERY_KEY = ["library", "children"] as const;

export default function LibraryChildrenPage() {
  const qc = useQueryClient();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ChildProfile | null>(null);
  const [editName, setEditName] = useState("");
  const [editDob, setEditDob] = useState("");
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [editActive, setEditActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: CHILDREN_QUERY_KEY,
    queryFn: () => libraryApi.listChildren(),
  });

  const children = data?.data ?? [];
  const loadError =
    actionError ??
    (isError
      ? error instanceof ApiError
        ? error.message
        : "Could not load child profiles."
      : null);

  function openEdit(child: ChildProfile) {
    setEditing(child);
    setEditName(child.name);
    setEditDob(child.dateOfBirth ? child.dateOfBirth.slice(0, 10) : "");
    setEditInterests(
      Array.isArray(child.primaryInterests) ? (child.primaryInterests as string[]) : []
    );
    setEditActive(child.isActive);
    setActionError(null);
  }

  function toggleInterest(label: string) {
    setEditInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  }

  async function handleSaveEdit() {
    if (!editing) return;
    setIsSaving(true);
    setActionError(null);
    try {
      await libraryApi.updateChild(editing.id, {
        name: editName.trim(),
        dateOfBirth: editDob || undefined,
        primaryInterests: editInterests,
        isActive: editActive,
      });
      setEditing(null);
      await qc.invalidateQueries({ queryKey: CHILDREN_QUERY_KEY });
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not update profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemove(id: string) {
    setRemovingId(id);
    setActionError(null);
    try {
      await libraryApi.deleteChild(id);
      await qc.invalidateQueries({ queryKey: CHILDREN_QUERY_KEY });
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Could not remove profile.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-stone-900">Child profiles</h1>
          <p className="mt-1 text-sm text-stone-600">
            Free accounts can add 1 child. Premium accounts can add up to 5. Soft-remove keeps
            history.
          </p>
        </div>
        <Link href={ROUTES.LIBRARY_SETUP_CHILD}>
          <Button>Add child</Button>
        </Link>
      </div>

      {loadError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {loadError}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-stone-600" />
        </div>
      ) : children.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-10 text-center">
          <p className="text-sm text-stone-600">No child profiles yet.</p>
          <Link
            href={ROUTES.LIBRARY_SETUP_CHILD}
            className="mt-3 inline-block text-sm font-medium text-stone-900 underline"
          >
            Create the first one
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {children.map((child) => {
            const therapyLinked = Boolean(child.therapyChildId);
            return (
              <li
                key={child.id}
                className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-stone-900">{child.name}</p>
                    {!child.isActive && (
                      <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-stone-500 uppercase">
                        Inactive
                      </span>
                    )}
                    {therapyLinked && (
                      <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-sky-700 uppercase">
                        Therapy-linked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">
                    {child.dateOfBirth
                      ? `Born ${new Date(child.dateOfBirth).toLocaleDateString()}`
                      : "No date of birth"}
                    {Array.isArray(child.primaryInterests) && child.primaryInterests.length > 0
                      ? ` · ${(child.primaryInterests as string[]).join(", ")}`
                      : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(child)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={removingId === child.id}
                    onClick={() => handleRemove(child.id)}
                  >
                    {removingId === child.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Remove"
                    )}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href={ROUTES.LIBRARY_DASHBOARD} className="text-stone-500 hover:text-stone-800">
          ← Back to dashboard
        </Link>
        <Link href={ROUTES.LIBRARY_HISTORY} className="text-stone-500 hover:text-stone-800">
          Play history
        </Link>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit child profile</DialogTitle>
            <DialogDescription>
              {editing?.therapyChildId
                ? "Therapy-linked profiles can still update library fields. Therapy-sourced identity stays linked."
                : "Update name, birthday, interests, or deactivate without deleting history."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <FormField label="Child name" required>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </FormField>
            <FormField label="Date of birth">
              <Input type="date" value={editDob} onChange={(e) => setEditDob(e.target.value)} />
            </FormField>
            <div className="space-y-2">
              <p className="text-sm font-medium text-stone-700">Interests</p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((label) => {
                  const selected = editInterests.includes(label);
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => toggleInterest(label)}
                      className={cn(
                        "rounded-md border px-2.5 py-1 text-xs transition-colors",
                        selected
                          ? "border-stone-900 bg-stone-900 text-white"
                          : "border-stone-200 bg-white text-stone-700"
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-700">
              <input
                type="checkbox"
                checked={editActive}
                onChange={(e) => setEditActive(e.target.checked)}
              />
              Active (unchecked = soft deactivate, history kept)
            </label>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSaving || !editName.trim()}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
