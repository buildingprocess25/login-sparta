import type { Request, Response, NextFunction } from "express"
import type { AppEnv } from "../config/env"

export function requireInternalApiKey(env: AppEnv) {
  return (request: Request, response: Response, next: NextFunction) => {
    const apiKey = request.header("x-sparta-internal-key")

    if (!apiKey || apiKey !== env.SPARTA_INTERNAL_API_KEY) {
      response.status(401).json({
        error: {
          code: "UNAUTHORIZED_INTERNAL_SYNC",
          message: "Akses ditolak. Internal API key tidak valid.",
        },
      })
      return
    }

    next()
  }
}
