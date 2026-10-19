import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getAdminSession, forbidden } from '@/lib/auth/server';
import { adminUserSelect, toPublicUser } from '@/lib/auth/users';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  role: z.enum(['ADMIN', 'OFFICER']).optional(),
  officeId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

// PATCH /api/admin/users/[id] - update name/role/office/active
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getAdminSession();
  if (!session) return forbidden();

  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
  }

  // Guard rails: an admin cannot lock themselves out
  if (id === session.id && (parsed.data.isActive === false || (parsed.data.role && parsed.data.role !== 'ADMIN'))) {
    return NextResponse.json({ success: false, error: 'You cannot deactivate or demote your own account' }, { status: 400 });
  }

  if (parsed.data.officeId) {
    const office = await prisma.office.findUnique({ where: { id: parsed.data.officeId } });
    if (!office) return NextResponse.json({ success: false, error: 'Office not found' }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: adminUserSelect,
    });
    return NextResponse.json({ success: true, data: toPublicUser(user) });
  } catch (error) {
    if ((error as { code?: string }).code === 'P2025') {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    console.error('Update user failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to update user' }, { status: 500 });
  }
}
