import { prisma } from '@grand-bandhan/database';

async function check() {
  const tokens = await prisma.gmailOAuthToken.findMany();
  console.log('Total GmailOAuthToken records:', tokens.length);
  for (const t of tokens) {
    console.log({
      id: t.id,
      agencyId: t.agencyId,
      senderEmail: t.senderEmail,
      refreshTokenPrefix: t.refreshToken?.slice(0, 20),
      accessTokenPrefix: t.accessToken?.slice(0, 20),
      isEncrypted: t.refreshToken?.startsWith('enc:'),
      expiryDate: t.expiryDate,
      updatedAt: t.updatedAt,
    });
  }
}

check().catch(console.error);
