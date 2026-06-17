import type { ErrorRequestHandler, RequestHandler } from "express"

import { AuthError } from "../modules/auth/auth.service"

export const notFoundHandler: RequestHandler = (_request, response) => {
  response.status(404).json({
    error: {
      code: "NOT_FOUND",
      message: "Endpoint SPARTA API tidak ditemukan.",
    },
  })
}

export const errorHandler: ErrorRequestHandler = (
  error,
  _request,
  response,
  _next
) => {
  if (error instanceof AuthError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    })
    return
  }

  const message =
    error instanceof Error ? error.message : "Request SPARTA API gagal."

  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message,
    },
  })
}
