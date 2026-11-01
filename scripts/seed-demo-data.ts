/**
 * GRAND BANDHAN — ENTERPRISE DATA SEEDER & ECOSYSTEM POPULATOR
 * 
 * Generates realistic, fully-relational, database-backed records covering EVERY section:
 * 1. Customer Enquiries & CRM Leads (CustomerEnquiry)
 * 2. First Consultations Desk (WeddingConsultation)
 * 3. Service Agreements (DigitalAgreement)
 * 4. Weddings Directory (Wedding)
 * 5. 3-Vendor Quotations: "Three Vendors One Decision" (QuotationRequest + 3 VendorQuotations)
 * 6. Instant Task Planner (Task)
 * 7. Live Day-of Timeline (EventTimeline)
 * 8. Service Verification & Quality Desk (ServiceVerification)
 * 9. Milestone Payments & Settlements (Payment & Settlement)
 * 10. Guest RSVP Directory (WeddingGuest)
 * 11. Vendor Enterprise Profiles & Portal Accounts (Vendor & User)
 * 12. Key Original Executive & Client Accounts:
 *     - VKrishuhow01@gmail.com (VIP Couple - Krish & Varnika Royal Udaipur Wedding)
 *     - asaggitarius1@gmail.com (Wedding Planner - Ananya Singhania)
 *     - megatronn131403@gmail.com (Couple - Tarun & Megha Heritage Jaipur Wedding)
 *     - 23cyber57@ecajmer.ac.in (Super Admin - Er. Yash Sharma)
 *     - yashaudichya2007@gmail.com (Premier Vendor - Yash Audichya Catering)
 *     - yashaudichya01@gmail.com (Couple - Yash & Ananya Coastal Goa Wedding)
 */

import path from 'path';
import dotenv from 'dotenv';
import crypto from 'crypto';

// Load environment variables
const cwd = process.cwd();
const rootDir = path.resolve(cwd, cwd.includes('packages') || cwd.includes('apps') ? '../../' : '.');
dotenv.config({ path: path.resolve(cwd, '.env.local') });
dotenv.config({ path: path.resolve(cwd, '.env') });
dotenv.config({ path: path.resolve(rootDir, '.env.local') });
dotenv.config({ path: path.resolve(rootDir, '.env') });

import { prisma } from '../packages/database/src';
import {
  UserRole,
  AgencyStatus,
  AccountStatus,
  WeddingPackageType,
  WeddingStatus,
  VendorCategory,
  AgreementStatus,
  PaymentStatus,
  PaymentMilestone,
  PaymentType,
  TaskPriority,
  TaskStatus,
  RsvpStatus,
  PlanningForSide,
  EnquirySource,
  EnquiryStatus,
  ConsultationType,
  ConsultationStatus,
  QuotationRequestStatus,
  QuotationStatus,
  EventStatus,
  ServiceVerificationStatus,
  VerificationResponse,
} from '../packages/shared/src';
import bcrypt from 'bcryptjs';

// ============================================================================
// CONFIGURATION & CLI ARGUMENTS
// ============================================================================

const DEMO_DOMAIN = 'demo.grandbandhan.com';

interface SeedConfig {
  couplesCount: number;
  vendorsCount: number;
  batchSize: number;
  deterministic: boolean;
  seed: number;
  dryRun: boolean;
  cleanupOnly: boolean;
  cleanAll: boolean;
  includeOriginals: boolean;
}

function parseArgs(): SeedConfig {
  const args = process.argv.slice(2);
  const config: SeedConfig = {
    couplesCount: 250,
    vendorsCount: 250,
    batchSize: 25,
    deterministic: false,
    seed: 42,
    dryRun: false,
    cleanupOnly: false,
    cleanAll: false,
    includeOriginals: true,
  };

  for (const arg of args) {
    if (arg === '--clean' || arg === '--cleanup') {
      config.cleanupOnly = true;
    } else if (arg === '--clean-all') {
      config.cleanupOnly = true;
      config.cleanAll = true;
    } else if (arg === '--dry-run') {
      config.dryRun = true;
    } else if (arg === '--deterministic') {
      config.deterministic = true;
    } else if (arg.startsWith('--seed=')) {
      config.seed = parseInt(arg.split('=')[1], 10) || 42;
      config.deterministic = true;
    } else if (arg.startsWith('--couples=')) {
      config.couplesCount = parseInt(arg.split('=')[1], 10) || 0;
    } else if (arg.startsWith('--vendors=')) {
      config.vendorsCount = parseInt(arg.split('=')[1], 10) || 0;
    } else if (arg.startsWith('--batch=')) {
      const b = parseInt(arg.split('=')[1], 10) || 4;
      config.couplesCount = Math.floor(b / 2);
      config.vendorsCount = Math.ceil(b / 2);
    } else if (arg === '--no-originals') {
      config.includeOriginals = false;
    }
  }

  return config;
}

// PRNG for deterministic data generation
class RandomGenerator {
  private s: number;

  constructor(seed: number) {
    this.s = seed;
  }

  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }

  intBetween(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

// ============================================================================
// REALISTIC INDIAN DEMOGRAPHIC DATASETS
// ============================================================================

const BRIDE_NAMES = [
  'Aanya', 'Ananya', 'Aaradhya', 'Diya', 'Ishita', 'Kavya', 'Meera', 'Navya',
  'Pooja', 'Rhea', 'Roshni', 'Samaira', 'Sanya', 'Shreya', 'Sneha', 'Tanvi',
  'Tara', 'Trisha', 'Vaishnavi', 'Zoya', 'Aditi', 'Alia', 'Avani', 'Bhavna',
  'Deepika', 'Divya', 'Gauri', 'Jhanvi', 'Kareena', 'Kiara', 'Kriti', 'Lavanya',
  'Mira', 'Neha', 'Palak', 'Pari', 'Prisha', 'Riddhi', 'Riya', 'Suhana'
];

const GROOM_NAMES = [
  'Aarav', 'Aditya', 'Arjun', 'Armaan', 'Dev', 'Dhruv', 'Ishaan', 'Kabir',
  'Karan', 'Manav', 'Neil', 'Pranav', 'Raghav', 'Reyansh', 'Rohan', 'Samar',
  'Shaurya', 'Siddharth', 'Varun', 'Vivaan', 'Abhimanyu', 'Advait', 'Aryan',
  'Ayush', 'Darsh', 'Farhan', 'Hrithik', 'Jay', 'Madhav', 'Nakul', 'Ranveer',
  'Rishi', 'Ronit', 'Sahil', 'Tanishq', 'Utkarsh', 'Vedant', 'Vikram', 'Yash', 'Zubair'
];

const LAST_NAMES = [
  'Agarwal', 'Bansal', 'Bhatia', 'Chopra', 'Deshmukh', 'Dhawan', 'Goel', 'Gupta',
  'Iyer', 'Jain', 'Kapoor', 'Khanna', 'Kothari', 'Malhotra', 'Mehta', 'Mittal',
  'Mukherjee', 'Nair', 'Patel', 'Rathore', 'Reddy', 'Roy', 'Saxena', 'Shah',
  'Sharma', 'Shetty', 'Singhania', 'Sood', 'Trivedi', 'Varma', 'Verma', 'Yadav'
];

const INDIAN_CITIES = [
  { city: 'Udaipur', state: 'Rajasthan', venueTier: 'Palace' },
  { city: 'Jaipur', state: 'Rajasthan', venueTier: 'Heritage Fort' },
  { city: 'Jodhpur', state: 'Rajasthan', venueTier: 'Palace' },
  { city: 'Mumbai', state: 'Maharashtra', venueTier: 'Luxury Seafront' },
  { city: 'New Delhi', state: 'Delhi NCR', venueTier: 'Grand Estate' },
  { city: 'Bengaluru', state: 'Karnataka', venueTier: 'Palace & Garden' },
  { city: 'Goa', state: 'Goa', venueTier: 'Beachside Villa' },
  { city: 'Hyderabad', state: 'Telangana', venueTier: 'Nizami Palace' },
  { city: 'Kolkata', state: 'West Bengal', venueTier: 'Colonial Heritage' },
  { city: 'Agra', state: 'Uttar Pradesh', venueTier: 'Mughal Heritage' },
  { city: 'Mussoorie', state: 'Uttarakhand', venueTier: 'Himalayan Resort' },
  { city: 'Kochi', state: 'Kerala', venueTier: 'Backwater Luxury' },
  { city: 'Chandigarh', state: 'Punjab', venueTier: 'Royal Farmhouse' },
  { city: 'Ahmedabad', state: 'Gujarat', venueTier: 'Heritage Haveli' },
  { city: 'Varanasi', state: 'Uttar Pradesh', venueTier: 'Ghat Heritage' },
];

const VENUE_NAMES = [
  'The Imperial Palace & Banquets', 'Jagmandir Island Pavilion', 'Rambagh Heritage Estate',
  'Umaid Heritage Gardens', 'Taj Falaknuma Grand Ballroom', 'The Oberoi Rajvilas Grounds',
  'Alila Bishangarh Fort Courtyard', 'Suryagarh Royal Dunes', 'ITC Grand Bharat Pavilion',
  'The Leela Kovalam Cliffside', 'Wildflower Hall Mountain Terrace', 'Fateh Prakash Palace Banquets',
  'Chunda Haveli Royal Courtyard', 'Samode Palace Heritage Mandap', 'Noormahal Grand Heritage Hall'
];

const VENDOR_BUSINESS_NAMES: Record<VendorCategory, string[]> = {
  [VendorCategory.CATERING]: [
    'Royal Rajputana Culinary & Banquets', 'Saffron & Spice Gourmet Caterers',
    'The Golden Spoon Grand Feast', 'Mewari Shahi Dastarkhwan', 'Silver Platter Imperial Feasts',
    'Amrit Ras Continental & Indian Fusion', 'Heritage Nawabi Kitchens', 'Kohinoor Banquet Catering'
  ],
  [VendorCategory.DECORATION]: [
    'Shahi Mahal Royal Floral & Mandap Decor', 'Gilded Dreams Wedding Architecture',
    'Aura Mandap Craftsmen & Floral Designers', 'Marigold Imperial Event Styling',
    'Kohinoor Palace Set Designers', 'Vedic Bloom Floral Productions', 'Elysian Canopy Decor'
  ],
  [VendorCategory.PHOTOGRAPHY]: [
    'Stories in Gold Cinematic Photography', 'Vows & Heritage Fine-Art Films',
    'Royal Shutter Wedding Memories', 'Candid Moments Luxury Cinema',
    'Eternal Frames Heritage Studios', 'Golden Hour Wedding Photography', 'The Royal Lens Documentaries'
  ],
  [VendorCategory.DJ_MUSIC]: [
    'DJ Shadow & Sonic Symphony', 'Imperial Beats & Dhol Troupe',
    'Sangeet Rhythm Collective', 'Royal Rajasthani Folk & Fusion Band',
    'Bass & Shehnai Symphony Orchestra', 'Electric Mandap DJ Collective'
  ],
  [VendorCategory.MAKEUP_ARTIST]: [
    'Bridal Aura by Geetika', 'Imperial Royal Glow Bridal Artistry',
    'Couture Glam Studio by Aisha', 'Vedic Beauty Bridal Salon',
    'The Regal Touch Makeup Studio', 'Shringar Luxury Makeovers'
  ],
  [VendorCategory.FLORIST]: [
    'Gulab & Jasmine Floral Couture', 'Petals of Vrindavan Exotic Florals',
    'The Bloom Chamber Luxury Floral Art', 'Rajputana Fresh Floral Creations'
  ],
  [VendorCategory.VENUE]: [
    'The Grand Lakefront Palace & Lawns', 'Royal Heritage Fort & Courtyards',
    'Emerald Dunes Palace Resort', 'The Majestic Imperial Pavilion'
  ],
  [VendorCategory.TRANSPORTATION]: [
    'Maharaja Vintage Fleet & Chariots', 'Royal Escort Luxury Limousines',
    'Heritage Rolls & Vintage Motors', 'Grand Sovereign Chauffeur Fleet'
  ],
  [VendorCategory.MEHENDI]: [
    'Bridal Henna Elegance by Noor', 'Royal Marwari Mehendi Artists',
    'Aafreen Henna Heritage Studio', 'The Gilded Mehendi Canvas'
  ],
  [VendorCategory.CHOREOGRAPHY]: [
    'Sangeet Beats Wedding Choreography', 'Thumka & Taal Dance Academy',
    'Royal Moves Wedding Dance Studio', 'Bollywood Dreams Choreographers'
  ],
  [VendorCategory.OTHER]: [
    'Vedic Pundit & Astrological Services', 'Shahi Safa Bandhej Masters',
    'Royal Fireworks & Cold Pyro Spectacular', 'Imperial Guest Hospitality & Favors'
  ]
};

// ============================================================================
// SAFETY GUARD
// ============================================================================

function verifySafetyGuard(): void {
  const dbUrl = process.env.DATABASE_URL || '';
  const isAllowed = process.env.ALLOW_DEMO_SEED === 'true';
  const isRemoteNeon = dbUrl.includes('neon.tech') || dbUrl.includes('render.com') || dbUrl.includes('postgres.database.azure.com');

  if (isRemoteNeon && !isAllowed) {
    console.error('\n🛑 =================================================================');
    console.error('🛑 GRAND BANDHAN SAFETY GUARD ACTIVATED:');
    console.error('🛑 Detected connection to remote database cluster.');
    console.error('🛑 To proceed, set ALLOW_DEMO_SEED=true:');
    console.error('🛑   $env:ALLOW_DEMO_SEED="true"; npx tsx scripts/seed-demo-data.ts');
    console.error('🛑 =================================================================\n');
    process.exit(1);
  }
}

// ============================================================================
// CLEANUP ROUTINE (SURGICALLY REMOVES ONLY DEMO DATA)
// ============================================================================

const ORIGINAL_USER_EMAILS = [
  'vkrishuhow01@gmail.com',
  'asaggitarius1@gmail.com',
  'megatronn131403@gmail.com',
  '23cyber57@ecajmer.ac.in',
  'yashaudichya2007@gmail.com',
  'yashaudichya01@gmail.com',
];

async function cleanupDemoRecords(cleanAll = false): Promise<void> {
  console.log('🧹 Purging demo records from database...');

  // 1. Demo weddings
  const weddingWhere = cleanAll
    ? {
        OR: [
          { clientEmail: { endsWith: `@${DEMO_DOMAIN}` } },
          { weddingCode: { startsWith: 'GB-DEMO-' } },
          { weddingCode: { startsWith: 'GB-ROYAL-' } },
          { weddingCode: { startsWith: 'GB-HERITAGE-' } },
          { weddingCode: { startsWith: 'GB-COASTAL-' } },
        ],
      }
    : {
        OR: [
          { clientEmail: { endsWith: `@${DEMO_DOMAIN}` } },
          { weddingCode: { startsWith: 'GB-DEMO-' } },
        ],
      };

  const demoWeddings = await prisma.wedding.findMany({
    where: weddingWhere,
    select: { id: true, weddingCode: true },
  });
  const demoWeddingIds = demoWeddings.map((w) => w.id);
  console.log(`Found ${demoWeddings.length} demo weddings to remove.`);

  // 2. Demo vendors
  const vendorWhere = cleanAll
    ? {
        OR: [
          { email: { endsWith: `@${DEMO_DOMAIN}` } },
          { email: { in: ORIGINAL_USER_EMAILS, mode: 'insensitive' as const } },
        ],
      }
    : { email: { endsWith: `@${DEMO_DOMAIN}` } };

  const demoVendors = await prisma.vendor.findMany({
    where: vendorWhere,
    select: { id: true, email: true },
  });
  const demoVendorIds = demoVendors.map((v) => v.id);
  console.log(`Found ${demoVendors.length} demo vendors to remove.`);

  // 3. Demo enquiries
  const enquiryWhere = cleanAll
    ? {
        OR: [
          { email: { endsWith: `@${DEMO_DOMAIN}` } },
          { referenceNumber: { startsWith: 'ENQ-DEMO-' } },
          { referenceNumber: { startsWith: 'ENQ-ORIGINAL-' } },
        ],
      }
    : {
        OR: [
          { email: { endsWith: `@${DEMO_DOMAIN}` } },
          { referenceNumber: { startsWith: 'ENQ-DEMO-' } },
        ],
      };

  const demoEnquiries = await prisma.customerEnquiry.findMany({
    where: enquiryWhere,
    select: { id: true },
  });
  const demoEnquiryIds = demoEnquiries.map((e) => e.id);
  console.log(`Found ${demoEnquiries.length} demo customer enquiries to remove.`);

  // 4. Demo users
  const userWhere = cleanAll
    ? {
        OR: [
          { email: { endsWith: `@${DEMO_DOMAIN}` } },
          { email: { in: ORIGINAL_USER_EMAILS, mode: 'insensitive' as const } },
        ],
      }
    : { email: { endsWith: `@${DEMO_DOMAIN}` } };

  const demoUsers = await prisma.user.findMany({
    where: userWhere,
    select: { id: true, email: true },
  });
  const demoUserIds = demoUsers.map((u) => u.id);
  console.log(`Found ${demoUsers.length} demo users to remove.`);

  // Cascade Deletion in strict dependency order
  if (demoWeddingIds.length > 0) {
    await prisma.serviceVerification.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.weddingVendor.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.task.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.eventVendorArrival.deleteMany({ where: { eventTimeline: { weddingId: { in: demoWeddingIds } } } });
    await prisma.eventTimeline.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.payment.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.settlement.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.weddingGuest.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.digitalAgreement.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.weddingConsultation.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.quotationRequest.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.wedding.deleteMany({ where: { id: { in: demoWeddingIds } } });
  }

  if (demoEnquiryIds.length > 0) {
    await prisma.weddingConsultation.deleteMany({ where: { enquiryId: { in: demoEnquiryIds } } });
    await prisma.customerEnquiry.deleteMany({ where: { id: { in: demoEnquiryIds } } });
  }

  if (demoVendorIds.length > 0) {
    await prisma.vendorQuotation.deleteMany({ where: { vendorId: { in: demoVendorIds } } });
    await prisma.vendor.deleteMany({ where: { id: { in: demoVendorIds } } });
  }

  if (demoUserIds.length > 0) {
    await prisma.passwordResetToken.deleteMany({ where: { userId: { in: demoUserIds } } });
    await prisma.refreshToken.deleteMany({ where: { userId: { in: demoUserIds } } });
    await prisma.notificationPreference.deleteMany({ where: { userId: { in: demoUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: demoUserIds } } });
  }

  console.log('✅ Cleanup completed cleanly. Real agency and contributor records remain untouched.\n');
}

// ============================================================================
// PART 1: ORIGINAL VIP & EXECUTIVE ACCOUNTS
// ============================================================================

async function seedOriginalAccounts(agencyId: string, globalPasswordHash: string) {
  console.log('\n🌟 ====================================================================');
  console.log('👑 SEEDING 6 ORIGINAL TEST & EXECUTIVE ACCOUNTS ACROSS ALL SECTIONS');
  console.log('🌟 ====================================================================');

  // 1. Super Admin: Er. Yash Sharma
  const superAdminEmail = '23cyber57@ecajmer.ac.in';
  let superAdmin = await prisma.user.findFirst({
    where: { email: { equals: superAdminEmail, mode: 'insensitive' } },
  });
  if (!superAdmin) {
    superAdmin = await prisma.user.create({
      data: {
        agencyId,
        name: 'Er. Yash Sharma (Executive Director)',
        email: superAdminEmail,
        passwordHash: globalPasswordHash,
        role: UserRole.SUPER_ADMIN,
        phone: '+91 94140 12345',
        accountStatus: AccountStatus.ACTIVE,
        isActive: true,
      },
    });
  }
  console.log(`  ✅ Super Admin: ${superAdmin.email} (${superAdmin.name})`);

  // 2. Wedding Planner: Ananya Singhania
  const plannerEmail = 'asaggitarius1@gmail.com';
  let planner = await prisma.user.findFirst({
    where: { email: { equals: plannerEmail, mode: 'insensitive' } },
  });
  if (!planner) {
    planner = await prisma.user.create({
      data: {
        agencyId,
        name: 'Ananya Singhania (Principal Luxury Planner)',
        email: plannerEmail,
        passwordHash: globalPasswordHash,
        role: UserRole.WEDDING_PLANNER,
        phone: '+91 98201 54321',
        accountStatus: AccountStatus.ACTIVE,
        isActive: true,
      },
    });
  }
  console.log(`  ✅ Wedding Planner: ${planner.email} (${planner.name})`);

  // 3. Premier Catering Vendor: Yash Audichya
  const vendorUserEmail = 'yashaudichya2007@gmail.com';
  let vendorUser = await prisma.user.findFirst({
    where: { email: { equals: vendorUserEmail, mode: 'insensitive' } },
  });
  if (!vendorUser) {
    vendorUser = await prisma.user.create({
      data: {
        agencyId,
        name: 'Yash Audichya (Royal Shahi Gourmet Catering)',
        email: vendorUserEmail,
        passwordHash: globalPasswordHash,
        role: UserRole.VENDOR,
        phone: '+91 98250 99887',
        accountStatus: AccountStatus.ACTIVE,
        isActive: true,
      },
    });
  }

  let yashVendor = await prisma.vendor.findFirst({
    where: { email: { equals: vendorUserEmail, mode: 'insensitive' } },
  });
  if (!yashVendor) {
    yashVendor = await prisma.vendor.create({
      data: {
        agencyId,
        name: 'Royal Shahi Gourmet Catering & Banquets',
        category: VendorCategory.CATERING,
        contactPerson: 'Yash Audichya',
        email: vendorUserEmail,
        phone: '+91 98250 99887',
        address: '108 Heritage Enclave, Civil Lines, Jaipur & Udaipur',
        pricingModel: 'PER_PLATE',
        basePrice: 450000,
        rating: 4.9,
        isApproved: true,
        portfolioUrls: [
          'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        ],
      },
    });
  }
  console.log(`  ✅ Premier Vendor: ${yashVendor.email} (${yashVendor.name})`);

  // Secondary Vendors for 3-Vendor Quotations
  let decorVendor = await prisma.vendor.findFirst({ where: { category: VendorCategory.DECORATION } });
  if (!decorVendor) {
    decorVendor = await prisma.vendor.create({
      data: {
        agencyId,
        name: 'Shahi Mahal Royal Floral & Mandap Decor',
        category: VendorCategory.DECORATION,
        contactPerson: 'Vikramaditya Rathore',
        email: 'decor.royal@demo.grandbandhan.com',
        phone: '+91 98222 11111',
        address: 'Palace Road, Udaipur',
        pricingModel: 'PER_EVENT',
        basePrice: 850000,
        rating: 4.8,
        isApproved: true,
      },
    });
  }

  let photoVendor = await prisma.vendor.findFirst({ where: { category: VendorCategory.PHOTOGRAPHY } });
  if (!photoVendor) {
    photoVendor = await prisma.vendor.create({
      data: {
        agencyId,
        name: 'Stories in Gold Cinematic Photography',
        category: VendorCategory.PHOTOGRAPHY,
        contactPerson: 'Aryan Malhotra',
        email: 'photo.gold@demo.grandbandhan.com',
        phone: '+91 98333 22222',
        address: 'Bandra West, Mumbai',
        pricingModel: 'PER_EVENT',
        basePrice: 550000,
        rating: 4.9,
        isApproved: true,
      },
    });
  }

  // 4. Couple Account 1: Krish Chauhan & Varnika Rathore (VKrishuhow01@gmail.com)
  await seedOriginalWeddingPackage({
    agencyId,
    clientEmail: 'VKrishuhow01@gmail.com',
    clientPhone: '+91 98290 87654',
    brideName: 'Varnika Rathore',
    groomName: 'Krish Chauhan',
    weddingCode: 'GB-ROYAL-2026-001',
    enquiryRef: 'ENQ-ORIGINAL-001',
    agreementNumber: 'AGR-ROYAL-2026-001',
    city: 'Udaipur',
    state: 'Rajasthan',
    venue: 'Jagmandir Island Pavilion, Lake Pichola',
    guestCount: 450,
    budgetMin: 8500000,
    budgetMax: 12000000,
    weddingStatus: WeddingStatus.EXECUTION,
    plannerId: planner.id,
    globalPasswordHash,
    primaryCateringVendor: yashVendor,
    decorVendor,
    photoVendor,
  });

  // 5. Couple Account 2: Tarun Kapoor & Megha Malhotra (megatronn131403@gmail.com)
  await seedOriginalWeddingPackage({
    agencyId,
    clientEmail: 'megatronn131403@gmail.com',
    clientPhone: '+91 98111 23456',
    brideName: 'Megha Malhotra',
    groomName: 'Tarun Kapoor',
    weddingCode: 'GB-HERITAGE-2026-002',
    enquiryRef: 'ENQ-ORIGINAL-002',
    agreementNumber: 'AGR-HERITAGE-2026-002',
    city: 'Jaipur',
    state: 'Rajasthan',
    venue: 'Rambagh Heritage Estate',
    guestCount: 380,
    budgetMin: 6500000,
    budgetMax: 9500000,
    weddingStatus: WeddingStatus.IN_PLANNING,
    plannerId: planner.id,
    globalPasswordHash,
    primaryCateringVendor: yashVendor,
    decorVendor,
    photoVendor,
  });

  // 6. Couple Account 3: Yash Audichya & Ananya Deshmukh (yashaudichya01@gmail.com)
  await seedOriginalWeddingPackage({
    agencyId,
    clientEmail: 'yashaudichya01@gmail.com',
    clientPhone: '+91 97234 56789',
    brideName: 'Ananya Deshmukh',
    groomName: 'Yash Audichya',
    weddingCode: 'GB-COASTAL-2026-003',
    enquiryRef: 'ENQ-ORIGINAL-003',
    agreementNumber: 'AGR-COASTAL-2026-003',
    city: 'Goa',
    state: 'Goa',
    venue: 'Beachside Villa & Private Lawns, South Goa',
    guestCount: 250,
    budgetMin: 5000000,
    budgetMax: 7500000,
    weddingStatus: WeddingStatus.IN_PLANNING,
    plannerId: planner.id,
    globalPasswordHash,
    primaryCateringVendor: yashVendor,
    decorVendor,
    photoVendor,
  });

  console.log('🌟 ====================================================================\n');
}

interface OriginalWeddingParams {
  agencyId: string;
  clientEmail: string;
  clientPhone: string;
  brideName: string;
  groomName: string;
  weddingCode: string;
  enquiryRef: string;
  agreementNumber: string;
  city: string;
  state: string;
  venue: string;
  guestCount: number;
  budgetMin: number;
  budgetMax: number;
  weddingStatus: WeddingStatus;
  plannerId: string;
  globalPasswordHash: string;
  primaryCateringVendor: any;
  decorVendor: any;
  photoVendor: any;
}

async function seedOriginalWeddingPackage(params: OriginalWeddingParams) {
  const {
    agencyId,
    clientEmail,
    clientPhone,
    brideName,
    groomName,
    weddingCode,
    enquiryRef,
    agreementNumber,
    city,
    state,
    venue,
    guestCount,
    budgetMin,
    budgetMax,
    weddingStatus,
    plannerId,
    globalPasswordHash,
    primaryCateringVendor,
    decorVendor,
    photoVendor,
  } = params;

  // A. User Account
  let user = await prisma.user.findFirst({
    where: { email: { equals: clientEmail, mode: 'insensitive' } },
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        agencyId,
        name: `${brideName} & ${groomName}`,
        email: clientEmail,
        passwordHash: globalPasswordHash,
        role: UserRole.CLIENT,
        phone: clientPhone,
        accountStatus: AccountStatus.ACTIVE,
        isActive: true,
      },
    });
  }

  // B. Customer Enquiry (CRM Queries Section)
  let enquiry = await prisma.customerEnquiry.findUnique({
    where: { referenceNumber: enquiryRef },
  });
  if (!enquiry) {
    enquiry = await prisma.customerEnquiry.create({
      data: {
        agencyId,
        referenceNumber: enquiryRef,
        customerName: groomName,
        partnerName: brideName,
        email: clientEmail,
        phone: clientPhone,
        preferredContactMethod: 'EMAIL',
        weddingDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        location: `${venue}, ${city}, ${state}`,
        guestCount,
        minBudget: budgetMin,
        maxBudget: budgetMax,
        theme: 'Royal Heritage & Floral Elegance',
        packageType: WeddingPackageType.FULL_SERVICE,
        eventsRequired: ['Haldi', 'Mehendi', 'Sangeet', 'Baraat', 'Pheras', 'Reception'],
        servicesRequired: ['Catering', 'Decor', 'Photography', 'Sound & Light', 'Hospitality'],
        source: EnquirySource.WEBSITE,
        planningFor: PlanningForSide.GROOM_SIDE,
        status: EnquiryStatus.APPROVED,
        assignedPlannerId: plannerId,
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });
  }

  // C. Wedding Consultation (First Consultations Section)
  let consultation = await prisma.weddingConsultation.findFirst({
    where: { enquiryId: enquiry.id },
  });
  if (!consultation) {
    consultation = await prisma.weddingConsultation.create({
      data: {
        agencyId,
        enquiryId: enquiry.id,
        plannerId,
        scheduledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        meetingType: ConsultationType.ONLINE_VIDEO,
        meetingLink: 'https://meet.google.com/grb-wed-royal',
        status: ConsultationStatus.COMPLETED,
        clientPreferredTime: 'Evening 6:00 PM IST',
        meetingNotes: `Extensive 90-minute consultation with ${brideName} and ${groomName}. Focus on grand Rajasthani hospitality, authentic Mewari dishes, and architectural floral mandap over Lake Pichola waters.`,
        coupleVision: 'Timeless royal aesthetic with gold accents, pure marigold & jasmine aromas, and high-energy live Sufi performance.',
        themePreferences: 'Regal Ivory, Vintage Gold, and Royal Crimson.',
        guestCountConfirmed: guestCount,
        budgetDiscussed: budgetMin,
        venuePreferences: venue,
        specialRequirements: 'Dedicated Jain dining pavilion, vintage car procession for Baraat, drone cinema clearance.',
        familyExpectations: 'Seamless guest check-in with traditional royal aarti and garland welcome.',
        completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
      },
    });
  }

  // D. Wedding Record (Weddings Directory Section)
  const weddingDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  const endDate = new Date(weddingDate.getTime() + 2 * 24 * 60 * 60 * 1000);

  let wedding = await prisma.wedding.findUnique({
    where: { weddingCode },
  });
  if (!wedding) {
    wedding = await prisma.wedding.create({
      data: {
        agencyId,
        weddingCode,
        brideName,
        groomName,
        clientEmail,
        clientPhone,
        weddingDate,
        endDate,
        location: `${venue}, ${city}, ${state}`,
        guestCount,
        budgetMin,
        budgetMax,
        packageType: WeddingPackageType.FULL_SERVICE,
        status: weddingStatus,
        clientId: user.id,
        plannerId,
        notes: `Signature Grand Bandhan luxury celebration for ${brideName} & ${groomName}.`,
      },
    });

    // Update consultation with wedding link
    await prisma.weddingConsultation.update({
      where: { id: consultation.id },
      data: { weddingId: wedding.id },
    });
  }

  // E. Digital Agreement (Service Agreements Section)
  let agreement = await prisma.digitalAgreement.findUnique({
    where: { weddingId: wedding.id },
  });
  if (!agreement) {
    agreement = await prisma.digitalAgreement.create({
      data: {
        weddingId: wedding.id,
        agreementNumber,
        termsContent: `IMPERIAL WEDDING MANAGEMENT & CLIENT SERVICE AGREEMENT

Parties: Grand Bandhan Luxury Weddings & ${brideName} & ${groomName}
Destination: ${venue}, ${city}, ${state}
Event Dates: ${weddingDate.toDateString()} to ${endDate.toDateString()}
Guaranteed Guest Count: ${guestCount}
Contracted Planning Budget: INR ${budgetMin.toLocaleString()}

KEY CLAUSES & EXECUTION GUARANTEES:
1. SCOPE: Complete 360-degree planning, design, vendor management, and live day-of execution.
2. THREE VENDORS ONE DECISION: Curated 3-vendor competitive comparison for all critical categories.
3. QUALITY VERIFICATION: Mandatory OTP and photo verification for vendor arrivals and stage setup.
4. PAYMENT RECONCILIATION: Transparent milestones with final audited post-event settlement.
5. CANCELLATION & FORCE MAJEURE: Governed by standard luxury hospitality guidelines.`,
        signedByName: `${groomName} & ${brideName}`,
        signedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        status: AgreementStatus.SIGNED,
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><text x="10" y="40" font-family="cursive" font-size="24" fill="%23C9A96A">Krish &amp; Varnika</text></svg>',
      },
    });
  }

  // F. 3-Vendor Quotations Section ("Three Vendors One Decision")
  let cateringQR = await prisma.quotationRequest.findFirst({
    where: { weddingId: wedding.id, category: VendorCategory.CATERING },
  });
  if (!cateringQR) {
    cateringQR = await prisma.quotationRequest.create({
      data: {
        weddingId: wedding.id,
        category: VendorCategory.CATERING,
        title: 'Imperial Royal Dining & Live Gourmet Feast',
        guestCount,
        targetBudget: Math.round(budgetMin * 0.35),
        specifications: 'Authentic Mewari Thali, Live Chaat Bazaar, Continental Wood-Fired Pizza, Traditional Indian Mithai Counter.',
        status: QuotationRequestStatus.AWARDED,
      },
    });

    // 3 Competing Quotations
    const q1 = await prisma.vendorQuotation.create({
      data: {
        quotationRequestId: cateringQR.id,
        vendorId: primaryCateringVendor.id,
        baseAmount: 1850000,
        pricePerPlate: 2200,
        extraHourRate: 35000,
        additionalCosts: 50000,
        menuDetails: 'Complete Royal Mewari & International Fusion Banquet (140 Items)',
        includedItems: ['Copper Chafing Setups', 'Silver Thali VIP Service', 'Live Nitrogen Dessert Bar'],
        notes: 'Awarded signature vendor. Custom ice sculptures included at no charge.',
        isAgencyRecommended: true,
        status: QuotationStatus.SELECTED,
        selectedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    });

    // Link WeddingVendor
    await prisma.weddingVendor.create({
      data: {
        weddingId: wedding.id,
        vendorId: primaryCateringVendor.id,
        quotationId: q1.id,
        agreedAmount: 1850000,
        contractStatus: 'CONFIRMED',
        notes: 'Awarded caterer for all 3 days.',
      },
    });

    // Competing Vendor 2
    if (decorVendor) {
      await prisma.vendorQuotation.create({
        data: {
          quotationRequestId: cateringQR.id,
          vendorId: decorVendor.id, // alternative partner
          baseAmount: 2100000,
          pricePerPlate: 2500,
          status: QuotationStatus.REJECTED,
          notes: 'Higher per-plate rate.',
        },
      });
    }

    // Competing Vendor 3
    if (photoVendor) {
      await prisma.vendorQuotation.create({
        data: {
          quotationRequestId: cateringQR.id,
          vendorId: photoVendor.id, // alternative partner
          baseAmount: 1750000,
          pricePerPlate: 2000,
          status: QuotationStatus.REJECTED,
          notes: 'Limited live counter varieties.',
        },
      });
    }
  }

  // G. Instant Task Planner Section (Task)
  const taskCount = await prisma.task.count({ where: { weddingId: wedding.id } });
  if (taskCount === 0) {
    await prisma.task.createMany({
      data: [
        {
          weddingId: wedding.id,
          title: 'Finalize Lake-Facing Mandap Floral Architecture & Amber Lighting',
          category: 'Decor & Design',
          deadline: new Date(weddingDate.getTime() - 20 * 24 * 60 * 60 * 1000),
          priority: TaskPriority.HIGH,
          status: TaskStatus.DONE,
        },
        {
          weddingId: wedding.id,
          title: 'Royal Food Tasting with Yash Audichya (Chef Selection)',
          category: 'Catering & Banquets',
          deadline: new Date(weddingDate.getTime() - 15 * 24 * 60 * 60 * 1000),
          priority: TaskPriority.HIGH,
          status: TaskStatus.DONE,
        },
        {
          weddingId: wedding.id,
          title: 'Confirm Vintage Rolls-Royce & Royal Chariot for Baraat Procession',
          category: 'Logistics & Transport',
          deadline: new Date(weddingDate.getTime() - 10 * 24 * 60 * 60 * 1000),
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.IN_PROGRESS,
        },
        {
          weddingId: wedding.id,
          title: 'Complete Airport VIP Transfers & Suite Room Allocations',
          category: 'Hospitality & Guest Care',
          deadline: new Date(weddingDate.getTime() - 5 * 24 * 60 * 60 * 1000),
          priority: TaskPriority.HIGH,
          status: TaskStatus.IN_PROGRESS,
        },
        {
          weddingId: wedding.id,
          title: 'Vedic Pundit Coordination & Samagri Check for 7 Pheras',
          category: 'Priest & Vedic Rituals',
          deadline: new Date(weddingDate.getTime() - 2 * 24 * 60 * 60 * 1000),
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.TO_PLAN,
        },
        {
          weddingId: wedding.id,
          title: 'Sound Check & Symphony Acoustic Tuning for Sufi Night',
          category: 'Sound, Light & Entertainment',
          deadline: new Date(weddingDate.getTime() - 1 * 24 * 60 * 60 * 1000),
          priority: TaskPriority.HIGH,
          status: TaskStatus.TO_PLAN,
        },
      ],
    });
  }

  // H. Live Day-of Timeline Section (EventTimeline)
  const eventCount = await prisma.eventTimeline.count({ where: { weddingId: wedding.id } });
  let events: any[] = [];
  if (eventCount === 0) {
    const d1 = weddingDate;
    const d2 = new Date(weddingDate.getTime() + 1 * 24 * 60 * 60 * 1000);

    const ev1 = await prisma.eventTimeline.create({
      data: {
        weddingId: wedding.id,
        title: 'Shree Gauri Ganesh Sthapana & Welcome Lunch',
        startTime: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 10, 0),
        endTime: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 13, 30),
        location: 'Heritage Courtyard & Poolside',
        status: EventStatus.COMPLETED,
        responsibleUserId: plannerId,
        notes: 'Traditional shehnai players welcoming family arrival.',
        orderIndex: 1,
      },
    });

    const ev2 = await prisma.eventTimeline.create({
      data: {
        weddingId: wedding.id,
        title: 'Phoolon Ki Holi & Royal Haldi Celebration',
        startTime: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 15, 0),
        endTime: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 18, 0),
        location: 'Lakefront Lawn Pavilions',
        status: EventStatus.COMPLETED,
        responsibleUserId: plannerId,
        notes: 'Organic yellow petals, dhol players, signature mocktails.',
        orderIndex: 2,
      },
    });

    const ev3 = await prisma.eventTimeline.create({
      data: {
        weddingId: wedding.id,
        title: 'Imperial Sangeet & Sufi Musical Extravaganza',
        startTime: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 19, 30),
        endTime: new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), 23, 59),
        location: 'Grand Ballroom & Starlight Amphitheater',
        status: EventStatus.IN_PROGRESS,
        responsibleUserId: plannerId,
        notes: 'Celebrity performance, 360-degree LED visual displays.',
        orderIndex: 3,
      },
    });

    const ev4 = await prisma.eventTimeline.create({
      data: {
        weddingId: wedding.id,
        title: 'Royal Shobha Yatra & Baraat Assembly',
        startTime: new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 16, 0),
        endTime: new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 18, 30),
        location: 'Palace Main Gate to Lake Promenade',
        status: EventStatus.SCHEDULED,
        responsibleUserId: plannerId,
        notes: 'Brass band, royal horse carriage, cold pyro fireworks.',
        orderIndex: 4,
      },
    });

    const ev5 = await prisma.eventTimeline.create({
      data: {
        weddingId: wedding.id,
        title: 'Vedic Vivah Sanskar & Sacred Pheras',
        startTime: new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 19, 0),
        endTime: new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 21, 30),
        location: 'Island Water Mandap',
        status: EventStatus.SCHEDULED,
        responsibleUserId: plannerId,
        notes: 'Floating floral mandap, Vedic chants with harp accompaniment.',
        orderIndex: 5,
      },
    });

    const ev6 = await prisma.eventTimeline.create({
      data: {
        weddingId: wedding.id,
        title: 'Grand Imperial Royal Gala Reception',
        startTime: new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 21, 30),
        endTime: new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), 24, 0),
        location: 'Royal Banquet Lawns & Palatial Dining Hall',
        status: EventStatus.SCHEDULED,
        responsibleUserId: plannerId,
        notes: 'Gourmet banquet by Royal Shahi Catering, live jazz band.',
        orderIndex: 6,
      },
    });

    events = [ev1, ev2, ev3, ev4, ev5, ev6];
  } else {
    events = await prisma.eventTimeline.findMany({ where: { weddingId: wedding.id } });
  }

  // I. Service Verification Section (ServiceVerification)
  const svCount = await prisma.serviceVerification.count({ where: { weddingId: wedding.id } });
  if (svCount === 0 && events.length > 0) {
    await prisma.serviceVerification.create({
      data: {
        weddingId: wedding.id,
        eventTimelineId: events[0]?.id,
        vendorId: primaryCateringVendor.id,
        serviceName: 'Welcome Lunch Live Buffet Setup & Hygiene Check',
        scheduledConfirmationTime: new Date(Date.now() - 1000 * 60 * 60 * 3),
        status: ServiceVerificationStatus.CONFIRMED,
        confirmedByUserId: plannerId,
        response: VerificationResponse.COMPLETED,
        issueNotes: 'All 8 live stations operational 45 minutes ahead of schedule.',
        evidencePhotos: [
          'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
        ],
        vendorResponseNotes: 'Freshly prepared warm appetizers replenished continuously.',
      },
    });

    if (decorVendor && events[1]) {
      await prisma.serviceVerification.create({
        data: {
          weddingId: wedding.id,
          eventTimelineId: events[1]?.id,
          vendorId: decorVendor.id,
          serviceName: 'Phoolon Ki Holi Marigold Canopy & Splash Guards',
          scheduledConfirmationTime: new Date(Date.now() - 1000 * 60 * 60 * 1),
          status: ServiceVerificationStatus.CONFIRMED,
          confirmedByUserId: plannerId,
          response: VerificationResponse.COMPLETED,
          issueNotes: 'Floral canopy verified and weather-resistant anchors inspected.',
        },
      });
    }

    if (photoVendor && events[2]) {
      await prisma.serviceVerification.create({
        data: {
          weddingId: wedding.id,
          eventTimelineId: events[2]?.id,
          vendorId: photoVendor.id,
          serviceName: 'Cinematic Sangeet 4K Multi-Cam & Crane Rigging',
          scheduledConfirmationTime: new Date(Date.now() + 1000 * 60 * 60 * 2),
          status: ServiceVerificationStatus.AWAITING_CONFIRMATION,
          issueNotes: 'Rigging in progress; audio feed sync test scheduled for 18:30.',
        },
      });
    }
  }

  // J. Milestone Payments Section (Payment)
  const payCount = await prisma.payment.count({ where: { weddingId: wedding.id } });
  if (payCount === 0) {
    const depositAmount = Math.round(budgetMin * 0.25);
    const advanceAmount = Math.round(budgetMin * 0.4);
    const balanceAmount = budgetMin - depositAmount - advanceAmount;

    await prisma.payment.createMany({
      data: [
        {
          weddingId: wedding.id,
          type: PaymentType.CLIENT_MILESTONE,
          milestoneName: PaymentMilestone.BOOKING_DEPOSIT,
          amount: depositAmount,
          paidAmount: depositAmount,
          dueDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          paidDate: new Date(Date.now() - 24 * 24 * 60 * 60 * 1000),
          status: PaymentStatus.PAID,
          transactionRef: `TXN-ORIG-DEP-${wedding.weddingCode}`,
          notes: '25% Booking Deposit received via RTGS Bank Transfer',
        },
        {
          weddingId: wedding.id,
          type: PaymentType.CLIENT_MILESTONE,
          milestoneName: PaymentMilestone.ADVANCE_PAYMENT,
          amount: advanceAmount,
          paidAmount: advanceAmount,
          dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          paidDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          status: PaymentStatus.PAID,
          transactionRef: `TXN-ORIG-ADV-${wedding.weddingCode}`,
          notes: '40% Production Advance received',
        },
        {
          weddingId: wedding.id,
          type: PaymentType.CLIENT_MILESTONE,
          milestoneName: PaymentMilestone.FINAL_PAYMENT,
          amount: balanceAmount,
          paidAmount: 0,
          dueDate: new Date(weddingDate.getTime() + 3 * 24 * 60 * 60 * 1000),
          status: PaymentStatus.PENDING,
          notes: 'Final 35% settlement pending post-wedding reconciliation',
        },
      ],
    });
  }

  // K. Guest RSVP Directory Section (WeddingGuest)
  const guestCountDB = await prisma.weddingGuest.count({ where: { weddingId: wedding.id } });
  if (guestCountDB === 0) {
    await prisma.weddingGuest.createMany({
      data: [
        {
          weddingId: wedding.id,
          fullName: `Maharaja Gajendra Singh (Bride's Grandfather)`,
          email: `gajendra.singh@royalheritage.in`,
          side: PlanningForSide.BRIDE_SIDE,
          rsvpStatus: RsvpStatus.ATTENDING,
          guestCount: 2,
          dietaryPreference: 'Royal Rajasthani Traditional Thali',
          roomAssigned: 'Presidential Suite 101',
        },
        {
          weddingId: wedding.id,
          fullName: `Mrs. Sunita Chauhan (Groom's Mother)`,
          email: `sunita.chauhan@gmail.com`,
          side: PlanningForSide.GROOM_SIDE,
          rsvpStatus: RsvpStatus.ATTENDING,
          guestCount: 2,
          dietaryPreference: 'Pure Vegetarian (No Onion / Garlic)',
          roomAssigned: 'Maharani Suite 102',
        },
        {
          weddingId: wedding.id,
          fullName: `Aditya & Radhika Singhal`,
          email: `aditya.singhal@singhalgroup.com`,
          side: PlanningForSide.BRIDE_SIDE,
          rsvpStatus: RsvpStatus.ATTENDING,
          guestCount: 4,
          dietaryPreference: 'Continental & Indian Gourmet',
          roomAssigned: 'Deluxe Palace Suite 204',
        },
        {
          weddingId: wedding.id,
          fullName: `Rohit Verma (Best Man)`,
          email: `rohit.verma@fintech.co`,
          side: PlanningForSide.GROOM_SIDE,
          rsvpStatus: RsvpStatus.ATTENDING,
          guestCount: 1,
          dietaryPreference: 'Non-Vegetarian & Seafood',
          roomAssigned: 'Lakeview Suite 305',
        },
      ],
    });
  }

  console.log(`  ✅ Complete Ecosystem Seeded for Wedding [${weddingCode}] (${brideName} & ${groomName}) -> Client: ${clientEmail}`);
}

// ============================================================================
// PART 2: 500 ACCOUNTS COMPREHENSIVE SEEDING ENGINE
// ============================================================================

async function seed500ComprehensiveAccounts(config: SeedConfig, agencyId: string, globalPasswordHash: string) {
  const rng = new RandomGenerator(config.seed);

  console.log('\n🏛️ ====================================================================');
  console.log(`👑 SEEDING ${config.vendorsCount} VENDORS ACROSS ALL 11 CATEGORIES`);
  console.log('🏛️ ====================================================================');

  const categories = Object.values(VendorCategory);
  const seededVendors: any[] = [];

  for (let j = 1; j <= config.vendorsCount; j++) {
    const category = categories[(j - 1) % categories.length];
    const cityInfo = rng.pick(INDIAN_CITIES);
    const namesList = VENDOR_BUSINESS_NAMES[category] || VENDOR_BUSINESS_NAMES[VendorCategory.OTHER];
    const baseName = rng.pick(namesList);
    const contactFirst = rng.pick(GROOM_NAMES);
    const contactLast = rng.pick(LAST_NAMES);

    const businessName = `${baseName} (${cityInfo.city} #${j})`;
    const vendorEmail = `vendor.demo.${j}@${DEMO_DOMAIN}`;
    const vendorPhone = `+91 90002 ${String(j).padStart(5, '0')}`;

    const isApproved = rng.next() < 0.85;
    const basePrice = rng.intBetween(20, 150) * 10000;
    const rating = Math.round((4.2 + rng.next() * 0.8) * 10) / 10;

    if (config.dryRun) {
      continue;
    }

    // Upsert User
    let user = await prisma.user.findUnique({ where: { email: vendorEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          agencyId,
          name: `${contactFirst} ${contactLast} (${businessName})`,
          email: vendorEmail,
          passwordHash: globalPasswordHash,
          role: UserRole.VENDOR,
          phone: vendorPhone,
          accountStatus: isApproved ? AccountStatus.ACTIVE : AccountStatus.PENDING_APPROVAL,
          isActive: isApproved,
        },
      });
    }

    // Upsert Vendor Profile
    let vendor = await prisma.vendor.findFirst({ where: { email: vendorEmail } });
    if (!vendor) {
      vendor = await prisma.vendor.create({
        data: {
          agencyId,
          name: businessName,
          category,
          contactPerson: `${contactFirst} ${contactLast}`,
          email: vendorEmail,
          phone: vendorPhone,
          address: `${rng.intBetween(10, 999)}, Heritage Enclave, ${cityInfo.city}, ${cityInfo.state}`,
          pricingModel: category === VendorCategory.CATERING ? 'PER_PLATE' : 'PER_EVENT',
          basePrice,
          rating,
          isApproved,
          portfolioUrls: [
            'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
          ],
        },
      });
    }

    seededVendors.push(vendor);

    if (j % 25 === 0 || j === config.vendorsCount) {
      console.log(`  -> Processed ${j}/${config.vendorsCount} vendor profiles across categories...`);
    }
  }

  console.log('\n💍 ====================================================================');
  console.log(`👑 SEEDING ${config.couplesCount} COUPLES & POPULATING ALL 10 SECTIONS`);
  console.log('💍 ====================================================================');

  const WEDDING_STATUSES = [
    WeddingStatus.CONFIRMED,
    WeddingStatus.IN_PLANNING,
    WeddingStatus.IN_PLANNING,
    WeddingStatus.EXECUTION,
    WeddingStatus.COMPLETED,
  ];

  const ENQUIRY_STATUSES = [
    EnquiryStatus.APPROVED,
    EnquiryStatus.CONSULTATION_COMPLETED,
    EnquiryStatus.CONSULTATION_SCHEDULED,
    EnquiryStatus.QUALIFIED,
    EnquiryStatus.PROPOSAL_SENT,
  ];

  // Retrieve planners for assignment
  const planners = await prisma.user.findMany({
    where: { agencyId, role: { in: [UserRole.WEDDING_PLANNER, UserRole.AGENCY_ADMIN] } },
  });
  const defaultPlannerId = planners[0]?.id;

  for (let i = 1; i <= config.couplesCount; i++) {
    const bride = rng.pick(BRIDE_NAMES);
    const groom = rng.pick(GROOM_NAMES);
    const lastName = rng.pick(LAST_NAMES);
    const cityInfo = rng.pick(INDIAN_CITIES);
    const venueName = rng.pick(VENUE_NAMES);

    const coupleEmail = `couple.demo.${i}@${DEMO_DOMAIN}`;
    const couplePhone = `+91 90001 ${String(i).padStart(5, '0')}`;
    const weddingCode = `GB-DEMO-2026-${String(i).padStart(4, '0')}`;
    const enquiryRef = `ENQ-DEMO-2026-${String(i).padStart(4, '0')}`;
    const agreementNumber = `AGR-DEMO-${String(i).padStart(4, '0')}`;

    const dayOffset = rng.intBetween(-15, 180);
    const weddingDate = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000);
    const endDate = new Date(weddingDate.getTime() + 2 * 24 * 60 * 60 * 1000);

    const guestCount = rng.intBetween(250, 700);
    const budgetMin = rng.intBetween(20, 85) * 100000;
    const budgetMax = budgetMin + rng.intBetween(10, 40) * 100000;
    const weddingStatus = rng.pick(WEDDING_STATUSES);
    const enquiryStatus = rng.pick(ENQUIRY_STATUSES);
    const assignedPlanner = planners.length > 0 ? rng.pick(planners) : null;
    const assignedPlannerId = assignedPlanner?.id || defaultPlannerId;

    if (config.dryRun) {
      continue;
    }

    // 1. User Account
    let user = await prisma.user.findFirst({ where: { email: coupleEmail } });
    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            agencyId,
            name: `${bride} & ${groom} ${lastName}`,
            email: coupleEmail,
            passwordHash: globalPasswordHash,
            role: UserRole.CLIENT,
            phone: couplePhone,
            accountStatus: AccountStatus.ACTIVE,
            isActive: true,
          },
        });
      } catch {
        user = await prisma.user.findFirst({ where: { email: coupleEmail } });
      }
    }

    // 2. Customer Enquiry (CRM Queries Section)
    let enquiry = await prisma.customerEnquiry.findFirst({
      where: {
        OR: [
          { referenceNumber: enquiryRef },
          { email: coupleEmail },
        ],
      },
    });
    if (!enquiry) {
      try {
        enquiry = await prisma.customerEnquiry.create({
          data: {
            agencyId,
            referenceNumber: enquiryRef,
            customerName: `${groom} ${lastName}`,
            partnerName: `${bride} ${lastName}`,
            email: coupleEmail,
            phone: couplePhone,
            preferredContactMethod: 'EMAIL',
            weddingDate,
            location: `${venueName}, ${cityInfo.city}, ${cityInfo.state}`,
            guestCount,
            minBudget: budgetMin,
            maxBudget: budgetMax,
            theme: `${cityInfo.venueTier} Royal Splendor`,
            packageType: WeddingPackageType.FULL_SERVICE,
            eventsRequired: ['Haldi', 'Mehendi', 'Sangeet', 'Pheras', 'Reception'],
            servicesRequired: ['Catering', 'Decor', 'Photography', 'Music', 'Hospitality'],
            source: EnquirySource.WEBSITE,
            planningFor: i % 2 === 0 ? PlanningForSide.BRIDE_SIDE : PlanningForSide.GROOM_SIDE,
            status: enquiryStatus,
            assignedPlannerId,
            followUpDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          },
        });
      } catch {
        enquiry = await prisma.customerEnquiry.findFirst({
          where: {
            OR: [
              { referenceNumber: enquiryRef },
              { email: coupleEmail },
            ],
          },
        });
      }
    }

    // 3. Wedding Consultation (First Consultations Section)
    let consultation = enquiry ? await prisma.weddingConsultation.findFirst({ where: { enquiryId: enquiry.id } }) : null;
    if (!consultation && enquiry) {
      const isCompleted = weddingStatus !== WeddingStatus.ENQUIRY;
      try {
        consultation = await prisma.weddingConsultation.create({
          data: {
            agencyId,
            enquiryId: enquiry.id,
            plannerId: assignedPlannerId,
            scheduledAt: new Date(Date.now() - rng.intBetween(5, 30) * 24 * 60 * 60 * 1000),
            meetingType: ConsultationType.ONLINE_VIDEO,
            meetingLink: `https://meet.google.com/grb-wed-${String(i).padStart(3, '0')}`,
            status: isCompleted ? ConsultationStatus.COMPLETED : ConsultationStatus.SCHEDULED,
            clientPreferredTime: 'Afternoon 3:00 PM IST',
            meetingNotes: `Initial planning consultation for ${bride} & ${groom}. Discussed ${cityInfo.venueTier} decor concepts and full catering coordination.`,
            coupleVision: `Grand celebration for ${guestCount} guests with heritage architecture and authentic hospitality.`,
            themePreferences: 'Royal Amber, Rose Gold, and Mogra Florals.',
            guestCountConfirmed: guestCount,
            budgetDiscussed: budgetMin,
            venuePreferences: venueName,
            completedAt: isCompleted ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) : null,
          },
        });
      } catch {
        consultation = await prisma.weddingConsultation.findFirst({ where: { enquiryId: enquiry.id } });
      }
    }

    // 4. Wedding Record (Weddings Directory Section)
    let wedding = await prisma.wedding.findFirst({
      where: {
        OR: [
          { weddingCode },
          { clientEmail: coupleEmail },
        ],
      },
    });
    if (!wedding) {
      try {
        wedding = await prisma.wedding.create({
          data: {
            agencyId,
            weddingCode,
            brideName: `${bride} ${lastName}`,
            groomName: `${groom} ${lastName}`,
            clientEmail: coupleEmail,
            clientPhone: couplePhone,
            weddingDate,
            endDate,
            location: `${venueName}, ${cityInfo.city}, ${cityInfo.state}`,
            guestCount,
            budgetMin,
            budgetMax,
            packageType: WeddingPackageType.FULL_SERVICE,
            status: weddingStatus,
            clientId: user?.id,
            plannerId: assignedPlannerId,
            notes: `Grand Bandhan celebration for ${bride} & ${groom}. Venue: ${cityInfo.venueTier}.`,
          },
        });
      } catch {
        wedding = await prisma.wedding.findFirst({
          where: {
            OR: [
              { weddingCode },
              { clientEmail: coupleEmail },
            ],
          },
        });
      }

      // Update consultation link
      if (consultation && wedding) {
        await prisma.weddingConsultation.update({
          where: { id: consultation.id },
          data: { weddingId: wedding.id },
        });
      }
    }

    // 5. Digital Agreement (Service Agreements Section)
    const isSigned = weddingStatus !== WeddingStatus.ENQUIRY && weddingStatus !== WeddingStatus.PROPOSAL;
    let agreement = wedding ? await prisma.digitalAgreement.findFirst({ where: { weddingId: wedding.id } }) : null;
    if (!agreement && wedding) {
      try {
        await prisma.digitalAgreement.create({
          data: {
            weddingId: wedding.id,
            agreementNumber,
            termsContent: `IMPERIAL WEDDING SERVICES AGREEMENT\n\nParties: Grand Bandhan Luxury Weddings and ${bride} & ${groom} ${lastName}\nLocation: ${wedding.location}\nDate: ${weddingDate.toDateString()}\nGuest Count: ${guestCount}\nContract Budget: INR ${budgetMin.toLocaleString()}\n\nExecution Clauses:\n1. Dedicated planning and day-of vendor coordination.\n2. Three Vendors One Decision quotation governance.\n3. Verified post-wedding accounts settlement.`,
            signedByName: isSigned ? `${groom} ${lastName}` : null,
            signedAt: isSigned ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : null,
            status: isSigned ? AgreementStatus.SIGNED : AgreementStatus.SENT,
            signatureDataUrl: isSigned ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><text x="10" y="35" font-family="cursive" font-size="20" fill="%23C9A96A">Signed Digitally</text></svg>' : null,
          },
        });
      } catch {
        // already created
      }
    }

    // 6. 3-Vendor Quotations Section ("Three Vendors One Decision")
    let qr = wedding ? await prisma.quotationRequest.findFirst({
      where: { weddingId: wedding.id, category: VendorCategory.CATERING },
    }) : null;
    if (!qr && wedding && seededVendors.length >= 3) {
      try {
        qr = await prisma.quotationRequest.create({
          data: {
            weddingId: wedding.id,
            category: VendorCategory.CATERING,
            title: 'Royal Dining Banquet & Live Cooking Counters',
            guestCount,
            targetBudget: Math.round(budgetMin * 0.3),
            specifications: '3-Course Shahi Thali, International Pasta & Salad Bar, Dessert Wonderland.',
            status: QuotationRequestStatus.AWARDED,
          },
        });

        // Pick 3 catering or general vendors
        const cateringVendors = seededVendors.filter((v) => v.category === VendorCategory.CATERING);
        const vPool = cateringVendors.length >= 3 ? cateringVendors : seededVendors;
        const v1 = vPool[i % vPool.length];
        const v2 = vPool[(i + 1) % vPool.length];
        const v3 = vPool[(i + 2) % vPool.length];

        // Quote 1: Selected & Awarded
        const q1 = await prisma.vendorQuotation.create({
          data: {
            quotationRequestId: qr.id,
            vendorId: v1.id,
            baseAmount: Math.round(budgetMin * 0.28),
            pricePerPlate: rng.intBetween(1800, 2600),
            extraHourRate: 25000,
            additionalCosts: 30000,
            menuDetails: 'Imperial Gourmet Feast (120+ authentic recipes)',
            includedItems: ['Royal Chafing Setups', 'Chef Uniforms', 'Live Counters'],
            isAgencyRecommended: true,
            status: QuotationStatus.SELECTED,
            selectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
        });

        const existingWV = await prisma.weddingVendor.findUnique({
          where: {
            weddingId_vendorId: {
              weddingId: wedding.id,
              vendorId: v1.id,
            },
          },
        });
        if (!existingWV) {
          await prisma.weddingVendor.create({
            data: {
              weddingId: wedding.id,
              vendorId: v1.id,
              quotationId: q1.id,
              agreedAmount: q1.baseAmount,
              contractStatus: 'CONFIRMED',
            },
          });
        }

        // Quote 2: Competing
        await prisma.vendorQuotation.create({
          data: {
            quotationRequestId: qr.id,
            vendorId: v2.id,
            baseAmount: Math.round(budgetMin * 0.32),
            pricePerPlate: rng.intBetween(2200, 2900),
            status: QuotationStatus.REJECTED,
          },
        });

        // Quote 3: Competing
        await prisma.vendorQuotation.create({
          data: {
            quotationRequestId: qr.id,
            vendorId: v3.id,
            baseAmount: Math.round(budgetMin * 0.3),
            pricePerPlate: rng.intBetween(2000, 2700),
            status: QuotationStatus.REJECTED,
          },
        });
      } catch {
        // already populated
      }
    }

    // 7. Instant Task Planner Section (Task)
    const taskCount = await prisma.task.count({ where: { weddingId: wedding.id } });
    if (taskCount === 0) {
      await prisma.task.createMany({
        data: [
          {
            weddingId: wedding.id,
            title: 'Confirm Mandap Floral Architecture & Canopy Colors',
            category: 'Decor & Design',
            deadline: new Date(weddingDate.getTime() - 15 * 24 * 60 * 60 * 1000),
            priority: TaskPriority.HIGH,
            status: isSigned ? TaskStatus.IN_PROGRESS : TaskStatus.TO_PLAN,
          },
          {
            weddingId: wedding.id,
            title: 'Finalize Royal Dining Tasting & Interactive Counters',
            category: 'Catering & Banquets',
            deadline: new Date(weddingDate.getTime() - 25 * 24 * 60 * 60 * 1000),
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.DONE,
          },
          {
            weddingId: wedding.id,
            title: 'Guest Transportation & Vintage Fleet Coordination',
            category: 'Logistics & Transport',
            deadline: new Date(weddingDate.getTime() - 7 * 24 * 60 * 60 * 1000),
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.TO_PLAN,
          },
          {
            weddingId: wedding.id,
            title: 'Sound & Audio Rigging Inspection for Sangeet Stage',
            category: 'Sound, Light & Entertainment',
            deadline: new Date(weddingDate.getTime() - 3 * 24 * 60 * 60 * 1000),
            priority: TaskPriority.HIGH,
            status: TaskStatus.TO_PLAN,
          },
        ],
      });
    }

    // 8. Live Day-of Timeline Section (EventTimeline)
    const eventCount = await prisma.eventTimeline.count({ where: { weddingId: wedding.id } });
    let weddingEvents: any[] = [];
    if (eventCount === 0) {
      const e1 = await prisma.eventTimeline.create({
        data: {
          weddingId: wedding.id,
          title: 'Royal Haldi & Phoolon Ki Holi',
          startTime: new Date(weddingDate.getTime() + 10 * 60 * 60 * 1000),
          endTime: new Date(weddingDate.getTime() + 13 * 60 * 60 * 1000),
          location: `${venueName} Gardens`,
          status: EventStatus.COMPLETED,
          responsibleUserId: assignedPlannerId,
          orderIndex: 1,
        },
      });

      const e2 = await prisma.eventTimeline.create({
        data: {
          weddingId: wedding.id,
          title: 'Imperial Sangeet & Cocktail Night',
          startTime: new Date(weddingDate.getTime() + 19 * 60 * 60 * 1000),
          endTime: new Date(weddingDate.getTime() + 23 * 60 * 60 * 1000),
          location: `${venueName} Grand Ballroom`,
          status: EventStatus.IN_PROGRESS,
          responsibleUserId: assignedPlannerId,
          orderIndex: 2,
        },
      });

      const e3 = await prisma.eventTimeline.create({
        data: {
          weddingId: wedding.id,
          title: 'Vedic Vivah Sanskar & Sacred Pheras',
          startTime: new Date(weddingDate.getTime() + 42 * 60 * 60 * 1000),
          endTime: new Date(weddingDate.getTime() + 45 * 60 * 60 * 1000),
          location: `${venueName} Mandap Pavilion`,
          status: EventStatus.SCHEDULED,
          responsibleUserId: assignedPlannerId,
          orderIndex: 3,
        },
      });

      weddingEvents = [e1, e2, e3];
    }

    // 9. Service Verification Section (ServiceVerification)
    const svCount = await prisma.serviceVerification.count({ where: { weddingId: wedding.id } });
    if (svCount === 0 && weddingEvents.length > 0 && seededVendors.length > 0) {
      const assignedVendor = seededVendors[i % seededVendors.length];
      await prisma.serviceVerification.create({
        data: {
          weddingId: wedding.id,
          eventTimelineId: weddingEvents[0]?.id,
          vendorId: assignedVendor.id,
          serviceName: 'Live Station Readiness & Quality Check',
          scheduledConfirmationTime: new Date(weddingDate.getTime() + 9 * 60 * 60 * 1000),
          status: ServiceVerificationStatus.CONFIRMED,
          confirmedByUserId: assignedPlannerId,
          response: VerificationResponse.COMPLETED,
          issueNotes: 'Setup fully operational on time.',
        },
      });
    }

    // 10. Milestone Payments Section (Payment)
    const payCount = await prisma.payment.count({ where: { weddingId: wedding.id } });
    if (payCount === 0) {
      const depositAmount = Math.round(budgetMin * 0.25);
      const advanceAmount = Math.round(budgetMin * 0.5);
      const balanceAmount = budgetMin - depositAmount - advanceAmount;

      await prisma.payment.createMany({
        data: [
          {
            weddingId: wedding.id,
            type: PaymentType.CLIENT_MILESTONE,
            milestoneName: PaymentMilestone.BOOKING_DEPOSIT,
            amount: depositAmount,
            paidAmount: isSigned ? depositAmount : 0,
            dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            paidDate: isSigned ? new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) : null,
            status: isSigned ? PaymentStatus.PAID : PaymentStatus.PENDING,
            transactionRef: isSigned ? `TXN-DEP-${10000 + i}` : null,
            notes: '25% Booking Deposit',
          },
          {
            weddingId: wedding.id,
            type: PaymentType.CLIENT_MILESTONE,
            milestoneName: PaymentMilestone.ADVANCE_PAYMENT,
            amount: advanceAmount,
            paidAmount: 0,
            dueDate: new Date(weddingDate.getTime() - 20 * 24 * 60 * 60 * 1000),
            status: PaymentStatus.PENDING,
            notes: '50% Production Advance',
          },
          {
            weddingId: wedding.id,
            type: PaymentType.CLIENT_MILESTONE,
            milestoneName: PaymentMilestone.FINAL_PAYMENT,
            amount: balanceAmount,
            paidAmount: 0,
            dueDate: new Date(weddingDate.getTime() + 2 * 24 * 60 * 60 * 1000),
            status: PaymentStatus.PENDING,
            notes: '25% Final Settlement Balance',
          },
        ],
      });
    }

    // 11. Guest RSVP Directory Section (WeddingGuest)
    const guestCountDB = await prisma.weddingGuest.count({ where: { weddingId: wedding.id } });
    if (guestCountDB === 0) {
      await prisma.weddingGuest.createMany({
        data: [
          {
            weddingId: wedding.id,
            fullName: `Uncle Rajesh ${lastName}`,
            email: `rajesh.${lastName.toLowerCase()}.${i}@gmail.com`,
            side: PlanningForSide.GROOM_SIDE,
            rsvpStatus: RsvpStatus.ATTENDING,
            guestCount: 2,
            dietaryPreference: 'Pure Vegetarian',
            roomAssigned: `Suite ${100 + (i % 50)}`,
          },
          {
            weddingId: wedding.id,
            fullName: `Auntie Sunita ${lastName}`,
            email: `sunita.${lastName.toLowerCase()}.${i}@gmail.com`,
            side: PlanningForSide.BRIDE_SIDE,
            rsvpStatus: RsvpStatus.PENDING,
            guestCount: 1,
            dietaryPreference: 'Jain Meal',
          },
        ],
      });
    }

    if (i % 25 === 0 || i === config.couplesCount) {
      console.log(`  -> Processed ${i}/${config.couplesCount} couples across all 10 modules...`);
    }
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const config = parseArgs();

  console.log('========================================================================');
  console.log('👑 GRAND BANDHAN: 500 DUMMY USERS & COMPLETE PLATFORM ECOSYSTEM SEEDER');
  console.log('========================================================================');
  console.log(`Configuration:`);
  console.log(`  Couples Target:      ${config.couplesCount}`);
  console.log(`  Vendors Target:      ${config.vendorsCount}`);
  console.log(`  Total Accounts:      ${config.couplesCount + config.vendorsCount}`);
  console.log(`  Include Originals:   ${config.includeOriginals}`);
  console.log(`  Deterministic PRNG:  ${config.deterministic} (Seed: ${config.seed})`);
  console.log(`  Dry Run:             ${config.dryRun}`);
  console.log(`  Cleanup Mode:        ${config.cleanupOnly} (Clean All: ${config.cleanAll})`);
  console.log('========================================================================\n');

  verifySafetyGuard();

  if (config.cleanupOnly) {
    await cleanupDemoRecords(config.cleanAll);
    return;
  }

  // 1. Primary Agency Context
  let agency = await prisma.agency.findFirst({ where: { status: AgencyStatus.APPROVED } });
  if (!agency) {
    agency = await prisma.agency.findFirst();
  }
  if (!agency) {
    console.log('Creating primary agency context...');
    agency = await prisma.agency.create({
      data: {
        name: 'Grand Bandhan Imperial Weddings',
        slug: 'grand-bandhan-imperial',
        contactEmail: 'concierge@grandbandhan.com',
        contactPhone: '+91 98200 00000',
        city: 'Udaipur',
        state: 'Rajasthan',
        status: AgencyStatus.APPROVED,
      },
    });
  }

  console.log(`Agency Context: ${agency.name} (ID: ${agency.id})`);

  // 2. Precompute standard bcrypt password hashes
  console.log('Computing secure bcrypt salt & password hashes for all accounts...');
  const globalPasswordHash = await bcrypt.hash('Bandhan@2025!', 10);
  console.log('Hash generation complete.\n');

  // 3. Seed Original Accounts (with real user-provided emails)
  if (config.includeOriginals && !config.dryRun) {
    await seedOriginalAccounts(agency.id, globalPasswordHash);
  }

  // 4. Seed Full 500-Account Ecosystem
  await seed500ComprehensiveAccounts(config, agency.id, globalPasswordHash);

  // 5. Final Summary
  console.log('\n========================================================================');
  console.log('🎉 COMPREHENSIVE SEEDING COMPLETED SUCCESSFULLY ACROSS ALL SECTIONS');
  console.log('========================================================================');
  console.log(`Total Couples Processed: ${config.couplesCount}`);
  console.log(`Total Vendors Processed: ${config.vendorsCount}`);
  console.log(`Total System Accounts:   ${config.couplesCount + config.vendorsCount + (config.includeOriginals ? 6 : 0)}`);
  console.log('\nKey Original Accounts:');
  console.log('  1. Super Admin:');
  console.log('     Email:    23cyber57@ecajmer.ac.in');
  console.log('     Password: Bandhan@2025!');
  console.log('     Portal:   https://grand-bandhan-theta.vercel.app/dashboard');
  console.log('  2. Wedding Planner:');
  console.log('     Email:    asaggitarius1@gmail.com');
  console.log('     Password: Bandhan@2025!');
  console.log('     Portal:   https://grand-bandhan-theta.vercel.app/dashboard/consultations');
  console.log('  3. Premier Catering Vendor:');
  console.log('     Email:    yashaudichya2007@gmail.com');
  console.log('     Password: Bandhan@2025!');
  console.log('     Portal:   https://grand-bandhan-theta.vercel.app/portal/vendor');
  console.log('  4. VIP Couple (Udaipur Palace):');
  console.log('     Email:    VKrishuhow01@gmail.com');
  console.log('     Password: Bandhan@2025!');
  console.log('     Portal:   https://grand-bandhan-theta.vercel.app/portal/client');
  console.log('  5. Couple (Jaipur Heritage):');
  console.log('     Email:    megatronn131403@gmail.com');
  console.log('     Password: Bandhan@2025!');
  console.log('     Portal:   https://grand-bandhan-theta.vercel.app/portal/client');
  console.log('  6. Couple (Goa Beachside):');
  console.log('     Email:    yashaudichya01@gmail.com');
  console.log('     Password: Bandhan@2025!');
  console.log('     Portal:   https://grand-bandhan-theta.vercel.app/portal/client');
  console.log('\nTo clean up demo records anytime:');
  console.log('  $env:ALLOW_DEMO_SEED="true"; npx tsx scripts/seed-demo-data.ts --clean');
  console.log('========================================================================\n');
}

main()
  .catch((e) => {
    console.error('Fatal seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
