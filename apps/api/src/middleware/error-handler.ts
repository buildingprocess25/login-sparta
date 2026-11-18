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
  request,
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

  // Raw error messages (e.g. Prisma validation errors) can echo query
  // arguments such as password hashes, so they stay in server logs only.
  request.log?.error({ err: error }, "Unhandled SPARTA API error")

  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Request SPARTA API gagal.",
    },
  })
}
