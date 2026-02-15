import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import prisma from '@/lib/prisma';
import { prismaToFrontend } from '@/lib/prisma-converters';
import { PSIRDocument } from '@/lib/generators/pdf-template';
import { generateExportFilename } from '@/lib/utils/form-helpers';
import React from 'react';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/reports/[id]/export/pdf - Export report as PDF
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const prismaReport = await prisma.pSIRReport.findUnique({
      where: { id: parseInt(id) },
    });

    if (!prismaReport) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Convert to frontend format
    const report = prismaToFrontend(prismaReport);

    // Generate PDF using React-PDF
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(PSIRDocument, { report });
    const pdfBuffer = await (renderToBuffer as any)(element);

    // Generate filename
    const filename = generateExportFilename(report.reportNumber, 'pdf');

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF as response
    return new NextResponse(uint8Array, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
