export const ROUTES = {
  login: "#/",
  modules: "#/modules",
  resetPassword: "#/reset-password",
  about: "#/tentang-sparta",
} as const

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES]

export function getCurrentRoute() {
  if (typeof window === "undefined") {
    return ROUTES.login
  }

  return (window.location.hash || ROUTES.login) as AppRoute
}

export function navigateTo(route: AppRoute) {
  window.location.hash = route
}
