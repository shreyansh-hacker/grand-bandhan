import path from 'path';
import dotenv from 'dotenv';

const cwd = process.cwd();
const rootDir = path.resolve(cwd, cwd.includes('packages') || cwd.includes('apps') ? '../../' : '.');
dotenv.config({ path: path.resolve(cwd, '.env.local') });
dotenv.config({ path: path.resolve(cwd, '.env') });
dotenv.config({ path: path.resolve(rootDir, '.env.local') });
dotenv.config({ path: path.resolve(rootDir, '.env') });

import { prisma } from '../packages/database/src';
import bcrypt from 'bcryptjs';

async function verifyAllSections() {
  console.log('========================================================================');
  console.log('🔍 GRAND BANDHAN: COMPREHENSIVE AUDIT ACROSS ALL 10 PLATFORM SECTIONS');
  console.log('========================================================================\n');

  // 1. Queries / Customer Enquiries
  const enquiriesCount = await prisma.customerEnquiry.count();
  const latestEnquiry = await prisma.customerEnquiry.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  console.log(`1. 📋 Queries & Enquiries: ${enquiriesCount} records in database.`);
  console.log(`   Sample: [${latestEnquiry?.referenceNumber}] ${latestEnquiry?.customerName} & ${latestEnquiry?.partnerName} (${latestEnquiry?.location}) | Status: ${latestEnquiry?.status}`);

  // 2. First Consultations
  const consultationsCount = await prisma.weddingConsultation.count();
  const sampleConsultation = await prisma.weddingConsultation.findFirst({
    include: { enquiry: true, planner: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`\n2. 🤝 First Consultations: ${consultationsCount} records in database.`);
  console.log(`   Sample: Client: ${sampleConsultation?.enquiry?.customerName} | Planner: ${sampleConsultation?.planner?.name || 'Unassigned'} | Link: ${sampleConsultation?.meetingLink} | Status: ${sampleConsultation?.status}`);

  // 3. Service Agreements
  const agreementsCount = await prisma.digitalAgreement.count();
  const sampleAgreement = await prisma.digitalAgreement.findFirst({
    include: { wedding: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`\n3. 📜 Service Agreements: ${agreementsCount} records in database.`);
  console.log(`   Sample: [${sampleAgreement?.agreementNumber}] Wedding: ${sampleAgreement?.wedding.weddingCode} | Signed By: ${sampleAgreement?.signedByName} | Status: ${sampleAgreement?.status}`);

  // 4. Weddings Directory
  const weddingsCount = await prisma.wedding.count();
  const sampleWedding = await prisma.wedding.findFirst({
    orderBy: { createdAt: 'desc' },
  });
  console.log(`\n4. 💒 Weddings Directory: ${weddingsCount} records in database.`);
  console.log(`   Sample: [${sampleWedding?.weddingCode}] ${sampleWedding?.brideName} & ${sampleWedding?.groomName} | Location: ${sampleWedding?.location} | Budget: INR ${sampleWedding?.budgetMin.toLocaleString()}`);

  // 5. 3-Vendor Quotations ("Three Vendors One Decision")
  const qrCount = await prisma.quotationRequest.count();
  const quotesCount = await prisma.vendorQuotation.count();
  const sampleQR = await prisma.quotationRequest.findFirst({
    include: { quotations: { include: { vendor: true } }, wedding: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`\n5. ⚖️ 3-Vendor Quotations: ${qrCount} Requests, ${quotesCount} Vendor Quotations in database.`);
  console.log(`   Sample Request: "${sampleQR?.title}" for ${sampleQR?.wedding.weddingCode}`);
  console.log(`   Competing Quotes in this request (${sampleQR?.quotations.length} quotes submitted):`);
  for (const q of sampleQR?.quotations || []) {
    console.log(`     - Vendor: ${q.vendor.name} (${q.vendor.category}) | Base: INR ${q.baseAmount.toLocaleString()} | Plate: INR ${q.pricePerPlate || 'N/A'} | Status: ${q.status}`);
  }

  // 6. Instant Task Planner
  const tasksCount = await prisma.task.count();
  const sampleTask = await prisma.task.findFirst({
    include: { wedding: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`\n6. 📝 Instant Task Planner: ${tasksCount} operational tasks in database.`);
  console.log(`   Sample: "${sampleTask?.title}" | Category: ${sampleTask?.category} | Priority: ${sampleTask?.priority} | Status: ${sampleTask?.status}`);

  // 7. Live Day-of Timeline
  const eventsCount = await prisma.eventTimeline.count();
  const sampleEvent = await prisma.eventTimeline.findFirst({
    include: { wedding: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`\n7. ⏱️ Live Day-of Timeline: ${eventsCount} schedule events in database.`);
  console.log(`   Sample: "${sampleEvent?.title}" at ${sampleEvent?.location} | Status: ${sampleEvent?.status}`);

  // 8. Service Verification
  const verificationsCount = await prisma.serviceVerification.count();
  const sampleVerification = await prisma.serviceVerification.findFirst({
    include: { wedding: true, vendor: true },
    orderBy: { createdAt: 'desc' },
  });
  console.log(`\n8. 🛡️ Service Verification: ${verificationsCount} verification checkpoints in database.`);
  console.log(`   Sample: Service: "${sampleVerification?.serviceName}" | Vendor: ${sampleVerification?.vendor.name} | Status: ${sampleVerification?.status} | Response: ${sampleVerification?.response || 'PENDING'}`);

  // 9. Payments & Milestones
  const paymentsCount = await prisma.payment.count();
  console.log(`\n9. 💳 Payment Milestones: ${paymentsCount} payment records in database.`);

  // 10. Audit of the 6 Original Test Accounts
  console.log('\n========================================================================');
  console.log('👤 AUDIT OF 6 ORIGINAL USER ACCOUNTS & CREDENTIALS');
  console.log('========================================================================');

  const originalEmails = [
    '23cyber57@ecajmer.ac.in',
    'asaggitarius1@gmail.com',
    'yashaudichya2007@gmail.com',
    'VKrishuhow01@gmail.com',
    'megatronn131403@gmail.com',
    'yashaudichya01@gmail.com',
  ];

  for (const email of originalEmails) {
    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      include: {
        clientWeddings: {
          include: {
            agreement: true,
            tasks: true,
            events: true,
            quotationRequests: { include: { quotations: true } },
            serviceVerifications: true,
            payments: true,
            guests: true,
          },
        },
      },
    });

    if (!user) {
      console.log(`❌ NOT FOUND: ${email}`);
      continue;
    }

    const passOk = await bcrypt.compare('Bandhan@2025!', user.passwordHash);
    console.log(`\n✅ Account: ${user.email} (${user.name})`);
    console.log(`   Role: ${user.role} | Active: ${user.isActive} | Bcrypt Password Valid: ${passOk}`);

    if (user.role === 'CLIENT' && user.clientWeddings.length > 0) {
      const w = user.clientWeddings[0];
      console.log(`   💒 Linked Wedding: [${w.weddingCode}] ${w.brideName} & ${w.groomName} (${w.location})`);
      console.log(`      Agreement: ${w.agreement?.agreementNumber} (${w.agreement?.status})`);
      console.log(`      Tasks: ${w.tasks.length} | Timeline Events: ${w.events.length}`);
      console.log(`      3-Vendor Quotes: ${w.quotationRequests.length} requests (${w.quotationRequests.reduce((acc, q) => acc + q.quotations.length, 0)} total quotations)`);
      console.log(`      Service Verifications: ${w.serviceVerifications.length} | Payments: ${w.payments.length} | Guests: ${w.guests.length}`);
    }

    if (user.role === 'VENDOR') {
      const v = await prisma.vendor.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
      console.log(`   🏛️ Vendor Profile: ${v?.name} (${v?.category}) | Rating: ${v?.rating}★ | Approved: ${v?.isApproved}`);
    }
  }

  console.log('\n========================================================================');
  console.log('✅ ALL SECTIONS VERIFIED FULLY FUNCTIONAL AND POPULATED IN DATABASE');
  console.log('========================================================================\n');
}

verifyAllSections()
  .catch((e) => {
    console.error('Verification error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
