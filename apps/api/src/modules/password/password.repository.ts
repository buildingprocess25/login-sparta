import { OtpPurpose, OtpStatus, PasswordState } from "@prisma/client"
import type { OtpChallenge, PrismaClient } from "@prisma/client"

import { prisma } from "../../db/prisma"
import type { AuthUserRecord } from "../auth/auth.repository"

export type PasswordOtpPurpose = keyof typeof OtpPurpose
export type PasswordOtpStatus = keyof typeof OtpStatus

export type OtpChallengeRecord = {
  id: string
  userId: string | null
  email: string
  codeHash: string
  purpose: PasswordOtpPurpose
  status: PasswordOtpStatus
  attempts: number
  maxAttempts: number
  resendCount: number
  expiresAt: Date
  consumedAt: Date | null
  createdAt: Date
}

export type CreateOtpChallengeInput = {
  userId: string | null
  email: string
  codeHash: string
  purpose: PasswordOtpPurpose
  maxAttempts: number
  expiresAt: Date
}

export type UpdateOtpChallengeInput = Partial<
  Pick<
    OtpChallengeRecord,
    "status" | "attempts" | "resendCount" | "consumedAt"
  >
>

export type PasswordRepository = {
  findUserByEmail(email: string): Promise<AuthUserRecord | null>
  findUserById(userId: string): Promise<AuthUserRecord | null>
  updateUserPassword(userId: string, passwordHash: string): Promise<void>
  createOtpChallenge(
    input: CreateOtpChallengeInput
  ): Promise<OtpChallengeRecord>
  findActiveOtpChallenge(
    email: string,
    purpose: PasswordOtpPurpose
  ): Promise<OtpChallengeRecord | null>
  updateOtpChallenge(
    id: string,
    input: UpdateOtpChallengeInput
  ): Promise<void>
}

type PrismaPasswordUser = NonNullable<
  Awaited<ReturnType<PrismaPasswordRepository["findPrismaUserById"]>>
>

function mapUserRecord(user: PrismaPasswordUser): AuthUserRecord {
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
      .map((access) => {
        if (access.moduleId === "BUILDING") {
          return "building"
        }

        if (access.moduleId === "MAINTENANCE") {
          return "maintenance"
        }

        return "energy"
      }),
  }
}

function mapOtpChallenge(challenge: OtpChallenge): OtpChallengeRecord {
  return {
    id: challenge.id,
    userId: challenge.userId,
    email: challenge.email,
    codeHash: challenge.codeHash,
    purpose: challenge.purpose,
    status: challenge.status,
    attempts: challenge.attempts,
    maxAttempts: challenge.maxAttempts,
    resendCount: challenge.resendCount,
    expiresAt: challenge.expiresAt,
    consumedAt: challenge.consumedAt,
    createdAt: challenge.createdAt,
  }
}

export class PrismaPasswordRepository implements PasswordRepository {
  private readonly client: PrismaClient

  constructor(client: PrismaClient = prisma) {
    this.client = client
  }

  async findPrismaUserById(userId: string) {
    return this.client.user.findUnique({
      where: { id: userId },
      include: {
        branch: true,
        accesses: {
          where: { isActive: true },
          include: { module: true },
        },
      },
    })
  }

  async findUserById(userId: string) {
    const user = await this.findPrismaUserById(userId)

    return user ? mapUserRecord(user) : null
  }

  async findUserByEmail(email: string) {
    const user = await this.client.user.findUnique({
      where: { email },
      include: {
        branch: true,
        accesses: {
          where: { isActive: true },
          include: { module: true },
        },
      },
    })

    return user ? mapUserRecord(user) : null
  }

  async updateUserPassword(userId: string, passwordHash: string) {
    await this.client.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        passwordState: PasswordState.USER_SET,
        failedLoginCount: 0,
        lockedUntil: null,
      },
    })
  }

  async createOtpChallenge(input: CreateOtpChallengeInput) {
    const challenge = await this.client.otpChallenge.create({
      data: {
        userId: input.userId,
        email: input.email,
        codeHash: input.codeHash,
        purpose: OtpPurpose[input.purpose],
        maxAttempts: input.maxAttempts,
        expiresAt: input.expiresAt,
      },
    })

    return mapOtpChallenge(challenge)
  }

  async findActiveOtpChallenge(email: string, purpose: PasswordOtpPurpose) {
    const challenge = await this.client.otpChallenge.findFirst({
      where: {
        email,
        purpose: OtpPurpose[purpose],
        status: OtpStatus.ACTIVE,
      },
      orderBy: { createdAt: "desc" },
    })

    return challenge ? mapOtpChallenge(challenge) : null
  }

  async updateOtpChallenge(id: string, input: UpdateOtpChallengeInput) {
    await this.client.otpChallenge.update({
      where: { id },
      data: {
        status: input.status ? OtpStatus[input.status] : undefined,
        attempts: input.attempts,
        resendCount: input.resendCount,
        consumedAt: input.consumedAt,
      },
    })
  }
}
