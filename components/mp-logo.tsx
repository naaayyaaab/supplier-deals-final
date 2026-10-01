import { getPlatform } from "@/lib/platforms"
import { cn } from "@/lib/utils"

/** Marketplace favicon on a white tile. `round` for coverage and filter rows. */
export function MpLogo({ name, size = 20, round }: { name: string; size?: number; round?: boolean }) {
  const logo = getPlatform(name)?.logo
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden bg-white shadow-[0_0_0_1px_rgba(13,21,18,0.08)]",
        round ? "rounded-full" : "rounded-md",
      )}
      style={{ width: size, height: size }}
    >
      {logo && (
        <span
          className="block bg-contain bg-center bg-no-repeat"
          style={{ width: size * 0.7, height: size * 0.7, backgroundImage: `url(${logo})` }}
        />
      )}
    </span>
  )
}
