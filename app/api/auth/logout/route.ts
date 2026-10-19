import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from '@/lib/auth/session';

// POST /api/auth/logout
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}
