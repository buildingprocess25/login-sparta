import { describe, expect, it } from "vitest"

import { loadEnv } from "../../config/env"
import { createEmailProvider } from "./email.service"

const baseEnv = {
  NODE_ENV: "production",
  PORT: "10000",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/sparta_login",
  SESSION_SECRET: "test-session-secret-minimum-32-characters",
  OTP_PEPPER: "test-otp-pepper-minimum-32-characters",
  CORS_ORIGINS: "http://localhost:5173",
  SPARTA_BUILDING_CALLBACK_URL:
    "https://building.sparta.local/auth/sso/callback",
  SPARTA_MAINTENANCE_CALLBACK_URL:
    "https://maintenance.sparta.local/auth/sso/callback",
  SPARTA_ENERGY_CALLBACK_URL: "https://energy.sparta.local/auth/sso/callback",
}

describe("email provider configuration", () => {
  it("uses Gmail OAuth2 credentials for production email delivery", () => {
    const env = loadEnv({
      ...baseEnv,
      GOOGLE_CLIENT_ID: "google-client-id",
      GOOGLE_CLIENT_SECRET: "google-client-secret",
      GOOGLE_REFRESH_TOKEN: "google-refresh-token",
      GMAIL_USER: "no-reply@sparta.local",
    })

    expect((env as Record<string, unknown>).GMAIL_USER).toBe(
      "no-reply@sparta.local"
    )
    expect(createEmailProvider(env).constructor.name).toBe(
      "GmailEmailProvider"
    )
  })
})
