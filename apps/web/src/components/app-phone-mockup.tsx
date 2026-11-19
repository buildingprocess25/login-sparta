import { ChevronRight } from "lucide-react"

import spartaLogo from "@/assets/Building-Logo.png"
import { cn } from "@/lib/utils"

type PhoneModule = {
  name: string
  logo: string
}

type AppPhoneMockupProps = {
  modules: PhoneModule[]
  className?: string
}

/**
 * Bingkai ponsel berisi tampilan ringkas daftar modul SPARTA (isi nyata dari
 * data modul). Dekoratif: daftar modul lengkap ada di bagian Modul SPARTA.
 */
function AppPhoneMockup({ modules, className }: AppPhoneMockupProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative aspect-[9/19] w-56 rounded-[2.75rem] bg-[#1d2226] p-2 shadow-[0_40px_80px_-32px_rgb(16_24_32/0.55)] sm:w-64",
        className
      )}
    >
      <div className="relative flex size-full flex-col overflow-hidden rounded-[2.25rem] bg-white">
        {/* Dynamic island */}
        <span className="absolute top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 rounded-full bg-[#1d2226]" />

        <div className="flex items-center justify-between px-6 pt-3 text-[10px] font-semibold">
          <span>09:41</span>
          <span className="flex gap-0.5">
            <span className="h-2 w-1 rounded-sm bg-foreground/80" />
            <span className="h-2 w-1 rounded-sm bg-foreground/80" />
            <span className="h-2 w-1 rounded-sm bg-foreground/40" />
          </span>
        </div>

        <div className="flex items-center gap-2 px-4 pt-6">
          <img src={spartaLogo} alt="" className="h-7 w-auto" />
          <span className="text-sm font-bold tracking-wider">SPARTA</span>
        </div>

        <div className="flex flex-col gap-0.5 px-4 pt-4">
          <span className="text-[10px] text-muted-foreground">
            Departemen BME
          </span>
          <span className="font-heading text-base leading-tight font-medium">
            Pilih modul
          </span>
        </div>

        <ul className="flex flex-col gap-1.5 px-3 pt-3">
          {modules.map((module, index) => (
            <li
              key={module.name}
              className={cn(
                "flex items-center gap-2.5 rounded-2xl px-2.5 py-2",
                index === 0
                  ? "bg-primary/10 ring-1 ring-primary/20"
                  : "bg-muted/60"
              )}
            >
              <img
                src={module.logo}
                alt=""
                className="size-7 shrink-0 object-contain"
              />
              <span className="min-w-0 flex-1 truncate text-[11px] font-medium">
                {module.name}
              </span>
              <ChevronRight className="size-3 shrink-0 text-muted-foreground" />
            </li>
          ))}
        </ul>

        <span className="mt-auto mb-2 h-1 w-24 self-center rounded-full bg-foreground/80" />
      </div>
    </div>
  )
}

export type { PhoneModule }
export { AppPhoneMockup }
