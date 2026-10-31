import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { initSocketIO } from './socket';
import { startVerificationScheduler } from './modules/verifications/verification.scheduler';
import { ProductionSchedulerService } from './modules/scheduler/scheduler.service';
import { checkDatabaseConnection, isUsingPostgres } from './db';
import { seedDemoDataIfEmpty } from './seed-data';

// Import route modules
import authRoutes from './modules/auth/auth.routes';
import enquiryRoutes from './modules/enquiries/enquiry.routes';
import weddingRoutes from './modules/weddings/wedding.routes';
import agreementRoutes from './modules/agreements/agreement.routes';
import vendorRoutes from './modules/vendors/vendor.routes';
import quotationRoutes from './modules/quotations/quotation.routes';
import taskRoutes from './modules/tasks/task.routes';
import eventRoutes from './modules/events/event.routes';
import verificationRoutes from './modules/verifications/verification.routes';
import paymentRoutes from './modules/payments/payment.routes';
import settlementRoutes from './modules/settlements/settlement.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import storageRoutes from './modules/storage/storage.routes';
import agencyRoutes from './modules/agencies/agency.routes';
import profileRoutes from './modules/profile/profile.routes';
import proposalRoutes from './modules/proposals/proposal.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import emailRoutes from './modules/email/email.routes';

const app = express();
const server = http.createServer(app);

// Allowed origins for CORS
const allowedOrigins = [
  env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
];

// Security and middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissive for hackathon demo
      }
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Rate limiter for general API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Generous limit for operations dashboard
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', apiLimiter);

// Health check endpoints with Neon database status
app.get('/health', async (req, res) => {
  const dbConnected = isUsingPostgres();
  res.json({
    status: 'healthy',
    service: 'Grand Bandhan API',
    neon: {
      connected: dbConnected,
      branch: env.NEON_BRANCH || 'production',
      driver: 'prisma-client (postgresql)',
    },
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/health', async (req, res) => {
  const dbConnected = isUsingPostgres();
  res.json({
    status: 'healthy',
    service: 'Grand Bandhan API',
    neon: {
      connected: dbConnected,
      branch: env.NEON_BRANCH || 'production',
      driver: 'prisma-client (postgresql)',
    },
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/neon/status', async (req, res) => {
  try {
    const prisma = (await import('./db')).getPrismaClient();
    const result = await prisma.$queryRaw<any[]>`SELECT version(), current_database(), current_user`;
    const agencyCount = await prisma.agency.count();
    const userCount = await prisma.user.count();
    res.json({
      success: true,
      neon: {
        status: 'connected',
        branch: env.NEON_BRANCH || 'production',
        database: result[0]?.current_database,
        user: result[0]?.current_user,
        postgresVersion: result[0]?.version,
        metrics: {
          agencies: agencyCount,
          users: userCount,
        },
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/weddings', weddingRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/verifications', verificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/settlements', settlementRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/storage', storageRoutes);
app.use('/api/agencies', agencyRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/email', emailRoutes);

// Error handling middleware
app.use(errorHandler);

// Initialize Socket.IO
initSocketIO(server, allowedOrigins);

// Start server and initialize database
async function startServer() {
  await checkDatabaseConnection();
  await seedDemoDataIfEmpty();

  server.listen(env.PORT, () => {
    console.log(`👑 Grand Bandhan Imperial API Server running on port ${env.PORT}`);
    console.log(`🔗 API Base URL: ${env.API_URL}`);
    // Start persistent verification background worker
    startVerificationScheduler(60000);

    // Start production notification & reminder scheduler
    if (process.env.ENABLE_SCHEDULER !== 'false') {
      console.log('⏱️ Initializing Grand Bandhan Production Notification & Reminder Scheduler (interval: 60s)');
      setInterval(() => {
        ProductionSchedulerService.runAllChecks().catch((err) => {
          console.warn('[Scheduler] Pass error:', err.message);
        });
      }, 60000);
      setTimeout(() => {
        ProductionSchedulerService.runAllChecks().catch((err) => {
          console.warn('[Scheduler] Initial pass error:', err.message);
        });
      }, 10000);
    }
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});

export { app, server };
