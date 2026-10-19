import type { PSIRReport } from '@/types/psir';
import { formatFullName } from '@/lib/utils/form-helpers';
import { formatDateDisplay } from '@/lib/utils/date-formatters';

/**
 * Maps a report to the tags in templates/CLIENT_PROFILE.xlsx (PPA Form 12,
 * "Clients Profile" sheet). Tags with no source field yet are emitted empty so
 * the printed form shows a blank line the officer can fill by hand.
 */

function str(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function date(value: unknown): string {
  if (!value) return '';
  try {
    return formatDateDisplay(value as Date | string);
  } catch {
    return '';
  }
}

export interface ClientProfileOffice {
  name: string;
}

export function buildClientProfileData(report: PSIRReport, office?: ClientProfileOffice | null): Record<string, string> {
  const id = report.identifyingData;
  const crim = report.criminalHistory;
  const offense = crim.presentOffense;
  const analysis = report.analysisEvaluation;

  const investigating = str(analysis.preparedBy?.name).toUpperCase();
  const supervising = str(analysis.reviewedBy?.name).toUpperCase() || investigating;

  return {
    // Header
    Office_Name: str(office?.name).toUpperCase(),

    // Numbers
    Report_Number: str(report.reportNumber),
    PS_Number: '',

    // Personal profile (left column)
    Full_Name: formatFullName(str(id.lastName), str(id.firstName), str(id.middleName)),
    Alias: str(id.alias),
    Identifying_Marks: str(id.identifyingMarks),
    Address: str(id.presentAddress),
    Birthday: date(id.birthday),
    Birthplace: str(id.birthplace),
    Age: id.age ? String(id.age) : '',
    Sex: str(id.sex),
    Civil_Status: str(id.civilStatus),
    Spouse_Name: str(id.spouseName),
    Dependents: '',
    Educational_Attainment: str(id.educationalAttainment),
    Occupation: str(id.occupation),
    Monthly_Income: '',
    Hobbies: '',
    Skills: '',
    Religion: str(id.religion),

    // Case details (right column)
    Criminal_Case_Number: str(id.criminalCaseNumber),
    Charged_With: str(offense?.chargedWith),
    Charged_Date: date(offense?.chargedDate),
    Convicted_Of: str(offense?.convictedOf),
    Convicted_Date: date(offense?.convictedDate),
    Sentence: str(offense?.sentence),
    Judge: str(offense?.judge || id.letterJudge),
    Court: str(offense?.court || id.letterCourt),
    Date_Received: date(id.dateReceived),
    Date_PSIR_Submitted: date(report.submittedToCourtDate),
    Custodial_Status: str(crim.custodialStatus),
    Date_Probation_Granted: '',
    Date_Probation_Order_Received: '',
    Probation_Period: str(analysis.probationPeriod),
    Date_Started: '',
    Date_FR_Submitted: '',
    Date_TO_RO: '',

    // Signatures
    Investigating_Officer: investigating,
    Supervising_Officer: supervising,
  };
}
