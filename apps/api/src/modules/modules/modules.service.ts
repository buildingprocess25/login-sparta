import type { SpartaModuleDto, SpartaModuleId } from "@sparta/shared"

import type { AppEnv } from "../../config/env"
import {
  createSessionToken,
  hashSessionToken,
} from "../../services/security/session-token"
import type { AuthUserRecord } from "../auth/auth.repository"
import { AuthError } from "../auth/auth.service"
import type { ModuleRepository, ModuleRecord } from "./modules.repository"

const LAUNCH_TOKEN_TTL_MS = 2 * 60 * 1000

export type LaunchContext = {
  ipAddress: string | null
  userAgent: string | null
}

function toModuleDto(
  module: ModuleRecord,
  user: AuthUserRecord
): SpartaModuleDto {
  return {
    id: module.id,
    name: module.name,
    shortName: module.shortName,
    description: module.description,
    colorHex: module.colorHex,
    hasAccess: module.isActive && user.access.includes(module.id),
  }
}

function appendLaunchToken(callbackUrl: string, launchToken: string) {
  const url = new URL(callbackUrl)
  url.searchParams.set("token", launchToken)

  return url.toString()
}

export class ModulesService {
  private readonly repository: ModuleRepository
  private readonly env: AppEnv

  constructor(repository: ModuleRepository, env: AppEnv) {
    this.repository = repository
    this.env = env
  }

  async listForUser(user: AuthUserRecord) {
    const modules = await this.repository.listModules()

    return {
      modules: modules.map((module) => toModuleDto(module, user)),
    }
  }

  async launchModule(
    user: AuthUserRecord,
    moduleId: SpartaModuleId,
    context: LaunchContext
  ) {
    const modules = await this.repository.listModules()
    const module = modules.find((record) => record.id === moduleId)

    if (!module || !module.isActive || !user.access.includes(moduleId)) {
      throw new AuthError(
        "Anda tidak memiliki akses ke modul SPARTA ini.",
        403,
        "MODULE_ACCESS_DENIED"
      )
    }

    const launchToken = createSessionToken()
    const redirectUrl = appendLaunchToken(module.callbackUrl, launchToken)
    const expiresAt = new Date(Date.now() + LAUNCH_TOKEN_TTL_MS)
    const launch = await this.repository.createLaunch({
      userId: user.id,
      moduleId,
      launchTokenHash: hashSessionToken(launchToken, this.env.SESSION_SECRET),
      redirectUrl,
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
      expiresAt,
    })

    await this.repository.createAuditEvent({
      action: "MODULE_LAUNCHED",
      entityType: "ModuleLaunch",
      entityId: launch.id,
      actorUserId: user.id,
      metadata: { moduleId },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    })

    return {
      moduleId,
      redirectUrl,
      expiresAt,
    }
  }
}
