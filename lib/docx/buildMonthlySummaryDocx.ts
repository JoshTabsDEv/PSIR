import {
  Document,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  AlignmentType,
  BorderStyle,
  ShadingType,
  WidthType,
  Packer,
  TableLayoutType,
  VerticalAlignTable,
} from 'docx';
import type { PSIRReport } from '@/types/psir';
import { formatFullName } from '@/lib/utils/form-helpers';
import { formatDateShort } from '@/lib/utils/date-formatters';

// Column widths in twips (total ~9360 for letter with 1" margins)
const COL_WIDTHS = {
  reportNumber: 1200,
  name: 2400,
  address: 1800,
  dateOrder: 1200,
  typeOfReport: 900,
  dateSubmitted: 1860,
};

const HEADER_BG = '1e293b';
const ALT_ROW_BG = 'f8fafc';
const CELL_PADDING = {
  top: 80,
  bottom: 80,
  left: 120,
  right: 120,
};

function getAddress(report: PSIRReport): string {
  return report.identifyingData.presentAddress || report.identifyingData.permanentAddress || '';
}

function getDateOrder(report: PSIRReport): string {
  return formatDateShort(report.criminalHistory.presentOffense?.convictedDate) || '';
}

function getDateSubmitted(report: PSIRReport): string {
  return formatDateShort(report.analysisEvaluation?.preparedBy?.date) || '';
}

function createCellBorders() {
  const border = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: 'cbd5e1',
  };
  return {
    top: border,
    bottom: border,
    left: border,
    right: border,
  };
}

function createHeaderCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.SOLID, color: HEADER_BG, fill: HEADER_BG },
    verticalAlign: VerticalAlignTable.CENTER,
    margins: CELL_PADDING,
    borders: createCellBorders(),
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 0, before: 0 },
        children: [
          new TextRun({
            text,
            bold: true,
            size: 18, // 9pt
            color: 'ffffff',
            font: 'Calibri',
          }),
        ],
      }),
    ],
  });
}

function createDataCell(text: string, width: number, isAltRow: boolean): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: isAltRow
      ? { type: ShadingType.SOLID, color: ALT_ROW_BG, fill: ALT_ROW_BG }
      : undefined,
    verticalAlign: VerticalAlignTable.CENTER,
    margins: CELL_PADDING,
    borders: createCellBorders(),
    children: [
      new Paragraph({
        spacing: { after: 0, before: 0 },
        children: [
          new TextRun({
            text,
            size: 20, // 10pt
            font: 'Calibri',
          }),
        ],
      }),
    ],
  });
}

function createHeaderRow(): TableRow {
  return new TableRow({
    tableHeader: true,
    children: [
      createHeaderCell('Report Number', COL_WIDTHS.reportNumber),
      createHeaderCell('Name of Petitioner', COL_WIDTHS.name),
      createHeaderCell('Address', COL_WIDTHS.address),
      createHeaderCell('Date Order', COL_WIDTHS.dateOrder),
      createHeaderCell('Type of Report', COL_WIDTHS.typeOfReport),
      createHeaderCell('Date Submitted to Court', COL_WIDTHS.dateSubmitted),
    ],
  });
}

function createDataRow(report: PSIRReport, index: number): TableRow {
  const isAltRow = index % 2 === 1;
  const fullName = formatFullName(
    report.identifyingData.lastName,
    report.identifyingData.firstName,
    report.identifyingData.middleName || undefined
  );

  return new TableRow({
    children: [
      createDataCell(report.reportNumber, COL_WIDTHS.reportNumber, isAltRow),
      createDataCell(fullName, COL_WIDTHS.name, isAltRow),
      createDataCell(getAddress(report), COL_WIDTHS.address, isAltRow),
      createDataCell(getDateOrder(report), COL_WIDTHS.dateOrder, isAltRow),
      createDataCell('PSIR', COL_WIDTHS.typeOfReport, isAltRow),
      createDataCell(getDateSubmitted(report), COL_WIDTHS.dateSubmitted, isAltRow),
    ],
  });
}

function createEmptyRow(): TableRow {
  const totalWidth = Object.values(COL_WIDTHS).reduce((sum, w) => sum + w, 0);
  return new TableRow({
    children: [
      new TableCell({
        columnSpan: 6,
        width: { size: totalWidth, type: WidthType.DXA },
        verticalAlign: VerticalAlignTable.CENTER,
        margins: { top: 200, bottom: 200, left: 120, right: 120 },
        borders: createCellBorders(),
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({
                text: 'No reports for this period',
                italics: true,
                size: 20,
                color: '94a3b8',
                font: 'Calibri',
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

export async function buildMonthlySummaryDocx(
  reports: PSIRReport[],
  month: string,
  year: string
): Promise<Buffer> {
  const rows: TableRow[] = [createHeaderRow()];

  if (reports.length === 0) {
    rows.push(createEmptyRow());
  } else {
    reports.forEach((report, index) => {
      rows.push(createDataRow(report, index));
    });
  }

  const table = new Table({
    rows,
    width: { size: 9360, type: WidthType.DXA },
    layout: TableLayoutType.FIXED,
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,   // 1 inch
              bottom: 1440,
              left: 1440,
              right: 1440,
            },
          },
        },
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'MONTHLY SUMMARY OF PSIR REPORTS',
                bold: true,
                size: 28, // 14pt
                font: 'Calibri',
              }),
            ],
          }),
          // Subheader
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: `For the month of ${month} ${year}`,
                size: 22, // 11pt
                font: 'Calibri',
              }),
            ],
          }),
          // Report count
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `Total: ${reports.length} report(s)`,
                size: 20, // 10pt
                color: '64748b',
                font: 'Calibri',
              }),
            ],
          }),
          // Table
          table,
          // Spacer
          new Paragraph({ spacing: { after: 360 }, children: [] }),
          // Footer
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Generated on ${formatDateShort(new Date())}`,
                size: 18, // 9pt
                color: '94a3b8',
                font: 'Calibri',
              }),
            ],
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
