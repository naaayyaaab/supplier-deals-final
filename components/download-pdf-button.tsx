"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"

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

      // 1. Expand all collapsed product sections
      const collapsed = el.querySelectorAll<HTMLButtonElement>(
        'button[aria-expanded="false"]'
      )
      const wasCollapsed: HTMLButtonElement[] = []
      collapsed.forEach((btn) => {
        wasCollapsed.push(btn)
        btn.click()
      })

      // Wait for React to render expanded content
      await new Promise((r) => setTimeout(r, 600))

      // 2. Temporarily style the element for clean capture
      const originalStyle = el.getAttribute("style") || ""
      el.style.width = "1100px"
      el.style.padding = "20px"
      el.style.background = "white"

      // Force all grids to show properly
      const grids = el.querySelectorAll<HTMLElement>('[class*="grid"]')
      const gridStyles: string[] = []
      grids.forEach((g) => {
        gridStyles.push(g.getAttribute("style") || "")
        g.style.display = "grid"
        g.style.gridTemplateColumns = "1fr 1fr"
        g.style.gap = "12px"
      })

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

      // 3. Capture at high resolution
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        windowWidth: 1140,
        backgroundColor: "#ffffff",
        logging: false,
      })

      // 4. Restore original styles
      el.setAttribute("style", originalStyle)
      grids.forEach((g, i) => g.setAttribute("style", gridStyles[i]))
      truncated.forEach((t, i) => t.setAttribute("style", truncStyles[i]))

      // 5. Re-collapse sections
      wasCollapsed.forEach((btn) => btn.click())

      // 6. Build multi-page PDF from the canvas
      const imgWidth = 190 // A4 width minus margins (mm)
      const pageHeight = 277 // A4 height minus margins (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF("p", "mm", "a4")

      let position = 0
      let pageNum = 0

      while (position < imgHeight) {
        if (pageNum > 0) {
          pdf.addPage()
        }

        // Create a slice of the canvas for this page
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
          ctx.drawImage(
            canvas,
            0, sourceY,
            canvas.width, sourceHeight,
            0, 0,
            pageCanvas.width, sourceHeight
          )
        }

        const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.95)
        const sliceHeight = (sourceHeight * imgWidth) / canvas.width

        pdf.addImage(pageImgData, "JPEG", 10, 10, imgWidth, sliceHeight)

        position += pageHeight
        pageNum++
      }

      // 7. Direct download — no print dialog
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
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line-strong bg-white px-3 text-[13px] font-medium text-navy transition-colors hover:bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal disabled:opacity-50"
    >
      {generating ? (
        <>
          <Loader2 aria-hidden className="size-3.5 animate-spin" />
          Generating PDF…
        </>
      ) : (
        <>
          <Download aria-hidden className="size-3.5" />
          Download as PDF
        </>
      )}
    </button>
  )
}