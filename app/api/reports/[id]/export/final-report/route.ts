import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend } from '@/lib/prisma-converters';
import { getSession, unauthorized } from '@/lib/auth/server';
import { findScopedReport } from '@/lib/reports/access';
import { buildFinalReportData } from '@/lib/docx/buildFinalReportData';
import { renderPSIRDocx } from '@/lib/docx/renderPSIRDocx';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/reports/[id]/export/final-report - probation Final Report (DOCX)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const prismaReport = await findScopedReport(id, session);
    if (!prismaReport) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    const office = await prisma.office.findUnique({
      where: { id: prismaReport.officeId },
      select: { name: true },
    });

    const report = prismaToFrontend(prismaReport);
    const buffer = renderPSIRDocx(buildFinalReportData(report, office), {
      templatePath: 'templates/FINAL_REPORT.docx',
    });

    const safe = (value: string) => value.replace(/[<>:"/\\|?*]/g, '').trim() || 'Unknown';
    const filename = `FR - ${safe(report.identifyingData.lastName)}, ${safe(report.identifyingData.firstName)}.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error exporting final report:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate Final Report' }, { status: 500 });
  }
}
