import { prisma } from '@grand-bandhan/database';
import bcrypt from 'bcryptjs';

async function checkPasswords() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, role: true, passwordHash: true },
  });

  const candidates = [
    'GrandBandhan@2026',
    'AdminPassword@2026',
    'RoyalClient@2026',
    'SuperAdmin@2026',
    'Admin@123',
    'Password@123',
  ];

  console.log(`Checking ${users.length} users against known candidate passwords...`);
  for (const u of users) {
    for (const p of candidates) {
      if (u.passwordHash && bcrypt.compareSync(p, u.passwordHash)) {
        console.log(`FOUND: ${u.email} (${u.role}) -> password is "${p}"`);
        break;
      }
    }
  }
}

checkPasswords().catch(console.error);
