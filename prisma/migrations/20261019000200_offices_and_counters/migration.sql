-- DropIndex
DROP INDEX "psir_reports_reportNumber_key";

-- DropIndex
DROP INDEX "psir_reports_reportNumber_idx";

-- DropIndex
DROP INDEX "psir_reports_status_idx";

-- DropIndex
DROP INDEX "psir_reports_createdAt_idx";

-- AlterTable
ALTER TABLE "psir_reports" ADD COLUMN     "officeId" INTEGER NOT NULL,
ADD COLUMN     "preparedById" INTEGER,
ADD COLUMN     "reviewedById" INTEGER;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "officeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "offices" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" TEXT,
    "address" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_counters" (
    "officeId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "lastNumber" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "report_counters_pkey" PRIMARY KEY ("officeId","year")
);

-- CreateIndex
CREATE UNIQUE INDEX "offices_code_key" ON "offices"("code");

-- CreateIndex
CREATE INDEX "psir_reports_officeId_status_idx" ON "psir_reports"("officeId", "status");

-- CreateIndex
CREATE INDEX "psir_reports_officeId_createdAt_idx" ON "psir_reports"("officeId", "createdAt");

-- CreateIndex
CREATE INDEX "psir_reports_preparedById_idx" ON "psir_reports"("preparedById");

-- CreateIndex
CREATE UNIQUE INDEX "psir_reports_officeId_reportNumber_key" ON "psir_reports"("officeId", "reportNumber");

-- CreateIndex
CREATE INDEX "users_officeId_idx" ON "users"("officeId");

-- AddForeignKey
ALTER TABLE "psir_reports" ADD CONSTRAINT "psir_reports_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "offices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psir_reports" ADD CONSTRAINT "psir_reports_preparedById_fkey" FOREIGN KEY ("preparedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "psir_reports" ADD CONSTRAINT "psir_reports_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "offices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_counters" ADD CONSTRAINT "report_counters_officeId_fkey" FOREIGN KEY ("officeId") REFERENCES "offices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

