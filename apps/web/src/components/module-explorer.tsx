import * as React from "react"

import { cn } from "@/lib/utils"

type ModuleItem = {
  name: string
  description: string
  logo: string
}

type ModuleExplorerProps = {
  modules: ModuleItem[]
  /** Awalan nama yang disembunyikan di daftar agar nama utama lebih besar. */
  prefix?: string
}

function padIndex(value: number) {
  return String(value).padStart(2, "0")
}

/**
 * Indeks modul yang mengikuti scroll: baris yang melewati tengah layar menjadi
 * aktif, dan panel pratinjau lengket di kanan (desktop) berganti isi. Tidak
 * perlu hover/klik. Di mobile semua deskripsi langsung terlihat di bawah nama.
 * Klik baris tetap bisa untuk memilih langsung.
 */
function ModuleExplorer({ modules, prefix = "" }: ModuleExplorerProps) {
  const [active, setActive] = React.useState(0)
  const rowRefs = React.useRef<Array<HTMLLIElement | null>>([])

  React.useEffect(() => {
    let frame = 0

    // Baris yang memotong garis tengah layar menjadi aktif. Di atas daftar ->
    // modul pertama, di bawah daftar -> modul terakhir.
    const update = () => {
      frame = 0
      const middle = window.innerHeight / 2
      const rows = rowRefs.current

      for (let index = 0; index < rows.length; index += 1) {
        const rect = rows[index]?.getBoundingClientRect()
        if (!rect) continue
        if (rect.top <= middle && rect.bottom > middle) {
          setActive(index)
          return
        }
      }

      const first = rows[0]?.getBoundingClientRect()
      if (first && first.top > middle) setActive(0)
      else if (rows.length > 0) {
        const last = rows[rows.length - 1]?.getBoundingClientRect()
        if (last && last.bottom <= middle) setActive(rows.length - 1)
      }
    }

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update)
    }

    schedule()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [modules.length])

  if (modules.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada modul yang ditampilkan.
      </p>
    )
  }

  const current = modules[Math.min(active, modules.length - 1)]

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-14">
      <ol className="flex flex-col border-t">
        {modules.map((module, index) => {
          const isActive = index === active
          const shortName = prefix
            ? module.name.replace(new RegExp(`^${prefix}\\s*`), "")
            : module.name

          return (
            <li
              key={module.name}
              ref={(element) => {
                rowRefs.current[index] = element
              }}
              data-index={index}
              className="border-b"
            >
              <button
                type="button"
                aria-current={isActive ? "true" : undefined}
                onClick={() => setActive(index)}
                className="group flex w-full items-start gap-4 rounded-xl py-6 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:gap-6 lg:items-center lg:py-12"
              >
                <span
                  className={cn(
                    "w-6 shrink-0 pt-1 text-sm font-medium tabular-nums transition-colors motion-reduce:transition-none lg:pt-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {padIndex(index + 1)}
                </span>
                <img
                  src={module.logo}
                  alt=""
                  className={cn(
                    "size-10 shrink-0 object-contain transition-[filter,opacity] duration-500 motion-reduce:transition-none sm:size-12",
                    !isActive && "lg:opacity-50 lg:grayscale"
                  )}
                />
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  {prefix ? (
                    <span className="text-xs font-medium text-muted-foreground">
                      {prefix}
                    </span>
                  ) : null}
                  <span
                    className={cn(
                      "font-heading text-xl leading-tight font-medium tracking-tight transition-colors duration-500 motion-reduce:transition-none sm:text-2xl xl:text-3xl",
                      isActive
                        ? "text-foreground"
                        : "text-foreground lg:text-muted-foreground/60"
                    )}
                  >
                    {shortName}
                  </span>
                  {/* Mobile: deskripsi selalu terlihat. */}
                  <span className="pt-1 text-sm leading-6 text-muted-foreground lg:hidden">
                    {module.description}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "hidden h-0.5 shrink-0 bg-primary transition-[width] duration-500 motion-reduce:transition-none lg:block",
                    isActive ? "w-10" : "w-0"
                  )}
                />
              </button>
            </li>
          )
        })}
      </ol>

      <div className="hidden lg:block">
        <div
          aria-live="polite"
          className="sticky top-[calc(50vh-11rem)] overflow-hidden surface-card p-10 xl:p-12"
        >
          <div
            key={active}
            className="flex flex-col gap-8 motion-safe:animate-in motion-safe:duration-300 motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2"
          >
            <div className="flex items-start justify-between gap-6">
              <img
                src={current.logo}
                alt=""
                className="size-24 object-contain xl:size-28"
              />
              <span className="font-heading text-8xl leading-none font-medium text-transparent tabular-nums [-webkit-text-stroke:2px_rgb(29_34_38/0.18)]">
                {padIndex(active + 1)}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="font-heading text-2xl font-medium tracking-tight">
                {current.name}
              </h3>
              <p className="text-base leading-7 text-muted-foreground">
                {current.description}
              </p>
            </div>
            {/* Penanda posisi modul: ikut bergerak saat scroll. */}
            <div aria-hidden="true" className="flex gap-1.5">
              {modules.map((module, index) => (
                <span
                  key={module.name}
                  className={cn(
                    "h-1 rounded-full transition-[width,background-color] duration-500",
                    index === active ? "w-8 bg-primary" : "w-3 bg-foreground/15"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { ModuleItem }
export { ModuleExplorer }
