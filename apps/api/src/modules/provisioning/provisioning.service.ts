import { randomUUID } from "node:crypto"

import type {
  SpartaModuleId,
  SpartaProvisioningEvent,
  SpartaProvisioningEventType,
} from "@sparta/shared"

import type { UserListRecord } from "../users/users.repository"
import type {
  ProvisioningRepository,
  NewProvisioningEvent,
} from "./provisioning.repository"

/** Bagian UsersService yang butuh provisioning; null = provisioning mati. */
export type ProvisioningPublisher = {
  /** Akses satu modul berubah (diberi, role diganti, atau dicabut). */
  publishAccessChange(
    user: UserListRecord,
    moduleId: SpartaModuleId,
    type: Extract<
      SpartaProvisioningEventType,
      "access.granted" | "access.revoked"
    >
  ): Promise<void>
  /**
   * Identitas atau status user berubah: kirim ke setiap modul yang pernah
   * diberi akses. `skipModuleId` dipakai saat perubahan berasal dari modul itu
   * sendiri (mis. sync), agar tidak terjadi putaran balik.
   */
  publishUserChange(
    user: UserListRecord,
    type: Extract<SpartaProvisioningEventType, "user.updated" | "user.deactivated">,
    options?: { skipModuleId?: SpartaModuleId }
  ): Promise<void>
}

export type ProvisioningServiceOptions = {
  now?: () => Date
  createId?: () => string
}

export class ProvisioningService implements ProvisioningPublisher {
  private readonly repository: ProvisioningRepository
  private readonly now: () => Date
  private readonly createId: () => string

  constructor(
    repository: ProvisioningRepository,
    options: ProvisioningServiceOptions = {}
  ) {
    this.repository = repository
    this.now = options.now ?? (() => new Date())
    this.createId = options.createId ?? randomUUID
  }

  async publishAccessChange(
    user: UserListRecord,
    moduleId: SpartaModuleId,
    type: "access.granted" | "access.revoked"
  ) {
    const access = user.modules.find((module) => module.moduleId === moduleId)
    await this.enqueue(user, [moduleId], type, () => ({
      isActive: type === "access.granted",
      role: access?.role ?? "USER",
    }))
  }

  async publishUserChange(
    user: UserListRecord,
    type: "user.updated" | "user.deactivated",
    options: { skipModuleId?: SpartaModuleId } = {}
  ) {
    // Modul yang aksesnya sudah dicabut tetap dikabari: akun lokalnya masih
    // ada (nonaktif) dan email/statusnya harus ikut benar.
    const moduleIds = user.modules
      .map((module) => module.moduleId)
      .filter((moduleId) => moduleId !== options.skipModuleId)

    await this.enqueue(user, moduleIds, type, (moduleId) => {
      const access = user.modules.find((module) => module.moduleId === moduleId)
      return {
        isActive: type === "user.deactivated" ? false : Boolean(access?.isActive),
        role: access?.role ?? "USER",
      }
    })
  }

  listModuleRoles() {
    return this.repository.listModuleRoles()
  }

  /**
   * Role harus ada di katalog modul. Modul dengan katalog kosong (Building,
   * SIAGA saat ini) menerima role apa pun sampai katalognya diisi.
   */
  async isRoleAllowed(moduleId: SpartaModuleId, role: string) {
    const roles = (await this.repository.listModuleRoles()).filter(
      (entry) => entry.moduleId === moduleId
    )
    return roles.length === 0 || roles.some((entry) => entry.code === role)
  }

  listEventsForUser(userId: string) {
    return this.repository.listForUser(userId)
  }

  requeue(eventId: string, moduleIds?: SpartaModuleId[]) {
    return this.repository.requeue(eventId, this.now(), moduleIds)
  }

  private async enqueue(
    user: UserListRecord,
    moduleIds: SpartaModuleId[],
    type: SpartaProvisioningEventType,
    accessFor: (moduleId: SpartaModuleId) => SpartaProvisioningEvent["access"]
  ) {
    if (moduleIds.length === 0) return

    const urls = await this.repository.getProvisioningUrls()
    const occurredAt = this.now().toISOString()

    const events: NewProvisioningEvent[] = moduleIds.map((moduleId) => {
      const eventId = this.createId()
      return {
        id: eventId,
        userId: user.id,
        moduleId,
        skipped: !urls.has(moduleId),
        payload: {
          eventId,
          type,
          occurredAt,
          moduleId,
          user: {
            spartaUserId: user.id,
            employeeId: user.employeeId,
            email: user.email,
            fullName: user.fullName,
            branch: user.branchName,
            branchCode: user.branchCode,
            status: user.status,
          },
          access: accessFor(moduleId),
        },
      }
    })

    await this.repository.enqueue(events)
  }
}
