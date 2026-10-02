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
  /** Weight/volume of ONE unit as stated in the title (e.g. 4 for a 4 g syringe). */
  sizeValue?: number | null
  sizeUnit?: "g" | "ml" | null
  /** sizeValue × unitCount: everything the listed price buys. */
  totalSize?: number | null
  /**
   * Comparison price in the listing's own currency, per `priceBasis`:
   * per piece (price / unitCount), or per g/ml for products sold in
   * different sizes. null when the product is compared per g/ml but this
   * listing states no size.
   */
  unitPrice?: number | null
  priceBasis?: PriceBasis | null
  /**
   * Does this listing state the spec the buyer typed (e.g. "3 g · Pro")?
   * exact / different (another size or version) / unknown (title silent).
   * null when no spec was typed or the listing is not the product.
   */
  specMatch?: SpecMatch | null
  titleEn?: string | null
  supplierEn?: string | null
  classificationReason?: string | null
}

export type PackType = "single" | "multi_pack" | "kit" | "bulk" | "accessory" | "other"

export type SpecMatch = "exact" | "different" | "unknown"

/** Properties the buyer typed with the product name, read by the n8n AI (node 2d). */
export interface ProductSpec {
  /** e.g. "3 g · Pro version" */
  label: string
  size: { value: number; unit: "g" | "ml" } | null
  properties: string[]
}

/** What the comparison price is per: one piece, one gram or one millilitre. */
export type PriceBasis = "unit" | "g" | "ml"

export interface SupplierDealsResponse {
  generatedAt: string
  products: string[]
  results: Listing[]
  /** Spec per searched product; null when only the product type was typed. */
  productSpecs?: Record<string, ProductSpec | null>
  bestDeals?: Listing[]
  priceComparison?: unknown
  aiNaturalLanguageReport?: string
  structuredReport?: string
}
