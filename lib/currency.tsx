"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"

const RATES_ENDPOINT = "/api/exchange-rates"

const SYMBOLS: Record<string, string> = {
  USD: "$",
  PKR: "Rs. ",
  CNY: "¥",
  TRY: "₺",
  EUR: "€",
  GBP: "£",
  INR: "₹",
  AED: "AED ",
}

export function formatConvertedPrice(price: number | null, code: string | null): string {
  if (price == null || !code) return "—"
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(price)
  const symbol = SYMBOLS[code.toUpperCase()]
  return symbol ? `${symbol}${formatted}` : `${formatted} ${code}`
}

interface CurrencyContextValue {
  targetCurrency: string
  rates: Record<string, number> | null
  ratesLoading: boolean
  ratesError: string | null
  convert: (price: number | null, fromCurrency: string | null) => number | null
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<Record<string, number> | null>(null)
  const [ratesLoading, setRatesLoading] = useState(true)
  const [ratesError, setRatesError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(RATES_ENDPOINT)
      .then((res) => {
        if (!res.ok) throw new Error(`Exchange rate lookup failed (${res.status}).`)
        return res.json()
      })
      .then((json) => {
        if (cancelled) return
        if (!json?.rates) throw new Error("Unexpected exchange rate response shape.")
        setRates(json.rates)
      })
      .catch((err) => {
        if (cancelled) return
        setRatesError(err instanceof Error ? err.message : "Could not load exchange rates.")
      })
      .finally(() => {
        if (!cancelled) setRatesLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const convert = useCallback(
    (price: number | null, fromCurrency: string | null): number | null => {
      if (price == null || !fromCurrency || !rates) return null
      const from = fromCurrency.toUpperCase()
      if (from === "USD") return Math.round(price * 100) / 100
      const fromRate = rates[from]
      if (!fromRate) return null
      return Math.round((price / fromRate) * 100) / 100
    },
    [rates],
  )

  return (
    <CurrencyContext.Provider
      value={{ targetCurrency: "USD", rates, ratesLoading, ratesError, convert }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider")
  return ctx
}
