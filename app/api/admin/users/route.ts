import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { getAdminSession, forbidden } from '@/lib/auth/server';
import { buildInviteLink, issueInviteToken } from '@/lib/auth/invite';
import { adminUserSelect, toPublicUser } from '@/lib/auth/users';

const createSchema = z.object({
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9._-]{3,32}$/, 'Username: 3-32 chars, letters/digits/._-'),
  name: z.string().trim().min(2).max(120),
  officeId: z.number().int().positive(),
  role: z.enum(['ADMIN', 'OFFICER']),
});

// GET /api/admin/users - all users
export async function GET() {
  if (!(await getAdminSession())) return forbidden();

  const users = await prisma.user.findMany({
    orderBy: [{ office: { code: 'asc' } }, { name: 'asc' }],
    select: adminUserSelect,
  });

  return NextResponse.json({ success: true, data: users.map(toPublicUser) });
}

// POST /api/admin/users - create a user and return a one-time invite link
export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return forbidden();

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
  }

  const office = await prisma.office.findUnique({ where: { id: parsed.data.officeId } });
  if (!office || !office.isActive) {
    return NextResponse.json({ success: false, error: 'Office not found or inactive' }, { status: 400 });
  }

  try {
    const created = await prisma.user.create({
      data: { ...parsed.data, passwordHash: null },
      select: adminUserSelect,
    });
    const { token, expiresAt } = await issueInviteToken(created.id);

    return NextResponse.json(
      {
        success: true,
        data: {
          user: toPublicUser({ ...created, inviteExpiresAt: expiresAt }),
          inviteLink: buildInviteLink(request.nextUrl.origin, token),
          expiresAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ success: false, error: 'Username already exists' }, { status: 409 });
    }
    console.error('Create user failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}
