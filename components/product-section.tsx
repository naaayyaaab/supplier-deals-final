"use client"

import { useId, useState } from "react"
import { ChevronDown } from "lucide-react"
import type { Listing } from "@/lib/types"
import { PLATFORMS } from "@/lib/platforms"
import { listingsFor, bestDealFor, listingKey, countRealListings, toUSD } from "@/lib/deals"
import { useCurrency, formatConvertedPrice } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { PlatformCard } from "./platform-card"

interface ProductSectionProps {
  product: string
  entryNumber: number
  results: Listing[]
  defaultOpen?: boolean
}

export function ProductSection({ product, entryNumber, results, defaultOpen = true }: ProductSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const bodyId = useId()
  const { rates } = useCurrency()

  const best = bestDealFor(results, product, rates)
  const bestKey = best ? listingKey(best) : null
  const total = countRealListings(results, product)
  const perPlatform = PLATFORMS.map((p) => ({
    platform: p,
    listings: listingsFor(results, product, p.name, rates),
  }))
  const platformsWithListings = perPlatform.filter((p) => p.listings.length > 0).length
  const bestUSD = best ? toUSD(best.price, best.currency, rates) : null

  return (
    <section className="scroll-mt-24">
      <h2>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={bodyId}
        className={cn(
          "flex w-full items-center gap-4 rounded-lg border border-line bg-white px-5 py-4 text-left transition-colors hover:border-line-strong",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-page",
        )}
      >
        <span className="self-start pt-1 font-mono text-xs text-muted-ink tabular-nums">
          {String(entryNumber).padStart(2, "0")}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-xl font-bold leading-7 tracking-tight text-navy">{product}</span>
          <span className="mt-0.5 block text-[13px] text-muted-ink">
            <span className="font-mono text-ink-2 tabular-nums">{total}</span> {total === 1 ? "listing" : "listings"} on{" "}
            <span className="font-mono text-ink-2 tabular-nums">{platformsWithListings}</span> of {PLATFORMS.length}{" "}
            platforms
          </span>
          {best && (
            <span className="mt-1.5 flex items-baseline gap-1.5 text-xs text-muted-ink sm:hidden">
              Best
              <span className="font-mono font-semibold text-teal-ink tabular-nums">
                {formatConvertedPrice(bestUSD, "USD")}
              </span>
              on {best.marketplace}
            </span>
          )}
        </span>

        {best && (
          <span className="hidden shrink-0 text-right sm:block">
            <span className="block text-[11px] text-muted-ink">Best price</span>
            <span className="block font-mono text-base font-semibold leading-[22px] tracking-tight text-teal-ink tabular-nums">
              {formatConvertedPrice(bestUSD, "USD")}
            </span>
            <span className="block text-xs text-muted-ink">on {best.marketplace}</span>
          </span>
        )}

        <ChevronDown
          aria-hidden
          className={cn("size-5 shrink-0 text-muted-ink transition-transform", open && "rotate-180")}
        />
      </button>
      </h2>

      {open && (
        <div id={bodyId} className="grid grid-cols-1 items-start gap-4 pt-4 md:grid-cols-2 xl:grid-cols-3">
          {perPlatform.map(({ platform, listings }) => (
            <PlatformCard key={platform.name} platform={platform} listings={listings} bestDealKey={bestKey} />
          ))}
        </div>
      )}
    </section>
  )
}
