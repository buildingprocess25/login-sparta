import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"

import { createApp } from "../../app"
import type { AppEnv } from "../../config/env"
import { hashPassword } from "../../services/security/password-hash"
import type {
  AuthRepository,
  AuthSessionRecord,
  AuthUserRecord,
  CreateSessionInput,
} from "./auth.repository"

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
  revokedSessionIds = new Set<string>()

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
    this.revokedSessionIds.add(sessionId)

    for (const session of this.sessions.values()) {
      if (session.id === sessionId) {
        session.revokedAt = revokedAt
      }
    }
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

describe("SPARTA auth routes", () => {
  let repository: InMemoryAuthRepository

  beforeEach(() => {
    repository = new InMemoryAuthRepository()
    const user = createBranchDefaultUser()
    repository.users.set(user.email, user)
  })

  it("logs in a branch-default user with exact uppercase branch password and sets an HttpOnly cookie", async () => {
    const app = createApp(testEnv, { authRepository: repository })

    const response = await request(app)
      .post("/v1/auth/login")
      .send({
        email: "ANDI.HALIM@SPARTA.LOCAL",
        password: "JAKARTA PUSAT",
      })
      .expect(200)

    expect(response.body.data.session).toMatchObject({
      email: "andi.halim@sparta.local",
      fullName: "Andi Halim",
      branch: "Jakarta Pusat",
      access: ["building", "maintenance"],
      mustChangePassword: true,
    })
    const setCookie = response.headers["set-cookie"]
    const cookieHeader = Array.isArray(setCookie)
      ? setCookie.join(";")
      : setCookie

    expect(cookieHeader).toContain("HttpOnly")
  })

  it("rejects lowercase branch password for a branch-default user", async () => {
    const app = createApp(testEnv, { authRepository: repository })

    await request(app)
      .post("/v1/auth/login")
      .send({
        email: "andi.halim@sparta.local",
        password: "jakarta pusat",
      })
      .expect(401)
  })

  it("logs in a user-set password with Argon2 hash without requiring password change", async () => {
    repository.users.set(
      "andi.halim@sparta.local",
      createBranchDefaultUser({
        passwordHash: await hashPassword("sparta-password"),
        passwordState: "USER_SET",
      })
    )
    const app = createApp(testEnv, { authRepository: repository })

    const response = await request(app)
      .post("/v1/auth/login")
      .send({
        email: "andi.halim@sparta.local",
        password: "sparta-password",
      })
      .expect(200)

    expect(response.body.data.session.mustChangePassword).toBe(false)
  })

  it("logs in a reset-required user with current hash and keeps password change required", async () => {
    repository.users.set(
      "andi.halim@sparta.local",
      createBranchDefaultUser({
        passwordHash: await hashPassword("temporary-password"),
        passwordState: "RESET_REQUIRED",
      })
    )
    const app = createApp(testEnv, { authRepository: repository })

    const response = await request(app)
      .post("/v1/auth/login")
      .send({
        email: "andi.halim@sparta.local",
        password: "temporary-password",
      })
      .expect(200)

    expect(response.body.data.session.mustChangePassword).toBe(true)
  })

  it("returns the current session from the session cookie", async () => {
    const app = createApp(testEnv, { authRepository: repository })
    const agent = request.agent(app)

    await agent
      .post("/v1/auth/login")
      .send({
        email: "andi.halim@sparta.local",
        password: "JAKARTA PUSAT",
      })
      .expect(200)

    const response = await agent.get("/v1/auth/me").expect(200)

    expect(response.body.data.session.email).toBe("andi.halim@sparta.local")
  })

  it("revokes the current session on logout", async () => {
    const app = createApp(testEnv, { authRepository: repository })
    const agent = request.agent(app)

    await agent
      .post("/v1/auth/login")
      .send({
        email: "andi.halim@sparta.local",
        password: "JAKARTA PUSAT",
      })
      .expect(200)

    await agent.post("/v1/auth/logout").expect(200)
    await agent.get("/v1/auth/me").expect(401)

    expect(repository.revokedSessionIds).toContain("session-1")
  })

  it("rejects inactive users", async () => {
    repository.users.set(
      "andi.halim@sparta.local",
      createBranchDefaultUser({ status: "INACTIVE" })
    )
    const app = createApp(testEnv, { authRepository: repository })

    await request(app)
      .post("/v1/auth/login")
      .send({
        email: "andi.halim@sparta.local",
        password: "JAKARTA PUSAT",
      })
      .expect(403)
  })

  it("rejects locked users", async () => {
    repository.users.set(
      "andi.halim@sparta.local",
      createBranchDefaultUser({
        status: "LOCKED",
        lockedUntil: new Date(Date.now() + 60_000),
      })
    )
    const app = createApp(testEnv, { authRepository: repository })

    await request(app)
      .post("/v1/auth/login")
      .send({
        email: "andi.halim@sparta.local",
        password: "JAKARTA PUSAT",
      })
      .expect(403)
  })
})
