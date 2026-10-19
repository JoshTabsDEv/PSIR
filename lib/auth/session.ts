// Session token helpers. Edge-safe (used by proxy.ts): only `jose`, no Node APIs.
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'psir_session';
export const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8 hours

export type UserRole = 'ADMIN' | 'OFFICER';

export interface SessionUser {
  id: number;
  username: string;
  name: string;
  role: UserRole;
  officeId: number;
  officeCode: string;
}

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('AUTH_SECRET must be set and at least 32 characters long');
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    username: user.username,
    name: user.name,
    role: user.role,
    officeId: user.officeId,
    officeCode: user.officeCode,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey(), { algorithms: ['HS256'] });
    const id = Number(payload.sub);
    const officeId = Number(payload.officeId);
    if (!Number.isInteger(id) || !Number.isInteger(officeId)) return null;
    if (typeof payload.username !== 'string' || typeof payload.officeCode !== 'string') return null;

    return {
      id,
      username: payload.username,
      name: typeof payload.name === 'string' ? payload.name : payload.username,
      role: payload.role === 'ADMIN' ? 'ADMIN' : 'OFFICER',
      officeId,
      officeCode: payload.officeCode,
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}
