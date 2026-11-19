/**
 * API tiruan untuk pengembangan lokal TANPA backend/database.
 *
 * Hanya aktif bila `pnpm dev` (import.meta.env.DEV) DAN
 * VITE_SPARTA_DEV_MOCK=true. File ini dimuat lewat dynamic import dari
 * api-client, sehingga tidak ikut ke build produksi. Semua data hidup di
 * memori browser dan hilang saat halaman di-refresh.
 */
import type {
  MasterAreaAdminDto,
  MasterBranchAdminDto,
  SpartaModuleDto,
  SpartaPortalRole,
  SpartaSessionDto,
} from "@sparta/shared"

type MockResult = { status: number; body: unknown }

const devRole = (import.meta.env.VITE_SPARTA_DEV_ROLE ??
  "SYSTEM_ADMIN") as SpartaPortalRole

const session: SpartaSessionDto = {
  email: "dev.admin@sparta.local",
  fullName: "Dev Admin",
  branch: "HEAD OFFICE",
  role: devRole,
  access: ["building", "maintenance", "energy", "siaga", "carbontrack"],
  mustChangePassword: false,
}

// Auto sign in: sesi langsung ada saat aplikasi dibuka.
let isSignedIn = true
const now = () => new Date().toISOString()

const areas: MasterAreaAdminDto[] = [
  {
    code: "JABAR",
    name: "Jawa Barat",
    isActive: true,
    branchCount: 1,
    updatedAt: now(),
  },
  {
    code: "JKT",
    name: "DKI Jakarta",
    isActive: true,
    branchCount: 1,
    updatedAt: now(),
  },
]

const branches: MasterBranchAdminDto[] = [
  {
    code: "BDG",
    name: "Bandung",
    address: "Jl. Soekarno-Hatta No. 12",
    areaCode: "JABAR",
    areaName: "Jawa Barat",
    isActive: true,
    userCount: 42,
    aliases: [{ id: "alias-1", alias: "BANDUNG", source: "ENERGY_SYNC" }],
    updatedAt: now(),
  },
  {
    code: "HEAD",
    name: "HEAD OFFICE",
    address: null,
    areaCode: null,
    areaName: null,
    isActive: true,
    userCount: 118,
    aliases: [],
    updatedAt: now(),
  },
  {
    code: "HEAD OFFICE",
    name: "HEAD OFFICE",
    address: null,
    areaCode: null,
    areaName: null,
    isActive: true,
    userCount: 3,
    aliases: [],
    updatedAt: now(),
  },
  {
    code: "Cikokol",
    name: "Cikokol",
    address: null,
    areaCode: null,
    areaName: null,
    isActive: true,
    userCount: 7,
    aliases: [],
    updatedAt: now(),
  },
  {
    code: "JKP",
    name: "Jakarta Pusat",
    address: null,
    areaCode: "JKT",
    areaName: "DKI Jakarta",
    isActive: false,
    userCount: 0,
    aliases: [],
    updatedAt: now(),
  },
]

const modules: SpartaModuleDto[] = [
  {
    id: "building",
    name: "SPARTA Building",
    shortName: "Building",
    description: "Mode dev tiruan.",
    colorHex: "#e6000b",
    hasAccess: true,
  },
  {
    id: "maintenance",
    name: "SPARTA Maintenance",
    shortName: "Maintenance",
    description: "Mode dev tiruan.",
    colorHex: "#0069a7",
    hasAccess: true,
  },
  {
    id: "energy",
    name: "SPARTA Energy",
    shortName: "Energy",
    description: "Mode dev tiruan.",
    colorHex: "#007a55",
    hasAccess: true,
  },
  {
    id: "siaga",
    name: "SPARTA SIAGA",
    shortName: "SIAGA",
    description: "Mode dev tiruan.",
    colorHex: "#123B6D",
    hasAccess: true,
  },
  {
    id: "carbontrack",
    name: "SPARTA Carbontrack",
    shortName: "Carbontrack",
    description: "Mode dev tiruan.",
    colorHex: "#8a1c2b",
    hasAccess: true,
  },
]

let aliasSeq = 1

const ok = (data: unknown, status = 200): MockResult => ({
  status,
  body: { data },
})
const fail = (status: number, code: string, message: string): MockResult => ({
  status,
  body: { error: { code, message } },
})

const CODE_PATTERN = /^[A-Z0-9_-]{2,20}$/
const normalize = (value: string) =>
  value.trim().replace(/\s+/g, " ").toUpperCase()

function recountAreas() {
  for (const area of areas) {
    area.branchCount = branches.filter((b) => b.areaCode === area.code).length
  }
}

function handleMaster(
  method: string,
  parts: string[],
  body: Record<string, unknown>
): MockResult {
  const [resource, code, sub, subId] = parts

  if (resource === "branches") {
    if (method === "GET" && !code) return ok(branches)

    if (method === "POST" && !code) {
      const newCode = normalize(String(body.code ?? ""))
      if (!CODE_PATTERN.test(newCode)) {
        return fail(
          400,
          "INVALID_MASTER_PAYLOAD",
          "Kode hanya boleh huruf, angka, - atau _, 2-20 karakter."
        )
      }
      if (branches.some((b) => b.code === newCode)) {
        return fail(
          409,
          "MASTER_CODE_TAKEN",
          `Kode cabang ${newCode} sudah dipakai.`
        )
      }
      const areaCode = (body.areaCode as string | null) ?? null
      branches.push({
        code: newCode,
        name: String(body.name ?? ""),
        address: (body.address as string | null) ?? null,
        areaCode,
        areaName: areas.find((a) => a.code === areaCode)?.name ?? null,
        isActive: true,
        userCount: 0,
        aliases: [],
        updatedAt: now(),
      })
      recountAreas()
      return ok({ code: newCode }, 201)
    }

    const branch = branches.find((b) => b.code === code)
    if (!branch)
      return fail(404, "MASTER_NOT_FOUND", `Cabang ${code} tidak ditemukan.`)

    if (method === "PATCH" && !sub) {
      if (body.name !== undefined) branch.name = String(body.name)
      if (body.address !== undefined)
        branch.address = body.address as string | null
      if (body.isActive !== undefined) branch.isActive = Boolean(body.isActive)
      if (body.areaCode !== undefined) {
        branch.areaCode = body.areaCode as string | null
        branch.areaName =
          areas.find((a) => a.code === branch.areaCode)?.name ?? null
      }
      branch.updatedAt = now()
      recountAreas()
      return ok({ code })
    }

    if (sub === "aliases" && method === "POST") {
      const alias = normalize(String(body.alias ?? ""))
      const owner = branches.find(
        (b) => b.code === alias || b.aliases.some((a) => a.alias === alias)
      )
      if (owner) {
        return fail(
          409,
          "MASTER_ALIAS_TAKEN",
          `Alias "${alias}" sudah dipakai cabang ${owner.code}.`
        )
      }
      aliasSeq += 1
      branch.aliases.push({ id: `alias-${aliasSeq}`, alias, source: "MANUAL" })
      return ok({ code }, 201)
    }

    if (sub === "aliases" && method === "DELETE" && subId) {
      branch.aliases = branch.aliases.filter((a) => a.id !== subId)
      return ok({ code })
    }
  }

  if (resource === "areas") {
    if (method === "GET" && !code) return ok(areas)

    if (method === "POST" && !code) {
      const newCode = normalize(String(body.code ?? ""))
      if (!CODE_PATTERN.test(newCode)) {
        return fail(
          400,
          "INVALID_MASTER_PAYLOAD",
          "Kode hanya boleh huruf, angka, - atau _, 2-20 karakter."
        )
      }
      if (areas.some((a) => a.code === newCode)) {
        return fail(
          409,
          "MASTER_CODE_TAKEN",
          `Kode area ${newCode} sudah dipakai.`
        )
      }
      areas.push({
        code: newCode,
        name: String(body.name ?? ""),
        isActive: true,
        branchCount: 0,
        updatedAt: now(),
      })
      return ok({ code: newCode }, 201)
    }

    const area = areas.find((a) => a.code === code)
    if (!area)
      return fail(404, "MASTER_NOT_FOUND", `Area ${code} tidak ditemukan.`)
    if (method === "PATCH") {
      if (body.name !== undefined) area.name = String(body.name)
      if (body.isActive !== undefined) area.isActive = Boolean(body.isActive)
      area.updatedAt = now()
      for (const branch of branches) {
        if (branch.areaCode === area.code) branch.areaName = area.name
      }
      return ok({ code })
    }
  }

  return fail(404, "NOT_FOUND", "Endpoint tiruan tidak tersedia.")
}

export async function handleDevMockRequest(
  path: string,
  init: RequestInit
): Promise<MockResult> {
  const method = (init.method ?? "GET").toUpperCase()
  const url = new URL(path, "http://mock.local")
  const parts = url.pathname.split("/").filter(Boolean).map(decodeURIComponent)
  const body = init.body
    ? (JSON.parse(String(init.body)) as Record<string, unknown>)
    : {}

  // Jeda kecil agar status "memuat" tetap terlihat seperti aslinya.
  await new Promise((resolve) => setTimeout(resolve, 250))

  if (url.pathname === "/v1/auth/me") {
    return isSignedIn
      ? ok({ session })
      : fail(401, "UNAUTHENTICATED", "Belum login.")
  }
  if (url.pathname === "/v1/auth/login" && method === "POST") {
    isSignedIn = true
    return ok({ session })
  }
  if (url.pathname === "/v1/auth/logout" && method === "POST") {
    isSignedIn = false
    return ok({ ok: true })
  }
  if (!isSignedIn) return fail(401, "UNAUTHENTICATED", "Belum login.")

  if (url.pathname === "/v1/modules" && method === "GET") {
    return ok({ modules })
  }
  if (parts[0] === "v1" && parts[1] === "modules" && parts[3] === "launch") {
    return fail(
      400,
      "DEV_MOCK",
      "Mode dev tiruan: membuka modul tidak tersedia."
    )
  }

  if (parts[0] === "v1" && parts[1] === "admin" && parts[2] === "master") {
    if (!["SYSTEM_ADMIN", "MASTER_ADMIN"].includes(session.role)) {
      return fail(403, "FORBIDDEN", "Akses ditolak.")
    }
    return handleMaster(method, parts.slice(3), body)
  }

  return fail(
    501,
    "DEV_MOCK",
    `Mode dev tiruan belum mendukung ${method} ${url.pathname}.`
  )
}
