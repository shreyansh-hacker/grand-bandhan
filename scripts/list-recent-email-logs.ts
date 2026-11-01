import { prisma } from '@grand-bandhan/database';

async function listRecentEmailLogs() {
  const logs = await prisma.emailLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  console.log(`Found ${logs.length} recent EmailLogs:`);
  for (const l of logs) {
    console.log({
      id: l.id,
      eventType: l.eventType,
      recipientEmail: l.recipientEmail,
      status: l.status,
      errorMessage: l.errorMessage,
      providerMessageId: l.providerMessageId,
      retryCount: l.retryCount,
      createdAt: l.createdAt,
      sentAt: l.sentAt,
    });
  }
}

listRecentEmailLogs().catch(console.error);
