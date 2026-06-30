export const SPARTA_LAUNCHABLE_MODULE_IDS = [
  "building",
  "maintenance",
  "energy",
] as const

export const SPARTA_MODULE_IDS = [
  ...SPARTA_LAUNCHABLE_MODULE_IDS,
  "engineering",
] as const

export type SpartaLaunchableModuleId =
  (typeof SPARTA_LAUNCHABLE_MODULE_IDS)[number]

export type SpartaModuleId = (typeof SPARTA_MODULE_IDS)[number]

export type SpartaSessionDto = {
  email: string
  fullName: string
  branch: string
  access: SpartaLaunchableModuleId[]
  mustChangePassword: boolean
}

export type SpartaModuleDto = {
  id: SpartaModuleId
  name: string
  shortName: string
  description: string
  colorHex: string
  hasAccess: boolean
}

export type SpartaModuleLaunchDto = {
  moduleId: SpartaLaunchableModuleId
  redirectUrl: string
  expiresAt: string
}
