import { prisma } from '@grand-bandhan/database';
import { hashPassword } from './utils/hash';
import { UserRole, AgencyStatus, AccountStatus } from '@grand-bandhan/shared';

/**
 * Checks Neon PostgreSQL and seeds initial agency and administrative accounts if database is empty.
 * Eliminates all legacy local JSON / file-based storage.
 */
export async function seedDemoDataIfEmpty(): Promise<void> {
  try {
    let agency = await prisma.agency.findFirst({ where: { slug: 'grand-bandhan-imperial' } });
    if (!agency) {
      agency = await prisma.agency.create({
        data: {
          name: 'Grand Bandhan Imperial Weddings',
          slug: 'grand-bandhan-imperial',
          logoUrl: '/images/brand/logo-gold.svg',
          contactEmail: 'shreyanshsharma049@gmail.com',
          contactPhone: '+91 98200 12345',
          address: 'The Imperial Pavilion, Umaid Heritage Road, Udaipur, Rajasthan',
          city: 'Udaipur',
          state: 'Rajasthan',
          country: 'India',
          status: AgencyStatus.APPROVED,
        },
      });
    }

    const defaultPasswordHash = await hashPassword('Password@123');

    // 1. Super Admin: Shreyansh Sharma
    const existingSuperAdmin = await prisma.user.findUnique({ where: { email: 'shreyanshsharma049@gmail.com' } });
    if (!existingSuperAdmin) {
      await prisma.user.create({
        data: {
          agencyId: agency.id,
          name: 'Shreyansh Sharma',
          email: 'shreyanshsharma049@gmail.com',
          passwordHash: defaultPasswordHash,
          role: UserRole.SUPER_ADMIN,
          phone: '+91 98200 00001',
          accountStatus: AccountStatus.ACTIVE,
          isActive: true,
        },
      });
      console.log('Seeded Super Admin: shreyanshsharma049@gmail.com');
    }

    // 2. Agency Admin: Yash Rathore
    const existingYashRathore = await prisma.user.findUnique({ where: { email: 'yashrathore2574@gmail.com' } });
    if (!existingYashRathore) {
      await prisma.user.create({
        data: {
          agencyId: agency.id,
          name: 'Yash Rathore',
          email: 'yashrathore2574@gmail.com',
          passwordHash: defaultPasswordHash,
          role: UserRole.AGENCY_ADMIN,
          phone: '+91 98200 12345',
          accountStatus: AccountStatus.ACTIVE,
          isActive: true,
        },
      });
      console.log('Seeded Agency Admin: yashrathore2574@gmail.com');
    }

    // 3. Lead Planner: Yash Audichya
    const existingYashAudi = await prisma.user.findUnique({ where: { email: 'yashaudichya001@gmail.com' } });
    if (!existingYashAudi) {
      await prisma.user.create({
        data: {
          agencyId: agency.id,
          name: 'Yash Audichya',
          email: 'yashaudichya001@gmail.com',
          passwordHash: defaultPasswordHash,
          role: UserRole.WEDDING_PLANNER,
          phone: '+91 98200 54321',
          accountStatus: AccountStatus.ACTIVE,
          isActive: true,
        },
      });
      console.log('Seeded Wedding Planner: yashaudichya001@gmail.com');
    }
  } catch (err: any) {
    console.warn('[Seed] Initial seed check note:', err.message);
  }
}
