import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend, frontendToPrisma } from '@/lib/prisma-converters';
import type { ReportFilters } from '@/types/psir';

// Generate a unique report number by checking the database
async function generateUniqueReportNumber(): Promise<string> {
  const year = new Date().getFullYear();

  // Get the highest report number for this year
  const latestReport = await prisma.pSIRReport.findFirst({
    where: {
      reportNumber: {
        startsWith: `PSIR-${year}-`,
      },
    },
    orderBy: {
      reportNumber: 'desc',
    },
    select: {
      reportNumber: true,
    },
  });

  let nextNumber = 1;
  if (latestReport) {
    // Extract the number part from PSIR-2026-00001
    const match = latestReport.reportNumber.match(/PSIR-\d{4}-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  return `PSIR-${year}-${nextNumber.toString().padStart(5, '0')}`;
}

// GET /api/reports - List all reports with pagination and filtering
export async function GET(request: NextRequest) {
  try {
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

    // Build where clause for Prisma
    const where: Record<string, unknown> = {};

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

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Execute query
    const [prismaReports, total] = await Promise.all([
      prisma.pSIRReport.findMany({
        where,
        orderBy: {
          [filters.sortBy || 'createdAt']: filters.sortOrder || 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.pSIRReport.count({ where }),
    ]);

    // Convert Prisma reports to frontend format
    const reports = prismaReports.map(prismaToFrontend);

    return NextResponse.json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

// POST /api/reports - Create a new report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Generate unique report number server-side
    const reportNumber = await generateUniqueReportNumber();

    // Convert frontend data to Prisma format
    const prismaData = frontendToPrisma(body);

    // Override with server-generated report number
    prismaData.reportNumber = reportNumber;

    // Create new report
    const prismaReport = await prisma.pSIRReport.create({
      data: prismaData,
    });

    // Convert back to frontend format
    const report = prismaToFrontend(prismaReport);

    return NextResponse.json(
      { success: true, data: report, message: 'Report created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating report:', error);

    // Handle unique constraint error (duplicate report number)
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Report number already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
