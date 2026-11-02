"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Pencil } from "lucide-react";
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
import { THERAPY_CHILDREN_QUERY_KEY, USERS_QUERY_KEY } from "@/constants/query-keys";
import { therapyApi, type TherapyChild } from "@/lib/therapy-api";
import { usersApi } from "@/lib/users-api";
import { useApiMutation } from "@/hooks/use-api-mutation";

export function TherapyChildrenPanel() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TherapyChild | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: [THERAPY_CHILDREN_QUERY_KEY, search],
    queryFn: () => therapyApi.listChildren({ page: 1, limit: 50, search: search || undefined }),
  });

  const items = data?.data?.items ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="max-w-xs"
          placeholder="Search children…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <PermissionGuard permission={PERMISSIONS.THERAPY.CREATE}>
          <Button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add child
          </Button>
        </PermissionGuard>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      ) : items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 py-12 text-center text-sm text-slate-500">
          No therapy children yet.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Parent</th>
                <th className="px-4 py-3 font-medium">Homework</th>
                <th className="px-4 py-3 font-medium">Library link</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {items.map((child) => (
                <tr key={child.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{child.name}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {child.parent ? `${child.parent.firstName} ${child.parent.lastName}` : "—"}
                  </td>
                  <td className="px-4 py-3">{child.counts?.homework ?? 0}</td>
                  <td className="px-4 py-3">
                    {(child.counts?.linkedLibraryProfiles ?? 0) > 0 ? (
                      <span className="text-emerald-700">Linked</span>
                    ) : (
                      <span className="text-slate-400">Not linked</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{child.isActive ? "Active" : "Inactive"}</td>
                  <td className="px-4 py-3 text-right">
                    <PermissionGuard permission={PERMISSIONS.THERAPY.UPDATE}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditing(child);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </PermissionGuard>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen ? (
        <TherapyChildModal
          key={editing?.id ?? "create"}
          open={modalOpen}
          child={editing}
          onClose={() => {
            setModalOpen(false);
            setEditing(null);
            qc.invalidateQueries({ queryKey: [THERAPY_CHILDREN_QUERY_KEY] });
          }}
        />
      ) : null}
    </div>
  );
}

function TherapyChildModal({
  open,
  child,
  onClose,
}: {
  open: boolean;
  child: TherapyChild | null;
  onClose: () => void;
}) {
  const isEdit = !!child;
  const [name, setName] = useState(child?.name ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(child?.dateOfBirth?.slice(0, 10) ?? "");
  const [parentUserId, setParentUserId] = useState(child?.parentUserId ?? "");
  const [notes, setNotes] = useState(child?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: [USERS_QUERY_KEY, "therapy-parent-pick"],
    queryFn: () => usersApi.list({ page: 1, limit: 100, status: "ACTIVE" }),
    enabled: open,
  });

  const create = useApiMutation(therapyApi.createChild, {
    onSuccess: () => onClose(),
    onError: (err) => setError(err.message),
  });

  const update = useApiMutation(
    (values: {
      name: string;
      dateOfBirth?: string | null;
      parentUserId?: string | null;
      notes?: string | null;
    }) => therapyApi.updateChild(child!.id, values),
    {
      onSuccess: () => onClose(),
      onError: (err) => setError(err.message),
    }
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (isEdit) {
      await update.mutateAsync({
        name: name.trim(),
        dateOfBirth: dateOfBirth || null,
        parentUserId: parentUserId || null,
        notes: notes.trim() || null,
      });
    } else {
      await create.mutateAsync({
        name: name.trim(),
        dateOfBirth: dateOfBirth || undefined,
        parentUserId: parentUserId || undefined,
        notes: notes.trim() || undefined,
      });
    }
  }

  const users = usersQuery.data?.data?.items ?? [];
  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit child" : "Add therapy child"}</DialogTitle>
          <DialogDescription>
            Link a parent user so homework appears in their portal and library SSO can match by
            name.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
          <FormField label="Name" htmlFor="tc-name" required>
            <Input id="tc-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </FormField>
          <FormField label="Date of birth" htmlFor="tc-dob">
            <Input
              id="tc-dob"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </FormField>
          <FormField label="Parent (portal user)" htmlFor="tc-parent">
            <select
              id="tc-parent"
              className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm"
              value={parentUserId}
              onChange={(e) => setParentUserId(e.target.value)}
            >
              <option value="">No parent linked</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.email})
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Notes" htmlFor="tc-notes">
            <textarea
              id="tc-notes"
              className="min-h-[80px] w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending || !name.trim()}>
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
