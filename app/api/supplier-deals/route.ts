import { NextResponse } from "next/server"

// Scraping 6 marketplaces live can take 30-90s. Allow plenty of headroom.
export const maxDuration = 900
export const dynamic = "force-dynamic"

const WEBHOOK_URL = process.env.SUPPLIER_DEALS_WEBHOOK_URL

export async function POST(request: Request) {
  if (!WEBHOOK_URL) {
    return NextResponse.json(
      {
        error:
          "Missing SUPPLIER_DEALS_WEBHOOK_URL environment variable. Set it to your n8n webhook endpoint (…/webhook/supplier-deals).",
      },
      { status: 500 },
    )
  }

  let products: string
  try {
    const body = await request.json()
    products = typeof body?.products === "string" ? body.products.trim() : ""
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 })
  }

  if (!products) {
    return NextResponse.json({ error: "Please enter at least one product name." }, { status: 400 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 900_000)

  try {
    const upstream = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products }),
      signal: controller.signal,
    })

    const text = await upstream.text()

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream webhook responded with ${upstream.status}.`, detail: text.slice(0, 500) },
        { status: 502 },
      )
    }

    let data: unknown
    try {
      data = JSON.parse(text)
    } catch {
      return NextResponse.json(
        { error: "Webhook returned a non-JSON response.", detail: text.slice(0, 500) },
        { status: 502 },
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    const aborted = err instanceof Error && err.name === "AbortError"
    return NextResponse.json(
      {
        error: aborted
          ? "The request timed out. The marketplaces took too long to respond — please try again."
          : "Failed to reach the supplier-deals webhook.",
      },
      { status: aborted ? 504 : 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
