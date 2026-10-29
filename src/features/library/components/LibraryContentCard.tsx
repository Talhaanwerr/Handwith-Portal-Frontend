import Link from "next/link";
import { ROUTES } from "@/constants";
import { GAMES } from "@/constants/games";
import { GAME_SCENE_ICONS } from "@shared/components/icons/GameSceneIcons";
import type { LibraryContentItem } from "../api";
import { TYPE_LABELS, labelOrRaw } from "../labels";
import { cn } from "@/lib/utils";

type Props = {
  item: LibraryContentItem;
  className?: string;
};

export function LibraryContentCard({ item, className }: Props) {
  const skillTags = item.tags.filter((t) => t.category === "SKILL_AREA").slice(0, 3);
  const gameMeta =
    item.type === "GAME" && item.fileId ? GAMES.find((g) => g.id === item.fileId) : undefined;
  const SceneIcon =
    item.fileId && GAME_SCENE_ICONS[item.fileId] ? GAME_SCENE_ICONS[item.fileId] : null;

  return (
    <Link
      href={`${ROUTES.LIBRARY_GAME}/${item.id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-stone-200 bg-white transition hover:border-stone-300",
        className
      )}
    >
      <div
        className="relative aspect-[16/10] bg-stone-100"
        style={!item.thumbnailUrl && gameMeta ? { backgroundColor: gameMeta.colors.bg } : undefined}
      >
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
          />
        ) : SceneIcon ? (
          <div className="flex h-full items-center justify-center p-4" aria-hidden>
            <div className="aspect-square h-[78%] max-h-28 w-auto transition-transform duration-300 group-hover:scale-105 [&_svg]:block [&_svg]:h-auto [&_svg]:w-full">
              <SceneIcon />
            </div>
          </div>
        ) : gameMeta ? (
          <div className="flex h-full items-center justify-center text-5xl" aria-hidden>
            {gameMeta.glyph}
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-xs font-medium tracking-wide text-stone-400 uppercase">
            {labelOrRaw(TYPE_LABELS, item.type)}
          </div>
        )}
        <span
          className={cn(
            "absolute top-2 right-2 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase",
            item.tier === "PREMIUM"
              ? "bg-amber-100 text-amber-800"
              : "bg-emerald-100 text-emerald-800"
          )}
        >
          {item.tier === "PREMIUM" ? "Premium" : "Free"}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2 text-[11px] font-medium tracking-wide text-stone-500 uppercase">
          <span>{labelOrRaw(TYPE_LABELS, item.type)}</span>
          <span>{item.playCount} plays</span>
        </div>
        <h3 className="font-medium text-stone-900 group-hover:text-stone-700">{item.title}</h3>
        {item.description && (
          <p className="line-clamp-2 text-sm text-stone-500">{item.description}</p>
        )}
        {skillTags.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1.5 pt-1">
            {skillTags.map((tag) => (
              <li
                key={tag.id}
                className="rounded-md bg-stone-100 px-1.5 py-0.5 text-[11px] text-stone-600"
              >
                {tag.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
