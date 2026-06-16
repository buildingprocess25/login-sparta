/* eslint-disable react-refresh/only-export-components */
import * as React from "react"

type ThemeProviderProps = {
  children: React.ReactNode
}

type ThemeProviderState = {
  theme: "light"
  setTheme: (theme: "light") => void
}

const ThemeProviderContext = React.createContext<
  ThemeProviderState | undefined
>(undefined)

function applyLightTheme() {
  const root = document.documentElement

  root.classList.remove("dark")
  root.classList.add("light")
  root.style.colorScheme = "light"
  localStorage.removeItem("theme")
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  React.useEffect(() => {
    applyLightTheme()
  }, [])

  const value = React.useMemo<ThemeProviderState>(
    () => ({
      theme: "light",
      setTheme: () => {
        applyLightTheme()
      },
    }),
    []
  )

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = React.useContext(ThemeProviderContext)

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
