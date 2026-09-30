interface HeroProps {
  /** Headline, broken onto two lines at the first space. */
  title?: string
  tagline?: string
}

/**
 * Landing hero — the design-system cover as a live section.
 * Blocks: navy slab, teal block, teal-tint block with a dot grid (space-6 pitch),
 * one white satellite. Corners use radius-lg (8px). Decorative only.
 */
export function Hero({
  title = "Supplier Deals",
  tagline = "Six marketplaces, one honest price comparison.",
}: HeroProps) {
  const [first, ...rest] = title.split(" ")
  const second = rest.join(" ")

  const dots: { x: number; y: number }[] = []
  for (let i = 0; i < 7; i++) for (let j = 0; j < 6; j++) dots.push({ x: 92 + i * 24, y: 12 + j * 24 })

  return (
    <section className="relative overflow-hidden rounded-lg border border-line bg-page">
      {/* Mobile: blocks as a top band */}
      <svg
        aria-hidden
        className="block h-24 w-full md:hidden"
        viewBox="0 0 390 96"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect x="-8" y="-8" width="158" height="104" rx="8" className="fill-teal-tint" />
        {Array.from({ length: 12 }).map((_, k) => (
          <circle key={k} cx={12 + (k % 6) * 24} cy={16 + Math.floor(k / 6) * 24 + 24} r="2.5" className="fill-teal" />
        ))}
        <rect x="166" y="-8" width="96" height="104" rx="8" className="fill-teal" />
        <rect x="278" y="-8" width="130" height="104" rx="8" className="fill-navy" />
        <rect x="302" y="40" width="32" height="32" rx="6" className="fill-white" />
      </svg>

      <div className="relative md:h-[300px]">
        {/* Desktop: blocks in the right half, bleeding off top/right/bottom */}
        <svg
          aria-hidden
          className="absolute inset-y-0 right-0 hidden h-full md:block md:w-[300px] lg:w-[480px]"
          viewBox="0 0 480 300"
          preserveAspectRatio="xMaxYMid slice"
        >
          <rect x="80" y="-8" width="176" height="152" rx="8" className="fill-teal-tint" />
          {dots.map((d) => (
            <circle key={`${d.x}-${d.y}`} cx={d.x} cy={d.y} r="2.5" className="fill-teal" />
          ))}
          <rect x="80" y="160" width="176" height="148" rx="8" className="fill-teal" />
          <rect x="272" y="-8" width="216" height="316" rx="8" className="fill-navy" />
          <rect x="304" y="220" width="48" height="48" rx="8" className="fill-white" />
        </svg>

        <div className="relative flex h-full flex-col justify-end px-5 pb-6 pt-6 sm:px-10 sm:pb-9 md:max-w-[480px]">
          <h1 className="text-[48px] font-bold leading-[0.95] tracking-[-0.035em] text-navy sm:text-[64px] lg:text-[88px]">
            {first}
            {second && (
              <>
                <br />
                {second}
              </>
            )}
          </h1>
          <p className="mt-4 text-sm leading-5 text-muted-ink">{tagline}</p>
        </div>
      </div>
    </section>
  )
}
