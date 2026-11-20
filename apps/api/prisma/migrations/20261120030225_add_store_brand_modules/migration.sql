-- CreateTable
CREATE TABLE "StoreBrand" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "moduleIds" "SpartaModuleId"[] DEFAULT ARRAY[]::"SpartaModuleId"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreBrand_pkey" PRIMARY KEY ("code")
);

-- Aturan awal: toko ALFAMART untuk semua modul, toko LAWSON hanya untuk
-- Maintenance (keputusan user 2026-11-20). Bisa diubah dari Data Master.
INSERT INTO "StoreBrand" ("code", "name", "moduleIds", "updatedAt") VALUES
  ('ALFAMART', 'Alfamart', ARRAY['BUILDING', 'MAINTENANCE', 'ENERGY', 'SIAGA', 'CARBONTRACK', 'ENGINEERING']::"SpartaModuleId"[], CURRENT_TIMESTAMP),
  ('LAWSON', 'Lawson', ARRAY['MAINTENANCE']::"SpartaModuleId"[], CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO NOTHING;
