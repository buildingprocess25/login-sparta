-- AlterTable
ALTER TABLE "ModuleRole" ADD COLUMN     "isModuleAdmin" BOOLEAN NOT NULL DEFAULT false;

-- Role yang menjadikan user admin modul (keputusan user 2026-11-20): boleh
-- membuka Manajemen User khusus modulnya dan melihat Data Master (baca saja).
-- Modul tanpa katalog role (Building, SIAGA) atau tanpa role admin di katalog
-- (CarbonTrack) belum punya admin modul sampai katalognya diisi.
UPDATE "ModuleRole" SET "isModuleAdmin" = true
WHERE ("moduleId", "code") IN (
  ('ENERGY'::"SpartaModuleId", 'ADMIN'),
  ('MAINTENANCE'::"SpartaModuleId", 'ADMIN'),
  ('ENGINEERING'::"SpartaModuleId", 'ADMIN_HO'),
  ('ENGINEERING'::"SpartaModuleId", 'SUPER_ADMIN')
);

-- Akun admin portal pertama (keputusan user 2026-11-20): SYSTEM_ADMIN tanpa
-- akses modul. Password sementara diberikan ke user di luar repo dan WAJIB
-- diganti saat login pertama (RESET_REQUIRED). Dilewati bila email sudah ada
-- atau cabang HEAD belum ada, agar migrasi tidak pernah gagal.
INSERT INTO "User" ("id", "email", "employeeId", "fullName", "branchId",
                    "passwordHash", "passwordState", "role", "status",
                    "updatedAt", "validBranchNames")
SELECT gen_random_uuid()::text, 'admin.portal@sat.co.id', NULL,
       'Admin Portal SPARTA', b."id",
       '$argon2id$v=19$m=19456,t=2,p=1$eUjabmaJmAbbfzy4Eoj4dQ$VSbgcHpjMQ82nvg+5V2e1hxIJbyZzS0npAy0KbgUjso',
       'RESET_REQUIRED', 'SYSTEM_ADMIN', 'ACTIVE', CURRENT_TIMESTAMP,
       ARRAY['HEAD OFFICE']
FROM "Branch" b
WHERE b."code" = 'HEAD'
ON CONFLICT ("email") DO NOTHING;
