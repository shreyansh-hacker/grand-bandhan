import path from 'path';
import dotenv from 'dotenv';
const cwd = process.cwd();
const rootDir = path.resolve(cwd, cwd.includes('packages') || cwd.includes('apps') ? '../../' : '.');
dotenv.config({ path: path.resolve(cwd, '.env.local') });
dotenv.config({ path: path.resolve(cwd, '.env') });
dotenv.config({ path: path.resolve(rootDir, '.env.local') });
dotenv.config({ path: path.resolve(rootDir, '.env') });

import { prisma } from '../packages/database/src';

async function check() {
  const emails = [
    'VKrishuhow01@gmail.com',
    'asaggitarius1@gmail.com',
    'megatronn131403@gmail.com',
    '23cyber57@ecajmer.ac.in',
    'yashaudichya2007@gmail.com',
    'yashaudichya01@gmail.com',
    'vkrishuhow01@gmail.com',
  ];
  const users = await prisma.user.findMany({
    where: { email: { in: emails, mode: 'insensitive' } },
  });
  console.log('Existing users count:', users.length);
  for (const u of users) {
    console.log(`- ${u.email} | Role: ${u.role} | Agency: ${u.agencyId}`);
  }
}

check().finally(async () => {
  await prisma.$disconnect();
});
