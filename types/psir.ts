// TypeScript interfaces for PSIR (Post-Sentence Investigation Report) system

export interface IdentifyingData {
  lastName: string;
  firstName: string;
  middleName: string;
  trueName: string;
  alias: string;
  sex: 'Male' | 'Female';
  birthday: Date | string;
  birthplace: string;
  nationality: string;
  religion: string;
  civilStatus: string;
  age: number;
  educationalAttainment: string;
  occupation: string;
  spouseName: string;
  identifyingMarks: string;
  presentAddress: string;
  permanentAddress: string;
  letterJudge: string;
  letterCourt: string;
  letterPosition: string;
  letterAddress: string;
  investigationDocketNumber: string;
  criminalCaseNumber: string;
}

export interface PresentOffense {
  chargedWith: string;
  chargedDate: Date | string | null;
  convictedOf: string;
  convictedDate: Date | string | null;
  sentence: string;
  judge: string;
  court: string;
}

export interface PriorRecord {
  criminalCaseNo: string;
  offense: string;
  dateCharged: Date | string | null;
  decisionStatus: string;
}

export interface PriorRecords {
  nbi: PriorRecord;
  cmrd: PriorRecord;
  others: PriorRecord;
}

export interface CriminalHistory {
  presentOffense: PresentOffense;
  custodialStatus: 'On Bail' | 'On Detention' | 'ROR';
  rorCustodian: string;
  address: string;
  priorRecords: PriorRecords;
}

export interface SocioEconomicBackground {
  familyEconomicStatus: 'Poor' | 'Low-income Class (but not poor)' | 'Low middle-income class' | 'Middle middle-income Class' | 'Upper middle-income Class' | 'Upper-income Class (but not rich)' | 'Rich';
  familyRelationship: 'Very satisfactory' | 'Satisfactory' | 'Poor';
  familyReputation: 'Very satisfactory' | 'Satisfactory' | 'Poor';
  familySupport: 'Very satisfactory' | 'Satisfactory' | 'Poor';
  communityAcceptability: 'Very satisfactory' | 'Satisfactory' | 'Poor';
  overallWellBeing: 'Very satisfactory' | 'Satisfactory' | 'Poor';
}

export interface SignatureBlock {
  name: string;
  designation: string;
  date: Date | string | null;
}

export interface AnalysisEvaluation {
  circumstances: string;
  needs: string;
  attitude: string;
  recommendations: string;
  probationPeriod?: string;
  communityServiceHours?: number;
  communityServiceType?: string;
  preparedBy?: SignatureBlock;
  reviewedBy?: SignatureBlock;
}

export interface PSIRReport {
  _id?: string;
  reportNumber: string;
  status: 'draft' | 'completed';
  createdAt: Date | string;
  updatedAt: Date | string;
  lastModifiedBy: string;
  identifyingData: IdentifyingData;
  criminalHistory: CriminalHistory;
  socioEconomicBackground: SocioEconomicBackground;
  analysisEvaluation: AnalysisEvaluation;
}

// Form input types (for React Hook Form)
export type PSIRFormData = Omit<PSIRReport, '_id' | 'createdAt' | 'updatedAt'>;

// API response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

// Search/filter types
export interface ReportFilters {
  search?: string;
  status?: 'draft' | 'completed' | 'all';
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'reportNumber';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Dashboard stats
export interface DashboardStats {
  totalReports: number;
  draftReports: number;
  completedReports: number;
  recentReports: PSIRReport[];
}
