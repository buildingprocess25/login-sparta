import {
  PasswordState,
  SpartaModuleId,
  UserStatus,
} from "@prisma/client"
import type { PrismaClient } from "@prisma/client"

import { prisma } from "../../db/prisma"

export type AuthAccessModuleId = "building" | "maintenance" | "energy"

export type AuthUserRecord = {
  id: string
  email: string
  fullName: string
  branchName: string
  passwordHash: string | null
  passwordState: keyof typeof PasswordState
  status: keyof typeof UserStatus
  failedLoginCount: number
  lockedUntil: Date | null
  lastLoginAt: Date | null
  access: AuthAccessModuleId[]
}

export type CreateSessionInput = {
  userId: string
  tokenHash: string
  userAgent: string | null
  ipAddress: string | null
  expiresAt: Date
}

export type AuthSessionRecord = CreateSessionInput & {
  id: string
  revokedAt: Date | null
  user: AuthUserRecord
}

export type AuthRepository = {
  findUserByEmail(email: string): Promise<AuthUserRecord | null>
  updateSuccessfulLogin(userId: string, lastLoginAt: Date): Promise<void>
  incrementFailedLogin(userId: string): Promise<void>
  createSession(input: CreateSessionInput): Promise<AuthSessionRecord>
  findSessionByTokenHash(tokenHash: string): Promise<AuthSessionRecord | null>
  revokeSession(sessionId: string, revokedAt: Date): Promise<void>
}

const moduleIdMap = {
  BUILDING: "building",
  MAINTENANCE: "maintenance",
  ENERGY: "energy",
} satisfies Record<keyof typeof SpartaModuleId, AuthAccessModuleId>

type PrismaAuthUser = NonNullable<
  Awaited<ReturnType<PrismaAuthRepository["findPrismaUserByEmail"]>>
>

type PrismaAuthSession = NonNullable<
  Awaited<ReturnType<PrismaAuthRepository["findPrismaSessionByTokenHash"]>>
>

function mapUserRecord(user: PrismaAuthUser): AuthUserRecord {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    branchName: user.branch.name,
    passwordHash: user.passwordHash,
    passwordState: user.passwordState,
    status: user.status,
    failedLoginCount: user.failedLoginCount,
    lockedUntil: user.lockedUntil,
    lastLoginAt: user.lastLoginAt,
    access: user.accesses
      .filter((access) => access.module.isActive)
      .sort((left, right) => left.module.sortOrder - right.module.sortOrder)
      .map((access) => moduleIdMap[access.moduleId]),
  }
}

function mapSessionRecord(session: PrismaAuthSession): AuthSessionRecord {
  return {
    id: session.id,
    userId: session.userId,
    tokenHash: session.tokenHash,
    userAgent: session.userAgent,
    ipAddress: session.ipAddress,
    expiresAt: session.expiresAt,
    revokedAt: session.revokedAt,
    user: mapUserRecord(session.user),
  }
}

export class PrismaAuthRepository implements AuthRepository {
  private readonly client: PrismaClient

  constructor(client: PrismaClient = prisma) {
    this.client = client
  }

  async findPrismaUserByEmail(email: string) {
    return this.client.user.findUnique({
      where: { email },
      include: {
        branch: true,
        accesses: {
          where: { isActive: true },
          include: { module: true },
        },
      },
    })
  }

  async findUserByEmail(email: string) {
    const user = await this.findPrismaUserByEmail(email)

    return user ? mapUserRecord(user) : null
  }

  async updateSuccessfulLogin(userId: string, lastLoginAt: Date) {
    await this.client.user.update({
      where: { id: userId },
      data: {
        failedLoginCount: 0,
        lastLoginAt,
      },
    })
  }

  async incrementFailedLogin(userId: string) {
    await this.client.user.update({
      where: { id: userId },
      data: {
        failedLoginCount: { increment: 1 },
      },
    })
  }

  async createSession(input: CreateSessionInput) {
    const session = await this.client.session.create({
      data: input,
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

    return mapSessionRecord(session)
  }

  async findPrismaSessionByTokenHash(tokenHash: string) {
    return this.client.session.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
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
  }

  async findSessionByTokenHash(tokenHash: string) {
    const session = await this.findPrismaSessionByTokenHash(tokenHash)

    return session ? mapSessionRecord(session) : null
  }

  async revokeSession(sessionId: string, revokedAt: Date) {
    await this.client.session.updateMany({
      where: {
        id: sessionId,
        revokedAt: null,
      },
      data: { revokedAt },
    })
  }
}
