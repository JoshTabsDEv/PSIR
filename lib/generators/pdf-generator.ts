import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { PSIRReport } from '@/types/psir';
import { formatDateDisplay, formatDateShort } from '@/lib/utils/date-formatters';
import { formatFullName } from '@/lib/utils/form-helpers';

export function generatePDF(report: PSIRReport): jsPDF {
  const doc = new jsPDF('portrait', 'mm', 'legal');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // Helper functions
  const drawBox = (x: number, yPos: number, width: number, height: number) => {
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(x, yPos, width, height);
  };

  const drawCheckbox = (x: number, yPos: number, checked: boolean, label: string) => {
    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.rect(x, yPos, 3, 3);
    if (checked) {
      doc.setFontSize(8);
      doc.text('✓', x + 0.5, yPos + 2.5);
    }
    doc.setFontSize(7);
    doc.text(label, x + 4, yPos + 2.5);
  };

  const addField = (label: string, value: string, x: number, yPos: number, width: number) => {
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(label, x, yPos);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    const displayValue = value || '_________________';
    doc.text(displayValue, x, yPos + 4);
    doc.setLineWidth(0.2);
    doc.line(x, yPos + 5, x + width - 2, yPos + 5);
  };

  const addPageNumber = (pageNum: number) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Page ${pageNum}`, pageWidth - margin - 10, pageHeight - 10);
  };

  // ==================== PAGE 1 ====================
  // Form number header
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('BuCor-F55-55', margin, y);
  doc.text('Revision: 003', margin, y + 3);

  doc.text('BuCor PSIR 1', pageWidth / 2 - 10, y);
  doc.text('Revision: 003', pageWidth / 2 - 10, y + 3);

  y += 10;

  // Left side - Court info
  doc.setFontSize(7);
  doc.text('To:', margin, y);
  doc.setFont('helvetica', 'bold');
  doc.text('PSIR No:', margin + 50, y);
  doc.setFont('helvetica', 'normal');
  doc.text(report.reportNumber, margin + 65, y);
  y += 4;
  doc.text('Criminal Case Number:', margin + 50, y);
  doc.text(report.criminalHistory?.presentOffense?.caseNumber || '', margin + 85, y);

  y += 8;

  // Header with DOJ info
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Republic of the Philippines', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.text('DEPARTMENT OF JUSTICE', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text('Bureau of Corrections', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.setFontSize(7);
  doc.text('Inmate Documents and Processing Division', pageWidth / 2, y, { align: 'center' });
  y += 3;
  doc.text('NBP Reservation, Muntinlupa City', pageWidth / 2, y, { align: 'center' });

  y += 8;

  // Date
  doc.setFontSize(9);
  doc.text(formatDateDisplay(new Date()), margin, y);

  y += 10;

  // Title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('POST-SENTENCE INVESTIGATION REPORT', pageWidth / 2, y, { align: 'center' });

  y += 10;

  // ==================== SECTION I: IDENTIFYING DATA ====================
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('I. IDENTIFYING DATA', margin, y);

  y += 5;

  // Create a box for Section I
  const section1Height = 65;
  drawBox(margin, y, contentWidth, section1Height);

  // Left column fields
  const col1X = margin + 2;
  const col2X = margin + contentWidth / 2;
  let fieldY = y + 5;

  addField('Last Name', report.identifyingData.lastName, col1X, fieldY, contentWidth / 3);
  addField('First Name', report.identifyingData.firstName, col1X + contentWidth / 3, fieldY, contentWidth / 3);
  addField('Middle Name', report.identifyingData.middleName, col2X + contentWidth / 6, fieldY, contentWidth / 3);

  fieldY += 10;
  addField('True Name', '', col1X, fieldY, contentWidth / 2 - 5);
  addField('Alias/Moniker', report.identifyingData.alias, col2X, fieldY, contentWidth / 2 - 5);

  fieldY += 10;
  addField('Sex', report.identifyingData.sex, col1X, fieldY, 25);
  addField('Religion', report.identifyingData.religion, col1X + 30, fieldY, 35);
  addField('Date of Birth', formatDateShort(report.identifyingData.birthday), col2X, fieldY, 30);

  fieldY += 10;
  addField('Age', report.identifyingData.age?.toString() || '', col1X, fieldY, 20);
  addField('Birthplace', report.identifyingData.birthplace, col1X + 25, fieldY, 40);
  addField('Occupation', report.identifyingData.occupation, col2X, fieldY, 40);

  fieldY += 10;
  addField('Civil Status', report.identifyingData.civilStatus, col1X, fieldY, 30);
  addField('Spouse', report.identifyingData.spouseName || '', col1X + 35, fieldY, 50);

  fieldY += 10;
  addField('Identifying Marks', report.identifyingData.identifyingMarks, col1X, fieldY, contentWidth / 2 - 5);
  addField('Educational Attainment', report.identifyingData.educationalAttainment, col2X, fieldY, contentWidth / 2 - 5);

  y += section1Height + 5;

  // Permanent Address
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.text('Permanent Address:', margin, y);
  y += 3;
  drawBox(margin, y, contentWidth, 10);
  doc.setFontSize(8);
  doc.text(report.identifyingData.permanentAddress || '', margin + 2, y + 6);
  y += 15;

  // ==================== SECTION II: CRIMINAL HISTORY ====================
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('II. CRIMINAL HISTORY', margin, y);
  y += 5;

  // A. Present Offense
  doc.setFontSize(8);
  doc.text('A. PRESENT OFFENSE:', margin + 2, y);
  y += 3;

  // Present offense table
  autoTable(doc, {
    startY: y,
    head: [['Character/Class of', 'Date', 'Sentence', 'Date', 'Court/']],
    body: [[
      report.criminalHistory?.presentOffense?.character || '',
      formatDateShort(report.criminalHistory?.presentOffense?.dateOfCrime) || '',
      '',
      formatDateShort(report.criminalHistory?.presentOffense?.dateOfArrest) || '',
      report.criminalHistory?.presentOffense?.agency || '',
    ]],
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
    margin: { left: margin },
    tableWidth: contentWidth,
  });

  y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 3;

  // Offense details
  doc.setFontSize(7);
  doc.text('Offense:', margin + 2, y);
  doc.setFont('helvetica', 'normal');
  const offenseText = doc.splitTextToSize(report.criminalHistory?.presentOffense?.offense || '', contentWidth - 20);
  doc.text(offenseText, margin + 15, y);
  y += Math.max(offenseText.length * 3, 5) + 3;

  // Status checkboxes
  doc.setFont('helvetica', 'bold');
  doc.text('Status:', margin + 2, y);
  drawCheckbox(margin + 20, y - 2.5, report.criminalHistory?.statusOfCase === 'On detention', 'On detention');
  drawCheckbox(margin + 50, y - 2.5, report.criminalHistory?.statusOfCase === 'On trial', 'On trial');
  y += 5;

  // Address during arrest
  doc.setFontSize(6);
  doc.text('Address at time of arrest:', margin + 2, y);
  y += 3;
  drawBox(margin, y, contentWidth, 8);
  doc.setFontSize(7);
  doc.text(report.criminalHistory?.address || '', margin + 2, y + 5);
  y += 12;

  // B. Previous Convictions
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('B. TRAFFIC AND PENDING RECORDS:', margin + 2, y);
  y += 3;

  if (report.criminalHistory?.previousConvictions && report.criminalHistory.previousConvictions.length > 0) {
    autoTable(doc, {
      startY: y,
      head: [['Agency/', 'Case No.', 'Offense/', 'Date', 'Decision/Status of the Case']],
      body: report.criminalHistory.previousConvictions.map(conv => [
        conv.court || '',
        conv.caseNumber || '',
        conv.offense || '',
        formatDateShort(conv.date) || '',
        conv.sentence || '',
      ]),
      theme: 'grid',
      styles: { fontSize: 6, cellPadding: 1 },
      headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold' },
      margin: { left: margin },
      tableWidth: contentWidth,
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
  } else {
    drawBox(margin, y, contentWidth, 15);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('No previous convictions on record', margin + 5, y + 8);
    y += 20;
  }

  addPageNumber(1);

  // ==================== PAGE 2 ====================
  doc.addPage();
  y = margin;

  // Page header
  doc.setFontSize(7);
  doc.text('BuCor PSIR 2', margin, y);
  doc.text('Revision: 003', margin, y + 3);
  y += 10;

  // ==================== SECTION III: SOCIO-ECONOMIC BACKGROUND ====================
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('III. SOCIO-ECONOMIC BACKGROUND', margin, y);
  y += 8;

  // A. Family Economic Status
  doc.setFontSize(8);
  doc.text('A. FAMILY ECONOMIC STATUS', margin, y);
  y += 5;

  drawBox(margin, y, contentWidth, 30);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  drawCheckbox(margin + 3, y + 3, report.socioEconomicBackground?.familyEconomicStatus === 'Poor', 'Poor');
  drawCheckbox(margin + 25, y + 3, report.socioEconomicBackground?.familyEconomicStatus === 'Low-income Class (but not poor)', 'Low-income Class (but not poor)');
  drawCheckbox(margin + 3, y + 9, report.socioEconomicBackground?.familyEconomicStatus === 'Low middle-income class', 'Low middle-income class');
  drawCheckbox(margin + 50, y + 9, report.socioEconomicBackground?.familyEconomicStatus === 'Middle middle-income Class', 'Middle middle-income Class');
  drawCheckbox(margin + 3, y + 15, report.socioEconomicBackground?.familyEconomicStatus === 'Upper middle-income Class', 'Upper middle-income Class');
  drawCheckbox(margin + 50, y + 15, report.socioEconomicBackground?.familyEconomicStatus === 'Upper-income Class (but not rich)', 'Upper-income Class (but not rich)');
  drawCheckbox(margin + 3, y + 21, report.socioEconomicBackground?.familyEconomicStatus === 'Rich', 'Rich');

  y += 35;

  // B. Family Relationship
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('B. FAMILY RELATIONSHIP', margin, y);
  y += 5;

  drawBox(margin, y, contentWidth, 15);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  drawCheckbox(margin + 3, y + 3, report.socioEconomicBackground?.familyRelationship === 'Very satisfactory', 'Very satisfactory');
  drawCheckbox(margin + 35, y + 3, report.socioEconomicBackground?.familyRelationship === 'Satisfactory', 'Satisfactory');
  drawCheckbox(margin + 60, y + 3, report.socioEconomicBackground?.familyRelationship === 'Poor', 'Poor');

  y += 20;

  // C. Family Reputation
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('C. FAMILY REPUTATION', margin, y);
  y += 5;

  drawBox(margin, y, contentWidth, 15);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  drawCheckbox(margin + 3, y + 3, report.socioEconomicBackground?.familyReputation === 'Very satisfactory', 'Very satisfactory');
  drawCheckbox(margin + 35, y + 3, report.socioEconomicBackground?.familyReputation === 'Satisfactory', 'Satisfactory');
  drawCheckbox(margin + 60, y + 3, report.socioEconomicBackground?.familyReputation === 'Poor', 'Poor');

  y += 20;

  // D. Family Support
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('D. FAMILY SUPPORT', margin, y);
  y += 5;

  drawBox(margin, y, contentWidth, 15);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  drawCheckbox(margin + 3, y + 3, report.socioEconomicBackground?.familySupport === 'Very satisfactory', 'Very satisfactory');
  drawCheckbox(margin + 35, y + 3, report.socioEconomicBackground?.familySupport === 'Satisfactory', 'Satisfactory');
  drawCheckbox(margin + 60, y + 3, report.socioEconomicBackground?.familySupport === 'Poor', 'Poor');

  y += 20;

  // E. Community Acceptability
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('E. COMMUNITY ACCEPTABILITY', margin, y);
  y += 5;

  drawBox(margin, y, contentWidth, 15);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  drawCheckbox(margin + 3, y + 3, report.socioEconomicBackground?.communityAcceptability === 'Very satisfactory', 'Very satisfactory');
  drawCheckbox(margin + 35, y + 3, report.socioEconomicBackground?.communityAcceptability === 'Satisfactory', 'Satisfactory');
  drawCheckbox(margin + 60, y + 3, report.socioEconomicBackground?.communityAcceptability === 'Poor', 'Poor');

  y += 20;

  // F. Overall Well-Being
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('F. OVERALL WELL-BEING', margin, y);
  y += 5;

  drawBox(margin, y, contentWidth, 15);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  drawCheckbox(margin + 3, y + 3, report.socioEconomicBackground?.overallWellBeing === 'Very satisfactory', 'Very satisfactory');
  drawCheckbox(margin + 35, y + 3, report.socioEconomicBackground?.overallWellBeing === 'Satisfactory', 'Satisfactory');
  drawCheckbox(margin + 60, y + 3, report.socioEconomicBackground?.overallWellBeing === 'Poor', 'Poor');

  y += 20;

  addPageNumber(2);

  // ==================== PAGE 3 ====================
  doc.addPage();
  y = margin;

  // Page header
  doc.setFontSize(7);
  doc.text('BuCor PSIR 3', margin, y);
  doc.text('Revision: 003', margin, y + 3);
  y += 10;

  // ==================== SECTION IV: ANALYSIS AND EVALUATION ====================
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('IV. ANALYSIS AND EVALUATION', margin, y);
  y += 8;

  // Circumstances box
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Circumstances of the Offense:', margin, y);
  y += 3;
  drawBox(margin, y, contentWidth, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const circumstances = doc.splitTextToSize(report.analysisEvaluation?.circumstances || '', contentWidth - 4);
  doc.text(circumstances, margin + 2, y + 5);
  y += 45;

  // Needs box
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Identified Needs:', margin, y);
  y += 3;
  drawBox(margin, y, contentWidth, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const needs = doc.splitTextToSize(report.analysisEvaluation?.needs || '', contentWidth - 4);
  doc.text(needs, margin + 2, y + 5);
  y += 35;

  // Attitude box
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Attitude towards the Offense:', margin, y);
  y += 3;
  drawBox(margin, y, contentWidth, 30);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const attitude = doc.splitTextToSize(report.analysisEvaluation?.attitude || '', contentWidth - 4);
  doc.text(attitude, margin + 2, y + 5);
  y += 35;

  // Recommendations box
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Recommendations:', margin, y);
  y += 3;
  drawBox(margin, y, contentWidth, 40);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const recommendations = doc.splitTextToSize(report.analysisEvaluation?.recommendations || '', contentWidth - 4);
  doc.text(recommendations, margin + 2, y + 5);
  y += 45;

  addPageNumber(3);

  // ==================== PAGE 4 ====================
  doc.addPage();
  y = margin;

  // Page header
  doc.setFontSize(7);
  doc.text('BuCor PSIR 4', margin, y);
  doc.text('Revision: 003', margin, y + 3);
  y += 10;

  // ==================== SECTION V: RECOMMENDATION ====================
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('V. RECOMMENDATION', margin, y);
  y += 8;

  drawBox(margin, y, contentWidth, 60);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const recText = `Based on the foregoing, the undersigned respectfully recommends that ${formatFullName(report.identifyingData.lastName, report.identifyingData.firstName, report.identifyingData.middleName)} be given appropriate consideration for rehabilitation programs as deemed suitable by the Bureau of Corrections.`;
  const recLines = doc.splitTextToSize(recText, contentWidth - 4);
  doc.text(recLines, margin + 2, y + 8);
  y += 70;

  // Signatures
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');

  // Prepared by
  doc.text('Prepared and submitted by:', margin, y);
  y += 20;
  doc.line(margin, y, margin + 60, y);
  y += 4;
  doc.text(report.analysisEvaluation?.preparedBy?.name || '', margin, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(report.analysisEvaluation?.preparedBy?.designation || '', margin, y);
  y += 4;
  doc.text(`Date: ${formatDateDisplay(report.analysisEvaluation?.preparedBy?.date)}`, margin, y);

  // Reviewed by
  y -= 32;
  doc.setFont('helvetica', 'bold');
  doc.text('Reviewed and approved by:', margin + contentWidth / 2, y);
  y += 20;
  doc.line(margin + contentWidth / 2, y, margin + contentWidth / 2 + 60, y);
  y += 4;
  doc.text(report.analysisEvaluation?.reviewedBy?.name || '', margin + contentWidth / 2, y);
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.text(report.analysisEvaluation?.reviewedBy?.designation || '', margin + contentWidth / 2, y);
  y += 4;
  doc.text(`Date: ${formatDateDisplay(report.analysisEvaluation?.reviewedBy?.date)}`, margin + contentWidth / 2, y);

  addPageNumber(4);

  return doc;
}
