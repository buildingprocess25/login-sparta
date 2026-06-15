import type * as React from "react"
import { ArrowRight } from "lucide-react"

import { Logo } from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import { SPARTA_APPS, type SpartaAppId } from "@/lib/sparta-auth"
import { SPARTA_APP_LOGOS } from "@/lib/sparta-assets"
import { ROUTES } from "@/routes"

const appOrder: SpartaAppId[] = ["building", "maintenance", "energy"]

type PublicAuthShellProps = {
  children: React.ReactNode
  contentKey: string
}

function PublicAuthShell({ children, contentKey }: PublicAuthShellProps) {
  return (
    <main className="h-svh overflow-hidden bg-background text-foreground">
      <div className="mx-auto grid h-svh w-full max-w-7xl grid-cols-1 overflow-hidden lg:grid-cols-[0.95fr_1.05fr]">
        <section className="flex min-h-0 flex-col overflow-hidden border-b bg-muted/30 lg:border-r lg:border-b-0">
          <div className="flex min-h-0 flex-1 items-center p-5 sm:p-8 lg:p-10">
            <div className="flex w-full flex-col gap-8">
              <Logo />

              <div className="flex max-w-xl flex-col gap-5">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    Building Maintenance Energy System
                  </Badge>
                </div>
                <div className="flex flex-col gap-6">
                  <h1 className="font-heading text-3xl font-medium tracking-normal text-balance sm:text-4xl lg:text-5xl">
                    <span className="font-medium text-primary">S</span>ystem for{" "}
                    <span className="font-medium text-primary">P</span>
                    roperty <span className="font-medium text-primary">A</span>
                    dministration,{" "}
                    <span className="font-medium text-primary">R</span>
                    eporting,{" "}
                    <span className="font-medium text-primary">T</span>racking &{" "}
                    <span className="font-medium text-primary">A</span>
                    pproval
                  </h1>
                  <p className="max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
                    Digitalisasi proses bisnis departemen Building, Maintenance
                    & Energy (BME). Melalui satu platform digital, sistem ini
                    terintegrasi dan dirancang untuk menghubungkan seluruh
                    proses kerja.
                  </p>
                  <Badge className="rounded-none p-0" variant="link" asChild>
                    <a href={ROUTES.about}>
                      Tentang SPARTA
                      <ArrowRight data-icon="inline-end" />
                    </a>
                  </Badge>
                </div>
              </div>

              <div className="grid shrink-0 border-t sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {appOrder.map((appId) => {
                  const app = SPARTA_APPS[appId]

                  return (
                    <div
                      key={app.id}
                      className="flex min-w-0 flex-col items-center justify-center gap-2 border-b p-3 text-center last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0 lg:border-r-0 lg:border-b lg:last:border-b-0 xl:border-r xl:border-b-0 xl:last:border-r-0"
                    >
                      <img
                        src={SPARTA_APP_LOGOS[appId]}
                        alt=""
                        className="size-15 shrink-0 object-contain"
                      />
                      <span className="text-xs leading-tight font-medium whitespace-nowrap">
                        {app.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-0 items-center justify-center overflow-hidden p-4 sm:p-6 lg:p-8">
          <div
            key={contentKey}
            className="w-full max-w-xl animate-in duration-300 fade-in-0 slide-in-from-right-2"
          >
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}

export { PublicAuthShell }
