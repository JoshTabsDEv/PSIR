import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/reports/oldest - Get the oldest report (by createdAt)
export async function GET() {
  try {
    console.log('GET /api/reports/oldest - Starting query');
    const oldestReport = await prisma.pSIRReport.findFirst({
      orderBy: { dateReceived: 'asc' },
      select: {
        investigationDocketNumber: true,
        firstName: true,
        lastName: true,
        dateReceived: true,
      },
    });

    console.log('GET /api/reports/oldest - Query result:', oldestReport ? 'found' : 'not found');

    if (!oldestReport) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        reportNumber: oldestReport.investigationDocketNumber,
        petitionerName: `${oldestReport.firstName} ${oldestReport.lastName}`,
        createdAt: oldestReport.dateReceived,
      },
    });
  } catch (error) {
    console.error('Error fetching oldest report:', error instanceof Error ? error.message : String(error));
    console.error('Full error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch oldest report', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
