// Shared shapes for admin user management.
import type { Prisma } from '@prisma/client';

export const adminUserSelect = {
  id: true,
  username: true,
  name: true,
  role: true,
  isActive: true,
  officeId: true,
  passwordHash: true,
  inviteExpiresAt: true,
  createdAt: true,
  office: { select: { code: true, name: true } },
} satisfies Prisma.UserSelect;

export type AdminUserRow = Prisma.UserGetPayload<{ select: typeof adminUserSelect }>;

/** Strip the hash; expose only whether a password is set. */
export function toPublicUser<T extends { passwordHash: string | null }>(user: T) {
  const { passwordHash, ...rest } = user;
  return { ...rest, hasPassword: Boolean(passwordHash) };
}
