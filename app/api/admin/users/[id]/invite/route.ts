import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminSession, forbidden } from '@/lib/auth/server';
import { buildInviteLink, issueInviteToken } from '@/lib/auth/invite';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/admin/users/[id]/invite - issue a fresh set-password link (invite or reset)
export async function POST(request: NextRequest, { params }: RouteParams) {
  if (!(await getAdminSession())) return forbidden();

  const id = Number((await params).id);
  const user = Number.isInteger(id) ? await prisma.user.findUnique({ where: { id } }) : null;
  if (!user) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }
  if (!user.isActive) {
    return NextResponse.json({ success: false, error: 'Activate the user before sending a link' }, { status: 400 });
  }

  const { token, expiresAt } = await issueInviteToken(user.id);
  return NextResponse.json({
    success: true,
    data: { inviteLink: buildInviteLink(request.nextUrl.origin, token), expiresAt },
  });
}
