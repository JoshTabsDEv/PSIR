import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
} from 'docx';
import type { PSIRReport } from '@/types/psir';
import { formatDateDisplay } from '@/lib/utils/date-formatters';
import { formatFullName } from '@/lib/utils/form-helpers';

function createLabelValueRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [new TextRun({ text: label, bold: true, size: 20 })],
          }),
        ],
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [new TextRun({ text: value || 'N/A', size: 20 })],
          }),
        ],
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
        },
      }),
    ],
  });
}

function createSectionHeader(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24 })],
    spacing: { before: 300, after: 200 },
  });
}

export function generateDOCX(report: PSIRReport): Document {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Republic of the Philippines', size: 22 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Department of Justice', size: 22 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'BUREAU OF CORRECTIONS', bold: true, size: 24 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'POST-SENTENCE INVESTIGATION REPORT',
                bold: true,
                size: 28,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [new TextRun({ text: `Report Number: ${report.reportNumber}`, size: 20 })],
          }),

          // Section I: Identifying Data
          createSectionHeader('I. IDENTIFYING DATA'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createLabelValueRow('Name', formatFullName(report.identifyingData.lastName, report.identifyingData.firstName, report.identifyingData.middleName)),
              createLabelValueRow('Alias', report.identifyingData.alias),
              createLabelValueRow('Sex', report.identifyingData.sex),
              createLabelValueRow('Birthday', formatDateDisplay(report.identifyingData.birthday)),
              createLabelValueRow('Age', report.identifyingData.age.toString()),
              createLabelValueRow('Birthplace', report.identifyingData.birthplace),
              createLabelValueRow('Nationality', report.identifyingData.nationality),
              createLabelValueRow('Religion', report.identifyingData.religion),
              createLabelValueRow('Civil Status', report.identifyingData.civilStatus),
              createLabelValueRow('Education', report.identifyingData.educationalAttainment),
              createLabelValueRow('Occupation', report.identifyingData.occupation),
              createLabelValueRow('Spouse', report.identifyingData.spouseName || ''),
              createLabelValueRow('Identifying Marks', report.identifyingData.identifyingMarks),
              createLabelValueRow('Present Address', report.identifyingData.presentAddress),
              createLabelValueRow('Permanent Address', report.identifyingData.permanentAddress),
            ],
          }),

          // Section II: Criminal History
          createSectionHeader('II. CRIMINAL HISTORY'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createLabelValueRow('Case Number', report.criminalHistory.presentOffense.caseNumber),
              createLabelValueRow('Agency/Court', report.criminalHistory.presentOffense.agency),
              createLabelValueRow('Offense', report.criminalHistory.presentOffense.offense),
              createLabelValueRow('Character', report.criminalHistory.presentOffense.character),
              createLabelValueRow('Date of Crime', formatDateDisplay(report.criminalHistory.presentOffense.dateOfCrime)),
              createLabelValueRow('Date of Arrest', formatDateDisplay(report.criminalHistory.presentOffense.dateOfArrest)),
              createLabelValueRow('Status of Case', report.criminalHistory.statusOfCase),
              createLabelValueRow('Address at Arrest', report.criminalHistory.address),
            ],
          }),

          // Previous Convictions (if any)
          ...(report.criminalHistory.previousConvictions?.length > 0
            ? [
                new Paragraph({
                  spacing: { before: 200 },
                  children: [new TextRun({ text: 'Previous Convictions:', bold: true, size: 20 })],
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: ['Offense', 'Case Number', 'Date', 'Court', 'Sentence'].map(
                        (header) =>
                          new TableCell({
                            children: [
                              new Paragraph({
                                children: [new TextRun({ text: header, bold: true, size: 18 })],
                              }),
                            ],
                            shading: { fill: '428BCE' },
                          })
                      ),
                    }),
                    ...report.criminalHistory.previousConvictions.map(
                      (conv) =>
                        new TableRow({
                          children: [
                            conv.offense || '',
                            conv.caseNumber || '',
                            formatDateDisplay(conv.date) || '',
                            conv.court || '',
                            conv.sentence || '',
                          ].map(
                            (text) =>
                              new TableCell({
                                children: [
                                  new Paragraph({
                                    children: [new TextRun({ text, size: 18 })],
                                  }),
                                ],
                              })
                          ),
                        })
                    ),
                  ],
                }),
              ]
            : []),

          // Section III: Socio-Economic Background
          createSectionHeader('III. SOCIO-ECONOMIC BACKGROUND'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createLabelValueRow('A. Family Economic Status', report.socioEconomicBackground.familyEconomicStatus),
              createLabelValueRow('B. Family Relationship', report.socioEconomicBackground.familyRelationship),
              createLabelValueRow('C. Family Reputation', report.socioEconomicBackground.familyReputation),
              createLabelValueRow('D. Family Support', report.socioEconomicBackground.familySupport),
              createLabelValueRow('E. Community Acceptability', report.socioEconomicBackground.communityAcceptability),
              createLabelValueRow('F. Overall Well-Being', report.socioEconomicBackground.overallWellBeing),
            ],
          }),

          // Section IV: Analysis and Evaluation
          createSectionHeader('IV. ANALYSIS AND EVALUATION'),

          new Paragraph({
            children: [new TextRun({ text: 'Circumstances:', bold: true, size: 20 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: report.analysisEvaluation.circumstances || 'N/A', size: 20 })],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [new TextRun({ text: 'Needs:', bold: true, size: 20 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: report.analysisEvaluation.needs || 'N/A', size: 20 })],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [new TextRun({ text: 'Attitude:', bold: true, size: 20 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: report.analysisEvaluation.attitude || 'N/A', size: 20 })],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [new TextRun({ text: 'Recommendations:', bold: true, size: 20 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: report.analysisEvaluation.recommendations || 'N/A', size: 20 })],
            spacing: { after: 400 },
          }),

          // Signatures
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Prepared by:', bold: true, size: 20 })],
                      }),
                      new Paragraph({ spacing: { before: 200 } }),
                      new Paragraph({
                        children: [new TextRun({ text: '_______________________________', size: 20 })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: report.analysisEvaluation.preparedBy?.name || '', bold: true, size: 20 })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: report.analysisEvaluation.preparedBy?.designation || '', size: 18 })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: formatDateDisplay(report.analysisEvaluation.preparedBy?.date), size: 18 })],
                      }),
                    ],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Reviewed by:', bold: true, size: 20 })],
                      }),
                      new Paragraph({ spacing: { before: 200 } }),
                      new Paragraph({
                        children: [new TextRun({ text: '_______________________________', size: 20 })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: report.analysisEvaluation.reviewedBy?.name || '', bold: true, size: 20 })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: report.analysisEvaluation.reviewedBy?.designation || '', size: 18 })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: formatDateDisplay(report.analysisEvaluation.reviewedBy?.date), size: 18 })],
                      }),
                    ],
                    borders: {
                      top: { style: BorderStyle.NONE },
                      bottom: { style: BorderStyle.NONE },
                      left: { style: BorderStyle.NONE },
                      right: { style: BorderStyle.NONE },
                    },
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  return doc;
}
