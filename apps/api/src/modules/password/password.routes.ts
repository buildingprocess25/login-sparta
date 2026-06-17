import { Router } from "express"
import type { Response } from "express"
import type { z } from "zod"

import type { AppEnv } from "../../config/env"
import { requireSession } from "../../middleware/require-session"
import {
  createEmailProvider,
  type EmailProvider,
} from "../../services/email/email.service"
import {
  type AuthRepository,
  PrismaAuthRepository,
} from "../auth/auth.repository"
import { AuthService } from "../auth/auth.service"
import {
  type PasswordRepository,
  PrismaPasswordRepository,
} from "./password.repository"
import {
  changePasswordConfirmSchema,
  forgotOtpRequestSchema,
  forgotOtpVerifySchema,
  forgotPasswordResetSchema,
  passwordUpdateSchema,
} from "./password.schemas"
import { PasswordService } from "./password.service"

export type PasswordRouterOptions = {
  authRepository?: AuthRepository
  passwordRepository?: PasswordRepository
  emailProvider?: EmailProvider
}

function createServices(env: AppEnv, options: PasswordRouterOptions) {
  const authRepository = options.authRepository ?? new PrismaAuthRepository()
  const passwordRepository =
    options.passwordRepository ?? new PrismaPasswordRepository()
  const emailProvider = options.emailProvider ?? createEmailProvider(env)

  return {
    authService: new AuthService(authRepository, env),
    passwordService: new PasswordService(passwordRepository, emailProvider, env),
  }
}

function invalidPayload(response: Response) {
  response.status(400).json({
    error: {
      code: "INVALID_PASSWORD_PAYLOAD",
      message: "Payload password SPARTA tidak valid.",
    },
  })
}

function parseBody<TSchema extends z.ZodType>(
  schema: TSchema,
  body: unknown
): z.infer<TSchema> | null {
  const parsed = schema.safeParse(body)

  return parsed.success ? parsed.data : null
}

export function createFirstPasswordRouter(
  env: AppEnv,
  options: PasswordRouterOptions = {}
) {
  const router = Router()
  const { authService, passwordService } = createServices(env, options)
  const sessionMiddleware = requireSession(authService)

  router.post(
    "/first-password",
    sessionMiddleware,
    async (request, response, next) => {
      try {
        const payload = parseBody(passwordUpdateSchema, request.body)

        if (!payload || !request.spartaSession) {
          invalidPayload(response)
          return
        }

        await passwordService.setFirstPassword(
          request.spartaSession.user,
          payload
        )
        response.json({ data: { ok: true } })
      } catch (error) {
        next(error)
      }
    }
  )

  return router
}

export function createPasswordRouter(
  env: AppEnv,
  options: PasswordRouterOptions = {}
) {
  const router = Router()
  const { authService, passwordService } = createServices(env, options)
  const sessionMiddleware = requireSession(authService)

  router.post("/forgot/request-otp", async (request, response, next) => {
    try {
      const payload = parseBody(forgotOtpRequestSchema, request.body)

      if (!payload) {
        invalidPayload(response)
        return
      }

      const result = await passwordService.requestForgotPasswordOtp(payload)

      response.json({
        data: {
          email: result.email,
          expiresAt: result.expiresAt.toISOString(),
        },
      })
    } catch (error) {
      next(error)
    }
  })

  router.post("/forgot/verify-otp", async (request, response, next) => {
    try {
      const payload = parseBody(forgotOtpVerifySchema, request.body)

      if (!payload) {
        invalidPayload(response)
        return
      }

      await passwordService.verifyForgotPasswordOtp(payload)
      response.json({ data: { ok: true } })
    } catch (error) {
      next(error)
    }
  })

  router.post("/forgot/reset", async (request, response, next) => {
    try {
      const payload = parseBody(forgotPasswordResetSchema, request.body)

      if (!payload) {
        invalidPayload(response)
        return
      }

      await passwordService.resetForgotPassword(payload)
      response.json({ data: { ok: true } })
    } catch (error) {
      next(error)
    }
  })

  router.post(
    "/change/request-otp",
    sessionMiddleware,
    async (request, response, next) => {
      try {
        if (!request.spartaSession) {
          invalidPayload(response)
          return
        }

        const result = await passwordService.requestChangePasswordOtp(
          request.spartaSession.user
        )

        response.json({
          data: {
            email: result.email,
            expiresAt: result.expiresAt.toISOString(),
          },
        })
      } catch (error) {
        next(error)
      }
    }
  )

  router.post(
    "/change/confirm",
    sessionMiddleware,
    async (request, response, next) => {
      try {
        const payload = parseBody(changePasswordConfirmSchema, request.body)

        if (!payload || !request.spartaSession) {
          invalidPayload(response)
          return
        }

        await passwordService.confirmChangePassword(
          request.spartaSession.user,
          payload
        )
        response.json({ data: { ok: true } })
      } catch (error) {
        next(error)
      }
    }
  )

  return router
}
