import { PrismaClient } from '@prisma/client';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Resolve a relative SQLite file: URL to an absolute path.
// Next.js 16 + Turbopack can run API routes with a different CWD,
// so we anchor relative paths to the project root via process.cwd().
function resolveDbUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url?.startsWith('file:')) return url;

  const filePart = url.slice('file:'.length);
  if (path.isAbsolute(filePart)) return url;

  // Use process.cwd() which is reliable in Turbopack and production
  const projectRoot = process.cwd();
  const abs = path.resolve(projectRoot, filePart).replace(/\\/g, '/');
  return `file:${abs}`;
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: { db: { url: resolveDbUrl() } },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
