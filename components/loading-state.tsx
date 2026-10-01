"use client"

import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { PLATFORMS } from "@/lib/platforms"
import { cn } from "@/lib/utils"
import { platformTheme } from "./platform-theme"

/** Seconds each marketplace is shown as "searching". Six steps ≈ 54s, then ranking + summary. */
const STEP_SECONDS = 9
const VERBS = ["Searching", "Scanning", "Querying", "Checking", "Reading", "Scanning"]

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

  const active = Math.floor(elapsed / STEP_SECONDS)
  const allScanned = active >= PLATFORMS.length
  const message = allScanned
    ? elapsed < PLATFORMS.length * STEP_SECONDS + 15
      ? "Ranking the best deals…"
      : "Writing the AI summary…"
    : `${VERBS[active]} ${PLATFORMS[active].name}…`
  // Eased estimate: approaches 95% and waits there for the real response.
  const pct = Math.min(95, Math.round(100 * (1 - Math.exp(-elapsed / 32))))

  return (
    <section aria-busy="true" aria-label="Comparing prices" className="overflow-hidden rounded-lg border border-line bg-white">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-valuetext={`${pct}% (estimated)`}
        className="relative h-[3px] bg-sunken"
      >
        <div
          className="absolute inset-y-0 left-0 bg-teal transition-[width] duration-1000 ease-linear"
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p aria-live="polite" className="text-base font-semibold leading-6 text-navy">
              {message}
            </p>
            <p className="mt-0.5 text-[13px] text-muted-ink">Pulling live listings — keep this tab open.</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-mono text-xl font-semibold leading-6 text-navy tabular-nums">{formatElapsed(elapsed)}</p>
            <p className="text-[11px] text-muted-ink">elapsed · usually 1:30-2:30</p>
          </div>
        </div>

        <ol className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {PLATFORMS.map((p, i) => {
            const state = i < active ? "done" : i === active ? "active" : "queued"
            const theme = platformTheme(p.name)
            return (
              <li
                key={p.name}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2.5 py-2 text-[13px] transition-colors duration-300",
                  state === "active" && "border-teal bg-teal-tint text-navy",
                  state === "done" && "border-line text-ink-2",
                  state === "queued" && "border-line text-muted-ink",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-sm font-mono text-[9px] font-semibold text-white",
                    state === "queued" && "opacity-45",
                  )}
                  style={{ backgroundColor: theme.ink }}
                >
                  {p.monogram}
                </span>
                <span className="truncate">{p.name}</span>
                <span className="ml-auto flex shrink-0 items-center text-[11px]">
                  {state === "active" && (
                    <span className="size-2 rounded-full bg-teal motion-safe:animate-[sd-pulse_1.2s_ease-in-out_infinite]">
                      <span className="sr-only">in progress</span>
                    </span>
                  )}
                  {state === "done" && <Check aria-label="done" className="size-3.5 text-teal-ink" />}
                  {state === "queued" && "Queued"}
                </span>
              </li>
            )
          })}
        </ol>

        <p className="mt-4 text-xs text-muted-ink">
          Progress is estimated — marketplaces are searched in parallel and results arrive together.
        </p>
      </div>
    </section>
  )
}
