const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:C:/Users/New/Documents/capitol/psir/prisma/psir.db"
    }
  }
});

(async () => {
  try {
    const count = await prisma.pSIRReport.count();
    console.log('Database connection successful. Report count:', count);
    process.exit(0);
  } catch (error) {
    console.error('Database connection error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
