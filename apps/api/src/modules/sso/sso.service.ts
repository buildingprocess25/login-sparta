import type { SpartaSessionDto } from "@sparta/shared"

import type { AppEnv } from "../../config/env"
import { hashSessionToken } from "../../services/security/session-token"
import { AuthError } from "../auth/auth.service"
import type { SsoRepository } from "./sso.repository"
import type { SsoExchangeInput } from "./sso.schemas"

function toSsoUserPayload(user: {
  email: string
  fullName: string
  branchName: string
  access: SpartaSessionDto["access"]
}) {
  return {
    email: user.email,
    fullName: user.fullName,
    branch: user.branchName,
    access: user.access,
  }
}

export class SsoService {
  private readonly repository: SsoRepository
  private readonly env: AppEnv

  constructor(repository: SsoRepository, env: AppEnv) {
    this.repository = repository
    this.env = env
  }

  async exchange(input: SsoExchangeInput) {
    const launch = await this.repository.findLaunchByTokenHash(
      hashSessionToken(input.launchToken, this.env.SESSION_SECRET)
    )

    if (!launch) {
      throw new AuthError(
        "Token SSO SPARTA tidak valid.",
        400,
        "INVALID_SSO_TOKEN"
      )
    }

    if (launch.consumedAt) {
      throw new AuthError(
        "Token SSO SPARTA sudah digunakan.",
        400,
        "SSO_TOKEN_CONSUMED"
      )
    }

    if (launch.expiresAt <= new Date()) {
      throw new AuthError(
        "Token SSO SPARTA sudah kedaluwarsa.",
        400,
        "SSO_TOKEN_EXPIRED"
      )
    }

    if (launch.moduleId !== input.moduleId) {
      throw new AuthError(
        "Token SSO SPARTA tidak sesuai modul.",
        403,
        "SSO_MODULE_MISMATCH"
      )
    }

    await this.repository.consumeLaunch(launch.id, new Date())

    return {
      user: toSsoUserPayload(launch.user),
    }
  }
}
