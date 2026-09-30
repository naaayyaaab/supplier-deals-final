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
  availability: boolean | null
  status: "OK" | "Price not listed" | "No results" | string
  note: string | null
  source: string
}

export interface SupplierDealsResponse {
  generatedAt: string
  products: string[]
  results: Listing[]
  bestDeals?: Listing[]
  priceComparison?: unknown
  aiNaturalLanguageReport?: string
  structuredReport?: string
}
