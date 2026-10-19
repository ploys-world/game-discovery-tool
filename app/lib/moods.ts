/**
 * The moods the app offers, in carousel order.
 *
 * Single source of truth: the API route keys its IGDB queries off these ids,
 * and the on-screen carousel renders from this same list — so adding a mood
 * here updates the counter, the dots and the carousel automatically, and the
 * route stops compiling until the new mood is given a query.
 *
 * Client-safe: ids, labels and tile emoji only. The IGDB query strings stay
 * in the route.
 */
export const MOODS = [
  { id: "cozy", label: "Cozy", emoji: "☕️" },
  { id: "intense", label: "Intense", emoji: "⚔️" },
  { id: "spooky", label: "Spooky", emoji: "🩻" },
  { id: "story", label: "Story", emoji: "📖" },
  { id: "social", label: "Social", emoji: "👥" },
] as const;

export type MoodId = (typeof MOODS)[number]["id"];

export function isMoodId(value: string | null | undefined): value is MoodId {
  return !!value && MOODS.some((m) => m.id === value);
}
