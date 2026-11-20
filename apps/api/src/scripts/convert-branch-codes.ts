/**
 * Konversi master Cabang ke kode resmi Alfamart (keputusan user 2026-11-20).
 *
 * Sumber pemetaan: prisma/data/alfamart-branch-codes.json.
 * Kode lama TIDAK diubah atau dihapus (modul menyimpannya). Untuk setiap kode
 * Alfamart:
 *   1. buat cabang baru berkode Alfamart (alamat dari Building, area dari
 *      cabang lama);
 *   2. pindahkan user, toko dan alias dari cabang lama yang namanya/kodenya
 *      cocok;
 *   3. nonaktifkan cabang lama, lalu jadikan kode dan namanya alias cabang baru.
 *
 * Opsi:
 *   --apply              tulis perubahan (bawaan: dry-run, hanya laporan)
 *   --allow-remote       izinkan DATABASE_URL selain localhost (produksi
 *                        hanya dengan izin user)
 *
 * Jalankan: pnpm --filter @sparta/api exec tsx src/scripts/convert-branch-codes.ts
 */
import { readFileSync } from "node:fs"
import path from "node:path"

// env WAJIB di-import sebelum @prisma/client: Prisma client memuat file .env
// saat di-import, dan apps/api/.env berisi DATABASE_URL produksi.
import { loadEnv } from "../config/env"
import { PrismaClient, type Prisma } from "@prisma/client"
import { normalizeBranchAlias as norm } from "../modules/master/branch-alias"

type MappingEntry = {
  code: string
  name: string
  address: string | null
  names: string[]
  /** Cabang yang sudah digabung ke cabang lain (mis. TZ01 -> KZ01). */
  mergedInto?: string
}

const args = new Set(process.argv.slice(2))
const apply = args.has("--apply")

const env = loadEnv()
const isLocal = /@(127\.0\.0\.1|localhost)(:\d+)?\//.test(env.DATABASE_URL)
if (!isLocal && !args.has("--allow-remote")) {
  console.error(
    "DATABASE_URL bukan database lokal. Tambahkan --allow-remote hanya bila user sudah mengizinkan."
  )
  process.exit(1)
}

const mapping = (
  JSON.parse(
    readFileSync(
      path.resolve(process.cwd(), "prisma/data/alfamart-branch-codes.json"),
      "utf8"
    )
  ) as { branches: MappingEntry[] }
).branches

const prisma = new PrismaClient({ datasourceUrl: env.DATABASE_URL })

type Report = {
  code: string
  created: boolean
  fromCodes: string[]
  users: number
  stores: number
  aliasesAdded: string[]
  aliasesSkipped: string[]
}

async function convert(tx: Prisma.TransactionClient) {
  const reports: Report[] = []
  const targetCodes = new Set(mapping.map((entry) => entry.code))
  const takenAliases = new Set(
    (await tx.branchAlias.findMany({ select: { alias: true } })).map(
      (row) => row.alias
    )
  )

  for (const entry of mapping) {
    const names = new Set(entry.names.map(norm))
    const branches = await tx.branch.findMany({
      include: { aliases: { select: { alias: true } } },
    })
    const sources = branches.filter(
      (branch) =>
        branch.code !== entry.code &&
        !targetCodes.has(branch.code) &&
        (names.has(norm(branch.code)) || names.has(norm(branch.name)))
    )

    let target = branches.find((branch) => branch.code === entry.code)
    const created = !target
    if (!target) {
      target = {
        ...(await tx.branch.create({
          data: {
            code: entry.code,
            name: entry.name,
            address: entry.address,
            areaId: sources.find((source) => source.areaId)?.areaId ?? null,
          },
        })),
        aliases: [],
      }
    }

    const sourceIds = sources.map((source) => source.id)
    const users = sourceIds.length
      ? (
          await tx.user.updateMany({
            where: { branchId: { in: sourceIds } },
            data: { branchId: target.id },
          })
        ).count
      : 0
    const stores = sourceIds.length
      ? (
          await tx.store.updateMany({
            where: { branchId: { in: sourceIds } },
            data: { branchId: target.id },
          })
        ).count
      : 0
    if (sourceIds.length) {
      await tx.branchAlias.updateMany({
        where: { branchId: { in: sourceIds } },
        data: { branchId: target.id },
      })
      await tx.branch.updateMany({
        where: { id: { in: sourceIds } },
        data: { isActive: false },
      })
    }

    // Alias: nama/kode lama dari pemetaan dan dari cabang sumber.
    const aliasesAdded: string[] = []
    const aliasesSkipped: string[] = []
    const candidates = new Set([
      ...names,
      ...sources.flatMap((source) => [norm(source.code), norm(source.name)]),
    ])
    for (const alias of candidates) {
      if (alias === norm(entry.code) || takenAliases.has(alias)) continue
      const sameCodeActive = branches.find(
        (branch) =>
          norm(branch.code) === alias &&
          branch.isActive &&
          !sourceIds.includes(branch.id) &&
          branch.id !== target.id
      )
      if (sameCodeActive) {
        aliasesSkipped.push(
          `${alias} (kode cabang aktif ${sameCodeActive.code})`
        )
        continue
      }
      await tx.branchAlias.create({
        data: { alias, source: "ALFAMART_CODE", branchId: target.id },
      })
      takenAliases.add(alias)
      aliasesAdded.push(alias)
    }

    await tx.auditEvent.create({
      data: {
        action: "BRANCH_CODE_CONVERTED",
        entityType: "Branch",
        entityId: entry.code,
        metadata: {
          fromCodes: sources.map((source) => source.code),
          users,
          stores,
          aliasesAdded,
        },
      },
    })

    reports.push({
      code: entry.code,
      created,
      fromCodes: sources.map((source) => source.code),
      users,
      stores,
      aliasesAdded,
      aliasesSkipped,
    })
  }

  // Sub-area toko (mis. BALARAJA di KZ01) adalah pembagian wilayah di dalam
  // cabang, bukan cabang tersendiri: toko TIDAK dipindah berdasarkan sub-area
  // (dicek terhadap data CarbonTrack 2026-11-20).

  // Penggabungan: cabang resmi yang wilayahnya kini sub-area cabang lain.
  // Toko, user dan alias pindah ke induk; kode dan namanya jadi alias induk;
  // cabang dinonaktifkan (tidak dihapus).
  const merges: string[] = []
  for (const entry of mapping.filter((item) => item.mergedInto)) {
    const child = await tx.branch.findUnique({ where: { code: entry.code } })
    const parent = await tx.branch.findUnique({
      where: { code: entry.mergedInto! },
    })
    if (!child || !parent) continue
    const users = await tx.user.updateMany({
      where: { branchId: child.id },
      data: { branchId: parent.id },
    })
    const stores = await tx.store.updateMany({
      where: { branchId: child.id },
      data: { branchId: parent.id },
    })
    await tx.branchAlias.updateMany({
      where: { branchId: child.id },
      data: { branchId: parent.id },
    })
    for (const alias of [norm(child.code), norm(child.name)]) {
      if (takenAliases.has(alias)) continue
      await tx.branchAlias.create({
        data: { alias, source: "ALFAMART_MERGE", branchId: parent.id },
      })
      takenAliases.add(alias)
    }
    if (child.isActive) {
      await tx.branch.update({
        where: { id: child.id },
        data: { isActive: false },
      })
    }
    await tx.auditEvent.create({
      data: {
        action: "BRANCH_MERGED",
        entityType: "Branch",
        entityId: child.code,
        metadata: {
          into: parent.code,
          users: users.count,
          stores: stores.count,
        },
      },
    })
    merges.push(
      `${child.code} -> ${parent.code}: user ${users.count}, toko ${stores.count}`
    )
  }

  const leftovers = await tx.branch.findMany({
    where: { isActive: true, code: { notIn: [...targetCodes] } },
    select: {
      code: true,
      name: true,
      _count: { select: { users: true, stores: true } },
    },
    orderBy: { code: "asc" },
  })

  return { reports, merges, leftovers }
}

async function main() {
  console.log(
    `${apply ? "APPLY" : "DRY-RUN"} | DB ${isLocal ? "lokal" : "REMOTE"}`
  )

  const result = await prisma
    .$transaction(
      async (tx) => {
        const outcome = await convert(tx)
        // Dry-run: hitung semuanya di dalam transaksi lalu batalkan.
        if (!apply) throw { dryRun: outcome }
        return outcome
      },
      { timeout: 120_000 }
    )
    .catch((error: unknown) => {
      if (error && typeof error === "object" && "dryRun" in error) {
        return (error as { dryRun: Awaited<ReturnType<typeof convert>> }).dryRun
      }
      throw error
    })

  if (result.merges.length) {
    console.log(`Penggabungan:\n  ${result.merges.join("\n  ")}`)
  }
  for (const report of result.reports) {
    console.log(
      `${report.code}${report.created ? " (baru)" : ""}: dari [${report.fromCodes.join(", ") || "-"}], user ${report.users}, toko ${report.stores}, alias +[${report.aliasesAdded.join(", ")}]` +
        (report.aliasesSkipped.length
          ? `, alias dilewati [${report.aliasesSkipped.join("; ")}]`
          : "")
    )
  }
  console.log(
    `\nCabang aktif tanpa kode Alfamart (${result.leftovers.length}), perlu keputusan:`
  )
  for (const branch of result.leftovers) {
    console.log(
      `  ${branch.code} | ${branch.name} | user ${branch._count.users} | toko ${branch._count.stores}`
    )
  }
  console.log(
    apply ? "\nPerubahan DISIMPAN." : "\nDry-run: tidak ada yang disimpan."
  )
}

main()
  .catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
