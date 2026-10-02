import { PLATFORMS } from "@/lib/platforms"
import { platformTheme } from "./platform-theme"

/** Dark top band: brand, navigation, the six marketplaces, and the page title. */
export function SiteHeader() {
  return (
    <div
      className="text-white"
      style={{
        background:
          "radial-gradient(900px 420px at 85% -10%,rgba(200,241,105,0.18),transparent 60%),radial-gradient(700px 380px at 10% 110%,rgba(10,122,85,0.35),transparent 65%),radial-gradient(500px 300px at 55% 40%,rgba(37,99,235,0.12),transparent 70%),#0D1512",
      }}
    >
      <header className="mx-auto flex h-[88px] max-w-[1200px] items-center gap-10 px-6">
        <a href="#top" className="flex shrink-0 items-center gap-2.5 text-white hover:no-underline">
          <span className="relative block size-6 rounded-full border-2 border-ml-lime">
            <span className="absolute left-1 top-1 size-2 rounded-full bg-ml-lime" />
          </span>
          <span className="whitespace-nowrap text-[17px] font-semibold tracking-[-0.02em]">Market Lens</span>
        </a>
        <nav aria-label="Main" className="hidden shrink-0 gap-1 whitespace-nowrap text-sm sm:flex">
          <a href="#compare" aria-current="page" className="rounded-lg bg-white/[0.08] px-3.5 py-2 font-medium text-white hover:no-underline">
            Compare prices
          </a>
        </nav>
        <div
          className="ml-auto hidden shrink-0 items-center rounded-full py-1.5 pl-6 pr-2.5 md:flex"
          style={{
            background: "linear-gradient(120deg,rgba(255,255,255,0.10),rgba(200,241,105,0.08) 60%,rgba(255,255,255,0.03))",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.10),0 10px 40px -10px rgba(200,241,105,0.35)",
          }}
        >
          {PLATFORMS.map((p) => {
            const accent = platformTheme(p.name).accent
            return (
              <span
                key={p.name}
                title={p.name}
                className="-ml-3.5 flex size-[54px] shrink-0 rounded-full p-0.5 transition-transform duration-200 hover:-translate-y-[3px] hover:scale-[1.08]"
                style={{
                  background: `linear-gradient(140deg, ${accent} 0%, #C8F169 120%)`,
                  boxShadow: `0 0 0 3px #16201C, 0 8px 22px -6px ${accent}`,
                }}
              >
                <span
                  className="flex flex-1 items-center justify-center overflow-hidden rounded-full"
                  style={{ background: "radial-gradient(circle at 30% 25%,#FFFFFF 0%,#F1F3EE 70%,#E3E7E0 100%)" }}
                >
                  <span
                    className="block size-8 bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${p.logo})` }}
                  />
                </span>
              </span>
            )
          })}
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-12">
        <p className="mb-3.5 text-[13px] font-medium tracking-[0.02em] text-ml-lime">Six marketplaces · one per‑unit price</p>
        <h1 className="max-w-[720px] text-balance text-[44px] font-semibold leading-[1.08] tracking-[-0.035em]">
          Compare supplier prices
        </h1>
        <p className="mt-4 max-w-[640px] text-pretty text-[17px] leading-[1.55] text-ml-faint">
          Searches {PLATFORMS.map((p) => p.name).join(", ").replace(/, ([^,]*)$/, " and $1")} at once. Look‑alike
          products are removed, and every offer is compared per unit in USD (per gram or ml when sizes differ).
        </p>
      </div>
    </div>
  )
}
