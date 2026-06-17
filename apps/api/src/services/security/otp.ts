import crypto from "node:crypto"

export function generateOtpCode() {
  return crypto.randomInt(100_000, 1_000_000).toString()
}

export function hashOtpCode(
  pepper: string,
  email: string,
  purpose: string,
  otp: string
) {
  return crypto
    .createHmac("sha256", pepper)
    .update(`${email.toLowerCase()}:${purpose}:${otp.trim()}`)
    .digest("hex")
}
