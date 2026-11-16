import * as React from "react"
import { ArrowUpRight, Loader2, Lock } from "lucide-react"
import { toast } from "sonner"

import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  getAccessibleApps,
  getModuleLoginUrl,
  isSpartaSsoEnabled,
  launchSpartaModule,
  SPARTA_APPS,
  type SpartaApp,
  type SpartaAppId,
  type SpartaSession,
} from "@/lib/sparta-auth"
import { SPARTA_APP_LOGOS } from "@/lib/sparta-assets"
import { cn } from "@/lib/utils"

const appOrder: SpartaAppId[] = [
  "building",
  "maintenance",
  "energy",
  "siaga",
  "carbontrack",
  "engineering",
]

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
  siaga: {
    "--primary": "#123B6D",
    "--ring": "#123B6D",
  },
  carbontrack: {
    "--primary": "#902830",
    "--ring": "#902830",
  },
  engineering: {
    "--primary": "#808080",
    "--ring": "#808080",
  },
} satisfies Record<SpartaAppId, ModuleThemeStyle>

type ModuleLauncherPageProps = {
  session: SpartaSession | null
  onLogout?: () => void
}

function getFallbackApps(session: SpartaSession | null) {
  return appOrder.map((appId) => ({
    ...SPARTA_APPS[appId],
    hasAccess:
      appId !== "engineering" &&
      (session ? session.access.includes(appId) : true),
  }))
}

function ModuleLauncherPage({ session, onLogout }: ModuleLauncherPageProps) {
  const ssoEnabled = isSpartaSsoEnabled()
  const [apps, setApps] = React.useState<SpartaApp[]>(() =>
    getFallbackApps(session)
  )
  const [launchingAppId, setLaunchingAppId] =
    React.useState<SpartaAppId | null>(null)

  React.useEffect(() => {
    if (!ssoEnabled) {
      return
    }

    let isMounted = true

    async function loadApps() {
      try {
        const nextApps = await getAccessibleApps()

        if (isMounted) {
          const loadedAppsById = new Map(nextApps.map((app) => [app.id, app]))

          setApps(
            getFallbackApps(session).map(
              (app) => loadedAppsById.get(app.id) ?? app
            )
          )
        }
      } catch (error) {
        if (error instanceof Error) {
          toast.error("Modul SPARTA belum bisa dimuat", {
            description: error.message,
          })
        }
      }
    }

    void loadApps()

    return () => {
      isMounted = false
    }
  }, [session, ssoEnabled])

  const handleLaunchModule = async (appId: SpartaAppId) => {
    if (appId === "engineering") {
      return
    }

    if (!ssoEnabled) {
      window.location.assign(getModuleLoginUrl(appId))
      return
    }

    setLaunchingAppId(appId)

    try {
      const launch = await launchSpartaModule(appId)

      window.location.assign(launch.redirectUrl)
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Modul SPARTA belum bisa dibuka", {
          description: error.message,
        })
      }
      setLaunchingAppId(null)
    }
  }

  return (
    <AppShell
      session={session}
      onLogout={onLogout}
      showHeader={!ssoEnabled}
      fitViewport
    >
      <section className="flex flex-1 flex-col justify-center gap-5 lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-12">
        <div className="flex animate-in flex-col gap-2 text-center duration-500 fill-mode-both fade-in slide-in-from-bottom-2 motion-reduce:animate-none sm:gap-3 sm:text-left">
          <h1 className="mx-auto max-w-md font-heading text-2xl font-medium text-balance sm:mx-0 sm:text-3xl lg:text-5xl">
            Pilih modul SPARTA anda.
          </h1>
          <p className="mx-auto max-w-sm text-xs leading-5 text-muted-foreground sm:mx-0 sm:text-sm sm:leading-6">
            {ssoEnabled
              ? "Buka modul Building, Maintenance, Energy, SIAGA, atau Carbontrack sesuai akses yang terhubung dengan akun internal Anda."
              : "Pilih modul SPARTA untuk menuju halaman login aplikasi terkait."}
          </p>
        </div>

        <ItemGroup>
          {apps.map((app, index) => {
            const isEngineering = app.id === "engineering"
            const hasAccess = isEngineering ? false : app.hasAccess
            const isLaunching = launchingAppId === app.id
            const itemStyle = {
              ...moduleThemeStyles[app.id],
              // Durasi animasi masuk di-inline karena kelas duration-* juga
              // dipakai untuk transisi hover dan akan saling menimpa.
              animationDuration: "500ms",
              animationDelay: `${100 + index * 60}ms`,
            }
            const itemAnimation =
              "animate-in fill-mode-both fade-in slide-in-from-bottom-2 motion-reduce:animate-none"
            const content = (
              <>
                <ItemMedia>
                  <img
                    src={SPARTA_APP_LOGOS[app.id]}
                    alt=""
                    className="size-10 object-contain transition-transform duration-200 ease-out group-hover/item:scale-105 sm:size-12 sm:tall:size-14"
                  />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle className="font-semibold sm:tall:text-base">
                    {app.name}
                  </ItemTitle>
                  <ItemDescription className="line-clamp-1 text-xs sm:text-sm">
                    {isLaunching
                      ? "Menyiapkan akses SSO..."
                      : isEngineering
                        ? "Modul ini sedang dalam pengembangan."
                        : app.description}
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  {isEngineering ? (
                    <Badge variant="secondary">Segera hadir</Badge>
                  ) : !hasAccess ? (
                    <Badge variant="outline">
                      <Lock data-icon="inline-start" />
                      Tanpa akses
                    </Badge>
                  ) : isLaunching ? (
                    <Loader2 className="size-5 animate-spin text-primary" />
                  ) : (
                    <ArrowUpRight className="size-5 text-primary transition-transform duration-200 ease-out group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5" />
                  )}
                </ItemActions>
              </>
            )

            return hasAccess ? (
              <Item
                key={app.id}
                asChild
                variant="outline"
                role="listitem"
                className={cn(
                  itemAnimation,
                  "cursor-pointer bg-primary/5 text-left transition duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:shadow-md hover:shadow-primary/10 active:translate-y-0 active:shadow-none disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                )}
                style={itemStyle}
              >
                <button
                  type="button"
                  disabled={Boolean(launchingAppId)}
                  onClick={() => {
                    void handleLaunchModule(app.id)
                  }}
                >
                  {content}
                </button>
              </Item>
            ) : (
              <Item
                key={app.id}
                variant="outline"
                role="listitem"
                aria-disabled="true"
                className={cn(itemAnimation, "bg-primary/5 opacity-50")}
                style={itemStyle}
              >
                {content}
              </Item>
            )
          })}
        </ItemGroup>
      </section>
    </AppShell>
  )
}

export { ModuleLauncherPage }
