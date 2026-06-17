import { existsSync } from "node:fs"
import path from "node:path"

import { config } from "dotenv"
import { defineConfig, env } from "prisma/config"

const envFile =
  process.env.SPARTA_API_ENV_FILE ??
  (process.env.NODE_ENV === "production" ? ".env.production" : ".env.development")
const envPath = path.resolve(process.cwd(), envFile)

if (existsSync(envPath)) {
  config({ path: envPath, override: false })
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
})
