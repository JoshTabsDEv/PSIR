import { z } from 'zod';

// Section I: Identifying Data
export const identifyingDataSchema = z.object({
  lastName: z.string().min(1, 'Last name is required'),
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().default(''),
  trueName: z.string().min(1, 'True name is required'),
  alias: z.string().default(''),
  sex: z.enum(['Male', 'Female']),
  birthday: z.coerce.date(),
  birthplace: z.string().default(''),
  nationality: z.string().default('Filipino'),
  religion: z.string().default(''),
  civilStatus: z.string().default(''),
  age: z.number().min(0, 'Age must be positive').max(150, 'Invalid age'),
  educationalAttainment: z.string().default(''),
  occupation: z.string().default(''),
  spouseName: z.string().default(''),
  identifyingMarks: z.string().default(''),
  presentAddress: z.string().min(1, 'Present address is required'),
  permanentAddress: z.string().min(1, 'Permanent address is required'),
  letterJudge: z.string().min(1, 'Judge name is required'),
  letterCourt: z.string().min(1, 'Court name is required'),
  letterPosition: z.string().min(1, 'Position is required'),
  letterAddress: z.string().min(1, 'Address is required'),
  investigationDocketNumber: z.string().min(1, 'Docket number is required'),
  criminalCaseNumber: z.string().min(1, 'Case number is required'),
  mother: z.string().optional(),
  father: z.string().optional(),
  genderPreference: z.string().optional(),
  dateOfOrder: z.coerce.date().optional() ,
  dateReceived: z.coerce.date().optional(),
});

// Section II: Criminal History
export const presentOffenseSchema = z.object({
  chargedWith: z.string().min(1, 'Charged with is required'),
  chargedDate: z.coerce.date().nullable().optional(),
  convictedOf: z.string().min(1, 'Convicted of is required'),
  convictedDate: z.coerce.date().nullable().optional(),
  sentence: z.string().min(1, 'Sentence is required'),
  judge: z.string().default(''),
  court: z.string().default(''),
});

export const priorRecordSchema = z.object({
  criminalCaseNo: z.string().default(''),
  offense: z.string().default(''),
  dateCharged: z.coerce.date().nullable().optional(),
  decisionStatus: z.string().default(''),
});

export const priorRecordsSchema = z.object({
  nbi: priorRecordSchema.default({ criminalCaseNo: '', offense: '', dateCharged: null, decisionStatus: 'No record on file' }),
  cmrd: priorRecordSchema.default({ criminalCaseNo: '', offense: '', dateCharged: null, decisionStatus: 'No derogatory record' }),
  others: priorRecordSchema.default({ criminalCaseNo: '', offense: '', dateCharged: null, decisionStatus: 'None' }),
});

export const criminalHistorySchema = z.object({
  presentOffense: presentOffenseSchema.default({
    chargedWith: '',
    chargedDate: null,
    convictedOf: '',
    convictedDate: null,
    sentence: '',
    judge: '',
    court: '',
  }),
  custodialStatus: z.enum(['On Bail', 'On Detention', 'ROR']).default('On Detention'),
  rorCustodian1: z.string().default(''),
  rorCustodianAddress1: z.string().default(''),
  rorCustodian2: z.string().default(''),
  rorCustodianAddress2: z.string().default(''),
  address: z.string().default(''),
  priorRecords: priorRecordsSchema.default({
    nbi: { criminalCaseNo: '', offense: '', dateCharged: null, decisionStatus: 'No record on file' },
    cmrd: { criminalCaseNo: '', offense: '', dateCharged: null, decisionStatus: 'No derogatory record' },
    others: { criminalCaseNo: '', offense: '', dateCharged: null, decisionStatus: 'None' },
  }),
});

// Section III: Socio-Economic Background
export const socioEconomicBackgroundSchema = z.object({
  familyEconomicStatus: z.enum([
    'Poor',
    'Low-income Class (but not poor)',
    'Low middle-income class',
    'Middle middle-income Class',
    'Upper middle-income Class',
    'Upper-income Class (but not rich)',
    'Rich',
  ]).default('Poor'),
  familyRelationship: z.enum(['Very satisfactory', 'Satisfactory', 'Poor']).default('Satisfactory'),
  familyReputation: z.enum(['Very satisfactory', 'Satisfactory', 'Poor']).default('Satisfactory'),
  familySupport: z.enum(['Very satisfactory', 'Satisfactory', 'Poor']).default('Satisfactory'),
  communityAcceptability: z.enum(['Very satisfactory', 'Satisfactory', 'Poor']).default('Satisfactory'),
  overallWellBeing: z.enum(['Very satisfactory', 'Satisfactory', 'Poor']).default('Satisfactory'),
});

// Section IV: Analysis and Evaluation
export const signatureBlockSchema = z.object({
  name: z.string().default(''),
  designation: z.string().default(''),
  date: z.coerce.date().nullable().optional(),
});

export const analysisEvaluationSchema = z.object({
  circumstances: z.string().default(''),
  needs: z.string().default(''),
  attitude: z.string().default(''),
  recommendations: z.string().default(''),
  probationPeriod: z.string().optional(),
  communityServiceHours: z.string().default(''),
  communityServiceType: z.string().default(''),
  preparedBy: signatureBlockSchema.default({ name: '', designation: '', date: null }),
  reviewedBy: signatureBlockSchema.default({ name: '', designation: '', date: null }),
});

// Complete PSIR Form Schema
export const psirFormSchema = z.object({
  reportNumber: z.string().min(1, 'Report number is required'),
  status: z.enum(['draft', 'completed']).default('draft'),
  lastModifiedBy: z.string().default(''),
  identifyingData: identifyingDataSchema,
  criminalHistory: criminalHistorySchema.default({
    presentOffense: {
      chargedWith: '',
      chargedDate: null,
      convictedOf: '',
      convictedDate: null,
      sentence: '',
      judge: '',
      court: '',
    },
    custodialStatus: 'On Detention',
    rorCustodian1: '',
    rorCustodianAddress1: '',
    rorCustodian2: '',
    rorCustodianAddress2: '',
    address: '',
    priorRecords: {
      nbi: { criminalCaseNo: '', offense: '', dateCharged: null, decisionStatus: 'No record on file' },
      cmrd: { criminalCaseNo: '', offense: '', dateCharged: null, decisionStatus: 'No derogatory record' },
      others: { criminalCaseNo: '', offense: '', dateCharged: null, decisionStatus: 'None' },
    },
  }),
  socioEconomicBackground: socioEconomicBackgroundSchema.default({
    familyEconomicStatus: 'Poor',
    familyRelationship: 'Satisfactory',
    familyReputation: 'Satisfactory',
    familySupport: 'Satisfactory',
    communityAcceptability: 'Satisfactory',
    overallWellBeing: 'Satisfactory',
  }),
  analysisEvaluation: analysisEvaluationSchema.default({
    circumstances: '',
    needs: '',
    attitude: '',
    recommendations: '',
    communityServiceHours: '',
    communityServiceType: '',
    preparedBy: { name: '', designation: '', date: null },
    reviewedBy: { name: '', designation: '', date: null },
  }),
});

// Types inferred from schemas
export type IdentifyingDataForm = z.infer<typeof identifyingDataSchema>;
export type CriminalHistoryForm = z.infer<typeof criminalHistorySchema>;
export type SocioEconomicBackgroundForm = z.infer<typeof socioEconomicBackgroundSchema>;
export type AnalysisEvaluationForm = z.infer<typeof analysisEvaluationSchema>;
export type PSIRFormInput = z.infer<typeof psirFormSchema>;

// Partial schemas for section-by-section validation
export const sectionSchemas = {
  identifyingData: identifyingDataSchema,
  criminalHistory: criminalHistorySchema,
  socioEconomicBackground: socioEconomicBackgroundSchema,
  analysisEvaluation: analysisEvaluationSchema,
};
