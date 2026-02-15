import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';
import type { PSIRReport } from '@/types/psir';

// Helper to format dates
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatDateShort = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};

const formatName = (last: string, first: string, middle?: string): string => {
  const parts = [last, first];
  if (middle) parts.push(middle.charAt(0) + '.');
  return parts.filter(Boolean).join(', ');
};

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  // Header styles
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  formNumber: {
    fontSize: 7,
  },
  headerCenter: {
    textAlign: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
  },
  headerSubtitle: {
    fontSize: 8,
  },
  mainTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    marginVertical: 10,
  },
  // Section styles
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginTop: 10,
    marginBottom: 5,
    backgroundColor: '#f0f0f0',
    padding: 3,
  },
  subsectionTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    marginTop: 8,
    marginBottom: 3,
  },
  // Box styles
  box: {
    border: '1pt solid #000',
    padding: 8,
    marginBottom: 8,
  },
  // Field styles
  fieldRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  fieldGroup: {
    flex: 1,
    marginRight: 10,
  },
  fieldLabel: {
    fontSize: 7,
    color: '#666',
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    borderBottom: '0.5pt solid #000',
    paddingBottom: 2,
    minHeight: 12,
  },
  // Table styles
  table: {
    border: '1pt solid #000',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #000',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
  },
  tableCell: {
    flex: 1,
    padding: 4,
    fontSize: 7,
    borderRight: '0.5pt solid #000',
  },
  tableCellLast: {
    flex: 1,
    padding: 4,
    fontSize: 7,
  },
  // Checkbox styles
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  checkbox: {
    width: 10,
    height: 10,
    border: '1pt solid #000',
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    fontSize: 8,
  },
  checkboxLabel: {
    fontSize: 8,
  },
  // Grid styles
  gridRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  gridCol2: {
    flex: 1,
    marginRight: 5,
  },
  gridCol3: {
    width: '33%',
    marginRight: 5,
  },
  // Signature styles
  signatureSection: {
    flexDirection: 'row',
    marginTop: 30,
  },
  signatureBlock: {
    flex: 1,
    marginRight: 20,
  },
  signatureLine: {
    borderBottom: '1pt solid #000',
    marginTop: 30,
    marginBottom: 5,
  },
  signatureName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  signatureTitle: {
    fontSize: 8,
    color: '#666',
  },
  // Page number
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    fontSize: 8,
  },
  // Text area box
  textBox: {
    border: '1pt solid #000',
    padding: 8,
    minHeight: 60,
    marginBottom: 8,
  },
  textBoxLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 5,
  },
  textBoxContent: {
    fontSize: 9,
  },
});

// Checkbox component
const Checkbox = ({ checked, label }: { checked: boolean; label: string }) => (
  <View style={styles.checkboxRow}>
    <View style={styles.checkbox}>
      {checked && <Text style={styles.checkboxChecked}>✓</Text>}
    </View>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </View>
);

// Field component
const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <Text style={styles.fieldValue}>{value || ''}</Text>
  </View>
);

// Main PDF Document
export const PSIRDocument = ({ report }: { report: PSIRReport }) => (
  <Document>
    {/* PAGE 1 - Identifying Data & Criminal History */}
    <Page size="LEGAL" style={styles.page}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.formNumber}>BuCor-F55-55</Text>
          <Text style={styles.formNumber}>Revision: 003</Text>
        </View>
        <View>
          <Text style={styles.formNumber}>PSIR No: {report.reportNumber}</Text>
          <Text style={styles.formNumber}>Case No: {report.criminalHistory?.presentOffense?.caseNumber || ''}</Text>
        </View>
      </View>

      <View style={styles.headerCenter}>
        <Text style={styles.headerSubtitle}>Republic of the Philippines</Text>
        <Text style={styles.headerTitle}>DEPARTMENT OF JUSTICE</Text>
        <Text style={styles.headerSubtitle}>Bureau of Corrections</Text>
        <Text style={{ fontSize: 7 }}>Inmate Documents and Processing Division</Text>
        <Text style={{ fontSize: 7 }}>NBP Reservation, Muntinlupa City</Text>
      </View>

      <Text style={{ fontSize: 9, marginBottom: 5 }}>{formatDate(new Date())}</Text>

      <Text style={styles.mainTitle}>POST-SENTENCE INVESTIGATION REPORT</Text>

      {/* Section I: Identifying Data */}
      <Text style={styles.sectionTitle}>I. IDENTIFYING DATA</Text>
      <View style={styles.box}>
        <View style={styles.fieldRow}>
          <Field label="Last Name" value={report.identifyingData.lastName} />
          <Field label="First Name" value={report.identifyingData.firstName} />
          <Field label="Middle Name" value={report.identifyingData.middleName} />
        </View>
        <View style={styles.fieldRow}>
          <Field label="Alias/Moniker" value={report.identifyingData.alias} />
          <Field label="Sex" value={report.identifyingData.sex} />
          <Field label="Date of Birth" value={formatDateShort(report.identifyingData.birthday)} />
        </View>
        <View style={styles.fieldRow}>
          <Field label="Age" value={report.identifyingData.age} />
          <Field label="Birthplace" value={report.identifyingData.birthplace} />
          <Field label="Religion" value={report.identifyingData.religion} />
        </View>
        <View style={styles.fieldRow}>
          <Field label="Civil Status" value={report.identifyingData.civilStatus} />
          <Field label="Nationality" value={report.identifyingData.nationality} />
          <Field label="Educational Attainment" value={report.identifyingData.educationalAttainment} />
        </View>
        <View style={styles.fieldRow}>
          <Field label="Occupation" value={report.identifyingData.occupation} />
          <Field label="Spouse" value={report.identifyingData.spouseName} />
        </View>
        <View style={styles.fieldRow}>
          <Field label="Identifying Marks/Tattoos" value={report.identifyingData.identifyingMarks} />
        </View>
        <View style={styles.fieldRow}>
          <Field label="Present Address" value={report.identifyingData.presentAddress} />
        </View>
        <View style={styles.fieldRow}>
          <Field label="Permanent Address" value={report.identifyingData.permanentAddress} />
        </View>
      </View>

      {/* Section II: Criminal History */}
      <Text style={styles.sectionTitle}>II. CRIMINAL HISTORY</Text>
      <Text style={styles.subsectionTitle}>A. PRESENT OFFENSE</Text>

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={styles.tableCell}>Agency/Court</Text>
          <Text style={styles.tableCell}>Case Number</Text>
          <Text style={styles.tableCell}>Date of Crime</Text>
          <Text style={styles.tableCell}>Date of Arrest</Text>
          <Text style={styles.tableCellLast}>Character</Text>
        </View>
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>{report.criminalHistory?.presentOffense?.agency || ''}</Text>
          <Text style={styles.tableCell}>{report.criminalHistory?.presentOffense?.caseNumber || ''}</Text>
          <Text style={styles.tableCell}>{formatDateShort(report.criminalHistory?.presentOffense?.dateOfCrime)}</Text>
          <Text style={styles.tableCell}>{formatDateShort(report.criminalHistory?.presentOffense?.dateOfArrest)}</Text>
          <Text style={styles.tableCellLast}>{report.criminalHistory?.presentOffense?.character || ''}</Text>
        </View>
      </View>

      <View style={styles.box}>
        <Text style={styles.fieldLabel}>Offense:</Text>
        <Text style={styles.fieldValue}>{report.criminalHistory?.presentOffense?.offense || ''}</Text>
      </View>

      <View style={styles.fieldRow}>
        <Text style={{ marginRight: 10, fontFamily: 'Helvetica-Bold' }}>Status:</Text>
        <Checkbox checked={report.criminalHistory?.statusOfCase === 'On detention'} label="On Detention" />
        <View style={{ width: 20 }} />
        <Checkbox checked={report.criminalHistory?.statusOfCase === 'On trial'} label="On Trial" />
      </View>

      <Text style={styles.pageNumber}>Page 1</Text>
    </Page>

    {/* PAGE 2 - Socio-Economic Background */}
    <Page size="LEGAL" style={styles.page}>
      <View style={styles.headerRow}>
        <Text style={styles.formNumber}>BuCor PSIR 2 | Revision: 003</Text>
        <Text style={styles.formNumber}>{report.reportNumber}</Text>
      </View>

      <Text style={styles.sectionTitle}>III. SOCIO-ECONOMIC BACKGROUND</Text>

      {/* A. Family Economic Status */}
      <View style={styles.box}>
        <Text style={styles.subsectionTitle}>A. FAMILY ECONOMIC STATUS</Text>
        <Checkbox checked={report.socioEconomicBackground?.familyEconomicStatus === 'Poor'} label="Poor" />
        <Checkbox checked={report.socioEconomicBackground?.familyEconomicStatus === 'Low-income Class (but not poor)'} label="Low-income Class (but not poor)" />
        <Checkbox checked={report.socioEconomicBackground?.familyEconomicStatus === 'Low middle-income class'} label="Low middle-income class" />
        <Checkbox checked={report.socioEconomicBackground?.familyEconomicStatus === 'Middle middle-income Class'} label="Middle middle-income Class" />
        <Checkbox checked={report.socioEconomicBackground?.familyEconomicStatus === 'Upper middle-income Class'} label="Upper middle-income Class" />
        <Checkbox checked={report.socioEconomicBackground?.familyEconomicStatus === 'Upper-income Class (but not rich)'} label="Upper-income Class (but not rich)" />
        <Checkbox checked={report.socioEconomicBackground?.familyEconomicStatus === 'Rich'} label="Rich" />
      </View>

      {/* B. Family Relationship */}
      <View style={styles.box}>
        <Text style={styles.subsectionTitle}>B. FAMILY RELATIONSHIP</Text>
        <Checkbox checked={report.socioEconomicBackground?.familyRelationship === 'Very satisfactory'} label="Very satisfactory" />
        <Checkbox checked={report.socioEconomicBackground?.familyRelationship === 'Satisfactory'} label="Satisfactory" />
        <Checkbox checked={report.socioEconomicBackground?.familyRelationship === 'Poor'} label="Poor" />
      </View>

      {/* C. Family Reputation */}
      <View style={styles.box}>
        <Text style={styles.subsectionTitle}>C. FAMILY REPUTATION</Text>
        <Checkbox checked={report.socioEconomicBackground?.familyReputation === 'Very satisfactory'} label="Very satisfactory" />
        <Checkbox checked={report.socioEconomicBackground?.familyReputation === 'Satisfactory'} label="Satisfactory" />
        <Checkbox checked={report.socioEconomicBackground?.familyReputation === 'Poor'} label="Poor" />
      </View>

      {/* D. Family Support */}
      <View style={styles.box}>
        <Text style={styles.subsectionTitle}>D. FAMILY SUPPORT</Text>
        <Checkbox checked={report.socioEconomicBackground?.familySupport === 'Very satisfactory'} label="Very satisfactory" />
        <Checkbox checked={report.socioEconomicBackground?.familySupport === 'Satisfactory'} label="Satisfactory" />
        <Checkbox checked={report.socioEconomicBackground?.familySupport === 'Poor'} label="Poor" />
      </View>

      {/* E. Community Acceptability */}
      <View style={styles.box}>
        <Text style={styles.subsectionTitle}>E. COMMUNITY ACCEPTABILITY</Text>
        <Checkbox checked={report.socioEconomicBackground?.communityAcceptability === 'Very satisfactory'} label="Very satisfactory" />
        <Checkbox checked={report.socioEconomicBackground?.communityAcceptability === 'Satisfactory'} label="Satisfactory" />
        <Checkbox checked={report.socioEconomicBackground?.communityAcceptability === 'Poor'} label="Poor" />
      </View>

      {/* F. Overall Well-Being */}
      <View style={styles.box}>
        <Text style={styles.subsectionTitle}>F. OVERALL WELL-BEING</Text>
        <Checkbox checked={report.socioEconomicBackground?.overallWellBeing === 'Very satisfactory'} label="Very satisfactory" />
        <Checkbox checked={report.socioEconomicBackground?.overallWellBeing === 'Satisfactory'} label="Satisfactory" />
        <Checkbox checked={report.socioEconomicBackground?.overallWellBeing === 'Poor'} label="Poor" />
      </View>

      <Text style={styles.pageNumber}>Page 2</Text>
    </Page>

    {/* PAGE 3 - Analysis and Evaluation */}
    <Page size="LEGAL" style={styles.page}>
      <View style={styles.headerRow}>
        <Text style={styles.formNumber}>BuCor PSIR 3 | Revision: 003</Text>
        <Text style={styles.formNumber}>{report.reportNumber}</Text>
      </View>

      <Text style={styles.sectionTitle}>IV. ANALYSIS AND EVALUATION</Text>

      <View style={styles.textBox}>
        <Text style={styles.textBoxLabel}>Circumstances of the Offense:</Text>
        <Text style={styles.textBoxContent}>{report.analysisEvaluation?.circumstances || ''}</Text>
      </View>

      <View style={styles.textBox}>
        <Text style={styles.textBoxLabel}>Identified Needs:</Text>
        <Text style={styles.textBoxContent}>{report.analysisEvaluation?.needs || ''}</Text>
      </View>

      <View style={styles.textBox}>
        <Text style={styles.textBoxLabel}>Attitude towards the Offense:</Text>
        <Text style={styles.textBoxContent}>{report.analysisEvaluation?.attitude || ''}</Text>
      </View>

      <View style={styles.textBox}>
        <Text style={styles.textBoxLabel}>Recommendations:</Text>
        <Text style={styles.textBoxContent}>{report.analysisEvaluation?.recommendations || ''}</Text>
      </View>

      <Text style={styles.pageNumber}>Page 3</Text>
    </Page>

    {/* PAGE 4 - Recommendation & Signatures */}
    <Page size="LEGAL" style={styles.page}>
      <View style={styles.headerRow}>
        <Text style={styles.formNumber}>BuCor PSIR 4 | Revision: 003</Text>
        <Text style={styles.formNumber}>{report.reportNumber}</Text>
      </View>

      <Text style={styles.sectionTitle}>VI. RECOMMENDATION</Text>

      <View style={[styles.textBox, { minHeight: 100 }]}>
        <Text style={styles.textBoxContent}>
          Based on the foregoing findings, the undersigned respectfully recommends that{' '}
          <Text style={{ fontFamily: 'Helvetica-Bold' }}>
            {formatName(report.identifyingData.lastName, report.identifyingData.firstName, report.identifyingData.middleName)}
          </Text>{' '}
          be given appropriate consideration for rehabilitation programs as deemed suitable by the
          Bureau of Corrections, in accordance with existing rules and regulations.
        </Text>
      </View>

      {/* Signatures */}
      <View style={styles.signatureSection}>
        <View style={styles.signatureBlock}>
          <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>Prepared and submitted by:</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureName}>{report.analysisEvaluation?.preparedBy?.name || ''}</Text>
          <Text style={styles.signatureTitle}>{report.analysisEvaluation?.preparedBy?.designation || ''}</Text>
          <Text style={styles.signatureTitle}>Date: {formatDate(report.analysisEvaluation?.preparedBy?.date)}</Text>
        </View>

        <View style={styles.signatureBlock}>
          <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 5 }}>Reviewed and approved by:</Text>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureName}>{report.analysisEvaluation?.reviewedBy?.name || ''}</Text>
          <Text style={styles.signatureTitle}>{report.analysisEvaluation?.reviewedBy?.designation || ''}</Text>
          <Text style={styles.signatureTitle}>Date: {formatDate(report.analysisEvaluation?.reviewedBy?.date)}</Text>
        </View>
      </View>

      <Text style={styles.pageNumber}>Page 4</Text>
    </Page>
  </Document>
);

export default PSIRDocument;
