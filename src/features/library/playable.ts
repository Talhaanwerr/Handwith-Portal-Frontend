import { GAMES } from "@/constants/games";
import type { LibraryContentItem } from "./api";

const PLAYLAB_IDS = new Set(GAMES.map((g) => g.id));

export type PlayableKind = "playlab" | "embed" | "unavailable";

export type Playable =
  | { kind: "playlab"; gameId: string }
  | { kind: "embed"; url: string }
  | { kind: "unavailable"; reason: string };

/**
 * Resolve how to play a ContentItem in the library player.
 * Convention: `fileId` (or last path segment of `embedUrl`) matches a PlayLab game id
 * (e.g. letter-tracing). Otherwise `embedUrl` is shown in an iframe (videos/activities).
 */
export function resolvePlayable(item: LibraryContentItem): Playable {
  const fromFile = item.fileId?.trim();
  if (fromFile && PLAYLAB_IDS.has(fromFile)) {
    return { kind: "playlab", gameId: fromFile };
  }

  const embed = item.embedUrl?.trim();
  if (embed) {
    try {
      const url = new URL(
        embed,
        typeof window !== "undefined" ? window.location.origin : "http://localhost"
      );
      const last = url.pathname.split("/").filter(Boolean).pop() ?? "";
      if (PLAYLAB_IDS.has(last)) {
        return { kind: "playlab", gameId: last };
      }
      if (PLAYLAB_IDS.has(embed)) {
        return { kind: "playlab", gameId: embed };
      }
      return { kind: "embed", url: embed };
    } catch {
      if (PLAYLAB_IDS.has(embed)) {
        return { kind: "playlab", gameId: embed };
      }
      return { kind: "embed", url: embed };
    }
  }

  if (item.type === "GAME") {
    return {
      kind: "unavailable",
      reason:
        "This game is not linked to a playable yet. Ask an admin to set fileId to a PlayLab game id.",
    };
  }

  return {
    kind: "unavailable",
    reason: "No playable link is set for this content yet.",
  };
}
