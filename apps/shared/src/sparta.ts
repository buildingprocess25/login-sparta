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

/** Role portal. Role di dalam tiap modul tetap dikelola modul masing-masing. */
export const SPARTA_PORTAL_ROLES = [
  "USER",
  "SYSTEM_ADMIN",
  "MASTER_ADMIN",
] as const

export type SpartaPortalRole = (typeof SPARTA_PORTAL_ROLES)[number]

/** Role yang boleh mengelola data master (cabang, area, alias). */
export const SPARTA_MASTER_DATA_ROLES: readonly SpartaPortalRole[] = [
  "SYSTEM_ADMIN",
  "MASTER_ADMIN",
]

export type SpartaSessionDto = {
  email: string
  fullName: string
  branch: string
  role: SpartaPortalRole
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

/**
 * Event provisioning (Fase 2B) yang dikirim portal ke endpoint modul.
 * - access.granted: user boleh masuk modul (buat atau aktifkan akun lokal).
 * - access.revoked: akses modul dicabut (nonaktifkan akun lokal, jangan hapus).
 * - user.updated: identitas berubah (mis. email); perbarui akun lokal.
 * - user.deactivated: user dinonaktifkan di portal; nonaktifkan akun & sesi.
 */
export const SPARTA_PROVISIONING_EVENT_TYPES = [
  "access.granted",
  "access.revoked",
  "user.updated",
  "user.deactivated",
] as const

export type SpartaProvisioningEventType =
  (typeof SPARTA_PROVISIONING_EVENT_TYPES)[number]

export type SpartaProvisioningEvent = {
  /** ID unik event. Modul wajib idempotent: event yang sama boleh datang 2x. */
  eventId: string
  type: SpartaProvisioningEventType
  /** ISO timestamp saat perubahan terjadi di portal. */
  occurredAt: string
  moduleId: SpartaModuleId
  user: {
    spartaUserId: string
    employeeId: string | null
    email: string
    fullName: string
    branch: string
    branchCode: string
    status: "ACTIVE" | "INACTIVE" | "LOCKED"
  }
  /** Akses user untuk modul ini setelah perubahan. */
  access: {
    isActive: boolean
    /** Role dari katalog role modul (ModuleRole). */
    role: string
  }
}

/** Alias cabang: nama/kode lama dari aplikasi lain yang dipetakan ke cabang resmi. */
export type MasterBranchAliasDto = {
  id: string
  alias: string
  source: string
}

/** Cabang untuk halaman admin data master. */
export type MasterBranchAdminDto = {
  code: string
  name: string
  address: string | null
  areaCode: string | null
  areaName: string | null
  isActive: boolean
  userCount: number
  aliases: MasterBranchAliasDto[]
  updatedAt: string
}

/** Area untuk halaman admin data master. */
export type MasterAreaAdminDto = {
  code: string
  name: string
  isActive: boolean
  branchCount: number
  updatedAt: string
}

/** Toko untuk halaman admin data master (GET /v1/admin/master/stores). */
export type MasterStoreAdminDto = {
  code: string
  name: string
  branchCode: string
  branchName: string
  /** Pembagian toko di dalam cabang, mis. "BEKASI" di cabang CILEUNGSI. */
  subArea: string | null
  brand: string | null
  ownershipType: string | null
  latitude: number | null
  longitude: number | null
  isActive: boolean
  source: string
  updatedAt: string
}

export type MasterStoreStatusFilter = "all" | "active" | "inactive"

/**
 * Brand toko dan modul yang menerima tokonya
 * (GET /v1/admin/master/store-brands). Brand tanpa aturan (`hasRule: false`)
 * dikirim ke semua modul.
 */
export type StoreBrandAdminDto = {
  code: string
  name: string
  moduleIds: SpartaModuleId[]
  storeCount: number
  hasRule: boolean
}

/** Meta daftar toko: paginasi sisi server + hitungan untuk kartu angka. */
export type MasterStoreListMeta = {
  total: number
  page: number
  pageSize: number
  /** Hitungan seluruh toko, tidak terpengaruh pencarian/saringan. */
  activeCount: number
  inactiveCount: number
  withoutSubAreaCount: number
}

export type SpartaUserStatus = "ACTIVE" | "INACTIVE" | "LOCKED"

/** User untuk halaman admin Manajemen User (GET /v1/admin/users). */
export type AdminUserDto = {
  id: string
  email: string
  employeeId: string | null
  fullName: string
  branchCode: string
  branchName: string
  validBranchNames: string[]
  role: SpartaPortalRole
  status: SpartaUserStatus
  passwordState: "BRANCH_DEFAULT" | "USER_SET" | "RESET_REQUIRED"
  lastLoginAt: string | null
  createdAt: string
  modules: Array<{
    moduleId: SpartaLaunchableModuleId
    role: string
    isActive: boolean
  }>
}

/** Katalog role per modul (GET /v1/admin/users/module-roles). */
export type ModuleRoleDto = {
  moduleId: SpartaModuleId
  code: string
  label: string
}

export type ProvisioningEventStatus =
  | "PENDING"
  | "DELIVERED"
  | "FAILED"
  | "SKIPPED"

/** Riwayat event provisioning per user (GET /v1/admin/users/:id/provisioning-events). */
export type ProvisioningEventDto = {
  id: string
  type: SpartaProvisioningEventType
  moduleId: SpartaModuleId
  status: ProvisioningEventStatus
  attempts: number
  lastError: string | null
  nextAttemptAt: string
  deliveredAt: string | null
  createdAt: string
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
