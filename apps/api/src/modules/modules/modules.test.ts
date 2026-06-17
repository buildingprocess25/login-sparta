import type { SpartaModuleId } from "@sparta/shared"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"

import { createApp } from "../../app"
import type { AppEnv } from "../../config/env"
import type {
  AuthRepository,
  AuthSessionRecord,
  AuthUserRecord,
  CreateSessionInput,
} from "../auth/auth.repository"

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
} satisfies AppEnv

type ModuleRecord = {
  id: SpartaModuleId
  name: string
  shortName: string
  description: string
  callbackUrl: string
  colorHex: string
  isActive: boolean
  sortOrder: number
}

type ModuleLaunchInput = {
  userId: string
  moduleId: SpartaModuleId
  launchTokenHash: string
  redirectUrl: string
  ipAddress: string | null
  userAgent: string | null
  expiresAt: Date
}

class InMemoryAuthRepository implements AuthRepository {
  users = new Map<string, AuthUserRecord>()
  sessions = new Map<string, AuthSessionRecord>()

  async findUserByEmail(email: string) {
    return this.users.get(email.toLowerCase()) ?? null
  }

  async updateSuccessfulLogin(userId: string, lastLoginAt: Date) {
    const user = [...this.users.values()].find((record) => record.id === userId)

    if (user) {
      user.failedLoginCount = 0
      user.lastLoginAt = lastLoginAt
    }
  }

  async incrementFailedLogin(userId: string) {
    const user = [...this.users.values()].find((record) => record.id === userId)

    if (user) {
      user.failedLoginCount += 1
    }
  }

  async createSession(input: CreateSessionInput) {
    const user = [...this.users.values()].find(
      (record) => record.id === input.userId
    )

    if (!user) {
      throw new Error(`Missing test user ${input.userId}`)
    }

    const session: AuthSessionRecord = {
      ...input,
      id: `session-${this.sessions.size + 1}`,
      revokedAt: null,
      user,
    }

    this.sessions.set(session.tokenHash, session)

    return session
  }

  async findSessionByTokenHash(tokenHash: string) {
    const session = this.sessions.get(tokenHash)

    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      return null
    }

    return session
  }

  async revokeSession(sessionId: string, revokedAt: Date) {
    for (const session of this.sessions.values()) {
      if (session.id === sessionId) {
        session.revokedAt = revokedAt
      }
    }
  }
}

class InMemoryModuleRepository {
  modules = new Map<SpartaModuleId, ModuleRecord>()
  launches: Array<ModuleLaunchInput & { id: string; consumedAt: Date | null }> =
    []
  auditEvents: Array<{ action: string; entityType: string; actorUserId: string }> =
    []

  async listModules() {
    return [...this.modules.values()].sort(
      (left, right) => left.sortOrder - right.sortOrder
    )
  }

  async createLaunch(input: ModuleLaunchInput) {
    const launch = {
      ...input,
      id: `launch-${this.launches.length + 1}`,
      consumedAt: null,
    }

    this.launches.push(launch)

    return launch
  }

  async createAuditEvent(input: {
    action: string
    entityType: string
    actorUserId: string
  }) {
    this.auditEvents.push(input)
  }
}

function createBranchDefaultUser(
  override: Partial<AuthUserRecord> = {}
): AuthUserRecord {
  return {
    id: "user-1",
    email: "andi.halim@sparta.local",
    fullName: "Andi Halim",
    branchName: "Jakarta Pusat",
    passwordHash: null,
    passwordState: "BRANCH_DEFAULT",
    role: "USER",
    status: "ACTIVE",
    failedLoginCount: 0,
    lockedUntil: null,
    lastLoginAt: null,
    access: ["building", "maintenance"],
    ...override,
  }
}

function createModule(
  id: SpartaModuleId,
  sortOrder: number,
  override: Partial<ModuleRecord> = {}
): ModuleRecord {
  const metadata = {
    building: {
      name: "SPARTA Building",
      shortName: "Building",
      description:
        "Pengelolaan proyek pembangunan dari rencana hingga serah terima.",
      callbackUrl: "https://building.sparta.local/auth/sso/callback",
      colorHex: "#e6000b",
    },
    maintenance: {
      name: "SPARTA Maintenance",
      shortName: "Maintenance",
      description:
        "Pemeliharaan, perbaikan toko, dan pertanggungjawaban operasional.",
      callbackUrl: "https://maintenance.sparta.local/auth/sso/callback",
      colorHex: "#0069a7",
    },
    energy: {
      name: "SPARTA Energy",
      shortName: "Energy",
      description:
        "Audit perangkat dan estimasi kebutuhan energi toko terintegrasi.",
      callbackUrl: "https://energy.sparta.local/auth/sso/callback",
      colorHex: "#007a55",
    },
  } satisfies Record<SpartaModuleId, Omit<ModuleRecord, "id" | "isActive" | "sortOrder">>

  return {
    id,
    sortOrder,
    isActive: true,
    ...metadata[id],
    ...override,
  }
}

describe("SPARTA module routes", () => {
  let authRepository: InMemoryAuthRepository
  let moduleRepository: InMemoryModuleRepository

  beforeEach(() => {
    authRepository = new InMemoryAuthRepository()
    const user = createBranchDefaultUser()
    authRepository.users.set(user.email, user)

    moduleRepository = new InMemoryModuleRepository()
    moduleRepository.modules.set("energy", createModule("energy", 3))
    moduleRepository.modules.set("building", createModule("building", 1))
    moduleRepository.modules.set("maintenance", createModule("maintenance", 2))
  })

  function createAppWithFakes() {
    return createApp(testEnv, {
      authRepository,
      moduleRepository,
    })
  }

  async function login(agent: ReturnType<typeof request.agent>) {
    await agent
      .post("/v1/auth/login")
      .send({
        email: "andi.halim@sparta.local",
        password: "JAKARTA PUSAT",
      })
      .expect(200)
  }

  it("returns modules in Building, Maintenance, Energy order", async () => {
    const agent = request.agent(createAppWithFakes())
    await login(agent)

    const response = await agent.get("/v1/modules").expect(200)

    expect(response.body.data.modules.map((module: ModuleRecord) => module.id)).toEqual([
      "building",
      "maintenance",
      "energy",
    ])
  })

  it("marks access per current user", async () => {
    const agent = request.agent(createAppWithFakes())
    await login(agent)

    const response = await agent.get("/v1/modules").expect(200)

    expect(response.body.data.modules).toMatchObject([
      { id: "building", hasAccess: true },
      { id: "maintenance", hasAccess: true },
      { id: "energy", hasAccess: false },
    ])
  })

  it("rejects launching a module without access", async () => {
    const agent = request.agent(createAppWithFakes())
    await login(agent)

    await agent.post("/v1/modules/energy/launch").expect(403)
  })

  it("creates an audit event and launch record with one-time token redirect", async () => {
    const agent = request.agent(createAppWithFakes())
    await login(agent)

    const response = await agent.post("/v1/modules/building/launch").expect(200)
    const redirectUrl = new URL(response.body.data.redirectUrl)

    expect(redirectUrl.origin).toBe("https://building.sparta.local")
    expect(redirectUrl.searchParams.get("token")).toHaveLength(43)
    expect(moduleRepository.launches).toHaveLength(1)
    expect(moduleRepository.launches[0]).toMatchObject({
      userId: "user-1",
      moduleId: "building",
      redirectUrl: response.body.data.redirectUrl,
    })
    expect(moduleRepository.launches[0].launchTokenHash).not.toBe(
      redirectUrl.searchParams.get("token")
    )
    expect(moduleRepository.auditEvents).toContainEqual(
      expect.objectContaining({
        action: "MODULE_LAUNCHED",
        entityType: "ModuleLaunch",
        actorUserId: "user-1",
      })
    )
  })

  it("rejects launching an inactive module", async () => {
    moduleRepository.modules.set(
      "building",
      createModule("building", 1, { isActive: false })
    )
    const agent = request.agent(createAppWithFakes())
    await login(agent)

    await agent.post("/v1/modules/building/launch").expect(403)
  })
})
