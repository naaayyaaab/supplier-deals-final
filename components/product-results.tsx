"use client"

import { useId, useMemo, useState } from "react"
import { ChevronDown, ExternalLink } from "lucide-react"
import type { Listing, PriceBasis, ProductSpec } from "@/lib/types"
import { PLATFORMS } from "@/lib/platforms"
import { type ProductAnalysis, analyzeProduct, isRealListing, listingKey, packLabel, unitPriceUSD } from "@/lib/deals"
import { useCurrency, formatConvertedPrice } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { OfferRow, OffersHeader } from "./offers-table"
import { platformTheme } from "./platform-theme"
import { MpLogo } from "./mp-logo"

type OfferFilter = "exact" | "single" | "deal" | "kit" | "all"
type SortKey = "asc" | "desc" | "mp"
type View = "ranked" | "mp"

const FILTER_NAMES: Record<OfferFilter, string> = { exact: "exact-spec", single: "single-piece", deal: "pack or bulk", kit: "kit", all: "" }

interface ProductResultsProps {
  product: string
  results: Listing[]
  /** What the buyer typed beyond the product type (size, version ...); null if nothing. */
  spec?: ProductSpec | null
}

export function ProductResults({ product, results, spec = null }: ProductResultsProps) {
  const { rates } = useCurrency()
  const analysis = analyzeProduct(results, product, rates)
  const { singles, deals, kits, excluded, basis, exact } = analysis

  const [filter, setFilter] = useState<OfferFilter>(singles.length > 0 ? "single" : deals.length > 0 ? "deal" : "all")
  const [sort, setSort] = useState<SortKey>("asc")
  const [view, setView] = useState<View>("ranked")

  const unit = (l: Listing) => unitPriceUSD(l, rates) ?? Infinity
  const allMatching = [...singles, ...deals, ...kits]
  const returned = results.filter((l) => l.product === product && isRealListing(l))
  const marketplacesWithMatches = new Set(allMatching.map((l) => l.marketplace)).size

  const rows = useMemo(() => {
    const base =
      filter === "exact"
        ? exact
        : filter === "single"
          ? singles
          : filter === "deal"
            ? deals
            : filter === "kit"
              ? kits
              : [...singles, ...deals, ...kits]
    const order = PLATFORMS.map((p) => p.name as string)
    return [...base].sort((a, b) =>
      sort === "mp" ? order.indexOf(a.marketplace) - order.indexOf(b.marketplace) : sort === "asc" ? unit(a) - unit(b) : unit(b) - unit(a),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sort, exact, singles, deals, kits, rates])

  const maxUnitUSD = Math.max(0.0001, ...rows.map((l) => (Number.isFinite(unit(l)) ? unit(l) : 0)))
  const lowestOf = (list: Listing[]) => list.reduce<Listing | null>((m, l) => (!m || unit(l) < unit(m) ? l : m), null)
  const compareTo = filter === "deal" ? analysis.bestSingle : undefined

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[32px] font-semibold tracking-[-0.03em]">{product}</h2>
          {spec && (
            <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ml-sub">
              Your spec
              <span className="rounded-md bg-ml-ink px-2 py-0.5 text-xs font-semibold text-ml-lime">{spec.label}</span>
            </p>
          )}
          <p className="mt-2 text-sm text-ml-sub">
            {allMatching.length} matching {allMatching.length === 1 ? "listing" : "listings"} on {marketplacesWithMatches} of{" "}
            {PLATFORMS.length} marketplaces
            {excluded.length > 0 && ` · ${excluded.length} of ${returned.length} returned listings were other products and are hidden`}
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PLATFORMS.map((p) => {
            const n = allMatching.filter((l) => l.marketplace === p.name).length
            return (
              <span
                key={p.name}
                className={cn(
                  "flex h-[30px] items-center gap-1.5 whitespace-nowrap rounded-full border border-ml-line pl-[5px] pr-2.5 text-xs",
                  n ? "bg-white text-ml-ink" : "bg-transparent text-[#8A928D]",
                )}
              >
                <span className={cn("flex", !n && "opacity-40")}>
                  <MpLogo name={p.name} size={18} round />
                </span>
                {p.name} <span className="font-mono font-medium">{n}</span>
              </span>
            )
          })}
        </div>
      </div>

      {spec && <ExactMatches spec={spec} exact={exact} basis={basis} />}

      <Verdict analysis={analysis} />

      {/* Toolbar */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Segmented
          label="Offer type"
          value={filter}
          onChange={setFilter}
          options={[
            ...(spec ? [{ value: "exact" as const, label: "Exact spec", count: exact.length }] : []),
            { value: "single", label: "Single pieces", count: singles.length },
            { value: "deal", label: "Packs & bulk", count: deals.length },
            { value: "kit", label: "Kits & sets", count: kits.length },
            { value: "all", label: "All", count: allMatching.length },
          ]}
        />
        <div className="flex flex-wrap items-end gap-4">
          <Segmented
            label="View"
            value={view}
            onChange={setView}
            options={[
              { value: "ranked", label: "Ranked" },
              { value: "mp", label: "By marketplace" },
            ]}
          />
          <label className="flex flex-col gap-2 text-xs font-medium text-ml-muted">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-[42px] cursor-pointer rounded-xl border border-ml-line-2 bg-white px-3 text-sm text-ml-ink focus:border-ml-ink focus:outline-none"
            >
              <option value="asc">Price per {basis}, low to high</option>
              <option value="desc">Price per {basis}, high to low</option>
              <option value="mp">Marketplace</option>
            </select>
          </label>
        </div>
      </div>

      {filter === "kit" && kits.length > 0 && (
        <p className="rounded-xl border border-[#F1DFA8] bg-[#FFF8E6] px-4 py-3 text-sm text-[#5C4813]">
          Kits bundle this product with other items, so their price is for the whole set and is not compared with single pieces.
        </p>
      )}

      {/* Offers */}
      <div role="table" className="overflow-hidden rounded-2xl border border-ml-line bg-white">
        <OffersHeader basis={basis} />
        {view === "ranked" ? (
          rows.length > 0 ? (
            rows.map((l, i) => (
              <OfferRow
                key={`${listingKey(l)}-${i}`}
                listing={l}
                bestSingle={compareTo}
                isLowest={l === lowestOf(rows)}
                maxUnitUSD={maxUnitUSD}
              />
            ))
          ) : (
            <p className="border-b border-ml-row px-5 py-4 text-sm text-ml-muted">
              {allMatching.length === 0
                ? `None of the listings the marketplaces returned are ${product}. Try a more specific name, such as a brand, size or model.`
                : `No ${FILTER_NAMES[filter]} offers for ${product}.`}
            </p>
          )
        ) : (
          PLATFORMS.map((p) => {
            const here = rows.filter((l) => l.marketplace === p.name)
            const low = lowestOf(here)
            const matchingHere = allMatching.filter((l) => l.marketplace === p.name).length
            const returnedHere = returned.filter((l) => l.marketplace === p.name).length
            return (
              <div key={p.name}>
                <div className="flex items-center gap-2.5 border-b border-ml-line bg-[#FAFBF8] px-5 py-3.5 text-sm">
                  <MpLogo name={p.name} size={26} />
                  <span className="font-semibold" style={{ color: platformTheme(p.name).ink }}>
                    {p.name}
                  </span>
                  <span className="text-xs text-ml-muted">{p.country}</span>
                  <span className="ml-auto text-[13px] text-ml-muted">
                    {low
                      ? `${here.length} ${here.length === 1 ? "offer" : "offers"} · from ${formatConvertedPrice(unitPriceUSD(low, rates), "USD")} per ${basis}`
                      : matchingHere
                        ? `${matchingHere} matching, other offer type`
                        : `${returnedHere} returned, none are ${product}`}
                  </span>
                </div>
                {here.map((l, i) => (
                  <OfferRow
                    key={`${listingKey(l)}-${i}`}
                    listing={l}
                    bestSingle={compareTo}
                    isLowest={l === low}
                    maxUnitUSD={maxUnitUSD}
                  />
                ))}
              </div>
            )
          })
        )}
      </div>

      {excluded.length > 0 && <Excluded product={product} excluded={excluded} />}
    </section>
  )
}

/* ---------------------------------------------------------- Exact matches */

/**
 * Listings that state exactly the spec the buyer typed, shown above the
 * normal results. When none do, says so — the normal results below then
 * act as the closest alternatives (other sizes or versions).
 */
function ExactMatches({ spec, exact, basis }: { spec: ProductSpec; exact: Listing[]; basis: PriceBasis }) {
  const { rates } = useCurrency()
  const shown = exact.slice(0, 5)
  const maxUnitUSD = Math.max(0.0001, ...shown.map((l) => unitPriceUSD(l, rates) ?? 0))

  return (
    <section aria-label="Exact matches" className="overflow-hidden rounded-2xl border border-ml-line bg-white">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-ml-line px-5 py-4">
        <h3 className="text-base font-semibold">Exact match for {spec.label}</h3>
        <span className="text-[13px] text-ml-muted">
          {exact.length > 0
            ? `${exact.length} ${exact.length === 1 ? "listing states" : "listings state"} this spec · other sizes and versions are below`
            : "None found"}
        </span>
      </div>
      {shown.length > 0 ? (
        <div role="table">
          <OffersHeader basis={basis} />
          {shown.map((l, i) => (
            <OfferRow key={`${listingKey(l)}-${i}`} listing={l} isLowest={i === 0} maxUnitUSD={maxUnitUSD} />
          ))}
        </div>
      ) : (
        <p className="px-5 py-4 text-sm text-ml-sub">
          No listing states exactly {spec.label}. The results below are the same product in other sizes or versions, or
          listings whose title does not say — check the supplier page before buying.
        </p>
      )}
    </section>
  )
}

/* ---------------------------------------------------------------- Verdict */

function Verdict({ analysis }: { analysis: ProductAnalysis }) {
  const { rates } = useCurrency()
  const { bestSingle, bestDeal, dealSavingsPct, overallBest, basis } = analysis

  let recommendation = "No comparable offers were found for this product."
  if (overallBest && overallBest === bestDeal && bestSingle) {
    recommendation = `Buy the ${packLabel(bestDeal)?.toLowerCase() ?? "deal"} on ${bestDeal.marketplace}: ${dealSavingsPct}% less per ${basis} than the cheapest single piece${
      bestDeal.minOrderUnits ? `, if you can order ${bestDeal.minOrderUnits} or more` : ""
    }.`
  } else if (overallBest && overallBest === bestSingle && bestDeal) {
    recommendation = `Buy single pieces on ${bestSingle.marketplace}. No pack or bulk offer beats it per ${basis}.`
  } else if (overallBest && overallBest === bestSingle) {
    recommendation = `Only single-piece offers were found. ${bestSingle.marketplace} is the lowest.`
  } else if (overallBest && overallBest === bestDeal) {
    recommendation = `Only pack or bulk offers were found${bestDeal.minOrderUnits ? `; the best one needs at least ${bestDeal.minOrderUnits} units` : ""}.`
  }

  const cards = [
    { label: "Cheapest single piece", l: bestSingle, note: "", good: false },
    {
      label: "Cheapest pack or bulk deal",
      l: bestDeal,
      note: dealSavingsPct != null ? `${dealSavingsPct}% below the cheapest single piece` : bestDeal && bestSingle ? `Not cheaper per ${basis} than single pieces` : "",
      good: dealSavingsPct != null,
    },
  ].filter((c) => c.l)

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
      {cards.map(({ label, l, note, good }) => (
        <div key={label} className="flex flex-col gap-1.5 rounded-2xl border border-ml-line bg-white p-[22px]">
          <span className="text-[13px] font-medium text-ml-muted">{label}</span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-mono text-[34px] font-semibold tracking-[-0.03em]">
              {formatConvertedPrice(unitPriceUSD(l!, rates), "USD")}
            </span>
            <span className="text-[13px] text-ml-muted">per {basis}</span>
          </div>
          <span className="flex items-center gap-1.5 text-sm text-ml-sub">
            {packLabel(l!) ?? "Listing"} · <MpLogo name={l!.marketplace} size={20} />
            <span className="font-medium" style={{ color: platformTheme(l!.marketplace).ink }}>
              {l!.marketplace}
            </span>
          </span>
          {note && <span className={cn("text-[13px] font-medium", good ? "text-ml-green" : "text-ml-muted")}>{note}</span>}
          {l!.url && (
            <a
              href={l!.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center gap-1.5 pt-2.5 text-sm font-medium text-ml-green hover:underline hover:underline-offset-[3px]"
            >
              Open listing <ExternalLink aria-hidden className="size-3.5" />
            </a>
          )}
        </div>
      ))}
      <div className="flex flex-col gap-2.5 rounded-2xl bg-ml-ink p-[22px] text-white">
        <span className="flex items-center gap-2 text-[13px] font-medium text-ml-lime">
          <span aria-hidden className="size-1.5 rounded-full bg-ml-lime" />
          Recommendation
        </span>
        <p className="text-pretty text-[19px] font-medium leading-[1.4] tracking-[-0.01em]">{recommendation}</p>
        {overallBest?.url && (
          <a
            href={overallBest.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-auto flex h-[38px] items-center gap-2 self-start rounded-[10px] bg-ml-lime px-3.5 text-sm font-semibold text-ml-ink hover:bg-ml-lime-hover hover:no-underline"
          >
            Open listing <ExternalLink aria-hidden className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------- Segmented control */

function Segmented<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string; count?: number }[]
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      <span id={id} className="text-xs font-medium text-ml-muted">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={id} className="flex flex-wrap gap-0.5 rounded-xl bg-ml-well p-1">
        {options.map((o) => {
          const on = o.value === value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              className={cn(
                "flex h-[34px] items-center gap-2 whitespace-nowrap rounded-[9px] px-3 text-sm focus-visible:outline-2 focus-visible:outline-ml-green",
                on ? "bg-white font-semibold text-ml-ink shadow-[0_1px_2px_rgba(13,21,18,0.12)]" : "font-medium text-ml-sub hover:text-ml-ink",
              )}
            >
              {o.label}
              {o.count != null && (
                <span
                  className={cn(
                    "flex h-5 min-w-5 items-center justify-center rounded-md px-1.5 font-mono text-xs",
                    on ? "bg-ml-ink text-ml-lime" : "bg-ml-ink/[0.06] text-ml-muted",
                  )}
                >
                  {o.count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- Excluded */

function Excluded({ product, excluded }: { product: string; excluded: Listing[] }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const byMarketplace = PLATFORMS.map((p) => ({ name: p.name, count: excluded.filter((l) => l.marketplace === p.name).length })).filter(
    (m) => m.count > 0,
  )

  return (
    <div className="rounded-2xl border border-ml-line bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full flex-wrap items-center gap-x-4 gap-y-2 px-5 py-[18px] text-left focus-visible:outline-2 focus-visible:outline-ml-green"
      >
        <span className="flex h-7 min-w-9 items-center justify-center rounded-lg bg-ml-bg px-2 font-mono text-[13px] font-semibold text-ml-sub">
          {excluded.length}
        </span>
        <span className="text-[15px] font-semibold text-ml-ink">listings hidden — not {product}</span>
        <span className="flex flex-wrap gap-3 text-[13px] text-ml-muted">
          {byMarketplace.map((m) => (
            <span key={m.name} className="flex items-center gap-[5px]">
              <MpLogo name={m.name} size={18} round />
              {m.name} {m.count}
            </span>
          ))}
        </span>
        <span className="ml-auto flex items-center gap-1.5 text-sm font-medium text-ml-green">
          {open ? "Hide" : "Review"}
          <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
        </span>
      </button>
      {open && (
        <div id={id} className="border-t border-ml-line">
          {excluded.map((l, i) => (
            <div
              key={`${listingKey(l)}-${i}`}
              className="grid grid-cols-1 gap-1 border-b border-ml-row px-5 py-3 text-[13px] last:border-b-0 sm:grid-cols-[140px_minmax(0,1.6fr)_minmax(0,1fr)] sm:gap-4"
            >
              <span className="flex items-center gap-1.5 font-medium" style={{ color: platformTheme(l.marketplace).ink }}>
                <MpLogo name={l.marketplace} size={20} />
                {l.marketplace}
              </span>
              {l.url ? (
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-ml-body" title={l.title}>
                  {l.titleEn || l.title}
                </a>
              ) : (
                <span className="text-ml-body">{l.titleEn || l.title}</span>
              )}
              <span className="text-ml-muted">{l.classificationReason}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
