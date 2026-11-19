import type { SpartaLaunchableModuleId } from "@sparta/shared"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"

import { createApp } from "../../app"
import type { AppEnv } from "../../config/env"
import { verifyPasswordHash } from "../../services/security/password-hash"
import type {
  AuthRepository,
  AuthSessionRecord,
  AuthUserRecord,
  CreateSessionInput,
} from "../auth/auth.repository"
import { InMemoryProvisioningRepository } from "../provisioning/provisioning.fakes"
import type {
  CreateUserInput,
  UpdateUserInput,
  UserListRecord,
  UsersRepository,
} from "./users.repository"

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
  SPARTA_SIAGA_CALLBACK_URL: "https://siaga.sparta.local/auth/sso/callback",
  SPARTA_CARBONTRACK_CALLBACK_URL:
    "https://grk.sparta.local/api/auth/sso/callback",
  SPARTA_INTERNAL_API_KEY: "test-internal-api-key",
} satisfies AppEnv

class InMemoryAuthRepository implements AuthRepository {
  users = new Map<string, AuthUserRecord>()
  sessions = new Map<string, AuthSessionRecord>()

  async findUserByEmail(email: string) {
    return this.users.get(email.toLowerCase()) ?? null
  }

  async findUserById(userId: string) {
    return [...this.users.values()].find((record) => record.id === userId) ?? null
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
    if (user) user.failedLoginCount += 1
  }

  async createSession(input: CreateSessionInput) {
    const user = [...this.users.values()].find(
      (record) => record.id === input.userId
    )

    if (!user) throw new Error(`Missing test user ${input.userId}`)

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
    return !session || session.revokedAt || session.expiresAt <= new Date()
      ? null
      : session
  }

  async revokeSession(sessionId: string, revokedAt: Date) {
    for (const session of this.sessions.values()) {
      if (session.id === sessionId) session.revokedAt = revokedAt
    }
  }
}

class InMemoryUsersRepository implements UsersRepository {
  users = new Map<string, UserListRecord>()
  auditEvents: Array<{ action: string; entityType: string; entityId: string }> =
    []

  async listUsers() {
    return [...this.users.values()]
  }

  async findUserById(userId: string) {
    return this.users.get(userId) ?? null
  }

  async findUserByEmail(email: string) {
    return [...this.users.values()].find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null
  }

  createInputs: CreateUserInput[] = []

  async createUser(input: CreateUserInput, actorUserId: string) {
    this.createInputs.push(input)
    const user: UserListRecord = {
      id: `user-${this.users.size + 1}`,
      email: input.email,
      employeeId: input.employeeId,
      fullName: input.fullName,
      branchCode: input.branchCode,
      branchName: input.branchName,
      validBranchNames: input.validBranchNames || [input.branchName],
      role: input.role,
      status: "ACTIVE",
      passwordState: input.initialPasswordHash
        ? "RESET_REQUIRED"
        : "BRANCH_DEFAULT",
      lastLoginAt: null,
      createdAt: new Date(),
      modules: input.modules.map((module) => ({
        ...module,
        isActive: true,
      })),
    }

    this.users.set(user.id, user)
    await this.createAuditEvent({
      action: "USER_CREATED",
      entityType: "User",
      entityId: user.id,
      actorUserId,
    })
    return user
  }

  async updateUser(
    userId: string,
    input: UpdateUserInput,
    actorUserId: string
  ) {
    const user = this.users.get(userId)
    if (!user) return

    Object.assign(user, input)
    await this.createAuditEvent({
      action: "USER_UPDATED",
      entityType: "User",
      entityId: userId,
      actorUserId,
    })
  }

  async grantModuleAccess(
    userId: string,
    moduleId: SpartaLaunchableModuleId,
    role: string,
    actorUserId: string
  ) {
    const user = this.users.get(userId)
    if (!user) return

    const existing = user.modules.find((module) => module.moduleId === moduleId)
    if (existing) {
      existing.role = role
      existing.isActive = true
    } else {
      user.modules.push({ moduleId, role, isActive: true })
    }

    await this.createAuditEvent({
      action: "MODULE_ACCESS_GRANTED",
      entityType: "UserModuleAccess",
      entityId: `${userId}:${moduleId}`,
      actorUserId,
    })
  }

  async revokeModuleAccess(
    userId: string,
    moduleId: SpartaLaunchableModuleId,
    actorUserId: string
  ) {
    const user = this.users.get(userId)
    const existing = user?.modules.find(
      (module) => module.moduleId === moduleId
    )
    if (existing) existing.isActive = false

    await this.createAuditEvent({
      action: "MODULE_ACCESS_REVOKED",
      entityType: "UserModuleAccess",
      entityId: `${userId}:${moduleId}`,
      actorUserId,
    })
  }

  async createAuditEvent(input: {
    action: string
    entityType: string
    entityId: string
    actorUserId: string
  }) {
    this.auditEvents.push(input)
  }
}

function createUser(override: Partial<AuthUserRecord> = {}): AuthUserRecord {
  return {
    id: "auth-user-1",
    email: "admin@sparta.local",
    fullName: "Admin SPARTA",
    branchName: "Jakarta Pusat",
    validBranchNames: ["Jakarta Pusat"],
    passwordHash: null,
    passwordState: "BRANCH_DEFAULT",
    role: "SYSTEM_ADMIN",
    status: "ACTIVE",
    failedLoginCount: 0,
    lockedUntil: null,
    lastLoginAt: null,
    access: ["building", "maintenance", "energy"],
    ...override,
  }
}

describe("SPARTA admin users routes", () => {
  let authRepository: InMemoryAuthRepository
  let usersRepository: InMemoryUsersRepository

  beforeEach(() => {
    authRepository = new InMemoryAuthRepository()
    usersRepository = new InMemoryUsersRepository()
    authRepository.users.set("admin@sparta.local", createUser())
    authRepository.users.set(
      "user@sparta.local",
      createUser({
        id: "auth-user-2",
        email: "user@sparta.local",
        role: "USER",
      })
    )
  })

  function createAppWithFakes() {
    return createApp(testEnv, { authRepository, usersRepository })
  }

  async function login(email = "admin@sparta.local") {
    const agent = request.agent(createAppWithFakes())
    await agent.post("/v1/auth/login").send({
      email,
      password: "JAKARTA PUSAT",
    })
    return agent
  }

  it("rejects non-admin user listing", async () => {
    const agent = await login("user@sparta.local")
    await agent.get("/v1/admin/users").expect(403)
  })

  it("creates a user with branch and module access", async () => {
    const agent = await login()

    const response = await agent
      .post("/v1/admin/users")
      .send({
        email: "andi.halim@sparta.local",
        fullName: "Andi Halim",
        employeeId: "EMP001",
        branchCode: "JKT-PST",
        branchName: "Jakarta Pusat",
        modules: [{ moduleId: "building", role: "USER" }],
      })
      .expect(201)

    expect(response.body.data).toMatchObject({
      email: "andi.halim@sparta.local",
      branchCode: "JKT-PST",
      modules: [{ moduleId: "building", role: "USER", isActive: true }],
    })
    expect(usersRepository.auditEvents).toContainEqual(
      expect.objectContaining({ action: "USER_CREATED" })
    )
  })

  it("deactivates a user", async () => {
    const agent = await login()
    const user = await usersRepository.createUser(
      {
        email: "dina.putri@sparta.local",
        employeeId: "EMP002",
        fullName: "Dina Putri",
        branchCode: "SBY",
        branchName: "Surabaya",
        role: "USER",
        modules: [],
      },
      "auth-user-1"
    )

    await agent
      .patch(`/v1/admin/users/${user.id}`)
      .send({ status: "INACTIVE" })
      .expect(200)
    expect(usersRepository.users.get(user.id)?.status).toBe("INACTIVE")
  })

  it("grants and revokes module access", async () => {
    const agent = await login()
    const user = await usersRepository.createUser(
      {
        email: "raka.wijaya@sparta.local",
        employeeId: "EMP003",
        fullName: "Raka Wijaya",
        branchCode: "BDG",
        branchName: "Bandung",
        role: "USER",
        modules: [],
      },
      "auth-user-1"
    )

    await agent
      .put(`/v1/admin/users/${user.id}/access/energy`)
      .send({ role: "MANAGER" })
      .expect(200)
    expect(usersRepository.users.get(user.id)?.modules).toContainEqual({
      moduleId: "energy",
      role: "MANAGER",
      isActive: true,
    })

    await agent.delete(`/v1/admin/users/${user.id}/access/energy`).expect(200)
    expect(usersRepository.users.get(user.id)?.modules[0]?.isActive).toBe(false)
    expect(usersRepository.auditEvents).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ action: "MODULE_ACCESS_GRANTED" }),
        expect.objectContaining({ action: "MODULE_ACCESS_REVOKED" }),
      ])
    )
  })
})

describe("SPARTA internal user sync", () => {
  let usersRepository: InMemoryUsersRepository

  const syncPayload = {
    email: "nina.energy@sparta.local",
    employeeId: null,
    fullName: "nina.energy",
    branchCode: "HEAD OFFICE",
    branchName: "HEAD OFFICE",
    role: "USER",
    moduleId: "carbontrack",
  }

  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
  })

  function sync(
    env: AppEnv,
    path: "/v1/admin/users/sync" | "/v1/admin/users/sync-delete",
    body: object
  ) {
    return request(
      createApp(env, {
        authRepository: new InMemoryAuthRepository(),
        usersRepository,
      })
    )
      .post(path)
      .set("x-sparta-internal-key", env.SPARTA_INTERNAL_API_KEY)
      .send(body)
  }

  async function seedExistingUser(
    override: Partial<UserListRecord> = {}
  ): Promise<UserListRecord> {
    const user = await usersRepository.createUser(
      {
        email: "nina.energy@sparta.local",
        employeeId: "EMP010",
        fullName: "Nina Kusuma",
        branchCode: "BDG",
        branchName: "Bandung",
        validBranchNames: ["Bandung"],
        role: "USER",
        modules: [{ moduleId: "energy", role: "MANAGER" }],
      },
      "auth-user-1"
    )
    Object.assign(user, override)
    usersRepository.createInputs = []
    return user
  }

  it("creates new sync users with the env default password, reset required", async () => {
    const env = { ...testEnv, SPARTA_SYNC_DEFAULT_PASSWORD: "ptsat123" }

    const response = await sync(env, "/v1/admin/users/sync", syncPayload).expect(
      200
    )

    expect(response.body.data).toMatchObject({
      email: "nina.energy@sparta.local",
      passwordState: "RESET_REQUIRED",
      modules: [{ moduleId: "carbontrack", role: "USER", isActive: true }],
    })
    expect(response.body.data).not.toHaveProperty("initialPasswordHash")

    const hashValue = usersRepository.createInputs[0]?.initialPasswordHash
    expect(hashValue).toBeTruthy()
    expect(hashValue).not.toBe("ptsat123")
    expect(await verifyPasswordHash(hashValue!, "ptsat123")).toBe(true)
  })

  it("keeps branch-default password for new sync users when env is unset", async () => {
    const response = await sync(
      testEnv,
      "/v1/admin/users/sync",
      syncPayload
    ).expect(200)

    expect(response.body.data.passwordState).toBe("BRANCH_DEFAULT")
    expect(usersRepository.createInputs[0]?.initialPasswordHash).toBeUndefined()
  })

  it("grants module access without overwriting an existing user's profile", async () => {
    const env = { ...testEnv, SPARTA_SYNC_DEFAULT_PASSWORD: "ptsat123" }
    const user = await seedExistingUser({ passwordState: "USER_SET" })

    await sync(env, "/v1/admin/users/sync", syncPayload).expect(200)

    const updated = usersRepository.users.get(user.id)
    expect(updated).toMatchObject({
      fullName: "Nina Kusuma",
      branchCode: "BDG",
      branchName: "Bandung",
      passwordState: "USER_SET",
      status: "ACTIVE",
    })
    expect(updated?.validBranchNames).toEqual(["Bandung", "HEAD OFFICE"])
    expect(updated?.modules).toEqual(
      expect.arrayContaining([
        { moduleId: "energy", role: "MANAGER", isActive: true },
        { moduleId: "carbontrack", role: "USER", isActive: true },
      ])
    )
    expect(usersRepository.createInputs).toHaveLength(0)
  })

  it("returns spartaUserId in the sync response", async () => {
    const response = await sync(
      testEnv,
      "/v1/admin/users/sync",
      syncPayload
    ).expect(200)

    expect(response.body.data.spartaUserId).toBeTruthy()
    expect(response.body.data.spartaUserId).toBe(response.body.data.id)
  })

  it("revokes module access by spartaUserId even after the email changed", async () => {
    const user = await seedExistingUser({
      modules: [{ moduleId: "carbontrack", role: "USER", isActive: true }],
    })

    await sync(testEnv, "/v1/admin/users/sync-delete", {
      spartaUserId: user.id,
      email: "old.address@sparta.local",
      moduleId: "carbontrack",
    }).expect(200)

    expect(usersRepository.users.get(user.id)).toMatchObject({
      status: "INACTIVE",
      modules: [{ moduleId: "carbontrack", role: "USER", isActive: false }],
    })
  })

  it("rejects sync-delete without spartaUserId and email", async () => {
    await sync(testEnv, "/v1/admin/users/sync-delete", {
      moduleId: "carbontrack",
    }).expect(400)
  })

  it("reactivates a user deactivated by sync-delete when re-synced", async () => {
    const user = await seedExistingUser({
      modules: [{ moduleId: "carbontrack", role: "USER", isActive: true }],
    })

    await sync(testEnv, "/v1/admin/users/sync-delete", {
      email: syncPayload.email,
      moduleId: "carbontrack",
    }).expect(200)
    expect(usersRepository.users.get(user.id)?.status).toBe("INACTIVE")

    await sync(testEnv, "/v1/admin/users/sync", syncPayload).expect(200)
    expect(usersRepository.users.get(user.id)).toMatchObject({
      status: "ACTIVE",
      modules: [{ moduleId: "carbontrack", role: "USER", isActive: true }],
    })
  })

  it("prefers the module-supplied initialPassword over the env fallback", async () => {
    const env = { ...testEnv, SPARTA_SYNC_DEFAULT_PASSWORD: "ptsat123" }

    const response = await sync(env, "/v1/admin/users/sync", {
      ...syncPayload,
      initialPassword: "carbon-start-1",
    }).expect(200)

    expect(response.body.data.passwordState).toBe("RESET_REQUIRED")
    expect(JSON.stringify(response.body)).not.toContain("carbon-start-1")
    const hashValue = usersRepository.createInputs[0]?.initialPasswordHash
    expect(await verifyPasswordHash(hashValue!, "carbon-start-1")).toBe(true)
    expect(await verifyPasswordHash(hashValue!, "ptsat123")).toBe(false)
  })

  it("ignores initialPassword for existing users", async () => {
    const user = await seedExistingUser({ passwordState: "USER_SET" })

    await sync(testEnv, "/v1/admin/users/sync", {
      ...syncPayload,
      initialPassword: "carbon-start-1",
    }).expect(200)

    expect(usersRepository.createInputs).toHaveLength(0)
    expect(usersRepository.users.get(user.id)?.passwordState).toBe("USER_SET")
  })

  it("rejects an initialPassword shorter than 8 characters without creating a user", async () => {
    const response = await sync(testEnv, "/v1/admin/users/sync", {
      ...syncPayload,
      initialPassword: "short",
    }).expect(400)

    expect(response.body.error.code).toBe("INVALID_USERS_PAYLOAD")
    expect(usersRepository.users.size).toBe(0)
  })

  it("does not unlock a LOCKED user on sync", async () => {
    const user = await seedExistingUser({ status: "LOCKED" })

    await sync(testEnv, "/v1/admin/users/sync", syncPayload).expect(200)

    expect(usersRepository.users.get(user.id)?.status).toBe("LOCKED")
  })
})

describe("SPARTA admin users provisioning", () => {
  let authRepository: InMemoryAuthRepository
  let usersRepository: InMemoryUsersRepository
  let provisioningRepository: InMemoryProvisioningRepository

  beforeEach(() => {
    authRepository = new InMemoryAuthRepository()
    usersRepository = new InMemoryUsersRepository()
    provisioningRepository = new InMemoryProvisioningRepository()
    provisioningRepository.urls.set(
      "energy",
      "https://energy.sparta.local/provisioning"
    )
    provisioningRepository.roles = [
      { moduleId: "energy", code: "AUDITOR", label: "Auditor" },
    ]
    authRepository.users.set("admin@sparta.local", createUser())
  })

  async function login() {
    const agent = request.agent(
      createApp(testEnv, {
        authRepository,
        usersRepository,
        provisioningRepository,
      })
    )
    await agent
      .post("/v1/auth/login")
      .send({ email: "admin@sparta.local", password: "JAKARTA PUSAT" })
    return agent
  }

  async function seedUser() {
    return usersRepository.createUser(
      {
        email: "sari@sparta.local",
        employeeId: "EMP200",
        fullName: "Sari Wulan",
        branchCode: "BDG",
        branchName: "Bandung",
        role: "USER",
        modules: [],
      },
      "auth-user-1"
    )
  }

  it("rejects a role outside the module catalog", async () => {
    const agent = await login()
    const user = await seedUser()

    const response = await agent
      .put(`/v1/admin/users/${user.id}/access/energy`)
      .send({ role: "MANAGER" })
      .expect(400)
    expect(response.body.error.code).toBe("MODULE_ROLE_UNKNOWN")
    expect(provisioningRepository.events).toHaveLength(0)
  })

  it("queues access.granted and access.revoked events", async () => {
    const agent = await login()
    const user = await seedUser()

    await agent
      .put(`/v1/admin/users/${user.id}/access/energy`)
      .send({ role: "AUDITOR" })
      .expect(200)
    await agent.delete(`/v1/admin/users/${user.id}/access/energy`).expect(200)

    expect(
      provisioningRepository.events.map((event) => [
        event.type,
        event.status,
        event.payload.access,
      ])
    ).toEqual([
      ["access.granted", "PENDING", { isActive: true, role: "AUDITOR" }],
      ["access.revoked", "PENDING", { isActive: false, role: "AUDITOR" }],
    ])
  })

  it("queues user.updated on email change and user.deactivated on deactivation", async () => {
    const agent = await login()
    const user = await seedUser()
    await usersRepository.grantModuleAccess(user.id, "energy", "AUDITOR", "x")

    await agent
      .patch(`/v1/admin/users/${user.id}`)
      .send({ email: "sari.wulan@sparta.local" })
      .expect(200)
    await agent
      .patch(`/v1/admin/users/${user.id}`)
      .send({ status: "INACTIVE" })
      .expect(200)

    expect(provisioningRepository.events.map((event) => event.type)).toEqual([
      "user.updated",
      "user.deactivated",
    ])
    expect(provisioningRepository.events[0]?.payload.user.email).toBe(
      "sari.wulan@sparta.local"
    )
  })

  it("lists a user's events and retries a failed one", async () => {
    const agent = await login()
    const user = await seedUser()
    await agent
      .put(`/v1/admin/users/${user.id}/access/energy`)
      .send({ role: "AUDITOR" })
      .expect(200)
    const event = provisioningRepository.events[0]!
    event.status = "FAILED"

    const listed = await agent
      .get(`/v1/admin/users/${user.id}/provisioning-events`)
      .expect(200)
    expect(listed.body.data[0]).toMatchObject({ id: event.id, status: "FAILED" })

    await agent
      .post(`/v1/admin/users/provisioning-events/${event.id}/retry`)
      .expect(200)
    expect(event.status).toBe("PENDING")
    await agent
      .post(`/v1/admin/users/provisioning-events/${event.id}/retry`)
      .expect(404)
  })

  it("serves the module role catalog", async () => {
    const agent = await login()
    const response = await agent.get("/v1/admin/users/module-roles").expect(200)
    expect(response.body.data).toEqual([
      { moduleId: "energy", code: "AUDITOR", label: "Auditor" },
    ])
  })
})
