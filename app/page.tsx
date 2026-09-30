// "use client"

// import { useState } from "react"
// import { CircleAlert } from "lucide-react"
// import type { SupplierDealsResponse } from "@/lib/types"
// import { PLATFORMS } from "@/lib/platforms"
// import { Hero } from "@/components/hero"
// import { SearchForm } from "@/components/search-form"
// import { LoadingState } from "@/components/loading-state"
// import { AIInsightsBanner } from "@/components/ai-insights-banner"
// import { ProductSection } from "@/components/product-section"
// import { DownloadPdfButton } from "@/components/download-pdf-button"
// import { CurrencyProvider } from "@/lib/currency"

// export default function Page() {
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)
//   const [data, setData] = useState<SupplierDealsResponse | null>(null)

//   async function handleSubmit(products: string) {
//     setLoading(true)
//     setError(null)
//     setData(null)

//     try {
//       const res = await fetch("/api/supplier-deals", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ products }),
//       })

//       const json = await res.json()

//       if (!res.ok) {
//         throw new Error(json?.error || `Request failed (${res.status}).`)
//       }

//       if (!json || !Array.isArray(json.results)) {
//         throw new Error("The webhook returned an unexpected response shape.")
//       }

//       setData(json as SupplierDealsResponse)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   const productList =
//     data?.products && data.products.length > 0
//       ? data.products
//       : Array.from(new Set((data?.results ?? []).map((r) => r.product)))

//   const hasResults = !!data && data.results.length > 0

//   return (
//     <CurrencyProvider>
//       <header className="bg-navy text-white">
//         <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between gap-4 px-4 sm:px-8">
//           <div className="flex min-w-0 items-baseline gap-3">
//             <span className="text-[15px] font-bold tracking-tight">Vector6</span>
//             <span className="hidden truncate text-[13px] text-on-navy-muted sm:inline">Supplier price comparison</span>
//           </div>
//           <div className="hidden items-center gap-2 text-xs text-on-navy-muted sm:flex">
//             <span aria-hidden className="size-1.5 rounded-full bg-[#5ED3D5]" />
//             {PLATFORMS.length} marketplaces · live data
//           </div>
//         </div>
//       </header>

//       <main className="mx-auto min-h-dvh max-w-[1100px] px-4 pb-20 pt-8 sm:px-8 sm:pt-10">
//         <Hero />

//         <div className="mb-4 mt-10">
//           <h2 className="text-xl font-bold leading-7 tracking-tight text-navy">Compare supplier prices</h2>
//           <p className="mt-1 max-w-2xl text-sm text-muted-ink">
//             Search {PLATFORMS.map((p) => p.name).join(", ").replace(/, ([^,]*)$/, " and $1")} in one pass. All prices
//             are automatically converted to USD for easy comparison.
//           </p>
//         </div>

//         <SearchForm onSubmit={handleSubmit} loading={loading} />

//         <div className="mt-8">
//           {error && (
//             <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-danger bg-white px-4 py-3">
//               <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger-ink" />
//               <div className="text-sm">
//                 <p className="font-semibold text-navy">Couldn&apos;t complete the search</p>
//                 <p className="mt-0.5 text-ink-2">{error}</p>
//               </div>
//             </div>
//           )}

//           {loading && <LoadingState />}

//           {!loading && data && (
//             <div className="space-y-6">
//               {hasResults && (
//                 <div className="flex justify-end">
//                   <DownloadPdfButton />
//                 </div>
//               )}

//               <div id="report-content">
//                 {data.aiNaturalLanguageReport && (
//                   <div className="mb-6">
//                     <AIInsightsBanner report={data.aiNaturalLanguageReport} generatedAt={data.generatedAt} />
//                   </div>
//                 )}

//                 {hasResults ? (
//                   <div className="space-y-12">
//                     {productList.map((product, i) => (
//                       <ProductSection
//                         key={product}
//                         product={product}
//                         entryNumber={i + 1}
//                         results={data.results}
//                         defaultOpen={i === 0}
//                       />
//                     ))}
//                   </div>
//                 ) : (
//                   <div className="rounded-lg border border-line bg-white px-5 py-6">
//                     <p className="text-sm font-semibold text-navy">No listings returned</p>
//                     <p className="mt-1 text-sm text-muted-ink">
//                       None of the six marketplaces returned results for these products. Try shorter, more common names —
//                       for example &ldquo;Nitrile Gloves&rdquo; instead of a full model number.
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {!loading && !data && !error && (
//             <div className="rounded-lg border border-dashed border-line-strong px-5 py-6">
//               <p className="text-sm font-semibold text-navy">Your comparison will appear here</p>
//               <ol className="mt-2 space-y-1 text-sm text-muted-ink">
//                 <li>1. Enter one or more product names above.</li>
//                 <li>2. We search all six marketplaces live (30–90 seconds).</li>
//                 <li>3. All prices converted to USD — cheapest deals ranked across every platform.</li>
//               </ol>
//             </div>
//           )}
//         </div>
//       </main>
//     </CurrencyProvider>
//   )
// }


"use client"

import { useState } from "react"
import { CircleAlert } from "lucide-react"
import type { SupplierDealsResponse } from "@/lib/types"
import { PLATFORMS } from "@/lib/platforms"
import { Hero } from "@/components/hero"
import { SearchForm } from "@/components/search-form"
import { LoadingState } from "@/components/loading-state"
import { AIInsightsBanner } from "@/components/ai-insights-banner"
import { ProductSection } from "@/components/product-section"
import { DownloadPdfButton } from "@/components/download-pdf-button"
import { CurrencyProvider } from "@/lib/currency"

export default function Page() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SupplierDealsResponse | null>(null)

  async function handleSubmit(products: string) {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const res = await fetch("/api/supplier-deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || `Request failed (${res.status}).`)
      }

      if (!json || !Array.isArray(json.results)) {
        throw new Error("The webhook returned an unexpected response shape.")
      }

      setData(json as SupplierDealsResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const productList =
    data?.products && data.products.length > 0
      ? data.products
      : Array.from(new Set((data?.results ?? []).map((r) => r.product)))

  const hasResults = !!data && data.results.length > 0

  return (
    <CurrencyProvider>
      <header className="bg-navy text-white">
        <div className="mx-auto flex h-14 max-w-[1100px] items-center justify-between gap-4 px-4 sm:px-8">
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="text-[15px] font-bold tracking-tight">Vector6</span>
            <span className="hidden truncate text-[13px] text-on-navy-muted sm:inline">Supplier price comparison</span>
          </div>
          <div className="hidden items-center gap-2 text-xs text-on-navy-muted sm:flex">
            <span aria-hidden className="size-1.5 rounded-full bg-[#5ED3D5]" />
            {PLATFORMS.length} marketplaces · live data
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-dvh max-w-[1100px] px-4 pb-20 pt-8 sm:px-8 sm:pt-10">
        <Hero />

        <div className="mb-4 mt-10">
          <h2 className="text-xl font-bold leading-7 tracking-tight text-navy">Compare supplier prices</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-ink">
            Search {PLATFORMS.map((p) => p.name).join(", ").replace(/, ([^,]*)$/, " and $1")} in one pass. All prices
            are automatically converted to USD for easy comparison.
          </p>
        </div>

        <SearchForm onSubmit={handleSubmit} loading={loading} />

        <div className="mt-8">
          {error && (
            <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-danger bg-white px-4 py-3">
              <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger-ink" />
              <div className="text-sm">
                <p className="font-semibold text-navy">Couldn&apos;t complete the search</p>
                <p className="mt-0.5 text-ink-2">{error}</p>
              </div>
            </div>
          )}

          {loading && <LoadingState />}

          {!loading && data && (
            <div className="space-y-6">
              {hasResults && (
                <div className="flex justify-end">
                  <DownloadPdfButton />
                </div>
              )}

              <div id="report-content">
                {hasResults && (
                  <div className="mb-6">
                    <AIInsightsBanner
                      products={productList}
                      results={data.results}
                      generatedAt={data.generatedAt}
                    />
                  </div>
                )}

                {hasResults ? (
                  <div className="space-y-12">
                    {productList.map((product, i) => (
                      <ProductSection
                        key={product}
                        product={product}
                        entryNumber={i + 1}
                        results={data.results}
                        defaultOpen={i === 0}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-line bg-white px-5 py-6">
                    <p className="text-sm font-semibold text-navy">No listings returned</p>
                    <p className="mt-1 text-sm text-muted-ink">
                      None of the six marketplaces returned results for these products. Try shorter, more common names —
                      for example &ldquo;Nitrile Gloves&rdquo; instead of a full model number.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && !data && !error && (
            <div className="rounded-lg border border-dashed border-line-strong px-5 py-6">
              <p className="text-sm font-semibold text-navy">Your comparison will appear here</p>
              <ol className="mt-2 space-y-1 text-sm text-muted-ink">
                <li>1. Enter one or more product names above.</li>
                <li>2. We search all six marketplaces live (30–90 seconds).</li>
                <li>3. All prices converted to USD — cheapest deals ranked across every platform.</li>
              </ol>
            </div>
          )}
        </div>
      </main>
    </CurrencyProvider>
  )
}