-- CreateEnum
CREATE TYPE "ProvisioningStatus" AS ENUM ('PENDING', 'DELIVERED', 'FAILED', 'SKIPPED');

-- AlterTable
ALTER TABLE "AppModule" ADD COLUMN     "provisioningUrl" TEXT;

-- CreateTable
CREATE TABLE "ModuleRole" (
    "id" TEXT NOT NULL,
    "moduleId" "SpartaModuleId" NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProvisioningEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "moduleId" "SpartaModuleId" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "ProvisioningStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastError" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProvisioningEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ModuleRole_moduleId_isActive_idx" ON "ModuleRole"("moduleId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleRole_moduleId_code_key" ON "ModuleRole"("moduleId", "code");

-- CreateIndex
CREATE INDEX "ProvisioningEvent_status_nextAttemptAt_idx" ON "ProvisioningEvent"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "ProvisioningEvent_userId_createdAt_idx" ON "ProvisioningEvent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ProvisioningEvent_moduleId_status_idx" ON "ProvisioningEvent"("moduleId", "status");

-- AddForeignKey
ALTER TABLE "ModuleRole" ADD CONSTRAINT "ModuleRole_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "AppModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProvisioningEvent" ADD CONSTRAINT "ProvisioningEvent_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "AppModule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Seed katalog role awal. Hanya role yang terlihat langsung di skema modul.
-- Building dan SIAGA sengaja belum diisi: role mereka belum dikonfirmasi.
-- Selama katalog satu modul masih kosong, portal tidak memvalidasi role modul itu.
INSERT INTO "ModuleRole" ("id", "moduleId", "code", "label", "sortOrder", "updatedAt")
SELECT v.id, v.module::"SpartaModuleId", v.code, v.label, v.sort, CURRENT_TIMESTAMP
FROM (VALUES
  ('mr_energy_user', 'ENERGY', 'USER', 'User toko', 1),
  ('mr_energy_auditor', 'ENERGY', 'AUDITOR', 'Auditor', 2),
  ('mr_energy_gs', 'ENERGY', 'GS', 'GS', 3),
  ('mr_energy_area', 'ENERGY', 'AREA', 'Area', 4),
  ('mr_energy_admin', 'ENERGY', 'ADMIN', 'Admin', 5),
  ('mr_maintenance_bms', 'MAINTENANCE', 'BMS', 'BMS', 1),
  ('mr_maintenance_bmc', 'MAINTENANCE', 'BMC', 'BMC', 2),
  ('mr_maintenance_bnm_manager', 'MAINTENANCE', 'BNM_MANAGER', 'BnM Manager', 3),
  ('mr_maintenance_branch_admin', 'MAINTENANCE', 'BRANCH_ADMIN', 'Admin cabang', 4),
  ('mr_maintenance_admin', 'MAINTENANCE', 'ADMIN', 'Admin', 5),
  ('mr_engineering_es', 'ENGINEERING', 'ES', 'ES', 1),
  ('mr_engineering_coord', 'ENGINEERING', 'COORD', 'Koordinator', 2),
  ('mr_engineering_manager', 'ENGINEERING', 'MANAGER', 'Manager', 3),
  ('mr_engineering_requester', 'ENGINEERING', 'REQUESTER', 'Requester', 4),
  ('mr_engineering_admin_ho', 'ENGINEERING', 'ADMIN_HO', 'Admin HO', 5),
  ('mr_engineering_super_admin', 'ENGINEERING', 'SUPER_ADMIN', 'Super admin', 6),
  ('mr_carbontrack_user', 'CARBONTRACK', 'USER', 'User', 1)
) AS v(id, module, code, label, sort)
WHERE EXISTS (SELECT 1 FROM "AppModule" m WHERE m."id" = v.module::"SpartaModuleId")
ON CONFLICT ("moduleId", "code") DO NOTHING;
