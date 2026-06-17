import type { SpartaModuleId } from "@sparta/shared"
import request from "supertest"
import { beforeEach, describe, expect, it } from "vitest"

import { createApp } from "../../app"
import type { AppEnv } from "../../config/env"
import type { AuthUserRecord } from "../auth/auth.repository"

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

const testLaunchToken = "test-launch-token-with-sufficient-length"

type LaunchRecord = {
  id: string
  userId: string
  moduleId: SpartaModuleId
  launchTokenHash: string
  redirectUrl: string
  expiresAt: Date
  consumedAt: Date | null
  user: AuthUserRecord
}

class InMemorySsoRepository {
  launches = new Map<string, LaunchRecord>()

  async findLaunchByTokenHash(tokenHash: string) {
    return (
      [...this.launches.values()].find(
        (launch) => launch.launchTokenHash === tokenHash
      ) ?? null
    )
  }

  async consumeLaunch(id: string, consumedAt: Date) {
    const launch = this.launches.get(id)

    if (launch) {
      launch.consumedAt = consumedAt
    }
  }
}

function createUser(): AuthUserRecord {
  return {
    id: "user-1",
    email: "andi.halim@sparta.local",
    fullName: "Andi Halim",
    branchName: "Jakarta Pusat",
    passwordHash: null,
    passwordState: "USER_SET",
    role: "USER",
    status: "ACTIVE",
    failedLoginCount: 0,
    lockedUntil: null,
    lastLoginAt: null,
    access: ["building", "maintenance"],
  }
}

describe("SPARTA SSO exchange routes", () => {
  let repository: InMemorySsoRepository

  beforeEach(() => {
    repository = new InMemorySsoRepository()
  })

  function createAppWithFakes() {
    return createApp(testEnv, {
      ssoRepository: repository,
    })
  }

  function addLaunch(override: Partial<LaunchRecord> = {}) {
    const launch: LaunchRecord = {
      id: `launch-${repository.launches.size + 1}`,
      userId: "user-1",
      moduleId: "building",
      launchTokenHash:
        "ca65d2e8759d2ebbd4da655e0629714bfb16dfa21500df961e2796cb22d54dfd",
      redirectUrl: "https://building.sparta.local/auth/sso/callback?token=test",
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
      user: createUser(),
      ...override,
    }

    repository.launches.set(launch.id, launch)

    return launch
  }

  it("consumes a valid launch token and returns the user payload", async () => {
    const launch = addLaunch()

    const response = await request(createAppWithFakes())
      .post("/v1/sso/exchange")
      .send({ moduleId: "building", launchToken: testLaunchToken })
      .expect(200)

    expect(response.body.data.user).toEqual({
      email: "andi.halim@sparta.local",
      fullName: "Andi Halim",
      branch: "Jakarta Pusat",
      access: ["building", "maintenance"],
    })
    expect(repository.launches.get(launch.id)?.consumedAt).toBeInstanceOf(Date)
  })

  it("rejects a reused launch token", async () => {
    addLaunch({ consumedAt: new Date() })

    await request(createAppWithFakes())
      .post("/v1/sso/exchange")
      .send({ moduleId: "building", launchToken: testLaunchToken })
      .expect(400)
  })

  it("rejects a launch token issued for another module", async () => {
    addLaunch({ moduleId: "maintenance" })

    await request(createAppWithFakes())
      .post("/v1/sso/exchange")
      .send({ moduleId: "building", launchToken: testLaunchToken })
      .expect(403)
  })

  it("rejects an expired launch token", async () => {
    addLaunch({ expiresAt: new Date(Date.now() - 1000) })

    await request(createAppWithFakes())
      .post("/v1/sso/exchange")
      .send({ moduleId: "building", launchToken: testLaunchToken })
      .expect(400)
  })
})
