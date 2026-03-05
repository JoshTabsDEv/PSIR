import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend } from '@/lib/prisma-converters';
import type { MonthlyReportData } from '@/types/psir';

// GET /api/reports/stats - Get dashboard statistics
export async function GET() {
  try {
    const [totalReports, draftReports, completedReports, prismaRecentReports] = await Promise.all([
      prisma.pSIRReport.count(),
      prisma.pSIRReport.count({ where: { status: 'draft' } }),
      prisma.pSIRReport.count({ where: { status: 'completed' } }),
      prisma.pSIRReport.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Convert recent reports to frontend format
    const recentReports = prismaRecentReports.map(prismaToFrontend);

    // Generate monthly data for the last 12 months
    const monthlyData = await getMonthlyData();

    return NextResponse.json({
      success: true,
      data: {
        totalReports,
        draftReports,
        completedReports,
        recentReports,
        monthlyData,
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}

async function getMonthlyData(): Promise<MonthlyReportData[]> {
  const now = new Date();
  const months: MonthlyReportData[] = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    const [total, completed] = await Promise.all([
      prisma.pSIRReport.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextMonth,
          },
        },
      }),
      prisma.pSIRReport.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextMonth,
          },
          status: 'completed',
        },
      }),
    ]);

    months.push({
      month: monthNames[date.getMonth()],
      total,
      completed,
      draft: total - completed,
    });
  }

  return months;
}
