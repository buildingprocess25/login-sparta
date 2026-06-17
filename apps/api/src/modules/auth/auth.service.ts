import type { SpartaSessionDto } from "@sparta/shared"

import type { AppEnv } from "../../config/env"
import { verifyPasswordHash } from "../../services/security/password-hash"
import {
  createSessionToken,
  hashSessionToken,
} from "../../services/security/session-token"
import type { AuthRepository, AuthUserRecord } from "./auth.repository"
import type { LoginInput } from "./auth.schemas"

const SESSION_TTL_MS = 8 * 60 * 60 * 1000

export class AuthError extends Error {
  readonly statusCode: number
  readonly code: string

  constructor(
    message: string,
    statusCode: number,
    code: string
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
  }
}

export type LoginContext = {
  userAgent: string | null
  ipAddress: string | null
}

export type AuthSessionResult = {
  session: SpartaSessionDto
  rawToken: string
  expiresAt: Date
}

function toSessionDto(user: AuthUserRecord): SpartaSessionDto {
  return {
    email: user.email,
    fullName: user.fullName,
    branch: user.branchName,
    access: user.access,
    mustChangePassword:
      user.passwordState === "BRANCH_DEFAULT" ||
      user.passwordState === "RESET_REQUIRED",
  }
}

function isUserLocked(user: AuthUserRecord, now: Date) {
  return user.status === "LOCKED" || Boolean(user.lockedUntil && user.lockedUntil > now)
}

export class AuthService {
  private readonly repository: AuthRepository
  private readonly env: AppEnv

  constructor(repository: AuthRepository, env: AppEnv) {
    this.repository = repository
    this.env = env
  }

  async login(input: LoginInput, context: LoginContext): Promise<AuthSessionResult> {
    const now = new Date()
    const user = await this.repository.findUserByEmail(input.email)

    if (!user) {
      throw new AuthError("Email atau password SPARTA tidak sesuai.", 401, "INVALID_CREDENTIALS")
    }

    if (user.status === "INACTIVE") {
      throw new AuthError("Akun SPARTA tidak aktif.", 403, "USER_INACTIVE")
    }

    if (isUserLocked(user, now)) {
      throw new AuthError("Akun SPARTA sedang dikunci.", 403, "USER_LOCKED")
    }

    const isPasswordValid = await this.verifyPassword(user, input.password)

    if (!isPasswordValid) {
      await this.repository.incrementFailedLogin(user.id)
      throw new AuthError("Email atau password SPARTA tidak sesuai.", 401, "INVALID_CREDENTIALS")
    }

    await this.repository.updateSuccessfulLogin(user.id, now)

    const rawToken = createSessionToken()
    const expiresAt = new Date(now.getTime() + SESSION_TTL_MS)

    await this.repository.createSession({
      userId: user.id,
      tokenHash: hashSessionToken(rawToken, this.env.SESSION_SECRET),
      userAgent: context.userAgent,
      ipAddress: context.ipAddress,
      expiresAt,
    })

    return {
      session: toSessionDto(user),
      rawToken,
      expiresAt,
    }
  }

  async getSession(rawToken: string | undefined) {
    if (!rawToken) {
      throw new AuthError("Session SPARTA tidak ditemukan.", 401, "UNAUTHENTICATED")
    }

    const session = await this.repository.findSessionByTokenHash(
      hashSessionToken(rawToken, this.env.SESSION_SECRET)
    )

    if (!session) {
      throw new AuthError("Session SPARTA tidak valid.", 401, "UNAUTHENTICATED")
    }

    return {
      id: session.id,
      user: session.user,
      session: toSessionDto(session.user),
    }
  }

  async logout(rawToken: string | undefined) {
    if (!rawToken) {
      return
    }

    const session = await this.repository.findSessionByTokenHash(
      hashSessionToken(rawToken, this.env.SESSION_SECRET)
    )

    if (session) {
      await this.repository.revokeSession(session.id, new Date())
    }
  }

  private async verifyPassword(user: AuthUserRecord, password: string) {
    if (user.passwordState === "BRANCH_DEFAULT") {
      return password === user.branchName.toUpperCase()
    }

    if (!user.passwordHash) {
      return false
    }

    return verifyPasswordHash(user.passwordHash, password)
  }
}
