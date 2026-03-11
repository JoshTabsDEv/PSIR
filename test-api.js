const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "file:C:/Users/New/Documents/capitol/psir/prisma/psir.db"
    }
  }
});

// Load the converter module
const path = require('path');
const converterPath = path.join(__dirname, 'lib', 'prisma-converters.ts');

(async () => {
  try {
    // First test: check database works
    const count = await prisma.pSIRReport.count();
    console.log('✓ Database connected. Report count:', count);

    // Second test: fetch all reports
    const reports = await prisma.pSIRReport.findMany();
    console.log('✓ Fetched reports:', reports.length);

    // Third test: try to create a minimal report
    const testData = {
      reportNumber: `TEST-${Date.now()}`,
      status: 'draft',
      lastModifiedBy: 'test',
      lastName: 'Test',
      firstName: 'User',
      sex: 'Male',
      birthday: new Date('1990-01-01'),
      age: 34,
      nationalit: 'Filipino',
    };

    console.log('Creating report with data:', JSON.stringify(testData, null, 2));
    const newReport = await prisma.pSIRReport.create({ data: testData });
    console.log('✓ Report created:', newReport.id, newReport.reportNumber);

  } catch (error) {
    console.error('✗ Error:', error.message);
    console.error('Code:', error.code);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
})();
