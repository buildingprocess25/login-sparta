import { createHmac, timingSafeEqual } from "node:crypto"

/**
 * Tanda tangan event provisioning:
 *   x-sparta-signature: sha256=<hex HMAC-SHA256(secret, `${timestamp}.${body}`)>
 *   x-sparta-timestamp: <unix detik>
 * Modul memverifikasi dengan secret yang sama dan menolak timestamp yang
 * terlalu lama (mencegah replay).
 */
export function signProvisioningBody(
  secret: string,
  timestamp: number,
  body: string
) {
  const digest = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("hex")
  return `sha256=${digest}`
}

/** Contoh verifikasi untuk modul (juga dipakai test). */
export function verifyProvisioningSignature(input: {
  secret: string
  timestamp: number
  body: string
  signature: string
  nowSeconds?: number
  toleranceSeconds?: number
}) {
  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000)
  if (Math.abs(now - input.timestamp) > (input.toleranceSeconds ?? 300)) {
    return false
  }

  const expected = Buffer.from(
    signProvisioningBody(input.secret, input.timestamp, input.body)
  )
  const actual = Buffer.from(input.signature)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}
