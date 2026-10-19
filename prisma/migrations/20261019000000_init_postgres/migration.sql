-- CreateTable
CREATE TABLE "psir_reports" (
    "id" SERIAL NOT NULL,
    "reportNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastModifiedBy" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "trueName" TEXT,
    "alias" TEXT,
    "sex" TEXT NOT NULL DEFAULT 'Male',
    "birthday" TIMESTAMP(3) NOT NULL,
    "birthplace" TEXT,
    "nationality" TEXT NOT NULL DEFAULT 'Filipino',
    "religion" TEXT,
    "civilStatus" TEXT,
    "age" INTEGER NOT NULL,
    "educationalAttainment" TEXT,
    "occupation" TEXT,
    "spouseName" TEXT,
    "identifyingMarks" TEXT,
    "presentAddress" TEXT,
    "permanentAddress" TEXT,
    "mother" TEXT,
    "father" TEXT,
    "genderPreference" TEXT,
    "dateOfOrder" TIMESTAMP(3),
    "dateReceived" TIMESTAMP(3),
    "letterJudge" TEXT,
    "letterCourt" TEXT,
    "letterPosition" TEXT,
    "letterAddress" TEXT,
    "investigationDocketNumber" TEXT,
    "criminalCaseNumber" TEXT,
    "presentOffenseChargedWith" TEXT,
    "presentOffenseChargedDate" TIMESTAMP(3),
    "presentOffenseConvictedOf" TEXT,
    "presentOffenseConvictedDate" TIMESTAMP(3),
    "presentOffenseSentence" TEXT,
    "presentOffenseJudge" TEXT,
    "presentOffenseCourt" TEXT,
    "custodialStatus" TEXT NOT NULL DEFAULT 'ON_DETENTION',
    "rorCustodian1" TEXT,
    "rorCustodianAddress1" TEXT,
    "rorCustodian2" TEXT,
    "rorCustodianAddress2" TEXT,
    "address" TEXT,
    "nbiCaseNo" TEXT,
    "nbiOffense" TEXT,
    "nbiDateCharged" TIMESTAMP(3),
    "nbiDecisionStatus" TEXT DEFAULT 'No record on file',
    "cmrdCaseNo" TEXT,
    "cmrdOffense" TEXT,
    "cmrdDateCharged" TIMESTAMP(3),
    "cmrdDecisionStatus" TEXT DEFAULT 'No derogatory record',
    "othersCaseNo" TEXT,
    "othersOffense" TEXT,
    "othersDateCharged" TIMESTAMP(3),
    "othersDecisionStatus" TEXT DEFAULT 'None',
    "familyEconomicStatus" TEXT NOT NULL DEFAULT 'POOR',
    "familyRelationship" TEXT NOT NULL DEFAULT 'SATISFACTORY',
    "familyReputation" TEXT NOT NULL DEFAULT 'SATISFACTORY',
    "familySupport" TEXT NOT NULL DEFAULT 'SATISFACTORY',
    "communityAcceptability" TEXT NOT NULL DEFAULT 'SATISFACTORY',
    "overallWellBeing" TEXT NOT NULL DEFAULT 'SATISFACTORY',
    "circumstances" TEXT,
    "needs" TEXT,
    "attitude" TEXT,
    "recommendations" TEXT,
    "probationPeriod" TEXT,
    "communityServiceHours" TEXT,
    "communityServiceType" TEXT,
    "preparedByName" TEXT,
    "preparedByDesignation" TEXT,
    "preparedByDate" TIMESTAMP(3),
    "reviewedByName" TEXT,
    "reviewedByDesignation" TEXT,
    "reviewedByDate" TIMESTAMP(3),
    "submittedToCourtDate" TIMESTAMP(3),

    CONSTRAINT "psir_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "psir_reports_reportNumber_key" ON "psir_reports"("reportNumber");

-- CreateIndex
CREATE INDEX "psir_reports_reportNumber_idx" ON "psir_reports"("reportNumber");

-- CreateIndex
CREATE INDEX "psir_reports_status_idx" ON "psir_reports"("status");

-- CreateIndex
CREATE INDEX "psir_reports_createdAt_idx" ON "psir_reports"("createdAt");

-- CreateIndex
CREATE INDEX "psir_reports_lastName_firstName_idx" ON "psir_reports"("lastName", "firstName");

