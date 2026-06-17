import { Router } from "express"
import type { Response } from "express"

import type { AppEnv } from "../../config/env"
import { PrismaSsoRepository, type SsoRepository } from "./sso.repository"
import { ssoExchangeSchema } from "./sso.schemas"
import { SsoService } from "./sso.service"

export type SsoRouterOptions = {
  ssoRepository?: SsoRepository
}

function invalidPayload(response: Response) {
  response.status(400).json({
    error: {
      code: "INVALID_SSO_PAYLOAD",
      message: "Payload SSO SPARTA tidak valid.",
    },
  })
}

export function createSsoRouter(env: AppEnv, options: SsoRouterOptions = {}) {
  const router = Router()
  const ssoService = new SsoService(
    options.ssoRepository ?? new PrismaSsoRepository(),
    env
  )

  router.post("/exchange", async (request, response, next) => {
    try {
      const payload = ssoExchangeSchema.safeParse(request.body)

      if (!payload.success) {
        invalidPayload(response)
        return
      }

      response.json({
        data: await ssoService.exchange(payload.data),
      })
    } catch (error) {
      next(error)
    }
  })

  return router
}
