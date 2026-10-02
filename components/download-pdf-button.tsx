"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"

/**
 * html2canvas reads computed styles from the DOM. Modern browsers
 * compute some colors in lab()/oklch()/oklab() space internally,
 * even when the source CSS uses hex. html2canvas can't parse these
 * and throws. This patches getComputedStyle to convert any modern
 * color function to a safe rgb() fallback before html2canvas sees it.
 */
function patchGetComputedStyle() {
  const original = window.getComputedStyle

  const UNSUPPORTED = /(?:oklch|oklab|lab|lch)\s*\(/i

  function sanitizeValue(val: string): string {
    if (!val || typeof val !== "string") return val
    if (!UNSUPPORTED.test(val)) return val
    // Replace any unsupported color function with a neutral grey
    return val.replace(/(?:oklch|oklab|lab|lch)\([^)]*\)/gi, "rgb(128, 128, 128)")
  }

  window.getComputedStyle = function (elt: Element, pseudoElt?: string | null) {
    const styles = original.call(window, elt, pseudoElt)

    return new Proxy(styles, {
      get(target, prop: string) {
        const value = target[prop as any]
        if (typeof value === "string") {
          return sanitizeValue(value)
        }
        if (typeof value === "function") {
          return function (...args: any[]) {
            const result = value.apply(target, args)
            if (typeof result === "string") {
              return sanitizeValue(result)
            }
            return result
          }
        }
        return value
      },
    })
  } as typeof window.getComputedStyle

  return () => {
    window.getComputedStyle = original
  }
}

export function DownloadPdfButton() {
  const [generating, setGenerating] = useState(false)

  async function handleDownload() {
    setGenerating(true)

    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ])

      const el = document.getElementById("report-content")
      if (!el) return

      // 1. Expand all collapsed sections
      const collapsed = el.querySelectorAll<HTMLButtonElement>(
        'button[aria-expanded="false"]'
      )
      const wasCollapsed: HTMLButtonElement[] = []
      collapsed.forEach((btn) => {
        wasCollapsed.push(btn)
        btn.click()
      })

      await new Promise((r) => setTimeout(r, 600))

      // 2. Patch getComputedStyle to neutralize lab()/oklch()
      const unpatch = patchGetComputedStyle()

      // 3. Temporarily style for clean capture
      const originalStyle = el.getAttribute("style") || ""
      el.style.width = "1200px"
      el.style.padding = "24px"
      el.style.background = "white"

      // Un-truncate all text
      const truncated = el.querySelectorAll<HTMLElement>('[class*="truncate"], [class*="line-clamp"]')
      const truncStyles: string[] = []
      truncated.forEach((t) => {
        truncStyles.push(t.getAttribute("style") || "")
        t.style.overflow = "visible"
        t.style.whiteSpace = "normal"
        t.style.textOverflow = "unset"
        t.style.webkitLineClamp = "unset"
        t.style.display = "block"
      })

      // 4. Capture
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        windowWidth: 1248,
        backgroundColor: "#ffffff",
        logging: false,
      })

      // 5. Restore everything
      unpatch()
      el.setAttribute("style", originalStyle)
      truncated.forEach((t, i) => t.setAttribute("style", truncStyles[i]))
      wasCollapsed.forEach((btn) => btn.click())

      // 6. Build multi-page PDF
      const imgWidth = 190
      const pageHeight = 277
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF("p", "mm", "a4")
      let position = 0
      let pageNum = 0

      while (position < imgHeight) {
        if (pageNum > 0) pdf.addPage()

        const sourceY = (position / imgHeight) * canvas.height
        const sourceHeight = Math.min(
          (pageHeight / imgHeight) * canvas.height,
          canvas.height - sourceY
        )

        const pageCanvas = document.createElement("canvas")
        pageCanvas.width = canvas.width
        pageCanvas.height = sourceHeight

        const ctx = pageCanvas.getContext("2d")
        if (ctx) {
          ctx.fillStyle = "#ffffff"
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height)
          ctx.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, pageCanvas.width, sourceHeight)
        }

        const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.95)
        const sliceHeight = (sourceHeight * imgWidth) / canvas.width
        pdf.addImage(pageImgData, "JPEG", 10, 10, imgWidth, sliceHeight)

        position += pageHeight
        pageNum++
      }

      pdf.save(`supplier-report-${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
      console.error("PDF generation failed:", err)
      alert("PDF generation failed. Please try again.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={generating}
      className="flex h-[38px] shrink-0 items-center gap-2 whitespace-nowrap rounded-[10px] border border-ml-line-2 bg-white px-3.5 text-sm font-medium text-ml-ink transition-colors hover:border-ml-ink hover:bg-ml-soft focus-visible:outline-2 focus-visible:outline-ml-green disabled:opacity-50"
    >
      {generating ? (
        <>
          <Loader2 aria-hidden className="size-3.5 animate-spin" />
          Generating PDF…
        </>
      ) : (
        <>
          <Download aria-hidden className="size-3.5" />
          Download PDF
        </>
      )}
    </button>
  )
}