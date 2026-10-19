// One-time invite / password-reset tokens. Server-only (Node crypto).
import { createHash, randomBytes } from 'crypto';
import prisma from '@/lib/prisma';

export const INVITE_TTL_DAYS = 7;

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Issue a fresh token for a user, replacing any previous one. Returns the raw token (shown once). */
export async function issueInviteToken(userId: number): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: userId },
    data: { inviteTokenHash: hashToken(token), inviteExpiresAt: expiresAt },
  });

  return { token, expiresAt };
}

/** Find the user a raw token belongs to, or null if unknown/expired. */
export async function findUserByInviteToken(token: string) {
  if (!token || token.length < 20 || token.length > 128) return null;

  const user = await prisma.user.findUnique({
    where: { inviteTokenHash: hashToken(token) },
    include: { office: { select: { code: true, name: true } } },
  });

  if (!user || !user.inviteExpiresAt || user.inviteExpiresAt < new Date()) return null;
  return user;
}

export function buildInviteLink(origin: string, token: string): string {
  const base = (process.env.APP_URL || origin).replace(/\/$/, '');
  return `${base}/set-password?token=${encodeURIComponent(token)}`;
}
