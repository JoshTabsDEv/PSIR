import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all unique prepared by names from the database
    const preparedByNames = await prisma.pSIRReport.findMany({
      select: {
        preparedByName: true,
      },
      where: {
        preparedByName: {
          not: null,
        },
      },
      distinct: ['preparedByName'],
      orderBy: {
        preparedByName: 'asc',
      },
    });

    // Filter out null/empty values and extract just the names
    const uniqueNames = preparedByNames
      .map(item => item.preparedByName)
      .filter((name): name is string => name !== null && name.trim() !== '');

    return NextResponse.json({
      success: true,
      data: uniqueNames,
    });
  } catch (error) {
    console.error('Failed to fetch prepared by names:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch prepared by names' },
      { status: 500 }
    );
  }
}
