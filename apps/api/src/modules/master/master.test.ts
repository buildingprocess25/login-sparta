import request from "supertest"
import { describe, expect, it } from "vitest"

import { createApp } from "../../app"
import type { AppEnv } from "../../config/env"
import { normalizeBranchAlias } from "./branch-alias"
import type {
  MasterAreaRecord,
  MasterBranchRecord,
  MasterListFilter,
  MasterRepository,
} from "./master.repository"

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

class InMemoryMasterRepository implements MasterRepository {
  branches: MasterBranchRecord[] = [
    {
      code: "HEAD",
      name: "HEAD OFFICE",
      address: null,
      areaCode: null,
      isActive: true,
      aliases: [],
      updatedAt: new Date("2026-11-01T00:00:00Z"),
    },
    {
      code: "BDG",
      name: "Bandung",
      address: "Jl. Soekarno-Hatta",
      areaCode: "JABAR",
      isActive: true,
      aliases: ["BANDUNG"],
      updatedAt: new Date("2026-11-18T00:00:00Z"),
    },
  ]

  areas: MasterAreaRecord[] = [
    {
      code: "JABAR",
      name: "Jawa Barat",
      isActive: true,
      updatedAt: new Date("2026-11-10T00:00:00Z"),
    },
  ]

  async listBranches(filter: MasterListFilter) {
    return this.branches.filter(
      (branch) => !filter.updatedSince || branch.updatedAt > filter.updatedSince
    )
  }

  async listAreas(filter: MasterListFilter) {
    return this.areas.filter(
      (area) => !filter.updatedSince || area.updatedAt > filter.updatedSince
    )
  }
}

function createTestApp() {
  return createApp(testEnv, {
    masterRepository: new InMemoryMasterRepository(),
  })
}

describe("SPARTA master data routes", () => {
  it("rejects requests without the internal API key", async () => {
    await request(createTestApp()).get("/v1/master/branches").expect(401)
  })

  it("lists all branches with area codes and a sync cursor", async () => {
    const response = await request(createTestApp())
      .get("/v1/master/branches")
      .set("x-sparta-internal-key", testEnv.SPARTA_INTERNAL_API_KEY)
      .expect(200)

    expect(response.body.data).toHaveLength(2)
    expect(response.body.data[1]).toMatchObject({
      code: "BDG",
      name: "Bandung",
      areaCode: "JABAR",
      isActive: true,
      aliases: ["BANDUNG"],
    })
    expect(response.body.meta.count).toBe(2)
    expect(Date.parse(response.body.meta.syncedAt)).not.toBeNaN()
  })

  it("returns only branches changed after updatedSince", async () => {
    const response = await request(createTestApp())
      .get("/v1/master/branches")
      .query({ updatedSince: "2026-11-15T00:00:00Z" })
      .set("x-sparta-internal-key", testEnv.SPARTA_INTERNAL_API_KEY)
      .expect(200)

    expect(
      response.body.data.map((branch: { code: string }) => branch.code)
    ).toEqual(["BDG"])
  })

  it("rejects an invalid updatedSince value", async () => {
    await request(createTestApp())
      .get("/v1/master/branches")
      .query({ updatedSince: "bukan-tanggal" })
      .set("x-sparta-internal-key", testEnv.SPARTA_INTERNAL_API_KEY)
      .expect(400)
  })

  it("lists areas", async () => {
    const response = await request(createTestApp())
      .get("/v1/master/areas")
      .set("x-sparta-internal-key", testEnv.SPARTA_INTERNAL_API_KEY)
      .expect(200)

    expect(response.body.data).toEqual([
      expect.objectContaining({ code: "JABAR", name: "Jawa Barat" }),
    ])
  })
})

describe("normalizeBranchAlias", () => {
  it("treats case and spacing differences as the same alias", () => {
    expect(normalizeBranchAlias("  Head   office ")).toBe("HEAD OFFICE")
    expect(normalizeBranchAlias("HEAD OFFICE")).toBe("HEAD OFFICE")
  })
})
