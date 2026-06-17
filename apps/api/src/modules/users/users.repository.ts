import { PasswordState, SpartaModuleId, UserRole, UserStatus } from "@prisma/client"
import type { Prisma, PrismaClient } from "@prisma/client"
import type { SpartaModuleId as PublicModuleId } from "@sparta/shared"

import { prisma } from "../../db/prisma"
import { publicModuleIdByPrismaId } from "../modules/modules.repository"

export type UserListRecord = {
  id: string
  email: string
  employeeId: string | null
  fullName: string
  branchCode: string
  branchName: string
  role: keyof typeof UserRole
  status: keyof typeof UserStatus
  passwordState: keyof typeof PasswordState
  lastLoginAt: Date | null
  createdAt: Date
  modules: Array<{
    moduleId: PublicModuleId
    role: string
    isActive: boolean
  }>
}

export type CreateUserInput = {
  email: string
  employeeId: string | null
  fullName: string
  branchCode: string
  branchName: string
  role: keyof typeof UserRole
  modules: Array<{
    moduleId: PublicModuleId
    role: string
  }>
}

export type UpdateUserInput = {
  email?: string
  employeeId?: string | null
  fullName?: string
  branchCode?: string
  branchName?: string
  role?: keyof typeof UserRole
  status?: keyof typeof UserStatus
}

export type UsersRepository = {
  listUsers(): Promise<UserListRecord[]>
  findUserById(userId: string): Promise<UserListRecord | null>
  createUser(input: CreateUserInput, actorUserId: string): Promise<UserListRecord>
  updateUser(userId: string, input: UpdateUserInput, actorUserId: string): Promise<void>
  grantModuleAccess(userId: string, moduleId: PublicModuleId, role: string, actorUserId: string): Promise<void>
  revokeModuleAccess(userId: string, moduleId: PublicModuleId, actorUserId: string): Promise<void>
  createAuditEvent(input: { action: string; entityType: string; entityId: string; actorUserId: string; metadata?: Prisma.InputJsonValue }): Promise<void>
}

type PrismaUserRecord = NonNullable<Awaited<ReturnType<PrismaUsersRepository["findPrismaUserById"]>>>

function mapUserRecord(user: PrismaUserRecord): UserListRecord {
  return {
    id: user.id,
    email: user.email,
    employeeId: user.employeeId,
    fullName: user.fullName,
    branchCode: user.branch.code,
    branchName: user.branch.name,
    role: user.role,
    status: user.status,
    passwordState: user.passwordState,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    modules: user.accesses.map((access) => ({
      moduleId: publicModuleIdByPrismaId[access.moduleId],
      role: access.role,
      isActive: access.isActive,
    })),
  }
}

export class PrismaUsersRepository implements UsersRepository {
  private readonly client: PrismaClient

  constructor(client: PrismaClient = prisma) {
    this.client = client
  }

  async findPrismaUserById(userId: string) {
    return this.client.user.findUnique({
      where: { id: userId },
      include: {
        branch: true,
        accesses: { include: { module: true } },
      },
    })
  }

  async listUsers() {
    const users = await this.client.user.findMany({
      include: {
        branch: true,
        accesses: { include: { module: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return users.map(mapUserRecord)
  }

  async findUserById(userId: string) {
    const user = await this.findPrismaUserById(userId)
    return user ? mapUserRecord(user) : null
  }

  async createUser(input: CreateUserInput, actorUserId: string) {
    let branch = await this.client.branch.findUnique({
      where: { code: input.branchCode },
    })

    if (!branch) {
      branch = await this.client.branch.create({
        data: {
          code: input.branchCode,
          name: input.branchName,
        },
      })
    }

    const user = await this.client.user.create({
      data: {
        email: input.email,
        employeeId: input.employeeId,
        fullName: input.fullName,
        branchId: branch.id,
        role: UserRole[input.role],
        passwordState: PasswordState.BRANCH_DEFAULT,
        status: UserStatus.ACTIVE,
        accesses: {
          create: input.modules.map((mod) => ({
            moduleId: SpartaModuleId[mod.moduleId.toUpperCase() as keyof typeof SpartaModuleId],
            role: mod.role,
            isActive: true,
            grantedByUserId: actorUserId,
          })),
        },
      },
      include: {
        branch: true,
        accesses: { include: { module: true } },
      },
    })

    await this.createAuditEvent({
      action: "USER_CREATED",
      entityType: "User",
      entityId: user.id,
      actorUserId,
      metadata: { email: user.email, fullName: user.fullName },
    })

    return mapUserRecord(user)
  }

  async updateUser(userId: string, input: UpdateUserInput, actorUserId: string) {
    const data: Prisma.UserUpdateInput = {}

    if (input.email !== undefined) data.email = input.email
    if (input.employeeId !== undefined) data.employeeId = input.employeeId
    if (input.fullName !== undefined) data.fullName = input.fullName
    if (input.role !== undefined) data.role = UserRole[input.role]
    if (input.status !== undefined) data.status = UserStatus[input.status]

    if (input.branchCode !== undefined && input.branchName !== undefined) {
      let branch = await this.client.branch.findUnique({
        where: { code: input.branchCode },
      })

      if (!branch) {
        branch = await this.client.branch.create({
          data: {
            code: input.branchCode,
            name: input.branchName,
          },
        })
      }

      data.branch = { connect: { id: branch.id } }
    }

    await this.client.user.update({
      where: { id: userId },
      data,
    })

    await this.createAuditEvent({
      action: "USER_UPDATED",
      entityType: "User",
      entityId: userId,
      actorUserId,
      metadata: input as Prisma.InputJsonObject,
    })
  }

  async grantModuleAccess(userId: string, moduleId: PublicModuleId, role: string, actorUserId: string) {
    await this.client.userModuleAccess.upsert({
      where: {
        userId_moduleId: {
          userId,
          moduleId: SpartaModuleId[moduleId.toUpperCase() as keyof typeof SpartaModuleId],
        },
      },
      update: {
        role,
        isActive: true,
        revokedAt: null,
        grantedByUserId: actorUserId,
        grantedAt: new Date(),
      },
      create: {
        userId,
        moduleId: SpartaModuleId[moduleId.toUpperCase() as keyof typeof SpartaModuleId],
        role,
        isActive: true,
        grantedByUserId: actorUserId,
      },
    })

    await this.createAuditEvent({
      action: "MODULE_ACCESS_GRANTED",
      entityType: "UserModuleAccess",
      entityId: `${userId}:${moduleId}`,
      actorUserId,
      metadata: { userId, moduleId, role },
    })
  }

  async revokeModuleAccess(userId: string, moduleId: PublicModuleId, actorUserId: string) {
    await this.client.userModuleAccess.updateMany({
      where: {
        userId,
        moduleId: SpartaModuleId[moduleId.toUpperCase() as keyof typeof SpartaModuleId],
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    })

    await this.createAuditEvent({
      action: "MODULE_ACCESS_REVOKED",
      entityType: "UserModuleAccess",
      entityId: `${userId}:${moduleId}`,
      actorUserId,
      metadata: { userId, moduleId },
    })
  }

  async createAuditEvent(input: { action: string; entityType: string; entityId: string; actorUserId: string; metadata?: Prisma.InputJsonValue }) {
    await this.client.auditEvent.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        actorUserId: input.actorUserId,
        metadata: input.metadata,
      },
    })
  }
}
