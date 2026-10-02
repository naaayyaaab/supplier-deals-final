"use client"

import { useRef, useState } from "react"
import type { SupplierDealsResponse } from "@/lib/types"
import { analyzeProduct, unitPriceUSD } from "@/lib/deals"
import { useCurrency, formatConvertedPrice } from "@/lib/currency"
import { cn } from "@/lib/utils"
import { DownloadPdfButton } from "./download-pdf-button"
import { ProductResults } from "./product-results"

interface ResultsViewProps {
  data: SupplierDealsResponse
  products: string[]
}

/** Results for one search: summary card, product tabs, then the active product. */
export function ResultsView({ data, products }: ResultsViewProps) {
  const { rates, ratesError } = useCurrency()
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const generated = data.generatedAt
    ? new Date(data.generatedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : null

  function onTabKey(e: React.KeyboardEvent, i: number) {
    const last = products.length - 1
    const next =
      e.key === "ArrowRight" ? (i === last ? 0 : i + 1) : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1) : null
    if (next === null) return
    e.preventDefault()
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  const product = products[Math.min(active, products.length - 1)]

  return (
    <div id="report-content" className="flex flex-col gap-8">
      <section className="flex flex-col gap-3.5 rounded-[18px] border border-ml-line bg-white p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[13px]">
            <h2 className="flex h-[26px] items-center gap-1.5 rounded-full bg-ml-ink px-2.5 font-medium text-white">
              <span aria-hidden className="size-1.5 rounded-full bg-ml-lime" />
              Summary
            </h2>
            {generated && <span className="text-ml-muted">{generated}</span>}
          </div>
          <DownloadPdfButton />
        </div>
        <p className="max-w-[76ch] text-pretty text-[17px] leading-[1.65] text-ml-body">
          {data.aiNaturalLanguageReport?.trim() || fallbackSummary(data, products, rates)}
        </p>
        <p className="text-[13px] text-ml-muted">
          Prices converted to USD and compared per unit
          {ratesError ? " — exchange rates unavailable, showing original amounts" : ""}. Confirm price and minimum order on
          the supplier page before buying.
        </p>
      </section>

      {products.length > 1 && (
        <div role="tablist" aria-label="Products" className="flex flex-wrap gap-3">
          {products.map((p, i) => {
            const best = analyzeProduct(data.results, p, rates).overallBest
            const selected = i === active
            return (
              <button
                key={p}
                ref={(el) => {
                  tabRefs.current[i] = el
                }}
                role="tab"
                id={`tab-${i}`}
                aria-selected={selected}
                aria-controls="product-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onTabKey(e, i)}
                className={cn(
                  "flex min-w-[220px] flex-col gap-1 rounded-[14px] border px-[18px] py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-green",
                  selected ? "border-ml-ink bg-ml-ink text-white" : "border-ml-line bg-white text-ml-ink hover:border-ml-line-2",
                )}
              >
                <span className="text-[15px] font-semibold">{p}</span>
                <span className={cn("text-[13px]", selected ? "text-ml-faint" : "text-ml-muted")}>
                  {best ? (
                    <>
                      <span className={cn("font-mono font-semibold", selected ? "text-ml-lime" : "text-ml-ink")}>
                        {formatConvertedPrice(unitPriceUSD(best, rates), "USD")}
                      </span>{" "}
                      per unit · {best.marketplace}
                    </>
                  ) : (
                    "No matching listings"
                  )}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div
        id="product-panel"
        role={products.length > 1 ? "tabpanel" : undefined}
        aria-labelledby={products.length > 1 ? `tab-${active}` : undefined}
      >
      <ProductResults key={product} product={product} results={data.results} />
      </div>
    </div>
  )
}

/** Used when the n8n AI summary is missing: one factual sentence per product. */
function fallbackSummary(data: SupplierDealsResponse, products: string[], rates: Record<string, number> | null) {
  return products
    .map((p) => {
      const best = analyzeProduct(data.results, p, rates).overallBest
      return best
        ? `${p}: lowest ${formatConvertedPrice(unitPriceUSD(best, rates), "USD")} per unit on ${best.marketplace}.`
        : `${p}: no matching listings found.`
    })
    .join(" ")
}
