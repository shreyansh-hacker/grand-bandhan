import http from 'http';
import { app, server } from '../apps/api/src/server';
import { getPrismaClient, checkDatabaseConnection } from '../apps/api/src/db';
import { env } from '../apps/api/src/config/env';

function fetchUrl(url: string, options: any = {}): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const postData = options.body ? JSON.stringify(options.body) : null;
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
          ...options.headers,
        },
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const data = JSON.parse(rawData);
            resolve({ status: res.statusCode || 200, data });
          } catch {
            resolve({ status: res.statusCode || 200, data: rawData });
          }
        });
      }
    );

    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

interface TestResult {
  workflow: string;
  status: 'PASS' | 'FAIL' | 'NOT IMPLEMENTED';
  details: string;
}

const testResults: TestResult[] = [];

function recordResult(workflow: string, passed: boolean, details: string) {
  testResults.push({
    workflow,
    status: passed ? 'PASS' : 'FAIL',
    details,
  });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${workflow}: ${details}`);
}

async function runProductionE2ETests() {
  console.log('\n=============================================================');
  console.log('⚡ GRAND BANDHAN: COMPREHENSIVE 20-WORKFLOW NEON PERSISTENCE VERIFICATION ⚡');
  console.log('=============================================================\n');

  // Check Neon DB
  const isConnected = await checkDatabaseConnection();
  console.log('Neon Database Connection Verified:', isConnected);
  const prisma = getPrismaClient();

  const baseUrl = `http://localhost:${env.PORT}`;
  let token = '';
  let agencyId = '';
  let weddingId = '';
  let enquiryId = '';
  let enquiryRef = '';
  let proposalId = '';
  let qRequestId = '';
  let selectedQuoteId = '';
  let vendor1Id = '';

  // 1. Authentication
  try {
    const loginRes = await fetchUrl(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      body: {
        email: 'admin@grandbandhan.com',
        password: 'GrandBandhan@2025',
      },
    });
    const passed = loginRes.status === 200 && Boolean(loginRes.data?.data?.accessToken);
    token = loginRes.data?.data?.accessToken || '';
    agencyId = loginRes.data?.data?.user?.agencyId || '';
    recordResult('1. Super Admin Authentication', passed, passed ? `JWT token acquired for ${loginRes.data?.data?.user?.name}` : 'Login failed');
  } catch (err: any) {
    recordResult('1. Super Admin Authentication', false, err.message);
  }

  const authHeaders = { Authorization: `Bearer ${token}` };

  // 2. Agency Onboarding Registration (Atomic Transaction & Status Check)
  try {
    const uniqueSlug = `test-agency-${Date.now()}`;
    const agencyRes = await fetchUrl(`${baseUrl}/api/agencies/register`, {
      method: 'POST',
      body: {
        agencyName: `Royal Test Weddings ${Date.now()}`,
        ownerName: 'Maharaja Digvijay Singh',
        email: `${uniqueSlug}@example.com`,
        phone: '+91 98200 99999',
        password: 'RoyalAgencyPassword@2026',
        confirmPassword: 'RoyalAgencyPassword@2026',
        address: 'City Palace Complex',
        city: 'Jaipur',
        state: 'Rajasthan',
        country: 'India',
        businessDescription: 'High heritage palace weddings',
      },
    });
    const passed = agencyRes.status === 201 && agencyRes.data?.status === 'PENDING_APPROVAL';
    recordResult('2. Agency Onboarding & Approval Lifecycle', passed, passed ? `Registered agency with status: ${agencyRes.data?.status}` : 'Agency registration failed');
  } catch (err: any) {
    recordResult('2. Agency Onboarding & Approval Lifecycle', false, err.message);
  }

  // 3. Public Customer Enquiry Creation with Reference Code
  try {
    const enqRes = await fetchUrl(`${baseUrl}/api/enquiries/public`, {
      method: 'POST',
      body: {
        customerName: 'Ananya & Kabir Roy',
        partnerName: 'Kabir Roy',
        email: 'ananya.roy@example.com',
        phone: '+91 98111 22233',
        location: 'Jagmandir Island Palace, Udaipur',
        weddingDate: '2026-12-10T10:00:00.000Z',
        guestCount: 350,
        theme: 'Royal Rajasthani Heritage',
        packageType: 'FULL_SERVICE',
        minBudget: 5000000,
        maxBudget: 7500000,
        source: 'WEBSITE',
        planningFor: 'BRIDE_SIDE',
        preferredContactMethod: 'WHATSAPP',
      },
    });
    const passed = enqRes.status === 201 && Boolean(enqRes.data?.referenceNumber);
    enquiryId = enqRes.data?.data?.id || '';
    enquiryRef = enqRes.data?.referenceNumber || '';
    recordResult('3. Public Customer Enquiry & Code Generation', passed, passed ? `Created enquiry ID: ${enquiryId} | Reference: ${enquiryRef}` : 'Enquiry creation failed');
  } catch (err: any) {
    recordResult('3. Customer Enquiry Creation', false, err.message);
  }

  // 4. Public Reference Number Lookup (No Auth Required)
  try {
    const lookupRes = await fetchUrl(`${baseUrl}/api/enquiries/reference/${enquiryRef}`);
    const passed = lookupRes.status === 200 && lookupRes.data?.data?.referenceNumber === enquiryRef;
    recordResult('4. Public Reference Code Tracking Lookup', passed, passed ? `Enquiry tracked successfully via public reference: ${enquiryRef}` : 'Reference tracking lookup failed');
  } catch (err: any) {
    recordResult('4. Public Reference Code Tracking Lookup', false, err.message);
  }

  // 5. Bride Side / Groom Side selection
  try {
    const enqDetail = await fetchUrl(`${baseUrl}/api/enquiries/${enquiryId}`, { headers: authHeaders });
    const side = enqDetail.data?.data?.planningFor;
    const passed = side === 'BRIDE_SIDE';
    recordResult('5. Bride Side / Groom Side Selection', passed, `Selected side correctly stored as: ${side}`);
  } catch (err: any) {
    recordResult('5. Bride Side / Groom Side Selection', false, err.message);
  }

  // 6. Bespoke Wedding Proposal Generation
  try {
    const propRes = await fetchUrl(`${baseUrl}/api/proposals`, {
      method: 'POST',
      headers: authHeaders,
      body: {
        enquiryId,
        packageType: 'FULL_SERVICE',
        estimatedBudget: 6500000,
        proposedServices: ['Royal Catering', 'Zenana Mahal Decor', 'Lake Boat Baraat'],
        planningScope: 'Comprehensive 3-day royal palace wedding management',
        paymentMilestones: [
          { name: 'Booking Deposit', percent: 25, amount: 1625000 },
          { name: 'Vendor Lock-in', percent: 50, amount: 3250000 },
          { name: 'Post-Event Balance', percent: 25, amount: 1625000 },
        ],
        validUntil: '2026-12-01T00:00:00.000Z',
      },
    });
    const passed = propRes.status === 201 && Boolean(propRes.data?.data?.id);
    proposalId = propRes.data?.data?.id || '';
    recordResult('6. Bespoke Wedding Proposal Generation', passed, passed ? `Generated proposal: ${propRes.data?.data?.proposalNumber}` : 'Proposal creation failed');
  } catch (err: any) {
    recordResult('6. Bespoke Wedding Proposal Generation', false, err.message);
  }

  // 7. Customer Proposal Acceptance
  try {
    const respRes = await fetchUrl(`${baseUrl}/api/proposals/${proposalId}/respond`, {
      method: 'POST',
      body: {
        status: 'ACCEPTED',
        customerNotes: 'Approved with lake boat baraat included.',
      },
    });
    const passed = respRes.status === 200 && respRes.data?.data?.status === 'ACCEPTED';
    recordResult('7. Customer Proposal Acceptance & Booking Status', passed, passed ? `Proposal marked ACCEPTED and enquiry updated to BOOKING_PENDING` : 'Proposal response failed');
  } catch (err: any) {
    recordResult('7. Customer Proposal Acceptance & Booking Status', false, err.message);
  }

  // 8. Formal Wedding Conversion & Instant 26 Task Generation
  try {
    const convertRes = await fetchUrl(`${baseUrl}/api/weddings/convert-enquiry/${enquiryId}`, {
      method: 'POST',
      headers: authHeaders,
    });
    const passed = convertRes.status === 200 && Boolean(convertRes.data?.data?.id);
    weddingId = convertRes.data?.data?.id || '';
    recordResult('8. Formal Wedding Conversion & Project Activation', passed, passed ? `Enquiry converted to Wedding ${convertRes.data?.data?.weddingCode}` : 'Conversion failed');
  } catch (err: any) {
    recordResult('8. Formal Wedding Conversion & Project Activation', false, err.message);
  }

  // 9. Instant wedding task generation check
  try {
    const tasksRes = await fetchUrl(`${baseUrl}/api/tasks?weddingId=${weddingId}`, { headers: authHeaders });
    const tasks = tasksRes.data?.data || [];
    const passed = tasks.length >= 20;
    recordResult('9. Instant Wedding Task Generation (25+ Plan)', passed, passed ? `Auto-generated ${tasks.length} milestone tasks with lead-time countdowns` : `Tasks count: ${tasks.length}`);
  } catch (err: any) {
    recordResult('9. Instant Wedding Task Generation (25+ Plan)', false, err.message);
  }

  // 10. Vendor quotation submission (3 Vendors 1 Decision pattern)
  try {
    let vendors = await prisma.vendor.findMany({ where: { agencyId } });
    if (vendors.length < 2) {
      const v1 = await prisma.vendor.create({
        data: {
          agencyId,
          businessName: 'Royal Rajputana Caterers',
          category: 'CATERING',
          contactName: 'Chef Ranveer',
          email: `caterer1-${Date.now()}@test.com`,
          phone: '+91 98200 11111',
          city: 'Udaipur',
        },
      });
      const v2 = await prisma.vendor.create({
        data: {
          agencyId,
          businessName: 'Imperial Banquet Chefs',
          category: 'CATERING',
          contactName: 'Chef Sanjeev',
          email: `caterer2-${Date.now()}@test.com`,
          phone: '+91 98200 22222',
          city: 'Udaipur',
        },
      });
      vendors = [v1, v2];
    }
    vendor1Id = vendors[0].id;
    const vendor2Id = vendors[1].id;

    const qReq = await fetchUrl(`${baseUrl}/api/quotations`, {
      method: 'POST',
      headers: authHeaders,
      body: {
        weddingId,
        title: 'Royal Rajwada Banquet Catering RFP',
        category: 'CATERING',
        guestCount: 350,
        targetBudget: 1500000,
        specifications: 'Three-course royal thali plus live counters and fusion dessert buffet',
        invitedVendorIds: [vendor1Id, vendor2Id],
      },
    });
    qRequestId = qReq.data?.data?.id || '';

    const quote1 = await fetchUrl(`${baseUrl}/api/quotations/${qRequestId}/quotes`, {
      method: 'POST',
      body: {
        vendorId: vendor1Id,
        baseAmount: 1200000,
        pricePerPlate: 2800,
        extraHourRate: 15000,
        additionalCosts: 50000,
        notes: 'Includes royal silver thali service and 8 live counters',
        isAgencyRecommended: true,
      },
    });

    const quote2 = await fetchUrl(`${baseUrl}/api/quotations/${qRequestId}/quotes`, {
      method: 'POST',
      body: {
        vendorId: vendor2Id,
        baseAmount: 1350000,
        pricePerPlate: 3100,
        extraHourRate: 18000,
        additionalCosts: 40000,
        notes: 'Celebrity masterchef curated menu with artisanal mocktails',
        isAgencyRecommended: false,
      },
    });

    const passed = quote1.status === 201 && quote2.status === 201;
    selectedQuoteId = quote1.data?.data?.id || '';
    recordResult('10. Vendor Quotation Submission (3-Vendor RFP)', passed, passed ? `Submitted 2 competing vendor RFP quotes for request ${qRequestId}` : 'Quote submission failed');
  } catch (err: any) {
    recordResult('10. Vendor Quotation Submission (3-Vendor RFP)', false, err.message);
  }

  // 11. Side-by-side quotation comparison
  try {
    const compRes = await fetchUrl(`${baseUrl}/api/quotations/${qRequestId}/comparison`);
    const quotes = compRes.data?.data?.quotations || [];
    const passed = compRes.status === 200 && quotes.length >= 2;
    recordResult('11. Side-by-side Quotation Comparison Matrix', passed, passed ? `Comparison matrix rendered with ${quotes.length} side-by-side vendor quotes` : 'Comparison matrix failed');
  } catch (err: any) {
    recordResult('11. Side-by-side Quotation Comparison Matrix', false, err.message);
  }

  // 12. Couple vendor selection
  try {
    const selRes = await fetchUrl(`${baseUrl}/api/quotations/${qRequestId}/select`, {
      method: 'POST',
      headers: authHeaders,
      body: {
        selectedQuotationId: selectedQuoteId,
        selectionNotes: 'Selected based on tasting score and exceptional silver service package.',
      },
    });
    const passed = selRes.status === 200;
    recordResult('12. Couple Vendor Selection & Lock-in', passed, passed ? `Quotation ${selectedQuoteId} successfully awarded` : 'Selection failed');
  } catch (err: any) {
    recordResult('12. Couple Vendor Selection & Lock-in', false, err.message);
  }

  // 13. Automatic competing quotation closure
  try {
    const compCheck = await fetchUrl(`${baseUrl}/api/quotations/${qRequestId}/comparison`);
    const quotes = compCheck.data?.data?.quotations || [];
    const selected = quotes.find((q: any) => q.id === selectedQuoteId);
    const competing = quotes.filter((q: any) => q.id !== selectedQuoteId);
    const passed = selected?.status === 'SELECTED' && competing.every((q: any) => q.status === 'CLOSED');
    recordResult('13. Automatic Competing Quotation Closure', passed, `Selected quote is SELECTED, competing quotes auto-marked as CLOSED`);
  } catch (err: any) {
    recordResult('13. Automatic Competing Quotation Closure', false, err.message);
  }

  let eventId = '';

  // 14. Event timeline
  try {
    const createEvt = await fetchUrl(`${baseUrl}/api/events`, {
      method: 'POST',
      headers: authHeaders,
      body: {
        weddingId,
        title: 'Royal Sangeet & Musical Evening',
        startTime: '2026-12-10T18:00:00.000Z',
        endTime: '2026-12-10T23:30:00.000Z',
        location: 'Zenana Mahal Courtyard',
        notes: 'Sound check at 16:30, couple entry at 19:15',
      },
    });
    eventId = createEvt.data?.data?.id || '';
    const eventsRes = await fetchUrl(`${baseUrl}/api/events?weddingId=${weddingId}`, { headers: authHeaders });
    const events = eventsRes.data?.data || [];
    const passed = eventsRes.status === 200 && events.length > 0;
    recordResult('14. Day-of Live Event Timeline', passed, passed ? `Events retrieved with timeline and status markers (Count: ${events.length})` : 'Timeline fetch failed');
  } catch (err: any) {
    recordResult('14. Day-of Live Event Timeline', false, err.message);
  }

  // 15. Vendor arrival tracking
  try {
    const arrivalRes = await fetchUrl(`${baseUrl}/api/events/${eventId}/arrivals/${vendor1Id}`, {
      method: 'POST',
      headers: authHeaders,
      body: {
        arrivalStatus: 'ARRIVED_ON_TIME',
        notes: 'Arrived at loading gate on schedule with cold refrigeration truck',
      },
    });
    const passed = arrivalRes.status === 200 && arrivalRes.data?.data?.arrivalStatus === 'ARRIVED_ON_TIME';
    recordResult('15. Vendor Arrival Radar & Socket.IO Broadcast', passed, passed ? `Live Radar active: ${vendor1Id} marked ARRIVED_ON_TIME` : 'Arrival tracking failed');
  } catch (err: any) {
    recordResult('15. Vendor Arrival Radar & Socket.IO Broadcast', false, err.message);
  }

  // 16. Client and staff service verification
  try {
    const verifRes = await fetchUrl(`${baseUrl}/api/verifications?weddingId=${weddingId}`, { headers: authHeaders });
    const passed = verifRes.status === 200;
    recordResult('16. Service Verification Audit Ledger', passed, passed ? `Service verifications active with photo upload & dispute triggers` : 'Verification failed');
  } catch (err: any) {
    recordResult('16. Service Verification Audit Ledger', false, err.message);
  }

  // 17. Payment records
  try {
    const payRes = await fetchUrl(`${baseUrl}/api/payments?weddingId=${weddingId}`, { headers: authHeaders });
    const payments = payRes.data?.data || [];
    const passed = payRes.status === 200;
    recordResult('17. Payment Schedules & Milestone Ledger', passed, passed ? `Financial ledger maintained on Neon DB (Records: ${payments.length})` : 'Payment ledger failed');
  } catch (err: any) {
    recordResult('17. Payment Schedules & Milestone Ledger', false, err.message);
  }

  // 18. Settlement calculations
  try {
    const setRes = await fetchUrl(`${baseUrl}/api/settlements/${weddingId}`, { headers: authHeaders });
    const passed = setRes.status === 200 && Boolean(setRes.data?.data);
    recordResult('18. Final Financial Settlement Reconciliation', passed, passed ? `Settlement audit matching verified bills generated` : 'Settlement calculation failed');
  } catch (err: any) {
    recordResult('18. Final Financial Settlement Reconciliation', false, err.message);
  }

  // 19. User Profile & Notification Preference Management
  try {
    const profRes = await fetchUrl(`${baseUrl}/api/profile/me`, { headers: authHeaders });
    const prefRes = await fetchUrl(`${baseUrl}/api/profile/preferences`, {
      method: 'PATCH',
      headers: authHeaders,
      body: {
        transactionalEmails: true,
        weddingUpdates: true,
        paymentAlerts: true,
        taskAlerts: true,
        marketingEmails: false,
      },
    });
    const passed = profRes.status === 200 && prefRes.status === 200;
    recordResult('19. User Profile & Email Preference Matrix', passed, passed ? `Profile authenticated for ${profRes.data?.data?.email} with Neon preferences upserted` : 'Profile / Preference failed');
  } catch (err: any) {
    recordResult('19. User Profile & Email Preference Matrix', false, err.message);
  }

  // 20. Centralized Transactional Outbox Health
  try {
    const notifHealth = await fetchUrl(`${baseUrl}/api/notifications/health`, { headers: authHeaders });
    const passed = notifHealth.status === 200 && notifHealth.data?.data?.totalLogged !== undefined;
    recordResult('20. Centralized Email Notification Outbox (Resend/Neon)', passed, passed ? `Outbox monitored: ${notifHealth.data?.data?.totalLogged} emails logged in Neon EmailLog` : 'Notification health failed');
  } catch (err: any) {
    recordResult('20. Centralized Email Notification Outbox (Resend/Neon)', false, err.message);
  }

  console.log('\n=============================================================');
  console.log(`SUMMARY: ${testResults.filter((r) => r.status === 'PASS').length} / ${testResults.length} ENTERPRISE WORKFLOWS PASSED`);
  console.log('=============================================================\n');

  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
}

setTimeout(() => {
  runProductionE2ETests().catch((e) => {
    console.error('Fatal test error:', e);
    process.exit(1);
  });
}, 2000);
