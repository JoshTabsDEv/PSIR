import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend, frontendToPrisma } from '@/lib/prisma-converters';
import { getSession, officeScope, unauthorized } from '@/lib/auth/server';
import { nextReportNumber } from '@/lib/reports/report-number';
import { resolveSignatoryIds } from '@/lib/reports/signatories';
import type { ReportFilters } from '@/types/psir';

// GET /api/reports - List reports (scoped to the user's office) with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const searchParams = request.nextUrl.searchParams;
    const filters: ReportFilters = {
      search: searchParams.get('search') || undefined,
      status: (searchParams.get('status') as 'draft' | 'completed' | 'all') || 'all',
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      sortBy: (searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'reportNumber') || 'createdAt',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '10'),
    };

    // Office scope first; filters can narrow it, never widen it
    const where: Record<string, unknown> = {
      ...officeScope(session, searchParams.get('officeId')),
    };

    if (filters.status && filters.status !== 'all') {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        { reportNumber: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { presentOffenseChargedWith: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        (where.createdAt as Record<string, Date>).gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        (where.createdAt as Record<string, Date>).lte = new Date(filters.dateTo);
      }
    }

    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const [prismaReports, total] = await Promise.all([
      prisma.pSIRReport.findMany({
        where,
        orderBy: { [filters.sortBy || 'createdAt']: filters.sortOrder || 'desc' },
        skip,
        take: limit,
      }),
      prisma.pSIRReport.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: prismaReports.map(prismaToFrontend),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reports' }, { status: 500 });
  }
}

// POST /api/reports - Create a new report in the user's office
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await request.json();

    const prismaData = frontendToPrisma(body);
    prismaData.lastModifiedBy = session.name;

    // Link "Prepared by" / "Reviewed by" to office users when the names match
    const signatories = await resolveSignatoryIds(
      session.officeId,
      prismaData.preparedByName,
      prismaData.reviewedByName
    );

    // Allocate the report number and insert atomically so concurrent saves never collide
    const prismaReport = await prisma.$transaction(async (tx) => {
      const reportNumber = await nextReportNumber(tx, session.officeId, session.officeCode);
      return tx.pSIRReport.create({
        data: { ...prismaData, ...signatories, reportNumber, officeId: session.officeId },
      });
    });

    return NextResponse.json(
      { success: true, data: prismaToFrontend(prismaReport), message: 'Report created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating report:', error);

    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Report number already exists' }, { status: 409 });
    }

    return NextResponse.json({ success: false, error: 'Failed to create report' }, { status: 500 });
  }
}
