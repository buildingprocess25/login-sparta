import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  clearSpartaSession,
  getSpartaSession,
  saveSpartaSession,
} from "./sparta-session"

describe("SPARTA session storage", () => {
  beforeEach(() => {
    clearSpartaSession()
  })

  it("saves and reads the current session before expiry", () => {
    saveSpartaSession(
      {
        email: "raka.wijaya@sparta.local",
        fullName: "Raka Wijaya",
        branch: "Bandung",
        access: ["building", "maintenance", "energy"],
        mustChangePassword: false,
      },
      1_000
    )

    expect(getSpartaSession()).toMatchObject({
      email: "raka.wijaya@sparta.local",
      branch: "Bandung",
      access: ["building", "maintenance", "energy"],
      mustChangePassword: false,
    })
  })

  it("expires the current session", () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2026-06-11T00:00:00.000Z"))

    saveSpartaSession(
      {
        email: "dina.putri@sparta.local",
        fullName: "Dina Putri",
        branch: "Surabaya",
        access: ["energy"],
        mustChangePassword: true,
      },
      1_000
    )

    vi.setSystemTime(new Date("2026-06-11T00:00:02.000Z"))

    expect(getSpartaSession()).toBeNull()
    vi.useRealTimers()
  })

  it("clears the current session", () => {
    saveSpartaSession({
      email: "andi.halim@sparta.local",
      fullName: "Andi Halim",
      branch: "Jakarta Pusat",
      access: ["building", "maintenance"],
      mustChangePassword: true,
    })

    clearSpartaSession()

    expect(getSpartaSession()).toBeNull()
  })
})
