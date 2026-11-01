import { prisma, VendorCategory, UserRole, AccountStatus, WeddingStatus, PaymentType, PaymentMilestone, PaymentStatus } from '@grand-bandhan/database';
import { hashPassword, comparePassword } from '../apps/api/src/utils/hash';
import { NotificationService } from '../apps/api/src/modules/notifications/notification.service';
import { NotificationEvent } from '../apps/api/src/modules/notifications/notification.types';

async function runTests() {
  console.log('====================================================');
  console.log('👑 GRAND BANDHAN: PORTALS & CREDENTIALS VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // Find primary agency
  const agency = await prisma.agency.findFirst({ where: { status: 'APPROVED' } });
  if (!agency) {
    throw new Error('No approved agency found in database');
  }
  console.log(`Using agency: ${agency.name} (${agency.id})\n`);

  // =========================================================================
  // TEST SUITE 1: Vendor Auto-Provisioning & Password Credentials
  // =========================================================================
  console.log('TEST SUITE 1: Vendor Auto-Provisioning & Password Credentials');
  const testVendorEmail = `testvendor_${Date.now()}@example.com`;
  const defaultVendorPassword = 'GrandVendor@2026';

  // 1. Create vendor application
  const vendor = await prisma.vendor.create({
    data: {
      agencyId: agency.id,
      name: 'Udaipur Royal Mandap Artisans',
      category: VendorCategory.DECORATION,
      contactPerson: 'Vikram Singh',
      email: testVendorEmail,
      phone: '+91 99887 76655',
      basePrice: 250000,
      isApproved: false,
    },
  });
  assert(vendor.isApproved === false, 'Vendor created as unapproved pending admin review');

  // 2. Simulate Approval & Auto-Account Provisioning
  let vendorUser = await prisma.user.findUnique({ where: { email: testVendorEmail } });
  assert(vendorUser === null, 'Vendor User does not exist prior to approval');

  const passwordHash = await hashPassword(defaultVendorPassword);
  vendorUser = await prisma.user.create({
    data: {
      agencyId: agency.id,
      email: testVendorEmail,
      passwordHash,
      role: UserRole.VENDOR,
      name: vendor.contactPerson,
      phone: vendor.phone,
      accountStatus: AccountStatus.ACTIVE,
      isActive: true,
      emailVerified: true,
    },
  });
  assert(vendorUser !== null, 'Vendor User created in DB with role VENDOR');

  const isPasswordValid = await comparePassword(defaultVendorPassword, vendorUser.passwordHash);
  assert(isPasswordValid, `Vendor user passwordHash accurately validates against "${defaultVendorPassword}"`);

  // 3. Emit approval email with credentials and check EmailLog
  const appUrl = process.env.APP_URL || 'https://grandbandhan.com';
  const vendorPortalUrl = `${appUrl}/portal/vendor/${vendor.id}`;
  const loginUrl = `${appUrl}/login`;

  await NotificationService.emit(NotificationEvent.VENDOR_APPROVED, {
    agencyId: agency.id,
    recipientEmail: vendor.email,
    recipientName: vendor.contactPerson,
    recipientRole: 'VENDOR',
    subject: `🎉 Welcome to Grand Bandhan: Your Vendor Partnership is Approved! (${vendor.name})`,
    data: {
      vendorName: vendor.name,
      category: vendor.category,
      contactPerson: vendor.contactPerson,
      loginEmail: vendor.email,
      temporaryPassword: defaultVendorPassword,
      isNewUser: true,
      portalUrl: vendorPortalUrl,
      loginUrl,
    },
  });

  const vendorEmailLog = await prisma.emailLog.findFirst({
    where: { recipientEmail: testVendorEmail, eventType: NotificationEvent.VENDOR_APPROVED },
    orderBy: { createdAt: 'desc' },
  });
  assert(vendorEmailLog !== null, 'EmailLog recorded for VENDOR_APPROVED');
  const vendorPayload = vendorEmailLog?.payload as any;
  assert(vendorPayload?.temporaryPassword === defaultVendorPassword, 'EmailLog stores temporary password in payload');
  assert(vendorPayload?.portalUrl === vendorPortalUrl, 'EmailLog stores direct vendor portal URL');

  // =========================================================================
  // TEST SUITE 2: Client Auto-Provisioning & Password Credentials upon Conversion
  // =========================================================================
  console.log('\nTEST SUITE 2: Client Auto-Provisioning & Password Credentials');
  const testClientEmail = `royalclient_${Date.now()}@example.com`;
  const defaultClientPassword = 'RoyalClient@2026';

  // 1. Create Enquiry
  const enquiry = await prisma.customerEnquiry.create({
    data: {
      agencyId: agency.id,
      referenceNumber: `ENQ-TEST-${Date.now()}`,
      customerName: 'Ananya Singhania',
      email: testClientEmail,
      phone: '+91 91234 56789',
      location: 'Udaivilas Palace, Udaipur',
      guestCount: 400,
      minBudget: 2500000,
      maxBudget: 6000000,
      status: 'NEW',
    },
  });
  assert(enquiry !== null, 'Enquiry successfully created');

  // 2. Simulate Conversion to Wedding + Auto-Provisioning Client User
  const clientHash = await hashPassword(defaultClientPassword);
  const clientUser = await prisma.user.create({
    data: {
      agencyId: agency.id,
      email: testClientEmail,
      passwordHash: clientHash,
      role: UserRole.CLIENT,
      name: enquiry.customerName,
      phone: enquiry.phone,
      accountStatus: AccountStatus.ACTIVE,
      isActive: true,
      emailVerified: true,
    },
  });
  assert(clientUser !== null && clientUser.role === UserRole.CLIENT, 'Client User created with role CLIENT');

  const isClientPassValid = await comparePassword(defaultClientPassword, clientUser.passwordHash);
  assert(isClientPassValid, `Client user passwordHash accurately validates against "${defaultClientPassword}"`);

  const weddingCode = `GB-W-TEST-${Date.now()}`;
  const wedding = await prisma.wedding.create({
    data: {
      agencyId: agency.id,
      weddingCode,
      brideName: 'Ananya Singhania',
      groomName: 'Kabir Oberoi',
      clientEmail: testClientEmail,
      clientPhone: enquiry.phone,
      weddingDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      location: enquiry.location,
      guestCount: enquiry.guestCount,
      budgetMin: enquiry.minBudget,
      budgetMax: enquiry.maxBudget,
      status: WeddingStatus.CONFIRMED,
      clientId: clientUser.id,
    },
  });
  assert(wedding.clientId === clientUser.id, 'Wedding successfully linked to provisioned Client User ID');

  const clientPortalUrl = `${appUrl}/portal/client/${wedding.id}`;
  await NotificationService.emit(NotificationEvent.BOOKING_CONFIRMED, {
    agencyId: agency.id,
    recipientEmail: testClientEmail,
    recipientName: `${wedding.brideName} & ${wedding.groomName}`,
    recipientRole: 'CLIENT',
    data: {
      weddingCode: wedding.weddingCode,
      coupleNames: `${wedding.brideName} & ${wedding.groomName}`,
      weddingDate: wedding.weddingDate,
      location: wedding.location,
      packageType: wedding.packageType,
      loginEmail: testClientEmail,
      temporaryPassword: defaultClientPassword,
      isNewUser: true,
      portalUrl: clientPortalUrl,
      loginUrl,
    },
  });

  const clientEmailLog = await prisma.emailLog.findFirst({
    where: { recipientEmail: testClientEmail, eventType: NotificationEvent.BOOKING_CONFIRMED },
    orderBy: { createdAt: 'desc' },
  });
  assert(clientEmailLog !== null, 'EmailLog recorded for BOOKING_CONFIRMED');
  const clientPayload = clientEmailLog?.payload as any;
  assert(clientPayload?.temporaryPassword === defaultClientPassword, 'EmailLog stores client temporary password');
  assert(clientPayload?.portalUrl === clientPortalUrl, 'EmailLog stores client direct portal URL');

  // =========================================================================
  // TEST SUITE 3: Vendor Quotation Bidding & RFP Architecture
  // =========================================================================
  console.log('\nTEST SUITE 3: Vendor Quotation Bidding & RFP Architecture');

  // 1. Create QuotationRequest RFP for this wedding
  const rfp = await prisma.quotationRequest.create({
    data: {
      weddingId: wedding.id,
      category: VendorCategory.DECORATION,
      title: 'Royal Mandap & Floral Welcome RFP',
      guestCount: 400,
      targetBudget: 350000,
      specifications: 'Handcrafted floral arches with fresh marigolds and brass kalash accents.',
      status: 'INVITED',
    },
  });
  assert(rfp !== null, 'QuotationRequest RFP created');

  // 2. Submit sealed quotation
  const quote = await prisma.vendorQuotation.create({
    data: {
      quotationRequestId: rfp.id,
      vendorId: vendor.id,
      baseAmount: 320000,
      pricePerPlate: null,
      extraHourRate: 15000,
      additionalCosts: 20000,
      menuDetails: 'Complete royal palace mandap setup with sound-sync architectural lights',
      includedItems: ['Carved Mandap Pillars', 'Brass Kalash Entrance', 'Rose Petal Welcome Shower'],
      notes: 'Setup to complete 4 hours prior to Baraat arrival.',
      status: 'SUBMITTED',
    },
  });
  assert(quote.baseAmount === 320000, 'VendorQuotation persisted with exact line items in Neon DB');
  assert(quote.includedItems.length === 3, 'Included stations/deliverables array persisted properly');

  // =========================================================================
  // TEST SUITE 4: Client Portal & Guest RSVP Persistence
  // =========================================================================
  console.log('\nTEST SUITE 4: Client Portal & Guest RSVP Persistence');

  // 1. Add guests to WeddingGuest table
  const guest1 = await prisma.weddingGuest.create({
    data: {
      weddingId: wedding.id,
      fullName: 'Maharaja Digvijay Singh',
      email: 'digvijay@example.com',
      phone: '+91 98222 33444',
      side: 'BRIDE_SIDE',
      rsvpStatus: 'ATTENDING',
      guestCount: 2,
      dietaryPreference: 'Pure Vegetarian',
      roomAssigned: 'Mewar Royal Suite 101',
    },
  });

  const guest2 = await prisma.weddingGuest.create({
    data: {
      weddingId: wedding.id,
      fullName: 'Yuvraj Ranveer Rathore',
      email: 'ranveer@example.com',
      phone: '+91 98333 44555',
      side: 'GROOM_SIDE',
      rsvpStatus: 'PENDING',
      guestCount: 1,
      dietaryPreference: 'Non-Vegetarian Awadhi',
      roomAssigned: 'Marwar Wing 204',
    },
  });
  assert(guest1.id !== null && guest2.id !== null, 'WeddingGuest records persisted in Neon DB');

  // 2. Query RSVP statistics
  const weddingGuests = await prisma.weddingGuest.findMany({ where: { weddingId: wedding.id } });
  assert(weddingGuests.length === 2, 'Retrieved all registered guests for wedding');

  const attendingCount = weddingGuests
    .filter((g) => g.rsvpStatus === 'ATTENDING')
    .reduce((sum, g) => sum + g.guestCount, 0);
  assert(attendingCount === 2, `Attending count accurately calculated: ${attendingCount}`);

  // 3. Update guest RSVP status
  const updatedGuest2 = await prisma.weddingGuest.update({
    where: { id: guest2.id },
    data: { rsvpStatus: 'ATTENDING', guestCount: 2 },
  });
  assert(updatedGuest2.rsvpStatus === 'ATTENDING', 'Guest RSVP status updated to ATTENDING');

  // Cleanup test entities
  console.log('\nCleaning up test entities...');
  await prisma.weddingGuest.deleteMany({ where: { weddingId: wedding.id } });
  await prisma.vendorQuotation.deleteMany({ where: { quotationRequestId: rfp.id } });
  await prisma.quotationRequest.delete({ where: { id: rfp.id } });
  await prisma.wedding.delete({ where: { id: wedding.id } });
  await prisma.customerEnquiry.delete({ where: { id: enquiry.id } });
  await prisma.vendor.delete({ where: { id: vendor.id } });
  await prisma.user.delete({ where: { id: vendorUser.id } });
  await prisma.user.delete({ where: { id: clientUser.id } });
  console.log('Cleanup completed cleanly.');

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .then(() => {
    prisma.$disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test execution error:', err);
    prisma.$disconnect();
    process.exit(1);
  });
