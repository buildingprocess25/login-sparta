import type { CorsOptions } from "cors"

import type { AppEnv } from "./env"

export function createCorsOptions(env: AppEnv): CorsOptions {
  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin || env.CORS_ORIGINS.includes(origin)) {
        callback(null, true)
        return
      }

      callback(new Error("Origin is not allowed by SPARTA CORS policy"))
    },
  }
}
