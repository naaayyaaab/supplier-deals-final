import type { Marketplace } from "./types"

export interface PlatformConfig {
  name: Marketplace
  country: "China" | "Turkey"
  /** Accent used as a thin rule + monogram tint */
  accent: string
  /** Two-letter mark for the stamp */
  monogram: string
  /** Site favicon, used as the marketplace logo */
  logo: string
}

/** Fixed platform order — never change. */
export const PLATFORMS: PlatformConfig[] = [
  { name: "Alibaba", country: "China", accent: "#C2703A", monogram: "AB", logo: "https://www.google.com/s2/favicons?sz=64&domain=alibaba.com" },
  { name: "1688", country: "China", accent: "#B23B4A", monogram: "16", logo: "https://icons.duckduckgo.com/ip3/1688.com.ico" },
  { name: "Made-in-China", country: "China", accent: "#2E6FA3", monogram: "MC", logo: "https://www.google.com/s2/favicons?sz=64&domain=made-in-china.com" },
  { name: "Trendyol", country: "Turkey", accent: "#C08A2E", monogram: "TY", logo: "https://www.google.com/s2/favicons?sz=64&domain=trendyol.com" },
  { name: "Hepsiburada", country: "Turkey", accent: "#2E8577", monogram: "HB", logo: "https://www.google.com/s2/favicons?sz=64&domain=hepsiburada.com" },
  { name: "Amazon TR", country: "Turkey", accent: "#444B5A", monogram: "AZ", logo: "https://www.google.com/s2/favicons?sz=64&domain=amazon.com.tr" },
]

export const PLATFORM_ORDER: Marketplace[] = PLATFORMS.map((p) => p.name)

export function getPlatform(name: string): PlatformConfig | undefined {
  return PLATFORMS.find((p) => p.name === name)
}