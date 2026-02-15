import type { PSIRReport, PreviousConviction } from '@/types/psir';
import { formatDateDisplay, formatDateShort } from '@/lib/utils/date-formatters';
import { formatFullName } from '@/lib/utils/form-helpers';

/** Checkbox symbols for template */
const CHECKED = '\u2611'; // ☑
const UNCHECKED = '\u2610'; // ☐

/** Safe string getter - returns empty string for null/undefined */
function str(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

/** Safe number getter - returns empty string for null/undefined/0 */
function num(value: unknown, allowZero = false): string {
  if (value === null || value === undefined) return '';
  if (!allowZero && value === 0) return '';
  return String(value);
}

/** Format date safely */
function date(value: unknown, format: 'display' | 'short' = 'display'): string {
  if (!value) return '';
  try {
    return format === 'display'
      ? formatDateDisplay(value as Date | string)
      : formatDateShort(value as Date | string);
  } catch {
    return '';
  }
}

/** Checkbox helper - returns checked/unchecked symbol */
function checkbox(condition: boolean): string {
  return condition ? CHECKED : UNCHECKED;
}

/**
 * Maps PSIRReport fields to flat template tags.
 *
 * Template placeholders should use {Tag_Name} format.
 * Example: {Last_Name}, {First_Name}, {Criminal_Case_Nos}
 *
 * @param report - The PSIR report from MongoDB
 * @returns Flat object matching template placeholders
 */
export function buildTemplateData(report: PSIRReport): Record<string, unknown> {
  const id = report.identifyingData;
  const crim = report.criminalHistory;
  const socio = report.socioEconomicBackground;
  const analysis = report.analysisEvaluation;

  return {
    // ===== Report Metadata =====
    Report_Number: str(report.reportNumber),
    Status: str(report.status),
    Created_Date: date(report.createdAt),
    Updated_Date: date(report.updatedAt),

    // ===== Section I: Identifying Data =====
    Last_Name: str(id.lastName),
    First_Name: str(id.firstName),
    Middle_Name: str(id.middleName),
    Full_Name: formatFullName(str(id.lastName), str(id.firstName), str(id.middleName)),
    Alias: str(id.alias),

    // Sex checkboxes
    Sex: str(id.sex),
    Sex_Male: checkbox(id.sex === 'Male'),
    Sex_Female: checkbox(id.sex === 'Female'),

    Birthday: date(id.birthday),
    Birthday_Short: date(id.birthday, 'short'),
    Birthplace: str(id.birthplace),
    Nationality: str(id.nationality),
    Religion: str(id.religion),
    Civil_Status: str(id.civilStatus),
    Age: num(id.age, true),
    Educational_Attainment: str(id.educationalAttainment),
    Occupation: str(id.occupation),

    // Spouse
    Spouse_Name: str(id.spouseName),

    Identifying_Marks: str(id.identifyingMarks),
    Present_Address: str(id.presentAddress),
    Permanent_Address: str(id.permanentAddress),

    // ===== Section II: Criminal History =====
    // Present Offense
    Agency: str(crim.presentOffense?.agency),
    Case_Number: str(crim.presentOffense?.caseNumber),
    Criminal_Case_Nos: str(crim.presentOffense?.caseNumber), // Alias
    Offense: str(crim.presentOffense?.offense),
    Offense_Character: str(crim.presentOffense?.character),
    Date_Of_Crime: date(crim.presentOffense?.dateOfCrime),
    Date_Of_Arrest: date(crim.presentOffense?.dateOfArrest),

    // Status checkboxes
    Status_Of_Case: str(crim.statusOfCase),
    Status_On_Trial: checkbox(crim.statusOfCase === 'On trial'),
    Status_On_Detention: checkbox(crim.statusOfCase === 'On detention'),

    Address_At_Arrest: str(crim.address),

    // Previous Convictions - as array for loops
    Previous_Convictions: formatPreviousConvictions(crim.previousConvictions || []),
    Has_Previous_Convictions: checkbox((crim.previousConvictions?.length || 0) > 0),
    No_Previous_Convictions: checkbox((crim.previousConvictions?.length || 0) === 0),
    Previous_Convictions_Count: num(crim.previousConvictions?.length),

    // ===== Section III: Socio-Economic Background =====
    // Family Economic Status
    Family_Economic_Status: str(socio.familyEconomicStatus),
    Status_Poor: checkbox(socio.familyEconomicStatus === 'Poor'),
    Status_Low_Income: checkbox(socio.familyEconomicStatus === 'Low-income Class (but not poor)'),
    Status_Low_Middle: checkbox(socio.familyEconomicStatus === 'Low middle-income class'),
    Status_Middle_Middle: checkbox(socio.familyEconomicStatus === 'Middle middle-income Class'),
    Status_Upper_Middle: checkbox(socio.familyEconomicStatus === 'Upper middle-income Class'),
    Status_Upper_Income: checkbox(socio.familyEconomicStatus === 'Upper-income Class (but not rich)'),
    Status_Rich: checkbox(socio.familyEconomicStatus === 'Rich'),

    // Family Relationship
    Family_Relationship: str(socio.familyRelationship),
    Relationship_Very_Satisfactory: checkbox(socio.familyRelationship === 'Very satisfactory'),
    Relationship_Satisfactory: checkbox(socio.familyRelationship === 'Satisfactory'),
    Relationship_Poor: checkbox(socio.familyRelationship === 'Poor'),

    // Family Reputation
    Family_Reputation: str(socio.familyReputation),
    Reputation_Very_Satisfactory: checkbox(socio.familyReputation === 'Very satisfactory'),
    Reputation_Satisfactory: checkbox(socio.familyReputation === 'Satisfactory'),
    Reputation_Poor: checkbox(socio.familyReputation === 'Poor'),

    // Family Support
    Family_Support: str(socio.familySupport),
    Support_Very_Satisfactory: checkbox(socio.familySupport === 'Very satisfactory'),
    Support_Satisfactory: checkbox(socio.familySupport === 'Satisfactory'),
    Support_Poor: checkbox(socio.familySupport === 'Poor'),

    // Community Acceptability
    Community_Acceptability: str(socio.communityAcceptability),
    Community_Very_Satisfactory: checkbox(socio.communityAcceptability === 'Very satisfactory'),
    Community_Satisfactory: checkbox(socio.communityAcceptability === 'Satisfactory'),
    Community_Poor: checkbox(socio.communityAcceptability === 'Poor'),

    // Overall Well-Being
    Overall_Well_Being: str(socio.overallWellBeing),
    WellBeing_Very_Satisfactory: checkbox(socio.overallWellBeing === 'Very satisfactory'),
    WellBeing_Satisfactory: checkbox(socio.overallWellBeing === 'Satisfactory'),
    WellBeing_Poor: checkbox(socio.overallWellBeing === 'Poor'),

    // ===== Section IV: Analysis and Evaluation =====
    Circumstances: str(analysis.circumstances),
    Needs: str(analysis.needs),
    Attitude: str(analysis.attitude),
    Recommendations: str(analysis.recommendations),

    // Prepared By
    Prepared_By_Name: str(analysis.preparedBy?.name),
    Prepared_By_Designation: str(analysis.preparedBy?.designation),
    Prepared_By_Date: date(analysis.preparedBy?.date),

    // Reviewed By
    Reviewed_By_Name: str(analysis.reviewedBy?.name),
    Reviewed_By_Designation: str(analysis.reviewedBy?.designation),
    Reviewed_By_Date: date(analysis.reviewedBy?.date),
  };
}

/**
 * Format previous convictions for template loops.
 * Use in template as: {#Previous_Convictions}{Offense} - {Case_Number}{/Previous_Convictions}
 */
function formatPreviousConvictions(convictions: PreviousConviction[]): Array<Record<string, string>> {
  return convictions.map((conv, index) => ({
    Index: String(index + 1),
    Offense: str(conv.offense),
    Case_Number: str(conv.caseNumber),
    Date: date(conv.date),
    Court: str(conv.court),
    Sentence: str(conv.sentence),
  }));
}

/**
 * Get list of all template tags for validation.
 */
export function getAllTemplateTags(): string[] {
  return [
    // Metadata
    'Report_Number', 'Status', 'Created_Date', 'Updated_Date',
    // Section I
    'Last_Name', 'First_Name', 'Middle_Name', 'Full_Name', 'Alias',
    'Sex', 'Sex_Male', 'Sex_Female',
    'Birthday', 'Birthday_Short', 'Birthplace', 'Nationality', 'Religion',
    'Civil_Status', 'Age', 'Educational_Attainment', 'Occupation',
    'Spouse_Name', 'Spouse_Address', 'Identifying_Marks', 'Permanent_Address',
    // Section II
    'Agency', 'Case_Number', 'Criminal_Case_Nos', 'Offense', 'Offense_Character',
    'Date_Of_Crime', 'Date_Of_Arrest',
    'Status_Of_Case', 'Status_On_Trial', 'Status_On_Detention',
    'Address_At_Arrest',
    'Previous_Convictions', 'Has_Previous_Convictions', 'No_Previous_Convictions',
    'Previous_Convictions_Count',
    // Section III
    'Family_Economic_Status', 'Status_Poor', 'Status_Low_Income', 'Status_Low_Middle',
    'Status_Middle_Middle', 'Status_Upper_Middle', 'Status_Upper_Income', 'Status_Rich',
    'Family_Relationship', 'Relationship_Very_Satisfactory', 'Relationship_Satisfactory', 'Relationship_Poor',
    'Family_Reputation', 'Reputation_Very_Satisfactory', 'Reputation_Satisfactory', 'Reputation_Poor',
    'Family_Support', 'Support_Very_Satisfactory', 'Support_Satisfactory', 'Support_Poor',
    'Community_Acceptability', 'Community_Very_Satisfactory', 'Community_Satisfactory', 'Community_Poor',
    'Overall_Well_Being', 'WellBeing_Very_Satisfactory', 'WellBeing_Satisfactory', 'WellBeing_Poor',
    // Section IV
    'Circumstances', 'Needs', 'Attitude', 'Recommendations',
    'Prepared_By_Name', 'Prepared_By_Designation', 'Prepared_By_Date',
    'Reviewed_By_Name', 'Reviewed_By_Designation', 'Reviewed_By_Date',
  ];
}
