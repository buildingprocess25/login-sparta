import * as React from "react"

import { cn } from "@/lib/utils"

type PortalBackdropProps = {
  /** Warna aksen hex yang membentuk wash lembut di sisi kanan (mis. modul aktif). */
  accentColor?: string | null
  /** Teks keterangan teknis kecil di sudut kiri bawah. */
  caption?: string
  className?: string
}

/**
 * Latar ringan untuk halaman portal SPARTA:
 * - Di desktop: sapuan aksen halus yang merespons warna modul aktif, busur
 *   arsitektur tipis sebagai motif penyambung identitas BME tanpa mengulang
 *   denah toko dari halaman login, serta bingkai tipis.
 * - Di mobile: hanya wash lembut tanpa SVG/mask/blur berat agar performa HP
 *   tetap mulus.
 */
function PortalBackdrop({
  accentColor,
  caption,
  className,
}: PortalBackdropProps) {
  const accent = accentColor ?? "#e6000b"

  const washStyle = React.useMemo<React.CSSProperties>(
    () => ({
      background: `radial-gradient(58% 68% at 78% 52%, color-mix(in srgb, ${accent} 10%, transparent) 0%, color-mix(in srgb, ${accent} 2%, transparent) 54%, transparent 82%)`,
    }),
    [accent]
  )

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    >
      {/* Wash warna lembut yang mengikuti warna modul aktif (CSS murni, ringan di HP) */}
      <div
        className="absolute inset-0 transition-[background] duration-300 ease-out motion-reduce:transition-none"
        style={washStyle}
      />

      {/* Motif busur & sumbu arsitektur BME super-ringan (desktop saja) */}
      <svg
        viewBox="0 0 800 800"
        fill="none"
        className="absolute top-1/2 -left-48 hidden size-[52rem] -translate-y-1/2 text-panel-foreground/[0.065] lg:block"
      >
        <circle cx="340" cy="400" r="190" stroke="currentColor" strokeWidth="1" />
        <circle
          cx="340"
          cy="400"
          r="290"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="6 8"
        />
        <circle cx="340" cy="400" r="385" stroke="currentColor" strokeWidth="1" />
        <path
          d="M340 15V785M15 400H725"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="12 6 2 6"
          opacity="0.7"
        />
        <circle cx="340" cy="400" r="4" fill="currentColor" />
      </svg>

      {/* Garis tepi halus kanan bawah */}
      <div className="absolute inset-4 hidden rounded-3xl border border-panel-foreground/[0.07] lg:block xl:inset-6" />

      {caption ? (
        <span className="absolute bottom-7 left-9 hidden text-[11px] tracking-wider text-panel-foreground/40 lg:block xl:bottom-9 xl:left-11">
          {caption}
        </span>
      ) : null}
    </div>
  )
}

export { PortalBackdrop }
export type { PortalBackdropProps }
