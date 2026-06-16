import * as React from "react"
import { ArrowRight } from "lucide-react"

import { Logo } from "@/components/logo"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SPARTA_APPS, type SpartaAppId } from "@/lib/sparta-auth"
import { SPARTA_APP_LOGOS } from "@/lib/sparta-assets"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/routes"

const appOrder: SpartaAppId[] = ["building", "maintenance", "energy"]

type PublicAuthShellProps = {
  children: React.ReactNode
  contentKey: string
}

function PublicAuthShell({ children, contentKey }: PublicAuthShellProps) {
  const isLoginRoute = contentKey === ROUTES.login
  const [isMobileLoginFormOpen, setIsMobileLoginFormOpen] =
    React.useState(false)

  const shouldShowMobileForm = !isLoginRoute || isMobileLoginFormOpen

  return (
    <main className="min-h-svh overflow-x-hidden bg-background text-foreground">
      <div className="mx-auto grid min-h-svh w-full max-w-7xl grid-cols-1 lg:h-svh lg:grid-cols-[0.95fr_1.05fr] lg:overflow-hidden">
        <section
          className={cn(
            "border-b bg-muted/30 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden lg:border-r lg:border-b-0",
            isLoginRoute &&
              !isMobileLoginFormOpen &&
              "flex min-h-svh items-center border-b-0",
            shouldShowMobileForm && "hidden lg:flex"
          )}
        >
          <div
            className={cn(
              "flex items-center p-5 sm:p-8 lg:min-h-0 lg:flex-1 lg:p-10",
              isLoginRoute && !isMobileLoginFormOpen && "flex-1 justify-center"
            )}
          >
            <div className="flex w-full flex-col gap-6 text-center sm:gap-8 lg:text-left">
              <Logo className="justify-center lg:justify-start" />

              <div className="mx-auto flex max-w-xl flex-col items-center gap-4 sm:gap-5 lg:mx-0 lg:items-start">
                <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
                  <Badge variant="outline">
                    Building Maintenance Energy System
                  </Badge>
                </div>
                <div className="flex flex-col gap-4 sm:gap-6">
                  <h1 className="font-heading text-4xl font-medium tracking-normal text-balance lg:text-5xl">
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
                  <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base lg:max-w-lg">
                    Digitalisasi proses bisnis departemen Building, Maintenance
                    & Energy (BME). Melalui satu platform digital, sistem ini
                    terintegrasi dan dirancang untuk menghubungkan seluruh
                    proses kerja.
                  </p>
                  <div className="flex flex-col items-center gap-3 lg:items-start">
                    {isLoginRoute ? (
                      <Button
                        type="button"
                        className="w-full max-w-xl lg:hidden"
                        onClick={() => {
                          setIsMobileLoginFormOpen(true)
                        }}
                      >
                        Masuk ke SPARTA
                        <ArrowRight data-icon="inline-end" />
                      </Button>
                    ) : null}
                    <Badge className="rounded-none p-0" variant="link" asChild>
                      <a href={ROUTES.about}>
                        Tentang SPARTA
                        <ArrowRight data-icon="inline-end" />
                      </a>
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="hidden shrink-0 border-t lg:grid lg:grid-cols-1 xl:grid-cols-3">
                {appOrder.map((appId) => {
                  const app = SPARTA_APPS[appId]

                  return (
                    <div
                      key={app.id}
                      className="flex min-w-0 flex-col items-center justify-center gap-2 border-r p-2 text-center last:border-r-0 sm:p-3 lg:border-r-0 lg:border-b lg:last:border-b-0 xl:border-r xl:border-b-0 xl:last:border-r-0"
                    >
                      <img
                        src={SPARTA_APP_LOGOS[appId]}
                        alt=""
                        className="size-10 shrink-0 object-contain sm:size-15 lg:size-12 xl:size-15"
                      />
                      <span className="text-[10px] leading-tight font-medium break-words sm:text-xs lg:whitespace-nowrap xl:whitespace-normal">
                        {app.name}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          className={cn(
            "items-center justify-center p-4 sm:p-6 lg:flex lg:min-h-0 lg:overflow-hidden lg:p-8",
            shouldShowMobileForm ? "flex min-h-svh lg:min-h-0" : "hidden"
          )}
        >
          <div
            key={`${contentKey}-${shouldShowMobileForm}`}
            className="w-full max-w-xl animate-in duration-500 fade-in-0 slide-in-from-right-8 lg:slide-in-from-right-2"
          >
            {children}
          </div>
        </section>
      </div>
    </main>
  )
}

export { PublicAuthShell }
