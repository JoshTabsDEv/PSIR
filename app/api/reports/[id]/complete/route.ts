import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend } from '@/lib/prisma-converters';
import { getSession, unauthorized } from '@/lib/auth/server';
import { findScopedReport } from '@/lib/reports/access';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/reports/[id]/complete - Mark report as completed
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const existing = await findScopedReport(id, session);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    const prismaReport = await prisma.pSIRReport.update({
      where: { id: existing.id },
      data: { status: 'completed', lastModifiedBy: session.name },
    });

    return NextResponse.json({
      success: true,
      data: prismaToFrontend(prismaReport),
      message: 'Report marked as completed',
    });
  } catch (error) {
    console.error('Error marking report as completed:', error);
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: 'Failed to mark report as completed' }, { status: 500 });
  }
}
