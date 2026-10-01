"use client"

import { useEffect, useState } from "react"

/** What the pipeline is doing, in order, with the elapsed second each step usually starts. */
const STEPS = [
  { at: 0, label: "Writing search terms in English, Chinese and Turkish" },
  { at: 5, label: "Searching Alibaba, 1688, Made-in-China, Trendyol, Hepsiburada and Amazon TR" },
  { at: 80, label: "AI checking every listing — removing look-alikes, reading pack sizes" },
  { at: 110, label: "Comparing offers per unit and writing the summary" },
]

function formatElapsed(total: number) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function LoadingState() {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000)
    return () => clearInterval(id)
  }, [])

  const current = STEPS.reduce((acc, step, i) => (elapsed >= step.at ? i : acc), 0)
  // Eased estimate: approaches 95% and waits there for the real response.
  const pct = Math.min(95, Math.round(100 * (1 - Math.exp(-elapsed / 50))))

  return (
    <section aria-busy="true" aria-label="Comparing prices" className="rounded-[18px] border border-ml-line bg-white p-7">
      <div className="flex items-baseline justify-between gap-4">
        <p aria-live="polite" className="text-[15px] font-semibold text-ml-ink">
          {STEPS[current].label}…
        </p>
        <p className="shrink-0 font-mono text-sm tabular-nums text-ml-sub">{formatElapsed(elapsed)}</p>
      </div>

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${pct}% (estimated)`}
        className="mt-3 h-1 overflow-hidden rounded-full bg-ml-row"
      >
        <div className="h-full bg-ml-green transition-[width] duration-1000 ease-linear" style={{ width: `${Math.max(pct, 2)}%` }} />
      </div>

      <ol className="mt-4 space-y-1.5 text-[13px]">
        {STEPS.map((step, i) => (
          <li
            key={step.label}
            className={i < current ? "text-ml-sub" : i === current ? "font-medium text-ml-ink" : "text-ml-muted"}
          >
            <span className="mr-2 inline-block w-10 font-mono text-xs tabular-nums text-ml-muted">
              {i < current ? "done" : i === current ? "now" : ""}
            </span>
            {step.label}
          </li>
        ))}
      </ol>

      {/* Skeleton of the results table so the layout does not jump when data arrives. */}
      <div aria-hidden className="mt-8 divide-y divide-ml-row border-y border-ml-row">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="grid grid-cols-12 items-center gap-4 py-3">
            <div className="col-span-7 flex items-center gap-3 md:col-span-5">
              <div className="size-10 shrink-0 animate-pulse rounded bg-ml-row" />
              <div className="h-3 w-full animate-pulse rounded bg-ml-row" />
            </div>
            <div className="hidden h-3 animate-pulse rounded bg-ml-row md:col-span-2 md:block" />
            <div className="hidden h-3 animate-pulse rounded bg-ml-row md:col-span-2 md:block" />
            <div className="col-span-5 h-4 animate-pulse rounded bg-ml-row md:col-span-3" />
          </div>
        ))}
      </div>
    </section>
  )
}
