# Grand Bandhan – Production Deployment Guide

This guide details progressive deployment of Grand Bandhan across Vercel, Render, and Neon PostgreSQL.

---

## 1. Cloud Infrastructure Architecture

- **Web Frontend**: Vercel (Edge-optimized Next.js 15)
- **REST & Socket.IO API**: Render (Node.js web service)
- **Database**: Neon (Serverless PostgreSQL)
- **Media & Documents**: Cloudinary

---

## 2. Database Setup on Neon

1. Create a free or production PostgreSQL database instance at [Neon](https://neon.tech).
2. Copy the pooled connection string formatted as:
   ```env
   DATABASE_URL="postgresql://[user]:[password]@[endpoint].us-east-2.aws.neon.tech/grand_bandhan?sslmode=require"
   ```
3. Run migrations against Neon from the root workspace:
   ```bash
   pnpm --filter @grand-bandhan/api run prisma:push
   ```

---

## 3. Backend Deployment on Render

1. Create a **New Web Service** connected to `https://github.com/shreyansh-hacker/grand-bandhan`.
2. Configure settings:
   - **Environment**: Node
   - **Root Directory**: `apps/api`
   - **Build Command**: `pnpm install && pnpm build`
   - **Start Command**: `node dist/server.js`
3. Configure Environment Variables in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `4000` (or leave default assigned by Render)
   - `DATABASE_URL`: Your Neon PostgreSQL connection string
   - `JWT_ACCESS_SECRET`: `[At least 32 random characters]`
   - `JWT_REFRESH_SECRET`: `[At least 32 random characters]`
   - `FRONTEND_URL`: Your deployed Vercel frontend URL (e.g. `https://grand-bandhan.vercel.app`)
4. Verify health check at: `https://[your-render-url]/health`

---

## 4. Frontend Deployment on Vercel

1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory to: `apps/web`
3. Framework Preset: Next.js
4. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your Render backend URL (e.g. `https://grand-bandhan-api.onrender.com`)
   - `NEXT_PUBLIC_SOCKET_URL`: Your Render backend URL
5. Deploy.

---

## 5. Cold Starts & Hackathon Demo Continuity

- If using the free tier on Render, initial API requests may experience a 30-50 second cold start delay.
- The Grand Bandhan API includes built-in fallback resilience with automated demo data seeding (`seedDemoDataIfEmpty`) ensuring zero downtime during judging and offline evaluations.
