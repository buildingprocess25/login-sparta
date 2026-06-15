export const ROUTES = {
  login: "#/",
  modules: "#/modules",
  resetPassword: "#/reset-password",
  forgotPassword: "#/forgot-password",
  about: "#/tentang-sparta",
  arta: "#/tanya-arta",
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
