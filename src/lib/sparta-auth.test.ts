import { describe, expect, it } from "vitest"

import {
  getAccessibleApps,
  loginToSparta,
  updateUserPassword,
  validateUserPassword,
} from "./sparta-auth"

describe("SPARTA login flow", () => {
  it("logs in with email and branch name in uppercase", () => {
    const result = loginToSparta({
      email: "andi.halim@sparta.local",
      password: "JAKARTA PUSAT",
    })

    expect(result.ok).toBe(true)
    expect(result.ok && result.session).toMatchObject({
      email: "andi.halim@sparta.local",
      branch: "Jakarta Pusat",
      mustChangePassword: true,
      access: ["building", "maintenance"],
    })
  })

  it("rejects branch password that is not uppercase", () => {
    const result = loginToSparta({
      email: "andi.halim@sparta.local",
      password: "jakarta pusat",
    })

    expect(result).toEqual({
      ok: false,
      message: "Password awal harus menggunakan nama cabang huruf kapital.",
    })
  })

  it("allows updated password after first password change", () => {
    const update = updateUserPassword({
      email: "dina.putri@sparta.local",
      newPassword: "Dina-Sparta-2026",
    })

    expect(update.ok).toBe(true)
    expect(
      validateUserPassword({
        email: "dina.putri@sparta.local",
        password: "Dina-Sparta-2026",
      }).ok
    ).toBe(true)
  })

  it("returns modules in Building, Maintenance, Energy order", () => {
    expect(
      getAccessibleApps("raka.wijaya@sparta.local").map((app) => app.id)
    ).toEqual(["building", "maintenance", "energy"])
  })
})
