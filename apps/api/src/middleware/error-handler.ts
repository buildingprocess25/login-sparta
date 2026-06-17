import type { ErrorRequestHandler, RequestHandler } from "express"

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
  const message =
    error instanceof Error ? error.message : "Request SPARTA API gagal."

  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message,
    },
  })
}
