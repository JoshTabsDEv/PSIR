// Server-only session access for route handlers and server components.
import { cookies } from 'next/headers';
import { SESSION_COOKIE, verifySessionToken, type SessionUser } from './session';

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
