import type { Prisma, PrismaClient, SpartaModuleId } from "@prisma/client"

import { prisma } from "../../db/prisma"
import type {
  CreateStoreInput,
  ListStoresQuery,
  UpdateStoreInput,
} from "./store.schemas"

export type StoreRecord = {
  code: string
  name: string
  branchCode: string
  branchName: string
  subArea: string | null
  brand: string | null
  ownershipType: string | null
  latitude: number | null
  longitude: number | null
  isActive: boolean
  source: string
  updatedAt: Date
}

export type StoreCounts = {
  activeCount: number
  inactiveCount: number
  withoutSubAreaCount: number
}

export type StoreBrandRecord = {
  code: string
  name: string
  /** Modul dalam format Prisma (huruf besar), mis. "MAINTENANCE". */
  moduleIds: SpartaModuleId[]
  storeCount: number
  hasRule: boolean
}

export type StoreRepository = {
  /** Brand yang punya aturan + brand yang muncul di data toko. */
  listBrands(): Promise<StoreBrandRecord[]>
  /** Simpan aturan brand dan tandai tokonya berubah agar ikut sync berikutnya. */
  setBrandModules(
    code: string,
    name: string,
    moduleIds: SpartaModuleId[]
  ): Promise<void>
  listStores(
    query: ListStoresQuery
  ): Promise<{ rows: StoreRecord[]; total: number }>
  countStores(): Promise<StoreCounts>
  storeExists(code: string): Promise<boolean>
  branchExists(code: string): Promise<boolean>
  createStore(input: CreateStoreInput): Promise<void>
  updateStore(code: string, patch: UpdateStoreInput): Promise<void>
  /** Untuk sync modul: semua toko, atau yang berubah setelah waktu ini. */
  listForSync(updatedSince?: Date): Promise<StoreRecord[]>
  createAuditEvent(input: {
    action: string
    entityType: string
    entityId: string
    actorUserId: string
    metadata?: Prisma.InputJsonValue
  }): Promise<void>
}

const storeInclude = { branch: { select: { code: true, name: true } } }

type PrismaStore = Prisma.StoreGetPayload<{ include: typeof storeInclude }>

function mapStore(store: PrismaStore): StoreRecord {
  return {
    code: store.code,
    name: store.name,
    branchCode: store.branch.code,
    branchName: store.branch.name,
    subArea: store.subArea,
    brand: store.brand,
    ownershipType: store.ownershipType,
    latitude: store.latitude,
    longitude: store.longitude,
    isActive: store.isActive,
    source: store.source,
    updatedAt: store.updatedAt,
  }
}

function buildWhere(query: ListStoresQuery): Prisma.StoreWhereInput {
  const where: Prisma.StoreWhereInput = {}
  if (query.q) {
    where.OR = [
      { code: { contains: query.q, mode: "insensitive" } },
      { name: { contains: query.q, mode: "insensitive" } },
      { subArea: { contains: query.q, mode: "insensitive" } },
    ]
  }
  if (query.branchCode) where.branch = { code: query.branchCode }
  if (query.brand) where.brand = query.brand
  if (query.status === "active") where.isActive = true
  if (query.status === "inactive") where.isActive = false
  return where
}

export class PrismaStoreRepository implements StoreRepository {
  private readonly client: PrismaClient

  constructor(client: PrismaClient = prisma) {
    this.client = client
  }

  async listBrands() {
    const [rules, counts] = await Promise.all([
      this.client.storeBrand.findMany(),
      this.client.store.groupBy({ by: ["brand"], _count: { _all: true } }),
    ])
    const countByBrand = new Map(
      counts.map((row) => [row.brand ?? "", row._count._all])
    )
    const brands: StoreBrandRecord[] = rules.map((rule) => ({
      code: rule.code,
      name: rule.name,
      moduleIds: rule.moduleIds,
      storeCount: countByBrand.get(rule.code) ?? 0,
      hasRule: true,
    }))
    for (const [code, storeCount] of countByBrand) {
      if (code && !rules.some((rule) => rule.code === code)) {
        brands.push({
          code,
          name: code,
          moduleIds: [],
          storeCount,
          hasRule: false,
        })
      }
    }
    return brands.sort((a, b) => b.storeCount - a.storeCount)
  }

  async setBrandModules(
    code: string,
    name: string,
    moduleIds: SpartaModuleId[]
  ) {
    await this.client.$transaction([
      this.client.storeBrand.upsert({
        where: { code },
        update: { moduleIds },
        create: { code, name, moduleIds },
      }),
      this.client.store.updateMany({
        where: { brand: code },
        data: { updatedAt: new Date() },
      }),
    ])
  }

  async listStores(query: ListStoresQuery) {
    const where = buildWhere(query)
    const [rows, total] = await Promise.all([
      this.client.store.findMany({
        where,
        include: storeInclude,
        orderBy: { code: "asc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      this.client.store.count({ where }),
    ])
    return { rows: rows.map(mapStore), total }
  }

  async countStores() {
    const [activeCount, inactiveCount, withoutSubAreaCount] = await Promise.all(
      [
        this.client.store.count({ where: { isActive: true } }),
        this.client.store.count({ where: { isActive: false } }),
        this.client.store.count({ where: { subArea: null } }),
      ]
    )
    return { activeCount, inactiveCount, withoutSubAreaCount }
  }

  async storeExists(code: string) {
    return (await this.client.store.count({ where: { code } })) > 0
  }

  async branchExists(code: string) {
    return (await this.client.branch.count({ where: { code } })) > 0
  }

  async createStore(input: CreateStoreInput) {
    await this.client.store.create({
      data: {
        code: input.code,
        name: input.name,
        subArea: input.subArea,
        brand: input.brand,
        ownershipType: input.ownershipType,
        source: "MANUAL",
        branch: { connect: { code: input.branchCode } },
      },
    })
  }

  async updateStore(code: string, patch: UpdateStoreInput) {
    const data: Prisma.StoreUpdateInput = {}
    if (patch.name !== undefined) data.name = patch.name
    if (patch.subArea !== undefined) data.subArea = patch.subArea
    if (patch.brand !== undefined) data.brand = patch.brand
    if (patch.ownershipType !== undefined)
      data.ownershipType = patch.ownershipType
    if (patch.isActive !== undefined) data.isActive = patch.isActive
    if (patch.branchCode !== undefined) {
      data.branch = { connect: { code: patch.branchCode } }
    }
    await this.client.store.update({ where: { code }, data })
  }

  async listForSync(updatedSince?: Date) {
    const stores = await this.client.store.findMany({
      where: updatedSince ? { updatedAt: { gt: updatedSince } } : undefined,
      include: storeInclude,
      orderBy: { code: "asc" },
    })
    return stores.map(mapStore)
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
