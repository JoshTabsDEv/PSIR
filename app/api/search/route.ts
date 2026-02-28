import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { prismaToFrontend } from '@/lib/prisma-converters';

// GET /api/search - Search reports
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query && !status) {
      return NextResponse.json({
        success: true,
        data: [],
        message: 'Please provide a search query',
      });
    }

    // Build Prisma where clause
    const where: Record<string, unknown> = {};

    if (query) {
      where.OR = [
        { reportNumber: { contains: query } },
        { lastName: { contains: query } },
        { firstName: { contains: query } },
        { middleName: { contains: query } },
        { alias: { contains: query } },
        { presentOffenseChargedWith: { contains: query } },
        { presentOffenseConvictedOf: { contains: query } },
      ];
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const prismaReports = await prisma.pSIRReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        reportNumber: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastName: true,
        firstName: true,
        middleName: true,
        presentOffenseChargedWith: true,
        presentOffenseConvictedOf: true,
      },
    });

    // Convert to frontend format (partial conversion for search results)
    const reports = prismaReports.map((report) => ({
      _id: report.id.toString(),
      reportNumber: report.reportNumber,
      status: report.status,
      createdAt: report.createdAt,
      updatedAt: report.updatedAt,
      identifyingData: {
        lastName: report.lastName,
        firstName: report.firstName,
        middleName: report.middleName || '',
      },
      criminalHistory: {
        presentOffense: {
          chargedWith: report.presentOffenseChargedWith || '',
          convictedOf: report.presentOffenseConvictedOf || '',
        },
      },
    }));

    return NextResponse.json({
      success: true,
      data: reports,
      count: reports.length,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}
