import type {
  ApiSuccess,
  SpartaLaunchableModuleId,
  SpartaModuleDto,
  SpartaModuleId,
  SpartaModuleLaunchDto,
  SpartaSessionDto,
} from "@sparta/shared"

import { ApiClientError, apiFetch } from "@/lib/api-client"
import { postWithSealedSecrets } from "@/lib/credential-seal"

export { apiFetch }

export type ModulesResponse = ApiSuccess<{ modules: SpartaModuleDto[] }>

export type SpartaAppId = SpartaModuleId

export type SpartaApp = SpartaModuleDto & {
  passwordRule: string
}

export type SpartaSession = SpartaSessionDto

export type LoginInput = {
  email: string
  password: string
}

export type LoginResult =
  | {
      ok: true
      session: SpartaSession
    }
  | {
      ok: false
      message: string
    }

export type PasswordUpdateInput = {
  newPassword: string
}

export type PasswordUpdateResult =
  | {
      ok: true
    }
  | {
      ok: false
      message: string
    }

export type PasswordResetOtpResult =
  | {
      ok: true
      email: string
      expiresAt: string
    }
  | {
      ok: false
      message: string
    }

export type PasswordResetOtpInput = {
  email: string
  otp: string
}

export type PasswordResetWithOtpInput = PasswordResetOtpInput & {
  newPassword: string
}

export type ChangePasswordWithOtpInput = {
  otp: string
  newPassword: string
}
export type ChangeEmailResult =
  | {
      ok: true
    }
  | {
      ok: false
      code: string
      message: string
    }

const DEFAULT_ERROR_MESSAGE = "Request SPARTA gagal."
const productionModuleLoginUrls = {
  building: "https://building.sparta-alfamart.web.id",
  maintenance: "https://maintenance.sparta-alfamart.web.id",
  energy: "https://energy.sparta-alfamart.web.id",
  siaga: "https://siaga.sparta-alfamart.web.id",
  carbontrack: "https://grk.sparta-alfamart.web.id/login",
  engineering: "https://engineering.sparta-alfamart.web.id",
} satisfies Record<SpartaAppId, string>

// Hanya untuk `pnpm dev`. import.meta.env.DEV bernilai false di build
// produksi, sehingga daftar localhost ini dibuang dari bundle.
const devModuleLoginUrls = {
  building: "http://localhost:5174/login",
  maintenance: "http://localhost:5175/login",
  energy: "http://localhost:5176/login",
  siaga: "http://localhost:3004/login",
  carbontrack: "http://localhost:3000/login",
  engineering: "http://localhost:5177/login",
} satisfies Record<SpartaAppId, string>

export const SPARTA_APPS: Record<SpartaAppId, SpartaApp> = {
  building: {
    id: "building",
    name: "SPARTA Building",
    shortName: "Building",
    description:
      "Pengelolaan proyek pembangunan dari rencana hingga serah terima.",
    colorHex: "#e6000b",
    hasAccess: false,
    passwordRule: "Masukkan password SPARTA Anda.",
  },
  maintenance: {
    id: "maintenance",
    name: "SPARTA Maintenance",
    shortName: "Maintenance",
    description:
      "Pemeliharaan toko, laporan perbaikan, dan pertanggungjawaban operasional.",
    colorHex: "#0069a7",
    hasAccess: false,
    passwordRule: "Masukkan password SPARTA Anda.",
  },
  energy: {
    id: "energy",
    name: "SPARTA Energy",
    shortName: "Energy",
    description: "Audit peralatan dan estimasi kebutuhan energi toko.",
    colorHex: "#007a55",
    hasAccess: false,
    passwordRule: "Masukkan password SPARTA Anda.",
  },
  siaga: {
    id: "siaga",
    name: "SPARTA SIAGA",
    shortName: "SIAGA",
    description: "Sistem Pemantauan Cabang & Mitigasi Bencana Alfamart",
    colorHex: "#123B6D",
    hasAccess: false,
    passwordRule: "Masukkan password SPARTA Anda.",
  },
  carbontrack: {
    id: "carbontrack",
    name: "SPARTA Carbontrack",
    shortName: "Carbontrack",
    description:
      "Pencatatan emisi GRK Scope 1, 2, 3 dan produksi PLTS di 37 DC.",
    colorHex: "#902830",
    hasAccess: false,
    passwordRule: "Masukkan password SPARTA Anda.",
  },
  engineering: {
    id: "engineering",
    name: "SPARTA Engineering",
    shortName: "Engineering",
    description: "COMING SOON",
    colorHex: "#808080",
    hasAccess: false,
    passwordRule: "Masukkan password SPARTA Anda.",
  },
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return DEFAULT_ERROR_MESSAGE
}

function mergeModule(module: SpartaModuleDto): SpartaApp {
  return {
    ...SPARTA_APPS[module.id],
    ...module,
  }
}

export function isSpartaSsoEnabled() {
  return import.meta.env.VITE_SPARTA_SSO_ENABLED !== "false"
}

// Dibaca satu per satu (bukan import.meta.env[nama]) agar Vite hanya
// menyisipkan variabel ini ke bundle, bukan seluruh isi env.
const envModuleLoginUrls: Record<SpartaAppId, string | undefined> = {
  building: import.meta.env.VITE_SPARTA_BUILDING_LOGIN_URL,
  maintenance: import.meta.env.VITE_SPARTA_MAINTENANCE_LOGIN_URL,
  energy: import.meta.env.VITE_SPARTA_ENERGY_LOGIN_URL,
  siaga: import.meta.env.VITE_SPARTA_SIAGA_LOGIN_URL,
  carbontrack: import.meta.env.VITE_SPARTA_CARBONTRACK_LOGIN_URL,
  engineering: import.meta.env.VITE_SPARTA_ENGINEERING_LOGIN_URL,
}

export function getModuleLoginUrl(moduleId: SpartaAppId) {
  const envUrl = envModuleLoginUrls[moduleId]

  if (typeof envUrl === "string" && envUrl.trim()) {
    return envUrl
  }

  if (import.meta.env.DEV && import.meta.env.VITE_APP_ENV !== "production") {
    return devModuleLoginUrls[moduleId]
  }

  return productionModuleLoginUrls[moduleId]
}

export async function getCurrentSpartaSession() {
  try {
    const result =
      await apiFetch<ApiSuccess<{ session: SpartaSession }>>("/v1/auth/me")

    return result.data.session
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      return null
    }

    throw error
  }
}

export async function loginToSparta(input: LoginInput): Promise<LoginResult> {
  try {
    const result = await postWithSealedSecrets<
      ApiSuccess<{ session: SpartaSession }>
    >("/v1/auth/login", input, ["password"])

    return {
      ok: true,
      session: result.data.session,
    }
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error),
    }
  }
}

export async function logoutFromSparta() {
  await apiFetch<ApiSuccess<{ ok: true }>>("/v1/auth/logout", {
    method: "POST",
  })
}

export async function updateUserPassword(
  input: PasswordUpdateInput
): Promise<PasswordUpdateResult> {
  try {
    await postWithSealedSecrets<ApiSuccess<{ ok: true }>>(
      "/v1/auth/first-password",
      input,
      ["newPassword"]
    )

    return {
      ok: true,
    }
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error),
    }
  }
}

export async function requestPasswordResetOtp(
  email: string
): Promise<PasswordResetOtpResult> {
  try {
    const result = await apiFetch<
      ApiSuccess<{
        email: string
        expiresAt: string
      }>
    >("/v1/password/forgot/request-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    })

    return {
      ok: true,
      ...result.data,
    }
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error),
    }
  }
}

export async function verifyPasswordResetOtp(
  input: PasswordResetOtpInput
): Promise<PasswordUpdateResult> {
  try {
    await apiFetch<ApiSuccess<{ ok: true }>>("/v1/password/forgot/verify-otp", {
      method: "POST",
      body: JSON.stringify(input),
    })

    return {
      ok: true,
    }
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error),
    }
  }
}

export async function resetPasswordWithOtp(
  input: PasswordResetWithOtpInput
): Promise<PasswordUpdateResult> {
  try {
    await postWithSealedSecrets<ApiSuccess<{ ok: true }>>(
      "/v1/password/forgot/reset",
      input,
      ["newPassword"]
    )

    return {
      ok: true,
    }
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error),
    }
  }
}

export async function requestChangePasswordOtp(): Promise<PasswordResetOtpResult> {
  try {
    const result = await apiFetch<
      ApiSuccess<{
        email: string
        expiresAt: string
      }>
    >("/v1/password/change/request-otp", {
      method: "POST",
    })

    return {
      ok: true,
      ...result.data,
    }
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error),
    }
  }
}

export async function confirmChangePasswordWithOtp(
  input: ChangePasswordWithOtpInput
): Promise<PasswordUpdateResult> {
  try {
    await postWithSealedSecrets<ApiSuccess<{ ok: true }>>(
      "/v1/password/change/confirm",
      input,
      ["newPassword"]
    )

    return {
      ok: true,
    }
  } catch (error) {
    return {
      ok: false,
      message: getErrorMessage(error),
    }
  }
}

export async function changeEmail(input: {
  newEmail: string
  password: string
}): Promise<ChangeEmailResult> {
  try {
    await postWithSealedSecrets<ApiSuccess<{ ok: true }>>(
      "/v1/admin/users/change-email",
      input,
      ["password"]
    )

    return { ok: true }
  } catch (error) {
    if (error instanceof ApiClientError) {
      return { ok: false, code: error.code, message: error.message }
    }

    return {
      ok: false,
      code: "UNKNOWN_ERROR",
      message: "Terjadi kesalahan tidak terduga saat mengganti email.",
    }
  }
}

export async function getAccessibleApps(): Promise<SpartaApp[]> {
  const result = await apiFetch<ModulesResponse>("/v1/modules")

  return result.data.modules.map(mergeModule)
}

export async function launchSpartaModule(moduleId: SpartaLaunchableModuleId) {
  const result = await apiFetch<ApiSuccess<SpartaModuleLaunchDto>>(
    `/v1/modules/${moduleId}/launch`,
    {
      method: "POST",
    }
  )

  return result.data
}
