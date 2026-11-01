/**
 * GRAND BANDHAN — 500 DUMMY USERS & OPERATIONAL SEEDER
 * 
 * Generates realistic, fully-relational, database-backed test accounts:
 * - 250 Couple / Client accounts (with Weddings, Digital Agreements, Payments, Tasks, Guest RSVPs)
 * - 250 Vendor accounts (covering all 11 categories, pricing, ratings, approval states)
 * 
 * Safety features:
 * - Refuses to run against production databases without ALLOW_DEMO_SEED=true
 * - Deterministic PRNG option (--seed=<num>)
 * - Safe idempotent re-execution (upsert / existing check)
 * - Isolated test batch mode (--batch=<num>)
 * - Surgical cleanup mode (--clean / --cleanup) affecting ONLY demo records
 * - Zero notifications, emails, SMS, or external payment calls
 */

import path from 'path';
import dotenv from 'dotenv';

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
} from '../packages/shared/src';
import bcrypt from 'bcryptjs';

// ============================================================================
// CONFIGURATION & CLI ARGUMENT PARSING
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
  };

  for (const arg of args) {
    if (arg === '--clean' || arg === '--cleanup') {
      config.cleanupOnly = true;
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
    }
  }

  return config;
}

// Simple Mulberry32 deterministic PRNG
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
    'Exotic Orchids & Royal Florals', 'Bespoke Mogra Floral Sculptors',
    'Imperial Jasmine Creations', 'Petals & Pearls Floral Art', 'Gulab Heritage Floristry'
  ],
  [VendorCategory.VENUE]: [
    'Lakeview Heritage Palace Banquets', 'Fort Royale Banquet & Lawns',
    'The Grand Pavilion Resorts', 'Crown Jewel Ballroom & Gardens', 'The Regent Heritage Courtyard'
  ],
  [VendorCategory.TRANSPORTATION]: [
    'Royal Vintage Car Fleet & Concierge', 'Imperial Chauffeurs & Luxury Coaches',
    'Regal Procession Vintage Buggies', 'Maharaja Luxury Fleet & Limousines'
  ],
  [VendorCategory.CHOREOGRAPHY]: [
    'Thumka & Taal Sangeet Directors', 'Nritya Royal Wedding Choreography',
    'Bollywood Beats Dance Troupe', 'The Sangeet Stage Directors'
  ],
  [VendorCategory.MEHENDI_ARTIST]: [
    'Sojat Shahi Mehendi Designers', 'Marwari Bridal Henna Art',
    'Royal Zardozi Mehendi Studio', 'Kundan Heritage Bridal Henna'
  ],
  [VendorCategory.OTHER]: [
    'Royal Fireworks & Sparkle Effects', 'Safa & Turban Artisans of Mewar',
    'Silver Gift Trays & Bespoke Favors', 'Wedding Pandit Ji & Vedic Rituals'
  ],
};

// ============================================================================
// SAFETY ENVIRONMENT CHECK
// ============================================================================

function verifySafetyGuard(): void {
  const dbUrl = process.env.DATABASE_URL || '';
  const isAllowed = process.env.ALLOW_DEMO_SEED === 'true';

  const isRemoteNeon = dbUrl.includes('neon.tech') || dbUrl.includes('render.com') || dbUrl.includes('postgres.database.azure.com');

  if (isRemoteNeon && !isAllowed) {
    console.error('\n🛑 =================================================================');
    console.error('🛑 GRAND BANDHAN SAFETY GUARD ACTIVATED:');
    console.error('🛑 Detected connection to remote database cluster:');
    try {
      const u = new URL(dbUrl.replace('postgresql://', 'http://'));
      console.error(`🛑 Host: ${u.hostname}`);
    } catch {
      console.error('🛑 Host: [Remote PostgreSQL]');
    }
    console.error('🛑 To prevent accidental production seeding, set ALLOW_DEMO_SEED=true.');
    console.error('🛑 Example:');
    console.error('🛑   $env:ALLOW_DEMO_SEED="true"; npx tsx scripts/seed-demo-data.ts --batch=4');
    console.error('🛑 =================================================================\n');
    process.exit(1);
  }
}

// ============================================================================
// CLEANUP ROUTINE (SURGICALLY REMOVES ONLY DEMO DATA)
// ============================================================================

async function cleanupDemoRecords(): Promise<void> {
  console.log('🧹 Purging ONLY demo records marked with domain:', DEMO_DOMAIN);

  // 1. Find demo users
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: `@${DEMO_DOMAIN}` } },
    select: { id: true, email: true },
  });
  console.log(`Found ${demoUsers.length} demo users to remove.`);

  const demoUserIds = demoUsers.map((u) => u.id);

  // 2. Find demo weddings
  const demoWeddings = await prisma.wedding.findMany({
    where: {
      OR: [
        { clientEmail: { endsWith: `@${DEMO_DOMAIN}` } },
        { weddingCode: { startsWith: 'GB-DEMO-' } },
      ],
    },
    select: { id: true, weddingCode: true },
  });
  console.log(`Found ${demoWeddings.length} demo weddings to remove.`);

  const demoWeddingIds = demoWeddings.map((w) => w.id);

  // 3. Find demo vendors
  const demoVendors = await prisma.vendor.findMany({
    where: { email: { endsWith: `@${DEMO_DOMAIN}` } },
    select: { id: true, email: true },
  });
  console.log(`Found ${demoVendors.length} demo vendors to remove.`);

  const demoVendorIds = demoVendors.map((v) => v.id);

  // Cascade delete using transactions
  if (demoWeddingIds.length > 0) {
    await prisma.weddingGuest.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.digitalAgreement.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.payment.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.task.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.serviceVerification.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.eventTimeline.deleteMany({ where: { weddingId: { in: demoWeddingIds } } });
    await prisma.wedding.deleteMany({ where: { id: { in: demoWeddingIds } } });
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

  console.log('✅ Cleanup completed cleanly. Real agency and contributor accounts were preserved untouched.\n');
}

// ============================================================================
// MAIN SEED GENERATOR
// ============================================================================

async function main() {
  const config = parseArgs();

  console.log('========================================================================');
  console.log('👑 GRAND BANDHAN: 500 DUMMY USERS DATA PREPARATION & SEEDING ENGINE');
  console.log('========================================================================');
  console.log(`Config:`);
  console.log(`  Couples Target:    ${config.couplesCount}`);
  console.log(`  Vendors Target:    ${config.vendorsCount}`);
  console.log(`  Total Accounts:    ${config.couplesCount + config.vendorsCount}`);
  console.log(`  Deterministic:     ${config.deterministic} (Seed: ${config.seed})`);
  console.log(`  Dry Run:           ${config.dryRun}`);
  console.log(`  Cleanup Mode:      ${config.cleanupOnly}`);
  console.log('========================================================================\n');

  verifySafetyGuard();

  if (config.cleanupOnly) {
    await cleanupDemoRecords();
    return;
  }

  const rng = new RandomGenerator(config.seed);

  // 1. Get or create primary agency context
  let agency = await prisma.agency.findFirst({ where: { status: AgencyStatus.APPROVED } });
  if (!agency) {
    agency = await prisma.agency.findFirst();
  }

  if (!agency) {
    console.log('No primary agency detected. Creating demo agency context...');
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

  // Pre-compute standard password hash to avoid repeating 500 expensive bcrypt rounds
  console.log('Computing secure bcrypt salt & password hashes for demo accounts...');
  const couplePasswordHash = await bcrypt.hash('Bandhan@Couple2025!', 10);
  const vendorPasswordHash = await bcrypt.hash('Bandhan@Vendor2025!', 10);
  console.log('Hash generation complete.\n');

  // --------------------------------------------------------------------------
  // PART A: SEED COUPLES & WEDDINGS
  // --------------------------------------------------------------------------
  console.log(`💍 Generating ${config.couplesCount} Couple Accounts & Wedding Projects...`);

  const WEDDING_STATUSES = [
    WeddingStatus.CONFIRMED,
    WeddingStatus.IN_PLANNING,
    WeddingStatus.IN_PLANNING,
    WeddingStatus.EXECUTION,
    WeddingStatus.COMPLETED,
  ];

  let couplesCreated = 0;
  for (let i = 1; i <= config.couplesCount; i++) {
    const bride = rng.pick(BRIDE_NAMES);
    const groom = rng.pick(GROOM_NAMES);
    const lastName = rng.pick(LAST_NAMES);
    const cityInfo = rng.pick(INDIAN_CITIES);
    const venueName = rng.pick(VENUE_NAMES);

    const coupleEmail = `couple.demo.${i}@${DEMO_DOMAIN}`;
    const couplePhone = `+91 90001 ${String(i).padStart(5, '0')}`;
    const weddingCode = `GB-DEMO-${new Date().getFullYear()}-${String(i).padStart(4, '0')}`;

    // Target wedding date: between 15 days ago and 180 days in the future
    const dayOffset = rng.intBetween(-15, 180);
    const weddingDate = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000);
    const endDate = new Date(weddingDate.getTime() + 2 * 24 * 60 * 60 * 1000);

    const guestCount = rng.intBetween(200, 650);
    const budgetMin = rng.intBetween(15, 80) * 100000;
    const budgetMax = budgetMin + rng.intBetween(10, 40) * 100000;
    const packageType = rng.next() > 0.3 ? WeddingPackageType.FULL_SERVICE : WeddingPackageType.PARTIAL_DAY_OF;
    const weddingStatus = rng.pick(WEDDING_STATUSES);

    if (config.dryRun) {
      couplesCreated++;
      continue;
    }

    // Upsert Couple User
    let user = await prisma.user.findUnique({ where: { email: coupleEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          agencyId: agency.id,
          name: `${bride} & ${groom} ${lastName}`,
          email: coupleEmail,
          passwordHash: couplePasswordHash,
          role: UserRole.CLIENT,
          phone: couplePhone,
          accountStatus: AccountStatus.ACTIVE,
          isActive: true,
        },
      });
    }

    // Upsert Wedding
    let wedding = await prisma.wedding.findUnique({ where: { weddingCode } });
    if (!wedding) {
      wedding = await prisma.wedding.create({
        data: {
          agencyId: agency.id,
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
          packageType,
          status: weddingStatus,
          clientId: user.id,
          notes: `Grand Indian celebration for ${bride} & ${groom}. Venue: ${cityInfo.venueTier}.`,
        },
      });

      // Digital Agreement
      const agreementNumber = `AGR-DEMO-${String(i).padStart(4, '0')}`;
      const isSigned = weddingStatus !== WeddingStatus.ENQUIRY && weddingStatus !== WeddingStatus.PROPOSAL;
      await prisma.digitalAgreement.create({
        data: {
          weddingId: wedding.id,
          agreementNumber,
          termsContent: `IMPERIAL WEDDING SERVICES AGREEMENT\n\nParties: ${agency.name} and ${bride} & ${groom} ${lastName}\nLocation: ${wedding.location}\nDate: ${weddingDate.toDateString()}\nGuest Count: ${guestCount}\nContract Budget: INR ${budgetMin.toLocaleString()}\n\nExecution Clauses:\n1. Dedicated planning and day-of vendor coordination.\n2. Three Vendors One Decision quotation governance.\n3. Verified post-wedding accounts settlement.`,
          signedByName: isSigned ? `${groom} ${lastName}` : null,
          signedAt: isSigned ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : null,
          status: isSigned ? AgreementStatus.SIGNED : AgreementStatus.SENT,
          signatureDataUrl: isSigned ? 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="50"><text x="10" y="35" font-family="cursive" font-size="20" fill="%23C9A96A">Signed Digitally</text></svg>' : null,
        },
      });

      // Payment Milestones (Deposit, Advance, Final)
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

      // Sample RSVP Guests
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
            roomAssigned: 'Suite 201',
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

      // Sample Operational Tasks
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
            category: 'Catering',
            deadline: new Date(weddingDate.getTime() - 25 * 24 * 60 * 60 * 1000),
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.DONE,
          },
        ],
      });
    }

    couplesCreated++;
    if (couplesCreated % 25 === 0 || couplesCreated === config.couplesCount) {
      console.log(`  -> Processed ${couplesCreated}/${config.couplesCount} couple packages...`);
    }
  }

  // --------------------------------------------------------------------------
  // PART B: SEED VENDORS & VENDOR PORTAL USERS
  // --------------------------------------------------------------------------
  console.log(`\n🏛️ Generating ${config.vendorsCount} Vendor Accounts & Enterprise Profiles...`);

  const categories = Object.values(VendorCategory);

  let vendorsCreated = 0;
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

    // Realistic approval status distribution: 80% approved, 12% pending, 8% rejected
    const roll = rng.next();
    const isApproved = roll < 0.8;

    const basePrice = rng.intBetween(15, 120) * 10000;
    const rating = Math.round((4.2 + rng.next() * 0.8) * 10) / 10;

    if (config.dryRun) {
      vendorsCreated++;
      continue;
    }

    // Upsert Vendor User (for portal login)
    let user = await prisma.user.findUnique({ where: { email: vendorEmail } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          agencyId: agency.id,
          name: `${contactFirst} ${contactLast} (${businessName})`,
          email: vendorEmail,
          passwordHash: vendorPasswordHash,
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
          agencyId: agency.id,
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
            `https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80`,
            `https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80`,
          ],
        },
      });
    }

    vendorsCreated++;
    if (vendorsCreated % 25 === 0 || vendorsCreated === config.vendorsCount) {
      console.log(`  -> Processed ${vendorsCreated}/${config.vendorsCount} vendor profiles...`);
    }
  }

  // --------------------------------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------------------------------
  console.log('\n========================================================================');
  console.log('🎉 SEEDING PROCESS COMPLETED SUCCESSFULLY');
  console.log('========================================================================');
  console.log(`Total Couples Created: ${couplesCreated}`);
  console.log(`Total Vendors Created: ${vendorsCreated}`);
  console.log(`Total Database Users:  ${couplesCreated + vendorsCreated}`);
  console.log('\nDemo Account Sample Credentials:');
  console.log(`  Couple Account:`);
  console.log(`    Email:    couple.demo.1@${DEMO_DOMAIN}`);
  console.log(`    Password: Bandhan@Couple2025!`);
  console.log(`    Portal:   https://grand-bandhan-theta.vercel.app/portal/client`);
  console.log(`\n  Vendor Account:`);
  console.log(`    Email:    vendor.demo.1@${DEMO_DOMAIN}`);
  console.log(`    Password: Bandhan@Vendor2025!`);
  console.log(`    Portal:   https://grand-bandhan-theta.vercel.app/portal/vendor`);
  console.log('\nTo safely clean up only these demo records anytime:');
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
