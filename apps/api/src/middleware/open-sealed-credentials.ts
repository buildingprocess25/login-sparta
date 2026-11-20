import type { RequestHandler } from "express"
import { z } from "zod"

import {
  CredentialSealError,
  type CredentialSealer,
} from "../services/security/credential-sealer"

/** Hanya field rahasia ini yang boleh datang dari segel. */
const SEALABLE_FIELDS = ["password", "newPassword"] as const

const sealedSchema = z.object({
  keyId: z.string().min(1).max(64),
  key: z.string().min(1).max(2048),
  iv: z.string().min(1).max(64),
  data: z.string().min(1).max(8192),
})

/**
 * Bila body berisi `sealed`, buka segelnya dan taruh field rahasia kembali ke
 * body, sehingga route dan validasinya tidak perlu tahu soal enkripsi.
 * Body tanpa `sealed` diteruskan apa adanya.
 */
export function openSealedCredentials(
  sealer: CredentialSealer
): RequestHandler {
  return (request, response, next) => {
    const body = request.body as Record<string, unknown> | undefined
    if (!body || typeof body !== "object" || !("sealed" in body)) {
      next()
      return
    }

    const sealed = sealedSchema.safeParse(body.sealed)
    if (!sealed.success) {
      response.status(400).json({
        error: {
          code: "INVALID_SEALED_CREDENTIALS",
          message: "Format data login terenkripsi tidak valid.",
        },
      })
      return
    }

    try {
      const fields = sealer.open(sealed.data)
      delete body.sealed
      for (const name of SEALABLE_FIELDS) {
        if (typeof fields[name] === "string") body[name] = fields[name]
      }
      next()
    } catch (error) {
      if (error instanceof CredentialSealError) {
        response
          .status(400)
          .json({ error: { code: error.code, message: error.message } })
        return
      }
      next(error)
    }
  }
}
