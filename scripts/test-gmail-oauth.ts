import http from 'http';
import { app, server } from '../apps/api/src/server';
import { getPrismaClient, checkDatabaseConnection } from '../apps/api/src/db';
import { env } from '../apps/api/src/config/env';
import { GmailService, GMAIL_SCOPE } from '../apps/api/src/modules/email/gmail.service';
import { generateAccessToken } from '../apps/api/src/utils/jwt';
import { UserRole } from '@grand-bandhan/shared';

function fetchUrl(url: string, options: any = {}): Promise<{ status: number; data: any; headers: any }> {
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
            resolve({ status: res.statusCode || 200, data, headers: res.headers });
          } catch {
            resolve({ status: res.statusCode || 200, data: rawData, headers: res.headers });
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
  name: string;
  passed: boolean;
  details: string;
}

const results: TestResult[] = [];

function record(name: string, passed: boolean, details: string) {
  results.push({ name, passed, details });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${name}: ${details}`);
}

async function runGmailOAuthTests() {
  console.log('\n=============================================================');
  console.log('⚡ GRAND BANDHAN: GMAIL API OAUTH 2.0 INTEGRATION TEST SUITE ⚡');
  console.log('=============================================================\n');

  await checkDatabaseConnection();
  const prisma = getPrismaClient();
  const baseUrl = `http://localhost:${env.PORT}`;

  const superAdminToken = generateAccessToken({
    userId: 'test_super_admin_id',
    agencyId: 'agency_test_id',
    email: 'admin@grandbandhan.com',
    role: UserRole.SUPER_ADMIN,
    name: 'Super Admin Test',
  });

  const clientToken = generateAccessToken({
    userId: 'test_client_id',
    agencyId: 'agency_test_id',
    email: 'client@grandbandhan.com',
    role: UserRole.CLIENT,
    name: 'Client User Test',
  });

  const superAdminHeaders = {
    Authorization: `Bearer ${superAdminToken}`,
    Accept: 'application/json',
  };

  // ---------------------------------------------------------------------------
  // TEST 1: Generate Auth URL with Required Scope & CSRF Nonce
  // ---------------------------------------------------------------------------
  try {
    const authStartRes = await fetchUrl(`${baseUrl}/api/email/oauth/start`, {
      headers: superAdminHeaders,
    });

    const url = authStartRes.data?.data?.url || '';
    const state = authStartRes.data?.data?.state || '';

    const parsedUrl = new URL(url);
    const hasClientId = parsedUrl.searchParams.get('client_id') === env.GOOGLE_CLIENT_ID;
    const hasRedirectUri = parsedUrl.searchParams.get('redirect_uri') === env.GOOGLE_REDIRECT_URI;
    const hasScope = parsedUrl.searchParams.get('scope') === GMAIL_SCOPE;
    const hasOffline = parsedUrl.searchParams.get('access_type') === 'offline';
    const hasPrompt = parsedUrl.searchParams.get('prompt') === 'consent';
    const hasState = parsedUrl.searchParams.get('state') === state;

    const stateInDb = await prisma.oAuthState.findUnique({ where: { state } });

    const passed =
      authStartRes.status === 200 &&
      hasClientId &&
      hasRedirectUri &&
      hasScope &&
      hasOffline &&
      hasPrompt &&
      hasState &&
      Boolean(stateInDb);

    record(
      '1. OAuth Start & Auth URL Generation',
      passed,
      passed
        ? `Auth URL verified with offline access, prompt=consent, scope: ${GMAIL_SCOPE}, state nonce: ${state.slice(0, 12)}...`
        : `Validation failed: status=${authStartRes.status}, scopeMatch=${hasScope}, stateInDb=${Boolean(stateInDb)}`
    );
  } catch (err: any) {
    record('1. OAuth Start & Auth URL Generation', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 2: CSRF State Validation & Replay Prevention
  // ---------------------------------------------------------------------------
  try {
    const { state: testState } = await GmailService.generateAuthUrl();

    // First validation must succeed
    const firstCheck = await GmailService.validateAndConsumeState(testState);

    // Replay attack with same state must fail (consumed)
    const replayCheck = await GmailService.validateAndConsumeState(testState);

    // Arbitrary fake state must fail
    const fakeCheck = await GmailService.validateAndConsumeState('fake_arbitrary_attacker_nonce_12345');

    // Expired state test
    const expiredState = 'expired_nonce_' + Date.now();
    await prisma.oAuthState.create({
      data: {
        state: expiredState,
        expiresAt: new Date(Date.now() - 5000), // Expired 5 seconds ago
      },
    });
    const expiredCheck = await GmailService.validateAndConsumeState(expiredState);

    const passed = firstCheck === true && replayCheck === false && fakeCheck === false && expiredCheck === false;

    record(
      '2. CSRF State Validation & Replay Prevention',
      passed,
      passed
        ? 'First consumption verified, replay attack rejected, arbitrary state rejected, expired state rejected.'
        : `State checks: first=${firstCheck}, replay=${replayCheck}, fake=${fakeCheck}, expired=${expiredCheck}`
    );
  } catch (err: any) {
    record('2. CSRF State Validation & Replay Prevention', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 3: OAuth2 Callback Handling & Code Exchange (Mocking Google Token API)
  // ---------------------------------------------------------------------------
  try {
    const { state: callbackState } = await GmailService.generateAuthUrl();

    // Setup Mock Interceptor for Google's Token Endpoint
    const mockAccessToken = `mock_access_token_${Date.now()}`;
    const mockRefreshToken = `mock_refresh_token_${Date.now()}`;

    GmailService.setMockInterceptor((url, body) => {
      if (url.includes('oauth2.googleapis.com/token') && body.includes('grant_type=authorization_code')) {
        return Promise.resolve({
          access_token: mockAccessToken,
          refresh_token: mockRefreshToken,
          expires_in: 3600,
          scope: GMAIL_SCOPE,
          token_type: 'Bearer',
        });
      }
      return null;
    });

    const callbackRes = await fetchUrl(
      `${baseUrl}/api/email/oauth2/callback?code=mock_google_auth_code_999&state=${callbackState}`,
      {
        headers: { Accept: 'application/json' },
      }
    );

    // Verify token was stored in Neon PostgreSQL
    const storedToken = await prisma.gmailOAuthToken.findUnique({ where: { id: 'default' } });

    const passed =
      callbackRes.status === 200 &&
      storedToken?.refreshToken === mockRefreshToken &&
      storedToken?.accessToken === mockAccessToken &&
      storedToken?.scope === GMAIL_SCOPE;

    record(
      '3. OAuth2 Callback & Code Exchange (Mocked Google API)',
      passed,
      passed
        ? `Exchanged code, refresh token stored securely in Neon PostgreSQL (${storedToken?.id})`
        : `Callback status: ${callbackRes.status}, storedToken: ${Boolean(storedToken)}`
    );
  } catch (err: any) {
    record('3. OAuth2 Callback & Code Exchange (Mocked Google API)', false, err.message);
  } finally {
    GmailService.clearMockInterceptor();
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Access Token Automatic Refresh
  // ---------------------------------------------------------------------------
  try {
    // Manually expire access token in Neon DB
    await prisma.gmailOAuthToken.update({
      where: { id: 'default' },
      data: {
        accessToken: 'stale_expired_token_111',
        expiryDate: new Date(Date.now() - 60000), // Expired 1 min ago
      },
    });

    const newlyRefreshedToken = `refreshed_access_token_${Date.now()}`;

    // Setup Mock Interceptor for Token Refresh
    GmailService.setMockInterceptor((url, body) => {
      if (url.includes('oauth2.googleapis.com/token') && body.includes('grant_type=refresh_token')) {
        return Promise.resolve({
          access_token: newlyRefreshedToken,
          expires_in: 3600,
          scope: GMAIL_SCOPE,
          token_type: 'Bearer',
        });
      }
      return null;
    });

    const activeToken = await GmailService.getValidAccessToken();
    const updatedDbToken = await prisma.gmailOAuthToken.findUnique({ where: { id: 'default' } });

    const passed =
      activeToken === newlyRefreshedToken &&
      updatedDbToken?.accessToken === newlyRefreshedToken &&
      Boolean(updatedDbToken?.expiryDate && updatedDbToken.expiryDate > new Date());

    record(
      '4. Access Token Refresh Logic (Mocked Google API)',
      passed,
      passed
        ? `Expired token detected, refreshed via Google OAuth endpoint, updated in Neon DB with new expiry.`
        : `activeToken=${activeToken}, dbToken=${updatedDbToken?.accessToken}`
    );
  } catch (err: any) {
    record('4. Access Token Refresh Logic (Mocked Google API)', false, err.message);
  } finally {
    GmailService.clearMockInterceptor();
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Gmail API Email Sending & Neon Outbox Logging
  // ---------------------------------------------------------------------------
  try {
    const mockGmailMessageId = `gmail_msg_${Date.now()}`;
    let capturedRawPayload: any = null;

    // Setup Mock Interceptor for Gmail messages.send
    GmailService.setMockInterceptor((url, body, headers) => {
      if (url.includes('gmail.googleapis.com/gmail/v1/users/me/messages/send')) {
        capturedRawPayload = JSON.parse(body);
        return Promise.resolve({
          id: mockGmailMessageId,
          threadId: `thread_${Date.now()}`,
          labelIds: ['SENT'],
        });
      }
      return null;
    });

    const testRecipient = 'couple.test@grandbandhan.com';
    const testSubject = '👑 Royal Sangeet Invitation & Menu Tasting Schedule';

    const sendResult = await GmailService.sendEmail({
      to: testRecipient,
      subject: testSubject,
      html: '<h1>Welcome to Jagmandir Island Palace</h1><p>Your royal invitation is confirmed.</p>',
    });

    // Verify raw base64url payload was created
    const decodedMessage = Buffer.from(capturedRawPayload?.raw || '', 'base64').toString('utf-8');
    const hasRecipient = decodedMessage.includes(`To: ${testRecipient}`);
    const hasSubjectHeader = decodedMessage.includes('Subject:');
    const hasMimeVersion = decodedMessage.includes('MIME-Version: 1.0');

    // Verify logged in Neon DB EmailLog
    const emailLog = await prisma.emailLog.findFirst({
      where: { recipientEmail: testRecipient, providerMessageId: mockGmailMessageId },
      orderBy: { createdAt: 'desc' },
    });

    const passed =
      sendResult.messageId === mockGmailMessageId &&
      hasRecipient &&
      hasSubjectHeader &&
      hasMimeVersion &&
      Boolean(emailLog) &&
      emailLog?.status === 'DELIVERED';

    record(
      '5. Gmail API Email Sending & Neon EmailLog Audit',
      passed,
      passed
        ? `MIME formatted (RFC 2822), base64url encoded, dispatched with message ID ${mockGmailMessageId}, logged to Neon EmailLog.`
        : `hasRecipient=${hasRecipient}, hasMime=${hasMimeVersion}, emailLog=${Boolean(emailLog)}`
    );
  } catch (err: any) {
    record('5. Gmail API Email Sending & Neon EmailLog Audit', false, err.message);
  } finally {
    GmailService.clearMockInterceptor();
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Status Endpoint Security & Credential Sanitization
  // ---------------------------------------------------------------------------
  try {
    const statusRes = await fetchUrl(`${baseUrl}/api/email/status`, {
      headers: superAdminHeaders,
    });

    const data = statusRes.data?.data || {};
    const connected = data.connected === true;
    const hasSender = data.senderEmail === env.GMAIL_SENDER_EMAIL;
    const hasScope = data.scope === GMAIL_SCOPE;
    const hasRedirect = data.redirectUri === env.GOOGLE_REDIRECT_URI;

    // CRITICAL SECURITY ASSERTION: No secrets or tokens must EVER be exposed!
    const exposesRefreshToken = 'refreshToken' in data || 'refresh_token' in data;
    const exposesAccessToken = 'accessToken' in data || 'access_token' in data;
    const exposesClientSecret = 'clientSecret' in data || 'client_secret' in data;

    const noLeakage = !exposesRefreshToken && !exposesAccessToken && !exposesClientSecret;

    const passed = statusRes.status === 200 && connected && hasSender && hasScope && hasRedirect && noLeakage;

    record(
      '6. Status Endpoint Security & Credential Sanitization',
      passed,
      passed
        ? `Status 200: connected=true, sender=${data.senderEmail}, ZERO credentials/tokens leaked.`
        : `Validation failed: status=${statusRes.status}, noLeakage=${noLeakage}`
    );
  } catch (err: any) {
    record('6. Status Endpoint Security & Credential Sanitization', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 7: Authentication & RBAC Guardrails
  // ---------------------------------------------------------------------------
  try {
    // 7a. Unauthenticated status request -> 401
    const unauthStatus = await fetchUrl(`${baseUrl}/api/email/status`);
    const status401 = unauthStatus.status === 401;

    // 7b. Unauthenticated test send -> 401
    const unauthSend = await fetchUrl(`${baseUrl}/api/email/test`, {
      method: 'POST',
      body: { to: 'test@example.com' },
    });
    const send401 = unauthSend.status === 401;

    // 7c. Unauthenticated OAuth start -> 401
    const unauthStart = await fetchUrl(`${baseUrl}/api/email/oauth/start`);
    const start401 = unauthStart.status === 401;

    // 7d. Client role forbidden from status -> 403
    const clientStatus = await fetchUrl(`${baseUrl}/api/email/status`, {
      headers: { Authorization: `Bearer ${clientToken}`, Accept: 'application/json' },
    });
    const client403 = clientStatus.status === 403;

    // 7e. Client role forbidden from test send -> 403
    const clientSend = await fetchUrl(`${baseUrl}/api/email/test`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: { to: 'test@example.com' },
    });
    const clientSend403 = clientSend.status === 403;

    const passed = status401 && send401 && start401 && client403 && clientSend403;

    record(
      '7. Authentication & RBAC Role Protection',
      passed,
      passed
        ? 'Unauthenticated requests blocked (401), Client role blocked from admin operations (403).'
        : `Checks: status401=${status401}, send401=${send401}, start401=${start401}, client403=${client403}, clientSend403=${clientSend403}`
    );
  } catch (err: any) {
    record('7. Authentication & RBAC Role Protection', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n=============================================================');
  const passCount = results.filter((r) => r.passed).length;
  console.log(`GMAIL API TEST SUMMARY: ${passCount} / ${results.length} PASSED`);
  console.log('=============================================================\n');

  await prisma.$disconnect();
  server.close(() => {
    process.exit(passCount === results.length ? 0 : 1);
  });
}

setTimeout(() => {
  runGmailOAuthTests().catch((e) => {
    console.error('Fatal test error:', e);
    process.exit(1);
  });
}, 2000);
