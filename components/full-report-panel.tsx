"use client"

import { useState } from "react"
import { Check, ChevronDown, Copy, Download } from "lucide-react"
import { cn } from "@/lib/utils"

interface FullReportPanelProps {
  report: string
}

const toolButton =
  "inline-flex h-8 items-center gap-1.5 rounded-md border border-line-strong bg-white px-3 text-[13px] font-medium text-navy transition-colors hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"

export function FullReportPanel({ report }: FullReportPanelProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!report) return null

  const sizeKb = (new Blob([report]).size / 1024).toFixed(1)

  async function copy() {
    try {
      await navigator.clipboard.writeText(report)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard may be unavailable; ignore
    }
  }

  function download() {
    const blob = new Blob([report], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `supplier-report-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <section className="rounded-lg border border-line bg-white">
      <h2>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="full-report-body"
          className="flex w-full items-center gap-3 rounded-lg px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
          <span>
            <span className="block text-sm font-semibold text-navy">Full report</span>
            <span className="block text-xs text-muted-ink">Plain-text version of every listing — copy or download</span>
          </span>
          <span className="ml-auto font-mono text-xs text-muted-ink tabular-nums">{sizeKb} KB</span>
          <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-muted-ink transition-transform", open && "rotate-180")} />
        </button>
      </h2>

      {open && (
        <div id="full-report-body" className="border-t border-line p-4 sm:p-5">
          <div className="mb-3 flex justify-end gap-2">
            <button type="button" onClick={copy} className={toolButton}>
              {copied ? <Check aria-hidden className="size-3.5 text-teal-ink" /> : <Copy aria-hidden className="size-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <button type="button" onClick={download} className={toolButton}>
              <Download aria-hidden className="size-3.5" />
              Download .txt
            </button>
          </div>
          <pre
            tabIndex={0}
            className="max-h-[28rem] overflow-auto rounded-md bg-terminal p-4 font-mono text-xs leading-[19px] text-terminal-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            {report}
          </pre>
        </div>
      )}
    </section>
  )
}
