export const SPARTA_LAUNCHABLE_MODULE_IDS = [
  "building",
  "maintenance",
  "energy",
  "siaga",
  "carbontrack",
] as const

export const SPARTA_MODULE_IDS = [
  ...SPARTA_LAUNCHABLE_MODULE_IDS,
  "engineering",
] as const

export type SpartaLaunchableModuleId =
  (typeof SPARTA_LAUNCHABLE_MODULE_IDS)[number]

export type SpartaModuleId = (typeof SPARTA_MODULE_IDS)[number]

export type SpartaSessionDto = {
  email: string
  fullName: string
  branch: string
  access: SpartaLaunchableModuleId[]
  mustChangePassword: boolean
}

/** Versi kontrak payload SSO exchange (`POST /v1/sso/exchange`). */
export const SPARTA_SSO_CONTRACT_VERSION = 2

/**
 * Data user yang dikirim ke modul saat SSO exchange.
 * v2 menambah `contractVersion`, `spartaUserId`, `employeeId`, `branchCode`;
 * field v1 (`email`, `fullName`, `branch`, `access`) tetap dikirim.
 */
export type SpartaSsoUserPayload = {
  contractVersion: typeof SPARTA_SSO_CONTRACT_VERSION
  /** ID user portal: string opaque (cuid), tidak pernah berubah atau dipakai ulang. */
  spartaUserId: string
  /** NIK. Null hanya untuk akun lama yang NIK-nya belum dilengkapi. */
  employeeId: string | null
  email: string
  fullName: string
  /** Nama cabang utama (field v1). */
  branch: string
  /** Kode cabang utama. Belum bersih sampai Fase 2; jangan dijadikan kunci dulu. */
  branchCode: string
  access: SpartaLaunchableModuleId[]
}

export type SpartaModuleDto = {
  id: SpartaModuleId
  name: string
  shortName: string
  description: string
  colorHex: string
  hasAccess: boolean
}

export type SpartaModuleLaunchDto = {
  moduleId: SpartaLaunchableModuleId
  redirectUrl: string
  expiresAt: string
}
