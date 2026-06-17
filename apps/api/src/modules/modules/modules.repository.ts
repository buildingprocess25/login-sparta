import { SpartaModuleId } from "@prisma/client"
import type { AppModule, Prisma, PrismaClient } from "@prisma/client"
import type { SpartaModuleId as PublicModuleId } from "@sparta/shared"

import { prisma } from "../../db/prisma"

export type ModuleRecord = {
  id: PublicModuleId
  name: string
  shortName: string
  description: string
  callbackUrl: string
  colorHex: string
  isActive: boolean
  sortOrder: number
}

export type CreateModuleLaunchInput = {
  userId: string
  moduleId: PublicModuleId
  launchTokenHash: string
  redirectUrl: string
  ipAddress: string | null
  userAgent: string | null
  expiresAt: Date
}

export type ModuleLaunchRecord = CreateModuleLaunchInput & {
  id: string
  consumedAt: Date | null
}

export type CreateAuditEventInput = {
  action: string
  entityType: string
  entityId?: string | null
  actorUserId: string
  metadata?: Prisma.InputJsonValue
  ipAddress?: string | null
  userAgent?: string | null
}

export type ModuleRepository = {
  listModules(): Promise<ModuleRecord[]>
  createLaunch(input: CreateModuleLaunchInput): Promise<ModuleLaunchRecord>
  createAuditEvent(input: CreateAuditEventInput): Promise<void>
}

export const prismaModuleIdByPublicId = {
  building: SpartaModuleId.BUILDING,
  maintenance: SpartaModuleId.MAINTENANCE,
  energy: SpartaModuleId.ENERGY,
} satisfies Record<PublicModuleId, SpartaModuleId>

export const publicModuleIdByPrismaId = {
  BUILDING: "building",
  MAINTENANCE: "maintenance",
  ENERGY: "energy",
} satisfies Record<keyof typeof SpartaModuleId, PublicModuleId>

function mapModule(module: AppModule): ModuleRecord {
  return {
    id: publicModuleIdByPrismaId[module.id],
    name: module.name,
    shortName: module.shortName,
    description: module.description,
    callbackUrl: module.callbackUrl,
    colorHex: module.colorHex,
    isActive: module.isActive,
    sortOrder: module.sortOrder,
  }
}

export class PrismaModuleRepository implements ModuleRepository {
  private readonly client: PrismaClient

  constructor(client: PrismaClient = prisma) {
    this.client = client
  }

  async listModules() {
    const modules = await this.client.appModule.findMany({
      orderBy: { sortOrder: "asc" },
    })

    return modules.map(mapModule)
  }

  async createLaunch(input: CreateModuleLaunchInput) {
    const launch = await this.client.moduleLaunch.create({
      data: {
        userId: input.userId,
        moduleId: prismaModuleIdByPublicId[input.moduleId],
        launchTokenHash: input.launchTokenHash,
        redirectUrl: input.redirectUrl,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        expiresAt: input.expiresAt,
      },
    })

    return {
      id: launch.id,
      userId: launch.userId,
      moduleId: publicModuleIdByPrismaId[launch.moduleId],
      launchTokenHash: launch.launchTokenHash ?? "",
      redirectUrl: launch.redirectUrl,
      ipAddress: launch.ipAddress,
      userAgent: launch.userAgent,
      expiresAt: launch.expiresAt ?? input.expiresAt,
      consumedAt: launch.consumedAt,
    }
  }

  async createAuditEvent(input: CreateAuditEventInput) {
    await this.client.auditEvent.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        actorUserId: input.actorUserId,
        metadata: input.metadata,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    })
  }
}
