"use client"

import type { ReactNode } from "react"
import { ExternalLink } from "lucide-react"
import type { Listing } from "@/lib/types"
import { type ProductAnalysis, listingKey, packLabel, savingsVs, unitPriceUSD } from "@/lib/deals"
import { useCurrency, formatConvertedPrice } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { ListingCard } from "./listing-card"
import { platformTheme } from "./platform-theme"

const SECTION_LIMIT = 6

interface ProductAnalysisViewProps {
  product: string
  analysis: ProductAnalysis
}

/**
 * Apple-to-apple view of one product: verdict tiles, then best single pieces,
 * pack/bulk deals (savings vs best single), kits, and what the AI excluded.
 */
export function ProductAnalysisView({ product, analysis }: ProductAnalysisViewProps) {
  const { rates } = useCurrency()
  const { singles, deals, kits, excluded, bestSingle, bestDeal, dealSavingsPct, overallBest } = analysis

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <VerdictTile
          label="Best single piece"
          listing={bestSingle}
          empty="No single-piece offers found."
        />
        <VerdictTile
          label="Best deal · per unit"
          listing={bestDeal}
          empty="No multi-pack or bulk offers found."
          note={
            dealSavingsPct != null
              ? `${dealSavingsPct}% less per unit than the best single piece`
              : bestDeal && bestSingle
                ? "Does not beat the best single piece per unit"
                : undefined
          }
        />
        <OverallTile
          overallBest={overallBest}
          bestSingle={bestSingle}
          bestDeal={bestDeal}
          dealSavingsPct={dealSavingsPct}
        />
      </div>

      <OfferSection
        title="Single piece — lowest prices"
        description="One unit each. This is the like-for-like baseline every deal is measured against."
        count={singles.length}
        empty={`No single-piece listings matched ${product}.`}
      >
        {singles.slice(0, SECTION_LIMIT).map((l, i) => (
          <ListingCard
            key={`${listingKey(l)}-${i}`}
            listing={l}
            accent={platformTheme(l.marketplace).ink}
            highlightLabel={i === 0 ? "Best single piece" : undefined}
            showMarketplace
          />
        ))}
      </OfferSection>

      <OfferSection
        title="Deals — packs & bulk"
        description="Multi-packs and wholesale lots, ranked by price per unit and compared with the best single piece."
        count={deals.length}
        empty={`No multi-pack or bulk offers for ${product}.`}
      >
        {deals.slice(0, SECTION_LIMIT).map((l, i) => (
          <ListingCard
            key={`${listingKey(l)}-${i}`}
            listing={l}
            accent={platformTheme(l.marketplace).ink}
            highlightLabel={i === 0 ? "Best deal" : undefined}
            savingsPct={savingsVs(l, bestSingle, rates)}
            showMarketplace
          />
        ))}
      </OfferSection>

      {kits.length > 0 && (
        <OfferSection
          title="Kits & sets"
          description="Bundles that mix this product with other items. Shown separately — they can't be compared per unit."
          count={kits.length}
        >
          {kits.slice(0, 3).map((l, i) => (
            <ListingCard
              key={`${listingKey(l)}-${i}`}
              listing={l}
              accent={platformTheme(l.marketplace).ink}
              showMarketplace
            />
          ))}
        </OfferSection>
      )}

      {excluded.length > 0 && <ExcludedList product={product} excluded={excluded} />}
    </div>
  )
}

function VerdictTile({
  label,
  listing,
  empty,
  note,
}: {
  label: string
  listing: Listing | null
  empty: string
  note?: string
}) {
  const { rates } = useCurrency()
  const unitUSD = listing ? unitPriceUSD(listing, rates) : null

  return (
    <div className="flex flex-col rounded-lg border border-line bg-white px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-ink">{label}</p>
      {listing ? (
        <>
          <p className="mt-1 font-mono text-[22px] font-semibold leading-7 tracking-tight text-navy tabular-nums">
            {formatConvertedPrice(unitUSD, "USD")}
            <span className="ml-1 text-xs font-medium text-muted-ink">/ unit</span>
          </p>
          <p className="mt-1 text-xs text-ink-2">
            {packLabel(listing) ?? "Listing"} on{" "}
            <span className="font-semibold" style={{ color: platformTheme(listing.marketplace).ink }}>
              {listing.marketplace}
            </span>
          </p>
          {note && <p className="mt-1 text-xs text-muted-ink">{note}</p>}
          <ListingLink listing={listing} />
        </>
      ) : (
        <p className="mt-2 text-sm text-muted-ink">{empty}</p>
      )}
    </div>
  )
}

function OverallTile({
  overallBest,
  bestSingle,
  bestDeal,
  dealSavingsPct,
}: {
  overallBest: Listing | null
  bestSingle: Listing | null
  bestDeal: Listing | null
  dealSavingsPct: number | null
}) {
  const { rates } = useCurrency()
  const unitUSD = overallBest ? unitPriceUSD(overallBest, rates) : null

  let verdict = "No comparable offers were found."
  if (overallBest && overallBest === bestDeal && bestSingle) {
    verdict = `Buy the ${packLabel(bestDeal)?.toLowerCase() ?? "deal"} — ${dealSavingsPct}% cheaper per unit than any single piece${
      bestDeal.minOrderUnits ? `, if you can take ${bestDeal.minOrderUnits}+ units` : ""
    }.`
  } else if (overallBest && overallBest === bestSingle && bestDeal) {
    verdict = "Buy the single piece — no pack or bulk deal beats it per unit."
  } else if (overallBest === bestSingle && bestSingle) {
    verdict = "Only single-piece offers were found, so this is the lowest price."
  } else if (overallBest === bestDeal && bestDeal) {
    verdict = `Only pack/bulk offers were found${bestDeal.minOrderUnits ? ` — minimum ${bestDeal.minOrderUnits} units` : ""}.`
  }

  return (
    <div className="flex flex-col rounded-lg border border-teal bg-teal-tint px-4 py-3 ring-1 ring-teal">
      <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-teal-ink">Best overall</p>
      {overallBest ? (
        <>
          <p className="mt-1 font-mono text-[22px] font-semibold leading-7 tracking-tight text-navy tabular-nums">
            {formatConvertedPrice(unitUSD, "USD")}
            <span className="ml-1 text-xs font-medium text-muted-ink">/ unit</span>
          </p>
          <p className="mt-1 text-xs text-ink-2">
            on{" "}
            <span className="font-semibold" style={{ color: platformTheme(overallBest.marketplace).ink }}>
              {overallBest.marketplace}
            </span>
          </p>
          <p className="mt-1 text-xs font-medium text-navy">{verdict}</p>
          <ListingLink listing={overallBest} />
        </>
      ) : (
        <p className="mt-2 text-sm text-muted-ink">{verdict}</p>
      )}
    </div>
  )
}

function ListingLink({ listing }: { listing: Listing }) {
  if (!listing.url) return null
  return (
    <a
      href={listing.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-auto inline-flex items-center gap-1 self-start rounded-sm pt-2 text-[13px] font-semibold hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
      style={{ color: platformTheme(listing.marketplace).ink }}
    >
      View listing
      <ExternalLink aria-hidden className="size-3.5" />
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  )
}

function OfferSection({
  title,
  description,
  count,
  empty,
  children,
}: {
  title: string
  description: string
  count: number
  empty?: string
  children: ReactNode
}) {
  return (
    <section>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <h3 className="text-base font-bold leading-6 tracking-tight text-navy">{title}</h3>
          <p className="text-[13px] text-muted-ink">{description}</p>
        </div>
        <span className="font-mono text-xs text-muted-ink tabular-nums">
          {count > SECTION_LIMIT ? `Top ${SECTION_LIMIT} of ${count}` : `${count} ${count === 1 ? "offer" : "offers"}`}
        </span>
      </div>
      {count > 0 ? (
        <div className="grid grid-cols-1 items-start gap-3 md:grid-cols-2 xl:grid-cols-3">{children}</div>
      ) : (
        <div className="rounded-lg border border-dashed border-line-strong bg-white px-4 py-4">
          <p className="text-[13px] text-muted-ink">{empty}</p>
        </div>
      )}
    </section>
  )
}

function ExcludedList({ product, excluded }: { product: string; excluded: Listing[] }) {
  return (
    <details className="group rounded-lg border border-line bg-white">
      <summary
        className={cn(
          "cursor-pointer list-none px-4 py-3 text-[13px] text-muted-ink",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
        )}
      >
        <span className="font-semibold text-ink-2">{excluded.length} listings hidden</span> — the AI found they are not{" "}
        {product}. <span className="text-teal-ink group-open:hidden">Show</span>
        <span className="hidden text-teal-ink group-open:inline">Hide</span>
      </summary>
      <ul className="divide-y divide-line border-t border-line">
        {excluded.map((l, i) => (
          <li key={`${listingKey(l)}-${i}`} className="flex items-start gap-3 px-4 py-2 text-[13px]">
            <span
              className="w-28 shrink-0 text-xs font-semibold"
              style={{ color: platformTheme(l.marketplace).ink }}
            >
              {l.marketplace}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-ink-2" title={l.title}>
                {l.titleEn || l.title}
              </span>
              {l.classificationReason && (
                <span className="block text-xs text-muted-ink">{l.classificationReason}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </details>
  )
}
