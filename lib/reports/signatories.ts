import prisma from '@/lib/prisma';

function normalizeName(value: string | null | undefined): string {
  return (value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Match the free-text "Prepared by" / "Reviewed by" names against users of the
 * office so reports carry a stable user link (preparedById / reviewedById).
 * The printed name columns are kept as-is; the link is additive.
 */
export async function resolveSignatoryIds(
  officeId: number,
  preparedByName: string | null | undefined,
  reviewedByName: string | null | undefined
): Promise<{ preparedById: number | null; reviewedById: number | null }> {
  const wanted = [normalizeName(preparedByName), normalizeName(reviewedByName)].filter(Boolean);
  if (wanted.length === 0) return { preparedById: null, reviewedById: null };

  const users = await prisma.user.findMany({
    where: { officeId, isActive: true },
    select: { id: true, name: true },
  });

  const byName = new Map(users.map((user) => [normalizeName(user.name), user.id]));

  return {
    preparedById: byName.get(normalizeName(preparedByName)) ?? null,
    reviewedById: byName.get(normalizeName(reviewedByName)) ?? null,
  };
}

/** Active user names of an office, sorted, for signatory dropdowns. */
export async function officeUserNames(officeId: number): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { officeId, isActive: true },
    select: { name: true },
    orderBy: { name: 'asc' },
  });
  return users.map((user) => user.name);
}

/** Case-insensitive union of lists, sorted. */
export function mergeNames(...lists: Array<Array<string | null | undefined>>): string[] {
  const unique = new Map<string, string>();
  for (const list of lists) {
    for (const raw of list) {
      const value = (raw ?? '').trim().replace(/\s+/g, ' ');
      if (!value) continue;
      if (!unique.has(value.toLowerCase())) unique.set(value.toLowerCase(), value);
    }
  }
  return Array.from(unique.values()).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}
