import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(__dirname, '../apps/api');

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json();
  return { status: res.status, data };
}

async function main() {
  console.log('===========================================================');
  console.log('⚡ STARTING FULL END-TO-END NEON SERVICES VERIFICATION ⚡');
  console.log('===========================================================\n');

  console.log('[1/4] Starting Grand Bandhan API Server (Production Build)...');
  const serverProcess = spawn('node', ['dist/server.js'], {
    cwd: apiDir,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  let serverStarted = false;

  serverProcess.stdout.on('data', (chunk) => {
    const text = chunk.toString();
    process.stdout.write(`[API STDOUT] ${text}`);
    if (text.includes('running on port') || text.includes('Successfully connected to PostgreSQL')) {
      serverStarted = true;
    }
  });

  serverProcess.stderr.on('data', (chunk) => {
    process.stderr.write(`[API STDERR] ${chunk.toString()}`);
  });

  // Wait for server to come up
  for (let i = 0; i < 20; i++) {
    await wait(1000);
    try {
      const probe = await fetch('http://localhost:4000/health');
      if (probe.ok) {
        serverStarted = true;
        break;
      }
    } catch {
      // not ready yet
    }
  }

  if (!serverStarted) {
    serverProcess.kill('SIGKILL');
    throw new Error('API server failed to start within 20 seconds');
  }

  console.log('\n[2/4] Testing /health and /api/health endpoints with Neon status...');
  const healthRes = await request('http://localhost:4000/health');
  console.log('GET /health result:');
  console.log(JSON.stringify(healthRes, null, 2));

  if (!healthRes.data?.neon?.connected) {
    throw new Error('Neon database is not reported as connected in /health');
  }

  console.log('\n[3/4] Testing /api/neon/status (live PostgreSQL query against Neon)...');
  const neonStatusRes = await request('http://localhost:4000/api/neon/status');
  console.log('GET /api/neon/status result:');
  console.log(JSON.stringify(neonStatusRes, null, 2));

  if (neonStatusRes.status !== 200 || !neonStatusRes.data?.success) {
    throw new Error('Failed to retrieve Neon live database status');
  }

  console.log('\n[4/4] Testing End-to-End Authentication flow (POST /api/auth/login)...');
  const loginRes = await request('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@grandbandhan.com',
      password: 'GrandBandhan@2025',
    }),
  });
  console.log('POST /api/auth/login result:');
  console.log(JSON.stringify(loginRes, null, 2));

  if (loginRes.status !== 200 || !loginRes.data?.success) {
    throw new Error('Login failed on API server');
  }

  console.log('\n===========================================================');
  console.log('🎉 ALL NEON SERVICES VERIFIED AND WORKING END-TO-END! 🎉');
  console.log('===========================================================\n');

  serverProcess.kill('SIGTERM');
  await wait(1000);
  try {
    serverProcess.kill('SIGKILL');
  } catch {}
  process.exit(0);
}

main().catch((err) => {
  console.error('\n❌ E2E Verification failed:', err);
  process.exit(1);
});
