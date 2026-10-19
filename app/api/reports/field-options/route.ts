import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, officeScope, unauthorized } from '@/lib/auth/server';
import { mergeNames, officeUserNames } from '@/lib/reports/signatories';

// GET /api/reports/field-options - Autocomplete values for Section IV fields (office-scoped)
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const [reports, userNames] = await Promise.all([
      prisma.pSIRReport.findMany({
        where: officeScope(session),
        select: {
          probationPeriod: true,
          communityServiceHours: true,
          preparedByName: true,
          reviewedByName: true,
        },
      }),
      officeUserNames(session.officeId),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        probationPeriods: mergeNames(reports.map((report) => report.probationPeriod)),
        communityServiceValues: mergeNames(reports.map((report) => report.communityServiceHours)),
        // Office users first-class, plus any names already used on reports
        preparedByNames: mergeNames(userNames, reports.map((report) => report.preparedByName)),
        reviewedByNames: mergeNames(userNames, reports.map((report) => report.reviewedByName)),
      },
    });
  } catch (error) {
    console.error('Failed to fetch report field options:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch report field options' }, { status: 500 });
  }
}
