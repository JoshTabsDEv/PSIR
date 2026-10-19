import prisma from '@/lib/prisma';
import { officeScope } from '@/lib/auth/server';
import type { SessionUser } from '@/lib/auth/session';

/**
 * Load one report the session is allowed to see. Officers only reach their
 * own office's reports; admins reach any. Returns null for bad ids too, so
 * callers can answer 404 uniformly.
 */
export async function findScopedReport(idParam: string, session: SessionUser) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  return prisma.pSIRReport.findFirst({ where: { id, ...officeScope(session) } });
}
