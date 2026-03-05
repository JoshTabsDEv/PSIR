import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend } from '@/lib/prisma-converters';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// PATCH /api/reports/[id]/submit - Set submitted-to-court date and auto-complete the report
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { submittedToCourtDate } = body;

        if (!submittedToCourtDate) {
            return NextResponse.json(
                { success: false, error: 'submittedToCourtDate is required' },
                { status: 400 }
            );
        }

        const date = new Date(submittedToCourtDate);
        if (isNaN(date.getTime())) {
            return NextResponse.json(
                { success: false, error: 'Invalid date format' },
                { status: 400 }
            );
        }

        const prismaReport = await prisma.pSIRReport.update({
            where: { id: parseInt(id) },
            data: {
                submittedToCourtDate: date,
                status: 'completed',
            },
        });

        const report = prismaToFrontend(prismaReport);

        return NextResponse.json({
            success: true,
            data: report,
            message: 'Report marked as submitted and completed',
        });
    } catch (error) {
        console.error('Error setting submitted-to-court date:', error);

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
