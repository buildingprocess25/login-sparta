import { SPARTA_MASTER_DATA_ROLES } from "@sparta/shared"
import { Router } from "express"
import type { Request, Response } from "express"
import type { z } from "zod"

import type { AppEnv } from "../../config/env"
import { requireRoles } from "../../middleware/require-roles"
import { requireSession } from "../../middleware/require-session"
import {
  type AuthRepository,
  PrismaAuthRepository,
} from "../auth/auth.repository"
import { AuthService } from "../auth/auth.service"
import {
  type MasterAdminRepository,
  PrismaMasterAdminRepository,
} from "./master-admin.repository"
import {
  createAliasSchema,
  createAreaSchema,
  createBranchSchema,
  updateAreaSchema,
  updateBranchSchema,
} from "./master-admin.schemas"
import { MasterAdminService } from "./master-admin.service"

export type MasterAdminRouterOptions = {
  authRepository?: AuthRepository
  masterAdminRepository?: MasterAdminRepository
}

function parseBody<TSchema extends z.ZodType>(
  schema: TSchema,
  body: unknown,
  response: Response
): z.infer<TSchema> | null {
  const parsed = schema.safeParse(body)
  if (parsed.success) return parsed.data

  response.status(400).json({
    error: {
      code: "INVALID_MASTER_PAYLOAD",
      message: parsed.error.issues[0]?.message ?? "Data master tidak valid.",
    },
  })
  return null
}

function actorId(request: Request) {
  // requireSession + requireRoles sudah menjamin session ada.
  return request.spartaSession!.user.id
}

/** Halaman admin data master: hanya SYSTEM_ADMIN dan MASTER_ADMIN. */
export function createMasterAdminRouter(
  env: AppEnv,
  options: MasterAdminRouterOptions = {}
) {
  const router = Router()
  const authService = new AuthService(
    options.authRepository ?? new PrismaAuthRepository(),
    env
  )
  const service = new MasterAdminService(
    options.masterAdminRepository ?? new PrismaMasterAdminRepository()
  )

  router.use(
    requireSession(authService),
    requireRoles(SPARTA_MASTER_DATA_ROLES)
  )

  router.get("/branches", async (_request, response, next) => {
    try {
      response.json({ data: await service.listBranches() })
    } catch (error) {
      next(error)
    }
  })

  router.post("/branches", async (request, response, next) => {
    try {
      const input = parseBody(createBranchSchema, request.body, response)
      if (!input) return
      await service.createBranch(input, actorId(request))
      response.status(201).json({ data: { code: input.code } })
    } catch (error) {
      next(error)
    }
  })

  router.patch("/branches/:code", async (request, response, next) => {
    try {
      const patch = parseBody(updateBranchSchema, request.body, response)
      if (!patch) return
      await service.updateBranch(request.params.code, patch, actorId(request))
      response.json({ data: { code: request.params.code } })
    } catch (error) {
      next(error)
    }
  })

  router.post("/branches/:code/aliases", async (request, response, next) => {
    try {
      const input = parseBody(createAliasSchema, request.body, response)
      if (!input) return
      await service.addAlias(request.params.code, input.alias, actorId(request))
      response.status(201).json({ data: { code: request.params.code } })
    } catch (error) {
      next(error)
    }
  })

  router.delete(
    "/branches/:code/aliases/:aliasId",
    async (request, response, next) => {
      try {
        await service.removeAlias(
          request.params.code,
          request.params.aliasId,
          actorId(request)
        )
        response.json({ data: { code: request.params.code } })
      } catch (error) {
        next(error)
      }
    }
  )

  router.get("/areas", async (_request, response, next) => {
    try {
      response.json({ data: await service.listAreas() })
    } catch (error) {
      next(error)
    }
  })

  router.post("/areas", async (request, response, next) => {
    try {
      const input = parseBody(createAreaSchema, request.body, response)
      if (!input) return
      await service.createArea(input, actorId(request))
      response.status(201).json({ data: { code: input.code } })
    } catch (error) {
      next(error)
    }
  })

  router.patch("/areas/:code", async (request, response, next) => {
    try {
      const patch = parseBody(updateAreaSchema, request.body, response)
      if (!patch) return
      await service.updateArea(request.params.code, patch, actorId(request))
      response.json({ data: { code: request.params.code } })
    } catch (error) {
      next(error)
    }
  })

  return router
}
