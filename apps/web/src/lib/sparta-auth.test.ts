import { describe, expect, it } from "vitest"

import {
  changeUserPassword,
  getAccessibleApps,
  loginToSparta,
  requestPasswordResetOtp,
  resetPasswordWithOtp,
  updateUserPassword,
  verifyPasswordResetOtp,
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
      message: "Email atau password SPARTA tidak sesuai.",
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

  it("issues and verifies password reset OTP for registered email", () => {
    const request = requestPasswordResetOtp("andi.halim@sparta.local")

    expect(request.ok).toBe(true)
    expect(request.ok && request.otp).toMatch(/^\d{6}$/)

    expect(
      request.ok &&
        verifyPasswordResetOtp({
          email: "andi.halim@sparta.local",
          otp: request.otp,
        })
    ).toEqual({
      ok: true,
    })
  })

  it("resets password with OTP and consumes the OTP after success", () => {
    const request = requestPasswordResetOtp("raka.wijaya@sparta.local")

    expect(request.ok).toBe(true)

    if (!request.ok) {
      return
    }

    expect(
      resetPasswordWithOtp({
        email: "raka.wijaya@sparta.local",
        otp: request.otp,
        newPassword: "Raka-Sparta-2026",
      })
    ).toEqual({
      ok: true,
    })

    expect(
      validateUserPassword({
        email: "raka.wijaya@sparta.local",
        password: "Raka-Sparta-2026",
      }).ok
    ).toBe(true)

    expect(
      resetPasswordWithOtp({
        email: "raka.wijaya@sparta.local",
        otp: request.otp,
        newPassword: "Raka-Sparta-2027",
      })
    ).toEqual({
      ok: false,
      message: "Kode OTP tidak valid atau sudah kedaluwarsa.",
    })
  })

  it("changes password only when current password is valid", () => {
    const update = updateUserPassword({
      email: "andi.halim@sparta.local",
      newPassword: "Andi-Sparta-2026",
    })

    expect(update.ok).toBe(true)

    expect(
      changeUserPassword({
        email: "andi.halim@sparta.local",
        currentPassword: "wrong-password",
        newPassword: "Andi-Sparta-2027",
      })
    ).toEqual({
      ok: false,
      message: "Password saat ini tidak sesuai.",
    })

    expect(
      changeUserPassword({
        email: "andi.halim@sparta.local",
        currentPassword: "Andi-Sparta-2026",
        newPassword: "Andi-Sparta-2027",
      })
    ).toEqual({
      ok: true,
    })
  })
})
