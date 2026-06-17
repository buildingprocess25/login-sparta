import type { RequestHandler } from "express"

import type { AuthService } from "../modules/auth/auth.service"
import { SPARTA_SESSION_COOKIE } from "../services/security/session-token"

export type CurrentSpartaSession = Awaited<ReturnType<AuthService["getSession"]>>

declare global {
  namespace Express {
    interface Request {
      spartaSession?: CurrentSpartaSession
    }
  }
}

export function requireSession(authService: AuthService): RequestHandler {
  return async (request, _response, next) => {
    try {
      request.spartaSession = await authService.getSession(
        request.cookies?.[SPARTA_SESSION_COOKIE]
      )
      next()
    } catch (error) {
      next(error)
    }
  }
}
