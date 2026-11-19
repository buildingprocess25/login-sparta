import {
  SPARTA_MASTER_DATA_ROLES,
  type ApiSuccess,
  type MasterAreaAdminDto,
  type MasterBranchAdminDto,
} from "@sparta/shared"

import { apiFetch } from "@/lib/api-client"
import type { SpartaSession } from "@/lib/sparta-auth"

export type MasterBranch = MasterBranchAdminDto
export type MasterArea = MasterAreaAdminDto

export type BranchFormInput = {
  name: string
  address: string | null
  areaCode: string | null
}

/** Halaman Data Master hanya untuk SYSTEM_ADMIN dan MASTER_ADMIN. */
export function canManageMasterData(session: SpartaSession | null | undefined) {
  return Boolean(session && SPARTA_MASTER_DATA_ROLES.includes(session.role))
}

/**
 * Kode yang tidak memenuhi pola baku (berisi spasi, huruf kecil, atau sama
 * dengan namanya) biasanya dibuat otomatis oleh sync modul lama dan perlu
 * dirapikan lewat alias.
 */
export function isNonStandardCode(branch: Pick<MasterBranch, "code" | "name">) {
  return (
    !/^[A-Z0-9_-]{2,20}$/.test(branch.code) ||
    branch.code === branch.name.toUpperCase()
  )
}

const base = "/v1/admin/master"

function path(...segments: string[]) {
  return [base, ...segments.map(encodeURIComponent)].join("/")
}

export async function listMasterBranches() {
  const result = await apiFetch<ApiSuccess<MasterBranch[]>>(path("branches"))
  return result.data
}

export async function listMasterAreas() {
  const result = await apiFetch<ApiSuccess<MasterArea[]>>(path("areas"))
  return result.data
}

export async function createMasterBranch(
  input: BranchFormInput & { code: string }
) {
  await apiFetch(path("branches"), {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateMasterBranch(
  code: string,
  patch: Partial<BranchFormInput> & { isActive?: boolean }
) {
  await apiFetch(path("branches", code), {
    method: "PATCH",
    body: JSON.stringify(patch),
  })
}

export async function addMasterBranchAlias(code: string, alias: string) {
  await apiFetch(path("branches", code, "aliases"), {
    method: "POST",
    body: JSON.stringify({ alias }),
  })
}

export async function removeMasterBranchAlias(code: string, aliasId: string) {
  await apiFetch(path("branches", code, "aliases", aliasId), {
    method: "DELETE",
  })
}

export async function createMasterArea(input: { code: string; name: string }) {
  await apiFetch(path("areas"), {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export async function updateMasterArea(
  code: string,
  patch: { name?: string; isActive?: boolean }
) {
  await apiFetch(path("areas", code), {
    method: "PATCH",
    body: JSON.stringify(patch),
  })
}
