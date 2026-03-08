import { config } from 'dotenv';
import prisma from '../lib/prisma';
import { frontendToPrisma } from '../lib/prisma-converters';
import type { PSIRFormData } from '../types/psir';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function seed() {
  try {
    console.log('Connected to MySQL via Prisma');

    // Clear existing data (optional - comment out to keep existing)
    // await prisma.pSIRReport.deleteMany({});
    // console.log('Cleared existing reports');

    // Sample reports in frontend format
    const sampleReports: Partial<PSIRFormData>[] = [
      {
        reportNumber: 'PSIR-2025-00001',
        status: 'completed',
        lastModifiedBy: 'System',
        identifyingData: {
          lastName: 'DELA CRUZ',
          firstName: 'JUAN',
          middleName: 'SANTOS',
          trueName: 'JUAN SANTOS DELA CRUZ',
          alias: 'Jun',
          sex: 'Male',
          birthday: new Date('1985-03-15'),
          birthplace: 'Manila',
          nationality: 'Filipino',
          religion: 'Roman Catholic',
          civilStatus: 'Married',
          age: 39,
          educationalAttainment: 'High School Graduate',
          occupation: 'Driver',
          spouseName: 'Maria Dela Cruz',
          identifyingMarks: 'Scar on left arm',
          presentAddress: '456 Current St., Quezon City',
          permanentAddress: '123 Rizal St., Brgy. San Jose, Manila',
          letterJudge: 'Hon. Juan Dela Cruz',
          letterCourt: 'RTC Branch 1, Manila',
          letterPosition: 'Presiding Judge',
          letterAddress: 'RTC Branch 1, Manila',
          investigationDocketNumber: 'INV-2025-00001',
          criminalCaseNumber: 'CRIM-2025-00001',
        },
        criminalHistory: {
          presentOffense: {
            chargedWith: 'Violation of R.A. 9165 (Possession)',
            chargedDate: new Date('2023-06-20'),
            convictedOf: 'Illegal Possession of Dangerous Drugs',
            convictedDate: new Date('2024-03-15'),
            sentence: '6 years and 1 day to 12 years imprisonment',
            judge: 'Hon. Juan Dela Cruz',
            court: 'RTC Branch 1, Manila',
          },
          custodialStatus: 'On Detention',
          rorCustodian1: '',
          rorCustodianAddress1: '',
          rorCustodian2: '',
          rorCustodianAddress2: '',
          address: '123 Rizal St., Brgy. San Jose, Manila',
          priorRecords: {
            nbi: { criminalCaseNo: '', offense: '', dateCharged: null, decisionStatus: 'No record on file' },
            cmrd: { criminalCaseNo: '', offense: '', dateCharged: null, decisionStatus: 'No derogatory record' },
            others: { criminalCaseNo: '', offense: '', dateCharged: null, decisionStatus: 'None' },
          },
        },
        socioEconomicBackground: {
          familyEconomicStatus: 'Low middle-income class',
          familyRelationship: 'Satisfactory',
          familyReputation: 'Satisfactory',
          familySupport: 'Satisfactory',
          communityAcceptability: 'Satisfactory',
          overallWellBeing: 'Satisfactory',
        },
        analysisEvaluation: {
          circumstances: 'First-time offender caught in a buy-bust operation. Claims to have used drugs due to peer pressure.',
          needs: 'Drug rehabilitation program, livelihood training',
          attitude: 'Remorseful and willing to undergo rehabilitation',
          recommendations: 'Recommend for community-based rehabilitation program with regular monitoring.',
          preparedBy: { name: 'Juan Officer', designation: 'Parole and Probation Officer II', date: new Date() },
          reviewedBy: { name: 'Maria Chief', designation: 'Chief Parole and Probation Officer', date: new Date() },
        },
      },
      {
        reportNumber: 'PSIR-2025-00002',
        status: 'draft',
        lastModifiedBy: 'System',
        identifyingData: {
          lastName: 'REYES',
          firstName: 'MARIA',
          middleName: 'GARCIA',
          trueName: 'MARIA GARCIA REYES',
          alias: '',
          sex: 'Female',
          birthday: new Date('1990-07-22'),
          birthplace: 'Cebu City',
          nationality: 'Filipino',
          religion: 'Roman Catholic',
          civilStatus: 'Single',
          age: 34,
          educationalAttainment: 'College Level',
          occupation: 'Unemployed',
          spouseName: '',
          identifyingMarks: 'None',
          presentAddress: '456 Mabini St., Cebu City',
          permanentAddress: '456 Mabini St., Cebu City',
          letterJudge: '',
          letterCourt: '',
          letterPosition: '',
          letterAddress: '',
          investigationDocketNumber: '',
          criminalCaseNumber: '',
        },
        criminalHistory: {
          presentOffense: {
            chargedWith: 'Estafa',
            chargedDate: new Date('2024-01-15'),
            convictedOf: '',
            convictedDate: null,
            sentence: '',
            judge: '',
            court: 'RTC Branch 5, Cebu City',
          },
          custodialStatus: 'On Bail',
          rorCustodian1: '',
          rorCustodianAddress1: '',
          rorCustodian2: '',
          rorCustodianAddress2: '',
          address: '456 Mabini St., Cebu City',
          priorRecords: {
            nbi: { criminalCaseNo: '', offense: '', dateCharged: null, decisionStatus: 'No record on file' },
            cmrd: { criminalCaseNo: '', offense: '', dateCharged: null, decisionStatus: 'No derogatory record' },
            others: { criminalCaseNo: '', offense: '', dateCharged: null, decisionStatus: 'None' },
          },
        },
        socioEconomicBackground: {
          familyEconomicStatus: 'Poor',
          familyRelationship: 'Satisfactory',
          familyReputation: 'Satisfactory',
          familySupport: 'Very satisfactory',
          communityAcceptability: 'Satisfactory',
          overallWellBeing: 'Satisfactory',
        },
        analysisEvaluation: {
          circumstances: '',
          needs: '',
          attitude: '',
          recommendations: '',
          preparedBy: { name: '', designation: '', date: null },
          reviewedBy: { name: '', designation: '', date: null },
        },
      },
    ];

    // Insert sample reports
    for (const report of sampleReports) {
      const existing = await prisma.pSIRReport.findUnique({
        where: { reportNumber: report.reportNumber },
      });

      if (!existing) {
        // Convert frontend format to Prisma format
        const prismaData = frontendToPrisma(report);
        await prisma.pSIRReport.create({ data: prismaData });
        console.log(`Created report: ${report.reportNumber}`);
      } else {
        console.log(`Report ${report.reportNumber} already exists, skipping`);
      }
    }

    console.log('\nSeed completed successfully!');
    console.log('Indexes created automatically by Prisma schema');

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await prisma.$disconnect();
    console.log('Disconnected from MySQL');
  }
}

seed();
