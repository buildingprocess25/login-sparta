-- AlterEnum (ensure ENGINEERING is recognized and preserved across fresh and existing DBs)
ALTER TYPE "SpartaModuleId" ADD VALUE IF NOT EXISTS 'ENGINEERING';

-- AlterTable (ensure validBranchNames column exists across fresh and existing DBs)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "validBranchNames" TEXT[] DEFAULT ARRAY[]::TEXT[];
