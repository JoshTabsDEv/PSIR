import type { PSIRReport } from '@/types/psir';
import { formatDateDisplay } from '@/lib/utils/date-formatters';
import { bareCaseNumber } from '@/lib/reports/case-number';

/**
 * Maps a report to the tags in templates/RECORDS_CHECK.xlsx (PPA Form 13,
 * "Request for Records Check"). The RTC sheet carries the data; the MTCC,
 * City Pros, PNP, Brgy, NBI and Others sheets reference it by formula.
 */

function str(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

/** The form expects an explicit "n/a" rather than a blank for these. */
function orNa(value: unknown): string {
  return str(value) || 'n/a';
}

function date(value: unknown): string {
  if (!value) return '';
  try {
    return formatDateDisplay(value as Date | string);
  } catch {
    return '';
  }
}

export interface RecordsCheckOffice {
  name: string;
}

export function buildRecordsCheckData(report: PSIRReport, office?: RecordsCheckOffice | null): Record<string, string> {
  const id = report.identifyingData;
  const offense = report.criminalHistory.presentOffense;

  const fullNameCaps = [id.firstName, id.middleName, id.lastName].map(str).filter(Boolean).join(' ').toUpperCase();

  return {
    Office_Name: str(office?.name),
    Export_Date: formatDateDisplay(new Date()),

    Name_of_Petitioner: fullNameCaps,
    True_Name: str(id.trueName).toUpperCase() || fullNameCaps,
    Alias: orNa(id.alias),
    Sex: str(id.sex),
    Age: id.age ? String(id.age) : '',
    Civil_Status: orNa(id.civilStatus),
    Birthday: date(id.birthday),
    Birthplace: str(id.birthplace),
    Present_Address: str(id.presentAddress),
    Permanent_Address: str(id.permanentAddress) || str(id.presentAddress),
    Criminal_Case_Numbers: bareCaseNumber(id.criminalCaseNumber),
    Offenses: str(offense?.chargedWith || offense?.convictedOf),
    Court: str(offense?.court || id.letterCourt),
    Spouse_Name: orNa(id.spouseName),
    Father: orNa(id.father),
    Mother: orNa(id.mother),

    Investigating_Officer: str(report.analysisEvaluation.preparedBy?.name).toUpperCase(),
  };
}
