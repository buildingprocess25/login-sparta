import * as React from "react"

import type { SpartaSession } from "@/lib/sparta-auth"
import {
  clearSpartaSession,
  getSpartaSession,
  saveSpartaSession,
} from "@/lib/sparta-session"
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
  const [session, setSession] = React.useState<SpartaSession | null>(() =>
    getSpartaSession()
  )

  React.useEffect(() => {
    const handleHashChange = () => {
      setRoute(getCurrentRoute())
      setSession(getSpartaSession())
    }

    window.addEventListener("hashchange", handleHashChange)

    return () => {
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  const handleAuthenticated = (nextSession: SpartaSession) => {
    saveSpartaSession(nextSession)
    setSession(nextSession)

    if (nextSession.mustChangePassword) {
      navigateTo(ROUTES.resetPassword)
      return
    }

    navigateTo(ROUTES.modules)
  }

  const handlePasswordChanged = (nextSession: SpartaSession) => {
    saveSpartaSession(nextSession)
    setSession(nextSession)
    navigateTo(ROUTES.modules)
  }

  const handleLogout = () => {
    clearSpartaSession()
    setSession(null)
    navigateTo(ROUTES.login)
  }

  const handleForgotPasswordReset = () => {
    clearSpartaSession()
    setSession(null)
    navigateTo(ROUTES.login)
  }

  if (route === ROUTES.about) {
    return <AboutSpartaPage session={session} onLogout={handleLogout} />
  }

  if (route === ROUTES.forgotPassword || !session) {
    return (
      <PublicAuthShell contentKey={route}>
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
