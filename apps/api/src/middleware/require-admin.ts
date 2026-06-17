import type { RequestHandler } from "express"

import { AuthError } from "../modules/auth/auth.service"

export const requireAdmin: RequestHandler = (request, _response, next) => {
  if (!request.spartaSession) {
    next(
      new AuthError(
        "Session SPARTA tidak ditemukan.",
        401,
        "UNAUTHENTICATED"
      )
    )
    return
  }

  if (request.spartaSession.user.role !== "SYSTEM_ADMIN") {
    next(
      new AuthError(
        "Akses ditolak. Hanya admin yang dapat mengakses endpoint ini.",
        403,
        "FORBIDDEN"
      )
    )
    return
  }

  next()
}