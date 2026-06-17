import type * as React from "react"
import { ArrowUpRight } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import {
  SPARTA_APPS,
  type SpartaAppId,
  type SpartaSession,
} from "@/lib/sparta-auth"
import { SPARTA_APP_LOGOS } from "@/lib/sparta-assets"

const appOrder: SpartaAppId[] = ["building", "maintenance", "energy"]

type ModuleThemeStyle = React.CSSProperties & {
  "--primary": string
  "--ring": string
}

const moduleThemeStyles = {
  building: {
    "--primary": "#e6000b",
    "--ring": "#e6000b",
  },
  maintenance: {
    "--primary": "#0069a7",
    "--ring": "#0069a7",
  },
  energy: {
    "--primary": "#007a55",
    "--ring": "#007a55",
  },
} satisfies Record<SpartaAppId, ModuleThemeStyle>

type ModuleLauncherPageProps = {
  session: SpartaSession
  onLogout: () => void
}

function ModuleLauncherPage({ session, onLogout }: ModuleLauncherPageProps) {
  return (
    <AppShell session={session} onLogout={onLogout}>
      <section className="flex flex-1 flex-col justify-center gap-5 lg:grid lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-8">
        <div className="flex flex-col gap-4 text-center sm:text-left">
          <div className="flex flex-col gap-3">
            <h1 className="mx-auto max-w-md font-heading text-2xl font-medium text-balance sm:mx-0 sm:text-3xl md:text-5xl">
              Pilih modul SPARTA anda.
            </h1>
            <p className="mx-auto max-w-sm text-xs leading-5 text-muted-foreground sm:mx-0 sm:text-sm sm:leading-6">
              Buka modul Building, Maintenance, atau Energy sesuai akses yang
              terhubung dengan akun internal Anda.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {appOrder.map((appId) => {
            const app = SPARTA_APPS[appId]
            const hasAccess = session.access.includes(appId)
            const tile = (
              <Card
                className="relative min-h-[132px] overflow-hidden rounded-lg bg-primary/10 p-0 transition-colors group-hover:bg-primary group-hover:ring-primary/40 sm:aspect-16/11 sm:min-h-0"
                style={moduleThemeStyles[appId]}
              >
                <img
                  src={SPARTA_APP_LOGOS[appId]}
                  alt=""
                  className="absolute top-1/2 left-4 size-14 -translate-y-1/2 object-contain sm:top-[40%] sm:left-1/2 sm:size-20 sm:-translate-x-1/2 md:size-24"
                />
                <CardContent className="absolute inset-y-0 right-0 left-24 flex flex-col justify-center p-3 sm:inset-0 sm:justify-end">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-semibold text-foreground transition-colors group-hover:text-white">
                      {app.name}
                    </div>
                    <div className="line-clamp-2 text-xs leading-4 text-muted-foreground transition-colors group-hover:text-white/80 sm:leading-5">
                      {hasAccess
                        ? app.description
                        : "Anda tidak memiliki akses ke modul ini."}
                    </div>
                  </div>
                </CardContent>
                <ArrowUpRight className="absolute top-4 right-4 text-primary transition-colors group-hover:text-white" />
              </Card>
            )

            return hasAccess ? (
              <a
                key={app.id}
                href={app.url}
                className="group block overflow-hidden rounded-lg"
              >
                {tile}
              </a>
            ) : (
              <div
                key={app.id}
                className="block overflow-hidden rounded-lg opacity-45"
                aria-disabled="true"
              >
                {tile}
              </div>
            )
          })}
        </div>
      </section>
    </AppShell>
  )
}

export { ModuleLauncherPage }
