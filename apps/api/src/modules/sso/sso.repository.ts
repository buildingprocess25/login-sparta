import type { ModuleLaunch, PrismaClient } from "@prisma/client"
import type { SpartaModuleId } from "@sparta/shared"

import { prisma } from "../../db/prisma"
import type { AuthUserRecord } from "../auth/auth.repository"
import { publicModuleIdByPrismaId } from "../modules/modules.repository"

export type SsoLaunchRecord = {
  id: string
  userId: string
  moduleId: SpartaModuleId
  launchTokenHash: string
  redirectUrl: string
  expiresAt: Date
  consumedAt: Date | null
  user: AuthUserRecord
}

export type SsoRepository = {
  findLaunchByTokenHash(tokenHash: string): Promise<SsoLaunchRecord | null>
  consumeLaunch(id: string, consumedAt: Date): Promise<void>
}

type PrismaSsoLaunch = ModuleLaunch & {
  user: {
    id: string
    email: string
    fullName: string
    branch: { name: string }
    passwordHash: string | null
    passwordState: AuthUserRecord["passwordState"]
    role: AuthUserRecord["role"]
    status: AuthUserRecord["status"]
    failedLoginCount: number
    lockedUntil: Date | null
    lastLoginAt: Date | null
    accesses: Array<{
      moduleId: "BUILDING" | "MAINTENANCE" | "ENERGY"
      module: { isActive: boolean; sortOrder: number }
    }>
  }
}

function mapUser(user: PrismaSsoLaunch["user"]): AuthUserRecord {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    branchName: user.branch.name,
    passwordHash: user.passwordHash,
    passwordState: user.passwordState,
    role: user.role,
    status: user.status,
    failedLoginCount: user.failedLoginCount,
    lockedUntil: user.lockedUntil,
    lastLoginAt: user.lastLoginAt,
    access: user.accesses
      .filter((access) => access.module.isActive)
      .sort((left, right) => left.module.sortOrder - right.module.sortOrder)
      .map((access) => publicModuleIdByPrismaId[access.moduleId]),
  }
}

function mapLaunch(launch: PrismaSsoLaunch): SsoLaunchRecord {
  return {
    id: launch.id,
    userId: launch.userId,
    moduleId: publicModuleIdByPrismaId[launch.moduleId],
    launchTokenHash: launch.launchTokenHash ?? "",
    redirectUrl: launch.redirectUrl,
    expiresAt: launch.expiresAt ?? new Date(0),
    consumedAt: launch.consumedAt,
    user: mapUser(launch.user),
  }
}

export class PrismaSsoRepository implements SsoRepository {
  private readonly client: PrismaClient

  constructor(client: PrismaClient = prisma) {
    this.client = client
  }

  async findLaunchByTokenHash(tokenHash: string) {
    const launch = await this.client.moduleLaunch.findUnique({
      where: { launchTokenHash: tokenHash },
      include: {
        user: {
          include: {
            branch: true,
            accesses: {
              where: { isActive: true },
              include: { module: true },
            },
          },
        },
      },
    })

    return launch ? mapLaunch(launch) : null
  }

  async consumeLaunch(id: string, consumedAt: Date) {
    await this.client.moduleLaunch.update({
      where: { id },
      data: { consumedAt },
    })
  }
}
