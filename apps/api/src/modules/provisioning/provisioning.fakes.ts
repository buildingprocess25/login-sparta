import type { SpartaModuleId } from "@sparta/shared"

import type {
  ModuleRoleRecord,
  NewProvisioningEvent,
  ProvisioningEventRecord,
  ProvisioningRepository,
} from "./provisioning.repository"

/** Repository provisioning di memori untuk test. */
export class InMemoryProvisioningRepository implements ProvisioningRepository {
  urls = new Map<SpartaModuleId, string>()
  roles: ModuleRoleRecord[] = []
  events: ProvisioningEventRecord[] = []

  async getProvisioningUrls() {
    return new Map(this.urls)
  }

  async listModuleRoles() {
    return [...this.roles]
  }

  async enqueue(events: NewProvisioningEvent[]) {
    for (const event of events) {
      this.events.push({
        id: event.id,
        type: event.payload.type,
        userId: event.userId,
        moduleId: event.moduleId,
        payload: event.payload,
        status: event.skipped ? "SKIPPED" : "PENDING",
        attempts: 0,
        nextAttemptAt: new Date(event.payload.occurredAt),
        lastError: null,
        deliveredAt: null,
        createdAt: new Date(event.payload.occurredAt),
      })
    }
  }

  async claimDue(now: Date, limit: number) {
    const due = this.events
      .filter((event) => event.status === "PENDING" && event.nextAttemptAt <= now)
      .slice(0, limit)
    for (const event of due) {
      event.attempts += 1
      event.nextAttemptAt = new Date(now.getTime() + 5 * 60_000)
    }
    return due.map((event) => ({ ...event }))
  }

  private find(id: string) {
    const event = this.events.find((entry) => entry.id === id)
    if (!event) throw new Error(`Missing event ${id}`)
    return event
  }

  async markDelivered(id: string, at: Date) {
    Object.assign(this.find(id), { status: "DELIVERED", deliveredAt: at, lastError: null })
  }

  async markRetry(id: string, nextAttemptAt: Date, error: string) {
    Object.assign(this.find(id), { nextAttemptAt, lastError: error })
  }

  async markFailed(id: string, error: string) {
    Object.assign(this.find(id), { status: "FAILED", lastError: error })
  }

  async listForUser(userId: string) {
    return this.events.filter((event) => event.userId === userId)
  }

  async requeue(id: string, now: Date) {
    const event = this.events.find((entry) => entry.id === id)
    if (!event || event.status !== "FAILED") return false
    Object.assign(event, { status: "PENDING", attempts: 0, nextAttemptAt: now })
    return true
  }
}
