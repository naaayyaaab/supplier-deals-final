"use client"

import { Fragment, useId, useState } from "react"
import { ChevronDown, ExternalLink } from "lucide-react"
import type { Listing, PriceBasis } from "@/lib/types"
import { offerKind, packLabel, priceBasisOf, savingsVs, sizeLabel, unitPriceUSD } from "@/lib/deals"
import { useCurrency, formatConvertedPrice } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { formatAmount } from "./price"
import { platformTheme } from "./platform-theme"
import { MpLogo } from "./mp-logo"

/** Offer-type badge colours: single = green, pack/bulk = blue, kit = amber. */
const TYPE_STYLE = {
  single: "bg-ml-green-tint text-ml-green",
  deal: "bg-[#EAF0FB] text-[#1D4FB8]",
  kit: "bg-[#FFF3DB] text-[#8A5A00]",
} as const

/** Shared column template for the header and every row. */
export const OFFER_COLUMNS =
  "md:grid-cols-[minmax(0,2.6fr)_minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(0,1.2fr)_84px]"

export function OffersHeader({ basis = "unit" }: { basis?: PriceBasis }) {
  return (
    <div
      role="row"
      className={cn(
        "hidden gap-4 border-b border-ml-line bg-ml-soft px-5 py-3 text-xs font-medium text-ml-muted md:grid",
        OFFER_COLUMNS,
      )}
    >
      <span role="columnheader">Listing</span>
      <span role="columnheader">Marketplace</span>
      <span role="columnheader">Offer</span>
      <span role="columnheader" className="text-right">
        Price per {basis}
      </span>
      <span role="columnheader">
        <span className="sr-only">Actions</span>
      </span>
    </div>
  )
}

export function OfferRow({
  listing,
  bestSingle,
  isLowest,
  maxUnitUSD,
  showBars = true,
}: {
  listing: Listing
  /** Reference for the "vs best single" note (packs & bulk view only). */
  bestSingle?: Listing | null
  isLowest: boolean
  /** Highest unit price in the visible list, for the relative price bar. */
  maxUnitUSD: number
  showBars?: boolean
}) {
  const [open, setOpen] = useState(false)
  const detailsId = useId()
  const { rates } = useCurrency()
  const theme = platformTheme(listing.marketplace)

  const unitUSD = unitPriceUSD(listing, rates)
  const unitCount = listing.unitCount ?? 1
  const title = listing.titleEn || listing.title || "Untitled listing"
  const supplier = listing.supplierEn || listing.supplier
  const kind = offerKind(listing)
  const saving = bestSingle && listing !== bestSingle ? savingsVs(listing, bestSingle, rates) : null
  const barPct = unitUSD != null && maxUnitUSD > 0 ? Math.max(4, Math.round(Math.sqrt(unitUSD / maxUnitUSD) * 100)) : 0
  const basis = priceBasisOf(listing)
  const size = sizeLabel(listing)
  const sub =
    listing.minOrderUnits && listing.minOrderUnits > 1 && listing.packType !== "bulk"
      ? `Min. ${listing.minOrderUnits} units`
      : listing.unitLabel

  return (
    <div role="row" className={cn("relative border-b border-ml-row", isLowest ? "bg-[#F3FAF5]" : "bg-white")}>
      {isLowest && <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-ml-green" />}
      <div className={cn("grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-3 px-5 py-4", OFFER_COLUMNS)}>
        {/* Listing */}
        <div role="cell" className="col-span-2 flex min-w-0 gap-3.5 md:col-span-1">
          <Thumb src={listing.image} marketplace={listing.marketplace} ink={theme.ink} />
          <div className="min-w-0">
            <p
              className="line-clamp-2 text-pretty text-sm font-medium leading-[1.4] text-ml-ink"
              title={listing.titleEn && listing.titleEn !== listing.title ? `Original: ${listing.title}` : title}
            >
              {title}
            </p>
            <p className="mt-[3px] truncate text-[13px] text-ml-muted">{supplier || "Supplier not listed"}</p>
          </div>
        </div>

        {/* Marketplace */}
        <div role="cell" className="min-w-0 text-sm">
          <span className="flex items-center gap-2 font-medium" style={{ color: theme.ink }}>
            <MpLogo name={listing.marketplace} size={22} />
            {listing.marketplace}
          </span>
          <span className="mt-[3px] block text-[13px] text-ml-muted">{listing.country}</span>
        </div>

        {/* Offer */}
        <div role="cell" className="min-w-0 text-sm">
          <span className={cn("inline-flex h-6 items-center whitespace-nowrap rounded-md px-[9px] text-xs font-semibold", TYPE_STYLE[kind])}>
            {packLabel(listing) ?? "Unclassified"}
          </span>
          {listing.specMatch === "exact" && (
            <span className="ml-1.5 inline-flex h-6 items-center whitespace-nowrap rounded-md bg-ml-ink px-[9px] text-xs font-semibold text-ml-lime">
              Exact spec
            </span>
          )}
          {sub && <span className="mt-[5px] block truncate text-[13px] text-ml-muted">{sub}</span>}
        </div>

        {/* Price per unit */}
        <div role="cell" className="flex flex-col items-start gap-1 md:items-end md:text-right">
          {unitUSD != null ? (
            <span className="font-mono text-[17px] font-semibold tracking-[-0.02em]">
              {formatConvertedPrice(unitUSD, "USD")}
              {basis !== "unit" && <span className="ml-0.5 text-xs font-medium text-ml-muted">/ {basis}</span>}
            </span>
          ) : (
            <span className="text-sm font-medium text-ml-muted">Size not stated</span>
          )}
          {listing.price != null && (listing.currency?.toUpperCase() !== "USD" || unitCount > 1 || basis !== "unit") && (
            <span className="text-xs tabular-nums text-ml-muted">
              {formatAmount(listing.price)} {listing.currency}
              {basis !== "unit" ? (size ? ` for ${size}` : "") : unitCount > 1 ? ` for ${unitCount}` : ""}
            </span>
          )}
          {isLowest && (
            <span className="flex h-[22px] items-center whitespace-nowrap rounded-md bg-ml-ink px-2 text-xs font-semibold text-ml-lime">
              Lowest here
            </span>
          )}
          {saving != null && saving !== 0 && (
            <span className={cn("text-xs font-medium", saving > 0 ? "text-ml-green" : "text-ml-muted")}>
              {saving > 0 ? `${saving}% below best single` : `${Math.abs(saving)}% above best single`}
            </span>
          )}
          {showBars && barPct > 0 && (
            <span aria-hidden className="flex h-1 w-full max-w-[120px] justify-end overflow-hidden rounded-sm bg-ml-row">
              <span className={cn("h-full rounded-sm", isLowest ? "bg-ml-green" : "bg-[#B8BEB4]")} style={{ width: `${barPct}%` }} />
            </span>
          )}
        </div>

        {/* Actions */}
        <div role="cell" className="col-start-2 row-start-2 flex justify-end gap-1 md:col-start-auto md:row-start-auto">
          {listing.url && (
            <a
              href={listing.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open listing"
              className="flex size-9 items-center justify-center rounded-[9px] text-ml-muted hover:bg-ml-bg hover:text-ml-ink focus-visible:outline-2 focus-visible:outline-ml-green"
            >
              <ExternalLink aria-hidden className="size-4" />
              <span className="sr-only">Open listing on {listing.marketplace} (new tab)</span>
            </a>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls={detailsId}
            title="Details"
            className={cn(
              "flex size-9 items-center justify-center rounded-[9px] text-ml-muted hover:bg-ml-bg hover:text-ml-ink focus-visible:outline-2 focus-visible:outline-ml-green",
              open && "bg-ml-bg",
            )}
          >
            <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
            <span className="sr-only">{open ? "Hide" : "Show"} details</span>
          </button>
        </div>
      </div>

      {open && (
        <dl
          id={detailsId}
          className="mx-5 mb-4 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-5 gap-y-2 rounded-xl bg-ml-soft p-4 text-[13px] md:ml-[82px] md:grid-cols-[max-content_minmax(0,1fr)_max-content_minmax(0,1fr)]"
        >
          <Detail label="Original title" value={listing.title} wide />
          <Detail label="Supplier" value={listing.supplier} />
          <Detail label="Size" value={size} />
          <Detail label="Min. order" value={listing.moq} />
          <Detail label="Price shown" value={listing.discount} />
          <Detail label="Rating" value={typeof listing.rating === "number" ? `${listing.rating.toFixed(1)} / 5` : listing.rating} />
          <Detail label="Shipping" value={listing.shipping} />
          <Detail
            label="AI check"
            value={
              listing.aiClassified
                ? `${listing.classificationReason ?? "Matches the product"}${listing.relevance != null ? ` (${listing.relevance}% sure)` : ""}`
                : "Not checked by AI — matched on keywords"
            }
            wide
          />
        </dl>
      )}
    </div>
  )
}

function Detail({ label, value, wide }: { label: string; value: string | number | null | undefined; wide?: boolean }) {
  if (value == null || value === "") return null
  return (
    <Fragment>
      <dt className="text-ml-muted">{label}</dt>
      <dd className={cn("m-0 min-w-0 break-words text-ml-body", wide && "md:col-span-3")}>{String(value)}</dd>
    </Fragment>
  )
}

/** Product photo; falls back to the marketplace initials when missing or blocked. */
function Thumb({ src, marketplace, ink }: { src?: string | null; marketplace: string; ink: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <span
        aria-hidden
        className="flex size-12 shrink-0 items-center justify-center rounded-[10px] border border-ml-line bg-ml-bg font-mono text-xs font-semibold"
        style={{ color: ink }}
      >
        {marketplace.slice(0, 2).toUpperCase()}
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={48}
      height={48}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="size-12 shrink-0 rounded-[10px] border border-ml-line bg-white object-cover"
    />
  )
}

