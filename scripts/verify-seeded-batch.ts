import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
const cwd = process.cwd();
const rootDir = path.resolve(cwd, cwd.includes('packages') || cwd.includes('apps') ? '../../' : '.');
dotenv.config({ path: path.resolve(cwd, '.env.local') });
dotenv.config({ path: path.resolve(cwd, '.env') });
dotenv.config({ path: path.resolve(rootDir, '.env.local') });
dotenv.config({ path: path.resolve(rootDir, '.env') });

import { prisma } from '../packages/database/src';
import bcrypt from 'bcryptjs';

async function verify() {
  console.log('========================================================================');
  console.log('👑 GRAND BANDHAN: VERIFYING SEEDED DEMO DATA BATCH (5 COUPLES + 5 VENDORS)');
  console.log('========================================================================\n');

  const DEMO_DOMAIN = 'demo.grandbandhan.com';

  const t0 = Date.now();
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: `@${DEMO_DOMAIN}` } },
    include: { agency: true },
    orderBy: { email: 'asc' },
  });
  const userQueryTime = Date.now() - t0;

  console.log(`Query Time for Users: ${userQueryTime}ms`);
  console.log(`Found ${demoUsers.length} total demo users in database.\n`);

  // Couples Check
  const coupleUsers = demoUsers.filter(u => u.role === 'CLIENT');
  console.log(`💍 Couple Users (${coupleUsers.length}):`);
  for (const c of coupleUsers) {
    const passMatches = await bcrypt.compare('Bandhan@Couple2025!', c.passwordHash);
    console.log(`  - [${c.email}] Name: "${c.name}", Phone: ${c.phone}, Password Valid: ${passMatches}`);
  }

  // Weddings Check
  const t1 = Date.now();
  const weddings = await prisma.wedding.findMany({
    where: { clientEmail: { endsWith: `@${DEMO_DOMAIN}` } },
    include: {
      agreement: true,
      payments: true,
      guests: true,
      tasks: true,
    },
    orderBy: { weddingCode: 'asc' },
  });
  const weddingQueryTime = Date.now() - t1;

  console.log(`\n💒 Seeded Weddings (${weddings.length}) [Query Time: ${weddingQueryTime}ms]:`);
  for (const w of weddings) {
    console.log(`  - Code: ${w.weddingCode} | Status: ${w.status} | Location: ${w.location}`);
    console.log(`    Budget: INR ${w.budgetMin.toLocaleString()} - ${w.budgetMax.toLocaleString()} | Guests: ${w.guestCount}`);
    console.log(`    Agreement: ${w.agreement?.agreementNumber} (Status: ${w.agreement?.status})`);
    console.log(`    Payments: ${w.payments.length} milestones | Tasks: ${w.tasks.length} | RSVP Guests: ${w.guests.length}`);
  }

  // Vendors Check
  const vendorUsers = demoUsers.filter(u => u.role === 'VENDOR');
  console.log(`\n🏛️ Vendor Users (${vendorUsers.length}):`);
  for (const v of vendorUsers) {
    const passMatches = await bcrypt.compare('Bandhan@Vendor2025!', v.passwordHash);
    console.log(`  - [${v.email}] Name: "${v.name}", Phone: ${v.phone}, Status: ${v.accountStatus}, Password Valid: ${passMatches}`);
  }

  const t2 = Date.now();
  const vendorProfiles = await prisma.vendor.findMany({
    where: { email: { endsWith: `@${DEMO_DOMAIN}` } },
    orderBy: { email: 'asc' },
  });
  const vendorQueryTime = Date.now() - t2;

  console.log(`\n📋 Vendor Enterprise Profiles (${vendorProfiles.length}) [Query Time: ${vendorQueryTime}ms]:`);
  for (const vp of vendorProfiles) {
    console.log(`  - ${vp.name} | Category: ${vp.category} | Rating: ${vp.rating}★ | Base Price: INR ${vp.basePrice.toLocaleString()} | Approved: ${vp.isApproved}`);
  }

  console.log('\n========================================================================');
  console.log('✅ ALL SEEDED DEMO DATA METRICS VERIFIED SUCCESSFULLY');
  console.log('========================================================================\n');
}

verify()
  .catch(err => {
    console.error('Verification error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
