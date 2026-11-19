import type { PrismaClient } from "@prisma/client"

import { prisma } from "../../db/prisma"

export type MasterBranchRecord = {
  code: string
  name: string
  address: string | null
  areaCode: string | null
  isActive: boolean
  updatedAt: Date
}

export type MasterAreaRecord = {
  code: string
  name: string
  isActive: boolean
  updatedAt: Date
}

export type MasterListFilter = {
  /** Hanya baris yang berubah setelah waktu ini (untuk sync bertahap). */
  updatedSince?: Date
}

export type MasterRepository = {
  listBranches(filter: MasterListFilter): Promise<MasterBranchRecord[]>
  listAreas(filter: MasterListFilter): Promise<MasterAreaRecord[]>
}

export class PrismaMasterRepository implements MasterRepository {
  private readonly client: PrismaClient

  constructor(client: PrismaClient = prisma) {
    this.client = client
  }

  async listBranches(filter: MasterListFilter) {
    const branches = await this.client.branch.findMany({
      where: filter.updatedSince
        ? { updatedAt: { gt: filter.updatedSince } }
        : undefined,
      include: { area: { select: { code: true } } },
      orderBy: { code: "asc" },
    })

    return branches.map((branch) => ({
      code: branch.code,
      name: branch.name,
      address: branch.address,
      areaCode: branch.area?.code ?? null,
      isActive: branch.isActive,
      updatedAt: branch.updatedAt,
    }))
  }

  async listAreas(filter: MasterListFilter) {
    const areas = await this.client.area.findMany({
      where: filter.updatedSince
        ? { updatedAt: { gt: filter.updatedSince } }
        : undefined,
      orderBy: { code: "asc" },
    })

    return areas.map((area) => ({
      code: area.code,
      name: area.name,
      isActive: area.isActive,
      updatedAt: area.updatedAt,
    }))
  }
}
