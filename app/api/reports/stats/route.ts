import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend } from '@/lib/prisma-converters';
import { getSession, officeScope, unauthorized } from '@/lib/auth/server';
import type { MonthlyReportData } from '@/types/psir';

type Scope = { officeId?: number };

// GET /api/reports/stats - Dashboard statistics for the user's office
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const scope = officeScope(session, request.nextUrl.searchParams.get('officeId'));

    const [totalReports, draftReports, completedReports, prismaRecentReports] = await Promise.all([
      prisma.pSIRReport.count({ where: scope }),
      prisma.pSIRReport.count({ where: { ...scope, status: 'draft' } }),
      prisma.pSIRReport.count({ where: { ...scope, status: 'completed' } }),
      prisma.pSIRReport.findMany({ where: scope, orderBy: { createdAt: 'desc' }, take: 5 }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalReports,
        draftReports,
        completedReports,
        recentReports: prismaRecentReports.map(prismaToFrontend),
        monthlyData: await getMonthlyData(scope),
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch statistics' }, { status: 500 });
  }
}

async function getMonthlyData(scope: Scope): Promise<MonthlyReportData[]> {
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Last 12 months, counted in parallel
  return Promise.all(
    Array.from({ length: 12 }, (_, offset) => {
      const i = 11 - offset;
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
      const range = { createdAt: { gte: date, lt: nextMonth } };

      return Promise.all([
        prisma.pSIRReport.count({ where: { ...scope, ...range } }),
        prisma.pSIRReport.count({ where: { ...scope, ...range, status: 'completed' } }),
      ]).then(([total, completed]) => ({
        month: monthNames[date.getMonth()],
        total,
        completed,
        draft: total - completed,
      }));
    })
  );
}
