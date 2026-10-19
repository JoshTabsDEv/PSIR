import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend } from '@/lib/prisma-converters';
import { getSession, unauthorized } from '@/lib/auth/server';
import { findScopedReport } from '@/lib/reports/access';
import { buildClientProfileData } from '@/lib/xlsx/buildClientProfileData';
import { renderXlsxTemplate } from '@/lib/xlsx/renderXlsxTemplate';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/reports/[id]/export/client-profile - Client's Profile (PPA Form 12) as XLSX
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
    const buffer = renderXlsxTemplate(buildClientProfileData(report, office), {
      templatePath: 'templates/CLIENT_PROFILE.xlsx',
    });

    const safe = (value: string) => value.replace(/[<>:"/\\|?*]/g, '').trim() || 'Unknown';
    const filename = `CP - ${safe(report.identifyingData.lastName)}, ${safe(report.identifyingData.firstName)}.xlsx`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error exporting client profile:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate Client Profile' }, { status: 500 });
  }
}
