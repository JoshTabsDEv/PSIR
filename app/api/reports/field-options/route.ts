import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function normalizeOptionValue(value: string | null | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, ' ');
}

function dedupeAndSort(values: Array<string | null | undefined>): string[] {
  const uniqueValues = new Map<string, string>();

  for (const value of values) {
    const normalizedValue = normalizeOptionValue(value);
    if (!normalizedValue) continue;

    uniqueValues.set(normalizedValue.toLowerCase(), normalizedValue);
  }

  return Array.from(uniqueValues.values()).sort((left, right) =>
    left.localeCompare(right, undefined, { sensitivity: 'base' })
  );
}

export async function GET() {
  try {
    const reports = await prisma.pSIRReport.findMany({
      select: {
        probationPeriod: true,
        communityServiceHours: true,
        preparedByName: true,
        reviewedByName: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        probationPeriods: dedupeAndSort(reports.map((report) => report.probationPeriod)),
        communityServiceValues: dedupeAndSort(reports.map((report) => report.communityServiceHours)),
        preparedByNames: dedupeAndSort(reports.map((report) => report.preparedByName)),
        reviewedByNames: dedupeAndSort(reports.map((report) => report.reviewedByName)),
      },
    });
  } catch (error) {
    console.error('Failed to fetch report field options:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch report field options' },
      { status: 500 }
    );
  }
}
