import {
  PasswordState,
  PrismaClient,
  SpartaModuleId,
  UserStatus,
} from "@prisma/client"

import { loadEnv } from "../src/config/env.ts"

const prisma = new PrismaClient()
const env = loadEnv()

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
]

const branchSeeds = [
  { code: "JKT-PST", name: "Jakarta Pusat" },
  { code: "SBY", name: "Surabaya" },
  { code: "BDG", name: "Bandung" },
]

const userSeeds = [
  {
    email: "andi.halim@sparta.local",
    employeeId: "EMP001",
    fullName: "Andi Halim",
    branchCode: "JKT-PST",
    modules: [SpartaModuleId.BUILDING, SpartaModuleId.MAINTENANCE],
  },
  {
    email: "dina.putri@sparta.local",
    employeeId: "EMP002",
    fullName: "Dina Putri",
    branchCode: "SBY",
    modules: [SpartaModuleId.ENERGY],
  },
  {
    email: "raka.wijaya@sparta.local",
    employeeId: "EMP003",
    fullName: "Raka Wijaya",
    branchCode: "BDG",
    modules: [
      SpartaModuleId.BUILDING,
      SpartaModuleId.MAINTENANCE,
      SpartaModuleId.ENERGY,
    ],
  },
]

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
  const branchIdsByCode = await seedBranches()
  await seedUsers(branchIdsByCode)

  const [moduleCount, branchCount, userCount, accessCount] = await Promise.all([
    prisma.appModule.count(),
    prisma.branch.count(),
    prisma.user.count(),
    prisma.userModuleAccess.count(),
  ])

  console.log(
    `Seeded SPARTA auth data: ${moduleCount} modules, ${branchCount} branches, ${userCount} users, ${accessCount} module access rows.`
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
