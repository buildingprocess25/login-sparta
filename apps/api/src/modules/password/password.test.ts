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
  CreateOtpChallengeInput,
  OtpChallengeRecord,
  PasswordRepository,
  UpdateOtpChallengeInput,
} from "./password.repository"
import type { EmailMessage, EmailProvider } from "../../services/email/email.service"

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

class TestEmailProvider implements EmailProvider {
  messages: EmailMessage[] = []

  async send(message: EmailMessage) {
    this.messages.push(message)
  }

  latestOtp() {
    const text = this.messages.at(-1)?.text ?? ""
    const match = text.match(/\b\d{6}\b/)

    if (!match) {
      throw new Error("Missing test OTP email")
    }

    return match[0]
  }
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

class InMemoryPasswordRepository implements PasswordRepository {
  users: Map<string, AuthUserRecord>
  challenges = new Map<string, OtpChallengeRecord>()

  constructor(users: Map<string, AuthUserRecord>) {
    this.users = users
  }

  async findUserByEmail(email: string) {
    return this.users.get(email.toLowerCase()) ?? null
  }

  async findUserById(userId: string) {
    return [...this.users.values()].find((user) => user.id === userId) ?? null
  }

  async updateUserPassword(userId: string, passwordHash: string) {
    const user = await this.findUserById(userId)

    if (user) {
      user.passwordHash = passwordHash
      user.passwordState = "USER_SET"
    }
  }

  async createOtpChallenge(input: CreateOtpChallengeInput) {
    const challenge: OtpChallengeRecord = {
      ...input,
      id: `otp-${this.challenges.size + 1}`,
      status: "ACTIVE",
      attempts: 0,
      resendCount: 0,
      consumedAt: null,
      createdAt: new Date(),
    }

    this.challenges.set(challenge.id, challenge)

    return challenge
  }

  async findActiveOtpChallenge(email: string, purpose: OtpChallengeRecord["purpose"]) {
    return (
      [...this.challenges.values()]
        .filter(
          (challenge) =>
            challenge.email === email.toLowerCase() &&
            challenge.purpose === purpose &&
            challenge.status === "ACTIVE"
        )
        .sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())
        .at(0) ?? null
    )
  }

  async updateOtpChallenge(id: string, input: UpdateOtpChallengeInput) {
    const challenge = this.challenges.get(id)

    if (challenge) {
      Object.assign(challenge, input)
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

describe("SPARTA password routes", () => {
  let authRepository: InMemoryAuthRepository
  let passwordRepository: InMemoryPasswordRepository
  let emailProvider: TestEmailProvider

  beforeEach(() => {
    authRepository = new InMemoryAuthRepository()
    const user = createBranchDefaultUser()
    authRepository.users.set(user.email, user)
    passwordRepository = new InMemoryPasswordRepository(authRepository.users)
    emailProvider = new TestEmailProvider()
  })

  function createAppWithFakes() {
    return createApp(testEnv, {
      authRepository,
      passwordRepository,
      emailProvider,
    })
  }

  function createAuthenticatedAgent() {
    const app = createAppWithFakes()
    const agent = request.agent(app)

    return { app, agent }
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

  it("requires an authenticated session for first password change", async () => {
    await request(createAppWithFakes())
      .post("/v1/auth/first-password")
      .send({ newPassword: "Andi-Sparta-2026" })
      .expect(401)
  })

  it("rejects first password that equals the uppercase branch password", async () => {
    const { agent } = createAuthenticatedAgent()
    await login(agent)

    await agent
      .post("/v1/auth/first-password")
      .send({ newPassword: "JAKARTA PUSAT" })
      .expect(400)
  })

  it("updates first password and clears branch-default state", async () => {
    const { agent } = createAuthenticatedAgent()
    await login(agent)

    await agent
      .post("/v1/auth/first-password")
      .send({ newPassword: "Andi-Sparta-2026" })
      .expect(200)

    expect(authRepository.users.get("andi.halim@sparta.local")).toMatchObject({
      passwordState: "USER_SET",
    })
    expect(authRepository.users.get("andi.halim@sparta.local")?.passwordHash).not.toBe(
      "Andi-Sparta-2026"
    )
  })

  it("creates hashed forgot-password OTP without exposing the plain OTP in production response", async () => {
    const productionEnv = { ...testEnv, NODE_ENV: "production" } satisfies AppEnv
    const app = createApp(productionEnv, {
      authRepository,
      passwordRepository,
      emailProvider,
    })

    const response = await request(app)
      .post("/v1/password/forgot/request-otp")
      .send({ email: "andi.halim@sparta.local" })
      .expect(200)

    const challenge = [...passwordRepository.challenges.values()][0]
    const otp = emailProvider.latestOtp()

    expect(response.body.data.otp).toBeUndefined()
    expect(challenge.codeHash).not.toBe(otp)
    expect(challenge.codeHash).toMatch(/^[a-f0-9]{64}$/)
  })

  it("verifies a valid forgot-password OTP", async () => {
    const app = createAppWithFakes()

    await request(app)
      .post("/v1/password/forgot/request-otp")
      .send({ email: "andi.halim@sparta.local" })
      .expect(200)

    await request(app)
      .post("/v1/password/forgot/verify-otp")
      .send({ email: "andi.halim@sparta.local", otp: emailProvider.latestOtp() })
      .expect(200)
  })

  it("resets password with valid forgot-password OTP and consumes it", async () => {
    const app = createAppWithFakes()

    await request(app)
      .post("/v1/password/forgot/request-otp")
      .send({ email: "andi.halim@sparta.local" })
      .expect(200)

    const otp = emailProvider.latestOtp()

    await request(app)
      .post("/v1/password/forgot/reset")
      .send({
        email: "andi.halim@sparta.local",
        otp,
        newPassword: "Andi-Sparta-2026",
      })
      .expect(200)

    const challenge = [...passwordRepository.challenges.values()][0]
    expect(challenge.status).toBe("CONSUMED")

    await request(app)
      .post("/v1/password/forgot/reset")
      .send({
        email: "andi.halim@sparta.local",
        otp,
        newPassword: "Andi-Sparta-2027",
      })
      .expect(400)
  })

  it("requires an authenticated session for change-password OTP request", async () => {
    await request(createAppWithFakes())
      .post("/v1/password/change/request-otp")
      .expect(401)
  })

  it("updates password after a valid change-password OTP", async () => {
    const { agent } = createAuthenticatedAgent()
    await login(agent)

    await agent.post("/v1/password/change/request-otp").expect(200)

    await agent
      .post("/v1/password/change/confirm")
      .send({
        otp: emailProvider.latestOtp(),
        newPassword: "Andi-Sparta-2026",
      })
      .expect(200)

    expect(authRepository.users.get("andi.halim@sparta.local")).toMatchObject({
      passwordState: "USER_SET",
    })
  })

  it("blocks OTP after max attempts", async () => {
    const app = createAppWithFakes()

    await request(app)
      .post("/v1/password/forgot/request-otp")
      .send({ email: "andi.halim@sparta.local" })
      .expect(200)

    for (let index = 0; index < 5; index += 1) {
      await request(app)
        .post("/v1/password/forgot/verify-otp")
        .send({ email: "andi.halim@sparta.local", otp: "000000" })
        .expect(index === 4 ? 429 : 400)
    }

    const challenge = [...passwordRepository.challenges.values()][0]
    expect(challenge.status).toBe("BLOCKED")
  })

  it("rejects expired OTP", async () => {
    const app = createAppWithFakes()

    await request(app)
      .post("/v1/password/forgot/request-otp")
      .send({ email: "andi.halim@sparta.local" })
      .expect(200)

    const challenge = [...passwordRepository.challenges.values()][0]
    challenge.expiresAt = new Date(Date.now() - 1000)

    await request(app)
      .post("/v1/password/forgot/verify-otp")
      .send({ email: "andi.halim@sparta.local", otp: emailProvider.latestOtp() })
      .expect(400)

    expect(challenge.status).toBe("EXPIRED")
  })
})
