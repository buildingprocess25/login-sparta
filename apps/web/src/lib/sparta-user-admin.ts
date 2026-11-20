import type {
  AdminUserDto,
  ApiSuccess,
  ModuleRoleDto,
  ProvisioningEventDto,
  SpartaLaunchableModuleId,
  SpartaPortalRole,
  SpartaUserStatus,
} from "@sparta/shared"

import { apiFetch } from "@/lib/api-client"
import type { SpartaSession } from "@/lib/sparta-auth"

export type AdminUser = AdminUserDto
export type ModuleRole = ModuleRoleDto
export type ProvisioningEvent = ProvisioningEventDto

export type UserProfileInput = {
  email: string
  employeeId: string
  fullName: string
  branchCode: string
  branchName: string
  role: SpartaPortalRole
}

export type ModuleAccessInput = {
  moduleId: SpartaLaunchableModuleId
  role: string
}

/** SYSTEM_ADMIN atau admin modul (adminModules tidak kosong). */
export function canManageUsers(session: SpartaSession | null | undefined) {
  return Boolean(
    session &&
    (session.role === "SYSTEM_ADMIN" || (session.adminModules?.length ?? 0) > 0)
  )
}

export type UserAdminScope =
  | { all: true }
  | { all: false; modules: SpartaLaunchableModuleId[] }

/** SYSTEM_ADMIN mengelola semua modul; admin modul hanya modulnya sendiri. */
export function getUserAdminScope(
  session: SpartaSession | null | undefined
): UserAdminScope {
  if (session?.role === "SYSTEM_ADMIN") return { all: true }
  return { all: false, modules: session?.adminModules ?? [] }
}

export const USER_STATUS_LABEL: Record<SpartaUserStatus, string> = {
  ACTIVE: "Aktif",
  INACTIVE: "Nonaktif",
  LOCKED: "Terkunci",
}

export const PORTAL_ROLE_LABEL: Record<SpartaPortalRole, string> = {
  USER: "User",
  SYSTEM_ADMIN: "Admin sistem",
  MASTER_ADMIN: "Admin data master",
}

/** Role katalog untuk satu modul. Kosong = modul menerima role bebas. */
export function rolesForModule(
  roles: ModuleRole[],
  moduleId: SpartaLaunchableModuleId
) {
  return roles.filter((role) => role.moduleId === moduleId)
}

export function roleLabel(
  roles: ModuleRole[],
  moduleId: SpartaLaunchableModuleId,
  code: string
) {
  return (
    roles.find((role) => role.moduleId === moduleId && role.code === code)
      ?.label ?? code
  )
}

const base = "/v1/admin/users"

function path(...segments: string[]) {
  return [base, ...segments.map(encodeURIComponent)].join("/")
}

export async function listAdminUsers() {
  const result = await apiFetch<ApiSuccess<AdminUser[]>>(base)
  return result.data
}

export async function listModuleRoles() {
  const result = await apiFetch<ApiSuccess<ModuleRole[]>>(path("module-roles"))
  return result.data
}

export async function createAdminUser(
  input: UserProfileInput & { modules: ModuleAccessInput[] }
) {
  const result = await apiFetch<ApiSuccess<AdminUser>>(base, {
    method: "POST",
    body: JSON.stringify(input),
  })
  return result.data
}

export async function updateAdminUser(
  userId: string,
  patch: Partial<UserProfileInput> & { status?: SpartaUserStatus }
) {
  await apiFetch(path(userId), {
    method: "PATCH",
    body: JSON.stringify(patch),
  })
}

export async function grantModuleAccess(
  userId: string,
  access: ModuleAccessInput
) {
  await apiFetch(path(userId, "access", access.moduleId), {
    method: "PUT",
    body: JSON.stringify({ role: access.role }),
  })
}

export async function revokeModuleAccess(
  userId: string,
  moduleId: SpartaLaunchableModuleId
) {
  await apiFetch(path(userId, "access", moduleId), { method: "DELETE" })
}

export async function listProvisioningEvents(userId: string) {
  const result = await apiFetch<ApiSuccess<ProvisioningEvent[]>>(
    path(userId, "provisioning-events")
  )
  return result.data
}

export async function retryProvisioningEvent(eventId: string) {
  await apiFetch(path("provisioning-events", eventId, "retry"), {
    method: "POST",
  })
}
