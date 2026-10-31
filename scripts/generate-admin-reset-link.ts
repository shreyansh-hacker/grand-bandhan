import { PrismaClient, UserRole } from '@grand-bandhan/database';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('----------------------------------------------------');
  console.log('GRAND BANDHAN — SUPER ADMIN SECURE RESET GENERATOR');
  console.log('----------------------------------------------------');

  const targetEmail = process.argv[2]?.trim().toLowerCase() || 'admin@grandbandhan.com';

  // 1. Locate Super Admin in the live database (by specified email, or fallback to any SUPER_ADMIN)
  let admin = await prisma.user.findFirst({
    where: {
      email: targetEmail,
      role: UserRole.SUPER_ADMIN,
    },
  });

  if (!admin) {
    admin = await prisma.user.findFirst({
      where: {
        role: UserRole.SUPER_ADMIN,
      },
    });
  }

  if (!admin) {
    console.error('❌ Error: No SUPER_ADMIN user found in database.');
    process.exit(1);
  }

  console.log(`Target User: ${admin.name} (${admin.email})`);
  console.log(`Role: ${admin.role}`);
  console.log(`Current Token Version: ${admin.tokenVersion}`);

  // 2. Generate cryptographically secure random token (32 bytes = 64 hex chars)
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // 3. Invalidate previous unused reset tokens for this user
  const deleted = await prisma.passwordResetToken.deleteMany({
    where: { userId: admin.id },
  });
  console.log(`Cleared ${deleted.count} stale reset token(s).`);

  // 4. Store hashed token in Neon PostgreSQL
  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: admin.id,
      expiresAt,
    },
  });

  const resetUrl = `https://grand-bandhan-theta.vercel.app/reset-password?token=${rawToken}`;
  const apiUrl = `https://grand-bandhan.onrender.com/api/auth/reset-password`;

  console.log('\n✅ One-time reset token securely generated and stored in Neon DB.');
  console.log(`Expires At: ${expiresAt.toISOString()} (in 60 minutes)`);
  console.log('\n--- ONE-TIME WEB RESET URL ---');
  console.log(resetUrl);
  console.log('\n--- DIRECT API CURL COMMAND ---');
  console.log(`curl -X POST ${apiUrl} \\`);
  console.log(`  -H "Content-Type: application/json" \\`);
  console.log(`  -d '{"token": "${rawToken}", "newPassword": "<ENTER_NEW_SECURE_PASSWORD>"}'`);
  console.log('\n----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Fatal error generating reset link:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
