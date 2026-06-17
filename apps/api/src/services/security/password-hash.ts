import { hash, verify } from "@node-rs/argon2"

const argonOptions = {
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
}

export function hashPassword(password: string) {
  return hash(password, argonOptions)
}

export function verifyPasswordHash(hashValue: string, password: string) {
  return verify(hashValue, password)
}
