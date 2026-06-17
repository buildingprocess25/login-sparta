import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import pinoHttp from "pino-http"

import { createCorsOptions } from "./config/cors"
import { loadEnv, type AppEnv } from "./config/env"
import { errorHandler, notFoundHandler } from "./middleware/error-handler"
import { requestContext } from "./middleware/request-context"
import {
  createAuthRouter,
  type AuthRouterOptions,
} from "./modules/auth/auth.routes"
import {
  createFirstPasswordRouter,
  createPasswordRouter,
  type PasswordRouterOptions,
} from "./modules/password/password.routes"
import {
  createModulesRouter,
  type ModulesRouterOptions,
} from "./modules/modules/modules.routes"
import {
  createSsoRouter,
  type SsoRouterOptions,
} from "./modules/sso/sso.routes"

export type AppOptions = AuthRouterOptions &
  PasswordRouterOptions &
  ModulesRouterOptions &
  SsoRouterOptions

export function createApp(env: AppEnv = loadEnv(), options: AppOptions = {}) {
  const app = express()

  app.use(requestContext)
  app.use(pinoHttp())
  app.use(helmet())
  app.use(cors(createCorsOptions(env)))
  app.use(cookieParser())
  app.use(express.json({ limit: "100kb" }))

  app.get("/healthz", (_request, response) => {
    response.json({ status: "ok" })
  })

  app.use("/v1/auth", createAuthRouter(env, options))
  app.use("/v1/auth", createFirstPasswordRouter(env, options))
  app.use("/v1/password", createPasswordRouter(env, options))
  app.use("/v1/modules", createModulesRouter(env, options))
  app.use("/v1/sso", createSsoRouter(env, options))

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
