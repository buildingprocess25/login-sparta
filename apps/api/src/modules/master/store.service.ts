import type {
  MasterStoreAdminDto,
  MasterStoreListMeta,
  SpartaModuleId,
  StoreBrandAdminDto,
} from "@sparta/shared"
import type { SpartaModuleId as PrismaModuleId } from "@prisma/client"

import { AuthError } from "../auth/auth.service"
import type { StoreRecord, StoreRepository } from "./store.repository"
import type {
  CreateStoreInput,
  ListStoresQuery,
  SetBrandModulesInput,
  UpdateStoreInput,
} from "./store.schemas"

const toPrismaModule = (id: SpartaModuleId) =>
  id.toUpperCase() as PrismaModuleId
const toPublicModule = (id: PrismaModuleId) =>
  id.toLowerCase() as SpartaModuleId

export function toStoreDto(record: StoreRecord): MasterStoreAdminDto {
  return { ...record, updatedAt: record.updatedAt.toISOString() }
}

/**
 * Master toko. Kode toko tidak pernah diubah dan toko tidak dihapus (hanya
 * dinonaktifkan) karena modul menyimpan kode ini. Setiap perubahan dicatat
 * sebagai AuditEvent.
 */
export class StoreService {
  private readonly repository: StoreRepository

  constructor(repository: StoreRepository) {
    this.repository = repository
  }

  async listStores(query: ListStoresQuery): Promise<{
    data: MasterStoreAdminDto[]
    meta: MasterStoreListMeta
  }> {
    const [{ rows, total }, counts] = await Promise.all([
      this.repository.listStores(query),
      this.repository.countStores(),
    ])
    return {
      data: rows.map(toStoreDto),
      meta: { total, page: query.page, pageSize: query.pageSize, ...counts },
    }
  }

  async createStore(input: CreateStoreInput, actorUserId: string) {
    if (await this.repository.storeExists(input.code)) {
      throw new AuthError(
        `Kode toko ${input.code} sudah dipakai.`,
        409,
        "MASTER_CODE_TAKEN"
      )
    }
    await this.assertBranchExists(input.branchCode)

    await this.repository.createStore(input)
    await this.repository.createAuditEvent({
      action: "STORE_CREATED",
      entityType: "Store",
      entityId: input.code,
      actorUserId,
      metadata: input,
    })
  }

  async updateStore(
    code: string,
    patch: UpdateStoreInput,
    actorUserId: string
  ) {
    if (!(await this.repository.storeExists(code))) {
      throw new AuthError(
        `Toko ${code} tidak ditemukan.`,
        404,
        "MASTER_NOT_FOUND"
      )
    }
    if (patch.branchCode !== undefined) {
      await this.assertBranchExists(patch.branchCode)
    }

    await this.repository.updateStore(code, patch)
    await this.repository.createAuditEvent({
      action: "STORE_UPDATED",
      entityType: "Store",
      entityId: code,
      actorUserId,
      metadata: patch,
    })
  }

  async listBrands(): Promise<StoreBrandAdminDto[]> {
    return (await this.repository.listBrands()).map((brand) => ({
      ...brand,
      moduleIds: brand.moduleIds.map(toPublicModule),
    }))
  }

  async setBrandModules(
    code: string,
    input: SetBrandModulesInput,
    actorUserId: string
  ) {
    const brand = (await this.repository.listBrands()).find(
      (item) => item.code === code
    )
    if (!brand) {
      throw new AuthError(
        `Brand ${code} tidak ditemukan.`,
        404,
        "MASTER_NOT_FOUND"
      )
    }

    const moduleIds = [...new Set(input.moduleIds)].map(toPrismaModule)
    await this.repository.setBrandModules(code, brand.name, moduleIds)
    await this.repository.createAuditEvent({
      action: "STORE_BRAND_MODULES_UPDATED",
      entityType: "StoreBrand",
      entityId: code,
      actorUserId,
      metadata: { before: brand.moduleIds, after: moduleIds },
    })
  }

  /**
   * Toko untuk satu modul. Toko yang brand-nya tidak dibuka untuk modul ini:
   * tidak dikirim saat sync penuh; saat sync bertahap (updatedSince) dikirim
   * dengan isActive=false agar modul melepasnya setelah aturan brand dimatikan.
   */
  async listForModule(moduleId: SpartaModuleId, updatedSince?: Date) {
    const [stores, brands] = await Promise.all([
      this.repository.listForSync(updatedSince),
      this.repository.listBrands(),
    ])
    const target = toPrismaModule(moduleId)
    const rules = new Map(
      brands
        .filter((brand) => brand.hasRule)
        .map((brand) => [brand.code, brand.moduleIds])
    )
    const isVisible = (store: StoreRecord) =>
      !store.brand ||
      !rules.has(store.brand) ||
      rules.get(store.brand)!.includes(target)

    return stores
      .filter((store) => updatedSince || isVisible(store))
      .map((store) => ({
        ...store,
        isActive: store.isActive && isVisible(store),
      }))
  }

  private async assertBranchExists(branchCode: string) {
    if (!(await this.repository.branchExists(branchCode))) {
      throw new AuthError(
        `Cabang ${branchCode} tidak ditemukan.`,
        400,
        "MASTER_BRANCH_UNKNOWN"
      )
    }
  }
}
