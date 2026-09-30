"use client"

import { ExternalLink, Package, Star, Truck } from "lucide-react"
import type { Listing } from "@/lib/types"
import { useCurrency, formatConvertedPrice } from "@/lib/currency"
import { toUSD } from "@/lib/deals"
import { cn } from "@/lib/utils"
import { formatAmount } from "./price"

interface ListingCardProps {
  listing: Listing
  accent: string
  isBestDeal?: boolean
  isLast?: boolean
}

export function ListingCard({ listing, accent, isBestDeal }: ListingCardProps) {
  const { rates } = useCurrency()
  const usdPrice = toUSD(listing.price, listing.currency, rates)
  const isAlreadyUSD = listing.currency?.toUpperCase() === "USD"
  const hasMeta = !!listing.moq || typeof listing.rating === "number" || !!listing.shipping

  return (
    <article
      className={cn(
        "flex flex-col rounded-lg border bg-white transition-colors",
        isBestDeal ? "border-teal ring-1 ring-teal" : "border-line hover:border-line-strong",
      )}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap font-mono tabular-nums">
              <span className="text-[22px] font-semibold leading-7 tracking-tight text-navy">
                {usdPrice != null ? formatConvertedPrice(usdPrice, "USD") : "—"}
              </span>
            </span>
            {!isAlreadyUSD && listing.price != null && (
              <p className="mt-0.5 font-mono text-xs text-muted-ink tabular-nums">
                {formatAmount(listing.price)} {listing.currency ?? ""} original
              </p>
            )}
          </div>
          {isBestDeal && (
            <span className="shrink-0 rounded bg-teal-strong px-1.5 py-0.5 text-[11px] font-semibold leading-4 text-white">
              Best deal
            </span>
          )}
        </div>

        <p className="mt-2 line-clamp-2 text-[13px] leading-[19px] text-ink-2" title={listing.title}>
          {listing.title || "Untitled listing"}
        </p>

        <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-md bg-sunken px-3 py-2 text-[13px] leading-[18px]">
          <dt className="text-xs font-medium leading-[18px] text-muted-ink">Supplier</dt>
          <dd className="break-words text-navy" title={listing.supplier}>
            {listing.supplier || <span className="text-muted-ink">Not listed</span>}
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
