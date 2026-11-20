import { isSpartaLaunchableModuleId } from "@sparta/shared"
import { Router } from "express"
import type { Response } from "express"
import type { z } from "zod"

import type { AppEnv } from "../../config/env"
import { requireSession } from "../../middleware/require-session"
import {
  requireUserAdmin,
  scopeAllowsModule,
  type UserAdminScope,
} from "../../middleware/portal-access"
import { requireInternalApiKey } from "../../middleware/require-internal-api-key"
import {
  type AuthRepository,
  PrismaAuthRepository,
} from "../auth/auth.repository"
import { AuthService } from "../auth/auth.service"
import {
  type ProvisioningRepository,
  PrismaProvisioningRepository,
} from "../provisioning/provisioning.repository"
import { ProvisioningService } from "../provisioning/provisioning.service"
import { type UsersRepository, PrismaUsersRepository } from "./users.repository"
import {
  createUserSchema,
  updateUserSchema,
  syncUserSchema,
} from "./users.schemas"
import { UsersService } from "./users.service"

export type UsersRouterOptions = {
  authRepository?: AuthRepository
  usersRepository?: UsersRepository
  /** null = provisioning mati (bawaan saat NODE_ENV=test). */
  provisioningRepository?: ProvisioningRepository | null
}

function createServices(env: AppEnv, options: UsersRouterOptions) {
  const authRepository = options.authRepository ?? new PrismaAuthRepository()
  const usersRepository = options.usersRepository ?? new PrismaUsersRepository()
  const provisioningRepository =
    options.provisioningRepository !== undefined
      ? options.provisioningRepository
      : env.NODE_ENV === "test"
        ? null
        : new PrismaProvisioningRepository()
  const provisioningService = provisioningRepository
    ? new ProvisioningService(provisioningRepository)
    : null

  return {
    authService: new AuthService(authRepository, env),
    provisioningService,
    usersService: new UsersService(usersRepository, {
      syncDefaultPassword: env.SPARTA_SYNC_DEFAULT_PASSWORD,
      provisioning: provisioningService ?? undefined,
    }),
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

function outOfScope(response: Response) {
  response.status(403).json({
    error: {
      code: "FORBIDDEN_MODULE_SCOPE",
      message: "Akses ditolak. Anda hanya admin untuk modul tertentu.",
    },
  })
}

/** User termasuk lingkup admin modul bila punya akses (aktif/nonaktif) ke modulnya. */
function userInScope(
  scope: UserAdminScope | undefined,
  user: { modules: Array<{ moduleId: string }> }
) {
  return (
    !!scope &&
    (scope.all ||
      user.modules.some((access) => scopeAllowsModule(scope, access.moduleId)))
  )
}

/** Field yang boleh diubah admin modul; email, role, status berdampak ke semua modul. */
const MODULE_ADMIN_EDITABLE = new Set([
  "fullName",
  "employeeId",
  "branchCode",
  "branchName",
])

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
  const { authService, usersService, provisioningService } = createServices(
    env,
    options
  )
  const sessionMiddleware = requireSession(authService)

  function provisioningDisabled(response: Response) {
    response.status(503).json({
      error: {
        code: "PROVISIONING_DISABLED",
        message: "Provisioning modul tidak aktif di server ini.",
      },
    })
  }

  // Katalog role per modul untuk pilihan role di halaman Manajemen User.
  router.get(
    "/module-roles",
    sessionMiddleware,
    requireUserAdmin,
    async (_request, response, next) => {
      try {
        if (!provisioningService) {
          provisioningDisabled(response)
          return
        }
        response.json({ data: await provisioningService.listModuleRoles() })
      } catch (error) {
        next(error)
      }
    }
  )

  router.post(
    "/provisioning-events/:eventId/retry",
    sessionMiddleware,
    requireUserAdmin,
    async (request, response, next) => {
      try {
        const eventId = request.params.eventId
        if (!eventId || Array.isArray(eventId)) {
          invalidPayload(response)
          return
        }
        if (!provisioningService) {
          provisioningDisabled(response)
          return
        }
        const scope = request.userAdminScope
        const requeued = await provisioningService.requeue(
          eventId,
          scope && !scope.all ? scope.modules : undefined
        )
        if (!requeued) {
          response.status(404).json({
            error: {
              code: "PROVISIONING_EVENT_NOT_RETRYABLE",
              message: "Event tidak ditemukan atau tidak berstatus gagal.",
            },
          })
          return
        }
        response.json({ data: { ok: true } })
      } catch (error) {
        next(error)
      }
    }
  )

  router.get(
    "/:userId/provisioning-events",
    sessionMiddleware,
    requireUserAdmin,
    async (request, response, next) => {
      try {
        const userId = request.params.userId
        if (!userId || Array.isArray(userId)) {
          invalidPayload(response)
          return
        }
        if (!provisioningService) {
          provisioningDisabled(response)
          return
        }
        const scope = request.userAdminScope
        if (scope && !scope.all) {
          const target = await usersService.getUser(userId)
          if (!target || !userInScope(scope, target)) {
            outOfScope(response)
            return
          }
        }
        const events = (
          await provisioningService.listEventsForUser(userId)
        ).filter((event) => scopeAllowsModule(scope, event.moduleId))
        response.json({
          data: events.map((event) => ({
            id: event.id,
            type: event.type,
            moduleId: event.moduleId,
            status: event.status,
            attempts: event.attempts,
            lastError: event.lastError,
            nextAttemptAt: event.nextAttemptAt.toISOString(),
            deliveredAt: event.deliveredAt?.toISOString() ?? null,
            createdAt: event.createdAt.toISOString(),
          })),
        })
      } catch (error) {
        next(error)
      }
    }
  )

  router.get(
    "/",
    sessionMiddleware,
    requireUserAdmin,
    async (request, response, next) => {
      try {
        if (!request.spartaSession) {
          invalidPayload(response)
          return
        }

        const scope = request.userAdminScope
        const users = await usersService.listUsers()
        response.json({
          data: users.filter((user) => userInScope(scope, user)),
        })
      } catch (error) {
        next(error)
      }
    }
  )

  router.post(
    "/sync",
    requireInternalApiKey(env),
    async (request, response, next) => {
      try {
        const payload = parseBody(syncUserSchema, request.body)
        if (!payload) {
          invalidPayload(response)
          return
        }

        const user = await usersService.syncUser(payload)
        // spartaUserId = ID portal yang disimpan modul (kontrak SSO v2).
        response
          .status(200)
          .json({ data: user ? { ...user, spartaUserId: user.id } : user })
      } catch (error) {
        next(error)
      }
    }
  )

  router.post(
    "/sync-delete",
    requireInternalApiKey(env),
    async (request, response, next) => {
      try {
        const { syncDeleteUserSchema } = await import("./users.schemas")
        const payload = parseBody(syncDeleteUserSchema, request.body)
        if (!payload) {
          invalidPayload(response)
          return
        }

        const user = await usersService.syncDeleteUser(payload)
        response.status(200).json({ data: user })
      } catch (error) {
        next(error)
      }
    }
  )

  router.post(
    "/change-email",
    sessionMiddleware,
    async (request, response, next) => {
      try {
        const { changeEmailSchema } = await import("./users.schemas")
        const payload = parseBody(changeEmailSchema, request.body)
        if (!payload || !request.spartaSession) {
          invalidPayload(response)
          return
        }

        const authRepo = options.authRepository ?? new PrismaAuthRepository()
        const user = await authRepo.findUserById(request.spartaSession.user.id)

        if (!user) {
          response
            .status(401)
            .json({ error: { code: "UNAUTHORIZED", message: "Akses ditolak" } })
          return
        }

        const isValid = await authService.verifyPassword(user, payload.password)

        if (!isValid) {
          response.status(401).json({
            error: { code: "INVALID_CREDENTIALS", message: "Password salah" },
          })
          return
        }

        await usersService.changeEmailAndBroadcast(
          request.spartaSession.user.id,
          payload.newEmail,
          env
        )
        response.status(200).json({ data: { ok: true } })
      } catch (error) {
        next(error)
      }
    }
  )

  router.post(
    "/",
    sessionMiddleware,
    requireUserAdmin,
    async (request, response, next) => {
      try {
        const payload = parseBody(createUserSchema, request.body)

        if (!payload || !request.spartaSession) {
          invalidPayload(response)
          return
        }

        // Admin modul: hanya user biasa, dan akses awal hanya ke modulnya.
        const scope = request.userAdminScope
        if (
          scope &&
          !scope.all &&
          (payload.role !== "USER" ||
            payload.modules.length === 0 ||
            payload.modules.some(
              (module) => !scopeAllowsModule(scope, module.moduleId)
            ))
        ) {
          outOfScope(response)
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
    requireUserAdmin,
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

        // Admin modul: hanya user di lingkupnya dan hanya field tertentu.
        const scope = request.userAdminScope
        if (scope && !scope.all) {
          const target = await usersService.getUser(userId)
          if (
            !target ||
            !userInScope(scope, target) ||
            Object.keys(payload).some(
              (field) => !MODULE_ADMIN_EDITABLE.has(field)
            )
          ) {
            outOfScope(response)
            return
          }
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
    requireUserAdmin,
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

        if (!scopeAllowsModule(request.userAdminScope, moduleId)) {
          outOfScope(response)
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
    requireUserAdmin,
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

        if (!scopeAllowsModule(request.userAdminScope, moduleId)) {
          outOfScope(response)
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
