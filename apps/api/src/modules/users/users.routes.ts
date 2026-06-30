import { isSpartaLaunchableModuleId } from "@sparta/shared"
import { Router } from "express"
import type { Response } from "express"
import type { z } from "zod"

import type { AppEnv } from "../../config/env"
import { requireSession } from "../../middleware/require-session"
import { requireAdmin } from "../../middleware/require-admin"
import {
  type AuthRepository,
  PrismaAuthRepository,
} from "../auth/auth.repository"
import { AuthService } from "../auth/auth.service"
import { type UsersRepository, PrismaUsersRepository } from "./users.repository"
import { createUserSchema, updateUserSchema } from "./users.schemas"
import { UsersService } from "./users.service"

export type UsersRouterOptions = {
  authRepository?: AuthRepository
  usersRepository?: UsersRepository
}

function createServices(env: AppEnv, options: UsersRouterOptions) {
  const authRepository = options.authRepository ?? new PrismaAuthRepository()
  const usersRepository = options.usersRepository ?? new PrismaUsersRepository()

  return {
    authService: new AuthService(authRepository, env),
    usersService: new UsersService(usersRepository),
  }
}

function invalidPayload(response: Response) {
  response.status(400).json({
    error: {
      code: "INVALID_USERS_PAYLOAD",
      message: "Payload users SPARTA tidak valid.",
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

export function createUsersRouter(
  env: AppEnv,
  options: UsersRouterOptions = {}
) {
  const router = Router()
  const { authService, usersService } = createServices(env, options)
  const sessionMiddleware = requireSession(authService)

  router.get(
    "/",
    sessionMiddleware,
    requireAdmin,
    async (request, response, next) => {
      try {
        if (!request.spartaSession) {
          invalidPayload(response)
          return
        }

        response.json({
          data: await usersService.listUsers(),
        })
      } catch (error) {
        next(error)
      }
    }
  )

  router.post(
    "/",
    sessionMiddleware,
    requireAdmin,
    async (request, response, next) => {
      try {
        const payload = parseBody(createUserSchema, request.body)

        if (!payload || !request.spartaSession) {
          invalidPayload(response)
          return
        }

        const user = await usersService.createUser(
          payload,
          request.spartaSession.user.id
        )

        response.status(201).json({ data: user })
      } catch (error) {
        next(error)
      }
    }
  )

  router.patch(
    "/:userId",
    sessionMiddleware,
    requireAdmin,
    async (request, response, next) => {
      try {
        const userId = request.params.userId

        if (!userId || Array.isArray(userId) || !request.spartaSession) {
          invalidPayload(response)
          return
        }

        const payload = parseBody(updateUserSchema, request.body)

        if (!payload) {
          invalidPayload(response)
          return
        }

        await usersService.updateUser(
          userId,
          payload,
          request.spartaSession.user.id
        )

        response.json({ data: { ok: true } })
      } catch (error) {
        next(error)
      }
    }
  )

  router.put(
    "/:userId/access/:moduleId",
    sessionMiddleware,
    requireAdmin,
    async (request, response, next) => {
      try {
        const userId = request.params.userId
        const moduleId = request.params.moduleId

        if (
          !userId ||
          Array.isArray(userId) ||
          !moduleId ||
          Array.isArray(moduleId) ||
          !isSpartaLaunchableModuleId(moduleId) ||
          !request.spartaSession
        ) {
          invalidPayload(response)
          return
        }

        const role = request.body?.role ?? "USER"

        await usersService.grantModuleAccess(
          userId,
          moduleId,
          role,
          request.spartaSession.user.id
        )

        response.json({ data: { ok: true } })
      } catch (error) {
        next(error)
      }
    }
  )

  router.delete(
    "/:userId/access/:moduleId",
    sessionMiddleware,
    requireAdmin,
    async (request, response, next) => {
      try {
        const userId = request.params.userId
        const moduleId = request.params.moduleId

        if (
          !userId ||
          Array.isArray(userId) ||
          !moduleId ||
          Array.isArray(moduleId) ||
          !isSpartaLaunchableModuleId(moduleId) ||
          !request.spartaSession
        ) {
          invalidPayload(response)
          return
        }

        await usersService.revokeModuleAccess(
          userId,
          moduleId,
          request.spartaSession.user.id
        )

        response.json({ data: { ok: true } })
      } catch (error) {
        next(error)
      }
    }
  )

  return router
}
