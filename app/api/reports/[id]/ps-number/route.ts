import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getSession, unauthorized } from '@/lib/auth/server';
import { findScopedReport } from '@/lib/reports/access';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const schema = z.object({
  psNumber: z.string().trim().min(1, 'PS No. is required').max(64),
});

// PATCH /api/reports/[id]/ps-number - set the probation supervision docket number (PS No.)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const { id } = await params;
    const existing = await findScopedReport(id, session);
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Report not found' }, { status: 404 });
    }

    const parsed = schema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const updated = await prisma.pSIRReport.update({
      where: { id: existing.id },
      data: { psNumber: parsed.data.psNumber, lastModifiedBy: session.name },
      select: { psNumber: true },
    });

    return NextResponse.json({ success: true, data: { psNumber: updated.psNumber } });
  } catch (error) {
    console.error('Error saving PS number:', error);
    return NextResponse.json({ success: false, error: 'Failed to save PS No.' }, { status: 500 });
  }
}
