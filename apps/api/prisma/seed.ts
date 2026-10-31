import '../src/config/env';
import { PrismaClient, UserRole, EnquirySource, PlanningForSide, EnquiryStatus, VendorCategory } from '@prisma/client';
import { hashPassword } from '../src/utils/hash';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Neon PostgreSQL Database...');

  const count = await prisma.agency.count();
  if (count > 0) {
    console.log(`Database already contains ${count} agency/agencies. Seeding skipped.`);
    return;
  }

  // 1. Create Default Luxury Agency
  const agency = await prisma.agency.create({
    data: {
      name: 'Grand Bandhan Imperial Weddings',
      slug: 'grand-bandhan-imperial',
      logoUrl: '/images/brand/logo-gold.svg',
      contactEmail: 'shreyanshsharma049@gmail.com',
      contactPhone: '+91 98200 12345',
      address: 'The Imperial Pavilion, Umaid Heritage Road, Udaipur, Rajasthan',
    },
  });

  console.log('Created Agency in Neon:', agency.name);

  // 2. Create Users across all roles
  const defaultPasswordHash = await hashPassword('GrandBandhan@2025');

  const users = await prisma.$transaction([
    prisma.user.create({
      data: {
        agencyId: agency.id,
        name: 'Vikramaditya Rathore',
        email: 'admin@grandbandhan.com',
        passwordHash: defaultPasswordHash,
        role: UserRole.SUPER_ADMIN,
        phone: '+91 98200 00001',
      },
    }),
    prisma.user.create({
      data: {
        agencyId: agency.id,
        name: 'Maharani Gayatri Devi',
        email: 'agency@grandbandhan.com',
        passwordHash: defaultPasswordHash,
        role: UserRole.AGENCY_ADMIN,
        phone: '+91 98200 00002',
      },
    }),
    prisma.user.create({
      data: {
        agencyId: agency.id,
        name: 'Aanya Singhania',
        email: 'planner@grandbandhan.com',
        passwordHash: defaultPasswordHash,
        role: UserRole.WEDDING_PLANNER,
        phone: '+91 98200 00003',
      },
    }),
    prisma.user.create({
      data: {
        agencyId: agency.id,
        name: 'Rohan Mehra',
        email: 'coordinator@grandbandhan.com',
        passwordHash: defaultPasswordHash,
        role: UserRole.COORDINATOR,
        phone: '+91 98200 00004',
      },
    }),
    prisma.user.create({
      data: {
        agencyId: agency.id,
        name: 'Rhea Kapoor & Siddharth Malhotra',
        email: 'client@grandbandhan.com',
        passwordHash: defaultPasswordHash,
        role: UserRole.CLIENT,
        phone: '+91 98200 00005',
      },
    }),
  ]);

  console.log(`Created ${users.length} users in Neon PostgreSQL.`);

  // 3. Create Luxury Vendors
  const vendorCatering = await prisma.vendor.create({
    data: {
      agencyId: agency.id,
      name: 'Royal Rajputana Culinary & Banquets',
      category: VendorCategory.CATERING,
      contactPerson: 'Chef Ranveer Khurana',
      email: 'caterer1@grandbandhan.com',
      phone: '+91 98111 22331',
      address: 'Banquets Enclave, Udaipur',
      basePrice: 650000,
      rating: 4.9,
    },
  });

  const vendorDJ = await prisma.vendor.create({
    data: {
      agencyId: agency.id,
      name: 'DJ Shadow & Sonic Symphony',
      category: VendorCategory.DJ_MUSIC,
      contactPerson: 'Kabir Varma',
      email: 'dj@grandbandhan.com',
      phone: '+91 98111 22334',
      address: 'Bandra West, Mumbai',
      basePrice: 250000,
      rating: 5.0,
    },
  });

  console.log('Created Vendors in Neon:', vendorCatering.name, vendorDJ.name);

  // 4. Create Sample Enquiry
  const enquiry = await prisma.customerEnquiry.create({
    data: {
      agencyId: agency.id,
      customerName: 'Ananya Singhania & Raghav Oberoi',
      email: 'ananya.raghav@gmail.com',
      phone: '+91 98199 88776',
      weddingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      location: 'The Leela Palace, Udaipur',
      guestCount: 450,
      theme: 'Royal Rajputana Gold & Crimson',
      minBudget: 5000000,
      maxBudget: 7500000,
      source: EnquirySource.WEBSITE,
      planningFor: PlanningForSide.BRIDE_SIDE,
      status: EnquiryStatus.CONSULTATION_SCHEDULED,
      notes: 'Looking for 3-day royal palace celebration with vintage cars procession.',
    },
  });

  console.log('Created Enquiry in Neon:', enquiry.customerName);
  console.log('✅ Neon PostgreSQL seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Neon seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
