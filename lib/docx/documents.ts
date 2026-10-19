/**
 * Documents that can be generated from a single report.
 * Add a new entry here (plus its API route) and it appears in the
 * "Export" menu on the report page automatically.
 */
export interface ReportDocument {
  /** Stable id, also used as React key */
  key: string;
  /** Menu label */
  label: string;
  /** One-line hint shown under the label */
  description: string;
  /** Builds the download URL for a report id */
  href: (reportId: string) => string;
}

export const REPORT_DOCUMENTS: ReportDocument[] = [
  {
    key: 'psir',
    label: 'PSIR Report',
    description: 'Post-Sentence Investigation Report (DOCX)',
    href: (reportId) => `/api/reports/${reportId}/export/docx`,
  },
  {
    key: 'client-profile',
    label: 'Client’s Profile (CP)',
    description: 'PPA Form 12, first report in person (XLSX)',
    href: (reportId) => `/api/reports/${reportId}/export/client-profile`,
  },
];
