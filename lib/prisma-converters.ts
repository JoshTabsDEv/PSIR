import type { PSIRReport as PrismaPSIRReport, Prisma } from '@prisma/client';
import type { PSIRReport, PSIRFormData } from '@/types/psir';

/**
 * Convert Prisma's flat database model to nested frontend structure
 */
export function prismaToFrontend(prismaReport: PrismaPSIRReport): PSIRReport {
  return {
    _id: prismaReport.id.toString(),
    reportNumber: prismaReport.reportNumber,
    status: prismaReport.status as 'draft' | 'completed',
    createdAt: prismaReport.createdAt,
    updatedAt: prismaReport.updatedAt,
    lastModifiedBy: prismaReport.lastModifiedBy,

    // Section I: Identifying Data
    identifyingData: {
      lastName: prismaReport.lastName,
      firstName: prismaReport.firstName,
      middleName: prismaReport.middleName || '',
      alias: prismaReport.alias || '',
      sex: prismaReport.sex as 'Male' | 'Female',
      birthday: prismaReport.birthday,
      birthplace: prismaReport.birthplace || '',
      nationality: prismaReport.nationality,
      religion: prismaReport.religion || '',
      civilStatus: prismaReport.civilStatus || '',
      age: prismaReport.age,
      educationalAttainment: prismaReport.educationalAttainment || '',
      occupation: prismaReport.occupation || '',
      spouseName: prismaReport.spouseName || '',
      identifyingMarks: prismaReport.identifyingMarks || '',
      presentAddress: prismaReport.presentAddress || '',
      permanentAddress: prismaReport.permanentAddress || '',
    },

    // Section II: Criminal History
    criminalHistory: {
      presentOffense: {
        chargedWith: prismaReport.presentOffenseChargedWith || '',
        chargedDate: prismaReport.presentOffenseChargedDate,
        convictedOf: prismaReport.presentOffenseConvictedOf || '',
        convictedDate: prismaReport.presentOffenseConvictedDate,
        sentence: prismaReport.presentOffenseSentence || '',
        judge: prismaReport.presentOffenseJudge || '',
        court: prismaReport.presentOffenseCourt || '',
      },
      custodialStatus: mapCustodialStatusToFrontend(prismaReport.custodialStatus),
      rorCustodian: prismaReport.rorCustodian || '',
      address: prismaReport.address || '',
      priorRecords: {
        nbi: {
          criminalCaseNo: prismaReport.nbiCaseNo || '',
          offense: prismaReport.nbiOffense || '',
          dateCharged: prismaReport.nbiDateCharged,
          decisionStatus: prismaReport.nbiDecisionStatus || 'No record on file',
        },
        cmrd: {
          criminalCaseNo: prismaReport.cmrdCaseNo || '',
          offense: prismaReport.cmrdOffense || '',
          dateCharged: prismaReport.cmrdDateCharged,
          decisionStatus: prismaReport.cmrdDecisionStatus || 'No derogatory record',
        },
        others: {
          criminalCaseNo: prismaReport.othersCaseNo || '',
          offense: prismaReport.othersOffense || '',
          dateCharged: prismaReport.othersDateCharged,
          decisionStatus: prismaReport.othersDecisionStatus || 'None',
        },
      },
    },

    // Section III: Socio-Economic Background
    socioEconomicBackground: {
      familyEconomicStatus: mapEconomicStatusToFrontend(prismaReport.familyEconomicStatus),
      familyRelationship: mapSatisfactionToFrontend(prismaReport.familyRelationship),
      familyReputation: mapSatisfactionToFrontend(prismaReport.familyReputation),
      familySupport: mapSatisfactionToFrontend(prismaReport.familySupport),
      communityAcceptability: mapSatisfactionToFrontend(prismaReport.communityAcceptability),
      overallWellBeing: mapSatisfactionToFrontend(prismaReport.overallWellBeing),
    },

    // Section IV: Analysis and Evaluation
    analysisEvaluation: {
      circumstances: prismaReport.circumstances || '',
      needs: prismaReport.needs || '',
      attitude: prismaReport.attitude || '',
      recommendations: prismaReport.recommendations || '',
      communityServiceHours: prismaReport.communityServiceHours || undefined,
      communityServiceType: prismaReport.communityServiceType || undefined,
      preparedBy: {
        name: prismaReport.preparedByName || '',
        designation: prismaReport.preparedByDesignation || '',
        date: prismaReport.preparedByDate,
      },
      reviewedBy: {
        name: prismaReport.reviewedByName || '',
        designation: prismaReport.reviewedByDesignation || '',
        date: prismaReport.reviewedByDate,
      },
    },
  };
}

/**
 * Convert frontend nested structure to Prisma's flat database model
 */
export function frontendToPrisma(frontendReport: Partial<PSIRFormData>): Prisma.PSIRReportCreateInput {
  const id = frontendReport.identifyingData;
  const crim = frontendReport.criminalHistory;
  const socio = frontendReport.socioEconomicBackground;
  const analysis = frontendReport.analysisEvaluation;

  return {
    reportNumber: frontendReport.reportNumber || '',
    status: frontendReport.status || 'draft',
    lastModifiedBy: frontendReport.lastModifiedBy || '',

    // Section I: Identifying Data
    lastName: id?.lastName || '',
    firstName: id?.firstName || '',
    middleName: id?.middleName,
    alias: id?.alias,
    sex: id?.sex as 'Male' | 'Female' || 'Male',
    birthday: id?.birthday ? new Date(id.birthday) : new Date(),
    birthplace: id?.birthplace,
    nationality: id?.nationality || 'Filipino',
    religion: id?.religion,
    civilStatus: id?.civilStatus,
    age: id?.age || 0,
    educationalAttainment: id?.educationalAttainment,
    occupation: id?.occupation,
    spouseName: id?.spouseName,
    identifyingMarks: id?.identifyingMarks,
    presentAddress: id?.presentAddress,
    permanentAddress: id?.permanentAddress,

    // Section II: Criminal History - A. Present Offense
    presentOffenseChargedWith: crim?.presentOffense?.chargedWith,
    presentOffenseChargedDate: crim?.presentOffense?.chargedDate ? new Date(crim.presentOffense.chargedDate) : undefined,
    presentOffenseConvictedOf: crim?.presentOffense?.convictedOf,
    presentOffenseConvictedDate: crim?.presentOffense?.convictedDate ? new Date(crim.presentOffense.convictedDate) : undefined,
    presentOffenseSentence: crim?.presentOffense?.sentence,
    presentOffenseJudge: crim?.presentOffense?.judge,
    presentOffenseCourt: crim?.presentOffense?.court,
    custodialStatus: mapCustodialStatusToPrisma(crim?.custodialStatus),
    rorCustodian: crim?.rorCustodian,
    address: crim?.address,

    // Section II: Criminal History - B. Prior and Pending Records
    nbiCaseNo: crim?.priorRecords?.nbi?.criminalCaseNo,
    nbiOffense: crim?.priorRecords?.nbi?.offense,
    nbiDateCharged: crim?.priorRecords?.nbi?.dateCharged ? new Date(crim.priorRecords.nbi.dateCharged) : undefined,
    nbiDecisionStatus: crim?.priorRecords?.nbi?.decisionStatus || 'No record on file',
    cmrdCaseNo: crim?.priorRecords?.cmrd?.criminalCaseNo,
    cmrdOffense: crim?.priorRecords?.cmrd?.offense,
    cmrdDateCharged: crim?.priorRecords?.cmrd?.dateCharged ? new Date(crim.priorRecords.cmrd.dateCharged) : undefined,
    cmrdDecisionStatus: crim?.priorRecords?.cmrd?.decisionStatus || 'No derogatory record',
    othersCaseNo: crim?.priorRecords?.others?.criminalCaseNo,
    othersOffense: crim?.priorRecords?.others?.offense,
    othersDateCharged: crim?.priorRecords?.others?.dateCharged ? new Date(crim.priorRecords.others.dateCharged) : undefined,
    othersDecisionStatus: crim?.priorRecords?.others?.decisionStatus || 'None',

    // Section III: Socio-Economic Background
    familyEconomicStatus: mapEconomicStatusToPrisma(socio?.familyEconomicStatus),
    familyRelationship: mapSatisfactionToPrisma(socio?.familyRelationship),
    familyReputation: mapSatisfactionToPrisma(socio?.familyReputation),
    familySupport: mapSatisfactionToPrisma(socio?.familySupport),
    communityAcceptability: mapSatisfactionToPrisma(socio?.communityAcceptability),
    overallWellBeing: mapSatisfactionToPrisma(socio?.overallWellBeing),

    // Section IV: Analysis and Evaluation
    circumstances: analysis?.circumstances,
    needs: analysis?.needs,
    attitude: analysis?.attitude,
    recommendations: analysis?.recommendations,

    // Community Service Recommendation
    communityServiceHours: analysis?.communityServiceHours,
    communityServiceType: analysis?.communityServiceType,

    preparedByName: analysis?.preparedBy?.name,
    preparedByDesignation: analysis?.preparedBy?.designation,
    preparedByDate: analysis?.preparedBy?.date ? new Date(analysis.preparedBy.date) : undefined,

    reviewedByName: analysis?.reviewedBy?.name,
    reviewedByDesignation: analysis?.reviewedBy?.designation,
    reviewedByDate: analysis?.reviewedBy?.date ? new Date(analysis.reviewedBy.date) : undefined,
  };
}

// Enum mapping helpers
function mapCustodialStatusToFrontend(status: string): 'On Bail' | 'On Detention' | 'ROR' {
  const mapping: Record<string, 'On Bail' | 'On Detention' | 'ROR'> = {
    ON_BAIL: 'On Bail',
    ON_DETENTION: 'On Detention',
    ROR: 'ROR',
  };
  return mapping[status] || 'On Detention';
}

function mapCustodialStatusToPrisma(status?: string): 'ON_BAIL' | 'ON_DETENTION' | 'ROR' {
  const mapping: Record<string, 'ON_BAIL' | 'ON_DETENTION' | 'ROR'> = {
    'On Bail': 'ON_BAIL',
    'On Detention': 'ON_DETENTION',
    'ROR': 'ROR',
  };
  return mapping[status || 'On Detention'] || 'ON_DETENTION';
}

function mapEconomicStatusToFrontend(status: string): 'Poor' | 'Low-income Class (but not poor)' | 'Low middle-income class' | 'Middle middle-income Class' | 'Upper middle-income Class' | 'Upper-income Class (but not rich)' | 'Rich' {
  const mapping: Record<string, 'Poor' | 'Low-income Class (but not poor)' | 'Low middle-income class' | 'Middle middle-income Class' | 'Upper middle-income Class' | 'Upper-income Class (but not rich)' | 'Rich'> = {
    POOR: 'Poor',
    LOW_INCOME_NOT_POOR: 'Low-income Class (but not poor)',
    LOW_MIDDLE_INCOME: 'Low middle-income class',
    MIDDLE_MIDDLE_INCOME: 'Middle middle-income Class',
    UPPER_MIDDLE_INCOME: 'Upper middle-income Class',
    UPPER_INCOME_NOT_RICH: 'Upper-income Class (but not rich)',
    RICH: 'Rich',
  };
  return mapping[status] || 'Poor';
}

function mapEconomicStatusToPrisma(status?: string): any {
  const mapping: Record<string, string> = {
    'Poor': 'POOR',
    'Low-income Class (but not poor)': 'LOW_INCOME_NOT_POOR',
    'Low middle-income class': 'LOW_MIDDLE_INCOME',
    'Middle middle-income Class': 'MIDDLE_MIDDLE_INCOME',
    'Upper middle-income Class': 'UPPER_MIDDLE_INCOME',
    'Upper-income Class (but not rich)': 'UPPER_INCOME_NOT_RICH',
    'Rich': 'RICH',
  };
  return mapping[status || 'Poor'] || 'POOR';
}

function mapSatisfactionToFrontend(level: string): 'Very satisfactory' | 'Satisfactory' | 'Poor' {
  const mapping: Record<string, 'Very satisfactory' | 'Satisfactory' | 'Poor'> = {
    VERY_SATISFACTORY: 'Very satisfactory',
    SATISFACTORY: 'Satisfactory',
    POOR: 'Poor',
  };
  return mapping[level] || 'Satisfactory';
}

function mapSatisfactionToPrisma(level?: string): any {
  const mapping: Record<string, string> = {
    'Very satisfactory': 'VERY_SATISFACTORY',
    'Satisfactory': 'SATISFACTORY',
    'Poor': 'POOR',
  };
  return mapping[level || 'Satisfactory'] || 'SATISFACTORY';
}
