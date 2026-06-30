import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  apiFetch,
  getModuleLoginUrl,
  isSpartaSsoEnabled,
  launchSpartaModule,
  loginToSparta,
  SPARTA_APPS,
} from "@/lib/sparta-auth"

const fetchMock = vi.fn()

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
    ...init,
  })
}

describe("SPARTA API client", () => {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it("sends credentialed requests to the API", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: { ok: true } }))

    await apiFetch("/v1/auth/logout", {
      method: "POST",
    })

    expect(fetchMock).toHaveBeenCalledWith(
      "/v1/auth/logout",
      expect.objectContaining({
        credentials: "include",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
        }),
        method: "POST",
      })
    )
  })

  it("uses backend error messages", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          error: {
            code: "INVALID_AUTH",
            message: "Email atau password SPARTA tidak sesuai.",
          },
        },
        { status: 401 }
      )
    )

    await expect(apiFetch("/v1/auth/me")).rejects.toThrow(
      "Email atau password SPARTA tidak sesuai."
    )
  })

  it("logs in through the backend auth endpoint", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          session: {
            email: "andi.halim@sparta.local",
            fullName: "Andi Halim",
            branch: "Jakarta Pusat",
            access: ["building", "maintenance"],
            mustChangePassword: true,
          },
        },
      })
    )

    const result = await loginToSparta({
      email: "andi.halim@sparta.local",
      password: "JAKARTA PUSAT",
    })

    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      "/v1/auth/login",
      expect.objectContaining({
        body: JSON.stringify({
          email: "andi.halim@sparta.local",
          password: "JAKARTA PUSAT",
        }),
        credentials: "include",
        method: "POST",
      })
    )
  })

  it("requests a module launch URL from the backend", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        data: {
          moduleId: "building",
          redirectUrl: "https://building.sparta.test/sso?token=abc",
          expiresAt: "2026-06-17T00:10:00.000Z",
        },
      })
    )

    await expect(launchSpartaModule("building")).resolves.toMatchObject({
      moduleId: "building",
      redirectUrl: "https://building.sparta.test/sso?token=abc",
    })
    expect(fetchMock).toHaveBeenCalledWith(
      "/v1/modules/building/launch",
      expect.objectContaining({
        credentials: "include",
        method: "POST",
      })
    )
  })

  it("keeps SSO enabled unless explicitly disabled", () => {
    expect(isSpartaSsoEnabled()).toBe(true)

    vi.stubEnv("VITE_SPARTA_SSO_ENABLED", "false")

    expect(isSpartaSsoEnabled()).toBe(false)
  })

  it("reads direct module login URLs from frontend env", () => {
    vi.stubEnv(
      "VITE_SPARTA_BUILDING_LOGIN_URL",
      "https://building.sparta.test/login"
    )

    expect(getModuleLoginUrl("building")).toBe(
      "https://building.sparta.test/login"
    )
  })

  it("keeps Engineering as a coming soon module", () => {
    expect(SPARTA_APPS.engineering).toMatchObject({
      name: "SPARTA Engineering",
      description: "COMING SOON",
      hasAccess: false,
    })
  })
})
