import express from "express"
import request from "supertest"
import { describe, expect, it } from "vitest"

import { openSealedCredentials } from "../../middleware/open-sealed-credentials"
import { CredentialSealer, type SealedCredentials } from "./credential-sealer"

const sealer = new CredentialSealer()

const toBase64 = (buffer: ArrayBuffer | Uint8Array) =>
  Buffer.from(
    buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  ).toString("base64")

/** Sama persis dengan yang dilakukan browser (Web Crypto). */
async function sealLikeBrowser(
  fields: Record<string, string>,
  options: { keyId?: string; ts?: number } = {}
): Promise<SealedCredentials> {
  const subtle = globalThis.crypto.subtle
  const publicKey = await subtle.importKey(
    "spki",
    Buffer.from(sealer.publicKey, "base64"),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  )
  const aesKey = await subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"]
  )
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12))
  const plain = new TextEncoder().encode(
    JSON.stringify({ fields, ts: options.ts ?? Date.now() })
  )
  const data = await subtle.encrypt({ name: "AES-GCM", iv }, aesKey, plain)
  const rawKey = await subtle.exportKey("raw", aesKey)
  const key = await subtle.encrypt({ name: "RSA-OAEP" }, publicKey, rawKey)
  return {
    keyId: options.keyId ?? sealer.keyId,
    key: toBase64(key),
    iv: toBase64(iv),
    data: toBase64(data),
  }
}

function echoApp() {
  const app = express()
  app.use(express.json())
  app.use(openSealedCredentials(sealer))
  app.post("/echo", (req, res) => {
    res.json(req.body)
  })
  return app
}

describe("sealed credentials", () => {
  it("restores the password field from a browser-sealed payload", async () => {
    const sealed = await sealLikeBrowser({ password: "Rahasia123!" })

    const response = await request(echoApp())
      .post("/echo")
      .send({ email: "a@sparta.local", sealed })
      .expect(200)

    expect(response.body).toEqual({
      email: "a@sparta.local",
      password: "Rahasia123!",
    })
  })

  it("only restores password fields, never other fields", async () => {
    const sealed = await sealLikeBrowser({
      newPassword: "BaruSekali1!",
      email: "penyusup@sparta.local",
    })

    const response = await request(echoApp())
      .post("/echo")
      .send({ email: "asli@sparta.local", sealed })
      .expect(200)

    expect(response.body).toEqual({
      email: "asli@sparta.local",
      newPassword: "BaruSekali1!",
    })
  })

  it("passes plain bodies through unchanged", async () => {
    const response = await request(echoApp())
      .post("/echo")
      .send({ email: "a@sparta.local", password: "x" })
      .expect(200)
    expect(response.body.password).toBe("x")
  })

  it("rejects a stale key, an expired seal and a tampered payload", async () => {
    const wrongKey = await sealLikeBrowser(
      { password: "x" },
      { keyId: "kunci-lama" }
    )
    const mismatch = await request(echoApp())
      .post("/echo")
      .send({ sealed: wrongKey })
      .expect(400)
    expect(mismatch.body.error.code).toBe("CREDENTIAL_KEY_MISMATCH")

    const expired = await sealLikeBrowser(
      { password: "x" },
      { ts: Date.now() - 10 * 60 * 1000 }
    )
    const old = await request(echoApp())
      .post("/echo")
      .send({ sealed: expired })
      .expect(400)
    expect(old.body.error.code).toBe("INVALID_SEALED_CREDENTIALS")

    const sealed = await sealLikeBrowser({ password: "x" })
    const tampered = { ...sealed, data: toBase64(Buffer.from("rusak")) }
    const broken = await request(echoApp())
      .post("/echo")
      .send({ sealed: tampered })
      .expect(400)
    expect(broken.body.error.code).toBe("INVALID_SEALED_CREDENTIALS")
  })
})
