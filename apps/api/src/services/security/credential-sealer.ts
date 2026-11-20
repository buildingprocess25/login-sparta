import {
  constants,
  createDecipheriv,
  createHash,
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  privateDecrypt,
  type KeyObject,
} from "node:crypto"

/**
 * Field rahasia (password) yang dikirim browser dalam bentuk tersegel, supaya
 * tidak terbaca di DevTools atau log proxy. Lapisan tambahan di atas HTTPS,
 * bukan pengganti.
 *
 * Skema hybrid yang didukung Web Crypto di browser:
 * - browser membuat kunci AES-256-GCM acak dan mengenkripsi JSON field;
 * - kunci AES dibungkus RSA-OAEP (SHA-256) dengan kunci publik server.
 */
export type SealedCredentials = {
  keyId: string
  /** Kunci AES terbungkus RSA-OAEP, base64. */
  key: string
  /** IV AES-GCM 12 byte, base64. */
  iv: string
  /** Ciphertext + tag GCM 16 byte (format Web Crypto), base64. */
  data: string
}

export class CredentialSealError extends Error {
  readonly code: "CREDENTIAL_KEY_MISMATCH" | "INVALID_SEALED_CREDENTIALS"

  constructor(
    code: "CREDENTIAL_KEY_MISMATCH" | "INVALID_SEALED_CREDENTIALS",
    message: string
  ) {
    super(message)
    this.code = code
  }
}

/** Segel yang lebih tua dari ini ditolak, mempersempit peluang dipakai ulang. */
const MAX_AGE_MS = 5 * 60 * 1000
const GCM_TAG_BYTES = 16

export class CredentialSealer {
  private readonly privateKey: KeyObject

  readonly publicKey: string

  readonly keyId: string

  /**
   * @param privateKeyPem Kunci privat RSA (PEM). Wajib diisi sama di semua
   * instance bila API berjalan lebih dari satu instance; tanpa itu setiap
   * proses membuat kunci sendiri saat start.
   */
  constructor(privateKeyPem?: string) {
    this.privateKey = privateKeyPem
      ? createPrivateKey(privateKeyPem.replace(/\\n/g, "\n"))
      : generateKeyPairSync("rsa", { modulusLength: 2048 }).privateKey
    const spki = createPublicKey(this.privateKey).export({
      type: "spki",
      format: "der",
    })
    this.publicKey = spki.toString("base64")
    this.keyId = createHash("sha256").update(spki).digest("hex").slice(0, 16)
  }

  open(sealed: SealedCredentials, now = Date.now()): Record<string, unknown> {
    if (sealed.keyId !== this.keyId) {
      throw new CredentialSealError(
        "CREDENTIAL_KEY_MISMATCH",
        "Kunci enkripsi sudah berganti. Muat ulang kunci lalu kirim lagi."
      )
    }

    let payload: unknown
    try {
      const aesKey = privateDecrypt(
        {
          key: this.privateKey,
          padding: constants.RSA_PKCS1_OAEP_PADDING,
          oaepHash: "sha256",
        },
        Buffer.from(sealed.key, "base64")
      )
      const data = Buffer.from(sealed.data, "base64")
      const decipher = createDecipheriv(
        "aes-256-gcm",
        aesKey,
        Buffer.from(sealed.iv, "base64")
      )
      decipher.setAuthTag(data.subarray(data.length - GCM_TAG_BYTES))
      const plain = Buffer.concat([
        decipher.update(data.subarray(0, data.length - GCM_TAG_BYTES)),
        decipher.final(),
      ])
      payload = JSON.parse(plain.toString("utf8"))
    } catch {
      throw new CredentialSealError(
        "INVALID_SEALED_CREDENTIALS",
        "Data login terenkripsi tidak bisa dibaca."
      )
    }

    const { fields, ts } = (payload ?? {}) as {
      fields?: unknown
      ts?: unknown
    }
    if (
      typeof ts !== "number" ||
      Math.abs(now - ts) > MAX_AGE_MS ||
      !fields ||
      typeof fields !== "object" ||
      Array.isArray(fields)
    ) {
      throw new CredentialSealError(
        "INVALID_SEALED_CREDENTIALS",
        "Data login terenkripsi sudah kedaluwarsa atau tidak valid."
      )
    }
    return fields as Record<string, unknown>
  }
}

let sharedSealer: CredentialSealer | null = null

/** Satu sealer per proses: membuat kunci RSA cukup sekali saat start. */
export function getCredentialSealer(privateKeyPem?: string) {
  sharedSealer ??= new CredentialSealer(privateKeyPem)
  return sharedSealer
}
