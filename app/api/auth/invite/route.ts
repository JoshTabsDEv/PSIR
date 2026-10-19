import { NextRequest, NextResponse } from 'next/server';
import { findUserByInviteToken } from '@/lib/auth/invite';

// GET /api/auth/invite?token=... - public: tell the set-password page who the link is for
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') || '';
  const user = await findUserByInviteToken(token);

  if (!user || !user.isActive) {
    return NextResponse.json({ success: false, error: 'This link is invalid or has expired' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: { username: user.username, name: user.name, office: user.office.name, hasPassword: Boolean(user.passwordHash) },
  });
}
