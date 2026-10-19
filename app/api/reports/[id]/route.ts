import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend, frontendToPrisma } from '@/lib/prisma-converters';
import { getSession, unauthorized } from '@/lib/auth/server';
import { findScopedReport } from '@/lib/reports/access';
import { resolveSignatoryIds } from '@/lib/reports/signatories';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function notFound() {
  return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
}

// GET /api/reports/[id] - Get a single report by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const prismaReport = await findScopedReport(id, session);
    if (!prismaReport) return notFound();

    return NextResponse.json({ success: true, data: prismaToFrontend(prismaReport) });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch report' }, { status: 500 });
  }
}

// PUT /api/reports/[id] - Update a report
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const existing = await findScopedReport(id, session);
    if (!existing) return notFound();

    const body = await request.json();
    const prismaData = frontendToPrisma(body);
    prismaData.lastModifiedBy = session.name;

    // reportNumber and officeId are fixed at creation; never accept them from the client
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { reportNumber, officeId, ...updateData } = prismaData;

    const signatories = await resolveSignatoryIds(
      existing.officeId,
      updateData.preparedByName,
      updateData.reviewedByName
    );

    const prismaReport = await prisma.pSIRReport.update({
      where: { id: existing.id },
      data: { ...updateData, ...signatories },
    });

    return NextResponse.json({
      success: true,
      data: prismaToFrontend(prismaReport),
      message: 'Report updated successfully',
    });
  } catch (error) {
    console.error('Error updating report:', error);
    if ((error as { code?: string }).code === 'P2025') return notFound();
    return NextResponse.json({ success: false, error: 'Failed to update report' }, { status: 500 });
  }
}

// DELETE /api/reports/[id] - Delete a report
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const existing = await findScopedReport(id, session);
    if (!existing) return notFound();

    await prisma.pSIRReport.delete({ where: { id: existing.id } });

    return NextResponse.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    if ((error as { code?: string }).code === 'P2025') return notFound();
    return NextResponse.json({ success: false, error: 'Failed to delete report' }, { status: 500 });
  }
}

// PATCH /api/reports/[id] - Mark report as completed
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const existing = await findScopedReport(id, session);
    if (!existing) return notFound();

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
    if ((error as { code?: string }).code === 'P2025') return notFound();
    return NextResponse.json({ success: false, error: 'Failed to mark report as completed' }, { status: 500 });
  }
}
