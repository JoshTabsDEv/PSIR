import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend } from '@/lib/prisma-converters';
import { renderPSIRDocx } from '@/lib/docx/renderPSIRDocx';
import { buildTemplateData } from '@/lib/docx/buildTemplateData';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/reports/[id]/export/docx - Export report as DOCX using template
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Fetch report from database
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

    // Build template data from report
    const templateData = buildTemplateData(report);

    // Render DOCX using template
    let buffer: Buffer;
    try {
      buffer = renderPSIRDocx(templateData);
    } catch (templateError) {
      console.error('Template rendering error:', templateError);

      // Return specific error message for debugging
      const errorMessage = templateError instanceof Error
        ? templateError.message
        : 'Unknown template error';

      return NextResponse.json(
        {
          success: false,
          error: 'Failed to render DOCX template',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
        { status: 500 }
      );
    }

    // Generate filename: PSIR - Lastname, FirstName.docx
    const lastName = (report.identifyingData.lastName || 'Unknown').trim();
    const firstName = (report.identifyingData.firstName || 'Unknown').trim();
    const safe = (value: string) => value.replace(/[<>:"/\\|?*]/g, '');
    const filename = `PSIR - ${safe(lastName)}, ${safe(firstName)}.docx`;

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(buffer);

    // Return DOCX as downloadable response
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error exporting DOCX:', error);

    // Handle Prisma errors
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate DOCX' },
      { status: 500 }
    );
  }
}
