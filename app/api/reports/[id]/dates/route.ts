import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { prismaToFrontend } from '@/lib/prisma-converters';
import { getSession, unauthorized } from '@/lib/auth/server';
import { findScopedReport } from '@/lib/reports/access';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const isoDate = z
  .string()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Invalid date')
  .nullable();

const schema = z
  .object({
    probationGrantedDate: isoDate.optional(),
    probationOrderReceivedDate: isoDate.optional(),
  })
  .refine((body) => Object.keys(body).length > 0, 'Nothing to update');

// PATCH /api/reports/[id]/dates - set probation milestone dates (null clears one)
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

    const data: { probationGrantedDate?: Date | null; probationOrderReceivedDate?: Date | null; lastModifiedBy: string } = {
      lastModifiedBy: session.name,
    };
    if (parsed.data.probationGrantedDate !== undefined) {
      data.probationGrantedDate = parsed.data.probationGrantedDate ? new Date(parsed.data.probationGrantedDate) : null;
    }
    if (parsed.data.probationOrderReceivedDate !== undefined) {
      data.probationOrderReceivedDate = parsed.data.probationOrderReceivedDate
        ? new Date(parsed.data.probationOrderReceivedDate)
        : null;
    }

    const updated = await prisma.pSIRReport.update({ where: { id: existing.id }, data });

    return NextResponse.json({ success: true, data: prismaToFrontend(updated) });
  } catch (error) {
    console.error('Error saving probation dates:', error);
    return NextResponse.json({ success: false, error: 'Failed to save date' }, { status: 500 });
  }
}
