import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getAdminSession, forbidden } from '@/lib/auth/server';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  region: z.string().trim().max(80).nullable().optional(),
  address: z.string().trim().max(200).nullable().optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/admin/offices/[id] - update office details or active flag (code is immutable: it is part of report numbers)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getAdminSession();
  if (!session) return forbidden();

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ success: false, error: 'Office not found' }, { status: 404 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
  }

  if (parsed.data.isActive === false && id === session.officeId) {
    return NextResponse.json({ success: false, error: 'You cannot deactivate your own office' }, { status: 400 });
  }

  try {
    const office = await prisma.office.update({
      where: { id },
      data: parsed.data,
      include: { _count: { select: { users: true, reports: true } } },
    });
    return NextResponse.json({ success: true, data: office });
  } catch (error) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ success: false, error: 'Office not found' }, { status: 404 });
    }
    console.error('Update office failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to update office' }, { status: 500 });
  }
}
