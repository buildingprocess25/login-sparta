import {
  SPARTA_SSO_CONTRACT_VERSION,
  type SpartaSsoUserPayload,
} from "@sparta/shared"

import type { AppEnv } from "../../config/env"
import { hashSessionToken } from "../../services/security/session-token"
import { AuthError } from "../auth/auth.service"
import type { SsoRepository, SsoUserRecord } from "./sso.repository"
import type { SsoExchangeInput } from "./sso.schemas"

/** Payload kontrak v2; field v1 tetap ada agar modul lama tidak rusak. */
function toSsoUserPayload(user: SsoUserRecord): SpartaSsoUserPayload {
  return {
    contractVersion: SPARTA_SSO_CONTRACT_VERSION,
    spartaUserId: user.id,
    employeeId: user.employeeId,
    email: user.email,
    fullName: user.fullName,
    branch: user.branchName,
    branchCode: user.branchCode,
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
