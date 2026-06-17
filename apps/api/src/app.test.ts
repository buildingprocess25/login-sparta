import request from "supertest"
import { describe, expect, it } from "vitest"

import { createApp } from "./app"
import type { AppEnv } from "./config/env"

const testEnv = {
  NODE_ENV: "test",
  PORT: 10000,
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/sparta_login",
  SESSION_SECRET: "test-session-secret-minimum-32-characters",
  OTP_PEPPER: "test-otp-pepper-minimum-32-characters",
  CORS_ORIGINS: ["http://localhost:5173"],
  SMTP_HOST: "localhost",
  SMTP_PORT: 1025,
  SMTP_USER: "",
  SMTP_PASS: "",
  SMTP_FROM: "SPARTA <no-reply@sparta.local>",
  SPARTA_BUILDING_CALLBACK_URL:
    "https://building.sparta.local/auth/sso/callback",
  SPARTA_MAINTENANCE_CALLBACK_URL:
    "https://maintenance.sparta.local/auth/sso/callback",
  SPARTA_ENERGY_CALLBACK_URL: "https://energy.sparta.local/auth/sso/callback",
} satisfies AppEnv

describe("SPARTA API app", () => {
  it("returns health status", async () => {
    const app = createApp(testEnv)

    const response = await request(app).get("/healthz").expect(200)

    expect(response.body).toEqual({ status: "ok" })
  })
})
