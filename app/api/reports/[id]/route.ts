import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend, frontendToPrisma } from '@/lib/prisma-converters';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/reports/[id] - Get a single report by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const prismaReport = await prisma.pSIRReport.findUnique({
      where: { id: parseInt(id) },
    });

    if (!prismaReport) {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    // Convert to frontend format
    const report = prismaToFrontend(prismaReport);

    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

// PUT /api/reports/[id] - Update a report
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Convert frontend data to Prisma format
    const prismaData = frontendToPrisma(body);

    // Remove reportNumber from update data - it should never change after creation
    const { reportNumber, ...updateData } = prismaData;

    // Update report with new data
    const prismaReport = await prisma.pSIRReport.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    // Convert back to frontend format
    const report = prismaToFrontend(prismaReport);

    return NextResponse.json({
      success: true,
      data: report,
      message: 'Report updated successfully',
    });
  } catch (error) {
    console.error('Error updating report:', error);

    // Handle record not found error
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

// DELETE /api/reports/[id] - Delete a report
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Delete report
    await prisma.pSIRReport.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting report:', error);

    // Handle record not found error
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete report' },
      { status: 500 }
    );
  }
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
