import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend } from '@/lib/prisma-converters';
import { buildTEVData } from '@/lib/docx/buildTEVData';
import { renderTEVDocx } from '@/lib/docx/renderTEVDocx';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

// GET /api/reports/export/tev?month=3&year=2026
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get('month');
    const yearParam = searchParams.get('year');

    // Validate params
    if (!monthParam || !yearParam) {
      return NextResponse.json(
        { success: false, error: 'Both month and year query parameters are required' },
        { status: 400 }
      );
    }

    const month = parseInt(monthParam, 10);
    const year = parseInt(yearParam, 10);

    if (isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { success: false, error: 'Month must be a number between 1 and 12' },
        { status: 400 }
      );
    }

    if (isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json(
        { success: false, error: 'Year must be a valid 4-digit year' },
        { status: 400 }
      );
    }

    // Compute date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    // Query reports for the month — completed reports only
    const prismaReports = await prisma.pSIRReport.findMany({
      where: {
        status: 'completed',
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Convert to frontend format
    const reports = prismaReports.map(prismaToFrontend);

    // Build template data with default officer info
    // These defaults match the hardcoded names in the original TEV template.
    // In a future iteration these could come from query params or a settings table.
    const tevData = buildTEVData(reports, {
      officerName: 'FAITH KIRSTIE T. YAM',
      officeName: 'Tagbilaran City Parole and Probation Office',
      verifiedByName: 'CIRILO R. MARAMBA, JR.',
      certifiedByName: 'FAITH KIRSTIE T. YAM',
      verifiedByTitle: 'Chief Probation and Parole Officer',
      certifiedByTitle: 'Investigating Officer',
    });

    // Render DOCX
    const buffer = renderTEVDocx(tevData);
    const uint8Array = new Uint8Array(buffer);

    const monthName = MONTH_NAMES[month - 1];
    const filename = `TEV-${monthName}-${year}.docx`;

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error generating TEV export:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate TEV export',
        details:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.message
              : String(error)
            : undefined,
      },
      { status: 500 }
    );
  }
}
