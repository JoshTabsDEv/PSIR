import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend } from '@/lib/prisma-converters';

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

    return NextResponse.json({
      success: true,
      data: {
        totalReports,
        draftReports,
        completedReports,
        recentReports,
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
