-- AlterTable
ALTER TABLE "Branch" ADD COLUMN     "address" TEXT,
ADD COLUMN     "areaId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchAlias" (
    "id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BranchAlias_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Area_code_key" ON "Area"("code");

-- CreateIndex
CREATE INDEX "Area_isActive_idx" ON "Area"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "BranchAlias_alias_key" ON "BranchAlias"("alias");

-- CreateIndex
CREATE INDEX "BranchAlias_branchId_idx" ON "BranchAlias"("branchId");

-- CreateIndex
CREATE INDEX "Branch_areaId_idx" ON "Branch"("areaId");

-- CreateIndex
CREATE INDEX "Branch_isActive_idx" ON "Branch"("isActive");

-- AddForeignKey
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchAlias" ADD CONSTRAINT "BranchAlias_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

