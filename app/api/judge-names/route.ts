import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function normalizeJudgeName(judgeName: string | null): string {
  return (judgeName || '').trim().replace(/\s+/g, ' ');
}

export async function GET() {
  try {
    const reports = await prisma.pSIRReport.findMany({
      select: {
        letterJudge: true,
        presentOffenseJudge: true,
      },
    });

    const uniqueJudgeNames = new Map<string, string>();

    for (const report of reports) {
      for (const rawJudgeName of [report.letterJudge, report.presentOffenseJudge]) {
        const judgeName = normalizeJudgeName(rawJudgeName);
        if (!judgeName) continue;

        uniqueJudgeNames.set(judgeName.toLowerCase(), judgeName);
      }
    }

    const judgeNames = Array.from(uniqueJudgeNames.values()).sort((left, right) =>
      left.localeCompare(right, undefined, { sensitivity: 'base' })
    );

    return NextResponse.json({
      success: true,
      data: judgeNames,
    });
  } catch (error) {
    console.error('Failed to fetch judge names:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch judge names' },
      { status: 500 }
    );
  }
}
