import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { PrismaClient, PasswordState, UserStatus, SpartaModuleId } from "@prisma/client";
import { loadEnv } from "../src/config/env.ts";

loadEnv(); // This loads .env files so prisma can find DATABASE_URL
const prisma = new PrismaClient();

const CSV_FILE_PATH = path.resolve(
  process.cwd(),
  "../../maintenance-users-export.csv"
);

type CsvRow = {
  email: string;
  fullName: string;
  employeeId: string;
  branchCode: string;
  branchName: string;
  role: string;
};

async function main() {
  console.log(`Reading CSV from ${CSV_FILE_PATH}`);

  const rows: CsvRow[] = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_FILE_PATH)
      .pipe(csvParser())
      .on("data", (data) => rows.push(data))
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`Found ${rows.length} rows. Starting import...`);

  // We need to resolve branches first.
  const allBranches = await prisma.branch.findMany();
  const branchMapByName = new Map(allBranches.map((b) => [b.name.toUpperCase(), b.id]));

  let insertedCount = 0;
  let skippedCount = 0;

  for (const row of rows) {
    if (!row.email) {
      skippedCount++;
      continue;
    }

    let branchNameUpper = (row.branchName || "").trim().toUpperCase();
    let branchCode = (row.branchCode || "").trim();

    if (!branchNameUpper) {
      branchNameUpper = "HEAD OFFICE";
      branchCode = "HEAD";
    }

    let branchId = branchMapByName.get(branchNameUpper);

    // If branch doesn't exist, we can either skip or create a dummy one.
    // Assuming SPARTA portal creates branches on the fly if needed, let's upsert branch.
    if (!branchId && branchNameUpper) {
      const branch = await prisma.branch.upsert({
        where: { code: branchCode || branchNameUpper.replace(/\s+/g, "_") },
        update: { name: branchNameUpper },
        create: {
          code: branchCode || branchNameUpper.replace(/\s+/g, "_"),
          name: branchNameUpper,
        },
      });
      branchId = branch.id;
      branchMapByName.set(branchNameUpper, branchId);
    }

    if (!branchId) {
      console.warn(`[WARN] Skipping ${row.email} due to missing branch`);
      skippedCount++;
      continue;
    }

    // Upsert User
    const user = await prisma.user.upsert({
      where: { email: row.email },
      update: {
        fullName: row.fullName || row.email,
        employeeId: row.employeeId || null,
        branchId,
      },
      create: {
        email: row.email,
        fullName: row.fullName || row.email,
        employeeId: row.employeeId || null,
        branchId,
        role: "USER", // Default role in SSO Portal
        passwordState: PasswordState.BRANCH_DEFAULT,
        status: UserStatus.ACTIVE,
      },
    });

    // Give access to MAINTENANCE module
    await prisma.userModuleAccess.upsert({
      where: {
        userId_moduleId: {
          userId: user.id,
          moduleId: SpartaModuleId.MAINTENANCE,
        },
      },
      update: {
        role: "USER", // We only care about authorization within Maintenance app itself
        isActive: true,
      },
      create: {
        userId: user.id,
        moduleId: SpartaModuleId.MAINTENANCE,
        role: "USER",
        isActive: true,
      },
    });

    insertedCount++;
  }

  console.log(`Import completed.`);
  console.log(`Inserted/Updated: ${insertedCount}`);
  console.log(`Skipped: ${skippedCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
