import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getAdminSession, forbidden } from '@/lib/auth/server';

const createSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{2,8}$/, 'Code must be 2-8 letters or digits'),
  name: z.string().trim().min(2).max(120),
  region: z.string().trim().max(80).optional().nullable(),
  address: z.string().trim().max(200).optional().nullable(),
});

// GET /api/admin/offices - all offices with user/report counts
export async function GET() {
  if (!(await getAdminSession())) return forbidden();

  const offices = await prisma.office.findMany({
    orderBy: { code: 'asc' },
    include: { _count: { select: { users: true, reports: true } } },
  });

  return NextResponse.json({ success: true, data: offices });
}

// POST /api/admin/offices - create an office
export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return forbidden();

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
  }

  try {
    const office = await prisma.office.create({
      data: {
        code: parsed.data.code,
        name: parsed.data.name,
        region: parsed.data.region || null,
        address: parsed.data.address || null,
      },
      include: { _count: { select: { users: true, reports: true } } },
    });
    return NextResponse.json({ success: true, data: office }, { status: 201 });
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Office code already exists' }, { status: 409 });
    }
    console.error('Create office failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to create office' }, { status: 500 });
  }
}
