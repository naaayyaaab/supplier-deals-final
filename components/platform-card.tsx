import type { Listing } from "@/lib/types"
import type { PlatformConfig } from "@/lib/platforms"
import { listingKey } from "@/lib/deals"
import { ListingCard } from "./listing-card"
import { platformTheme } from "./platform-theme"

interface PlatformCardProps {
  platform: PlatformConfig
  listings: Listing[]
  bestDealKey: string | null
}

export function PlatformCard({ platform, listings, bestDealKey }: PlatformCardProps) {
  const theme = platformTheme(platform.name)
  const count = listings.length

  return (
    <section
      aria-label={`${platform.name} listings`}
      className="flex flex-col overflow-hidden rounded-lg border border-line bg-white"
      style={{ borderTopWidth: 3, borderTopColor: theme.accent }}
    >
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        <span
          aria-hidden
          className="flex size-7 shrink-0 items-center justify-center rounded font-mono text-[11px] font-semibold tracking-wide text-white"
          style={{ backgroundColor: theme.ink }}
        >
          {platform.monogram}
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-sm font-semibold leading-5 text-navy">{platform.name}</h4>
          <p className="text-xs leading-4 text-muted-ink">{platform.country}</p>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-ink tabular-nums">
          {count} {count === 1 ? "listing" : "listings"}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-3 bg-sunken p-3">
        {count > 0 ? (
          listings.map((l, i) => (
            <ListingCard
              key={`${listingKey(l)}-${i}`}
              listing={l}
              accent={theme.ink}
              isBestDeal={bestDealKey !== null && listingKey(l) === bestDealKey}
              isLast={i === count - 1}
            />
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-line-strong bg-white px-4 py-5">
            <p className="text-[13px] font-semibold text-ink-2">No listings</p>
            <p className="mt-0.5 text-xs leading-[18px] text-muted-ink">
              {platform.name} returned no priced results for this product. Try a broader or more common product name.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}
