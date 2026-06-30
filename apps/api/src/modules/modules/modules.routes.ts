import { SPARTA_LAUNCHABLE_MODULE_IDS } from "@sparta/shared"
import type { SpartaLaunchableModuleId } from "@sparta/shared"
import { Router } from "express"
import type { Response } from "express"

import type { AppEnv } from "../../config/env"
import { requireSession } from "../../middleware/require-session"
import { moduleLaunchRateLimit } from "../../middleware/rate-limit"
import {
  type AuthRepository,
  PrismaAuthRepository,
} from "../auth/auth.repository"
import { AuthService } from "../auth/auth.service"
import {
  type ModuleRepository,
  PrismaModuleRepository,
} from "./modules.repository"
import { ModulesService } from "./modules.service"

export type ModulesRouterOptions = {
  authRepository?: AuthRepository
  moduleRepository?: ModuleRepository
}

function isModuleId(value: string): value is SpartaLaunchableModuleId {
  return SPARTA_LAUNCHABLE_MODULE_IDS.includes(
    value as SpartaLaunchableModuleId
  )
}

function invalidModule(response: Response) {
  response.status(400).json({
    error: {
      code: "INVALID_MODULE",
      message: "Modul SPARTA tidak valid.",
    },
  })
}

export function createModulesRouter(
  env: AppEnv,
  options: ModulesRouterOptions = {}
) {
  const router = Router()
  const authRepository = options.authRepository ?? new PrismaAuthRepository()
  const authService = new AuthService(authRepository, env)
  const modulesService = new ModulesService(
    options.moduleRepository ?? new PrismaModuleRepository(),
    env
  )
  const sessionMiddleware = requireSession(authService)

  router.get("/", sessionMiddleware, async (request, response, next) => {
    try {
      if (!request.spartaSession) {
        invalidModule(response)
        return
      }

      response.json({
        data: await modulesService.listForUser(request.spartaSession.user),
      })
    } catch (error) {
      next(error)
    }
  })

  router.post(
    "/:moduleId/launch",
    sessionMiddleware,
    moduleLaunchRateLimit,
    async (request, response, next) => {
      try {
        const moduleId = request.params.moduleId

        if (
          !moduleId ||
          Array.isArray(moduleId) ||
          !isModuleId(moduleId) ||
          !request.spartaSession
        ) {
          invalidModule(response)
          return
        }

        const result = await modulesService.launchModule(
          request.spartaSession.user,
          moduleId,
          {
            ipAddress: request.ip ?? null,
            userAgent: request.header("user-agent") ?? null,
          }
        )

        response.json({
          data: {
            moduleId: result.moduleId,
            redirectUrl: result.redirectUrl,
            expiresAt: result.expiresAt.toISOString(),
          },
        })
      } catch (error) {
        next(error)
      }
    }
  )

  return router
}
