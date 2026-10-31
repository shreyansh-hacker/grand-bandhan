import { ProductionSchedulerService } from './scheduler.service';
import { checkDatabaseConnection } from '../../db';

const isOnceMode = process.argv.includes('--once');
const intervalMs = Number(process.env.SCHEDULER_INTERVAL_MS) || 60000;
let isShuttingDown = false;
let loopTimer: NodeJS.Timeout | null = null;

async function runPass(): Promise<void> {
  if (isShuttingDown) return;
  console.log(`\n⏱️ [Scheduler Worker] Starting check pass at ${new Date().toISOString()}`);
  try {
    const summary = await ProductionSchedulerService.runAllChecks();
    console.log(`✅ [Scheduler Worker] Completed check pass:`, summary);
  } catch (err: any) {
    console.error(`❌ [Scheduler Worker] Pass failed:`, err.message);
  }
}

async function main(): Promise<void> {
  console.log('=============================================================');
  console.log('👑 GRAND BANDHAN: PRODUCTION NOTIFICATION SCHEDULER WORKER');
  console.log(`Mode: ${isOnceMode ? 'One-Shot (Cron)' : `Persistent Daemon (Every ${intervalMs / 1000}s)`}`);
  console.log('Timezone: Asia/Kolkata (IST)');
  console.log('=============================================================');

  await checkDatabaseConnection();

  if (isOnceMode) {
    await runPass();
    console.log('🏁 [Scheduler Worker] One-shot execution complete. Exiting.');
    process.exit(0);
  } else {
    // Run initial pass immediately
    await runPass();

    // Start daemon interval
    loopTimer = setInterval(async () => {
      await runPass();
    }, intervalMs);
  }
}

function shutdown(): void {
  console.log('\n🛑 [Scheduler Worker] Received shutdown signal. Gracefully exiting...');
  isShuttingDown = true;
  if (loopTimer) {
    clearInterval(loopTimer);
  }
  process.exit(0);
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

main().catch((err) => {
  console.error('Fatal scheduler worker error:', err);
  process.exit(1);
});
