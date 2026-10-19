/**
 * Create or update an office.
 *
 *   pnpm office:create -- --code TAG --name "Tagbilaran City Parole and Probation Office" --region "VII" --address "Tagbilaran City, Bohol"
 *
 * `code` is used in report numbers (PI-TAG-2026-00001): keep it short, letters/digits only.
 */
import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import prisma from '../lib/prisma';

function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const code = arg('code')?.trim().toUpperCase();
  const name = arg('name')?.trim();
  const region = arg('region')?.trim() || null;
  const address = arg('address')?.trim() || null;

  if (!code || !name) {
    console.error('Usage: pnpm office:create -- --code <CODE> --name "<name>" [--region "<region>"] [--address "<address>"]');
    process.exit(1);
  }
  if (!/^[A-Z0-9]{2,8}$/.test(code)) {
    console.error('Office code must be 2-8 letters/digits (e.g. TAG).');
    process.exit(1);
  }

  const office = await prisma.office.upsert({
    where: { code },
    update: { name, region, address, isActive: true },
    create: { code, name, region, address },
  });

  console.log(`Office ready: ${office.code} - ${office.name} (id ${office.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
