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

      // 1. Expand sections that opt in to being included in the PDF
      const collapsed = el.querySelectorAll<HTMLButtonElement>(
        'button[aria-expanded="false"][data-pdf-expand]'
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
      el.style.width = "1200px"
      el.style.padding = "20px"
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

      // 3. Capture at high resolution
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        scrollY: 0,
        windowWidth: 1240,
        backgroundColor: "#ffffff",
        logging: false,
      })

      // 4. Restore original styles
      el.setAttribute("style", originalStyle)
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