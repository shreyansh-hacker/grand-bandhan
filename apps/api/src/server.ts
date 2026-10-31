import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { initSocketIO } from './socket';
import { checkDatabaseConnection } from './db';
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

// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Grand Bandhan API',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Grand Bandhan API',
    timestamp: new Date().toISOString(),
  });
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
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});

export { app, server };
