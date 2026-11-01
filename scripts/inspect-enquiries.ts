import path from 'path';
import dotenv from 'dotenv';
const cwd = process.cwd();
const rootDir = path.resolve(cwd, cwd.includes('packages') || cwd.includes('apps') ? '../../' : '.');
dotenv.config({ path: path.resolve(cwd, '.env.local') });
dotenv.config({ path: path.resolve(cwd, '.env') });
dotenv.config({ path: path.resolve(rootDir, '.env.local') });
dotenv.config({ path: path.resolve(rootDir, '.env') });

import { prisma } from '../packages/database/src';

async function run() {
  const enqs = await prisma.customerEnquiry.findMany({
    select: { id: true, referenceNumber: true, email: true },
    orderBy: { referenceNumber: 'asc' },
  });
  console.log('Total enquiries:', enqs.length);

  const matched = enqs.filter(e => e.referenceNumber?.includes('0050') || e.referenceNumber?.includes('0051'));
  console.log('Matched around 50/51:', matched);

  // Check all ENQ-DEMO-2026-
  const demos = enqs.filter(e => e.referenceNumber?.startsWith('ENQ-DEMO-2026-'));
  console.log('Total ENQ-DEMO-2026- count:', demos.length);
  if (demos.length > 0) {
    console.log('First 5:', demos.slice(0, 5).map(d => d.referenceNumber));
    console.log('Last 5:', demos.slice(-5).map(d => d.referenceNumber));
  }
}

run().finally(async () => {
  await prisma.$disconnect();
});
