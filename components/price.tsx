import { cn } from "@/lib/utils"

interface PriceProps {
  price: number | null
  currency: string | null
  size?: "lg" | "md"
  /** Tints the currency code teal so converted figures are recognisable. */
  converted?: boolean
  className?: string
}

/**
 * Display amount with fixed decimals so columns of prices line up
 * (2.40, not 2.4). Sub-unit prices keep up to 4 decimals (0.028).
 */
export function formatAmount(price: number): string {
  const abs = Math.abs(price)
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: abs > 0 && abs < 1 ? 4 : 2,
  }).format(price)
}

/** Amount in mono with the currency code always beside it. Never converts on its own. */
export function Price({ price, currency, size = "lg", converted, className }: PriceProps) {
  if (price == null) {
    return <span className={cn("text-sm font-medium text-muted-ink", className)}>Price not listed</span>
  }

  return (
    <span className={cn("inline-flex items-baseline gap-1.5 whitespace-nowrap font-mono tabular-nums", className)}>
      <span
        className={cn(
          "font-semibold tracking-tight text-navy",
          size === "lg" ? "text-[22px] leading-7" : "text-base leading-[22px]",
        )}
      >
        {formatAmount(price)}
      </span>
      <span
        className={cn(
          "font-medium tracking-wide",
          size === "lg" ? "text-xs" : "text-[11px]",
          converted ? "text-teal-ink" : "text-muted-ink",
        )}
      >
        {currency ?? "—"}
      </span>
    </span>
  )
}
