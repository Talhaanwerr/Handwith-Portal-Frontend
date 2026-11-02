"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X } from "lucide-react";
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
import { PermissionGuard } from "@/components/ui/permission-guard";
import { PERMISSIONS } from "@/constants/permissions";
import { THERAPY_CHILDREN_QUERY_KEY, THERAPY_HOMEWORK_QUERY_KEY } from "@/constants/query-keys";
import { therapyApi } from "@/lib/therapy-api";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { ContentPicker } from "./ContentPicker";
import type { LibraryContentItem } from "@/features/library/api";

export function HomeworkPanel() {
  const qc = useQueryClient();
  const [childFilter, setChildFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const childrenQuery = useQuery({
    queryKey: [THERAPY_CHILDREN_QUERY_KEY, "all-active"],
    queryFn: () => therapyApi.listChildren({ page: 1, limit: 100, activeOnly: true }),
  });

  const { data, isLoading } = useQuery({
    queryKey: [THERAPY_HOMEWORK_QUERY_KEY, childFilter],
    queryFn: () =>
      therapyApi.listHomework({
        page: 1,
        limit: 50,
        therapyChildId: childFilter || undefined,
      }),
  });

  const items = data?.data?.items ?? [];
  const children = childrenQuery.data?.data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
          value={childFilter}
          onChange={(e) => setChildFilter(e.target.value)}
        >
          <option value="">All children</option>
          {children.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <PermissionGuard permission={PERMISSIONS.THERAPY.CREATE}>
          <Button onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Assign homework
          </Button>
        </PermissionGuard>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
          No homework assignments yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((hw) => (
            <li
              key={hw.id}
              className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">
                    {hw.title || hw.content?.title || "Homework"} — {hw.therapyChild.name}
                  </p>
                  <p className="mt-1 text-slate-600">{hw.instructions}</p>
                  {hw.content && (
                    <p className="mt-1 text-xs text-slate-500">
                      Attached: {hw.content.title} ({hw.content.type})
                    </p>
                  )}
                  {hw.gameCompletedLabel && (
                    <p className="mt-2 text-sm font-medium text-emerald-700">
                      {hw.gameCompletedLabel}
                    </p>
                  )}
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {hw.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Due {hw.dueDate ? new Date(hw.dueDate).toLocaleDateString() : "—"} · Assigned by{" "}
                {hw.assignedBy.firstName} {hw.assignedBy.lastName}
              </p>
            </li>
          ))}
        </ul>
      )}

      <AssignHomeworkModal
        open={modalOpen}
        childrenOptions={children}
        onClose={() => {
          setModalOpen(false);
          qc.invalidateQueries({ queryKey: [THERAPY_HOMEWORK_QUERY_KEY] });
        }}
      />
    </div>
  );
}

function AssignHomeworkModal({
  open,
  childrenOptions,
  onClose,
}: {
  open: boolean;
  childrenOptions: { id: string; name: string }[];
  onClose: () => void;
}) {
  const [therapyChildId, setTherapyChildId] = useState("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [attached, setAttached] = useState<LibraryContentItem | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useApiMutation(therapyApi.createHomework, {
    onSuccess: () => {
      setTherapyChildId("");
      setTitle("");
      setInstructions("");
      setDueDate("");
      setAttached(null);
      setError(null);
      onClose();
    },
    onError: (err) => setError(err.message),
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    await create.mutateAsync({
      therapyChildId,
      title: title.trim() || undefined,
      instructions: instructions.trim(),
      dueDate: dueDate || undefined,
      contentItemId: attached?.id,
    });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign homework</DialogTitle>
            <DialogDescription>
              Optionally attach a Content Library game. When the parent finishes playing, homework
              auto-marks completed with the score.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}
            <FormField label="Child" htmlFor="hw-child" required>
              <select
                id="hw-child"
                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
                value={therapyChildId}
                onChange={(e) => setTherapyChildId(e.target.value)}
                required
              >
                <option value="">Select child…</option>
                {childrenOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Title" htmlFor="hw-title">
              <Input
                id="hw-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Optional short title"
              />
            </FormField>
            <FormField label="Instructions" htmlFor="hw-instructions" required>
              <textarea
                id="hw-instructions"
                className="min-h-[90px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Due date" htmlFor="hw-due">
              <Input
                id="hw-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </FormField>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">Library content</p>
              {attached ? (
                <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
                  <span>
                    {attached.title} <span className="text-slate-400">({attached.type})</span>
                  </span>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setAttached(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button type="button" variant="outline" onClick={() => setPickerOpen(true)}>
                  Attach from library
                </Button>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={create.isPending || !therapyChildId || !instructions.trim()}
              >
                {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Assign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ContentPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={setAttached}
      />
    </>
  );
}
