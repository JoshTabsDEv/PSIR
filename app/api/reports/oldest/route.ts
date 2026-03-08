import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/reports/oldest - Get the oldest report (by createdAt)
export async function GET() {
  try {
    const oldestReport = await prisma.pSIRReport.findFirst({
      orderBy: { dateReceived: 'asc' },
      select: {
        reportNumber: true,
        firstName: true,
        lastName: true,
        dateReceived: true,
      },
    });

    if (!oldestReport) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        reportNumber: oldestReport.reportNumber,
        petitionerName: `${oldestReport.firstName} ${oldestReport.lastName}`,
        createdAt: oldestReport.dateReceived,
      },
    });
  } catch (error) {
    console.error('Error fetching oldest report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch oldest report' },
      { status: 500 }
    );
  }
}
