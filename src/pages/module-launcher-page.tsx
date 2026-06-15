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
      <section className="grid flex-1 gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <h1 className="max-w-md font-heading text-3xl font-medium text-balance md:text-5xl">
              Pilih modul SPARTA anda.
            </h1>
            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
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
                className="relative aspect-16/11 overflow-hidden rounded-lg bg-primary/10 p-0 transition-colors group-hover:bg-primary group-hover:ring-primary/40"
                style={moduleThemeStyles[appId]}
              >
                <img
                  src={SPARTA_APP_LOGOS[appId]}
                  alt=""
                  className="absolute top-[40%] left-1/2 size-20 -translate-x-1/2 -translate-y-1/2 object-contain md:size-24"
                />
                <CardContent className="absolute inset-0 flex flex-col justify-end p-3">
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-semibold text-foreground transition-colors group-hover:text-white">
                      {app.name}
                    </div>
                    <div className="text-xs leading-5 text-muted-foreground transition-colors group-hover:text-white/80">
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
