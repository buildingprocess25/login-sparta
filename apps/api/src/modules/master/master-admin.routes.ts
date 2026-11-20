import { Router } from "express"
import type { Request, Response } from "express"
import type { z } from "zod"

import type { AppEnv } from "../../config/env"
import {
  requireMasterRead,
  requireMasterWrite,
} from "../../middleware/portal-access"
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
import { type StoreRepository, PrismaStoreRepository } from "./store.repository"
import {
  createStoreSchema,
  listStoresQuerySchema,
  setBrandModulesSchema,
  updateStoreSchema,
} from "./store.schemas"
import { StoreService } from "./store.service"

export type MasterAdminRouterOptions = {
  authRepository?: AuthRepository
  masterAdminRepository?: MasterAdminRepository
  storeRepository?: StoreRepository
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

  const storeService = new StoreService(
    options.storeRepository ?? new PrismaStoreRepository()
  )

  // Baca: admin sistem, admin data master, dan admin modul. Ubah (selain GET):
  // hanya admin sistem dan admin data master, karena data ini dipakai semua modul.
  router.use(
    requireSession(authService),
    requireMasterRead,
    (request, response, next) =>
      request.method === "GET"
        ? next()
        : requireMasterWrite(request, response, next)
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

  // Toko: daftar dipaginasi di server karena jumlahnya puluhan ribu.
  router.get("/stores", async (request, response, next) => {
    try {
      const query = parseBody(listStoresQuerySchema, request.query, response)
      if (!query) return
      response.json(await storeService.listStores(query))
    } catch (error) {
      next(error)
    }
  })

  router.get("/store-brands", async (_request, response, next) => {
    try {
      response.json({ data: await storeService.listBrands() })
    } catch (error) {
      next(error)
    }
  })

  router.put("/store-brands/:code", async (request, response, next) => {
    try {
      const input = parseBody(setBrandModulesSchema, request.body, response)
      if (!input) return
      await storeService.setBrandModules(
        request.params.code,
        input,
        actorId(request)
      )
      response.json({ data: { code: request.params.code } })
    } catch (error) {
      next(error)
    }
  })

  router.post("/stores", async (request, response, next) => {
    try {
      const input = parseBody(createStoreSchema, request.body, response)
      if (!input) return
      await storeService.createStore(input, actorId(request))
      response.status(201).json({ data: { code: input.code } })
    } catch (error) {
      next(error)
    }
  })

  router.patch("/stores/:code", async (request, response, next) => {
    try {
      const patch = parseBody(updateStoreSchema, request.body, response)
      if (!patch) return
      await storeService.updateStore(
        request.params.code,
        patch,
        actorId(request)
      )
      response.json({ data: { code: request.params.code } })
    } catch (error) {
      next(error)
    }
  })

  return router
}
