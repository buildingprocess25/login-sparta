import crypto from "node:crypto"

export const SPARTA_SESSION_COOKIE = "sparta_session"

export function createSessionToken() {
  return crypto.randomBytes(32).toString("base64url")
}

export function hashSessionToken(token: string, secret: string) {
  return crypto
    .createHash("sha256")
    .update(token)
    .update(secret)
    .digest("hex")
}
