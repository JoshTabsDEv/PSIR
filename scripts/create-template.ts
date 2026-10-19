/**
 * Script to generate a PSIR DOCX template with all placeholder tags.
 * Run with: npx ts-node scripts/create-template.ts
 * Or: npx tsx scripts/create-template.ts
 */

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
  Packer,
  PageBreak,
  HeadingLevel,
} from 'docx';
import * as fs from 'fs';
import * as path from 'path';

// Helper to create a form field row
function formRow(label: string, tag: string, width1 = 35, width2 = 65): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: width1, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [new TextRun({ text: label, bold: true, size: 20 })],
          }),
        ],
        borders: noBorders(),
      }),
      new TableCell({
        width: { size: width2, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [new TextRun({ text: `{${tag}}`, size: 20 })],
          }),
        ],
        borders: noBorders(),
      }),
    ],
  });
}

// Helper for checkbox rows
function checkboxRow(label: string, options: { text: string; tag: string }[]): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 35, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: [new TextRun({ text: label, bold: true, size: 20 })],
          }),
        ],
        borders: noBorders(),
      }),
      new TableCell({
        width: { size: 65, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            children: options.flatMap((opt, i) => [
              new TextRun({ text: `{${opt.tag}} `, size: 20 }),
              new TextRun({ text: opt.text, size: 20 }),
              new TextRun({ text: i < options.length - 1 ? '    ' : '', size: 20 }),
            ]),
          }),
        ],
        borders: noBorders(),
      }),
    ],
  });
}

function noBorders() {
  return {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  };
}

function sectionHeader(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, allCaps: true })],
    spacing: { before: 400, after: 200 },
    heading: HeadingLevel.HEADING_2,
  });
}

function subHeader(text: string): Paragraph {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22 })],
    spacing: { before: 200, after: 100 },
  });
}

async function createTemplate() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // ========== HEADER ==========
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'Republic of the Philippines', size: 22 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'DEPARTMENT OF JUSTICE', size: 22, bold: true })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: 'PAROLE AND PROBATION ADMINISTRATION', size: 22, bold: true })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [new TextRun({ text: 'Tagbilaran City Parole and Probation Office', size: 20 })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 400 },
            children: [
              new TextRun({
                text: 'POST-SENTENCE INVESTIGATION REPORT',
                bold: true,
                size: 28,
                underline: {},
              }),
            ],
          }),

          // Report Number
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: 'Report No: {Report_Number}', size: 20 })],
            spacing: { after: 200 },
          }),

          // ========== SECTION I: IDENTIFYING DATA ==========
          sectionHeader('I. IDENTIFYING DATA'),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              formRow("Petitioner's Name:", 'Full_Name'),
              formRow('Last Name:', 'Last_Name'),
              formRow('First Name:', 'First_Name'),
              formRow('Middle Name:', 'Middle_Name'),
              formRow('Alias/es:', 'Alias'),
              checkboxRow('Sex:', [
                { text: 'Male', tag: 'Sex_Male' },
                { text: 'Female', tag: 'Sex_Female' },
              ]),
              formRow('Birthday:', 'Birthday'),
              formRow('Age:', 'Age'),
              formRow('Birthplace:', 'Birthplace'),
              formRow('Nationality:', 'Nationality'),
              formRow('Religion:', 'Religion'),
              formRow('Civil Status:', 'Civil_Status'),
              formRow('Educational Attainment:', 'Educational_Attainment'),
              formRow('Occupation:', 'Occupation'),
              formRow('Spouse Name:', 'Spouse_Name'),
              formRow('Spouse Address:', 'Spouse_Address'),
              formRow('Identifying Marks:', 'Identifying_Marks'),
              formRow('Permanent Address:', 'Permanent_Address'),
            ],
          }),

          // ========== SECTION II: CRIMINAL HISTORY ==========
          sectionHeader('II. CRIMINAL HISTORY'),

          subHeader('A. Present Offense'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              formRow('Agency/Court:', 'Agency'),
              formRow('Criminal Case No.:', 'Case_Number'),
              formRow('Offense:', 'Offense'),
              formRow('Character of Offense:', 'Offense_Character'),
              formRow('Date of Crime:', 'Date_Of_Crime'),
              formRow('Date of Arrest:', 'Date_Of_Arrest'),
              checkboxRow('Status of Case:', [
                { text: 'On Trial', tag: 'Status_On_Trial' },
                { text: 'On Detention', tag: 'Status_On_Detention' },
              ]),
              formRow('Address at Time of Arrest:', 'Address_At_Arrest'),
            ],
          }),

          subHeader('B. Previous Convictions'),
          new Paragraph({
            children: [
              new TextRun({ text: '{Has_Previous_Convictions} Has Previous Convictions    ', size: 20 }),
              new TextRun({ text: '{No_Previous_Convictions} No Previous Convictions', size: 20 }),
            ],
            spacing: { after: 100 },
          }),

          // Previous convictions table header
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: ['No.', 'Offense', 'Case Number', 'Date', 'Court', 'Sentence'].map(
                  (header) =>
                    new TableCell({
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: header, bold: true, size: 18 })],
                          alignment: AlignmentType.CENTER,
                        }),
                      ],
                      shading: { fill: 'CCCCCC' },
                    })
                ),
              }),
              // Loop row
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '{#Previous_Convictions}{Index}', size: 18 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '{Offense}', size: 18 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '{Case_Number}', size: 18 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '{Date}', size: 18 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '{Court}', size: 18 })] })],
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '{Sentence}{/Previous_Convictions}', size: 18 })] })],
                  }),
                ],
              }),
            ],
          }),

          // ========== SECTION III: DRUG AND VIOLENCE HISTORY ==========
          sectionHeader('III. DRUG AND VIOLENCE HISTORY'),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              formRow('Age of First Drug Use:', 'Age_Of_First_Use'),
              formRow('Frequency of Use:', 'Frequency_Of_Use'),
              formRow('Type of Drug:', 'Drug_Type'),
              formRow('Date of Last Use:', 'Last_Use_Date'),
              checkboxRow('Classification:', [
                { text: 'User', tag: 'Is_User' },
                { text: 'Dealer', tag: 'Is_Dealer' },
                { text: 'Both', tag: 'Is_Both' },
                { text: 'N/A', tag: 'Not_Applicable' },
              ]),
            ],
          }),

          // ========== SECTION IV: SOCIO-ECONOMIC BACKGROUND ==========
          sectionHeader('IV. SOCIO-ECONOMIC BACKGROUND'),

          subHeader('A. Family Composition'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              checkboxRow('Family Type:', [
                { text: 'Nuclear', tag: 'Family_Type_Nuclear' },
                { text: 'Extended', tag: 'Family_Type_Extended' },
              ]),
              formRow('Living With:', 'Living_With'),
              formRow('Number of Children:', 'Children_Count'),
              formRow('Older Siblings:', 'Siblings_Older'),
              formRow('Younger Siblings:', 'Siblings_Younger'),
            ],
          }),

          subHeader('B. Family History'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              formRow('Parents Status:', 'Parents_Status'),
              formRow('Relationship with Parents:', 'Parents_Relationship'),
              formRow('Parents Criminal History:', 'Parents_Criminal_History'),
              formRow('Siblings Criminal History:', 'Siblings_Criminal_History'),
            ],
          }),

          subHeader('C. Family Support'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              formRow('Visit Frequency:', 'Visit_Frequency'),
              checkboxRow('Will Provide Housing:', [
                { text: 'Yes', tag: 'Will_Provide_Housing' },
                { text: 'No', tag: 'Will_Not_Provide_Housing' },
              ]),
              formRow('Support Description:', 'Support_Description'),
            ],
          }),

          subHeader('D. Community'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              checkboxRow('Community Acceptability:', [
                { text: 'Acceptable', tag: 'Community_Acceptable' },
                { text: 'Not Acceptable', tag: 'Community_Not_Acceptable' },
              ]),
              formRow('Community Remarks:', 'Community_Remarks'),
            ],
          }),

          subHeader('E. Residential History'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              formRow('Place of Stay:', 'Place_Of_Stay'),
              formRow('Residential Stability:', 'Residential_Stability'),
            ],
          }),

          subHeader('F. Well-Being'),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              formRow('Health Status:', 'Health_Status'),
              formRow('Family Relations:', 'Family_Relations'),
            ],
          }),

          // Page break before Section V
          new Paragraph({
            children: [new PageBreak()],
          }),

          // ========== SECTION V: ANALYSIS AND EVALUATION ==========
          sectionHeader('V. ANALYSIS AND EVALUATION'),

          new Paragraph({
            children: [new TextRun({ text: 'Circumstances:', bold: true, size: 20 })],
            spacing: { before: 100 },
          }),
          new Paragraph({
            children: [new TextRun({ text: '{Circumstances}', size: 20 })],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [new TextRun({ text: 'Needs:', bold: true, size: 20 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: '{Needs}', size: 20 })],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [new TextRun({ text: 'Attitude:', bold: true, size: 20 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: '{Attitude}', size: 20 })],
            spacing: { after: 200 },
          }),

          new Paragraph({
            children: [new TextRun({ text: 'Recommendations:', bold: true, size: 20 })],
          }),
          new Paragraph({
            children: [new TextRun({ text: '{Recommendations}', size: 20 })],
            spacing: { after: 400 },
          }),

          // ========== SIGNATURES ==========
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  // Prepared By
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Prepared by:', bold: true, size: 20 })],
                      }),
                      new Paragraph({ spacing: { before: 400 } }),
                      new Paragraph({
                        children: [new TextRun({ text: '_________________________________', size: 20 })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '{Prepared_By_Name}', bold: true, size: 20 })],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '{Prepared_By_Designation}', size: 18 })],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: 'Date: {Prepared_By_Date}', size: 18 })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders: noBorders(),
                  }),
                  // Reviewed By
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: 'Reviewed by:', bold: true, size: 20 })],
                      }),
                      new Paragraph({ spacing: { before: 400 } }),
                      new Paragraph({
                        children: [new TextRun({ text: '_________________________________', size: 20 })],
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '{Reviewed_By_Name}', bold: true, size: 20 })],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: '{Reviewed_By_Designation}', size: 18 })],
                        alignment: AlignmentType.CENTER,
                      }),
                      new Paragraph({
                        children: [new TextRun({ text: 'Date: {Reviewed_By_Date}', size: 18 })],
                        alignment: AlignmentType.CENTER,
                      }),
                    ],
                    borders: noBorders(),
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  // Generate and save
  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.join(process.cwd(), 'templates', 'PSIR_NEW.docx');

  fs.writeFileSync(outputPath, buffer);
  console.log(`Template created successfully at: ${outputPath}`);
  console.log('\nTemplate includes all tags from buildTemplateData.ts');
}

createTemplate().catch(console.error);
