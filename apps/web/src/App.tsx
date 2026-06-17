import * as React from "react"

import {
  getCurrentSpartaSession,
  logoutFromSparta,
  type SpartaSession,
} from "@/lib/sparta-auth"
import { PublicAuthShell } from "@/components/public-auth-shell"
import { ForgotPasswordPage } from "@/pages/forgot-password-page"
import { LoginPage } from "@/pages/login-page"
import { ModuleLauncherPage } from "@/pages/module-launcher-page"
import { PasswordResetPage } from "@/pages/password-reset-page"
import { AboutSpartaPage } from "@/pages/tentang-sparta-page"
import { TanyaArtaPage } from "@/pages/tanya-arta-page"
import { getCurrentRoute, navigateTo, ROUTES } from "@/routes"

export function App() {
  const [route, setRoute] = React.useState(getCurrentRoute)
  const [session, setSession] = React.useState<SpartaSession | null>(null)
  const [isSessionLoading, setIsSessionLoading] = React.useState(true)

  React.useEffect(() => {
    const handleHashChange = () => {
      setRoute(getCurrentRoute())
    }

    window.addEventListener("hashchange", handleHashChange)

    return () => {
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  React.useEffect(() => {
    let isMounted = true

    async function loadSession() {
      try {
        const nextSession = await getCurrentSpartaSession()

        if (isMounted) {
          setSession(nextSession)
        }
      } catch {
        if (isMounted) {
          setSession(null)
        }
      } finally {
        if (isMounted) {
          setIsSessionLoading(false)
        }
      }
    }

    void loadSession()

    return () => {
      isMounted = false
    }
  }, [])

  const handleAuthenticated = (nextSession: SpartaSession) => {
    setSession(nextSession)

    if (nextSession.mustChangePassword) {
      navigateTo(ROUTES.resetPassword)
      return
    }

    navigateTo(ROUTES.modules)
  }

  const handlePasswordChanged = (nextSession: SpartaSession) => {
    setSession(nextSession)
    navigateTo(ROUTES.modules)
  }

  const handleLogout = async () => {
    await logoutFromSparta().catch(() => undefined)
    setSession(null)
    navigateTo(ROUTES.login)
  }

  const handleForgotPasswordReset = () => {
    setSession(null)
    navigateTo(ROUTES.login)
  }

  if (route === ROUTES.about) {
    return <AboutSpartaPage session={session} onLogout={handleLogout} />
  }

  if (isSessionLoading && route !== ROUTES.forgotPassword) {
    return (
      <PublicAuthShell key="loading-session" contentKey="loading-session">
        <div className="text-center text-sm text-muted-foreground">
          Memuat sesi SPARTA...
        </div>
      </PublicAuthShell>
    )
  }

  if (route === ROUTES.forgotPassword || !session) {
    return (
      <PublicAuthShell key={route} contentKey={route}>
        {route === ROUTES.forgotPassword ? (
          <ForgotPasswordPage onPasswordReset={handleForgotPasswordReset} />
        ) : (
          <LoginPage onAuthenticated={handleAuthenticated} />
        )}
      </PublicAuthShell>
    )
  }

  if (session.mustChangePassword) {
    return (
      <PasswordResetPage
        session={session}
        onPasswordChanged={handlePasswordChanged}
        onLogout={handleLogout}
      />
    )
  }

  if (route === ROUTES.arta) {
    return <TanyaArtaPage session={session} onLogout={handleLogout} />
  }

  return <ModuleLauncherPage session={session} onLogout={handleLogout} />
}

export default App
