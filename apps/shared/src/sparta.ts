export const SPARTA_MODULE_IDS = ["building", "maintenance", "energy", "engineering"] as const

export type SpartaModuleId = (typeof SPARTA_MODULE_IDS)[number]

export type SpartaSessionDto = {
  email: string
  fullName: string
  branch: string
  access: SpartaModuleId[]
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
  moduleId: SpartaModuleId
  redirectUrl: string
  expiresAt: string
}
