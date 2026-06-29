import { describe, expect, it } from "vitest"

import { getDefaultRoute, ROUTES } from "@/routes"

describe("routes", () => {
  it("uses modules as the default route when SSO is disabled", () => {
    expect(getDefaultRoute(false)).toBe(ROUTES.modules)
  })

  it("uses login as the default route when SSO is enabled", () => {
    expect(getDefaultRoute(true)).toBe(ROUTES.login)
  })
})
