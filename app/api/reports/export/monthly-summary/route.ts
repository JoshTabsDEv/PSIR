import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend } from '@/lib/prisma-converters';
import { buildMonthlySummaryDocx } from '@/lib/docx/buildMonthlySummaryDocx';

const MONTH_NAMES = [
  'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER',
];

// GET /api/reports/export/monthly-summary?month=3&year=2026
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
    const startDate = new Date(year, month - 1, 1); // First day of month
    const endDate = new Date(year, month, 0, 23, 59, 59, 999); // Last day of month

    // Query reports for the month
    const prismaReports = await prisma.pSIRReport.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Convert to frontend format
    const reports = prismaReports.map(prismaToFrontend);

    // Generate month name
    const monthName = MONTH_NAMES[month - 1];

    // Build DOCX
    const buffer = await buildMonthlySummaryDocx(reports, monthName, yearParam);

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const uint8Array = new Uint8Array(buffer);

    const filename = `PSIR-Monthly-Summary-${monthName}-${year}.docx`;

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
    console.error('Error generating monthly summary:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate monthly summary',
        details: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : String(error))
          : undefined,
      },
      { status: 500 }
    );
  }
}
