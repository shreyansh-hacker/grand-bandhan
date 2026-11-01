import { prisma } from '@grand-bandhan/database';

async function testRenderEnquiryEmail() {
  const testEmail = 'shreyanshsharma049@gmail.com';
  console.log(`Submitting public enquiry to live Render API with recipient: ${testEmail}...`);

  const payload = {
    customerName: 'Shreyansh Test Live',
    email: testEmail,
    phone: '9876543210',
    location: 'Udaipur',
    guestCount: 200,
    minBudget: 500000,
    maxBudget: 1500000,
    source: 'WEBSITE',
    notes: 'Testing live email dispatch on Render',
  };

  const res = await fetch('https://grand-bandhan.onrender.com/api/enquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log('Render response status:', res.status, data);

  // Wait 3 seconds for async dispatch
  await new Promise(r => setTimeout(r, 3000));

  // Query the latest EmailLog record from Neon DB
  const latestLog = await prisma.emailLog.findFirst({
    where: { recipientEmail: testEmail },
    orderBy: { createdAt: 'desc' },
  });

  console.log('\nLatest EmailLog in Neon PostgreSQL:');
  console.log({
    id: latestLog?.id,
    status: latestLog?.status,
    errorMessage: latestLog?.errorMessage,
    providerMessageId: latestLog?.providerMessageId,
    retryCount: latestLog?.retryCount,
    createdAt: latestLog?.createdAt,
    sentAt: latestLog?.sentAt,
  });
}

testRenderEnquiryEmail().catch(console.error);
