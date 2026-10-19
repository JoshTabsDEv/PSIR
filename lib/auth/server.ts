// Server-only session access for route handlers and server components.
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken, type SessionUser } from './session';

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export function unauthorized() {
  return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
}

/** Session if the caller is an ADMIN, otherwise null (callers answer 401/403). */
export async function getAdminSession(): Promise<SessionUser | null> {
  const session = await getSession();
  return session?.role === 'ADMIN' ? session : null;
}

/**
 * Office scoping for report queries.
 * - OFFICER: always their own office.
 * - ADMIN: all offices by default, or one office when `requestedOfficeId` is given.
 */
export function officeScope(
  session: SessionUser,
  requestedOfficeId?: string | number | null
): { officeId?: number } {
  if (session.role !== 'ADMIN') return { officeId: session.officeId };

  const requested = Number(requestedOfficeId);
  return Number.isInteger(requested) && requested > 0 ? { officeId: requested } : {};
}
