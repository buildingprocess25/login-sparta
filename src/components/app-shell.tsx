import * as React from "react"
import { ChevronDown, ChevronUp, KeyRound, LogOut } from "lucide-react"

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
import { cn } from "@/lib/utils"
import { getCurrentRoute, ROUTES } from "@/routes"

type AppShellProps = {
  children: React.ReactNode
  session?: SpartaSession | null
  onLogout?: () => void
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

function AppShell({ children, session, onLogout }: AppShellProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false)
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
    <main className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col">
        {session ? (
          <header className="flex items-center justify-between gap-4 border-b p-5 sm:p-6">
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
                aria-current={activeRoute === ROUTES.about ? "page" : undefined}
                className={cn(
                  "relative py-1 text-sm font-medium transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-[width] after:duration-500 after:ease-out hover:text-foreground hover:after:w-full focus-visible:outline-none focus-visible:after:w-full",
                  activeRoute === ROUTES.about
                    ? "text-foreground after:w-full"
                    : "text-muted-foreground"
                )}
              >
                Tentang SPARTA
              </a>
              <a
                href={ROUTES.arta}
                aria-current={activeRoute === ROUTES.arta ? "page" : undefined}
                className={cn(
                  "relative py-1 text-sm font-medium transition-colors after:absolute after:bottom-[-2px] after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-[width] after:duration-500 after:ease-out hover:text-foreground hover:after:w-full focus-visible:outline-none focus-visible:after:w-full",
                  activeRoute === ROUTES.arta
                    ? "text-foreground after:w-full"
                    : "text-muted-foreground"
                )}
              >
                Tanya ARTA
              </a>
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
            </nav>
            <ChangePasswordDialog
              open={isChangePasswordOpen}
              onOpenChange={setIsChangePasswordOpen}
              session={session}
            />
            {onLogout ? (
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
        <div className="flex flex-1 flex-col p-5 sm:p-8 lg:p-10">
          {children}
        </div>
      </div>
    </main>
  )
}

export { AppShell }
