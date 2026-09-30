import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      return NextResponse.json(
        { error: `Exchange rate API error (${res.status})` },
        { status: 502 }
      )
    }

    const json = await res.json()

    if (!json?.rates || typeof json.rates !== "object") {
      return NextResponse.json(
        { error: "Unexpected exchange rate response shape." },
        { status: 502 }
      )
    }

    return NextResponse.json({ base: "USD", rates: json.rates })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Exchange rate fetch failed." },
      { status: 500 }
    )
  }
}
