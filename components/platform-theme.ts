import type { Marketplace } from "@/lib/types"

/**
 * Visual accents per marketplace (design-system tokens).
 * `accent` is the brand colour for the card's top border.
 * `ink` is a darker, text-safe variant (≥4.5:1 on white) used for the
 * monogram fill and "View listing" links. Order and names still come from
 * lib/platforms.ts — this file only adds colour.
 */
export const PLATFORM_THEME: Record<Marketplace, { accent: string; ink: string }> = {
  Alibaba: { accent: "#D97706", ink: "#B45309" },
  "1688": { accent: "#DC2626", ink: "#DC2626" },
  "Made-in-China": { accent: "#2563EB", ink: "#2563EB" },
  Trendyol: { accent: "#EA580C", ink: "#C2410C" },
  Hepsiburada: { accent: "#059669", ink: "#047857" },
  "Amazon TR": { accent: "#475569", ink: "#475569" },
}

const FALLBACK = { accent: "#475569", ink: "#475569" }

export function platformTheme(name: string) {
  return PLATFORM_THEME[name as Marketplace] ?? FALLBACK
}
