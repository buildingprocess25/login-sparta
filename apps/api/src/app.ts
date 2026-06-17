import cookieParser from "cookie-parser"
import cors from "cors"
import express from "express"
import helmet from "helmet"
import pinoHttp from "pino-http"

import { createCorsOptions } from "./config/cors"
import { loadEnv, type AppEnv } from "./config/env"
import { errorHandler, notFoundHandler } from "./middleware/error-handler"
import { requestContext } from "./middleware/request-context"

export function createApp(env: AppEnv = loadEnv()) {
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

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
