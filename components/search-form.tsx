"use client"

import type React from "react"
import { useRef, useState } from "react"
import { CircleAlert, LoaderCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchFormProps {
  onSubmit: (products: string) => void
  loading: boolean
}

const EXAMPLES = ["Composite Resin", "Periodontal Probe", "Nitrile Gloves", "LED Ring Light"]

/** Split on commas, slashes or new lines — the same separators the backend accepts. */
function splitProducts(value: string) {
  return value
    .split(/[,/\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Chip input: each product becomes a chip; Enter adds, Backspace on empty removes the last. */
export function SearchForm({ onSubmit, loading }: SearchFormProps) {
  const [chips, setChips] = useState<string[]>([])
  const [draft, setDraft] = useState("")
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const has = (name: string) => chips.some((c) => c.toLowerCase() === name.toLowerCase())

  function addNames(names: string[]) {
    setChips((prev) => {
      const next = [...prev]
      for (const n of names) if (!next.some((c) => c.toLowerCase() === n.toLowerCase())) next.push(n)
      return next
    })
    setError(null)
  }

  function submit() {
    if (loading) return
    // Include whatever is still typed in the input.
    const all = [...chips, ...splitProducts(draft).filter((n) => !has(n))]
    if (all.length === 0) {
      setError("Add at least one product.")
      inputRef.current?.focus()
      return
    }
    setChips(all)
    setDraft("")
    setError(null)
    onSubmit(all.join(", "))
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      submit()
    } else if (e.key === "Enter" && draft.trim()) {
      e.preventDefault()
      addNames(splitProducts(draft))
      setDraft("")
    } else if (e.key === "Backspace" && !draft && chips.length) {
      setChips((prev) => prev.slice(0, -1))
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    submit()
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="flex flex-wrap items-end gap-x-7 gap-y-5 rounded-[18px] bg-white p-6 shadow-[0_1px_2px_rgba(13,21,18,0.06),0_12px_32px_-12px_rgba(13,21,18,0.18)]"
    >
      <div className="flex min-w-0 flex-[2_1_460px] flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <label htmlFor="products" className="text-[13px] font-semibold">
            Products
          </label>
          <span className="whitespace-nowrap text-xs tabular-nums text-ml-muted">
            {chips.length} {chips.length === 1 ? "product" : "products"}
          </span>
        </div>
        <div
          onClick={() => inputRef.current?.focus()}
          className={cn(
            "flex min-h-14 flex-wrap items-center gap-2 rounded-xl border-[1.5px] bg-[#FAFBF8] px-3 py-2.5 focus-within:border-ml-ink",
            error ? "border-danger" : "border-ml-line-2",
          )}
        >
          {chips.map((c, i) => (
            <span key={c} className="flex h-8 items-center gap-1.5 rounded-lg bg-ml-ink pl-3 pr-1.5 text-sm font-medium text-white">
              {c}
              <button
                type="button"
                disabled={loading}
                onClick={() => setChips((prev) => prev.filter((_, j) => j !== i))}
                className="flex size-[22px] items-center justify-center rounded-md bg-white/10 text-sm leading-none text-ml-faint hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-ml-lime"
              >
                ×<span className="sr-only">Remove {c}</span>
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            id="products"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              if (error) setError(null)
            }}
            onKeyDown={handleKeyDown}
            disabled={loading}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "products-error" : undefined}
            placeholder={chips.length ? "Add another product" : "Add a product, press Enter"}
            className="h-8 min-w-[180px] flex-1 border-0 bg-transparent text-[15px] text-ml-ink outline-none placeholder:text-[#9AA39E] disabled:cursor-not-allowed"
          />
        </div>
        {error && (
          <p id="products-error" role="alert" className="flex items-center gap-1.5 text-[13px] text-danger-ink">
            <CircleAlert aria-hidden className="size-3.5" />
            {error}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-ml-muted">
          <span>Try:</span>
          {EXAMPLES.map((ex) => {
            const used = has(ex)
            return (
              <button
                key={ex}
                type="button"
                disabled={used || loading}
                onClick={() => addNames([ex])}
                className={cn(
                  "h-7 whitespace-nowrap rounded-full border bg-white px-2.5 text-[13px] focus-visible:outline-2 focus-visible:outline-ml-green",
                  used ? "cursor-default border-ml-row text-[#A3AAA5]" : "border-ml-line-2 text-ml-ink hover:border-ml-ink",
                )}
              >
                + {ex}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-[1_1_260px] flex-col pb-9">
        <button
          type="submit"
          disabled={loading}
          className="flex h-14 items-center justify-center gap-3 rounded-xl bg-ml-lime text-base font-semibold text-ml-ink transition-colors hover:bg-ml-lime-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ml-ink disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
          {loading ? "Searching marketplaces…" : "Compare prices"}
        </button>
      </div>
    </form>
  )
}
