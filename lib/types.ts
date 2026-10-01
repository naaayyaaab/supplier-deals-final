export type Marketplace = "Alibaba" | "1688" | "Made-in-China" | "Trendyol" | "Hepsiburada" | "Amazon TR"

export type Currency = "USD" | "CNY" | "TRY" | null

export interface Listing {
  product: string
  title: string
  supplier: string
  marketplace: Marketplace
  country: "China" | "Turkey" | string
  price: number | null
  currency: Currency
  discount: string | null
  moq: string | null
  rating: number | null
  shipping: string | null
  url: string | null
  /** Product photo URL from the marketplace (not every scraper returns one). */
  image?: string | null
  availability: boolean | null
  status: "OK" | "Price not listed" | "No results" | string
  note: string | null
  source: string
  /** AI classification (n8n node 6d). Absent/false when the AI step failed. */
  aiClassified?: boolean
  /** true = AI confirmed it is the searched product; false = excluded; null = not classified. */
  relevant?: boolean | null
  relevance?: number | null
  packType?: PackType | null
  /** How many units of the searched product the listed price buys. */
  unitCount?: number | null
  unitLabel?: string | null
  minOrderUnits?: number | null
  /** price / unitCount, in the listing's own currency. */
  unitPrice?: number | null
  titleEn?: string | null
  supplierEn?: string | null
  classificationReason?: string | null
}

export type PackType = "single" | "multi_pack" | "kit" | "bulk" | "accessory" | "other"

export interface SupplierDealsResponse {
  generatedAt: string
  products: string[]
  results: Listing[]
  bestDeals?: Listing[]
  priceComparison?: unknown
  aiNaturalLanguageReport?: string
  structuredReport?: string
}
