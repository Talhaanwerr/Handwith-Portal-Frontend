/** Human-readable labels for Content Library enums (API returns SCREAMING_SNAKE). */

export const TYPE_LABELS: Record<string, string> = {
  GAME: "Game",
  VIDEO: "Video",
  ACTIVITY: "Activity",
  DRAWING: "Drawing",
};

export const AGE_LABELS: Record<string, string> = {
  AGE_2_4: "Ages 2–4",
  AGE_5_7: "Ages 5–7",
  AGE_8_10: "Ages 8–10",
  AGE_11_PLUS: "Ages 11+",
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const DURATION_LABELS: Record<string, string> = {
  SHORT: "Short",
  MEDIUM: "Medium",
  LONG: "Long",
};

export function labelOrRaw(map: Record<string, string>, value: string): string {
  return map[value] ?? value.replace(/_/g, " ").toLowerCase();
}
