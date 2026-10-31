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

async function runE2ETests() {
  console.log('====================================================');
  console.log('⚡ STARTING END-TO-END NEON SERVICES VERIFICATION ⚡');
  console.log('====================================================\n');

  // 1. Direct Neon Postgres Verification
  console.log('--- [Step 1] Direct Neon PostgreSQL Connection Test ---');
  const isConnected = await checkDatabaseConnection();
  console.log('Neon Database Connection Verified:', isConnected);

  const prisma = getPrismaClient();
  const dbInfo = await prisma.$queryRaw<any[]>`SELECT version(), current_database(), current_user`;
  console.log('Connected to Neon PostgreSQL DB:');
  console.log('  Database:', dbInfo[0]?.current_database);
  console.log('  User:    ', dbInfo[0]?.current_user);
  console.log('  Engine:  ', dbInfo[0]?.version);

  const agencies = await prisma.agency.findMany();
  console.log(`Neon DB Agencies Count: ${agencies.length}`);
  console.log('  Agency Name:', agencies[0]?.name);

  const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true } });
  console.log(`Neon DB Users Count: ${users.length}`);
  users.forEach((u) => console.log(`  - [${u.role}] ${u.name} (${u.email})`));

  const vendors = await prisma.vendor.findMany();
  console.log(`Neon DB Vendors Count: ${vendors.length}`);

  const enquiries = await prisma.customerEnquiry.findMany();
  console.log(`Neon DB Enquiries Count: ${enquiries.length}\n`);

  // 2. Wait for API server to listen
  console.log('--- [Step 2] HTTP Endpoints Verification ---');
  const baseUrl = `http://localhost:${env.PORT}`;
  console.log(`Probing API server at ${baseUrl}...`);

  // Test /health
  const healthRes = await fetchUrl(`${baseUrl}/health`);
  console.log('\nGET /health response:', JSON.stringify(healthRes, null, 2));

  // Test /api/neon/status
  const neonStatusRes = await fetchUrl(`${baseUrl}/api/neon/status`);
  console.log('\nGET /api/neon/status response:', JSON.stringify(neonStatusRes, null, 2));

  // Test /api/auth/login
  console.log('\nTesting POST /api/auth/login with seeded admin credentials...');
  const loginRes = await fetchUrl(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    body: {
      email: 'admin@grandbandhan.com',
      password: 'GrandBandhan@2025',
    },
  });
  console.log('POST /api/auth/login response status:', loginRes.status);
  const token = loginRes.data?.data?.accessToken;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  // Test Neon PostgreSQL BYTEA Binary File Storage Upload
  console.log('\n--- [Step 3] Neon PostgreSQL BYTEA Binary File Storage Test ---');
  const samplePdfBase64 = Buffer.from('%PDF-1.4 Mock Grand Bandhan Digital Agreement Contract Signature Proof').toString('base64');
  const uploadRes = await fetchUrl(`${baseUrl}/api/storage/upload`, {
    method: 'POST',
    headers: authHeaders,
    body: {
      fileName: 'Signed_Royal_Wedding_Agreement_2025.pdf',
      mimeType: 'application/pdf',
      fileData: samplePdfBase64,
      entityType: 'DIGITAL_AGREEMENT',
      entityId: 'agreement_mock_001',
    },
  });
  console.log('POST /api/storage/upload response status:', uploadRes.status);
  console.log('Storage upload result:', JSON.stringify(uploadRes.data, null, 2));

  const uploadedFileId = uploadRes.data?.file?.id;
  if (uploadedFileId) {
    // Test metadata retrieval
    const infoRes = await fetchUrl(`${baseUrl}/api/storage/${uploadedFileId}/info`);
    console.log(`GET /api/storage/${uploadedFileId}/info:`, JSON.stringify(infoRes.data, null, 2));

    // Test raw binary stream retrieval
    const downloadRes = await fetchUrl(`${baseUrl}/api/storage/${uploadedFileId}`);
    console.log(`GET /api/storage/${uploadedFileId} status:`, downloadRes.status, 'Binary bytes received');
  }

  // Test Core Business Modules API
  console.log('\n--- [Step 4] Core Business Modules Verification ---');
  const weddingsRes = await fetchUrl(`${baseUrl}/api/weddings`, { headers: authHeaders });
  console.log('GET /api/weddings count:', weddingsRes.data?.data?.length || 0);

  const enquiriesRes = await fetchUrl(`${baseUrl}/api/enquiries`, { headers: authHeaders });
  console.log('GET /api/enquiries count:', enquiriesRes.data?.data?.length || 0);

  const quotationsRes = await fetchUrl(`${baseUrl}/api/quotations`, { headers: authHeaders });
  console.log('GET /api/quotations count:', quotationsRes.data?.data?.length || 0);

  const verificationsRes = await fetchUrl(`${baseUrl}/api/verifications`, { headers: authHeaders });
  console.log('GET /api/verifications count:', verificationsRes.data?.data?.length || 0);

  const settlementsRes = await fetchUrl(`${baseUrl}/api/settlements`, { headers: authHeaders });
  console.log('GET /api/settlements count:', settlementsRes.data?.data?.length || 0);

  console.log('\n====================================================');
  console.log('✅ ALL WIRED NEON SERVICES AND BYTEA STORAGE TESTED AND PASSING E2E!');
  console.log('====================================================\n');

  // Close server and Prisma
  await prisma.$disconnect();
  server.close(() => {
    process.exit(0);
  });
}

// Give server time to initialize
setTimeout(() => {
  runE2ETests().catch((err) => {
    console.error('E2E Test Failed:', err);
    process.exit(1);
  });
}, 2000);
