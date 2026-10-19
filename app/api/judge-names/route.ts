import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, officeScope, unauthorized } from '@/lib/auth/server';
import { mergeNames } from '@/lib/reports/signatories';

// GET /api/judge-names - Judge names already used on this office's reports
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const reports = await prisma.pSIRReport.findMany({
      where: officeScope(session),
      select: { letterJudge: true, presentOffenseJudge: true },
    });

    const judgeNames = mergeNames(
      reports.map((report) => report.letterJudge),
      reports.map((report) => report.presentOffenseJudge)
    );

    return NextResponse.json({ success: true, data: judgeNames });
  } catch (error) {
    console.error('Failed to fetch judge names:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch judge names' }, { status: 500 });
  }
}
