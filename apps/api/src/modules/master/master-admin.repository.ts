import type { Prisma, PrismaClient } from "@prisma/client"

import { prisma } from "../../db/prisma"

export type AdminBranchRecord = {
  code: string
  name: string
  address: string | null
  areaCode: string | null
  areaName: string | null
  isActive: boolean
  userCount: number
  aliases: Array<{ id: string; alias: string; source: string }>
  updatedAt: Date
}

export type AdminAreaRecord = {
  code: string
  name: string
  isActive: boolean
  branchCount: number
  updatedAt: Date
}

export type BranchPatch = {
  name?: string
  address?: string | null
  /** null = lepaskan dari area. */
  areaCode?: string | null
  isActive?: boolean
}

export type AreaPatch = {
  name?: string
  isActive?: boolean
}

export type MasterAdminRepository = {
  listBranches(): Promise<AdminBranchRecord[]>
  listAreas(): Promise<AdminAreaRecord[]>
  branchExists(code: string): Promise<boolean>
  areaExists(code: string): Promise<boolean>
  /** Cabang pemilik alias (sudah dinormalisasi), atau null. */
  findAliasOwner(alias: string): Promise<string | null>
  findAlias(
    aliasId: string
  ): Promise<{ id: string; alias: string; branchCode: string } | null>
  createBranch(input: {
    code: string
    name: string
    address: string | null
    areaCode: string | null
  }): Promise<void>
  updateBranch(code: string, patch: BranchPatch): Promise<void>
  createArea(input: { code: string; name: string }): Promise<void>
  updateArea(code: string, patch: AreaPatch): Promise<void>
  createAlias(branchCode: string, alias: string, source: string): Promise<void>
  deleteAlias(aliasId: string): Promise<void>
  createAuditEvent(input: {
    action: string
    entityType: string
    entityId: string
    actorUserId: string
    metadata?: Prisma.InputJsonValue
  }): Promise<void>
}

export class PrismaMasterAdminRepository implements MasterAdminRepository {
  private readonly client: PrismaClient

  constructor(client: PrismaClient = prisma) {
    this.client = client
  }

  async listBranches() {
    const branches = await this.client.branch.findMany({
      include: {
        area: { select: { code: true, name: true } },
        aliases: { orderBy: { alias: "asc" } },
        _count: { select: { users: true } },
      },
      orderBy: { code: "asc" },
    })

    return branches.map((branch) => ({
      code: branch.code,
      name: branch.name,
      address: branch.address,
      areaCode: branch.area?.code ?? null,
      areaName: branch.area?.name ?? null,
      isActive: branch.isActive,
      userCount: branch._count.users,
      aliases: branch.aliases.map((alias) => ({
        id: alias.id,
        alias: alias.alias,
        source: alias.source,
      })),
      updatedAt: branch.updatedAt,
    }))
  }

  async listAreas() {
    const areas = await this.client.area.findMany({
      include: { _count: { select: { branches: true } } },
      orderBy: { code: "asc" },
    })

    return areas.map((area) => ({
      code: area.code,
      name: area.name,
      isActive: area.isActive,
      branchCount: area._count.branches,
      updatedAt: area.updatedAt,
    }))
  }

  async branchExists(code: string) {
    return (await this.client.branch.count({ where: { code } })) > 0
  }

  async areaExists(code: string) {
    return (await this.client.area.count({ where: { code } })) > 0
  }

  async findAliasOwner(alias: string) {
    const record = await this.client.branchAlias.findUnique({
      where: { alias },
      include: { branch: { select: { code: true } } },
    })
    return record?.branch.code ?? null
  }

  async findAlias(aliasId: string) {
    const record = await this.client.branchAlias.findUnique({
      where: { id: aliasId },
      include: { branch: { select: { code: true } } },
    })
    return record
      ? { id: record.id, alias: record.alias, branchCode: record.branch.code }
      : null
  }

  async createBranch(input: {
    code: string
    name: string
    address: string | null
    areaCode: string | null
  }) {
    await this.client.branch.create({
      data: {
        code: input.code,
        name: input.name,
        address: input.address,
        area: input.areaCode
          ? { connect: { code: input.areaCode } }
          : undefined,
      },
    })
  }

  async updateBranch(code: string, patch: BranchPatch) {
    const data: Prisma.BranchUpdateInput = {}
    if (patch.name !== undefined) data.name = patch.name
    if (patch.address !== undefined) data.address = patch.address
    if (patch.isActive !== undefined) data.isActive = patch.isActive
    if (patch.areaCode !== undefined) {
      data.area =
        patch.areaCode === null
          ? { disconnect: true }
          : { connect: { code: patch.areaCode } }
    }

    await this.client.branch.update({ where: { code }, data })
  }

  async createArea(input: { code: string; name: string }) {
    await this.client.area.create({ data: input })
  }

  async updateArea(code: string, patch: AreaPatch) {
    await this.client.area.update({ where: { code }, data: patch })
  }

  async createAlias(branchCode: string, alias: string, source: string) {
    await this.client.branchAlias.create({
      data: { alias, source, branch: { connect: { code: branchCode } } },
    })
  }

  async deleteAlias(aliasId: string) {
    await this.client.branchAlias.delete({ where: { id: aliasId } })
  }

  async createAuditEvent(input: {
    action: string
    entityType: string
    entityId: string
    actorUserId: string
    metadata?: Prisma.InputJsonValue
  }) {
    await this.client.auditEvent.create({ data: input })
  }
}
