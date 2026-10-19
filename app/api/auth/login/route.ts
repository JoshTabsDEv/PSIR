import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions, type SessionUser } from '@/lib/auth/session';
import { clearAttempts, isRateLimited, recordFailedAttempt } from '@/lib/auth/rate-limit';

const loginSchema = z.object({
  username: z.string().trim().min(1).max(64),
  password: z.string().min(1).max(256),
});

function invalidCredentials() {
  return NextResponse.json(
    { success: false, error: 'Invalid username or password' },
    { status: 401 }
  );
}

function clientKey(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || 'unknown';
}

// POST /api/auth/login
export async function POST(request: NextRequest) {
  const key = clientKey(request);
  if (isRateLimited(key)) {
    return NextResponse.json(
      { success: false, error: 'Too many attempts. Try again in a few minutes.' },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }

  const { username, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      include: { office: { select: { id: true, code: true, isActive: true } } },
    });

    // Always run the hash comparison so timing does not reveal valid usernames.
    const passwordOk = await verifyPassword(password, user?.passwordHash);
    if (!user || !user.isActive || !user.office.isActive || !passwordOk) {
      recordFailedAttempt(key);
      return invalidCredentials();
    }

    clearAttempts(key);

    const sessionUser: SessionUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role === 'ADMIN' ? 'ADMIN' : 'OFFICER',
      officeId: user.office.id,
      officeCode: user.office.code,
    };
    const token = await createSessionToken(sessionUser);

    const response = NextResponse.json({ success: true, data: sessionUser });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 });
  }
}
