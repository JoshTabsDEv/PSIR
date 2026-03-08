import type { PSIRReport } from '@/types/psir';
import { formatFullName } from '@/lib/utils/form-helpers';
import { formatDateShort } from '@/lib/utils/date-formatters';

export interface TEVRow {
  Docket_No: string;
  Petitioner_Name: string;
  Address: string;
  Date_Ordered: string;
  Date_Received: string;
  Report_Type: string;
  Date_Submitted: string;
}

export interface TEVTemplateData {
  Officer_Name: string;
  Office_Name: string;
  Verified_By_Name: string;
  Certified_By_Name: string;
  Verified_By_Title: string;
  Certified_By_Title: string;
  rows: TEVRow[];
}

/**
 * Builds template data for the TEV (Investigation Tracking) DOCX export.
 *
 * Maps an array of PSIR reports into a flat structure suitable for
 * docxtemplater rendering, including officer/office metadata and
 * a rows array for the table loop.
 */
export function buildTEVData(
  reports: PSIRReport[],
  options: {
    officerName: string;
    officeName: string;
    verifiedByName: string;
    certifiedByName: string;
    verifiedByTitle: string;
    certifiedByTitle: string;
  }
): TEVTemplateData {
  return {
    Officer_Name: options.officerName,
    Office_Name: options.officeName,
    Verified_By_Name: options.verifiedByName,
    Certified_By_Name: options.certifiedByName,
    Verified_By_Title: options.verifiedByTitle,
    Certified_By_Title: options.certifiedByTitle,
    rows: reports.map((report) => ({
      Docket_No:
        report.reportNumber ||
        '',
      Petitioner_Name: formatFullName(
        report.identifyingData.lastName,
        report.identifyingData.firstName,
        report.identifyingData.middleName
      ),
      Address:
        report.identifyingData.presentAddress ||
        report.identifyingData.permanentAddress ||
        '',
      Date_Ordered:
        formatDateShort(report.criminalHistory.presentOffense?.convictedDate) ||
        '',
      Date_Received:
        formatDateShort(
          report.identifyingData.dateReceived ?? report.createdAt
        ) || '',
      Report_Type: 'PSIR',
      Date_Submitted:
        formatDateShort(report.submittedToCourtDate ?? report.analysisEvaluation?.preparedBy?.date) || '',
    })),
  };
}
