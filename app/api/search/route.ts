import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, officeScope, unauthorized } from '@/lib/auth/server';

// GET /api/search - Search reports in the user's office
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query && !status) {
      return NextResponse.json({ success: true, data: [], message: 'Please provide a search query' });
    }

    const where: Record<string, unknown> = {
      ...officeScope(session, searchParams.get('officeId')),
    };

    if (query) {
      where.OR = [
        { reportNumber: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { firstName: { contains: query, mode: 'insensitive' } },
        { middleName: { contains: query, mode: 'insensitive' } },
        { alias: { contains: query, mode: 'insensitive' } },
        { presentOffenseChargedWith: { contains: query, mode: 'insensitive' } },
        { presentOffenseConvictedOf: { contains: query, mode: 'insensitive' } },
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

    return NextResponse.json({ success: true, data: reports, count: reports.length });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 });
  }
}
