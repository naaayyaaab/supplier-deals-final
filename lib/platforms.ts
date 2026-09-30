import type { Marketplace } from "./types"

export interface PlatformConfig {
  name: Marketplace
  country: "China" | "Turkey"
  /** Accent used as a thin rule + monogram tint */
  accent: string
  /** Two-letter mark for the stamp */
  monogram: string
}

/** Fixed platform order — never change. */
export const PLATFORMS: PlatformConfig[] = [
  { name: "Alibaba", country: "China", accent: "#C2703A", monogram: "AB" },
  { name: "1688", country: "China", accent: "#B23B4A", monogram: "16" },
  { name: "Made-in-China", country: "China", accent: "#2E6FA3", monogram: "MC" },
  { name: "Trendyol", country: "Turkey", accent: "#C08A2E", monogram: "TY" },
  { name: "Hepsiburada", country: "Turkey", accent: "#2E8577", monogram: "HB" },
  { name: "Amazon TR", country: "Turkey", accent: "#444B5A", monogram: "AZ" },
]

export const PLATFORM_ORDER: Marketplace[] = PLATFORMS.map((p) => p.name)

export function getPlatform(name: string): PlatformConfig | undefined {
  return PLATFORMS.find((p) => p.name === name)
}