import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, officeScope, unauthorized } from '@/lib/auth/server';
import { mergeNames, officeUserNames } from '@/lib/reports/signatories';

// GET /api/prepared-by/names - Officer names for export filters (office users + names on reports)
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const [reports, userNames] = await Promise.all([
      prisma.pSIRReport.findMany({
        where: { ...officeScope(session), preparedByName: { not: null } },
        select: { preparedByName: true },
        distinct: ['preparedByName'],
      }),
      officeUserNames(session.officeId),
    ]);

    return NextResponse.json({
      success: true,
      data: mergeNames(userNames, reports.map((report) => report.preparedByName)),
    });
  } catch (error) {
    console.error('Failed to fetch prepared by names:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch prepared by names' }, { status: 500 });
  }
}
