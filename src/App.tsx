import * as React from "react"

import type { SpartaSession } from "@/lib/sparta-auth"
import {
  clearSpartaSession,
  getSpartaSession,
  saveSpartaSession,
} from "@/lib/sparta-session"
import { LoginPage } from "@/pages/login-page"
import { ModuleLauncherPage } from "@/pages/module-launcher-page"
import { PasswordResetPage } from "@/pages/password-reset-page"
import { AboutSpartaPage } from "@/pages/tentang-sparta-page"
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

  if (route === ROUTES.about) {
    return <AboutSpartaPage session={session} onLogout={handleLogout} />
  }

  if (!session) {
    return <LoginPage onAuthenticated={handleAuthenticated} />
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

  return <ModuleLauncherPage session={session} onLogout={handleLogout} />
}

export default App
