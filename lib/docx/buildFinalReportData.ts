import type { PSIRReport } from '@/types/psir';
import { formatDateDisplay } from '@/lib/utils/date-formatters';

/**
 * Maps a report to the tags in templates/FINAL_REPORT.docx (probation Final
 * Report). Tags with no source field yet are emitted empty so the officer can
 * fill them in Word.
 */

function str(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export interface FinalReportOffice {
  name: string;
}

export function buildFinalReportData(report: PSIRReport, office?: FinalReportOffice | null): Record<string, string> {
  const id = report.identifyingData;
  const offense = report.criminalHistory.presentOffense;
  const analysis = report.analysisEvaluation;

  const fullNameCaps = [id.firstName, id.middleName, id.lastName]
    .map(str)
    .filter(Boolean)
    .join(' ')
    .toUpperCase();

  return {
    Office_Name: str(office?.name),
    Export_Date: formatDateDisplay(new Date()),

    // Caption
    Criminal_Case_No: str(id.criminalCaseNumber),
    Violation_For: str(offense?.chargedWith),
    Name_of_Petitioner_ALL_CAPS: fullNameCaps,

    // Identification block
    Offense_he_is_convicted: str(offense?.convictedOf),
    True_Name: str(id.trueName),
    Docket_Number: '', // supervision docket number: no field yet
    Nickname: str(id.alias),
    Judge: str(offense?.judge || id.letterJudge),
    Court: str(offense?.court || id.letterCourt),
    Address: str(id.presentAddress),
    in_words: '', // date of probation order in words: no field yet
    Civil_Status: str(id.civilStatus),
    Probation_Period: str(analysis.probationPeriod),
    Age: id.age ? String(id.age) : '',
    Sex: str(id.sex),

    // Signature
    Supervising_Officer: str(analysis.reviewedBy?.name || analysis.preparedBy?.name).toUpperCase(),
  };
}
