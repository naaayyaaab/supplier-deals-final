"use client"

import { ExternalLink, Package, Star, Truck } from "lucide-react"
import type { Listing } from "@/lib/types"
import { useCurrency, formatConvertedPrice } from "@/lib/currency"
import { packLabel, toUSD, unitPriceUSD } from "@/lib/deals"
import { cn } from "@/lib/utils"
import { formatAmount } from "./price"

interface ListingCardProps {
  listing: Listing
  accent: string
  isBestDeal?: boolean
  isLast?: boolean
  /** Custom highlight text instead of "Best deal" (e.g. "Best single piece"). */
  highlightLabel?: string
  /** % cheaper per unit than the best single piece (deals section). */
  savingsPct?: number | null
  /** Show which marketplace the listing is from (for cross-marketplace sections). */
  showMarketplace?: boolean
}

export function ListingCard({
  listing,
  accent,
  isBestDeal,
  highlightLabel,
  savingsPct,
  showMarketplace,
}: ListingCardProps) {
  const { rates } = useCurrency()
  const usdPrice = toUSD(listing.price, listing.currency, rates)
  const isAlreadyUSD = listing.currency?.toUpperCase() === "USD"
  const unitCount = listing.unitCount ?? 1
  const perUnitUSD = unitCount > 1 ? unitPriceUSD(listing, rates) : null
  const pack = packLabel(listing)
  // Always show English: AI translation first, original kept as tooltip.
  const title = listing.titleEn || listing.title
  const supplier = listing.supplierEn || listing.supplier
  const showOriginalTitle = !!listing.titleEn && listing.titleEn !== listing.title
  const hasMeta = !!listing.moq || typeof listing.rating === "number" || !!listing.shipping

  return (
    <article
      className={cn(
        "flex flex-col rounded-lg border bg-white transition-colors",
        isBestDeal ? "border-teal ring-1 ring-teal" : "border-line hover:border-line-strong",
      )}
    >
      <div className="p-4">
        {showMarketplace && (
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold leading-4" style={{ color: accent }}>
            <span aria-hidden className="size-1.5 rounded-full" style={{ backgroundColor: accent }} />
            {listing.marketplace}
            <span className="font-normal text-muted-ink">· {listing.country}</span>
          </p>
        )}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap font-mono tabular-nums">
              <span className="text-[22px] font-semibold leading-7 tracking-tight text-navy">
                {usdPrice != null ? formatConvertedPrice(usdPrice, "USD") : "—"}
              </span>
            </span>
            {perUnitUSD != null && (
              <p className="mt-0.5 font-mono text-xs font-semibold text-teal-ink tabular-nums">
                {formatConvertedPrice(perUnitUSD, "USD")} / unit × {unitCount}
              </p>
            )}
            {!isAlreadyUSD && listing.price != null && (
              <p className="mt-0.5 font-mono text-xs text-muted-ink tabular-nums">
                {formatAmount(listing.price)} {listing.currency ?? ""} original
              </p>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {(isBestDeal || highlightLabel) && (
              <span className="rounded bg-teal-strong px-1.5 py-0.5 text-[11px] font-semibold leading-4 text-white">
                {highlightLabel ?? "Best deal"}
              </span>
            )}
            {savingsPct != null && savingsPct > 0 && (
              <span className="rounded bg-teal-tint px-1.5 py-0.5 text-[11px] font-semibold leading-4 text-teal-ink">
                Save {savingsPct}% / unit
              </span>
            )}
          </div>
        </div>

        {pack && (
          <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-semibold leading-4">
            <span className="rounded border border-line-strong px-1.5 py-0.5 text-navy">{pack}</span>
            {listing.unitLabel && <span className="font-normal text-muted-ink">{listing.unitLabel}</span>}
          </p>
        )}

        <p
          className="mt-2 line-clamp-2 text-[13px] leading-[19px] text-ink-2"
          title={showOriginalTitle ? `Original: ${listing.title}` : title}
        >
          {title || "Untitled listing"}
        </p>

        <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-md bg-sunken px-3 py-2 text-[13px] leading-[18px]">
          <dt className="text-xs font-medium leading-[18px] text-muted-ink">Supplier</dt>
          <dd className="break-words text-navy" title={listing.supplier}>
            {supplier || <span className="text-muted-ink">Not listed</span>}
          </dd>
          <dt className="text-xs font-medium leading-[18px] text-muted-ink">Discount</dt>
          <dd className="break-words text-navy">
            {listing.discount || <span className="text-muted-ink">None</span>}
          </dd>
        </dl>

        {hasMeta && (
          <ul className="mt-3 space-y-1 text-xs leading-4 text-ink-2">
            {listing.moq && (
              <li className="flex items-center gap-1.5">
                <Package aria-hidden className="size-3.5 shrink-0 text-muted-ink" />
                <span className="truncate" title={listing.moq}>{listing.moq}</span>
              </li>
            )}
            {typeof listing.rating === "number" && (
              <li className="flex items-center gap-1.5">
                <Star aria-hidden className="size-3.5 shrink-0 text-muted-ink" />
                <span><span className="font-mono tabular-nums">{listing.rating.toFixed(1)}</span> / 5</span>
              </li>
            )}
            {listing.shipping && (
              <li className="flex items-center gap-1.5">
                <Truck aria-hidden className="size-3.5 shrink-0 text-muted-ink" />
                <span className="truncate" title={listing.shipping}>{listing.shipping}</span>
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="mt-auto border-t border-line px-4 py-2.5">
        {listing.url ? (
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-sm text-[13px] font-semibold hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
            style={{ color: accent }}
          >
            View listing
            <ExternalLink aria-hidden className="size-3.5" />
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        ) : (
          <span className="text-xs text-muted-ink">No link provided</span>
        )}
      </div>
    </article>
  )
}
