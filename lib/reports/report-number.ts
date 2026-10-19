import type { Prisma } from '@prisma/client';

export const REPORT_NUMBER_PREFIX = 'PI';

/**
 * Allocate the next report number for an office, e.g. PI-TAG-2026-00001.
 * Call inside the same transaction that creates the report so the counter
 * increment and the insert commit (or roll back) together.
 */
export async function nextReportNumber(
  tx: Prisma.TransactionClient,
  officeId: number,
  officeCode: string,
  now: Date = new Date()
): Promise<string> {
  const year = now.getFullYear();

  const counter = await tx.reportCounter.upsert({
    where: { officeId_year: { officeId, year } },
    create: { officeId, year, lastNumber: 1 },
    update: { lastNumber: { increment: 1 } },
  });

  return `${REPORT_NUMBER_PREFIX}-${officeCode}-${year}-${String(counter.lastNumber).padStart(5, '0')}`;
}
