import { Router } from "express"

import type { AppEnv } from "../../config/env"
import { requireSession } from "../../middleware/require-session"
import { loginRateLimit } from "../../middleware/rate-limit"
import { SPARTA_SESSION_COOKIE } from "../../services/security/session-token"
import {
  type AuthRepository,
  PrismaAuthRepository,
} from "./auth.repository"
import { loginSchema } from "./auth.schemas"
import { AuthService } from "./auth.service"

export type AuthRouterOptions = {
  authRepository?: AuthRepository
}

function cookieOptions(env: AppEnv, expires?: Date) {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    expires,
  } as const
}

export function createAuthRouter(env: AppEnv, options: AuthRouterOptions = {}) {
  const router = Router()
  const authService = new AuthService(
    options.authRepository ?? new PrismaAuthRepository(),
    env
  )
  const sessionMiddleware = requireSession(authService)

  router.post("/login", loginRateLimit, async (request, response, next) => {
    try {
      const payload = loginSchema.safeParse(request.body)

      if (!payload.success) {
        response.status(400).json({
          error: {
            code: "INVALID_AUTH_PAYLOAD",
            message: "Email dan password SPARTA wajib diisi dengan benar.",
          },
        })
        return
      }

      const result = await authService.login(payload.data, {
        userAgent: request.header("user-agent") ?? null,
        ipAddress: request.ip ?? null,
      })

      response.cookie(
        SPARTA_SESSION_COOKIE,
        result.rawToken,
        cookieOptions(env, result.expiresAt)
      )
      response.json({ data: { session: result.session } })
    } catch (error) {
      next(error)
    }
  })

  router.get("/me", sessionMiddleware, (request, response) => {
    response.json({ data: { session: request.spartaSession?.session } })
  })

  router.post("/logout", async (request, response, next) => {
    try {
      await authService.logout(request.cookies?.[SPARTA_SESSION_COOKIE])
      response.clearCookie(SPARTA_SESSION_COOKIE, cookieOptions(env))
      response.json({ data: { ok: true } })
    } catch (error) {
      next(error)
    }
  })

  return router
}
