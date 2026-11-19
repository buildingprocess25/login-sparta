import type { SpartaPortalRole } from "@sparta/shared"
import type { RequestHandler } from "express"

import { AuthError } from "../modules/auth/auth.service"

/** Izinkan request hanya untuk session dengan salah satu role portal ini. */
export function requireRoles(
  roles: readonly SpartaPortalRole[]
): RequestHandler {
  return (request, _response, next) => {
    if (!request.spartaSession) {
      next(
        new AuthError("Session SPARTA tidak ditemukan.", 401, "UNAUTHENTICATED")
      )
      return
    }

    if (!roles.includes(request.spartaSession.user.role)) {
      next(
        new AuthError(
          "Akses ditolak. Role Anda tidak boleh mengakses fitur ini.",
          403,
          "FORBIDDEN"
        )
      )
      return
    }

    next()
  }
}
