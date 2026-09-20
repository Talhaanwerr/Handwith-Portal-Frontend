"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { AuditLogItem } from "@/types/audit-logs";

interface AuditLogDetailDialogProps {
  log: AuditLogItem | null;
  open: boolean;
  onClose: () => void;
}

function JsonBlock({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined) {
    return (
      <div>
        <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</p>
        <p className="mt-1 text-sm text-slate-400">—</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">{label}</p>
      <pre className="mt-1 max-h-48 overflow-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export function AuditLogDetailDialog({ log, open, onClose }: AuditLogDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Log details</DialogTitle>
          <DialogDescription>
            {log ? (
              <code className="text-xs">
                {log.module}:{log.action}
              </code>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {log && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Actor</p>
                <p className="mt-1 font-medium text-slate-900">
                  {log.actorName ?? log.actorEmail ?? "System"}
                </p>
                {log.actorEmail && <p className="text-xs text-slate-400">{log.actorEmail}</p>}
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Tenant</p>
                <p className="mt-1 font-medium text-slate-900">
                  {log.tenant?.name ??
                    (typeof log.newValue === "object" &&
                    log.newValue &&
                    "tenantName" in log.newValue
                      ? String((log.newValue as { tenantName?: string }).tenantName ?? "—")
                      : "—")}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Entity</p>
                <p className="mt-1 font-mono text-xs text-slate-700">{log.entityId ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">IP</p>
                <p className="mt-1 text-slate-700">{log.ipAddress ?? "—"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-medium tracking-wide text-slate-400 uppercase">Time</p>
                <p className="mt-1 text-slate-700">{new Date(log.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <JsonBlock label="New value" value={log.newValue} />
            <JsonBlock label="Old value" value={log.oldValue} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
