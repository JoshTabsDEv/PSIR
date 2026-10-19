/**
 * Create or reset a login user.
 *
 *   pnpm user:create -- --username admin --password "StrongPass123" --name "Juan Dela Cruz" --office TAG --role ADMIN
 *
 * Re-running for an existing username resets the password/name/role/office.
 * The office must already exist (see `pnpm office:create`).
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import prisma from '../lib/prisma';
import { hashPassword } from '../lib/auth/password';

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const username = arg('username')?.trim().toLowerCase();
  const password = arg('password');
  const officeCode = arg('office')?.trim().toUpperCase();
  const role = (arg('role') || 'OFFICER').toUpperCase();

  if (!username || !password || !officeCode) {
    console.error('Usage: pnpm user:create -- --username <u> --password <p> --office <CODE> [--name "<n>"] [--role ADMIN|OFFICER]');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('Password must be at least 8 characters.');
    process.exit(1);
  }
  if (role !== 'ADMIN' && role !== 'OFFICER') {
    console.error('Role must be ADMIN or OFFICER.');
    process.exit(1);
  }

  const office = await prisma.office.findUnique({ where: { code: officeCode } });
  if (!office) {
    console.error(`Office "${officeCode}" not found. Create it first: pnpm office:create -- --code ${officeCode} --name "..."`);
    process.exit(1);
  }

  const name = arg('name')?.trim() || username;
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { username },
    update: { passwordHash, name, role, isActive: true, officeId: office.id },
    create: { username, passwordHash, name, role, officeId: office.id },
  });

  console.log(`User ready: ${user.username} (${user.role}) @ ${office.code}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
