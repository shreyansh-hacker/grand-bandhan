import { prisma } from '@grand-bandhan/database';
import { hashPassword } from './utils/hash';
import { UserRole, AgencyStatus, AccountStatus } from '@grand-bandhan/shared';

/**
 * Checks Neon PostgreSQL and seeds initial agency and administrative accounts if database is empty.
 * Eliminates all legacy local JSON / file-based storage.
 */
export async function seedDemoDataIfEmpty(): Promise<void> {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return; // Neon PostgreSQL already populated
    }

    console.log('Seeding Neon PostgreSQL with Grand Bandhan Initial Data...');
    let agency = await prisma.agency.findFirst({ where: { slug: 'grand-bandhan-imperial' } });
    if (!agency) {
      agency = await prisma.agency.create({
        data: {
          name: 'Grand Bandhan Imperial Weddings',
          slug: 'grand-bandhan-imperial',
          logoUrl: '/images/brand/logo-gold.svg',
          contactEmail: 'concierge@grandbandhan.com',
          contactPhone: '+91 98200 12345',
          address: 'The Imperial Pavilion, Umaid Heritage Road, Udaipur, Rajasthan',
          city: 'Udaipur',
          state: 'Rajasthan',
          country: 'India',
          status: AgencyStatus.APPROVED,
        },
      });
    }

    const defaultPasswordHash = await hashPassword('GrandBandhan@2025');

    // Create Super Admin if not existing
    const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@grandbandhan.com' } });
    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          agencyId: agency.id,
          name: 'Vikramaditya Rathore',
          email: 'admin@grandbandhan.com',
          passwordHash: defaultPasswordHash,
          role: UserRole.SUPER_ADMIN,
          phone: '+91 98200 00001',
          accountStatus: AccountStatus.ACTIVE,
          isActive: true,
        },
      });
      console.log('Created default Super Admin in Neon PostgreSQL: admin@grandbandhan.com');
    }
  } catch (err: any) {
    console.warn('[Seed] Initial seed check note:', err.message);
  }
}
