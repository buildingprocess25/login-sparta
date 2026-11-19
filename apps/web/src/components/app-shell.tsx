import * as React from "react"
import { ChevronDown, ChevronUp, KeyRound, LogOut, Mail } from "lucide-react"

import { ChangePasswordDialog } from "@/components/change-password-dialog"
import { ChangeEmailDialog } from "@/components/change-email-dialog"
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
import { cn } from "@/lib/utils"
import { getCurrentRoute, ROUTES } from "@/routes"

type AppShellProps = {
  children: React.ReactNode
  session?: SpartaSession | null
  onLogout?: () => void
  showHeader?: boolean
  /** Kunci tinggi halaman ke viewport; konten hanya scroll di layar yang terlalu pendek. */
  fitViewport?: boolean
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
}: AppShellProps) {
  const [isMobileProfileMenuOpen, setIsMobileProfileMenuOpen] =
    React.useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false)
  const [isChangeEmailOpen, setIsChangeEmailOpen] = React.useState(false)
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = React.useState(false)
  const [activeRoute, setActiveRoute] = React.useState(getCurrentRoute)

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
        "bg-background text-foreground",
        // overflow-x-clip: latar selebar layar tidak memicu scroll samping
        // (berbeda dengan overflow-hidden, tidak memutus elemen sticky).
        fitViewport ? "h-svh overflow-hidden" : "min-h-svh overflow-x-clip"
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-7xl flex-col",
          fitViewport ? "h-svh" : "min-h-svh"
        )}
      >
        {session || showHeader ? (
          <header className="shrink-0 border-b px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-center justify-between lg:hidden">
              <Logo />
              {session ? (
                <DropdownMenu
                  open={isMobileProfileMenuOpen}
                  onOpenChange={setIsMobileProfileMenuOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="size-10 p-0"
                      aria-label={`Profil ${session.fullName}`}
                    >
                      <Avatar className="size-8">
                        <AvatarFallback>
                          {getInitials(session.fullName)}
                        </AvatarFallback>
                      </Avatar>
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
            <nav className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-3 lg:hidden">
              <a
                href={ROUTES.modules}
                aria-current={
                  activeRoute === ROUTES.modules ? "page" : undefined
                }
                className={cn(
                  "relative py-1 text-xs font-medium whitespace-nowrap transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-[width] after:duration-500 after:ease-out hover:text-foreground hover:after:w-full focus-visible:outline-none focus-visible:after:w-full sm:text-sm",
                  activeRoute === ROUTES.modules
                    ? "text-foreground after:w-full"
                    : "text-muted-foreground"
                )}
              >
                Modul SPARTA
              </a>
              <a
                href={ROUTES.about}
                aria-current={activeRoute === ROUTES.about ? "page" : undefined}
                className={cn(
                  "relative py-1 text-xs font-medium whitespace-nowrap transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-[width] after:duration-500 after:ease-out hover:text-foreground hover:after:w-full focus-visible:outline-none focus-visible:after:w-full sm:text-sm",
                  activeRoute === ROUTES.about
                    ? "text-foreground after:w-full"
                    : "text-muted-foreground"
                )}
              >
                Tentang SPARTA
              </a>
              {canManageMasterData(session) ? (
                <a
                  href={ROUTES.dataMaster}
                  aria-current={
                    activeRoute === ROUTES.dataMaster ? "page" : undefined
                  }
                  className={cn(
                    "relative py-1 text-xs font-medium whitespace-nowrap transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-[width] after:duration-500 after:ease-out hover:text-foreground hover:after:w-full focus-visible:outline-none focus-visible:after:w-full sm:text-sm",
                    activeRoute === ROUTES.dataMaster
                      ? "text-foreground after:w-full"
                      : "text-muted-foreground"
                  )}
                >
                  Data Master
                </a>
              ) : null}
            </nav>
            <div className="hidden items-center justify-between gap-4 lg:flex">
              <Logo />
              <nav className="flex items-center gap-5">
                <a
                  href={ROUTES.modules}
                  aria-current={
                    activeRoute === ROUTES.modules ? "page" : undefined
                  }
                  className={cn(
                    "relative py-1 text-sm font-medium transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-[width] after:duration-500 after:ease-out hover:text-foreground hover:after:w-full focus-visible:outline-none focus-visible:after:w-full",
                    activeRoute === ROUTES.modules
                      ? "text-foreground after:w-full"
                      : "text-muted-foreground"
                  )}
                >
                  Modul SPARTA
                </a>
                <a
                  href={ROUTES.about}
                  aria-current={
                    activeRoute === ROUTES.about ? "page" : undefined
                  }
                  className={cn(
                    "relative py-1 text-sm font-medium transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-[width] after:duration-500 after:ease-out hover:text-foreground hover:after:w-full focus-visible:outline-none focus-visible:after:w-full",
                    activeRoute === ROUTES.about
                      ? "text-foreground after:w-full"
                      : "text-muted-foreground"
                  )}
                >
                  Tentang SPARTA
                </a>
                {canManageMasterData(session) ? (
                  <a
                    href={ROUTES.dataMaster}
                    aria-current={
                      activeRoute === ROUTES.dataMaster ? "page" : undefined
                    }
                    className={cn(
                      "relative py-1 text-sm font-medium transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-[width] after:duration-500 after:ease-out hover:text-foreground hover:after:w-full focus-visible:outline-none focus-visible:after:w-full",
                      activeRoute === ROUTES.dataMaster
                        ? "text-foreground after:w-full"
                        : "text-muted-foreground"
                    )}
                  >
                    Data Master
                  </a>
                ) : null}
                {session ? (
                  <DropdownMenu
                    open={isProfileMenuOpen}
                    onOpenChange={setIsProfileMenuOpen}
                  >
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost">
                        <Avatar size="sm">
                          <AvatarFallback>
                            {getInitials(session.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{session.fullName}</span>
                        {isProfileMenuOpen ? (
                          <ChevronUp data-icon="inline-end" />
                        ) : (
                          <ChevronDown data-icon="inline-end" />
                        )}
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
              </nav>
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
