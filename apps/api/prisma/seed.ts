// env WAJIB di-import sebelum @prisma/client: Prisma client memuat file .env
// saat di-import, dan apps/api/.env berisi DATABASE_URL produksi.
import { loadEnv } from "../src/config/env.ts"
import {
  PasswordState,
  PrismaClient,
  SpartaModuleId,
  UserRole,
  UserStatus,
} from "@prisma/client"

const env = loadEnv()
const prisma = new PrismaClient({ datasourceUrl: env.DATABASE_URL })

const moduleSeeds = [
  {
    id: SpartaModuleId.BUILDING,
    name: "SPARTA Building",
    shortName: "Building",
    description:
      "Pengelolaan proyek pembangunan dari rencana hingga serah terima.",
    callbackUrl: env.SPARTA_BUILDING_CALLBACK_URL,
    colorHex: "#e6000b",
    sortOrder: 1,
  },
  {
    id: SpartaModuleId.MAINTENANCE,
    name: "SPARTA Maintenance",
    shortName: "Maintenance",
    description:
      "Pemeliharaan toko, laporan perbaikan, dan pertanggungjawaban operasional.",
    callbackUrl: env.SPARTA_MAINTENANCE_CALLBACK_URL,
    colorHex: "#0069a7",
    sortOrder: 2,
  },
  {
    id: SpartaModuleId.ENERGY,
    name: "SPARTA Energy",
    shortName: "Energy",
    description: "Audit peralatan dan estimasi kebutuhan energi toko.",
    callbackUrl: env.SPARTA_ENERGY_CALLBACK_URL,
    colorHex: "#007a55",
    sortOrder: 3,
  },
  {
    id: SpartaModuleId.SIAGA,
    name: "SPARTA SIAGA",
    shortName: "SIAGA",
    description: "Sistem Pemantauan Cabang & Mitigasi Bencana Alfamart",
    callbackUrl: env.SPARTA_SIAGA_CALLBACK_URL,
    colorHex: "#123B6D",
    sortOrder: 4,
  },
  {
    id: SpartaModuleId.CARBONTRACK,
    name: "SPARTA Carbontrack",
    shortName: "Carbontrack",
    description:
      "Pencatatan emisi GRK Scope 1, 2, 3 dan produksi PLTS di 37 DC.",
    callbackUrl: env.SPARTA_CARBONTRACK_CALLBACK_URL,
    colorHex: "#902830",
    sortOrder: 5,
  },
]

const branchSeeds = [{ code: "HEAD", name: "HEAD OFFICE" }]

const userSeeds = [
  {
    email: "akmalzaidan960@gmail.com",
    employeeId: "96000001",
    fullName: "Akmal Zaidan Hibatullah",
    branchCode: "HEAD",
    role: UserRole.SYSTEM_ADMIN,
    modules: [
      SpartaModuleId.BUILDING,
      SpartaModuleId.MAINTENANCE,
      SpartaModuleId.ENERGY,
    ],
  },
]

const legacySeedEmails = [
  "andi.halim@sparta.local",
  "dina.putri@sparta.local",
  "raka.wijaya@sparta.local",
]

// Sama dengan isi migrasi 20261119110000. Migrasi hanya mengisi katalog untuk
// modul yang sudah ada di AppModule, jadi di database baru (modul dibuat seed
// setelah migrasi) katalog kosong. Seed mengisinya ulang tanpa mengubah baris
// yang sudah ada.
const moduleRoleSeeds: Array<[SpartaModuleId, string, string]> = [
  [SpartaModuleId.ENERGY, "USER", "User toko"],
  [SpartaModuleId.ENERGY, "AUDITOR", "Auditor"],
  [SpartaModuleId.ENERGY, "GS", "GS"],
  [SpartaModuleId.ENERGY, "AREA", "Area"],
  [SpartaModuleId.ENERGY, "ADMIN", "Admin"],
  [SpartaModuleId.MAINTENANCE, "BMS", "BMS"],
  [SpartaModuleId.MAINTENANCE, "BMC", "BMC"],
  [SpartaModuleId.MAINTENANCE, "BNM_MANAGER", "BnM Manager"],
  [SpartaModuleId.MAINTENANCE, "BRANCH_ADMIN", "Admin cabang"],
  [SpartaModuleId.MAINTENANCE, "ADMIN", "Admin"],
  [SpartaModuleId.ENGINEERING, "ES", "ES"],
  [SpartaModuleId.ENGINEERING, "COORD", "Koordinator"],
  [SpartaModuleId.ENGINEERING, "MANAGER", "Manager"],
  [SpartaModuleId.ENGINEERING, "REQUESTER", "Requester"],
  [SpartaModuleId.ENGINEERING, "ADMIN_HO", "Admin HO"],
  [SpartaModuleId.ENGINEERING, "SUPER_ADMIN", "Super admin"],
  [SpartaModuleId.CARBONTRACK, "USER", "User"],
]

async function seedModuleRoles() {
  const existingModules = new Set(
    (await prisma.appModule.findMany({ select: { id: true } })).map(
      (module) => module.id
    )
  )
  // Urutan tampil per modul mengikuti urutan di daftar.
  const sortOrder = new Map<SpartaModuleId, number>()

  for (const [moduleId, code, label] of moduleRoleSeeds) {
    const order = (sortOrder.get(moduleId) ?? 0) + 1
    sortOrder.set(moduleId, order)
    if (!existingModules.has(moduleId)) continue

    await prisma.moduleRole.upsert({
      where: { moduleId_code: { moduleId, code } },
      update: {},
      create: { moduleId, code, label, sortOrder: order },
    })
  }
}

async function seedModules() {
  for (const moduleSeed of moduleSeeds) {
    await prisma.appModule.upsert({
      where: { id: moduleSeed.id },
      update: {
        name: moduleSeed.name,
        shortName: moduleSeed.shortName,
        description: moduleSeed.description,
        callbackUrl: moduleSeed.callbackUrl,
        colorHex: moduleSeed.colorHex,
        isActive: true,
        sortOrder: moduleSeed.sortOrder,
      },
      create: moduleSeed,
    })
  }
}

async function seedBranches() {
  const branchIdsByCode = new Map<string, string>()

  for (const branchSeed of branchSeeds) {
    const branch = await prisma.branch.upsert({
      where: { code: branchSeed.code },
      update: { name: branchSeed.name },
      create: branchSeed,
    })

    branchIdsByCode.set(branch.code, branch.id)
  }

  return branchIdsByCode
}

async function seedUsers(branchIdsByCode: Map<string, string>) {
  await prisma.user.deleteMany({
    where: {
      email: { in: legacySeedEmails },
    },
  })

  for (const userSeed of userSeeds) {
    const branchId = branchIdsByCode.get(userSeed.branchCode)

    if (!branchId) {
      throw new Error(`Missing branch seed for ${userSeed.branchCode}`)
    }

    const user = await prisma.user.upsert({
      where: { email: userSeed.email },
      update: {
        employeeId: userSeed.employeeId,
        fullName: userSeed.fullName,
        branchId,
        passwordHash: null,
        passwordState: PasswordState.BRANCH_DEFAULT,
        status: UserStatus.ACTIVE,
        failedLoginCount: 0,
        lockedUntil: null,
      },
      create: {
        email: userSeed.email,
        employeeId: userSeed.employeeId,
        fullName: userSeed.fullName,
        branchId,
        role: userSeed.role ?? UserRole.USER,
        passwordState: PasswordState.BRANCH_DEFAULT,
        status: UserStatus.ACTIVE,
      },
    })

    for (const moduleId of userSeed.modules) {
      await prisma.userModuleAccess.upsert({
        where: {
          userId_moduleId: {
            userId: user.id,
            moduleId,
          },
        },
        update: {
          role: "USER",
          isActive: true,
          revokedAt: null,
        },
        create: {
          userId: user.id,
          moduleId,
          role: "USER",
          isActive: true,
        },
      })
    }
  }
}

async function main() {
  await seedModules()
  await seedModuleRoles()
  const branchIdsByCode = await seedBranches()
  await seedUsers(branchIdsByCode)

  const [moduleCount, branchCount, userCount, accessCount, roleCount] =
    await Promise.all([
      prisma.appModule.count(),
      prisma.branch.count(),
      prisma.user.count(),
      prisma.userModuleAccess.count(),
      prisma.moduleRole.count(),
    ])

  console.log(
    `Seeded SPARTA auth data: ${moduleCount} modules, ${branchCount} branches, ${userCount} users, ${accessCount} module access rows, ${roleCount} module roles.`
  )
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
