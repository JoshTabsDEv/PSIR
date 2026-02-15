import { format } from 'date-fns';

export function generateReportNumber(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-5);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PSIR-${year}-${timestamp}${random}`;
}

export function formatFullName(
  lastName: string,
  firstName: string,
  middleName?: string
): string {
  const parts = [lastName, firstName];
  if (middleName) {
    parts.push(middleName.charAt(0) + '.');
  }
  return parts.filter(Boolean).join(', ');
}

export function capitalizeWords(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return capitalizeWords(address.trim());
}

export function getStatusBadgeColor(status: 'draft' | 'completed'): string {
  return status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength) + '...';
}

export function formatDateForFilename(date: Date = new Date()): string {
  return format(date, 'yyyy-MM-dd');
}

export function generateExportFilename(
  reportNumber: string,
  extension: 'pdf' | 'docx'
): string {
  const date = formatDateForFilename();
  return `PSIR-${reportNumber}-${date}.${extension}`;
}

export const civilStatusOptions = [
  'Single',
  'Married',
  'Widowed',
  'Separated',
  'Divorced',
  'Annulled',
] as const;

export const educationalAttainmentOptions = [
  'No Formal Education',
  'Elementary Level',
  'Elementary Graduate',
  'High School Level',
  'High School Graduate',
  'Vocational',
  'College Level',
  'College Graduate',
  'Post Graduate',
] as const;

export const religionOptions = [
  'Roman Catholic',
  'Islam',
  'Iglesia ni Cristo',
  'Protestant',
  'Born Again Christian',
  'Evangelical',
  'Seventh Day Adventist',
  'Buddhist',
  'Jehovahs Witness',
  'Other',
] as const;

export const defaultFormValues = {
  reportNumber: '',
  status: 'draft' as const,
  lastModifiedBy: '',
  identifyingData: {
    lastName: '',
    firstName: '',
    middleName: '',
    alias: '',
    sex: 'Male' as const,
    birthday: new Date(),
    birthplace: '',
    nationality: 'Filipino',
    religion: '',
    civilStatus: '',
    age: 0,
    educationalAttainment: '',
    occupation: '',
    spouseName: '',
    identifyingMarks: '',
    presentAddress: '',
    permanentAddress: '',
  },
  criminalHistory: {
    presentOffense: {
      agency: '',
      caseNumber: '',
      offense: '',
      character: '',
      dateOfCrime: null,
      dateOfArrest: null,
    },
    previousConvictions: [],
    statusOfCase: 'On detention' as const,
    address: '',
  },
  socioEconomicBackground: {
    familyEconomicStatus: 'Poor' as const,
    familyRelationship: 'Satisfactory' as const,
    familyReputation: 'Satisfactory' as const,
    familySupport: 'Satisfactory' as const,
    communityAcceptability: 'Satisfactory' as const,
    overallWellBeing: 'Satisfactory' as const,
  },
  analysisEvaluation: {
    circumstances: '',
    needs: '',
    attitude: '',
    recommendations: '',
    communityServiceHours: undefined,
    communityServiceType: '',
    preparedBy: {
      name: '',
      designation: '',
      date: null,
    },
    reviewedBy: {
      name: '',
      designation: '',
      date: null,
    },
  },
};
