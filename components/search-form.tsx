"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Check, CircleAlert, Clock, LoaderCircle, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchFormProps {
  onSubmit: (products: string) => void
  loading: boolean
}

const EXAMPLES = ["Nitrile Gloves", "Face Masks", "LED Ring Light", "Phone Cases"]

/** Split on commas, slashes or new lines — the same separators the backend accepts. */
function splitProducts(value: string) {
  return value
    .split(/[,/\n]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function SearchForm({ onSubmit, loading }: SearchFormProps) {
  const [value, setValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isMac, setIsMac] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.userAgent))
  }, [])

  const chosen = splitProducts(value).map((s) => s.toLowerCase())

  function submit() {
    if (loading) return
    const trimmed = value.trim()
    if (!trimmed) {
      setError("Enter at least one product name.")
      inputRef.current?.focus()
      return
    }
    setError(null)
    onSubmit(trimmed)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    submit()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      submit()
    }
  }

  function addExample(name: string) {
    if (chosen.includes(name.toLowerCase())) return
    const base = value.trim().replace(/[,/]\s*$/, "")
    setValue(base ? `${base}, ${name}` : name)
    setError(null)
    inputRef.current?.focus()
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-lg border border-line bg-white p-5 sm:p-6">
      <label htmlFor="products" className="mb-1.5 block text-xs font-medium text-ink-2">
        Products to compare
      </label>
      <textarea
        ref={inputRef}
        id="products"
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          if (error) setError(null)
        }}
        onKeyDown={handleKeyDown}
        disabled={loading}
        rows={3}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "products-error" : "products-hint"}
        placeholder="e.g. Nitrile Gloves, Face Masks"
        className={cn(
          "block w-full resize-y rounded-md border bg-white px-3 py-2.5 text-[15px] leading-[22px] text-navy outline-none transition-colors placeholder:text-subtle",
          "focus:border-teal focus:ring-3 focus:ring-teal/15 disabled:cursor-not-allowed disabled:bg-sunken disabled:text-muted-ink",
          error ? "border-danger" : "border-line-strong",
        )}
      />
      {error ? (
        <p id="products-error" role="alert" className="mt-1.5 flex items-center gap-1.5 text-[13px] text-danger-ink">
          <CircleAlert aria-hidden className="size-3.5" />
          {error}
        </p>
      ) : (
        <p id="products-hint" className="mt-1.5 text-xs text-muted-ink">
          Separate products with commas, slashes or new lines.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="mr-0.5 text-xs text-muted-ink">Try</span>
        {EXAMPLES.map((ex) => {
          const on = chosen.includes(ex.toLowerCase())
          const Icon = on ? Check : Plus
          return (
            <button
              key={ex}
              type="button"
              disabled={loading}
              aria-pressed={on}
              onClick={() => addExample(ex)}
              className={cn(
                "inline-flex items-center gap-1 rounded border px-2.5 py-1 text-[13px] leading-[18px] transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
                on
                  ? "border-teal bg-teal-tint text-teal-ink"
                  : "border-line bg-white text-ink-2 hover:border-line-strong hover:text-navy",
              )}
            >
              <Icon aria-hidden className={cn("size-3", !on && "text-muted-ink")} />
              {ex}
            </button>
          )
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-1.5 text-[13px] text-muted-ink">
          <Clock aria-hidden className="size-3.5 shrink-0" />
          Live search across 6 marketplaces takes 30–90 seconds.
        </p>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1 text-xs text-muted-ink sm:inline-flex" aria-hidden>
            <kbd className="rounded border border-line bg-sunken px-1.5 font-mono text-[11px] leading-4">
              {isMac ? "⌘" : "Ctrl"}
            </kbd>
            <kbd className="rounded border border-line bg-sunken px-1.5 font-mono text-[11px] leading-4">↵</kbd>
          </span>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-teal-strong px-5 text-sm font-semibold text-white transition-colors sm:w-auto",
              "hover:bg-teal-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {loading && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
            {loading ? "Comparing…" : "Compare prices"}
          </button>
        </div>
      </div>
    </form>
  )
}
