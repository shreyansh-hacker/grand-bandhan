import '../src/index';
import {
  PrismaClient,
  UserRole,
  EnquirySource,
  PlanningForSide,
  EnquiryStatus,
  WeddingPackageType,
  WeddingStatus,
  VendorCategory,
  QuotationRequestStatus,
  QuotationStatus,
  TaskPriority,
  TaskStatus,
  EventStatus,
  ArrivalStatus,
  ServiceVerificationStatus,
  PaymentStatus,
  AgreementStatus,
} from '../src/generated/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('Seeding Neon PostgreSQL Database with Grand Bandhan Data...');

  const count = await prisma.agency.count();
  if (count > 0) {
    console.log(`Neon Database already initialized with ${count} agency. Checking missing entities...`);
  }

  // 1. Create Default Luxury Agency if not exists
  let agency = await prisma.agency.findFirst();
  if (!agency) {
    agency = await prisma.agency.create({
      data: {
        name: 'Grand Bandhan Imperial Weddings',
        slug: 'grand-bandhan-imperial',
        logoUrl: '/images/brand/logo-gold.svg',
        contactEmail: 'shreyanshsharma049@gmail.com',
        contactPhone: '+91 98200 12345',
        address: 'The Imperial Pavilion, Umaid Heritage Road, Udaipur, Rajasthan',
      },
    });
    console.log('Created Agency:', agency.name);
  }

  // 2. Create Users across all roles
  const defaultPasswordHash = await hashPassword('GrandBandhan@2025');

  const usersData = [
    {
      name: 'Vikramaditya Rathore',
      email: 'admin@grandbandhan.com',
      role: UserRole.SUPER_ADMIN,
      phone: '+91 98200 00001',
    },
    {
      name: 'Maharani Gayatri Devi',
      email: 'agency@grandbandhan.com',
      role: UserRole.AGENCY_ADMIN,
      phone: '+91 98200 00002',
    },
    {
      name: 'Aanya Singhania',
      email: 'planner@grandbandhan.com',
      role: UserRole.WEDDING_PLANNER,
      phone: '+91 98200 00003',
    },
    {
      name: 'Rohan Mehra',
      email: 'coordinator@grandbandhan.com',
      role: UserRole.COORDINATOR,
      phone: '+91 98200 00004',
    },
    {
      name: 'Rhea Kapoor & Siddharth Malhotra',
      email: 'client@grandbandhan.com',
      role: UserRole.CLIENT,
      phone: '+91 98200 00005',
    },
  ];

  for (const u of usersData) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          agencyId: agency.id,
          name: u.name,
          email: u.email,
          passwordHash: defaultPasswordHash,
          role: u.role,
          phone: u.phone,
        },
      });
      console.log(`Created user: ${u.email} (${u.role})`);
    }
  }

  const planner = await prisma.user.findUnique({ where: { email: 'planner@grandbandhan.com' } });
  const coordinator = await prisma.user.findUnique({ where: { email: 'coordinator@grandbandhan.com' } });
  const clientUser = await prisma.user.findUnique({ where: { email: 'client@grandbandhan.com' } });

  // 3. Create Luxury Vendors
  const vendorsData = [
    {
      name: 'Royal Rajputana Culinary & Banquets',
      category: VendorCategory.CATERING,
      contactPerson: 'Chef Ranveer Khurana',
      email: 'caterer1@grandbandhan.com',
      phone: '+91 98111 22331',
      address: 'Banquets Enclave, Udaipur',
      basePrice: 650000,
      rating: 4.9,
    },
    {
      name: 'Saffron & Spice Gourmet Caterers',
      category: VendorCategory.CATERING,
      contactPerson: 'Sanjay Kapoor',
      email: 'caterer2@grandbandhan.com',
      phone: '+91 98111 22332',
      address: 'Civil Lines, Jaipur',
      basePrice: 580000,
      rating: 4.8,
    },
    {
      name: 'The Golden Spoon Grand Feast',
      category: VendorCategory.CATERING,
      contactPerson: 'Karan Mehra',
      email: 'caterer3@grandbandhan.com',
      phone: '+91 98111 22333',
      address: 'Lake Pichola Road, Udaipur',
      basePrice: 720000,
      rating: 4.95,
    },
    {
      name: 'DJ Shadow & Sonic Symphony',
      category: VendorCategory.DJ_MUSIC,
      contactPerson: 'Kabir Varma',
      email: 'dj@grandbandhan.com',
      phone: '+91 98111 22334',
      address: 'Bandra West, Mumbai',
      basePrice: 250000,
      rating: 5.0,
    },
    {
      name: 'Shahi Mahal Royal Floral & Mandap Decor',
      category: VendorCategory.DECORATION,
      contactPerson: 'Anjali Deshmukh',
      email: 'decor@grandbandhan.com',
      phone: '+91 98111 22335',
      address: 'Fateh Sagar, Udaipur',
      basePrice: 950000,
      rating: 4.9,
    },
    {
      name: 'Stories in Gold Cinematic Photography',
      category: VendorCategory.PHOTOGRAPHY,
      contactPerson: 'Arjun Somani',
      email: 'photo@grandbandhan.com',
      phone: '+91 98111 22336',
      address: 'Defence Colony, New Delhi',
      basePrice: 450000,
      rating: 4.92,
    },
  ];

  for (const v of vendorsData) {
    const existing = await prisma.vendor.findFirst({ where: { email: v.email } });
    if (!existing) {
      await prisma.vendor.create({
        data: {
          agencyId: agency.id,
          name: v.name,
          category: v.category,
          contactPerson: v.contactPerson,
          email: v.email,
          phone: v.phone,
          address: v.address,
          basePrice: v.basePrice,
          rating: v.rating,
        },
      });
      console.log(`Created vendor: ${v.name}`);
    }
  }

  // 4. Create Flagship Royal Udaipur Wedding
  const weddingDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000);
  let wedding = await prisma.wedding.findUnique({ where: { weddingCode: 'GB-2025-ROYAL' } });

  if (!wedding) {
    wedding = await prisma.wedding.create({
      data: {
        agencyId: agency.id,
        weddingCode: 'GB-2025-ROYAL',
        brideName: 'Rhea Kapoor',
        groomName: 'Siddharth Malhotra',
        clientEmail: 'client@grandbandhan.com',
        clientPhone: '+91 98200 00005',
        weddingDate: weddingDate,
        endDate: new Date(weddingDate.getTime() + 2 * 24 * 60 * 60 * 1000),
        location: 'Jagmandir Island Palace, Lake Pichola, Udaipur',
        guestCount: 400,
        budgetMin: 3500000,
        budgetMax: 5000000,
        packageType: WeddingPackageType.FULL_SERVICE,
        status: WeddingStatus.IN_PLANNING,
        plannerId: planner?.id,
        clientId: clientUser?.id,
        notes: 'Three-day destination royal wedding with heritage themes and lake arrivals.',
      },
    });
    console.log('Created Flagship Wedding in Neon:', wedding.weddingCode);

    // Digital Agreement
    await prisma.digitalAgreement.create({
      data: {
        weddingId: wedding.id,
        agreementNumber: 'AGR-2025-001',
        termsContent: `SERVICE AGREEMENT: GRAND BANDHAN & RHEA KAPOOR / SIDDHARTH MALHOTRA\n\nLocation: Jagmandir Island Palace, Udaipur\nPackage: Full-Service Royal Wedding\nGuaranteed Guest Count: 400 guests\nBudget Base: INR 3,500,000\n\nExecution Scope:\n1. Dedicated planner Aanya Singhania and team of 4 on-ground coordinators.\n2. Three Vendors One Decision quotation comparison for all key vendors.\n3. Live wedding-day schedule execution and service verification checks.\n4. Transparent post-wedding settlement matching quotations with verified bills.\n\nSigned digitally by Siddharth Malhotra. Verified and legally binding.`,
        signedByName: 'Siddharth Malhotra',
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="40" font-family="cursive" font-size="24" fill="%23C9A96A">Siddharth Malhotra</text></svg>',
        clientIp: '103.21.124.5',
        signedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        status: AgreementStatus.SIGNED,
      },
    });

    // Payment Milestones
    await prisma.payment.createMany({
      data: [
        {
          weddingId: wedding.id,
          type: 'CLIENT_MILESTONE',
          milestoneName: 'BOOKING_DEPOSIT',
          amount: 875000,
          paidAmount: 875000,
          dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          paidDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
          status: PaymentStatus.PAID,
          paymentMethod: 'NEFT_BANK_TRANSFER',
          transactionRef: 'NEFT-HDFC-98218731',
          notes: '25% Booking Deposit received and verified.',
        },
        {
          weddingId: wedding.id,
          type: 'CLIENT_MILESTONE',
          milestoneName: 'ADVANCE_PAYMENT',
          amount: 1750000,
          paidAmount: 0,
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
          status: PaymentStatus.PENDING,
          notes: '50% Production Advance due 30 days before event date.',
        },
        {
          weddingId: wedding.id,
          type: 'CLIENT_MILESTONE',
          milestoneName: 'FINAL_PAYMENT',
          amount: 875000,
          paidAmount: 0,
          dueDate: new Date(weddingDate.getTime() + 3 * 24 * 60 * 60 * 1000),
          status: PaymentStatus.PENDING,
          notes: '25% Balance + Post-wedding reconciliation adjustments.',
        },
      ],
    });

    // 5. Create 3 Caterers for "Three Vendors, One Decision" Quotation Request
    const caterer1 = await prisma.vendor.findFirst({ where: { email: 'caterer1@grandbandhan.com' } });
    const caterer2 = await prisma.vendor.findFirst({ where: { email: 'caterer2@grandbandhan.com' } });
    const caterer3 = await prisma.vendor.findFirst({ where: { email: 'caterer3@grandbandhan.com' } });

    const cateringRfp = await prisma.quotationRequest.create({
      data: {
        weddingId: wedding.id,
        category: VendorCategory.CATERING,
        title: 'Imperial Royal Sangeet & Reception Dinner (400 Guests)',
        guestCount: 400,
        targetBudget: 1200000,
        specifications: '3 Live interactive stations (Rajasthani Chaat, Wood-fired Italian, Charcoal Kebab), 25-item dessert buffet with live Jalebi counter, silver service for VIP tables.',
        status: QuotationRequestStatus.COMPARING,
      },
    });

    if (caterer1 && caterer2 && caterer3) {
      await prisma.vendorQuotation.createMany({
        data: [
          {
            quotationRequestId: cateringRfp.id,
            vendorId: caterer1.id,
            baseAmount: 650000,
            pricePerPlate: 1850,
            extraHourRate: 25000,
            additionalCosts: 45000,
            menuDetails: 'Authentic Mewari Thali, 4 Live International counters, 12 Gourmet Desserts, Copper-embossed chafing dishes',
            includedItems: [
              'Welcome Drinks (Mocktails + Kahwa)',
              '18 Passed Appetizers',
              'Live Charcoal Sigri Kebabs',
              'Artisanal Dessert Bar with Shahi Tukda',
              'Mineral Water & Ice Stations Included',
              'Uniformed Silverware Butler Service (40 staff)',
            ],
            notes: 'Awarded Best Heritage Wedding Caterer in Rajasthan 2024. Ingredients sourced directly from royal estates.',
            isAgencyRecommended: true,
            status: QuotationStatus.SUBMITTED,
          },
          {
            quotationRequestId: cateringRfp.id,
            vendorId: caterer2.id,
            baseAmount: 580000,
            pricePerPlate: 1600,
            extraHourRate: 18000,
            additionalCosts: 30000,
            menuDetails: 'Contemporary Pan-Indian & Continental Fusion, 3 Live counters, 8 Desserts',
            includedItems: [
              'Welcome Drinks',
              '12 Passed Appetizers',
              'Live Pasta & Chaat Counter',
              'Buffet Dining Setup',
              'Standard Serving Staff (25 staff)',
            ],
            notes: 'Cost-effective alternative with modern plating.',
            isAgencyRecommended: false,
            status: QuotationStatus.SUBMITTED,
          },
          {
            quotationRequestId: cateringRfp.id,
            vendorId: caterer3.id,
            baseAmount: 720000,
            pricePerPlate: 2200,
            extraHourRate: 35000,
            additionalCosts: 60000,
            menuDetails: 'Michelin-inspired Ultra-Luxury Dining, 6 Live World Stations, Nitrogen Gelato Bar, Gold-leaf garnish',
            includedItems: [
              'Signature Caviar & Truffle Hors d\'oeuvres',
              '24 Passed Appetizers',
              'Live Sushi & Teppanyaki Counter',
              'Molecular Gastronomy Dessert Lab',
              'Premium Crystal Glassware & Butler Service (50 staff)',
            ],
            notes: 'Ultra-premium luxury experience for high-profile dignitaries.',
            isAgencyRecommended: false,
            status: QuotationStatus.SUBMITTED,
          },
        ],
      });
    }

    // 6. Day-of Events & DJ Service Verification
    const vendorDJ = await prisma.vendor.findFirst({ where: { email: 'dj@grandbandhan.com' } });
    if (vendorDJ && coordinator) {
      const djEvent = await prisma.eventTimeline.create({
        data: {
          weddingId: wedding.id,
          title: 'DJ & Royal Sangeet After-Party',
          startTime: new Date(weddingDate.getTime() + 19 * 60 * 60 * 1000), // 7:00 PM
          endTime: new Date(weddingDate.getTime() + 24 * 60 * 60 * 1000),   // 12:00 AM
          location: 'Darbar Banquet Hall',
          responsibleUserId: coordinator.id,
          status: EventStatus.SCHEDULED,
          notes: 'DJ Shadow scheduled at 7:00 PM sharp. High decibel permit approved until 10 PM outdoors, indoor onwards.',
        },
      });

      // Arrival Tracker
      await prisma.eventVendorArrival.create({
        data: {
          eventTimelineId: djEvent.id,
          vendorId: vendorDJ.id,
          expectedTime: new Date(weddingDate.getTime() + 18 * 60 * 60 * 1000),
          arrivalStatus: ArrivalStatus.ARRIVED_ON_TIME,
          actualArrivalTime: new Date(weddingDate.getTime() + 17.75 * 60 * 60 * 1000),
          delayMinutes: 0,
          notes: 'Sound check completed. Pioneer DJ consoles and subwoofers tested.',
        },
      });

      // Service Verification Trigger: DJ 7:00 PM check
      await prisma.serviceVerification.create({
        data: {
          weddingId: wedding.id,
          eventTimelineId: djEvent.id,
          vendorId: vendorDJ.id,
          serviceName: 'DJ & Sound System Setup (Scheduled at 7:00 PM)',
          scheduledConfirmationTime: new Date(weddingDate.getTime() + 19.25 * 60 * 60 * 1000),
          status: ServiceVerificationStatus.AWAITING_CONFIRMATION,
        },
      });
    }
  }

  // 7. Enquiries
  const sampleEnquiries = [
    {
      customerName: 'Aarav Singhania',
      email: 'aarav.singhania@heritage.in',
      phone: '+91 99887 76655',
      weddingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      location: 'Rambagh Palace, Jaipur',
      guestCount: 500,
      theme: 'Royal Rajputana Heritage & Gold',
      minBudget: 4000000,
      maxBudget: 6000000,
      source: EnquirySource.WEBSITE,
      planningFor: PlanningForSide.GROOM_SIDE,
      status: EnquiryStatus.CONSULTATION_SCHEDULED,
      followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      notes: 'Looking for 3-day royal palace celebration with vintage cars procession.',
    },
    {
      customerName: 'Meera Iyer',
      email: 'meera.iyer@gmail.com',
      phone: '+91 98765 43210',
      weddingDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
      location: 'Taj Falaknuma Palace, Hyderabad',
      guestCount: 300,
      theme: 'Mughal Elegance & Pearls',
      minBudget: 3000000,
      maxBudget: 4500000,
      source: EnquirySource.INSTAGRAM,
      planningFor: PlanningForSide.BRIDE_SIDE,
      status: EnquiryStatus.PROPOSAL_SENT,
      followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      notes: 'Bride side coordination. Requested female dhol troupe and organic floral mandap.',
    },
    {
      customerName: 'Devika & Kabir',
      email: 'devika.kabir@outlook.com',
      phone: '+91 91234 56789',
      weddingDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      location: 'Alila Fort Bishangarh',
      guestCount: 250,
      theme: 'Minimalist Contemporary Royal',
      minBudget: 2500000,
      maxBudget: 3500000,
      source: EnquirySource.WHATSAPP,
      planningFor: PlanningForSide.NOT_SPECIFIED,
      status: EnquiryStatus.NEW,
      notes: 'Interested in Partial / Day-of coordination package.',
    },
  ];

  for (const enq of sampleEnquiries) {
    const existing = await prisma.customerEnquiry.findFirst({ where: { email: enq.email } });
    if (!existing) {
      await prisma.customerEnquiry.create({
        data: {
          agencyId: agency.id,
          ...enq,
        },
      });
      console.log(`Created enquiry for ${enq.customerName} (${enq.planningFor})`);
    }
  }

  console.log('✅ Neon PostgreSQL Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
