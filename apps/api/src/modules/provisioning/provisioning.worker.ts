import type { SpartaModuleId } from "@sparta/shared"

import type {
  ProvisioningEventRecord,
  ProvisioningRepository,
} from "./provisioning.repository"
import { signProvisioningBody } from "./provisioning-signature"

export type ProvisioningWorkerOptions = {
  /** Secret HMAC per modul. Modul tanpa secret tidak dikirimi (event gagal). */
  secrets: Partial<Record<SpartaModuleId, string>>
  fetch?: typeof fetch
  now?: () => Date
  batchSize?: number
  /** Setelah percobaan ke-N gagal, event ditandai FAILED. */
  maxAttempts?: number
  timeoutMs?: number
  logger?: Pick<Console, "warn" | "error">
}

/** 30 dtk, 1 mnt, 2 mnt, ... dibatasi 1 jam. */
export function retryDelayMs(attempts: number) {
  return Math.min(30_000 * 2 ** Math.max(attempts - 1, 0), 3_600_000)
}

export class ProvisioningWorker {
  private readonly repository: ProvisioningRepository
  private readonly options: Required<
    Omit<ProvisioningWorkerOptions, "secrets">
  > & { secrets: ProvisioningWorkerOptions["secrets"] }
  private timer: NodeJS.Timeout | null = null
  private running = false

  constructor(
    repository: ProvisioningRepository,
    options: ProvisioningWorkerOptions
  ) {
    this.repository = repository
    this.options = {
      secrets: options.secrets,
      fetch: options.fetch ?? fetch,
      now: options.now ?? (() => new Date()),
      batchSize: options.batchSize ?? 20,
      maxAttempts: options.maxAttempts ?? 8,
      timeoutMs: options.timeoutMs ?? 10_000,
      logger: options.logger ?? console,
    }
  }

  start(intervalMs = 15_000) {
    if (this.timer) return
    this.timer = setInterval(() => {
      void this.runOnce()
    }, intervalMs)
    this.timer.unref()
  }

  stop() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  /** Kirim satu batch event yang jatuh tempo. Tidak tumpang tindih. */
  async runOnce() {
    if (this.running) return 0
    this.running = true
    try {
      const events = await this.repository.claimDue(
        this.options.now(),
        this.options.batchSize
      )
      for (const event of events) {
        await this.deliver(event)
      }
      return events.length
    } catch (error) {
      this.options.logger.error("[provisioning] batch gagal", error)
      return 0
    } finally {
      this.running = false
    }
  }

  private async deliver(event: ProvisioningEventRecord) {
    const urls = await this.repository.getProvisioningUrls()
    const url = urls.get(event.moduleId)
    const secret = this.options.secrets[event.moduleId]

    if (!url) {
      await this.repository.markFailed(
        event.id,
        "provisioningUrl modul dikosongkan setelah event dibuat."
      )
      return
    }
    if (!secret) {
      await this.repository.markFailed(
        event.id,
        `Secret provisioning untuk ${event.moduleId} belum diatur.`
      )
      return
    }

    const body = JSON.stringify(event.payload)
    const timestamp = Math.floor(this.options.now().getTime() / 1000)

    let error: string
    try {
      const response = await this.options.fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-sparta-event-id": event.id,
          "x-sparta-timestamp": String(timestamp),
          "x-sparta-signature": signProvisioningBody(secret, timestamp, body),
        },
        body,
        signal: AbortSignal.timeout(this.options.timeoutMs),
      })

      if (response.ok) {
        await this.repository.markDelivered(event.id, this.options.now())
        return
      }

      const text = await response.text().catch(() => "")
      error = `HTTP ${response.status}${text ? `: ${text.slice(0, 300)}` : ""}`

      // 4xx selain 408/429 berarti modul menolak isi event; mengulang tidak
      // akan menolong, jadi langsung FAILED agar admin melihatnya.
      if (
        response.status >= 400 &&
        response.status < 500 &&
        response.status !== 408 &&
        response.status !== 429
      ) {
        await this.repository.markFailed(event.id, error)
        return
      }
    } catch (cause) {
      error = cause instanceof Error ? cause.message : String(cause)
    }

    if (event.attempts >= this.options.maxAttempts) {
      await this.repository.markFailed(event.id, error)
      this.options.logger.warn(
        `[provisioning] event ${event.id} ke ${event.moduleId} gagal permanen: ${error}`
      )
      return
    }

    await this.repository.markRetry(
      event.id,
      new Date(this.options.now().getTime() + retryDelayMs(event.attempts)),
      error
    )
  }
}
