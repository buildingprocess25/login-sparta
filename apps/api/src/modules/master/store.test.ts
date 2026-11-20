import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"

import { createApp } from "../../app"
import type { AppEnv } from "../../config/env"
import type { SpartaModuleId } from "@prisma/client"

import type {
  StoreCounts,
  StoreRecord,
  StoreRepository,
} from "./store.repository"
import type {
  CreateStoreInput,
  ListStoresQuery,
  UpdateStoreInput,
} from "./store.schemas"
import { listStoresQuerySchema, createStoreSchema } from "./store.schemas"
import { StoreService } from "./store.service"

const testEnv = {
  NODE_ENV: "test",
  PORT: 10000,
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/sparta_login",
  SESSION_SECRET: "test-session-secret-minimum-32-characters",
  OTP_PEPPER: "test-otp-pepper-minimum-32-characters",
  CORS_ORIGINS: ["http://localhost:5173"],
  GOOGLE_CLIENT_ID: "google-client-id",
  GOOGLE_CLIENT_SECRET: "google-client-secret",
  GOOGLE_REFRESH_TOKEN: "google-refresh-token",
  GMAIL_USER: "no-reply@sparta.local",
  SPARTA_BUILDING_CALLBACK_URL:
    "https://building.sparta.local/auth/sso/callback",
  SPARTA_MAINTENANCE_CALLBACK_URL:
    "https://maintenance.sparta.local/auth/sso/callback",
  SPARTA_ENERGY_CALLBACK_URL: "https://energy.sparta.local/auth/sso/callback",
  SPARTA_SIAGA_CALLBACK_URL:
    "https://siaga.sparta-alfamart.web.id/auth/sso/callback",
  SPARTA_CARBONTRACK_CALLBACK_URL:
    "https://grk.sparta-alfamart.web.id/api/auth/sso/callback",
  SPARTA_INTERNAL_API_KEY: "test-internal-api-key",
} satisfies AppEnv

const BRANCHES: Record<string, string> = {
  CIL: "CILEUNGSI",
  CIK: "CIKOKOL",
}

class InMemoryStoreRepository implements StoreRepository {
  stores = new Map<string, StoreRecord>()
  audits: Array<{ action: string; entityId: string }> = []
  brandRules = new Map<string, SpartaModuleId[]>([
    ["ALFAMART", ["BUILDING", "MAINTENANCE", "ENERGY", "SIAGA", "CARBONTRACK"]],
    ["LAWSON", ["MAINTENANCE"]],
  ])

  constructor() {
    this.stores.set("C218", {
      code: "C218",
      name: "DUREN JAYA PERMAI",
      branchCode: "CIL",
      branchName: "CILEUNGSI",
      subArea: "BEKASI",
      brand: "ALFAMART",
      ownershipType: "REGULAR",
      latitude: null,
      longitude: null,
      isActive: true,
      source: "MAINTENANCE",
      updatedAt: new Date("2026-11-10T00:00:00Z"),
    })
    this.stores.set("T968", {
      code: "T968",
      name: "RUKO BATAVIA",
      branchCode: "CIK",
      branchName: "CIKOKOL",
      subArea: null,
      brand: "ALFAMART",
      ownershipType: "REGULAR",
      latitude: null,
      longitude: null,
      isActive: false,
      source: "MAINTENANCE",
      updatedAt: new Date("2026-11-18T00:00:00Z"),
    })
  }

  async listStores(query: ListStoresQuery) {
    const needle = query.q?.toUpperCase() ?? ""
    const rows = [...this.stores.values()].filter(
      (store) =>
        (!needle ||
          store.code.includes(needle) ||
          store.name.includes(needle)) &&
        (!query.branchCode || store.branchCode === query.branchCode) &&
        (!query.brand || store.brand === query.brand) &&
        (query.status === "all" ||
          store.isActive === (query.status === "active"))
    )
    const start = (query.page - 1) * query.pageSize
    return {
      rows: rows.slice(start, start + query.pageSize),
      total: rows.length,
    }
  }
  async countStores(): Promise<StoreCounts> {
    const all = [...this.stores.values()]
    return {
      activeCount: all.filter((s) => s.isActive).length,
      inactiveCount: all.filter((s) => !s.isActive).length,
      withoutSubAreaCount: all.filter((s) => !s.subArea).length,
    }
  }
  async storeExists(code: string) {
    return this.stores.has(code)
  }
  async branchExists(code: string) {
    return code in BRANCHES
  }
  async createStore(input: CreateStoreInput) {
    this.stores.set(input.code, {
      ...input,
      branchName: BRANCHES[input.branchCode],
      latitude: null,
      longitude: null,
      isActive: true,
      source: "MANUAL",
      updatedAt: new Date(),
    })
  }
  async updateStore(code: string, patch: UpdateStoreInput) {
    const store = this.stores.get(code)!
    Object.assign(store, patch)
    if (patch.branchCode) store.branchName = BRANCHES[patch.branchCode]
  }
  async listBrands() {
    const brands = new Set([
      ...this.brandRules.keys(),
      ...[...this.stores.values()].map((s) => s.brand ?? ""),
    ])
    brands.delete("")
    return [...brands].map((code) => ({
      code,
      name: code,
      moduleIds: this.brandRules.get(code) ?? [],
      storeCount: [...this.stores.values()].filter((s) => s.brand === code)
        .length,
      hasRule: this.brandRules.has(code),
    }))
  }
  async setBrandModules(
    code: string,
    _name: string,
    moduleIds: SpartaModuleId[]
  ) {
    this.brandRules.set(code, moduleIds)
    for (const store of this.stores.values()) {
      if (store.brand === code) store.updatedAt = new Date()
    }
  }
  addLawsonStore() {
    this.stores.set("L001", {
      code: "L001",
      name: "LAWSON SUDIRMAN",
      branchCode: "CIK",
      branchName: "CIKOKOL",
      subArea: null,
      brand: "LAWSON",
      ownershipType: "REGULAR",
      latitude: null,
      longitude: null,
      isActive: true,
      source: "MAINTENANCE",
      updatedAt: new Date("2026-11-01T00:00:00Z"),
    })
  }
  async listForSync(updatedSince?: Date) {
    return [...this.stores.values()].filter(
      (store) => !updatedSince || store.updatedAt > updatedSince
    )
  }
  async createAuditEvent(input: { action: string; entityId: string }) {
    this.audits.push({ action: input.action, entityId: input.entityId })
  }
}

describe("StoreService", () => {
  let repository: InMemoryStoreRepository
  let service: StoreService

  beforeEach(() => {
    repository = new InMemoryStoreRepository()
    service = new StoreService(repository)
  })

  it("lists a filtered page with counts for the whole store table", async () => {
    const result = await service.listStores(
      listStoresQuerySchema.parse({ status: "active" })
    )

    expect(result.data.map((store) => store.code)).toEqual(["C218"])
    expect(result.meta).toMatchObject({
      total: 1,
      page: 1,
      pageSize: 20,
      activeCount: 1,
      inactiveCount: 1,
      withoutSubAreaCount: 1,
    })
  })

  it("creates a store with an uppercase code and records an audit event", async () => {
    await service.createStore(
      createStoreSchema.parse({
        code: " a123 ",
        name: "Toko Baru",
        branchCode: "CIL",
        subArea: "bogor",
      }),
      "admin-1"
    )

    expect(repository.stores.get("A123")).toMatchObject({
      subArea: "BOGOR",
      source: "MANUAL",
    })
    expect(repository.audits).toContainEqual({
      action: "STORE_CREATED",
      entityId: "A123",
    })
  })

  it("rejects a duplicate code and an unknown branch", async () => {
    await expect(
      service.createStore(
        createStoreSchema.parse({
          code: "C218",
          name: "Dobel",
          branchCode: "CIL",
        }),
        "admin-1"
      )
    ).rejects.toMatchObject({ code: "MASTER_CODE_TAKEN", statusCode: 409 })

    await expect(
      service.createStore(
        createStoreSchema.parse({
          code: "Z999",
          name: "Baru",
          branchCode: "XXX",
        }),
        "admin-1"
      )
    ).rejects.toMatchObject({ code: "MASTER_BRANCH_UNKNOWN", statusCode: 400 })
  })

  it("rejects store codes that are not 3-10 letters or digits", () => {
    expect(
      createStoreSchema.safeParse({
        code: "CIBULUH SU",
        name: "X",
        branchCode: "CIL",
      }).success
    ).toBe(false)
  })

  it("moves a store to another branch and deactivates it", async () => {
    await service.updateStore(
      "C218",
      { branchCode: "CIK", isActive: false },
      "admin-1"
    )

    expect(repository.stores.get("C218")).toMatchObject({
      branchCode: "CIK",
      branchName: "CIKOKOL",
      isActive: false,
    })
    await expect(
      service.updateStore("NOPE", { isActive: true }, "admin-1")
    ).rejects.toMatchObject({ code: "MASTER_NOT_FOUND", statusCode: 404 })
  })
})

describe("StoreService brand rules", () => {
  let repository: InMemoryStoreRepository
  let service: StoreService

  beforeEach(() => {
    repository = new InMemoryStoreRepository()
    repository.addLawsonStore()
    service = new StoreService(repository)
  })

  it("filters the admin list by brand", async () => {
    const result = await service.listStores(
      listStoresQuerySchema.parse({ brand: "lawson" })
    )
    expect(result.data.map((store) => store.code)).toEqual(["L001"])
    expect(result.meta.total).toBe(1)
  })

  it("sends Lawson stores only to Maintenance on a full sync", async () => {
    const codes = async (moduleId: "maintenance" | "energy") =>
      (await service.listForModule(moduleId)).map((store) => store.code)

    expect(await codes("maintenance")).toContain("L001")
    expect(await codes("energy")).not.toContain("L001")
  })

  it("opens Lawson to Energy, then hides it again as inactive in delta sync", async () => {
    const before = new Date(Date.now() - 1000)

    await service.setBrandModules(
      "LAWSON",
      { moduleIds: ["maintenance", "energy"] },
      "admin-1"
    )
    const opened = await service.listForModule("energy", before)
    expect(opened.find((store) => store.code === "L001")?.isActive).toBe(true)

    await service.setBrandModules(
      "LAWSON",
      { moduleIds: ["maintenance"] },
      "admin-1"
    )
    const closed = await service.listForModule("energy", before)
    expect(closed.find((store) => store.code === "L001")?.isActive).toBe(false)
    expect(repository.audits).toContainEqual({
      action: "STORE_BRAND_MODULES_UPDATED",
      entityId: "LAWSON",
    })
  })

  it("lists brands with public module ids and rejects unknown brands", async () => {
    const lawson = (await service.listBrands()).find((b) => b.code === "LAWSON")
    expect(lawson).toMatchObject({ moduleIds: ["maintenance"], storeCount: 1 })

    await expect(
      service.setBrandModules("NOPE", { moduleIds: [] }, "admin-1")
    ).rejects.toMatchObject({ code: "MASTER_NOT_FOUND", statusCode: 404 })
  })
})

describe("store routes", () => {
  function createTestApp() {
    return createApp(testEnv, {
      storeRepository: new InMemoryStoreRepository(),
    })
  }

  it("serves stores to modules with the internal API key and updatedSince", async () => {
    await request(createTestApp()).get("/v1/master/stores").expect(401)
    await request(createTestApp())
      .get("/v1/master/stores")
      .set("x-sparta-internal-key", testEnv.SPARTA_INTERNAL_API_KEY)
      .expect(400)

    const response = await request(createTestApp())
      .get("/v1/master/stores")
      .query({ moduleId: "carbontrack", updatedSince: "2026-11-15T00:00:00Z" })
      .set("x-sparta-internal-key", testEnv.SPARTA_INTERNAL_API_KEY)
      .expect(200)

    expect(response.body.data).toEqual([
      expect.objectContaining({
        code: "T968",
        branchCode: "CIK",
        subArea: null,
        isActive: false,
      }),
    ])
    expect(response.body.meta.count).toBe(1)
  })

  it("requires a session for the admin store list", async () => {
    await request(createTestApp()).get("/v1/admin/master/stores").expect(401)
  })
})
