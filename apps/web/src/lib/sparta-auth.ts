import type {
  ApiSuccess,
  SpartaLaunchableModuleId,
  SpartaModuleDto,
  SpartaModuleId,
  SpartaModuleLaunchDto,
  SpartaSessionDto,
} from "@sparta/shared"

import { ApiClientError, apiFetch } from "@/lib/api-client"

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

const DEFAULT_ERROR_MESSAGE = "Request SPARTA gagal."
const defaultModuleLoginUrls = {
  building: "http://localhost:5174/login",
  maintenance: "http://localhost:5175/login",
  energy: "http://localhost:5176/login",
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

export function getModuleLoginUrl(moduleId: SpartaAppId) {
  const envKey = `VITE_SPARTA_${moduleId.toUpperCase()}_LOGIN_URL`
  const envUrl = import.meta.env[envKey]

  return typeof envUrl === "string" && envUrl.trim()
    ? envUrl
    : defaultModuleLoginUrls[moduleId]
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
    const result = await apiFetch<ApiSuccess<{ session: SpartaSession }>>(
      "/v1/auth/login",
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    )

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
    await apiFetch<ApiSuccess<{ ok: true }>>("/v1/auth/first-password", {
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
    await apiFetch<ApiSuccess<{ ok: true }>>("/v1/password/forgot/reset", {
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
    await apiFetch<ApiSuccess<{ ok: true }>>("/v1/password/change/confirm", {
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
