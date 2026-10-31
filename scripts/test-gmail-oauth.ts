import http from 'http';
import { app, server } from '../apps/api/src/server';
import { getPrismaClient, checkDatabaseConnection } from '../apps/api/src/db';
import { env } from '../apps/api/src/config/env';
import { GmailService, GMAIL_SCOPE } from '../apps/api/src/modules/email/gmail.service';
import {
  encryptToken,
  decryptToken,
  isEncrypted,
  reencryptToken,
} from '../apps/api/src/modules/email/token-encryption';
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
  console.log('⚡ GRAND BANDHAN: GMAIL API OAUTH 2.0 HARDENING TEST SUITE ⚡');
  console.log('=============================================================\n');

  await checkDatabaseConnection();
  const prisma = getPrismaClient();
  const baseUrl = `http://localhost:${env.PORT}`;

  // Find or create test agency
  let testAgency = await prisma.agency.findFirst({
    where: { slug: 'royal-heritage-test' },
  });
  if (!testAgency) {
    testAgency = await prisma.agency.create({
      data: {
        name: 'Royal Heritage Test Agency',
        slug: 'royal-heritage-test',
        contactEmail: 'contact@royalheritagetest.com',
        status: 'APPROVED',
      },
    });
  }

  // Find or create test admin user in Neon DB
  let testAdminUser = await prisma.user.findFirst({
    where: { email: 'superadmin.test@grandbandhan.com' },
  });
  if (!testAdminUser) {
    testAdminUser = await prisma.user.create({
      data: {
        email: 'superadmin.test@grandbandhan.com',
        name: 'Super Admin Security Tester',
        passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz123456',
        role: UserRole.SUPER_ADMIN,
        agencyId: testAgency.id,
        isActive: true,
        accountStatus: 'ACTIVE',
      },
    });
  }

  const superAdminToken = generateAccessToken({
    userId: testAdminUser.id,
    agencyId: testAgency.id,
    email: testAdminUser.email,
    role: UserRole.SUPER_ADMIN,
    name: 'Super Admin Security Tester',
  });

  const agencyAdminToken = generateAccessToken({
    userId: testAdminUser.id,
    agencyId: testAgency.id,
    email: 'agencyadmin@royalheritagetest.com',
    role: UserRole.AGENCY_ADMIN,
    name: 'Agency Admin Tester',
  });

  const clientToken = generateAccessToken({
    userId: 'test_client_id',
    agencyId: testAgency.id,
    email: 'client@grandbandhan.com',
    role: UserRole.CLIENT,
    name: 'Client User Test',
  });

  const superAdminHeaders = {
    Authorization: `Bearer ${superAdminToken}`,
    Accept: 'application/json',
  };

  // ---------------------------------------------------------------------------
  // TEST 1: Rejection of JWT in URL Query Parameters (?token=...)
  // ---------------------------------------------------------------------------
  try {
    // Attempt to access protected endpoint using query parameter ?token=...
    const queryTokenRes = await fetchUrl(
      `${baseUrl}/api/email/status?token=${superAdminToken}`,
      { headers: { Accept: 'application/json' } }
    );

    // OWASP A07 compliance: Tokens in URLs must NEVER be authenticated
    const passed = queryTokenRes.status === 401;

    record(
      '1. OWASP A07: Reject JWT in URL Query Parameters',
      passed,
      passed
        ? `HTTP 401 correctly returned when access token was sent via ?token=... (Query param auth eradicated)`
        : `Vulnerability: Status ${queryTokenRes.status} returned instead of 401 Unauthorized`
    );
  } catch (err: any) {
    record('1. OWASP A07: Reject JWT in URL Query Parameters', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Single-Use Authorization Handoff Ticket Flow
  // ---------------------------------------------------------------------------
  try {
    // 2a. Generate handoff ticket with admin credentials via POST
    const handoffRes = await fetchUrl(`${baseUrl}/api/email/oauth/handoff`, {
      method: 'POST',
      headers: superAdminHeaders,
    });

    const ticket = handoffRes.data?.data?.ticket;
    const startUrl = handoffRes.data?.data?.startUrl;

    const hasTicket = Boolean(ticket && typeof ticket === 'string' && ticket.length === 64);
    const hasValidUrl = Boolean(startUrl && startUrl.includes(ticket));

    // 2b. Consume handoff ticket on /oauth/start (Simulate browser redirect)
    const consumeRes = await fetchUrl(`${baseUrl}/api/email/oauth/start?ticket=${ticket}`, {
      headers: { Accept: 'application/json' },
    });
    const firstConsumePassed = consumeRes.status === 200 && Boolean(consumeRes.data?.data?.url);

    // 2c. Replay attack: attempt to use the exact same ticket a second time
    const replayRes = await fetchUrl(`${baseUrl}/api/email/oauth/start?ticket=${ticket}`, {
      headers: { Accept: 'application/json' },
    });
    const replayBlocked = replayRes.status === 401;

    // 2d. Fake arbitrary ticket must be rejected
    const fakeRes = await fetchUrl(`${baseUrl}/api/email/oauth/start?ticket=attacker_fake_ticket_99999`, {
      headers: { Accept: 'application/json' },
    });
    const fakeBlocked = fakeRes.status === 401;

    const passed = hasTicket && hasValidUrl && firstConsumePassed && replayBlocked && fakeBlocked;

    record(
      '2. Single-Use Authorization Handoff Ticket Flow',
      passed,
      passed
        ? `Handoff ticket generated (64 hex chars), consumed on /oauth/start (HTTP 200), replay blocked (HTTP 401), fake ticket blocked (HTTP 401).`
        : `Details: hasTicket=${hasTicket}, firstConsume=${firstConsumePassed}, replayBlocked=${replayBlocked}, fakeBlocked=${fakeBlocked}`
    );
  } catch (err: any) {
    record('2. Single-Use Authorization Handoff Ticket Flow', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 3: AES-256-GCM Envelope Encryption at Rest in Neon DB
  // ---------------------------------------------------------------------------
  try {
    const rawPlainToken = 'sample_high_entropy_google_refresh_token_1234567890';
    const encryptedEnvelope = encryptToken(rawPlainToken);

    // Verify envelope format: enc:<version>:<iv_hex>:<tag_hex>:<cipher_hex>
    const isFormatValid = isEncrypted(encryptedEnvelope);
    const parts = encryptedEnvelope.split(':');
    const versionMatch = parts[1] === 'v1';
    const ivLengthMatch = parts[2].length === 24; // 12 bytes * 2 hex chars
    const tagLengthMatch = parts[3].length === 32; // 16 bytes auth tag * 2 hex chars

    // Decrypt and verify round-trip integrity
    const decrypted = decryptToken(encryptedEnvelope);
    const roundTripMatches = decrypted === rawPlainToken;

    // Tamper resistance test (authenticated encryption check)
    let tamperDetected = false;
    try {
      const tamperedParts = [...parts];
      tamperedParts[4] = tamperedParts[4].substring(0, tamperedParts[4].length - 2) + 'ff'; // Modify ciphertext
      decryptToken(tamperedParts.join(':'));
    } catch {
      tamperDetected = true;
    }

    // Key rotation verification: re-encrypt under v2
    process.env.GMAIL_TOKEN_ENCRYPTION_KEY_V2 = 'b4c7e8f1a2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9';
    const v2Encrypted = reencryptToken(encryptedEnvelope, 'v2');
    const isV2 = v2Encrypted.startsWith('enc:v2:');
    const v2Decrypted = decryptToken(v2Encrypted);
    const v2Matches = v2Decrypted === rawPlainToken;

    const passed =
      isFormatValid &&
      versionMatch &&
      ivLengthMatch &&
      tagLengthMatch &&
      roundTripMatches &&
      tamperDetected &&
      isV2 &&
      v2Matches;

    record(
      '3. AES-256-GCM Envelope Encryption & Key Rotation',
      passed,
      passed
        ? `Envelope valid (enc:v1:iv:tag:cipher), round-trip verified, ciphertext tampering rejected, key rotation to v2 seamless.`
        : `Checks: format=${isFormatValid}, v1=${versionMatch}, roundTrip=${roundTripMatches}, tamperDetected=${tamperDetected}, v2Matches=${v2Matches}`
    );
  } catch (err: any) {
    record('3. AES-256-GCM Envelope Encryption & Key Rotation', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: CSRF State Validation & Expiry
  // ---------------------------------------------------------------------------
  try {
    const { state: testState } = await GmailService.generateAuthUrl(testAdminUser.id, testAgency.id);

    // First validation must succeed and return bound context
    const firstCheck = await GmailService.validateAndConsumeState(testState);
    const contextValid =
      firstCheck !== null &&
      firstCheck.userId === testAdminUser.id &&
      firstCheck.agencyId === testAgency.id;

    // Replay attack with same state must fail (already consumed)
    const replayCheck = await GmailService.validateAndConsumeState(testState);

    // Expired state test
    const expiredState = 'expired_nonce_' + Date.now();
    await prisma.oAuthState.create({
      data: {
        state: expiredState,
        userId: testAdminUser.id,
        expiresAt: new Date(Date.now() - 5000), // Expired 5 seconds ago
      },
    });
    const expiredCheck = await GmailService.validateAndConsumeState(expiredState);

    const passed = contextValid && replayCheck === null && expiredCheck === null;

    record(
      '4. CSRF State Validation & Context Binding',
      passed,
      passed
        ? `State validated with bound admin (${testAdminUser.id}) and agency (${testAgency.id}), replay prevented, expired rejected.`
        : `Checks: contextValid=${contextValid}, replayNull=${replayCheck === null}, expiredNull=${expiredCheck === null}`
    );
  } catch (err: any) {
    record('4. CSRF State Validation & Context Binding', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: OAuth2 Callback Handling & Encrypted Token Storage
  // ---------------------------------------------------------------------------
  try {
    const { state: callbackState } = await GmailService.generateAuthUrl(testAdminUser.id, testAgency.id);

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
      `${baseUrl}/api/email/oauth2/callback?code=mock_auth_code_sec_check&state=${callbackState}`,
      { headers: { Accept: 'application/json' } }
    );

    // Verify token was stored ENCRYPTED in Neon PostgreSQL under agency key
    const tokenId = `agency_${testAgency.id}`;
    const storedToken = await prisma.gmailOAuthToken.findUnique({ where: { id: tokenId } });

    const isStoredEncrypted = Boolean(storedToken?.refreshToken && isEncrypted(storedToken.refreshToken));
    const decryptedRefresh = storedToken?.refreshToken ? decryptToken(storedToken.refreshToken) : null;
    const decryptedAccess = storedToken?.accessToken ? decryptToken(storedToken.accessToken) : null;

    const passed =
      callbackRes.status === 200 &&
      isStoredEncrypted &&
      decryptedRefresh === mockRefreshToken &&
      decryptedAccess === mockAccessToken &&
      storedToken?.agencyId === testAgency.id;

    record(
      '5. OAuth2 Callback & Encrypted Storage at Rest',
      passed,
      passed
        ? `Tokens encrypted at rest in Neon DB (${storedToken?.refreshToken?.slice(0, 20)}...), decrypted correctly in memory, agency isolation confirmed.`
        : `Checks: status=${callbackRes.status}, encrypted=${isStoredEncrypted}, refreshMatch=${decryptedRefresh === mockRefreshToken}`
    );
  } catch (err: any) {
    record('5. OAuth2 Callback & Encrypted Storage at Rest', false, err.message);
  } finally {
    GmailService.clearMockInterceptor();
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Callback Security Checks: Deactivated User / Suspended Agency
  // ---------------------------------------------------------------------------
  try {
    // 6a. State bound to deactivated user must fail callback
    const deactivatedUser = await prisma.user.create({
      data: {
        email: `deactivated_${Date.now()}@test.com`,
        name: 'Deactivated User',
        passwordHash: 'hash',
        role: UserRole.AGENCY_ADMIN,
        agencyId: testAgency.id,
        isActive: false, // Inactive!
        accountStatus: 'SUSPENDED',
      },
    });

    const { state: deactivatedState } = await GmailService.generateAuthUrl(deactivatedUser.id, testAgency.id);
    const deactivatedRes = await fetchUrl(
      `${baseUrl}/api/email/oauth2/callback?code=mock_code&state=${deactivatedState}`,
      { headers: { Accept: 'application/json' } }
    );
    const userDeactivatedBlocked = deactivatedRes.status === 403;

    // 6b. State bound to suspended agency must fail callback
    const suspendedAgency = await prisma.agency.create({
      data: {
        name: 'Suspended Test Agency',
        slug: `suspended-agency-${Date.now()}`,
        contactEmail: 'contact@suspended.com',
        status: 'SUSPENDED', // Suspended!
      },
    });

    const { state: suspendedState } = await GmailService.generateAuthUrl(testAdminUser.id, suspendedAgency.id);
    const suspendedRes = await fetchUrl(
      `${baseUrl}/api/email/oauth2/callback?code=mock_code&state=${suspendedState}`,
      { headers: { Accept: 'application/json' } }
    );
    const agencySuspendedBlocked = suspendedRes.status === 403;

    const passed = userDeactivatedBlocked && agencySuspendedBlocked;

    record(
      '6. Callback Security: Deactivated User & Suspended Agency Guard',
      passed,
      passed
        ? 'OAuth callback rejected when initiating admin is inactive (HTTP 403) or agency is suspended (HTTP 403).'
        : `userDeactivatedBlocked=${userDeactivatedBlocked}, agencySuspendedBlocked=${agencySuspendedBlocked}`
    );
  } catch (err: any) {
    record('6. Callback Security: Deactivated User & Suspended Agency Guard', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 7: Access Token Refresh with Encrypted Storage
  // ---------------------------------------------------------------------------
  try {
    const tokenId = `agency_${testAgency.id}`;
    // Manually set expired token
    await prisma.gmailOAuthToken.update({
      where: { id: tokenId },
      data: {
        accessToken: encryptToken('expired_cached_token'),
        expiryDate: new Date(Date.now() - 60000), // Expired
      },
    });

    const refreshedTokenValue = `newly_refreshed_access_${Date.now()}`;

    GmailService.setMockInterceptor((url, body) => {
      if (url.includes('oauth2.googleapis.com/token') && body.includes('grant_type=refresh_token')) {
        return Promise.resolve({
          access_token: refreshedTokenValue,
          expires_in: 3600,
          scope: GMAIL_SCOPE,
          token_type: 'Bearer',
        });
      }
      return null;
    });

    const activeToken = await GmailService.getValidAccessToken(testAgency.id);
    const updatedRecord = await prisma.gmailOAuthToken.findUnique({ where: { id: tokenId } });

    const dbTokenEncrypted = Boolean(updatedRecord?.accessToken && isEncrypted(updatedRecord.accessToken));
    const decryptedToken = updatedRecord?.accessToken ? decryptToken(updatedRecord.accessToken) : null;

    const passed =
      activeToken === refreshedTokenValue &&
      dbTokenEncrypted &&
      decryptedToken === refreshedTokenValue;

    record(
      '7. Access Token Refresh with Re-Encryption',
      passed,
      passed
        ? 'Refreshed access token received, encrypted with AES-256-GCM before DB write, returned decrypted in memory.'
        : `activeToken=${activeToken}, encrypted=${dbTokenEncrypted}, decrypted=${decryptedToken}`
    );
  } catch (err: any) {
    record('7. Access Token Refresh with Re-Encryption', false, err.message);
  } finally {
    GmailService.clearMockInterceptor();
  }

  // ---------------------------------------------------------------------------
  // TEST 8: Gmail API Send & Agency-Isolated Outbox Logging
  // ---------------------------------------------------------------------------
  try {
    const mockGmailMessageId = `msg_hardened_${Date.now()}`;
    let capturedRaw: any = null;

    GmailService.setMockInterceptor((url, body) => {
      if (url.includes('gmail.googleapis.com/gmail/v1/users/me/messages/send')) {
        capturedRaw = JSON.parse(body);
        return Promise.resolve({
          id: mockGmailMessageId,
          threadId: `thread_${Date.now()}`,
        });
      }
      return null;
    });

    const recipient = 'vip.couple@udaipurweddings.com';
    const sendResult = await GmailService.sendEmail({
      to: recipient,
      subject: '👑 Private Villa Booking Confirmation',
      html: '<h1>Booking Confirmed</h1>',
      agencyId: testAgency.id,
    });

    const emailLog = await prisma.emailLog.findFirst({
      where: { providerMessageId: mockGmailMessageId },
    });

    const passed =
      sendResult.messageId === mockGmailMessageId &&
      Boolean(emailLog) &&
      emailLog?.agencyId === testAgency.id &&
      emailLog?.status === 'DELIVERED';

    record(
      '8. Multi-Tenant Outbox Dispatch & EmailLog Audit',
      passed,
      passed
        ? `Dispatched via Gmail API, recorded to Neon EmailLog with strict agency binding (${testAgency.id}).`
        : `Checks: sendResult=${sendResult.messageId}, log=${Boolean(emailLog)}, agencyIdMatch=${emailLog?.agencyId === testAgency.id}`
    );
  } catch (err: any) {
    record('8. Multi-Tenant Outbox Dispatch & EmailLog Audit', false, err.message);
  } finally {
    GmailService.clearMockInterceptor();
  }

  // ---------------------------------------------------------------------------
  // TEST 9: Status Endpoint Agency Isolation & Sanitization
  // ---------------------------------------------------------------------------
  try {
    // 9a. Agency Admin queries status -> isolated to testAgency
    const agencyStatusRes = await fetchUrl(`${baseUrl}/api/email/status`, {
      headers: { Authorization: `Bearer ${agencyAdminToken}`, Accept: 'application/json' },
    });

    const statusData = agencyStatusRes.data?.data || {};

    const noLeakedKeys =
      !('refreshToken' in statusData) &&
      !('accessToken' in statusData) &&
      !('clientSecret' in statusData) &&
      !('encryptionKey' in statusData);

    const reportsEncryption = statusData.tokenEncrypted === true;
    const reportsAgency = statusData.isAgencyDedicated === true && statusData.agencyId === testAgency.id;

    const passed = agencyStatusRes.status === 200 && noLeakedKeys && reportsEncryption && reportsAgency;

    record(
      '9. Status Endpoint Agency Isolation & Zero Leakage',
      passed,
      passed
        ? `Status 200: tokenEncrypted=true, agencyId=${statusData.agencyId}, ZERO credentials/secrets leaked.`
        : `Checks: status=${agencyStatusRes.status}, noLeakedKeys=${noLeakedKeys}, reportsEncryption=${reportsEncryption}, reportsAgency=${reportsAgency}`
    );
  } catch (err: any) {
    record('9. Status Endpoint Agency Isolation & Zero Leakage', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 10: RBAC & Agency Isolation on Test Endpoint
  // ---------------------------------------------------------------------------
  try {
    // 10a. Unauthenticated test send -> 401
    const unauthRes = await fetchUrl(`${baseUrl}/api/email/test`, {
      method: 'POST',
      body: { to: 'nobody@test.com' },
    });
    const unauth401 = unauthRes.status === 401;

    // 10b. Client role -> 403
    const clientRes = await fetchUrl(`${baseUrl}/api/email/test`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clientToken}` },
      body: { to: 'nobody@test.com' },
    });
    const client403 = clientRes.status === 403;

    // 10c. Agency Admin test send: attempts to spoof another agencyId -> must remain isolated to their agency
    GmailService.setMockInterceptor((url) => {
      if (url.includes('gmail.googleapis.com/gmail/v1/users/me/messages/send')) {
        return Promise.resolve({ id: `msg_spoof_test_${Date.now()}` });
      }
      return null;
    });

    const agencyAdminSendRes = await fetchUrl(`${baseUrl}/api/email/test`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${agencyAdminToken}` },
      body: {
        to: 'tester@royalheritagetest.com',
        agencyId: 'attacker_spoofed_agency_99999', // Attacker attempts to spoof agency
      },
    });

    const spoofBlocked = agencyAdminSendRes.status === 200; // Sent under their genuine agency
    // Check EmailLog to verify the spoofed agencyId was NOT used
    const latestTestLog = await prisma.emailLog.findFirst({
      where: { recipientEmail: 'tester@royalheritagetest.com' },
      orderBy: { createdAt: 'desc' },
    });
    const antiSpoofingConfirmed = latestTestLog?.agencyId === testAgency.id; // Bound to real agency!

    const passed = unauth401 && client403 && spoofBlocked && antiSpoofingConfirmed;

    record(
      '10. RBAC Protection & Anti-Spoofing Agency Guardrails',
      passed,
      passed
        ? `Unauthenticated blocked (401), Client role blocked (403), Agency Admin forced to genuine agency binding (anti-spoofing passed).`
        : `Checks: unauth401=${unauth401}, client403=${client403}, spoofBlocked=${spoofBlocked}, antiSpoofingConfirmed=${antiSpoofingConfirmed}`
    );
  } catch (err: any) {
    record('10. RBAC Protection & Anti-Spoofing Agency Guardrails', false, err.message);
  } finally {
    GmailService.clearMockInterceptor();
  }

  // ---------------------------------------------------------------------------
  // TEST 11: Concurrent Race Condition Resistance (Atomic Consumption)
  // ---------------------------------------------------------------------------
  try {
    const { ticket: raceTicket } = await GmailService.createHandoffTicket(testAdminUser.id, testAgency.id);

    // Launch 5 simultaneous requests attempting to consume the exact same ticket
    const promises = Array.from({ length: 5 }, () =>
      fetchUrl(`${baseUrl}/api/email/oauth/start?ticket=${raceTicket}`, {
        headers: { Accept: 'application/json' },
      })
    );

    const raceResponses = await Promise.all(promises);
    const successCount = raceResponses.filter((res) => res.status === 200).length;
    const rejectedCount = raceResponses.filter((res) => res.status === 401).length;

    const passed = successCount === 1 && rejectedCount === 4;

    record(
      '11. Atomic Ticket Consumption (Concurrent Race Condition Test)',
      passed,
      passed
        ? `Out of 5 simultaneous requests, exactly 1 succeeded (HTTP 200) and 4 were atomically rejected (HTTP 401). Zero race condition window.`
        : `Race results: success=${successCount}, rejected=${rejectedCount} (Expected: 1 success, 4 rejected)`
    );
  } catch (err: any) {
    record('11. Atomic Ticket Consumption (Concurrent Race Condition Test)', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 12: Corrupted Envelope & Bad Key Tamper Rejection
  // ---------------------------------------------------------------------------
  try {
    const validCipher = encryptToken('secret_token_to_tamper');

    // 12a. Corrupted format (missing parts)
    let badFormatThrown = false;
    try {
      decryptToken('enc:invalid:short');
    } catch {
      badFormatThrown = true;
    }

    // 12b. Tampered Auth Tag
    let badTagThrown = false;
    try {
      const parts = validCipher.split(':');
      parts[3] = '00000000000000000000000000000000'; // Replace auth tag with zeroes
      decryptToken(parts.join(':'));
    } catch {
      badTagThrown = true;
    }

    // 12c. Truncated Ciphertext
    let truncatedThrown = false;
    try {
      const parts = validCipher.split(':');
      parts[4] = parts[4].slice(0, 8); // Truncate ciphertext
      decryptToken(parts.join(':'));
    } catch {
      truncatedThrown = true;
    }

    const passed = badFormatThrown && badTagThrown && truncatedThrown;

    record(
      '12. Cryptographic Integrity: Tamper & Truncation Rejection',
      passed,
      passed
        ? 'Malformed envelopes, corrupted auth tags, and truncated ciphertexts rejected by AES-GCM verification.'
        : `badFormat=${badFormatThrown}, badTag=${badTagThrown}, truncated=${truncatedThrown}`
    );
  } catch (err: any) {
    record('12. Cryptographic Integrity: Tamper & Truncation Rejection', false, err.message);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n=============================================================');
  const passCount = results.filter((r) => r.passed).length;
  console.log(`GMAIL HARDENING TEST SUMMARY: ${passCount} / ${results.length} PASSED`);
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
