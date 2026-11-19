import type { MasterAreaAdminDto, MasterBranchAdminDto } from "@sparta/shared"

import { AuthError } from "../auth/auth.service"
import { normalizeBranchAlias } from "./branch-alias"
import type {
  AdminAreaRecord,
  AdminBranchRecord,
  MasterAdminRepository,
} from "./master-admin.repository"
import type {
  CreateAreaInput,
  CreateBranchInput,
  UpdateAreaInput,
  UpdateBranchInput,
} from "./master-admin.schemas"

function toBranchDto(record: AdminBranchRecord): MasterBranchAdminDto {
  return { ...record, updatedAt: record.updatedAt.toISOString() }
}

function toAreaDto(record: AdminAreaRecord): MasterAreaAdminDto {
  return { ...record, updatedAt: record.updatedAt.toISOString() }
}

function notFound(entity: "Cabang" | "Area" | "Alias", code: string) {
  return new AuthError(
    `${entity} ${code} tidak ditemukan.`,
    404,
    "MASTER_NOT_FOUND"
  )
}

/**
 * Pengelolaan data master cabang, area dan alias. Kode tidak pernah bisa
 * diubah dan data tidak dihapus (hanya dinonaktifkan) karena aplikasi lain
 * menyimpan kode ini. Setiap perubahan dicatat sebagai AuditEvent.
 */
export class MasterAdminService {
  private readonly repository: MasterAdminRepository

  constructor(repository: MasterAdminRepository) {
    this.repository = repository
  }

  async listBranches() {
    return (await this.repository.listBranches()).map(toBranchDto)
  }

  async listAreas() {
    return (await this.repository.listAreas()).map(toAreaDto)
  }

  async createBranch(input: CreateBranchInput, actorUserId: string) {
    if (await this.repository.branchExists(input.code)) {
      throw new AuthError(
        `Kode cabang ${input.code} sudah dipakai.`,
        409,
        "MASTER_CODE_TAKEN"
      )
    }
    await this.assertAreaExists(input.areaCode)

    await this.repository.createBranch(input)
    await this.repository.createAuditEvent({
      action: "BRANCH_CREATED",
      entityType: "Branch",
      entityId: input.code,
      actorUserId,
      metadata: input,
    })
  }

  async updateBranch(
    code: string,
    patch: UpdateBranchInput,
    actorUserId: string
  ) {
    if (!(await this.repository.branchExists(code))) {
      throw notFound("Cabang", code)
    }
    await this.assertAreaExists(patch.areaCode)

    await this.repository.updateBranch(code, patch)
    await this.repository.createAuditEvent({
      action: "BRANCH_UPDATED",
      entityType: "Branch",
      entityId: code,
      actorUserId,
      metadata: patch,
    })
  }

  async createArea(input: CreateAreaInput, actorUserId: string) {
    if (await this.repository.areaExists(input.code)) {
      throw new AuthError(
        `Kode area ${input.code} sudah dipakai.`,
        409,
        "MASTER_CODE_TAKEN"
      )
    }

    await this.repository.createArea(input)
    await this.repository.createAuditEvent({
      action: "AREA_CREATED",
      entityType: "Area",
      entityId: input.code,
      actorUserId,
      metadata: input,
    })
  }

  async updateArea(code: string, patch: UpdateAreaInput, actorUserId: string) {
    if (!(await this.repository.areaExists(code))) {
      throw notFound("Area", code)
    }

    await this.repository.updateArea(code, patch)
    await this.repository.createAuditEvent({
      action: "AREA_UPDATED",
      entityType: "Area",
      entityId: code,
      actorUserId,
      metadata: patch,
    })
  }

  async addAlias(branchCode: string, rawAlias: string, actorUserId: string) {
    if (!(await this.repository.branchExists(branchCode))) {
      throw notFound("Cabang", branchCode)
    }

    const alias = normalizeBranchAlias(rawAlias)
    if (alias === normalizeBranchAlias(branchCode)) {
      throw new AuthError(
        "Alias tidak boleh sama dengan kode cabangnya sendiri.",
        400,
        "MASTER_ALIAS_INVALID"
      )
    }
    // Alias yang sama dengan kode cabang lain membuat pencocokan ambigu.
    if (await this.repository.branchExists(alias)) {
      throw new AuthError(
        `"${alias}" sudah menjadi kode cabang lain.`,
        409,
        "MASTER_ALIAS_TAKEN"
      )
    }
    const owner = await this.repository.findAliasOwner(alias)
    if (owner) {
      throw new AuthError(
        `Alias "${alias}" sudah dipakai cabang ${owner}.`,
        409,
        "MASTER_ALIAS_TAKEN"
      )
    }

    await this.repository.createAlias(branchCode, alias, "MANUAL")
    await this.repository.createAuditEvent({
      action: "BRANCH_ALIAS_ADDED",
      entityType: "Branch",
      entityId: branchCode,
      actorUserId,
      metadata: { alias },
    })
  }

  async removeAlias(branchCode: string, aliasId: string, actorUserId: string) {
    const alias = await this.repository.findAlias(aliasId)
    if (!alias || alias.branchCode !== branchCode) {
      throw notFound("Alias", aliasId)
    }

    await this.repository.deleteAlias(aliasId)
    await this.repository.createAuditEvent({
      action: "BRANCH_ALIAS_REMOVED",
      entityType: "Branch",
      entityId: branchCode,
      actorUserId,
      metadata: { alias: alias.alias },
    })
  }

  private async assertAreaExists(areaCode: string | null | undefined) {
    if (areaCode && !(await this.repository.areaExists(areaCode))) {
      throw new AuthError(
        `Area ${areaCode} tidak ditemukan.`,
        400,
        "MASTER_AREA_UNKNOWN"
      )
    }
  }
}
