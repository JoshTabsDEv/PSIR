import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, officeScope, unauthorized } from '@/lib/auth/server';

// GET /api/reports/oldest - Oldest report by date received, in the user's office
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const oldestReport = await prisma.pSIRReport.findFirst({
      where: officeScope(session, request.nextUrl.searchParams.get('officeId')),
      orderBy: { dateReceived: 'asc' },
      select: {
        investigationDocketNumber: true,
        firstName: true,
        lastName: true,
        dateReceived: true,
        status: true,
      },
    });

    if (!oldestReport) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({
      success: true,
      data: {
        reportNumber: oldestReport.investigationDocketNumber,
        petitionerName: `${oldestReport.firstName} ${oldestReport.lastName}`,
        createdAt: oldestReport.dateReceived,
        status: oldestReport.status,
      },
    });
  } catch (error) {
    console.error('Error fetching oldest report:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch oldest report' }, { status: 500 });
  }
}
