import * as React from "react"
import { ArrowRight } from "lucide-react"

import { FasciaStripe } from "@/components/fascia-stripe"
import { Logo } from "@/components/logo"
import { StoreFloorPlan } from "@/components/store-floor-plan"
import { StorefrontElevation } from "@/components/storefront-elevation"
import { Button } from "@/components/ui/button"
import { SPARTA_APPS, type SpartaAppId } from "@/lib/sparta-auth"
import { SPARTA_APP_LOGOS } from "@/lib/sparta-assets"
import { ROUTES } from "@/routes"

const appOrder: SpartaAppId[] = [
  "building",
  "maintenance",
  "energy",
  "siaga",
  "carbontrack",
  "engineering",
]

const acronym = [
  { initial: "S", rest: "ystem for " },
  { initial: "P", rest: "roperty " },
  { initial: "A", rest: "dministration, " },
  { initial: "R", rest: "eporting, " },
  { initial: "T", rest: "racking & " },
  { initial: "A", rest: "pproval" },
]

/** Warna status bar browser mobile mengikuti latar halaman login. */
const PANEL_THEME_COLOR = "#f4f5f6"

function usePanelThemeColor() {
  React.useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]'
    )
    if (!meta) return

    const previous = meta.content
    meta.content = PANEL_THEME_COLOR
    return () => {
      meta.content = previous
    }
  }, [])
}

type PublicAuthShellProps = {
  children: React.ReactNode
  contentKey: string
}

/*
 * Halaman publik (login, lupa password) di atas latar putih keabuan.
 * - Desktop: identitas di kiri, form melayang (kaca putih) di kanan. Di
 *   belakang kaca ada denah toko samar agar efek kaca terlihat.
 * - Mobile: semua rata tengah; kartu kaca menimpa bagian bawah gambar.
 * Lapisan latar (AuthBackdrop) sengaja terpisah agar nanti bisa diganti
 * gambar lain tanpa mengubah tata letak.
 */
function PublicAuthShell({ children, contentKey }: PublicAuthShellProps) {
  usePanelThemeColor()

  return (
    <main className="relative min-h-svh overflow-x-hidden bg-panel text-panel-foreground">
      <FasciaStripe className="absolute inset-x-0 top-0 z-20" />
      <AuthBackdrop />

      {/* Mobile: header ringkas (label + judul) lalu form, tanpa gambar toko,
          agar seluruh form muat dalam satu layar tanpa scroll. */}
      <div className="relative mx-auto grid min-h-svh w-full max-w-7xl grid-cols-[minmax(0,1fr)] content-start gap-y-5 px-4 pt-7 pb-6 sm:gap-y-6 sm:px-8 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:content-center lg:items-center lg:gap-x-16 lg:gap-y-0 lg:px-12 lg:py-12 xl:gap-x-24">
        <section className="flex min-w-0 flex-col items-center gap-2 text-center sm:gap-4 lg:items-start lg:gap-8 lg:text-left">
          <p className="text-xs font-medium text-panel-foreground/70 sm:text-sm">
            Building, Maintenance & Energy
          </p>

          <h1 className="order-2 max-w-md font-heading text-lg leading-snug font-medium text-balance sm:max-w-xl sm:text-2xl lg:order-3 lg:max-w-xl lg:text-3xl xl:tall-desktop:text-4xl">
            {acronym.map((part, index) => (
              <React.Fragment key={index}>
                <span className="text-primary">{part.initial}</span>
                {part.rest}
              </React.Fragment>
            ))}
          </h1>

          {/* Wadah mengikuti rasio gambar agar bisa rata tengah (mobile) dan
              rata kiri (desktop) tanpa ruang kosong di sisinya. */}
          <div className="relative order-3 hidden aspect-[700/444] h-48 max-w-full sm:block lg:order-2 lg:h-[min(36vh,18rem)] xl:aspect-[944/444]">
            <StorefrontElevation
              animated
              className="absolute inset-0 size-full text-panel-foreground/80 xl:hidden"
            />
            <StorefrontElevation
              animated
              annotated
              className="absolute inset-0 hidden size-full text-panel-foreground/85 xl:block"
            />
          </div>

          <p className="order-4 hidden max-w-xl text-sm leading-6 text-panel-foreground/70 xl:text-base xl:leading-7 lg:tall-desktop:block">
            Digitalisasi proses bisnis departemen Building, Maintenance & Energy
            (BME). Melalui satu platform digital, sistem ini terintegrasi dan
            dirancang untuk menghubungkan seluruh proses kerja.
          </p>

          <ul
            aria-label="Modul SPARTA"
            className="order-5 hidden w-full grid-cols-6 gap-2 border-t border-panel-foreground/15 pt-6 lg:grid"
          >
            {appOrder.map((appId) => {
              const app = SPARTA_APPS[appId]

              return (
                <li
                  key={app.id}
                  className="flex min-w-0 flex-col items-center gap-2 text-center"
                >
                  <img
                    src={SPARTA_APP_LOGOS[appId]}
                    alt=""
                    className="size-9 shrink-0 object-contain xl:size-11"
                  />
                  <span className="text-[11px] leading-tight text-panel-foreground/80 xl:text-xs">
                    {app.name.replace(/^SPARTA\s+/, "")}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <div className="relative flex w-full flex-col items-center gap-5">
          <div className="auth-glass relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white bg-white/80 text-foreground shadow-[0_1px_2px_rgb(16_24_32/0.06),0_24px_64px_-24px_rgb(16_24_32/0.28)] ring-1 ring-black/5 backdrop-blur-2xl backdrop-saturate-150">
            <div className="px-6 pt-6 sm:pt-7">
              <Logo />
            </div>
            {/* Mobile, halaman login saja: deskripsi kartu disembunyikan agar
                form muat satu layar (halaman lain tetap butuh penjelasannya). */}
            <div
              key={contentKey}
              className={`animate-in duration-300 fade-in-0 ${contentKey === ROUTES.login ? "max-sm:[&_[data-slot=card-description]]:hidden" : ""} [&_[data-slot=card-title]]:text-xl sm:[&_[data-slot=card-title]]:text-2xl [&>[data-slot=card]]:bg-transparent [&>[data-slot=card]]:ring-0`}
            >
              {children}
            </div>
          </div>

          <footer className="relative z-10 flex w-full max-w-md flex-col items-center gap-1 text-center text-xs leading-5 text-panel-foreground/65 sm:flex-row sm:justify-between sm:px-6 sm:text-left">
            <span className="whitespace-nowrap">
              © 2026 PT Sumber Alfaria Trijaya, Tbk.
              <br />
              Internal Departemen BME
            </span>
            <Button variant="link" size="xs" className="text-auth-link" asChild>
              <a href={ROUTES.about}>
                Tentang SPARTA
                <ArrowRight data-icon="inline-end" />
              </a>
            </Button>
          </footer>
        </div>
      </div>
    </main>
  )
}

/**
 * Latar halaman: denah toko samar (memudar ke arah teks) dan bingkai lembar
 * gambar. Dekoratif; ganti isi komponen ini untuk latar lain tanpa mengubah
 * tata letak.
 */
function AuthBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Mobile: denah di belakang kartu (bawah). Desktop: di sisi kanan. */}
      <div className="absolute inset-x-0 top-[34%] bottom-0 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] lg:inset-y-0 lg:right-0 lg:left-[40%] lg:[mask-image:linear-gradient(to_right,transparent,black_35%)]">
        <StoreFloorPlan className="absolute top-1/2 left-1/2 aspect-[1200/760] h-[72%] w-auto max-w-none -translate-x-1/2 -translate-y-1/2 text-panel-foreground opacity-[0.09] lg:left-[54%] lg:h-[84%]" />
      </div>

      {/* Bingkai lembar gambar */}
      <div className="absolute inset-3 hidden border border-panel-foreground/10 lg:block xl:inset-5" />
    </div>
  )
}

export { PublicAuthShell }
