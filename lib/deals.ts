// import type { Listing } from "./types"

// /** A listing counts as a real, comparable offer when it succeeded and has a numeric price. */
// export function isRealListing(l: Listing): boolean {
//   return l.status === "OK" && typeof l.price === "number" && l.price !== null
// }

// /** Convert a price to USD using the rates object. Returns null if conversion isn't possible. */
// export function toUSD(
//   price: number | null,
//   currency: string | null,
//   rates: Record<string, number> | null,
// ): number | null {
//   if (price == null || !currency || !rates) return price
//   const from = currency.toUpperCase()
//   if (from === "USD") return price
//   const fromRate = rates[from]
//   if (!fromRate) return null
//   return price / fromRate
// }

// /** Top-N cheapest OK listings for a product on a marketplace, sorted by USD-converted price. */
// export function listingsFor(
//   results: Listing[],
//   product: string,
//   marketplace: string,
//   rates: Record<string, number> | null = null,
//   limit = 3,
// ): Listing[] {
//   return results
//     .filter((l) => l.product === product && l.marketplace === marketplace && isRealListing(l))
//     .sort((a, b) => {
//       const aUSD = toUSD(a.price, a.currency, rates) ?? Number.POSITIVE_INFINITY
//       const bUSD = toUSD(b.price, b.currency, rates) ?? Number.POSITIVE_INFINITY
//       return aUSD - bUSD
//     })
//     .slice(0, limit)
// }

// /**
//  * Best deal for a product — now compares ALL listings in USD.
//  * Falls back to native-price comparison if rates aren't loaded yet.
//  */
// export function bestDealFor(
//   results: Listing[],
//   product: string,
//   rates: Record<string, number> | null = null,
// ): Listing | null {
//   const real = results.filter((l) => l.product === product && isRealListing(l))
//   if (real.length === 0) return null

//   return real.reduce((best, current) => {
//     const bestUSD = toUSD(best.price, best.currency, rates) ?? Number.POSITIVE_INFINITY
//     const currentUSD = toUSD(current.price, current.currency, rates) ?? Number.POSITIVE_INFINITY
//     return currentUSD < bestUSD ? current : best
//   })
// }

// /** Stable identity for a listing so we can compare "is this the best deal?" */
// export function listingKey(l: Listing): string {
//   return [l.product, l.marketplace, l.title, l.supplier, l.price, l.url].join("|")
// }

// export function formatPrice(price: number | null, currency: string | null): string {
//   if (price === null || typeof price !== "number") return "—"
//   const formatted = new Intl.NumberFormat("en-US", {
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 2,
//   }).format(price)
//   return currency ? `${formatted} ${currency}` : formatted
// }

// export function countRealListings(results: Listing[], product: string): number {
//   return results.filter((l) => l.product === product && isRealListing(l)).length
// }


import type { Listing } from "./types"

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "for", "of", "to", "in", "on", "by",
  "with", "from", "at", "is", "it", "as", "be", "set", "pcs", "pc",
  "new", "hot", "top", "best", "pro", "mini", "max", "plus", "use",
])

/**
 * Marketplaces that receive TRANSLATED (non-English) search queries.
 * These are trusted to return relevant results because the translation
 * node already converted the product name to the local language.
 * We skip the strict English title-matching for these.
 */
const TRANSLATED_MARKETPLACES = new Set(["1688"])

/**
 * Marketplaces that receive ENGLISH search queries.
 * Strict title-matching applies here since both the query and
 * the listing titles are in English.
 */
// Alibaba, Made-in-China → strict matching

function isRelevant(listing: Listing, product: string): boolean {
  if (!listing.title || !product) return true

  // For marketplaces that got a translated search query,
  // trust the scraper's own search relevance — the translation
  // node already ensured the right product was searched for
  if (TRANSLATED_MARKETPLACES.has(listing.marketplace)) return true

  // For English marketplaces, apply strict matching:
  // ALL significant words from the product name must appear in the title
  const titleLower = listing.title.toLowerCase()
  const productLower = product.toLowerCase().trim()

  // Try full phrase match first
  if (titleLower.includes(productLower)) return true

  // Try plural tolerance on full phrase
  const stem = productLower.endsWith("es")
    ? productLower.slice(0, -2)
    : productLower.endsWith("s")
      ? productLower.slice(0, -1)
      : productLower
  if (stem.length > 2 && stem !== productLower && titleLower.includes(stem)) return true
  if (titleLower.includes(productLower + "s")) return true
  if (titleLower.includes(productLower + "es")) return true

  // Try individual word matching — all significant words must appear
  const productWords = productLower
    .split(/[\s,\-\/\\_]+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))

  if (productWords.length === 0) return true

  return productWords.every((word) => {
    if (titleLower.includes(word)) return true
    const wordStem = word.endsWith("es")
      ? word.slice(0, -2)
      : word.endsWith("s")
        ? word.slice(0, -1)
        : word
    if (wordStem.length > 2 && wordStem !== word && titleLower.includes(wordStem)) return true
    if (titleLower.includes(word + "s")) return true
    if (titleLower.includes(word + "es")) return true
    return false
  })
}

export function isRealListing(l: Listing): boolean {
  return l.status === "OK" && typeof l.price === "number" && l.price !== null
}

export function toUSD(
  price: number | null,
  currency: string | null,
  rates: Record<string, number> | null,
): number | null {
  if (price == null || !currency || !rates) return price
  const from = currency.toUpperCase()
  if (from === "USD") return price
  const fromRate = rates[from]
  if (!fromRate) return null
  return price / fromRate
}

export function listingsFor(
  results: Listing[],
  product: string,
  marketplace: string,
  rates: Record<string, number> | null = null,
  limit = 3,
): Listing[] {
  return results
    .filter(
      (l) =>
        l.product === product &&
        l.marketplace === marketplace &&
        isRealListing(l) &&
        isRelevant(l, product),
    )
    .sort((a, b) => {
      const aUSD = toUSD(a.price, a.currency, rates) ?? Number.POSITIVE_INFINITY
      const bUSD = toUSD(b.price, b.currency, rates) ?? Number.POSITIVE_INFINITY
      return aUSD - bUSD
    })
    .slice(0, limit)
}

export function bestDealFor(
  results: Listing[],
  product: string,
  rates: Record<string, number> | null = null,
): Listing | null {
  const real = results.filter(
    (l) => l.product === product && isRealListing(l) && isRelevant(l, product),
  )
  if (real.length === 0) return null

  return real.reduce((best, current) => {
    const bestUSD = toUSD(best.price, best.currency, rates) ?? Number.POSITIVE_INFINITY
    const currentUSD = toUSD(current.price, current.currency, rates) ?? Number.POSITIVE_INFINITY
    return currentUSD < bestUSD ? current : best
  })
}

export function listingKey(l: Listing): string {
  return [l.product, l.marketplace, l.title, l.supplier, l.price, l.url].join("|")
}

export function formatPrice(price: number | null, currency: string | null): string {
  if (price === null || typeof price !== "number") return "—"
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(price)
  return currency ? `${formatted} ${currency}` : formatted
}

export function countRealListings(results: Listing[], product: string): number {
  return results.filter(
    (l) => l.product === product && isRealListing(l) && isRelevant(l, product),
  ).length
}