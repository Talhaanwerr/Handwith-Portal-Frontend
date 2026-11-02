"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { getSafeErrorMessage } from "@/lib/safe-error";
import {
  adminLibraryApi,
  type AdminContentItem,
  type CreateContentPayload,
} from "@/lib/admin-library-api";
import {
  TYPE_LABELS,
  AGE_LABELS,
  DIFFICULTY_LABELS,
  DURATION_LABELS,
} from "@/features/library/labels";
import { LIBRARY_CONTENT_QUERY_KEY } from "@/constants/query-keys";
import { GAMES } from "@/constants/games";
import { cn } from "@/lib/utils";

const THERAPY_OPTIONS = ["ABA", "OT", "SPEECH", "PT", "GENERAL"] as const;
const PLAYLAB_IDS = new Set(GAMES.map((g) => g.id));

type Props = {
  mode: "create" | "edit";
  initial?: AdminContentItem | null;
};

export function ContentItemForm({ mode, initial }: Props) {
  const router = useRouter();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [type, setType] = useState(initial?.type ?? "GAME");
  const [embedUrl, setEmbedUrl] = useState(initial?.embedUrl ?? "");
  const [fileId, setFileId] = useState(initial?.fileId ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? "");
  const [tier, setTier] = useState(initial?.tier ?? "FREE");
  const [ageRange, setAgeRange] = useState(initial?.ageRange ?? "AGE_5_7");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "BEGINNER");
  const [duration, setDuration] = useState(initial?.duration ?? "SHORT");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [therapyRelevance, setTherapyRelevance] = useState<string[]>(
    Array.isArray(initial?.therapyRelevance) ? (initial?.therapyRelevance as string[]) : []
  );
  const [tagIds, setTagIds] = useState<string[]>(initial?.tags?.map((t) => t.id) ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tagsQuery = useQuery({
    queryKey: ["library-admin-tags", "SKILL_AREA"],
    queryFn: () => adminLibraryApi.listTags("SKILL_AREA"),
  });
  const skillTags = tagsQuery.data?.data?.tags ?? [];

  function toggleTherapy(label: string) {
    setTherapyRelevance((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );
  }

  function toggleTag(id: string) {
    setTagIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError(null);
    const payload: CreateContentPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      type,
      embedUrl: embedUrl.trim() || undefined,
      fileId: fileId.trim() || undefined,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      tier,
      ageRange,
      difficulty,
      duration,
      isActive,
      isFeatured,
      therapyRelevance,
      tagIds,
    };
    try {
      if (mode === "create") {
        const res = await adminLibraryApi.createContent(payload);
        await qc.invalidateQueries({ queryKey: [LIBRARY_CONTENT_QUERY_KEY] });
        toast({ title: "Content created", variant: "success" });
        router.push(`/super-admin/library/${res.data?.id}`);
      } else if (initial) {
        const { tagIds: nextTags, ...rest } = payload;
        await adminLibraryApi.updateContent(initial.id, rest);
        await adminLibraryApi.setTags(initial.id, nextTags ?? []);
        await qc.invalidateQueries({ queryKey: [LIBRARY_CONTENT_QUERY_KEY] });
        toast({ title: "Content updated", variant: "success" });
        router.refresh();
      }
    } catch (err) {
      setError(getSafeErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="max-w-3xl space-y-5 rounded-xl border border-slate-200 bg-white p-6"
    >
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Title" required className="sm:col-span-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField label="Content type" required>
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {Object.entries(TYPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Tier">
          <Select value={tier} onChange={(e) => setTier(e.target.value as "FREE" | "PREMIUM")}>
            <option value="FREE">Free</option>
            <option value="PREMIUM">Premium</option>
          </Select>
        </FormField>
        <FormField label="Description" className="sm:col-span-2">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
          />
        </FormField>
        {type === "GAME" && (
          <FormField
            label="PlayLab game"
            className="sm:col-span-2"
            description="Pick a built-in game. This fills File / package key so library Play works."
          >
            <Select
              value={PLAYLAB_IDS.has(fileId) ? fileId : ""}
              onChange={(e) => {
                const id = e.target.value;
                setFileId(id);
                if (id) {
                  const game = GAMES.find((g) => g.id === id);
                  if (game && !title.trim()) setTitle(game.title);
                  if (game && !description.trim()) setDescription(game.description);
                  setEmbedUrl("");
                }
              }}
            >
              <option value="">Custom / external (use fields below)</option>
              {GAMES.filter((g) => !g.hidden).map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.id})
                </option>
              ))}
            </Select>
          </FormField>
        )}
        <FormField
          label="Embed / playable URL"
          className="sm:col-span-2"
          description="Videos or external embeds only. Leave empty for PlayLab games."
        >
          <Input
            value={embedUrl}
            onChange={(e) => setEmbedUrl(e.target.value)}
            placeholder="https://example.com/video"
          />
        </FormField>
        <FormField
          label="File / package key"
          description="For PlayLab games this is the game id (e.g. letter-tracing). Set by dropdown above."
        >
          <Input
            value={fileId}
            onChange={(e) => setFileId(e.target.value)}
            placeholder="letter-tracing"
          />
        </FormField>
        <FormField label="Thumbnail URL" description="Optional image URL for browse cards.">
          <Input
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://… or /api/v1/files/…/content"
          />
        </FormField>
        <FormField label="Age range" required>
          <Select value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
            {Object.entries(AGE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Difficulty">
          <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            {Object.entries(DIFFICULTY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Duration">
          <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
            {Object.entries(DURATION_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </FormField>
        <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
          />
          Active (visible in public browse)
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          Featured (show on library home Featured row)
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-800">Skill areas</p>
        <div className="flex flex-wrap gap-2">
          {skillTags.map((tag) => {
            const on = tagIds.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs",
                  on ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white"
                )}
              >
                {tag.label}
              </button>
            );
          })}
          {skillTags.length === 0 && (
            <p className="text-xs text-slate-500">No skill tags seeded yet.</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-800">Therapy relevance</p>
        <div className="flex flex-wrap gap-2">
          {THERAPY_OPTIONS.map((label) => {
            const on = therapyRelevance.includes(label);
            return (
              <button
                key={label}
                type="button"
                onClick={() => toggleTherapy(label)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs",
                  on ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {mode === "edit" && initial?.stats && (
        <div className="grid gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4">
          <Stat label="Plays" value={String(initial.stats.totalPlays)} />
          <Stat label="Unique children" value={String(initial.stats.uniqueChildren)} />
          <Stat
            label="Avg score"
            value={initial.stats.avgScore != null ? String(initial.stats.avgScore) : "—"}
          />
          <Stat
            label="Avg completion"
            value={
              initial.stats.avgCompletionPct != null ? `${initial.stats.avgCompletionPct}%` : "—"
            }
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.push("/super-admin/library")}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create content" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
