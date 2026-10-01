// interface AIInsightsBannerProps {
//   report: string
//   generatedAt?: string
// }

// export function AIInsightsBanner({ report, generatedAt }: AIInsightsBannerProps) {
//   if (!report) return null

//   const date = generatedAt ? new Date(generatedAt) : null
//   const when =
//     date && !Number.isNaN(date.getTime())
//       ? date.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
//       : null

//   return (
//     <section
//       aria-label="AI summary"
//       className="rounded-lg border border-line border-l-[3px] border-l-teal bg-teal-tint py-4 pl-4 pr-5 sm:pl-5 sm:pr-6"
//     >
//       <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
//         <h2 className="text-[11px] font-semibold uppercase tracking-[0.06em] text-teal-ink">AI summary</h2>
//         {when && (
//           <time dateTime={generatedAt} className="font-mono text-xs text-muted-ink">
//             {when}
//           </time>
//         )}
//       </div>
//       <p className="max-w-[72ch] text-pretty text-sm leading-[22px] text-navy">{report}</p>
//       <p className="mt-3 text-xs text-muted-ink">
//         Written from the live listings below. Confirm price and MOQ on the supplier page before ordering.
//       </p>
//     </section>
//   )
// }

"use client"

import type { Listing } from "@/lib/types"
import { PLATFORMS } from "@/lib/platforms"
import { bestDealFor, listingsFor, unitPriceUSD } from "@/lib/deals"
import { useCurrency, formatConvertedPrice } from "@/lib/currency"

interface AIInsightsBannerProps {
  products: string[]
  results: Listing[]
  generatedAt?: string
}

export function AIInsightsBanner({ products, results, generatedAt }: AIInsightsBannerProps) {
  const { rates } = useCurrency()

  if (!products.length || !results.length) return null

  const when = generatedAt
    ? new Date(generatedAt).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null

  const productSummaries = products.map((product) => {
    const best = bestDealFor(results, product, rates)
    const bestUSD = best ? unitPriceUSD(best, rates) : null

    // Use listingsFor (which applies the strict relevance filter) per platform
    const platformsWithData: { name: string; count: number }[] = []
    let total = 0

    for (const p of PLATFORMS) {
      const filtered = listingsFor(results, product, p.name, rates)
      if (filtered.length > 0) {
        platformsWithData.push({ name: p.name, count: filtered.length })
        total += filtered.length
      }
    }

    return { product, best, bestUSD, total, platformsWithData }
  })

  // Overall cheapest
  const overallBest = productSummaries
    .filter((s) => s.bestUSD != null)
    .sort((a, b) => (a.bestUSD ?? Infinity) - (b.bestUSD ?? Infinity))[0]

  const lines: string[] = []

  if (overallBest && overallBest.best) {
    const bestTitle = overallBest.best.titleEn || overallBest.best.title
    const title = bestTitle
      ? `"${bestTitle.slice(0, 60)}${bestTitle.length > 60 ? "…" : ""}"`
      : overallBest.product
    lines.push(
      `The standout deal is ${title} on ${overallBest.best.marketplace} at ${formatConvertedPrice(overallBest.bestUSD, "USD")} per unit.`,
    )
  }

  for (const s of productSummaries) {
    if (s.total === 0) {
      lines.push(`No relevant listings were found for ${s.product} across any platform.`)
      continue
    }

    // List only platforms that actually have filtered listings, with counts
    const platformDetails = s.platformsWithData
      .map((p) => `${p.name} (${p.count})`)
      .join(", ")
      .replace(/, ([^,]*)$/, " and $1")

    const parts: string[] = []
    parts.push(`For ${s.product}, ${s.total} relevant listing${s.total === 1 ? " was" : "s were"} found`)
    parts.push(`on ${platformDetails}`)

    if (s.best && s.bestUSD != null) {
      parts.push(`— lowest ${formatConvertedPrice(s.bestUSD, "USD")} per unit on ${s.best.marketplace}`)
    }

    lines.push(parts.join(" ") + ".")
  }

  // Missing platforms — only those with zero filtered listings across ALL products
  const allPlatformsUsed = new Set(
    productSummaries.flatMap((s) => s.platformsWithData.map((p) => p.name)),
  )
  const missingPlatforms = PLATFORMS.filter((p) => !allPlatformsUsed.has(p.name)).map((p) => p.name)
  if (missingPlatforms.length > 0) {
    lines.push(
      `${missingPlatforms.join(" and ")} returned no relevant results for any of the searched products.`,
    )
  }

  return (
    <section
      aria-label="Summary"
      className="rounded-lg border border-line bg-white px-5 py-4"
    >
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-teal-ink">Summary</h3>
        {when && <span className="shrink-0 text-xs text-muted-ink">{when}</span>}
      </div>
      <p className="text-sm leading-relaxed text-ink-2">{lines.join(" ")}</p>
      <p className="mt-2 text-xs text-muted-ink">
        Built from the filtered listings displayed below. Confirm price and MOQ on the supplier page before ordering.
      </p>
    </section>
  )
}