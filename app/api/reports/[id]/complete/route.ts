import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend } from '@/lib/prisma-converters';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/reports/[id]/complete - Mark report as completed
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Check if report exists
    const existingReport = await prisma.pSIRReport.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingReport) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Update report status to completed
    const prismaReport = await prisma.pSIRReport.update({
      where: { id: parseInt(id) },
      data: { status: 'completed' },
    });

    // Convert back to frontend format
    const report = prismaToFrontend(prismaReport);

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report marked as completed',
    });
  } catch (error) {
    console.error('Error marking report as completed:', error);

    // Handle record not found error
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to mark report as completed' },
      { status: 500 }
    );
  }
}
