export type SpartaAppId = "building" | "maintenance" | "energy"

export type SpartaApp = {
  id: SpartaAppId
  name: string
  shortName: string
  description: string
  passwordRule: string
  url: string
}

export type SpartaSession = {
  email: string
  fullName: string
  branch: string
  access: SpartaAppId[]
  mustChangePassword: boolean
}

export type LoginInput = {
  email: string
  password: string
}

export type LoginResult =
  | {
      ok: true
      session: SpartaSession
    }
  | {
      ok: false
      message: string
    }

export type PasswordUpdateInput = {
  email: string
  newPassword: string
}

export type PasswordUpdateResult =
  | {
      ok: true
    }
  | {
      ok: false
      message: string
    }

type SpartaUser = {
  email: string
  fullName: string
  branch: string
  access: SpartaAppId[]
  passwordHash?: string
}

const appOrder: SpartaAppId[] = ["building", "maintenance", "energy"]

export const SPARTA_APPS: Record<SpartaAppId, SpartaApp> = {
  building: {
    id: "building",
    name: "SPARTA Building",
    shortName: "Building",
    description:
      "Pengelolaan proyek pembangunan dari rencana hingga serah terima.",
    passwordRule: "Masukkan password SPARTA Anda.",
    url: "https://building.sparta.local",
  },
  maintenance: {
    id: "maintenance",
    name: "SPARTA Maintenance",
    shortName: "Maintenance",
    description:
      "Pemeliharaan toko, laporan perbaikan, dan pertanggungjawaban operasional.",
    passwordRule: "Masukkan password SPARTA Anda.",
    url: "https://maintenance.sparta.local",
  },
  energy: {
    id: "energy",
    name: "SPARTA Energy",
    shortName: "Energy",
    description: "Audit peralatan dan estimasi kebutuhan energi toko.",
    passwordRule: "Masukkan password SPARTA Anda.",
    url: "https://energy.sparta.local",
  },
}

function manualHash(value: string) {
  let hash = 2166136261

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(16).padStart(8, "0")
}

const SPARTA_USERS: SpartaUser[] = [
  {
    email: "andi.halim@sparta.local",
    fullName: "Andi Halim",
    branch: "Jakarta Pusat",
    access: ["maintenance", "building"],
  },
  {
    email: "dina.putri@sparta.local",
    fullName: "Dina Putri",
    branch: "Surabaya",
    access: ["energy"],
  },
  {
    email: "raka.wijaya@sparta.local",
    fullName: "Raka Wijaya",
    branch: "Bandung",
    access: ["maintenance", "building", "energy"],
  },
]

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function getBranchPassword(user: SpartaUser) {
  return user.branch.toUpperCase()
}

function getOrderedAccess(access: SpartaAppId[]) {
  return appOrder.filter((appId) => access.includes(appId))
}

function createSession(user: SpartaUser): SpartaSession {
  return {
    email: user.email,
    fullName: user.fullName,
    branch: user.branch,
    access: getOrderedAccess(user.access),
    mustChangePassword: !user.passwordHash,
  }
}

export function getUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email)

  return SPARTA_USERS.find((user) => user.email === normalizedEmail) ?? null
}

export function getAccessibleApps(email: string): SpartaApp[] {
  const user = getUserByEmail(email)

  if (!user) {
    return []
  }

  return getOrderedAccess(user.access).map((appId) => SPARTA_APPS[appId])
}

export function validateUserPassword(input: LoginInput): LoginResult {
  const user = getUserByEmail(input.email)

  if (!user) {
    return {
      ok: false,
      message: "Email tidak terdaftar pada SPARTA.",
    }
  }

  const password = input.password.trim()

  if (!password) {
    return {
      ok: false,
      message: "Password wajib diisi.",
    }
  }

  if (user.passwordHash) {
    if (manualHash(password) !== user.passwordHash) {
      return {
        ok: false,
        message: "Password SPARTA tidak sesuai.",
      }
    }

    return {
      ok: true,
      session: createSession(user),
    }
  }

  if (password !== getBranchPassword(user)) {
    return {
      ok: false,
      message: "Password awal harus menggunakan nama cabang huruf kapital.",
    }
  }

  return {
    ok: true,
    session: createSession(user),
  }
}

export function loginToSparta(input: LoginInput): LoginResult {
  return validateUserPassword(input)
}

export function updateUserPassword(
  input: PasswordUpdateInput
): PasswordUpdateResult {
  const user = getUserByEmail(input.email)

  if (!user) {
    return {
      ok: false,
      message: "Email tidak terdaftar pada SPARTA.",
    }
  }

  const newPassword = input.newPassword.trim()

  if (!newPassword) {
    return {
      ok: false,
      message: "Password baru wajib diisi.",
    }
  }

  if (newPassword.length < 8) {
    return {
      ok: false,
      message: "Password baru minimal 8 karakter.",
    }
  }

  if (newPassword === getBranchPassword(user)) {
    return {
      ok: false,
      message: "Password baru tidak boleh sama dengan nama cabang.",
    }
  }

  user.passwordHash = manualHash(newPassword)

  return {
    ok: true,
  }
}
