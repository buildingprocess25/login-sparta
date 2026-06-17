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
} satisfies AppEnv

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
  auditEvents: Array<{ action: string; entityType: string; entityId: string }> = []

  async listUsers() {
    return [...this.users.values()]
  }

  async findUserById(userId: string) {
    return this.users.get(userId) ?? null
  }

  async createUser(input: CreateUserInput, actorUserId: string) {
    const user: UserListRecord = {
      id: `user-${this.users.size + 1}`,
      email: input.email,
      employeeId: input.employeeId,
      fullName: input.fullName,
      branchCode: input.branchCode,
      branchName: input.branchName,
      role: input.role,
      status: "ACTIVE",
      passwordState: "BRANCH_DEFAULT",
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

  async updateUser(userId: string, input: UpdateUserInput, actorUserId: string) {
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
    moduleId: SpartaModuleId,
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
    moduleId: SpartaModuleId,
    actorUserId: string
  ) {
    const user = this.users.get(userId)
    const existing = user?.modules.find((module) => module.moduleId === moduleId)
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

    await agent.patch(`/v1/admin/users/${user.id}`).send({ status: "INACTIVE" }).expect(200)
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

    await agent.put(`/v1/admin/users/${user.id}/access/energy`).send({ role: "MANAGER" }).expect(200)
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
