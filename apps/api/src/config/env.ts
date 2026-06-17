import { existsSync } from "node:fs"
import path from "node:path"

import { config } from "dotenv"
import { z } from "zod"

function loadEnvironmentFile() {
  if (process.env.NODE_ENV === "test") {
    return
  }

  const envFile =
    process.env.SPARTA_API_ENV_FILE ??
    (process.env.NODE_ENV === "production"
      ? ".env.production"
      : ".env.development")
  const envPath = path.resolve(process.cwd(), envFile)

  if (existsSync(envPath)) {
    config({ path: envPath, override: false })
  }
}

loadEnvironmentFile()

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(10000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters"),
  OTP_PEPPER: z.string().min(32, "OTP_PEPPER must be at least 32 characters"),
  CORS_ORIGINS: z
    .string()
    .min(1, "CORS_ORIGINS is required")
    .transform((value) =>
      value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    ),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  GOOGLE_REFRESH_TOKEN: z.string().min(1, "GOOGLE_REFRESH_TOKEN is required"),
  GMAIL_USER: z.string().email("GMAIL_USER must be a valid email"),
  SPARTA_BUILDING_CALLBACK_URL: z
    .string()
    .url("SPARTA_BUILDING_CALLBACK_URL must be a valid URL"),
  SPARTA_MAINTENANCE_CALLBACK_URL: z
    .string()
    .url("SPARTA_MAINTENANCE_CALLBACK_URL must be a valid URL"),
  SPARTA_ENERGY_CALLBACK_URL: z
    .string()
    .url("SPARTA_ENERGY_CALLBACK_URL must be a valid URL"),
})

export type AppEnv = z.infer<typeof envSchema>

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const result = envSchema.safeParse(source)

  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ")

    throw new Error(`Invalid SPARTA API environment: ${message}`)
  }

  return result.data
}
