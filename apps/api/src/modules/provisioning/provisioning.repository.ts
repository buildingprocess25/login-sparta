import { SpartaModuleId } from "@prisma/client"
import type { Prisma, PrismaClient } from "@prisma/client"
import type {
  SpartaModuleId as PublicModuleId,
  SpartaProvisioningEvent,
} from "@sparta/shared"

import { prisma } from "../../db/prisma"

export type ProvisioningEventRecord = {
  id: string
  type: string
  userId: string
  moduleId: PublicModuleId
  payload: SpartaProvisioningEvent
  status: "PENDING" | "DELIVERED" | "FAILED" | "SKIPPED"
  attempts: number
  nextAttemptAt: Date
  lastError: string | null
  deliveredAt: Date | null
  createdAt: Date
}

export type NewProvisioningEvent = {
  id: string
  userId: string
  moduleId: PublicModuleId
  payload: SpartaProvisioningEvent
  /** Modul tanpa provisioningUrl langsung dicatat SKIPPED. */
  skipped: boolean
}

export type ModuleRoleRecord = {
  moduleId: PublicModuleId
  code: string
  label: string
}

export type ProvisioningRepository = {
  /** provisioningUrl per modul; modul tanpa URL tidak ada di map. */
  getProvisioningUrls(): Promise<Map<PublicModuleId, string>>
  listModuleRoles(): Promise<ModuleRoleRecord[]>
  enqueue(events: NewProvisioningEvent[]): Promise<void>
  /** Ambil event PENDING yang sudah waktunya dikirim, lalu kunci (attempts+1). */
  claimDue(now: Date, limit: number): Promise<ProvisioningEventRecord[]>
  markDelivered(id: string, at: Date): Promise<void>
  markRetry(id: string, nextAttemptAt: Date, error: string): Promise<void>
  markFailed(id: string, error: string): Promise<void>
  listForUser(userId: string): Promise<ProvisioningEventRecord[]>
  /** Kirim ulang event FAILED: kembali ke PENDING, percobaan direset. */
  requeue(id: string, now: Date): Promise<boolean>
}

const toPrismaModuleId = (moduleId: PublicModuleId) =>
  moduleId.toUpperCase() as SpartaModuleId
const toPublicModuleId = (moduleId: SpartaModuleId) =>
  moduleId.toLowerCase() as PublicModuleId

type PrismaEvent = Prisma.ProvisioningEventGetPayload<object>

function mapEvent(event: PrismaEvent): ProvisioningEventRecord {
  return {
    id: event.id,
    type: event.type,
    userId: event.userId,
    moduleId: toPublicModuleId(event.moduleId),
    payload: event.payload as unknown as SpartaProvisioningEvent,
    status: event.status,
    attempts: event.attempts,
    nextAttemptAt: event.nextAttemptAt,
    lastError: event.lastError,
    deliveredAt: event.deliveredAt,
    createdAt: event.createdAt,
  }
}

export class PrismaProvisioningRepository implements ProvisioningRepository {
  private readonly client: PrismaClient

  constructor(client: PrismaClient = prisma) {
    this.client = client
  }

  async getProvisioningUrls() {
    const modules = await this.client.appModule.findMany({
      where: { provisioningUrl: { not: null }, isActive: true },
      select: { id: true, provisioningUrl: true },
    })
    return new Map(
      modules.map((module) => [
        toPublicModuleId(module.id),
        module.provisioningUrl as string,
      ])
    )
  }

  async listModuleRoles() {
    const roles = await this.client.moduleRole.findMany({
      where: { isActive: true },
      orderBy: [{ moduleId: "asc" }, { sortOrder: "asc" }],
    })
    return roles.map((role) => ({
      moduleId: toPublicModuleId(role.moduleId),
      code: role.code,
      label: role.label,
    }))
  }

  async enqueue(events: NewProvisioningEvent[]) {
    if (events.length === 0) return
    await this.client.provisioningEvent.createMany({
      data: events.map((event) => ({
        id: event.id,
        type: event.payload.type,
        userId: event.userId,
        moduleId: toPrismaModuleId(event.moduleId),
        payload: event.payload as unknown as Prisma.InputJsonValue,
        status: event.skipped ? "SKIPPED" : "PENDING",
      })),
    })
  }

  async claimDue(now: Date, limit: number) {
    const due = await this.client.provisioningEvent.findMany({
      where: { status: "PENDING", nextAttemptAt: { lte: now } },
      orderBy: { createdAt: "asc" },
      take: limit,
    })

    const claimed: ProvisioningEventRecord[] = []
    for (const event of due) {
      // Kunci optimis: hanya satu instance yang berhasil menaikkan attempts.
      const result = await this.client.provisioningEvent.updateMany({
        where: { id: event.id, status: "PENDING", attempts: event.attempts },
        data: {
          attempts: { increment: 1 },
          // Tahan sementara agar instance lain tidak mengambilnya lagi.
          nextAttemptAt: new Date(now.getTime() + 5 * 60_000),
        },
      })
      if (result.count === 1) {
        claimed.push(mapEvent({ ...event, attempts: event.attempts + 1 }))
      }
    }
    return claimed
  }

  async markDelivered(id: string, at: Date) {
    await this.client.provisioningEvent.update({
      where: { id },
      data: { status: "DELIVERED", deliveredAt: at, lastError: null },
    })
  }

  async markRetry(id: string, nextAttemptAt: Date, error: string) {
    await this.client.provisioningEvent.update({
      where: { id },
      data: { nextAttemptAt, lastError: error },
    })
  }

  async markFailed(id: string, error: string) {
    await this.client.provisioningEvent.update({
      where: { id },
      data: { status: "FAILED", lastError: error },
    })
  }

  async listForUser(userId: string) {
    const events = await this.client.provisioningEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })
    return events.map(mapEvent)
  }

  async requeue(id: string, now: Date) {
    const result = await this.client.provisioningEvent.updateMany({
      where: { id, status: "FAILED" },
      data: { status: "PENDING", attempts: 0, nextAttemptAt: now },
    })
    return result.count === 1
  }
}
