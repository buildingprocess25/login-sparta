import { beforeEach, describe, expect, it, vi } from "vitest"

import type { UserListRecord } from "../users/users.repository"
import { InMemoryProvisioningRepository } from "./provisioning.fakes"
import { ProvisioningService } from "./provisioning.service"
import { verifyProvisioningSignature } from "./provisioning-signature"
import { ProvisioningWorker, retryDelayMs } from "./provisioning.worker"

const SECRET = "energy-provisioning-secret-minimum-32-chars"
const NOW = new Date("2026-11-19T10:00:00.000Z")

function user(override: Partial<UserListRecord> = {}): UserListRecord {
  return {
    id: "user-1",
    email: "rina@sparta.local",
    employeeId: "EMP100",
    fullName: "Rina Lestari",
    branchCode: "BDG",
    branchName: "Bandung",
    validBranchNames: ["Bandung"],
    role: "USER",
    status: "ACTIVE",
    passwordState: "USER_SET",
    lastLoginAt: null,
    createdAt: NOW,
    modules: [
      { moduleId: "energy", role: "AUDITOR", isActive: true },
      { moduleId: "carbontrack", role: "USER", isActive: false },
    ],
    ...override,
  }
}

describe("ProvisioningService", () => {
  let repository: InMemoryProvisioningRepository
  let service: ProvisioningService
  let ids: number

  beforeEach(() => {
    repository = new InMemoryProvisioningRepository()
    repository.urls.set("energy", "https://energy.sparta.local/provisioning")
    ids = 0
    service = new ProvisioningService(repository, {
      now: () => NOW,
      createId: () => `evt-${++ids}`,
    })
  })

  it("builds an access.granted event with the user snapshot", async () => {
    await service.publishAccessChange(user(), "energy", "access.granted")

    expect(repository.events).toHaveLength(1)
    expect(repository.events[0]).toMatchObject({
      status: "PENDING",
      payload: {
        eventId: "evt-1",
        type: "access.granted",
        occurredAt: NOW.toISOString(),
        moduleId: "energy",
        user: {
          spartaUserId: "user-1",
          employeeId: "EMP100",
          email: "rina@sparta.local",
          branchCode: "BDG",
          status: "ACTIVE",
        },
        access: { isActive: true, role: "AUDITOR" },
      },
    })
  })

  it("records events for modules without provisioningUrl as SKIPPED", async () => {
    await service.publishAccessChange(user(), "carbontrack", "access.revoked")
    expect(repository.events[0]).toMatchObject({
      status: "SKIPPED",
      payload: { access: { isActive: false } },
    })
  })

  it("sends user changes to every known module except the origin", async () => {
    await service.publishUserChange(user(), "user.updated", {
      skipModuleId: "carbontrack",
    })
    expect(repository.events.map((event) => event.moduleId)).toEqual(["energy"])

    await service.publishUserChange(user({ status: "INACTIVE" }), "user.deactivated")
    const deactivated = repository.events.filter(
      (event) => event.type === "user.deactivated"
    )
    expect(deactivated).toHaveLength(2)
    expect(deactivated.every((event) => !event.payload.access.isActive)).toBe(true)
  })

  it("allows any role while a module catalog is empty", async () => {
    expect(await service.isRoleAllowed("building", "ANYTHING")).toBe(true)

    repository.roles = [{ moduleId: "energy", code: "AUDITOR", label: "Auditor" }]
    expect(await service.isRoleAllowed("energy", "AUDITOR")).toBe(true)
    expect(await service.isRoleAllowed("energy", "MANAGER")).toBe(false)
  })
})

describe("ProvisioningWorker", () => {
  let repository: InMemoryProvisioningRepository
  let now: Date

  beforeEach(async () => {
    repository = new InMemoryProvisioningRepository()
    repository.urls.set("energy", "https://energy.sparta.local/provisioning")
    now = NOW
    const service = new ProvisioningService(repository, {
      now: () => NOW,
      createId: () => "evt-1",
    })
    await service.publishAccessChange(user(), "energy", "access.granted")
  })

  function worker(fetchImpl: typeof fetch, maxAttempts = 3) {
    return new ProvisioningWorker(repository, {
      secrets: { energy: SECRET },
      fetch: fetchImpl,
      now: () => now,
      maxAttempts,
      logger: { warn: () => {}, error: () => {} },
    })
  }

  it("delivers a signed event the module can verify", async () => {
    const fetchMock = vi.fn(async () => new Response(null, { status: 204 }))
    await worker(fetchMock as unknown as typeof fetch).runOnce()

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    const headers = init.headers as Record<string, string>
    expect(url).toBe("https://energy.sparta.local/provisioning")
    expect(headers["x-sparta-event-id"]).toBe("evt-1")
    expect(
      verifyProvisioningSignature({
        secret: SECRET,
        timestamp: Number(headers["x-sparta-timestamp"]),
        body: init.body as string,
        signature: headers["x-sparta-signature"] as string,
        nowSeconds: Math.floor(NOW.getTime() / 1000),
      })
    ).toBe(true)
    expect(repository.events[0]).toMatchObject({ status: "DELIVERED", attempts: 1 })
  })

  it("rejects a tampered body or a stale timestamp", () => {
    const timestamp = Math.floor(NOW.getTime() / 1000)
    const base = { secret: SECRET, timestamp, nowSeconds: timestamp }
    expect(
      verifyProvisioningSignature({ ...base, body: "{}", signature: "sha256=00" })
    ).toBe(false)
    expect(
      verifyProvisioningSignature({
        ...base,
        body: "{}",
        signature: "x",
        nowSeconds: timestamp + 3600,
      })
    ).toBe(false)
  })

  it("retries server errors with backoff, then marks FAILED", async () => {
    const fetchMock = vi.fn(async () => new Response("down", { status: 503 }))
    const instance = worker(fetchMock as unknown as typeof fetch, 2)

    await instance.runOnce()
    expect(repository.events[0]).toMatchObject({
      status: "PENDING",
      attempts: 1,
      lastError: "HTTP 503: down",
    })
    expect(repository.events[0]?.nextAttemptAt).toEqual(
      new Date(NOW.getTime() + retryDelayMs(1))
    )

    now = new Date(NOW.getTime() + retryDelayMs(1))
    await instance.runOnce()
    expect(repository.events[0]).toMatchObject({ status: "FAILED", attempts: 2 })

    expect(await repository.requeue("evt-1", now)).toBe(true)
    expect(repository.events[0]).toMatchObject({ status: "PENDING", attempts: 0 })
  })

  it("fails immediately when the module rejects the payload", async () => {
    const fetchMock = vi.fn(async () => new Response("bad", { status: 422 }))
    await worker(fetchMock as unknown as typeof fetch).runOnce()
    expect(repository.events[0]).toMatchObject({
      status: "FAILED",
      lastError: "HTTP 422: bad",
    })
  })

  it("does not send when the module secret is missing", async () => {
    const fetchMock = vi.fn()
    await new ProvisioningWorker(repository, {
      secrets: {},
      fetch: fetchMock as unknown as typeof fetch,
      now: () => now,
    }).runOnce()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(repository.events[0]?.status).toBe("FAILED")
  })
})
