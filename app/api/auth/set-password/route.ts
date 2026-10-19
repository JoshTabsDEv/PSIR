import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { findUserByInviteToken } from '@/lib/auth/invite';
import { hashPassword } from '@/lib/auth/password';
import { isRateLimited, recordFailedAttempt } from '@/lib/auth/rate-limit';

const schema = z.object({
  token: z.string().min(20).max(128),
  password: z.string().min(8, 'Password must be at least 8 characters').max(256),
});

// POST /api/auth/set-password - public: consume a one-time link and set the password
export async function POST(request: NextRequest) {
  const key = `set-password:${request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'}`;
  if (isRateLimited(key)) {
    return NextResponse.json({ success: false, error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 });
  }

  const user = await findUserByInviteToken(parsed.data.token);
  if (!user || !user.isActive) {
    recordFailedAttempt(key);
    return NextResponse.json({ success: false, error: 'This link is invalid or has expired' }, { status: 404 });
  }

  try {
    const passwordHash = await hashPassword(parsed.data.password);
    // updateMany with the hash in the where clause makes the token single-use even under concurrent submits
    const result = await prisma.user.updateMany({
      where: { id: user.id, inviteTokenHash: user.inviteTokenHash },
      data: { passwordHash, inviteTokenHash: null, inviteExpiresAt: null },
    });
    if (result.count === 0) {
      return NextResponse.json({ success: false, error: 'This link has already been used' }, { status: 409 });
    }

    return NextResponse.json({ success: true, data: { username: user.username } });
  } catch (error) {
    console.error('Set password failed:', error);
    return NextResponse.json({ success: false, error: 'Failed to set password' }, { status: 500 });
  }
}
