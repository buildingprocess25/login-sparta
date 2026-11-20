/**
 * API tiruan untuk pengembangan lokal TANPA backend/database.
 *
 * Hanya aktif bila `pnpm dev` (import.meta.env.DEV) DAN
 * VITE_SPARTA_DEV_MOCK=true. File ini dimuat lewat dynamic import dari
 * api-client, sehingga tidak ikut ke build produksi. Semua data hidup di
 * memori browser dan hilang saat halaman di-refresh.
 */
import {
  SPARTA_LAUNCHABLE_MODULE_IDS,
  type AdminUserDto,
  type MasterAreaAdminDto,
  type MasterBranchAdminDto,
  type MasterStoreAdminDto,
  type ModuleRoleDto,
  type ProvisioningEventDto,
  type SpartaLaunchableModuleId,
  type SpartaModuleDto,
  type SpartaPortalRole,
  type SpartaProvisioningEventType,
  type SpartaSessionDto,
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
  adminModules: [],
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

// Toko tiruan (bukan data sungguhan) untuk tab Toko di mode dev tiruan.
const stores: MasterStoreAdminDto[] = [
  ["C218", "CONTOH DUREN JAYA", "BDG", "BEKASI", "REGULAR", true],
  ["T968", "CONTOH RUKO BATAVIA", "BDG", null, "REGULAR", true],
  ["1SHO", "CONTOH CALABAI", "HEAD", null, "FRANCHISE", true],
  ["OC53", "CONTOH TRIRENGGO", "BDG", "BOGOR", "FRANCHISE", false],
].map(([code, name, branchCode, subArea, ownershipType, isActive]) => ({
  code: code as string,
  name: name as string,
  branchCode: branchCode as string,
  branchName: branchCode === "BDG" ? "Bandung" : "HEAD OFFICE",
  subArea: subArea as string | null,
  brand: "ALFAMART",
  ownershipType: ownershipType as string,
  latitude: null,
  longitude: null,
  isActive: isActive as boolean,
  source: "MANUAL",
  updatedAt: now(),
}))

const storeBrandRules = new Map<string, string[]>([
  ["ALFAMART", ["building", "maintenance", "energy", "siaga", "carbontrack"]],
  ["LAWSON", ["maintenance"]],
])

function handleStoreBrands(
  method: string,
  code: string | undefined,
  body: Record<string, unknown>
): MockResult {
  if (method === "GET" && !code) {
    return ok(
      [...storeBrandRules.entries()].map(([brand, moduleIds]) => ({
        code: brand,
        name: brand,
        moduleIds,
        storeCount: stores.filter((s) => s.brand === brand).length,
        hasRule: true,
      }))
    )
  }
  if (method === "PUT" && code && storeBrandRules.has(code)) {
    storeBrandRules.set(code, (body.moduleIds as string[]) ?? [])
    return ok({ code })
  }
  return fail(404, "MASTER_NOT_FOUND", `Brand ${code} tidak ditemukan.`)
}

function handleStores(
  method: string,
  code: string | undefined,
  body: Record<string, unknown>,
  search: URLSearchParams
): MockResult {
  if (method === "GET" && !code) {
    const q = (search.get("q") ?? "").toUpperCase()
    const branchCode = search.get("branchCode")
    const brand = search.get("brand")
    const status = search.get("status") ?? "all"
    const page = Number(search.get("page") ?? 1)
    const pageSize = Number(search.get("pageSize") ?? 20)
    const filtered = stores.filter(
      (s) =>
        (!q || s.code.includes(q) || s.name.includes(q)) &&
        (!branchCode || s.branchCode === branchCode) &&
        (!brand || s.brand === brand) &&
        (status === "all" || s.isActive === (status === "active"))
    )
    return {
      status: 200,
      body: {
        data: filtered.slice((page - 1) * pageSize, page * pageSize),
        meta: {
          total: filtered.length,
          page,
          pageSize,
          activeCount: stores.filter((s) => s.isActive).length,
          inactiveCount: stores.filter((s) => !s.isActive).length,
          withoutSubAreaCount: stores.filter((s) => !s.subArea).length,
        },
      },
    }
  }

  if (method === "POST" && !code) {
    const newCode = normalize(String(body.code ?? ""))
    if (!/^[A-Z0-9]{3,10}$/.test(newCode)) {
      return fail(
        400,
        "INVALID_MASTER_PAYLOAD",
        "Kode toko hanya boleh huruf dan angka, 3-10 karakter."
      )
    }
    if (stores.some((s) => s.code === newCode)) {
      return fail(
        409,
        "MASTER_CODE_TAKEN",
        `Kode toko ${newCode} sudah dipakai.`
      )
    }
    const branch = branches.find((b) => b.code === body.branchCode)
    if (!branch) {
      return fail(400, "MASTER_BRANCH_UNKNOWN", "Cabang tidak ditemukan.")
    }
    stores.push({
      code: newCode,
      name: String(body.name ?? ""),
      branchCode: branch.code,
      branchName: branch.name,
      subArea: (body.subArea as string | null) ?? null,
      brand: (body.brand as string | null) ?? null,
      ownershipType: (body.ownershipType as string | null) ?? null,
      latitude: null,
      longitude: null,
      isActive: true,
      source: "MANUAL",
      updatedAt: now(),
    })
    return ok({ code: newCode }, 201)
  }

  const store = stores.find((s) => s.code === code)
  if (!store)
    return fail(404, "MASTER_NOT_FOUND", `Toko ${code} tidak ditemukan.`)
  if (method === "PATCH") {
    for (const key of [
      "name",
      "subArea",
      "brand",
      "ownershipType",
      "isActive",
    ] as const) {
      if (body[key] !== undefined) Object.assign(store, { [key]: body[key] })
    }
    if (body.branchCode !== undefined) {
      const branch = branches.find((b) => b.code === body.branchCode)
      if (!branch) {
        return fail(400, "MASTER_BRANCH_UNKNOWN", "Cabang tidak ditemukan.")
      }
      store.branchCode = branch.code
      store.branchName = branch.name
    }
    store.updatedAt = now()
    return ok({ code })
  }
  return fail(404, "NOT_FOUND", "Endpoint tiruan tidak tersedia.")
}

function handleMaster(
  method: string,
  parts: string[],
  body: Record<string, unknown>,
  search: URLSearchParams
): MockResult {
  const [resource, code, sub, subId] = parts

  if (resource === "stores") return handleStores(method, code, body, search)
  if (resource === "store-brands") return handleStoreBrands(method, code, body)

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

// Katalog role sama dengan isi migrasi 20261119110000. Building dan SIAGA
// sengaja kosong: backend menerima role apa pun untuk modul itu.
const moduleRoles: ModuleRoleDto[] = [
  { moduleId: "energy", code: "USER", label: "User toko" },
  { moduleId: "energy", code: "AUDITOR", label: "Auditor" },
  { moduleId: "energy", code: "GS", label: "GS" },
  { moduleId: "energy", code: "AREA", label: "Area" },
  { moduleId: "energy", code: "ADMIN", label: "Admin" },
  { moduleId: "maintenance", code: "BMS", label: "BMS" },
  { moduleId: "maintenance", code: "BMC", label: "BMC" },
  { moduleId: "maintenance", code: "BNM_MANAGER", label: "BnM Manager" },
  { moduleId: "maintenance", code: "BRANCH_ADMIN", label: "Admin cabang" },
  { moduleId: "maintenance", code: "ADMIN", label: "Admin" },
  { moduleId: "carbontrack", code: "USER", label: "User" },
]

// Data tiruan, bukan karyawan sungguhan.
const users: AdminUserDto[] = [
  {
    id: "mock-user-1",
    email: "contoh.auditor@sparta.local",
    employeeId: "10000001",
    fullName: "Contoh Auditor",
    branchCode: "BDG",
    branchName: "Bandung",
    validBranchNames: ["Bandung"],
    role: "USER",
    status: "ACTIVE",
    passwordState: "USER_SET",
    lastLoginAt: now(),
    createdAt: now(),
    modules: [
      { moduleId: "energy", role: "AUDITOR", isActive: true },
      { moduleId: "carbontrack", role: "USER", isActive: true },
    ],
  },
  {
    id: "mock-user-2",
    email: "contoh.sync.lama@sparta.local",
    employeeId: null,
    fullName: "Contoh Sync Lama",
    branchCode: "HEAD OFFICE",
    branchName: "HEAD OFFICE",
    validBranchNames: ["HEAD OFFICE"],
    role: "USER",
    status: "ACTIVE",
    passwordState: "BRANCH_DEFAULT",
    lastLoginAt: null,
    createdAt: now(),
    modules: [{ moduleId: "maintenance", role: "BMS", isActive: true }],
  },
  {
    id: "mock-user-3",
    email: "contoh.nonaktif@sparta.local",
    employeeId: "10000003",
    fullName: "Contoh Nonaktif",
    branchCode: "BDG",
    branchName: "Bandung",
    validBranchNames: ["Bandung"],
    role: "MASTER_ADMIN",
    status: "INACTIVE",
    passwordState: "USER_SET",
    lastLoginAt: null,
    createdAt: now(),
    modules: [{ moduleId: "energy", role: "ADMIN", isActive: false }],
  },
]

const events: Array<ProvisioningEventDto & { userId: string }> = [
  {
    id: "mock-event-1",
    userId: "mock-user-1",
    type: "access.granted",
    moduleId: "energy",
    status: "DELIVERED",
    attempts: 1,
    lastError: null,
    nextAttemptAt: now(),
    deliveredAt: now(),
    createdAt: now(),
  },
  {
    id: "mock-event-2",
    userId: "mock-user-1",
    type: "access.granted",
    moduleId: "carbontrack",
    status: "FAILED",
    attempts: 8,
    lastError: "HTTP 401: signature tidak valid (mode dev tiruan)",
    nextAttemptAt: now(),
    deliveredAt: null,
    createdAt: now(),
  },
]

let userSeq = 3
let eventSeq = 2

// Modul tanpa URL provisioning dicatat SKIPPED, sama seperti di server.
const MOCK_PROVISIONED_MODULES = new Set<string>(["energy", "carbontrack"])

function recordEvent(
  userId: string,
  moduleId: SpartaLaunchableModuleId,
  type: SpartaProvisioningEventType
) {
  eventSeq += 1
  const delivered = MOCK_PROVISIONED_MODULES.has(moduleId)
  events.unshift({
    id: `mock-event-${eventSeq}`,
    userId,
    type,
    moduleId,
    status: delivered ? "DELIVERED" : "SKIPPED",
    attempts: delivered ? 1 : 0,
    lastError: null,
    nextAttemptAt: now(),
    deliveredAt: delivered ? now() : null,
    createdAt: now(),
  })
}

function isRoleAllowed(moduleId: string, role: string) {
  const roles = moduleRoles.filter((entry) => entry.moduleId === moduleId)
  return roles.length === 0 || roles.some((entry) => entry.code === role)
}

const unknownRole = (moduleId: string, role: string) =>
  fail(
    400,
    "MODULE_ROLE_UNKNOWN",
    `Role ${role} tidak dikenal oleh modul ${moduleId}.`
  )

function handleUsers(
  method: string,
  parts: string[],
  body: Record<string, unknown>
): MockResult {
  const [first, second, third] = parts

  if (!first && method === "GET") return ok(users)
  if (first === "module-roles" && method === "GET") return ok(moduleRoles)

  if (first === "provisioning-events" && third === "retry") {
    const event = events.find((e) => e.id === second)
    if (!event || event.status !== "FAILED") {
      return fail(
        404,
        "PROVISIONING_EVENT_NOT_RETRYABLE",
        "Event tidak ditemukan atau tidak berstatus gagal."
      )
    }
    // Tiruan: kiriman ulang langsung berhasil.
    event.status = "DELIVERED"
    event.attempts = 1
    event.lastError = null
    event.deliveredAt = now()
    return ok({ ok: true })
  }

  if (!first && method === "POST") {
    const email = String(body.email ?? "").toLowerCase()
    if (users.some((u) => u.email === email)) {
      return fail(409, "USER_EMAIL_TAKEN", `Email ${email} sudah dipakai.`)
    }
    const modules = (body.modules ?? []) as Array<{
      moduleId: SpartaLaunchableModuleId
      role: string
    }>
    const rejected = modules.find((m) => !isRoleAllowed(m.moduleId, m.role))
    if (rejected) return unknownRole(rejected.moduleId, rejected.role)

    userSeq += 1
    const user: AdminUserDto = {
      id: `mock-user-${userSeq}`,
      email,
      employeeId: (body.employeeId as string | null) ?? null,
      fullName: String(body.fullName ?? ""),
      branchCode: String(body.branchCode ?? ""),
      branchName: String(body.branchName ?? ""),
      validBranchNames: [String(body.branchName ?? "")],
      role: (body.role as AdminUserDto["role"]) ?? "USER",
      status: "ACTIVE",
      passwordState: "BRANCH_DEFAULT",
      lastLoginAt: null,
      createdAt: now(),
      modules: modules.map((m) => ({ ...m, isActive: true })),
    }
    users.push(user)
    for (const m of modules) recordEvent(user.id, m.moduleId, "access.granted")
    return ok(user, 201)
  }

  const user = users.find((u) => u.id === first)
  if (!user) return fail(404, "USER_NOT_FOUND", "User SPARTA tidak ditemukan.")

  if (second === "provisioning-events" && method === "GET") {
    return ok(
      events
        .filter((e) => e.userId === user.id)
        .map((event) => {
          const dto: ProvisioningEventDto & { userId?: string } = { ...event }
          delete dto.userId
          return dto
        })
    )
  }

  if (!second && method === "PATCH") {
    const before = user.status
    if (body.email !== undefined) user.email = String(body.email).toLowerCase()
    if (body.employeeId !== undefined)
      user.employeeId = body.employeeId as string | null
    if (body.fullName !== undefined) user.fullName = String(body.fullName)
    if (body.branchCode !== undefined) user.branchCode = String(body.branchCode)
    if (body.branchName !== undefined) user.branchName = String(body.branchName)
    if (body.role !== undefined) user.role = body.role as AdminUserDto["role"]
    if (body.status !== undefined)
      user.status = body.status as AdminUserDto["status"]
    const type: SpartaProvisioningEventType =
      before !== user.status && user.status !== "ACTIVE"
        ? "user.deactivated"
        : "user.updated"
    for (const m of user.modules.filter((m) => m.isActive)) {
      recordEvent(user.id, m.moduleId, type)
    }
    return ok({ ok: true })
  }

  if (
    second === "access" &&
    third &&
    (SPARTA_LAUNCHABLE_MODULE_IDS as readonly string[]).includes(third)
  ) {
    const moduleId = third as SpartaLaunchableModuleId
    const existing = user.modules.find((m) => m.moduleId === moduleId)

    if (method === "PUT") {
      const role = String(body.role ?? "USER")
      if (!isRoleAllowed(moduleId, role)) return unknownRole(moduleId, role)
      if (existing) {
        existing.role = role
        existing.isActive = true
      } else {
        user.modules.push({ moduleId, role, isActive: true })
      }
      recordEvent(user.id, moduleId, "access.granted")
      return ok({ ok: true })
    }

    if (method === "DELETE") {
      if (existing) existing.isActive = false
      recordEvent(user.id, moduleId, "access.revoked")
      return ok({ ok: true })
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
    return handleMaster(method, parts.slice(3), body, url.searchParams)
  }

  if (parts[0] === "v1" && parts[1] === "admin" && parts[2] === "users") {
    if (session.role !== "SYSTEM_ADMIN") {
      return fail(
        403,
        "FORBIDDEN",
        "Akses ditolak. Hanya admin yang dapat mengakses endpoint ini."
      )
    }
    return handleUsers(method, parts.slice(3), body)
  }

  return fail(
    501,
    "DEV_MOCK",
    `Mode dev tiruan belum mendukung ${method} ${url.pathname}.`
  )
}
