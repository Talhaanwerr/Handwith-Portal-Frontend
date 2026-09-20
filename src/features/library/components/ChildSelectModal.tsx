"use client";

import { Button } from "@/components/ui/button";
import type { ChildProfile } from "../api";

type Props = {
  childrenList: ChildProfile[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isStarting?: boolean;
};

export function ChildSelectModal({
  childrenList,
  selectedId,
  onSelect,
  onConfirm,
  onCancel,
  isStarting,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="child-select-title"
        className="w-full max-w-md space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-1">
          <h2 id="child-select-title" className="text-lg font-semibold text-stone-900">
            Who is playing?
          </h2>
          <p className="text-sm text-stone-500">
            Choose a child profile so we can track this play.
          </p>
        </div>

        <ul className="space-y-2">
          {childrenList.map((child) => {
            const selected = selectedId === child.id;
            return (
              <li key={child.id}>
                <button
                  type="button"
                  onClick={() => onSelect(child.id)}
                  className={
                    selected
                      ? "w-full rounded-lg border border-stone-900 bg-stone-900 px-4 py-3 text-left text-sm font-medium text-white"
                      : "w-full rounded-lg border border-stone-200 bg-white px-4 py-3 text-left text-sm font-medium text-stone-800 hover:border-stone-400"
                  }
                >
                  {child.name}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1" onClick={onCancel} disabled={isStarting}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={onConfirm} disabled={!selectedId || isStarting}>
            {isStarting ? "Starting…" : "Play now"}
          </Button>
        </div>
      </div>
    </div>
  );
}
