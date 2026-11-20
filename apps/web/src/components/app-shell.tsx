import * as React from "react"
import { ChevronDown, ChevronUp, KeyRound, LogOut, Mail } from "lucide-react"

import { ChangeEmailDialog } from "@/components/change-email-dialog"
import { ChangePasswordDialog } from "@/components/change-password-dialog"
import { Logo } from "@/components/logo"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { SpartaSession } from "@/lib/sparta-auth"
import { canManageMasterData } from "@/lib/sparta-master-admin"
import { canManageUsers } from "@/lib/sparta-user-admin"
import { cn } from "@/lib/utils"
import { getCurrentRoute, ROUTES } from "@/routes"

type AppShellProps = {
  children: React.ReactNode
  session?: SpartaSession | null
  onLogout?: () => void
  showHeader?: boolean
  /** Kunci tinggi halaman ke viewport; konten hanya scroll di layar yang terlalu pendek. */
  fitViewport?: boolean
  /** Lapisan latar dekoratif penuh layar di belakang konten. */
  backdrop?: React.ReactNode
  /** Warna latar permukaan utama halaman. */
  surface?: "default" | "panel"
}

const NAV_LINK_CLASS =
  "relative py-1 font-medium transition-colors hover:text-foreground focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"

/** Menu utama. Halaman admin hanya muncul untuk role yang boleh membukanya. */
function getNavItems(session: SpartaSession | null | undefined) {
  return [
    { href: ROUTES.modules, label: "Modul SPARTA" },
    { href: ROUTES.about, label: "Tentang SPARTA" },
    ...(canManageMasterData(session)
      ? [{ href: ROUTES.dataMaster, label: "Data Master" }]
      : []),
    ...(canManageUsers(session)
      ? [{ href: ROUTES.userManagement, label: "Manajemen User" }]
      : []),
  ]
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function AppShell({
  children,
  session,
  onLogout,
  showHeader,
  fitViewport = false,
  backdrop,
  surface = "default",
}: AppShellProps) {
  const [isMobileProfileMenuOpen, setIsMobileProfileMenuOpen] =
    React.useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false)
  const [isChangeEmailOpen, setIsChangeEmailOpen] = React.useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = React.useState(false)
  const [activeRoute, setActiveRoute] = React.useState(getCurrentRoute)
  const navItems = getNavItems(session)

  React.useEffect(() => {
    const handleHashChange = () => {
      setActiveRoute(getCurrentRoute())
    }

    window.addEventListener("hashchange", handleHashChange)

    return () => {
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  return (
    <main
      className={cn(
        "relative",
        surface === "panel"
          ? "bg-panel text-panel-foreground"
          : "bg-background text-foreground",
        // overflow-x-clip: latar selebar layar tidak memicu scroll samping
        // (berbeda dengan overflow-hidden, tidak memutus elemen sticky).
        fitViewport ? "h-svh overflow-hidden" : "min-h-svh overflow-x-clip"
      )}
    >
      {backdrop}
      <div
        className={cn(
          "relative z-10 mx-auto flex w-full max-w-7xl flex-col",
          fitViewport ? "h-svh" : "min-h-svh"
        )}
      >
        {session || showHeader ? (
          <header className="relative z-20 shrink-0 px-4 pt-3 sm:px-6 sm:pt-4 lg:px-10 lg:pt-5">
            {/* Kapsul navbar mengambang: putih solid di HP (ringan), frosted ringan di desktop */}
            <div className="rounded-2xl border border-foreground/10 bg-background px-3.5 py-2.5 shadow-[0_1px_2px_rgb(16_24_32/0.05),0_12px_32px_-16px_rgb(16_24_32/0.16)] lg:rounded-full lg:bg-background/85 lg:py-2 lg:pr-2.5 lg:pl-6 lg:backdrop-blur-md">
              {/* Mobile top row */}
              <div className="flex items-center justify-between gap-2 lg:hidden">
                <Logo />
                {session ? (
                  <DropdownMenu
                    open={isMobileProfileMenuOpen}
                    onOpenChange={setIsMobileProfileMenuOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="secondary"
                        size="icon"
                        className="size-11 rounded-full border border-foreground/8 bg-muted/80"
                        aria-label={`Profil ${session.fullName}`}
                      >
                        <span className="relative inline-flex shrink-0">
                          <Avatar size="sm">
                            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                              {getInitials(session.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            aria-hidden="true"
                            className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-background"
                          />
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64">
                      <DropdownMenuLabel>
                        <span className="flex items-center justify-between gap-2">
                          <span className="font-medium text-foreground">
                            {session.fullName}
                          </span>
                          <Badge>{session.branch}</Badge>
                        </span>
                        <span className="block">{session.email}</span>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          onSelect={() => {
                            setIsMobileProfileMenuOpen(false)
                            setIsChangePasswordOpen(true)
                          }}
                        >
                          <KeyRound />
                          Ganti Password
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setIsMobileProfileMenuOpen(false)
                            setIsChangeEmailOpen(true)
                          }}
                        >
                          <Mail />
                          Ganti Email
                        </DropdownMenuItem>
                        {onLogout ? (
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => {
                              setIsMobileProfileMenuOpen(false)
                              setIsLogoutConfirmOpen(true)
                            }}
                          >
                            <LogOut />
                            Logout
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </div>

              {/* Mobile nav: satu baris horizontal scrollable (tanpa orphan wrap & target sentuh >= 44px) */}
              <nav
                aria-label="Navigasi utama"
                className="mt-2.5 flex items-center gap-1 overflow-x-auto border-t border-border/70 pt-2 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden"
              >
                {navItems.map((item) => {
                  const isActive = activeRoute === item.href
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "inline-flex min-h-11 shrink-0 items-center rounded-full px-3 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        isActive
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </a>
                  )
                })}
              </nav>

              {/* Desktop floating pill bar: Logo | Centered dot-separated nav | Profile capsule */}
              <div className="hidden items-center justify-between gap-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
                <div className="flex items-center justify-start">
                  <Logo />
                </div>

                <nav
                  aria-label="Navigasi utama"
                  className="flex items-center justify-center gap-4"
                >
                  {navItems.map((item, index) => (
                    <React.Fragment key={item.href}>
                      {index > 0 ? (
                        <span
                          aria-hidden="true"
                          className="size-1.5 rounded-full bg-primary/80"
                        />
                      ) : null}
                      <a
                        href={item.href}
                        aria-current={
                          activeRoute === item.href ? "page" : undefined
                        }
                        className={cn(
                          NAV_LINK_CLASS,
                          "text-sm whitespace-nowrap",
                          activeRoute === item.href
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {item.label}
                      </a>
                    </React.Fragment>
                  ))}
                </nav>

                <div className="flex items-center justify-end">
                  {session ? (
                    <DropdownMenu
                      open={isProfileMenuOpen}
                      onOpenChange={setIsProfileMenuOpen}
                    >
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="secondary"
                          size="lg"
                          className="rounded-full border border-foreground/8 bg-muted/80 hover:bg-muted"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="flex flex-col items-end text-right leading-tight">
                              <span className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
                                {session.branch}
                              </span>
                              <span className="max-w-36 truncate text-xs font-semibold text-foreground">
                                {session.fullName}
                              </span>
                            </span>
                            <span className="relative inline-flex shrink-0">
                              <Avatar size="sm">
                                <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                                  {getInitials(session.fullName)}
                                </AvatarFallback>
                              </Avatar>
                              <span
                                aria-hidden="true"
                                className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
                              />
                            </span>
                            {isProfileMenuOpen ? (
                              <ChevronUp
                                data-icon="inline-end"
                                className="size-3.5 text-muted-foreground"
                              />
                            ) : (
                              <ChevronDown
                                data-icon="inline-end"
                                className="size-3.5 text-muted-foreground"
                              />
                            )}
                          </div>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64">
                        <DropdownMenuLabel>
                          <span className="flex items-center justify-between gap-2">
                            <span className="font-medium text-foreground">
                              {session.fullName}
                            </span>
                            <Badge>{session.branch}</Badge>
                          </span>
                          <span className="block">{session.email}</span>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem
                            onSelect={() => {
                              setIsProfileMenuOpen(false)
                              setIsChangePasswordOpen(true)
                            }}
                          >
                            <KeyRound />
                            Ganti Password
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={() => {
                              setIsProfileMenuOpen(false)
                              setIsChangeEmailOpen(true)
                            }}
                          >
                            <Mail />
                            Ganti Email
                          </DropdownMenuItem>
                          {onLogout ? (
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => {
                                setIsProfileMenuOpen(false)
                                setIsLogoutConfirmOpen(true)
                              }}
                            >
                              <LogOut />
                              Logout
                            </DropdownMenuItem>
                          ) : null}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              </div>
            </div>

            {session ? (
              <ChangePasswordDialog
                open={isChangePasswordOpen}
                onOpenChange={setIsChangePasswordOpen}
                session={session}
              />
            ) : null}
            {session ? (
              <ChangeEmailDialog
                open={isChangeEmailOpen}
                onOpenChange={setIsChangeEmailOpen}
                session={session}
              />
            ) : null}
            {session && onLogout ? (
              <AlertDialog
                open={isLogoutConfirmOpen}
                onOpenChange={setIsLogoutConfirmOpen}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Keluar dari SPARTA?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Sesi Anda akan diakhiri dari portal SPARTA. Anda perlu
                      login kembali untuk membuka modul.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction variant="destructive" onClick={onLogout}>
                      <LogOut data-icon="inline-start" />
                      Keluar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : null}
          </header>
        ) : null}
        <div
          className={cn(
            "flex flex-1 flex-col",
            fitViewport
              ? "min-h-0 overflow-y-auto p-4 sm:p-6 lg:px-10 lg:py-8"
              : "p-4 sm:p-8 lg:p-10"
          )}
        >
          {children}
        </div>
      </div>
    </main>
  )
}

export { AppShell }
