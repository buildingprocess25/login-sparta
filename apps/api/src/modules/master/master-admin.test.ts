import request from "supertest"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { createApp } from "../../app"
import type { AppEnv } from "../../config/env"
import { requireRoles } from "../../middleware/require-roles"
import { AuthError } from "../auth/auth.service"
import type {
  AdminAreaRecord,
  AdminBranchRecord,
  AreaPatch,
  BranchPatch,
  MasterAdminRepository,
} from "./master-admin.repository"
import { MasterAdminService } from "./master-admin.service"

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

class InMemoryMasterAdminRepository implements MasterAdminRepository {
  branches = new Map<string, AdminBranchRecord>()
  areas = new Map<string, AdminAreaRecord>()
  audits: Array<{ action: string; entityId: string }> = []
  private aliasSeq = 0

  async listBranches() {
    return [...this.branches.values()]
  }
  async listAreas() {
    return [...this.areas.values()]
  }
  async branchExists(code: string) {
    return this.branches.has(code)
  }
  async areaExists(code: string) {
    return this.areas.has(code)
  }
  async isBranchActive(code: string) {
    const branch = this.branches.get(code)
    return branch ? branch.isActive : null
  }
  async findAliasOwner(alias: string) {
    for (const branch of this.branches.values()) {
      if (branch.aliases.some((item) => item.alias === alias))
        return branch.code
    }
    return null
  }
  async findAlias(aliasId: string) {
    for (const branch of this.branches.values()) {
      const found = branch.aliases.find((item) => item.id === aliasId)
      if (found)
        return { id: found.id, alias: found.alias, branchCode: branch.code }
    }
    return null
  }
  async createBranch(input: {
    code: string
    name: string
    address: string | null
    areaCode: string | null
  }) {
    this.branches.set(input.code, {
      ...input,
      areaName: input.areaCode ? this.areas.get(input.areaCode)!.name : null,
      isActive: true,
      userCount: 0,
      aliases: [],
      updatedAt: new Date(),
    })
  }
  async updateBranch(code: string, patch: BranchPatch) {
    Object.assign(this.branches.get(code)!, patch)
  }
  async createArea(input: { code: string; name: string }) {
    this.areas.set(input.code, {
      ...input,
      isActive: true,
      branchCount: 0,
      updatedAt: new Date(),
    })
  }
  async updateArea(code: string, patch: AreaPatch) {
    Object.assign(this.areas.get(code)!, patch)
  }
  async createAlias(branchCode: string, alias: string, source: string) {
    this.aliasSeq += 1
    this.branches
      .get(branchCode)!
      .aliases.push({ id: `alias-${this.aliasSeq}`, alias, source })
  }
  async deleteAlias(aliasId: string) {
    for (const branch of this.branches.values()) {
      branch.aliases = branch.aliases.filter((item) => item.id !== aliasId)
    }
  }
  async createAuditEvent(input: { action: string; entityId: string }) {
    this.audits.push({ action: input.action, entityId: input.entityId })
  }
}

describe("MasterAdminService", () => {
  let repository: InMemoryMasterAdminRepository
  let service: MasterAdminService

  beforeEach(async () => {
    repository = new InMemoryMasterAdminRepository()
    service = new MasterAdminService(repository)
    await service.createArea({ code: "JABAR", name: "Jawa Barat" }, "admin-1")
    await service.createBranch(
      { code: "HEAD", name: "HEAD OFFICE", address: null, areaCode: null },
      "admin-1"
    )
  })

  it("creates a branch in an area and records an audit event", async () => {
    await service.createBranch(
      { code: "BDG", name: "Bandung", address: null, areaCode: "JABAR" },
      "admin-1"
    )

    const branches = await service.listBranches()
    expect(branches.find((branch) => branch.code === "BDG")).toMatchObject({
      areaCode: "JABAR",
      areaName: "Jawa Barat",
    })
    expect(repository.audits.at(-1)).toEqual({
      action: "BRANCH_CREATED",
      entityId: "BDG",
    })
  })

  it("rejects a duplicate branch code", async () => {
    await expect(
      service.createBranch(
        { code: "HEAD", name: "Lain", address: null, areaCode: null },
        "admin-1"
      )
    ).rejects.toMatchObject({ statusCode: 409, code: "MASTER_CODE_TAKEN" })
  })

  it("rejects a branch in an unknown area", async () => {
    await expect(
      service.createBranch(
        { code: "SBY", name: "Surabaya", address: null, areaCode: "JATIM" },
        "admin-1"
      )
    ).rejects.toMatchObject({ statusCode: 400, code: "MASTER_AREA_UNKNOWN" })
  })

  it("deactivates a branch instead of deleting it", async () => {
    await service.updateBranch("HEAD", { isActive: false }, "admin-1")
    expect(repository.branches.get("HEAD")?.isActive).toBe(false)
    expect(repository.branches.size).toBe(1)
  })

  it("normalizes aliases and rejects one already used by another branch", async () => {
    await service.createBranch(
      { code: "BDG", name: "Bandung", address: null, areaCode: null },
      "admin-1"
    )
    await service.addAlias("HEAD", "  head   office ", "admin-1")
    expect(repository.branches.get("HEAD")?.aliases[0]?.alias).toBe(
      "HEAD OFFICE"
    )

    await expect(
      service.addAlias("BDG", "Head Office", "admin-1")
    ).rejects.toMatchObject({ statusCode: 409, code: "MASTER_ALIAS_TAKEN" })
  })

  it("accepts the code of a deactivated branch as an alias", async () => {
    await service.createBranch(
      { code: "CIKOKOL", name: "CIKOKOL", address: null, areaCode: null },
      "admin-1"
    )
    await service.createBranch(
      { code: "KZ01", name: "CIKOKOL", address: null, areaCode: null },
      "admin-1"
    )
    await expect(
      service.addAlias("KZ01", "CIKOKOL", "admin-1")
    ).rejects.toMatchObject({ code: "MASTER_ALIAS_TAKEN" })

    await service.updateBranch("CIKOKOL", { isActive: false }, "admin-1")
    await service.addAlias("KZ01", "CIKOKOL", "admin-1")
    expect(repository.branches.get("KZ01")?.aliases[0]?.alias).toBe("CIKOKOL")
  })

  it("rejects an alias equal to another branch code", async () => {
    await service.createBranch(
      { code: "BDG", name: "Bandung", address: null, areaCode: null },
      "admin-1"
    )
    await expect(
      service.addAlias("HEAD", "bdg", "admin-1")
    ).rejects.toMatchObject({ statusCode: 409 })
  })

  it("removes an alias only from its own branch", async () => {
    await service.addAlias("HEAD", "HEAD OFFICE", "admin-1")
    const aliasId = repository.branches.get("HEAD")!.aliases[0]!.id

    await expect(
      service.removeAlias("BDG", aliasId, "admin-1")
    ).rejects.toMatchObject({ statusCode: 404 })

    await service.removeAlias("HEAD", aliasId, "admin-1")
    expect(repository.branches.get("HEAD")?.aliases).toEqual([])
  })
})

describe("requireRoles", () => {
  function run(role: string | null) {
    const next = vi.fn()
    const requestLike = role
      ? { spartaSession: { user: { role } } }
      : { spartaSession: undefined }
    requireRoles(["SYSTEM_ADMIN", "MASTER_ADMIN"])(
      requestLike as never,
      {} as never,
      next
    )
    return next.mock.calls[0]?.[0]
  }

  it("allows master data roles", () => {
    expect(run("MASTER_ADMIN")).toBeUndefined()
    expect(run("SYSTEM_ADMIN")).toBeUndefined()
  })

  it("rejects ordinary users with 403 and missing sessions with 401", () => {
    expect(run("USER")).toBeInstanceOf(AuthError)
    expect((run("USER") as AuthError).statusCode).toBe(403)
    expect((run(null) as AuthError).statusCode).toBe(401)
  })
})

describe("admin master routes", () => {
  it("require a session", async () => {
    await request(
      createApp(testEnv, {
        masterAdminRepository: new InMemoryMasterAdminRepository(),
      })
    )
      .get("/v1/admin/master/branches")
      .expect(401)
  })
})
