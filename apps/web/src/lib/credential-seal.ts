import type { ApiSuccess } from "@sparta/shared"

import { apiFetch, ApiClientError, isDevMockEnabled } from "@/lib/api-client"

/**
 * Password dikirim tersegel agar tidak terbaca di DevTools atau log proxy.
 * Lapisan tambahan di atas HTTPS. Skema: AES-256-GCM acak untuk isi field,
 * kunci AES dibungkus RSA-OAEP (SHA-256) dengan kunci publik server.
 * Pasangannya di server: apps/api/src/services/security/credential-sealer.ts.
 */
type CredentialKey = { keyId: string; publicKey: CryptoKey }

let cachedKey: Promise<CredentialKey> | null = null

function toBase64(buffer: ArrayBuffer | Uint8Array) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
}

async function fetchKey(): Promise<CredentialKey> {
  const result = await apiFetch<
    ApiSuccess<{ keyId: string; publicKey: string }>
  >("/v1/auth/credential-key")
  const publicKey = await crypto.subtle.importKey(
    "spki",
    fromBase64(result.data.publicKey),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  )
  return { keyId: result.data.keyId, publicKey }
}

function getKey(refresh = false) {
  if (refresh || !cachedKey) {
    cachedKey = fetchKey().catch((error: unknown) => {
      cachedKey = null
      throw error
    })
  }
  return cachedKey
}

async function seal(fields: Record<string, string>, key: CredentialKey) {
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  )
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plain = new TextEncoder().encode(
    JSON.stringify({ fields, ts: Date.now() })
  )
  const data = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    plain
  )
  const rawKey = await crypto.subtle.exportKey("raw", aesKey)
  const wrappedKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    key.publicKey,
    rawKey
  )
  return {
    keyId: key.keyId,
    key: toBase64(wrappedKey),
    iv: toBase64(iv),
    data: toBase64(data),
  }
}

/**
 * POST dengan field rahasia tersegel. Field lain dikirim apa adanya. Bila
 * server sudah berganti kunci (mis. restart), kunci diambil ulang dan request
 * dikirim sekali lagi.
 */
export async function postWithSealedSecrets<T>(
  path: string,
  body: Record<string, unknown>,
  secretFields: string[]
): Promise<T> {
  const secrets: Record<string, string> = {}
  const rest: Record<string, unknown> = {}
  for (const [name, value] of Object.entries(body)) {
    if (secretFields.includes(name) && typeof value === "string") {
      secrets[name] = value
    } else {
      rest[name] = value
    }
  }

  // Kirim biasa bila: mode dev tiruan (tidak ada kunci server), atau halaman
  // dibuka lewat HTTP non-localhost (Web Crypto hanya ada di konteks aman).
  // Di HTTP biasa tidak ada perlindungan apa pun, jadi segel tidak menambah
  // keamanan; yang penting login tetap berjalan.
  if (isDevMockEnabled() || !globalThis.crypto?.subtle) {
    return apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) })
  }

  const send = async (refreshKey: boolean) => {
    const sealed = await seal(secrets, await getKey(refreshKey))
    return apiFetch<T>(path, {
      method: "POST",
      body: JSON.stringify({ ...rest, sealed }),
    })
  }

  try {
    return await send(false)
  } catch (error) {
    if (
      error instanceof ApiClientError &&
      error.code === "CREDENTIAL_KEY_MISMATCH"
    ) {
      return send(true)
    }
    throw error
  }
}
