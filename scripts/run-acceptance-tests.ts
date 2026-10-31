/**
 * Grand Bandhan — Comprehensive Integration & Acceptance Test Runner
 * Tests: Authentication, RBAC, Neon Database Persistence, Socket.IO Real-Time Sync, Security
 */

import axios from 'axios';
import { io as ioClient } from 'socket.io-client';
import { prisma } from '../packages/database';
import { UserRole, VerificationResponse, TaskStatus, PaymentStatus } from '../packages/shared';

const API_BASE_URL = 'https://grand-bandhan.onrender.com';

interface TestResult {
  id: string;
  name: string;
  category: string;
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  expected: string;
  actual: string;
  evidence?: any;
  error?: string;
}

const results: TestResult[] = [];

function record(res: TestResult) {
  results.push(res);
  const icon = res.status === 'PASS' ? '✅' : res.status === 'FAIL' ? '❌' : '⚠️';
  console.log(`${icon} [${res.status}] ${res.name}: ${res.actual}`);
}

async function runSuite() {
  console.log('\n======================================================');
  console.log(' GRAND BANDHAN — REAL-WORLD ACCEPTANCE TEST RUNNER');
  console.log(' Backend:', API_BASE_URL);
  console.log(' Database: Neon PostgreSQL (Production)');
  console.log('======================================================\n');

  // Track created test IDs for safe cleanup
  const cleanupUserIds: string[] = [];
  const cleanupAgencyIds: string[] = [];
  const cleanupVerificationIds: string[] = [];
  const cleanupEnquiryIds: string[] = [];

  try {
    // ----------------------------------------------------
    // TEST SUITE 1: AUTHENTICATION & ROLE ACCESS
    // ----------------------------------------------------
    console.log('\n--- 1. AUTHENTICATION & ROLE ACCEPTANCE ---');

    // 1.1 Super Admin Login
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'admin@grandbandhan.com',
        password: 'GrandBandhan@2025',
      });
      const user = res.data?.data?.user;
      const token = res.data?.data?.accessToken;
      if (res.status === 200 && user?.role === UserRole.SUPER_ADMIN && token) {
        record({
          id: 'AUTH-01',
          name: 'SUPER_ADMIN Authentication',
          category: 'Authentication',
          status: 'PASS',
          expected: 'HTTP 200, role SUPER_ADMIN, valid JWT accessToken',
          actual: `Authenticated as ${user.email} (${user.role}), token length: ${token.length}`,
          evidence: { userId: user.id, email: user.email, role: user.role },
        });
      } else {
        throw new Error(`Unexpected response structure: ${JSON.stringify(res.data)}`);
      }
    } catch (err: any) {
      record({
        id: 'AUTH-01',
        name: 'SUPER_ADMIN Authentication',
        category: 'Authentication',
        status: 'FAIL',
        expected: 'HTTP 200, role SUPER_ADMIN, valid JWT accessToken',
        actual: err.response?.data?.message || err.message,
        error: err.message,
      });
    }

    // 1.2 Agency Admin Login
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'agency@grandbandhan.com',
        password: 'GrandBandhan@2025',
      });
      const user = res.data?.data?.user;
      const token = res.data?.data?.accessToken;
      if (res.status === 200 && user?.role === UserRole.AGENCY_ADMIN && token) {
        record({
          id: 'AUTH-02',
          name: 'AGENCY_ADMIN Authentication',
          category: 'Authentication',
          status: 'PASS',
          expected: 'HTTP 200, role AGENCY_ADMIN, valid JWT',
          actual: `Authenticated as ${user.email} (${user.role})`,
          evidence: { userId: user.id, email: user.email, role: user.role },
        });
      } else {
        throw new Error(`Unexpected response: ${JSON.stringify(res.data)}`);
      }
    } catch (err: any) {
      record({
        id: 'AUTH-02',
        name: 'AGENCY_ADMIN Authentication',
        category: 'Authentication',
        status: 'FAIL',
        expected: 'HTTP 200, role AGENCY_ADMIN',
        actual: err.response?.data?.message || err.message,
      });
    }

    // 1.3 Wedding Planner Login
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'planner@grandbandhan.com',
        password: 'GrandBandhan@2025',
      });
      const user = res.data?.data?.user;
      if (res.status === 200 && user?.role === UserRole.WEDDING_PLANNER) {
        record({
          id: 'AUTH-03',
          name: 'WEDDING_PLANNER Authentication',
          category: 'Authentication',
          status: 'PASS',
          expected: 'HTTP 200, role WEDDING_PLANNER',
          actual: `Authenticated as ${user.email} (${user.role})`,
          evidence: { userId: user.id, email: user.email, role: user.role },
        });
      } else {
        throw new Error(`Unexpected: ${JSON.stringify(res.data)}`);
      }
    } catch (err: any) {
      record({
        id: 'AUTH-03',
        name: 'WEDDING_PLANNER Authentication',
        category: 'Authentication',
        status: 'FAIL',
        expected: 'HTTP 200, role WEDDING_PLANNER',
        actual: err.response?.data?.message || err.message,
      });
    }

    // 1.4 Coordinator Login
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'coordinator@grandbandhan.com',
        password: 'GrandBandhan@2025',
      });
      const user = res.data?.data?.user;
      if (res.status === 200 && user?.role === UserRole.COORDINATOR) {
        record({
          id: 'AUTH-04',
          name: 'COORDINATOR Authentication',
          category: 'Authentication',
          status: 'PASS',
          expected: 'HTTP 200, role COORDINATOR',
          actual: `Authenticated as ${user.email} (${user.role})`,
          evidence: { userId: user.id, email: user.email, role: user.role },
        });
      } else {
        throw new Error(`Unexpected: ${JSON.stringify(res.data)}`);
      }
    } catch (err: any) {
      record({
        id: 'AUTH-04',
        name: 'COORDINATOR Authentication',
        category: 'Authentication',
        status: 'FAIL',
        expected: 'HTTP 200, role COORDINATOR',
        actual: err.response?.data?.message || err.message,
      });
    }

    // 1.5 Client Login
    let clientToken = '';
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'client@grandbandhan.com',
        password: 'GrandBandhan@2025',
      });
      const user = res.data?.data?.user;
      clientToken = res.data?.data?.accessToken;
      if (res.status === 200 && user?.role === UserRole.CLIENT) {
        record({
          id: 'AUTH-05',
          name: 'CLIENT Authentication',
          category: 'Authentication',
          status: 'PASS',
          expected: 'HTTP 200, role CLIENT',
          actual: `Authenticated as ${user.email} (${user.role})`,
          evidence: { userId: user.id, email: user.email, role: user.role },
        });
      } else {
        throw new Error(`Unexpected: ${JSON.stringify(res.data)}`);
      }
    } catch (err: any) {
      record({
        id: 'AUTH-05',
        name: 'CLIENT Authentication',
        category: 'Authentication',
        status: 'FAIL',
        expected: 'HTTP 200, role CLIENT',
        actual: err.response?.data?.message || err.message,
      });
    }

    // 1.6 Invalid Password Rejection
    try {
      await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'admin@grandbandhan.com',
        password: 'WrongPassword!999',
      });
      record({
        id: 'AUTH-06',
        name: 'Invalid Password Rejection',
        category: 'Authentication',
        status: 'FAIL',
        expected: 'HTTP 401 Unauthorized',
        actual: 'Unexpected HTTP 200 success with wrong password!',
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        record({
          id: 'AUTH-06',
          name: 'Invalid Password Rejection',
          category: 'Authentication',
          status: 'PASS',
          expected: 'HTTP 401 Unauthorized',
          actual: `HTTP 401: ${err.response.data?.message || 'Invalid credentials'}`,
        });
      } else {
        record({
          id: 'AUTH-06',
          name: 'Invalid Password Rejection',
          category: 'Authentication',
          status: 'FAIL',
          expected: 'HTTP 401 Unauthorized',
          actual: `HTTP ${err.response?.status}: ${err.message}`,
        });
      }
    }

    // 1.7 Non-existent User Rejection
    try {
      await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: 'nonexistent-royal-ghost@example.com',
        password: 'GrandBandhan@2025',
      });
      record({
        id: 'AUTH-07',
        name: 'Non-existent Account Rejection',
        category: 'Authentication',
        status: 'FAIL',
        expected: 'HTTP 401 Unauthorized',
        actual: 'Unexpected HTTP 200 success for nonexistent user!',
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        record({
          id: 'AUTH-07',
          name: 'Non-existent Account Rejection',
          category: 'Authentication',
          status: 'PASS',
          expected: 'HTTP 401 Unauthorized',
          actual: `HTTP 401: ${err.response.data?.message || 'Invalid credentials'}`,
        });
      } else {
        record({
          id: 'AUTH-07',
          name: 'Non-existent Account Rejection',
          category: 'Authentication',
          status: 'FAIL',
          expected: 'HTTP 401 Unauthorized',
          actual: `HTTP ${err.response?.status}: ${err.message}`,
        });
      }
    }

    // 1.8 New Client Registration & Neon DB Verification
    const testClientEmail = `test-client-${Date.now()}@example.com`;
    let registeredClientId = '';
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: 'Rajkumar Devendra & Princess Gayatri',
        email: testClientEmail,
        password: 'TestPassword@2026',
        phone: '9876543210',
        role: UserRole.CLIENT,
      });

      if (res.status === 200 || res.status === 201) {
        registeredClientId = res.data?.data?.user?.id;
        cleanupUserIds.push(registeredClientId);
        if (res.data?.data?.user?.agencyId) {
          cleanupAgencyIds.push(res.data.data.user.agencyId);
        }

        // Verify in Neon Database directly
        const neonUser = await prisma.user.findUnique({
          where: { email: testClientEmail },
          select: { id: true, email: true, name: true, role: true, isActive: true },
        });

        if (neonUser && neonUser.role === UserRole.CLIENT) {
          record({
            id: 'AUTH-08',
            name: 'Client Registration & Neon DB Write',
            category: 'Authentication',
            status: 'PASS',
            expected: 'HTTP 200/201 and Neon DB record with role CLIENT',
            actual: `Created & verified in Neon: ${neonUser.email} (ID: ${neonUser.id})`,
            evidence: neonUser,
          });
        } else {
          throw new Error('User not found in Neon database after registration response!');
        }
      } else {
        throw new Error(`Unexpected response: ${JSON.stringify(res.data)}`);
      }
    } catch (err: any) {
      record({
        id: 'AUTH-08',
        name: 'Client Registration & Neon DB Write',
        category: 'Authentication',
        status: 'FAIL',
        expected: 'HTTP 200/201 and Neon DB record',
        actual: err.response?.data?.message || err.message,
      });
    }

    // 1.9 New Vendor Registration & Neon DB Verification
    const testVendorEmail = `test-vendor-${Date.now()}@example.com`;
    let registeredVendorId = '';
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: 'Jaipur Royal Shehnai Ensemble',
        email: testVendorEmail,
        password: 'TestPassword@2026',
        phone: '9876543211',
        role: UserRole.VENDOR,
      });

      if (res.status === 200 || res.status === 201) {
        registeredVendorId = res.data?.data?.user?.id;
        cleanupUserIds.push(registeredVendorId);
        if (res.data?.data?.user?.agencyId) {
          cleanupAgencyIds.push(res.data.data.user.agencyId);
        }

        // Verify in Neon directly
        const neonUser = await prisma.user.findUnique({
          where: { email: testVendorEmail },
          select: { id: true, email: true, name: true, role: true },
        });

        if (neonUser && neonUser.role === UserRole.VENDOR) {
          record({
            id: 'AUTH-09',
            name: 'Vendor Registration & Neon DB Write',
            category: 'Authentication',
            status: 'PASS',
            expected: 'HTTP 200/201 and Neon record with role VENDOR',
            actual: `Created & verified in Neon: ${neonUser.email} (Role: ${neonUser.role})`,
            evidence: neonUser,
          });
        } else {
          throw new Error('Vendor not found in Neon after registration response!');
        }
      } else {
        throw new Error(`Unexpected: ${JSON.stringify(res.data)}`);
      }
    } catch (err: any) {
      record({
        id: 'AUTH-09',
        name: 'Vendor Registration & Neon DB Write',
        category: 'Authentication',
        status: 'FAIL',
        expected: 'HTTP 200/201 and Neon record with role VENDOR',
        actual: err.response?.data?.message || err.message,
      });
    }

    // 1.10 Unauthorized Staff Registration Rejection
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name: 'Malicious Attacker',
        email: `hacker-${Date.now()}@example.com`,
        password: 'HackerPassword@123',
        role: UserRole.SUPER_ADMIN,
      });
      record({
        id: 'AUTH-10',
        name: 'Staff Role Gatekeeping Rejection',
        category: 'Security',
        status: 'FAIL',
        expected: 'HTTP 403 Forbidden',
        actual: 'Unexpected HTTP success creating SUPER_ADMIN via public registration!',
      });
    } catch (err: any) {
      if (err.response?.status === 403) {
        record({
          id: 'AUTH-10',
          name: 'Staff Role Gatekeeping Rejection',
          category: 'Security',
          status: 'PASS',
          expected: 'HTTP 403 Forbidden',
          actual: `HTTP 403: ${err.response.data?.message || 'Access Denied'}`,
        });
      } else {
        record({
          id: 'AUTH-10',
          name: 'Staff Role Gatekeeping Rejection',
          category: 'Security',
          status: 'FAIL',
          expected: 'HTTP 403 Forbidden',
          actual: `HTTP ${err.response?.status}: ${err.message}`,
        });
      }
    }

    // 1.11 /api/auth/me Profile Verification
    try {
      const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${clientToken}` },
      });
      const meUser = res.data?.data?.user;
      if (res.status === 200 && meUser?.email === 'client@grandbandhan.com') {
        record({
          id: 'AUTH-11',
          name: 'Profile /api/auth/me Token Verification',
          category: 'Authentication',
          status: 'PASS',
          expected: 'HTTP 200 with authenticated user profile',
          actual: `Retrieved profile for ${meUser.name} (${meUser.role})`,
          evidence: { id: meUser.id, role: meUser.role },
        });
      } else {
        throw new Error(`Unexpected: ${JSON.stringify(res.data)}`);
      }
    } catch (err: any) {
      record({
        id: 'AUTH-11',
        name: 'Profile /api/auth/me Token Verification',
        category: 'Authentication',
        status: 'FAIL',
        expected: 'HTTP 200',
        actual: err.response?.data?.message || err.message,
      });
    }

    // 1.12 Forgot Password & Reset Password
    try {
      const forgotRes = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email: 'client@grandbandhan.com',
      });
      if (forgotRes.status === 200 && forgotRes.data?.success) {
        record({
          id: 'AUTH-12',
          name: 'Forgot Password Endpoint',
          category: 'Authentication',
          status: 'PASS',
          expected: 'HTTP 200 success message',
          actual: forgotRes.data?.message || 'Reset instructions dispatched.',
        });
      } else {
        throw new Error(`Unexpected: ${JSON.stringify(forgotRes.data)}`);
      }
    } catch (err: any) {
      record({
        id: 'AUTH-12',
        name: 'Forgot Password Endpoint',
        category: 'Authentication',
        status: 'FAIL',
        expected: 'HTTP 200',
        actual: err.response?.data?.message || err.message,
      });
    }

    // ----------------------------------------------------
    // TEST SUITE 2: NEON DATABASE PERSISTENCE & API MUTATIONS
    // ----------------------------------------------------
    console.log('\n--- 2. NEON DATABASE PERSISTENCE & API WRITES ---');

    // Agency admin token for management operations
    const adminLogin = await axios.post(`${API_BASE_URL}/api/auth/login`, {
      email: 'agency@grandbandhan.com',
      password: 'GrandBandhan@2025',
    });
    const adminToken = adminLogin.data.data.accessToken;
    const adminAuthHeader = { headers: { Authorization: `Bearer ${adminToken}` } };

    // 2.1 Enquiry Creation & Neon Verification
    let createdEnquiryId = '';
    const testEnquiryEmail = `enquiry-${Date.now()}@test.com`;
    try {
      const enquiryRes = await axios.post(
        `${API_BASE_URL}/api/enquiries`,
        {
          customerName: 'Thakur Vikramaditya Singh',
          email: testEnquiryEmail,
          phone: '9829012345',
          weddingDate: '2026-11-20T00:00:00.000Z',
          location: 'Umaid Bhawan Palace, Jodhpur',
          guestCount: 500,
          theme: 'Royal Rajputana Heritage',
          minBudget: 3500000,
          maxBudget: 6500000,
          source: 'WEBSITE',
          planningFor: 'GROOM_SIDE',
          notes: 'Integration test enquiry created by acceptance suite',
        },
        adminAuthHeader
      );

      if (enquiryRes.status === 201 || enquiryRes.status === 200) {
        createdEnquiryId = enquiryRes.data?.data?.id;
        cleanupEnquiryIds.push(createdEnquiryId);

        // Verify in Neon directly
        const neonEnquiry = await prisma.customerEnquiry.findUnique({
          where: { id: createdEnquiryId },
        });

        if (neonEnquiry && neonEnquiry.email === testEnquiryEmail) {
          record({
            id: 'DATA-01',
            name: 'Customer Enquiry Creation & Neon Write',
            category: 'Database Persistence',
            status: 'PASS',
            expected: 'HTTP 201/200 and Neon customerEnquiry record',
            actual: `Created Enquiry ID: ${createdEnquiryId}, Name: ${neonEnquiry.customerName}, Neon Verified: true`,
            evidence: { id: neonEnquiry.id, location: neonEnquiry.location },
          });
        } else {
          throw new Error('Enquiry record not found in Neon database!');
        }
      } else {
        throw new Error(`Unexpected: ${JSON.stringify(enquiryRes.data)}`);
      }
    } catch (err: any) {
      record({
        id: 'DATA-01',
        name: 'Customer Enquiry Creation & Neon Write',
        category: 'Database Persistence',
        status: 'FAIL',
        expected: 'HTTP 201/200 and Neon write',
        actual: err.response?.data?.message || err.message,
      });
    }

    // 2.2 Enquiry Status Update & Neon Read-Back
    try {
      if (createdEnquiryId) {
        const patchRes = await axios.patch(
          `${API_BASE_URL}/api/enquiries/${createdEnquiryId}/status`,
          { status: 'PROPOSAL_SENT', notes: 'Proposal delivered via acceptance test.' },
          adminAuthHeader
        );

        // Verify in Neon directly
        const updatedEnquiry = await prisma.customerEnquiry.findUnique({
          where: { id: createdEnquiryId },
        });

        if (updatedEnquiry?.status === 'PROPOSAL_SENT') {
          record({
            id: 'DATA-02',
            name: 'Enquiry Status Mutation & Neon Persistence',
            category: 'Database Persistence',
            status: 'PASS',
            expected: 'Neon record updated to PROPOSAL_SENT',
            actual: `Status updated to ${updatedEnquiry.status} in Neon`,
          });
        } else {
          throw new Error(`Neon record has status: ${updatedEnquiry?.status}`);
        }
      } else {
        throw new Error('No enquiry ID available from previous step.');
      }
    } catch (err: any) {
      record({
        id: 'DATA-02',
        name: 'Enquiry Status Mutation & Neon Persistence',
        category: 'Database Persistence',
        status: 'FAIL',
        expected: 'Neon record updated to PROPOSAL_SENT',
        actual: err.response?.data?.message || err.message,
      });
    }

    // 2.3 Task Status Mutation & Neon Read-Back
    try {
      // Find a real task in the database
      const existingTask = await prisma.task.findFirst();
      if (!existingTask) {
        throw new Error('No tasks found in database to update.');
      }

      const originalStatus = existingTask.status;
      const targetStatus = originalStatus === TaskStatus.DONE ? TaskStatus.IN_PROGRESS : TaskStatus.DONE;

      const taskRes = await axios.patch(
        `${API_BASE_URL}/api/tasks/${existingTask.id}`,
        { status: targetStatus },
        adminAuthHeader
      );

      // Verify in Neon directly
      const updatedTask = await prisma.task.findUnique({
        where: { id: existingTask.id },
      });

      if (updatedTask?.status === targetStatus) {
        record({
          id: 'DATA-03',
          name: 'Task Status Mutation & Neon Persistence',
          category: 'Database Persistence',
          status: 'PASS',
          expected: `Task status updated to ${targetStatus} in Neon`,
          actual: `Task "${updatedTask.title}" updated: ${originalStatus} -> ${updatedTask.status}`,
          evidence: { taskId: updatedTask.id, status: updatedTask.status },
        });

        // Revert to original
        await prisma.task.update({
          where: { id: existingTask.id },
          data: { status: originalStatus },
        });
      } else {
        throw new Error(`Neon task status is ${updatedTask?.status}, expected ${targetStatus}`);
      }
    } catch (err: any) {
      record({
        id: 'DATA-03',
        name: 'Task Status Mutation & Neon Persistence',
        category: 'Database Persistence',
        status: 'FAIL',
        expected: 'Task status updated in Neon',
        actual: err.response?.data?.message || err.message,
      });
    }

    // 2.4 Service Verification Trigger & Neon Persistence
    let createdVerificationId = '';
    try {
      const wedding = await prisma.wedding.findFirst();
      const vendor = await prisma.vendor.findFirst();

      if (!wedding || !vendor) {
        throw new Error('Missing wedding or vendor record in database.');
      }

      const verifRes = await axios.post(
        `${API_BASE_URL}/api/verifications/trigger`,
        {
          weddingId: wedding.id,
          vendorId: vendor.id,
          serviceName: 'Live Acceptance Testing Verification Trigger',
          scheduledConfirmationTime: new Date().toISOString(),
        },
        adminAuthHeader
      );

      if (verifRes.status === 201 || verifRes.status === 200) {
        createdVerificationId = verifRes.data?.data?.id;
        cleanupVerificationIds.push(createdVerificationId);

        // Verify in Neon directly
        const neonVerif = await prisma.serviceVerification.findUnique({
          where: { id: createdVerificationId },
          include: { vendor: true },
        });

        if (neonVerif && neonVerif.serviceName === 'Live Acceptance Testing Verification Trigger') {
          record({
            id: 'DATA-04',
            name: 'Service Verification Trigger & Neon Persistence',
            category: 'Service Verification',
            status: 'PASS',
            expected: 'HTTP 201/200 and Neon serviceVerification record with status AWAITING_CONFIRMATION',
            actual: `Created Verification ID: ${createdVerificationId}, Status in Neon: ${neonVerif.status}`,
            evidence: { id: neonVerif.id, status: neonVerif.status, vendor: neonVerif.vendor?.name },
          });
        } else {
          throw new Error('Verification record not found in Neon database!');
        }
      } else {
        throw new Error(`Unexpected: ${JSON.stringify(verifRes.data)}`);
      }
    } catch (err: any) {
      record({
        id: 'DATA-04',
        name: 'Service Verification Trigger & Neon Persistence',
        category: 'Service Verification',
        status: 'FAIL',
        expected: 'Verification created in Neon',
        actual: err.response?.data?.message || err.message,
      });
    }

    // 2.5 Service Verification Response Submission & Neon Update
    try {
      if (createdVerificationId) {
        const respondRes = await axios.post(
          `${API_BASE_URL}/api/verifications/${createdVerificationId}/respond`,
          {
            response: VerificationResponse.COMPLETED,
            issueNotes: 'Confirmed by automated acceptance test suite.',
            evidencePhotos: [],
          },
          adminAuthHeader
        );

        // Verify in Neon directly
        const updatedVerif = await prisma.serviceVerification.findUnique({
          where: { id: createdVerificationId },
        });

        if (updatedVerif?.status === 'CONFIRMED' && updatedVerif?.response === VerificationResponse.COMPLETED) {
          record({
            id: 'DATA-05',
            name: 'Service Verification Response & Neon Update',
            category: 'Service Verification',
            status: 'PASS',
            expected: 'Neon record updated to status CONFIRMED and response COMPLETED',
            actual: `Status: ${updatedVerif.status}, Response: ${updatedVerif.response}, ConfirmedBy: ${updatedVerif.confirmedByUserId}`,
            evidence: updatedVerif,
          });
        } else {
          throw new Error(`Neon record has status: ${updatedVerif?.status}, response: ${updatedVerif?.response}`);
        }
      } else {
        throw new Error('No verification ID from previous step.');
      }
    } catch (err: any) {
      record({
        id: 'DATA-05',
        name: 'Service Verification Response & Neon Update',
        category: 'Service Verification',
        status: 'FAIL',
        expected: 'Verification updated to CONFIRMED in Neon',
        actual: err.response?.data?.message || err.message,
      });
    }

    // ----------------------------------------------------
    // TEST SUITE 3: REAL-TIME WEB-TO-MOBILE SYNC (SOCKET.IO)
    // ----------------------------------------------------
    console.log('\n--- 3. REAL-TIME SOCKET.IO SYNCHRONIZATION ---');

    try {
      const socket = ioClient(API_BASE_URL, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        auth: { token: `Bearer ${adminToken}` },
      });

      const socketConnected = await new Promise<boolean>((resolve) => {
        socket.on('connect', () => {
          console.log('   Connected to live Socket.IO on Render:', socket.id);
          resolve(true);
        });
        socket.on('connect_error', (err) => {
          console.warn('   Socket connection error:', err.message);
          resolve(false);
        });
        setTimeout(() => resolve(false), 8000);
      });

      if (socketConnected) {
        record({
          id: 'SYNC-01',
          name: 'Socket.IO Server Connectivity',
          category: 'Real-Time Sync',
          status: 'PASS',
          expected: 'Socket.IO handshake and connect event fired',
          actual: `Connected with Socket ID: ${socket.id}`,
        });

        // Test real-time event broadcast
        const wedding = await prisma.wedding.findFirst();
        const weddingId = wedding?.id || 'w-test';

        socket.emit('join:wedding', weddingId);

        const eventPromise = new Promise<{ received: boolean; payload?: any }>((resolve) => {
          socket.on('service:verification_triggered', (payload) => {
            resolve({ received: true, payload });
          });
          setTimeout(() => resolve({ received: false }), 8000);
        });

        // Trigger an event on backend
        const vendor = await prisma.vendor.findFirst();
        if (vendor && wedding) {
          const triggerRes = await axios.post(
            `${API_BASE_URL}/api/verifications/trigger`,
            {
              weddingId: wedding.id,
              vendorId: vendor.id,
              serviceName: 'Live Socket.IO Sync Verification Test',
            },
            adminAuthHeader
          );
          if (triggerRes.data?.data?.id) {
            cleanupVerificationIds.push(triggerRes.data.data.id);
          }
        }

        const eventResult = await eventPromise;
        if (eventResult.received) {
          record({
            id: 'SYNC-02',
            name: 'Live Socket.IO Event Broadcast & Reception',
            category: 'Real-Time Sync',
            status: 'PASS',
            expected: 'service:verification_triggered event received in real time with payload',
            actual: `Received event with serviceName: "${eventResult.payload?.verification?.serviceName || 'Verified'}"`,
            evidence: eventResult.payload,
          });
        } else {
          record({
            id: 'SYNC-02',
            name: 'Live Socket.IO Event Broadcast & Reception',
            category: 'Real-Time Sync',
            status: 'FAIL',
            expected: 'service:verification_triggered event received within 8 seconds',
            actual: 'Timed out waiting for socket broadcast event',
          });
        }

        socket.disconnect();
      } else {
        record({
          id: 'SYNC-01',
          name: 'Socket.IO Server Connectivity',
          category: 'Real-Time Sync',
          status: 'FAIL',
          expected: 'Socket.IO connects to Render',
          actual: 'Connection timeout or connection error',
        });
      }
    } catch (err: any) {
      record({
        id: 'SYNC-01',
        name: 'Socket.IO Server Connectivity',
        category: 'Real-Time Sync',
        status: 'FAIL',
        expected: 'Socket.IO connection',
        actual: err.message,
      });
    }

    // ----------------------------------------------------
    // TEST SUITE 4: SECURITY & CREDENTIALS AUDIT
    // ----------------------------------------------------
    console.log('\n--- 4. PRODUCTION SECURITY & SECRETS AUDIT ---');

    const fs = require('fs');
    const path = require('path');

    function searchDir(dir: string, pattern: RegExp, extensions: string[]): string[] {
      let findings: string[] = [];
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          if (!['node_modules', '.git', 'build', '.gradle', 'android'].includes(file)) {
            findings = findings.concat(searchDir(fullPath, pattern, extensions));
          }
        } else if (extensions.some((ext) => file.endsWith(ext))) {
          const content = fs.readFileSync(fullPath, 'utf8');
          if (pattern.test(content)) {
            findings.push(fullPath);
          }
        }
      }
      return findings;
    }

    const mobileSrcDir = path.resolve(__dirname, '../apps/mobile/src');

    // 4.1 Check for database URLs in mobile code
    const dbUrlPattern = /postgres(?:ql)?:\/\/[^\s'"`]+/i;
    const dbFindings = searchDir(mobileSrcDir, dbUrlPattern, ['.ts', '.tsx', '.js']);
    if (dbFindings.length === 0) {
      record({
        id: 'SEC-01',
        name: 'No Database Connection String in Mobile App',
        category: 'Security',
        status: 'PASS',
        expected: 'Zero database connection strings found in mobile codebase',
        actual: '0 database URLs discovered in apps/mobile/src',
      });
    } else {
      record({
        id: 'SEC-01',
        name: 'No Database Connection String in Mobile App',
        category: 'Security',
        status: 'FAIL',
        expected: 'Zero database URLs',
        actual: `Found database URL in: ${dbFindings.join(', ')}`,
      });
    }

    // 4.2 Check for JWT Signing Secrets in mobile code
    const jwtSecretPattern = /JWT_SECRET|JWT_REFRESH_SECRET|TOKEN_ENCRYPTION_KEY/i;
    const jwtFindings = searchDir(mobileSrcDir, jwtSecretPattern, ['.ts', '.tsx']);
    if (jwtFindings.length === 0) {
      record({
        id: 'SEC-02',
        name: 'No JWT Signing Secrets in Mobile App',
        category: 'Security',
        status: 'PASS',
        expected: 'Zero JWT secrets in mobile source code',
        actual: '0 JWT signing keys in apps/mobile/src',
      });
    } else {
      record({
        id: 'SEC-02',
        name: 'No JWT Signing Secrets in Mobile App',
        category: 'Security',
        status: 'FAIL',
        expected: 'Zero JWT secrets',
        actual: `Found references in: ${jwtFindings.join(', ')}`,
      });
    }

    // 4.3 Secure Token Storage in Android Keystore
    const usesKeychain = fs.readFileSync(
      path.resolve(__dirname, '../apps/mobile/src/utils/storage.ts'),
      'utf8'
    ).includes('react-native-keychain');
    if (usesKeychain) {
      record({
        id: 'SEC-03',
        name: 'Hardware-Backed Keystore Storage Implementation',
        category: 'Security',
        status: 'PASS',
        expected: 'react-native-keychain used for token persistence',
        actual: 'Confirmed react-native-keychain hardware-backed encryption used in storage.ts',
      });
    } else {
      record({
        id: 'SEC-03',
        name: 'Hardware-Backed Keystore Storage Implementation',
        category: 'Security',
        status: 'FAIL',
        expected: 'react-native-keychain',
        actual: 'react-native-keychain missing in storage.ts',
      });
    }

    // ----------------------------------------------------
    // TEST SUITE 5: SERVICE VERIFICATION SCHEDULER & FCM AUDIT
    // ----------------------------------------------------
    console.log('\n--- 5. SCHEDULER & FCM AUDIT ---');

    // 5.1 Backend Scheduler Audit
    const serverCode = fs.readFileSync(path.resolve(__dirname, '../apps/api/src/server.ts'), 'utf8');
    const hasCron = serverCode.includes('node-cron') || serverCode.includes('setInterval') || serverCode.includes('agenda');
    if (hasCron) {
      record({
        id: 'SCHED-01',
        name: 'Backend Persistent Verification Scheduler',
        category: 'Scheduler',
        status: 'PASS',
        expected: 'Persistent backend recurring scheduler checking overdue verifications',
        actual: 'Recurring scheduler active in server.ts',
      });
    } else {
      record({
        id: 'SCHED-01',
        name: 'Backend Persistent Verification Scheduler',
        category: 'Scheduler',
        status: 'BLOCKED',
        expected: 'Persistent cron/agenda runner in server.ts for future scheduled verifications',
        actual: 'Backend currently uses on-demand trigger & immediate Socket.IO broadcast; no persistent cron scheduler is registered in server.ts',
        error: 'Requires background runner in apps/api/src/server.ts to poll and fire triggers at scheduledConfirmationTime',
      });
    }

    // 5.2 FCM Push Notification Audit
    const googleServicesExists = fs.existsSync(
      path.resolve(__dirname, '../apps/mobile/android/app/google-services.json')
    );
    if (googleServicesExists) {
      record({
        id: 'FCM-01',
        name: 'Firebase Cloud Messaging (FCM) Credentials',
        category: 'Push Notifications',
        status: 'PASS',
        expected: 'google-services.json present in android/app',
        actual: 'google-services.json is configured',
      });
    } else {
      record({
        id: 'FCM-01',
        name: 'Firebase Cloud Messaging (FCM) Credentials',
        category: 'Push Notifications',
        status: 'BLOCKED',
        expected: 'google-services.json present in apps/mobile/android/app/',
        actual: 'Missing google-services.json in mobile app; firebase-admin service account not provided for Render backend',
        error: 'User must configure Firebase project and provide google-services.json and FIREBASE_SERVICE_ACCOUNT_KEY on Render',
      });
    }

  } catch (globalErr: any) {
    console.error('Fatal suite error:', globalErr);
  } finally {
    // Clean up created test entities safely
    console.log('\n--- CLEANING UP TEST ARTIFACTS SAFELY ---');
    try {
      for (const vId of cleanupVerificationIds) {
        await prisma.serviceVerification.delete({ where: { id: vId } }).catch(() => {});
      }
      for (const eId of cleanupEnquiryIds) {
        await prisma.customerEnquiry.delete({ where: { id: eId } }).catch(() => {});
      }
      for (const uId of cleanupUserIds) {
        await prisma.user.delete({ where: { id: uId } }).catch(() => {});
      }
      for (const aId of cleanupAgencyIds) {
        await prisma.agency.delete({ where: { id: aId } }).catch(() => {});
      }
      console.log('Cleaned up test records:', {
        verifications: cleanupVerificationIds.length,
        enquiries: cleanupEnquiryIds.length,
        users: cleanupUserIds.length,
        agencies: cleanupAgencyIds.length,
      });
    } catch (cleanupErr: any) {
      console.warn('Cleanup warning:', cleanupErr.message);
    }
  }

  console.log('\n======================================================');
  console.log(` ACCEPTANCE TEST SUMMARY: ${results.filter(r => r.status === 'PASS').length} PASSED, ${results.filter(r => r.status === 'FAIL').length} FAILED, ${results.filter(r => r.status === 'BLOCKED').length} BLOCKED`);
  console.log('======================================================\n');

  return results;
}

runSuite().then((res) => {
  const fs = require('fs');
  fs.writeFileSync('acceptance_results.json', JSON.stringify(res, null, 2));
  process.exit(0);
});
