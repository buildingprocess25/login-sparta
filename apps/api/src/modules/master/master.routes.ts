import { Router } from "express"
import { z } from "zod"

import type { AppEnv } from "../../config/env"
import { requireInternalApiKey } from "../../middleware/require-internal-api-key"
import {
  type MasterRepository,
  PrismaMasterRepository,
} from "./master.repository"

export type MasterRouterOptions = {
  masterRepository?: MasterRepository
}

const listQuerySchema = z.object({
  updatedSince: z.coerce.date().optional(),
})

/**
 * Data master untuk aplikasi lain (sync malam). Dilindungi API key internal.
 * `meta.syncedAt` diambil SEBELUM query; aplikasi memakainya sebagai
 * `updatedSince` berikutnya agar perubahan di tengah query tidak terlewat.
 */
export function createMasterRouter(
  env: AppEnv,
  options: MasterRouterOptions = {}
) {
  const router = Router()
  const repository = options.masterRepository ?? new PrismaMasterRepository()

  router.use(requireInternalApiKey(env))

  router.get("/branches", async (request, response, next) => {
    try {
      const query = listQuerySchema.safeParse(request.query)
      if (!query.success) {
        response.status(400).json({
          error: {
            code: "INVALID_MASTER_QUERY",
            message: "Parameter updatedSince tidak valid.",
          },
        })
        return
      }

      const syncedAt = new Date()
      const branches = await repository.listBranches(query.data)
      response.status(200).json({
        data: branches,
        meta: { syncedAt: syncedAt.toISOString(), count: branches.length },
      })
    } catch (error) {
      next(error)
    }
  })

  router.get("/areas", async (request, response, next) => {
    try {
      const query = listQuerySchema.safeParse(request.query)
      if (!query.success) {
        response.status(400).json({
          error: {
            code: "INVALID_MASTER_QUERY",
            message: "Parameter updatedSince tidak valid.",
          },
        })
        return
      }

      const syncedAt = new Date()
      const areas = await repository.listAreas(query.data)
      response.status(200).json({
        data: areas,
        meta: { syncedAt: syncedAt.toISOString(), count: areas.length },
      })
    } catch (error) {
      next(error)
    }
  })

  return router
}
