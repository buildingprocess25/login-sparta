import {
  SPARTA_LAUNCHABLE_MODULE_IDS,
  SPARTA_MODULE_IDS,
  type SpartaLaunchableModuleId,
  type SpartaModuleId,
} from "./sparta"

export type ValidationIssue = {
  path: string
  message: string
}

export type ValidationResult<T> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      issues: ValidationIssue[]
    }

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function isSpartaModuleId(value: string): value is SpartaModuleId {
  return SPARTA_MODULE_IDS.includes(value as SpartaModuleId)
}

export function isSpartaLaunchableModuleId(
  value: string
): value is SpartaLaunchableModuleId {
  return SPARTA_LAUNCHABLE_MODULE_IDS.includes(
    value as SpartaLaunchableModuleId
  )
}
