import { hashPassword } from './utils/hash';
import { DataStore } from './modules/store';
import {
  UserRole,
  EnquirySource,
  PlanningForSide,
  EnquiryStatus,
  WeddingPackageType,
  WeddingStatus,
  VendorCategory,
  QuotationRequestStatus,
  QuotationStatus,
  TaskStatus,
  EventStatus,
  ArrivalStatus,
  ServiceVerificationStatus,
  VerificationResponse,
  PaymentStatus,
  AgreementStatus,
} from '@grand-bandhan/shared';
import { generateInstantWeddingPlan } from './modules/tasks/task.service';

export async function seedDemoDataIfEmpty(): Promise<void> {
  const existingUsers = DataStore.users.list();
  if (existingUsers.length > 0) {
    return; // Already populated
  }

  console.log('Seeding Grand Bandhan Luxury Wedding Data...');

  // 1. Create Default Luxury Agency
  const agency = DataStore.agencies.create({
    name: 'Grand Bandhan Imperial Weddings',
    slug: 'grand-bandhan-imperial',
    logoUrl: '/images/brand/logo-gold.svg',
    contactEmail: 'concierge@grandbandhan.com',
    contactPhone: '+91 98200 12345',
    address: 'The Imperial Pavilion, Umaid Heritage Road, Udaipur, Rajasthan',
  });

  // 2. Create Users across all roles
  const defaultPasswordHash = await hashPassword('GrandBandhan@2025');

  // Super Admin
  DataStore.users.create({
    agencyId: agency.id,
    name: 'Vikramaditya Rathore',
    email: 'admin@grandbandhan.com',
    passwordHash: defaultPasswordHash,
    role: UserRole.SUPER_ADMIN,
    phone: '+91 98200 00001',
  });

  // Agency Admin
  const agencyAdmin = DataStore.users.create({
    agencyId: agency.id,
    name: 'Maharani Gayatri Devi',
    email: 'agency@grandbandhan.com',
    passwordHash: defaultPasswordHash,
    role: UserRole.AGENCY_ADMIN,
    phone: '+91 98200 00002',
  });

  // Wedding Planner
  const planner = DataStore.users.create({
    agencyId: agency.id,
    name: 'Aanya Singhania',
    email: 'planner@grandbandhan.com',
    passwordHash: defaultPasswordHash,
    role: UserRole.WEDDING_PLANNER,
    phone: '+91 98200 00003',
  });

  // Coordinator / On-ground Staff
  const coordinator = DataStore.users.create({
    agencyId: agency.id,
    name: 'Rohan Mehra',
    email: 'coordinator@grandbandhan.com',
    passwordHash: defaultPasswordHash,
    role: UserRole.COORDINATOR,
    phone: '+91 98200 00004',
  });

  // Client Couple
  const clientUser = DataStore.users.create({
    agencyId: agency.id,
    name: 'Rhea Kapoor & Siddharth Malhotra',
    email: 'client@grandbandhan.com',
    passwordHash: defaultPasswordHash,
    role: UserRole.CLIENT,
    phone: '+91 98200 00005',
  });

  // 3. Create Luxury Vendors
  const vendorCatering1 = DataStore.vendors.create({
    agencyId: agency.id,
    name: 'Royal Rajputana Culinary & Banquets',
    category: VendorCategory.CATERING,
    contactPerson: 'Chef Ranveer Khurana',
    email: 'caterer1@grandbandhan.com',
    phone: '+91 98111 22331',
    address: 'Banquets Enclave, Udaipur',
    basePrice: 650000,
    rating: 4.9,
  });

  const vendorCatering2 = DataStore.vendors.create({
    agencyId: agency.id,
    name: 'Saffron & Spice Gourmet Caterers',
    category: VendorCategory.CATERING,
    contactPerson: 'Sanjay Kapoor',
    email: 'caterer2@grandbandhan.com',
    phone: '+91 98111 22332',
    address: 'Civil Lines, Jaipur',
    basePrice: 580000,
    rating: 4.8,
  });

  const vendorCatering3 = DataStore.vendors.create({
    agencyId: agency.id,
    name: 'The Golden Spoon Grand Feast',
    category: VendorCategory.CATERING,
    contactPerson: 'Karan Mehra',
    email: 'caterer3@grandbandhan.com',
    phone: '+91 98111 22333',
    address: 'Lake Pichola Road, Udaipur',
    basePrice: 720000,
    rating: 4.95,
  });

  const vendorDJ = DataStore.vendors.create({
    agencyId: agency.id,
    name: 'DJ Shadow & Sonic Symphony',
    category: VendorCategory.DJ_MUSIC,
    contactPerson: 'Kabir Varma',
    email: 'dj@grandbandhan.com',
    phone: '+91 98111 22334',
    address: 'Bandra West, Mumbai',
    basePrice: 250000,
    rating: 5.0,
  });

  const vendorDecor = DataStore.vendors.create({
    agencyId: agency.id,
    name: 'Shahi Mahal Royal Floral & Mandap Decor',
    category: VendorCategory.DECORATION,
    contactPerson: 'Anjali Deshmukh',
    email: 'decor@grandbandhan.com',
    phone: '+91 98111 22335',
    address: 'Fateh Sagar, Udaipur',
    basePrice: 950000,
    rating: 4.9,
  });

  const vendorPhoto = DataStore.vendors.create({
    agencyId: agency.id,
    name: 'Stories in Gold Cinematic Photography',
    category: VendorCategory.PHOTOGRAPHY,
    contactPerson: 'Arjun Somani',
    email: 'photo@grandbandhan.com',
    phone: '+91 98111 22336',
    address: 'Defence Colony, New Delhi',
    basePrice: 450000,
    rating: 4.92,
  });

  // 4. Create Flagship Wedding: The Royal Udaipur Wedding
  const weddingDate = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000); // 45 days from today
  const flagshipWedding = DataStore.weddings.create({
    agencyId: agency.id,
    weddingCode: 'GB-2025-ROYAL',
    brideName: 'Rhea Kapoor',
    groomName: 'Siddharth Malhotra',
    clientEmail: 'client@grandbandhan.com',
    clientPhone: '+91 98200 00005',
    weddingDate: weddingDate.toISOString(),
    endDate: new Date(weddingDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Jagmandir Island Palace, Lake Pichola, Udaipur',
    guestCount: 400,
    budgetMin: 3500000,
    budgetMax: 5000000,
    packageType: WeddingPackageType.FULL_SERVICE,
    status: WeddingStatus.IN_PLANNING,
    plannerId: planner.id,
    notes: 'Three-day destination royal wedding with heritage themes and lake arrivals.',
  });

  // Digital Agreement for Flagship Wedding
  DataStore.agreements.create({
    weddingId: flagshipWedding.id,
    agreementNumber: 'AGR-2025-001',
    termsContent: `SERVICE AGREEMENT: GRAND BANDHAN & RHEA KAPOOR / SIDDHARTH MALHOTRA\n\nLocation: Jagmandir Island Palace, Udaipur\nPackage: Full-Service Royal Wedding\nGuaranteed Guest Count: 400 guests\nBudget Base: INR 3,500,000\n\nAgreed Execution Scope:\n1. Dedicated planner Aanya Singhania and team of 4 on-ground coordinators.\n2. Three Vendors One Decision quotation comparison for all key vendors.\n3. Live wedding-day schedule execution and service verification checks.\n4. Transparent post-wedding settlement matching quotations with verified bills.\n\nSigned digitally by Siddharth Malhotra. Verified and legally binding.`,
    signedByName: 'Siddharth Malhotra',
    signatureDataUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="60"><text x="10" y="40" font-family="cursive" font-size="24" fill="%23C9A96A">Siddharth Malhotra</text></svg>',
    clientIp: '103.21.124.5',
    signedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: AgreementStatus.SIGNED,
  });

  // 5. Generate 25+ Instant Planning Tasks
  const tasks = generateInstantWeddingPlan(flagshipWedding.id, flagshipWedding.weddingDate, WeddingPackageType.FULL_SERVICE);
  // Mark some tasks done/in progress for realistic dashboard progress
  if (tasks.length > 5) {
    DataStore.tasks.update(tasks[0].id, { status: TaskStatus.DONE, completedAt: new Date().toISOString() });
    DataStore.tasks.update(tasks[1].id, { status: TaskStatus.DONE, completedAt: new Date().toISOString() });
    DataStore.tasks.update(tasks[2].id, { status: TaskStatus.DONE, completedAt: new Date().toISOString() });
    DataStore.tasks.update(tasks[3].id, { status: TaskStatus.IN_PROGRESS, assignedUserId: planner.id });
    DataStore.tasks.update(tasks[4].id, { status: TaskStatus.IN_PROGRESS, assignedUserId: coordinator.id });
  }

  // 6. "Three Vendors, One Decision" Quotation Request for Catering (400 Guests)
  const cateringRfp = DataStore.quotationRequests.create({
    weddingId: flagshipWedding.id,
    category: VendorCategory.CATERING,
    title: 'Imperial Royal Sangeet & Reception Dinner (400 Guests)',
    guestCount: 400,
    targetBudget: 1200000,
    specifications: '3 Live interactive stations (Rajasthani Chaat, Wood-fired Italian, Charcoal Kebab), 25-item dessert buffet with live Jalebi counter, silver service for VIP tables.',
    status: QuotationRequestStatus.COMPARING,
  });

  // Vendor 1 Quote
  DataStore.quotations.create({
    quotationRequestId: cateringRfp.id,
    vendorId: vendorCatering1.id,
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
  });

  // Vendor 2 Quote
  DataStore.quotations.create({
    quotationRequestId: cateringRfp.id,
    vendorId: vendorCatering2.id,
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
  });

  // Vendor 3 Quote
  DataStore.quotations.create({
    quotationRequestId: cateringRfp.id,
    vendorId: vendorCatering3.id,
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
  });

  // Decor RFP - Awarded
  const decorRfp = DataStore.quotationRequests.create({
    weddingId: flagshipWedding.id,
    category: VendorCategory.DECORATION,
    title: 'Palace Mandap & Sangeet Stage Architecture',
    guestCount: 400,
    targetBudget: 1500000,
    specifications: 'Floating Mandap on Lake Pichola with 50,000 fresh tuberose and Marigold strings, crystal chandeliers, mirror dance floor.',
    status: QuotationRequestStatus.AWARDED,
  });

  const decorQuote = DataStore.quotations.create({
    quotationRequestId: decorRfp.id,
    vendorId: vendorDecor.id,
    baseAmount: 1450000,
    pricePerPlate: null,
    extraHourRate: 50000,
    additionalCosts: 50000,
    menuDetails: null,
    includedItems: ['Lake Floating Mandap', 'Royal Shamiana', 'Sangeet Stage + 40ft LED Wall', 'Grand Entrance Archways'],
    isAgencyRecommended: true,
    status: QuotationStatus.SELECTED,
    selectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  });

  DataStore.weddingVendors.create({
    weddingId: flagshipWedding.id,
    vendorId: vendorDecor.id,
    quotationId: decorQuote.id,
    agreedAmount: 1500000,
    contractStatus: 'CONFIRMED',
    notes: 'Awarded via Three Vendors One Decision workflow',
  });

  // 7. Wedding Day Live Timeline Events
  const event1 = DataStore.events.create({
    weddingId: flagshipWedding.id,
    title: 'Royal Baraat Boat Procession (Groom Arrival)',
    startTime: new Date(weddingDate.getTime() + 16 * 60 * 60 * 1000).toISOString(), // 4:00 PM
    endTime: new Date(weddingDate.getTime() + 17 * 60 * 60 * 1000).toISOString(),   // 5:00 PM
    location: 'Rameshwar Ghat Jetty to Jagmandir Palace Island',
    responsibleUserId: coordinator.id,
    status: EventStatus.SCHEDULED,
    notes: 'Fleet of 8 decorated royal boats with traditional dhol players and shehnai troupe.',
  });

  const event2 = DataStore.events.create({
    weddingId: flagshipWedding.id,
    title: 'Garland Exchange (Varmala) at Lake Pavilion',
    startTime: new Date(weddingDate.getTime() + 17.5 * 60 * 60 * 1000).toISOString(), // 5:30 PM
    endTime: new Date(weddingDate.getTime() + 18.5 * 60 * 60 * 1000).toISOString(),   // 6:30 PM
    location: 'Lake Pichola Marble Pavilion',
    responsibleUserId: planner.id,
    status: EventStatus.SCHEDULED,
    notes: 'Cold pyro fountains synchronized with orchestral bridal theme entry.',
  });

  const event3 = DataStore.events.create({
    weddingId: flagshipWedding.id,
    title: 'DJ & Royal Sangeet After-Party',
    startTime: new Date(weddingDate.getTime() + 19 * 60 * 60 * 1000).toISOString(), // 7:00 PM
    endTime: new Date(weddingDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),   // 12:00 AM
    location: 'Darbar Banquet Hall',
    responsibleUserId: coordinator.id,
    status: EventStatus.SCHEDULED,
    notes: 'DJ Shadow scheduled at 7:00 PM sharp. High decibel permit approved until 10 PM outdoors, indoor onwards.',
  });

  // Vendor Arrival Tracker
  DataStore.arrivals.upsert(event3.id, vendorDJ.id, {
    expectedTime: new Date(weddingDate.getTime() + 18 * 60 * 60 * 1000).toISOString(), // 6:00 PM setup
    arrivalStatus: ArrivalStatus.ARRIVED_ON_TIME,
    actualArrivalTime: new Date(weddingDate.getTime() + 17.75 * 60 * 60 * 1000).toISOString(),
    delayMinutes: 0,
    notes: 'Sound check completed. Pioneer DJ consoles and subwoofers tested.',
  });

  // 8. Service Verification Check: "DJ scheduled at 7 PM"
  DataStore.verifications.create({
    weddingId: flagshipWedding.id,
    eventTimelineId: event3.id,
    vendorId: vendorDJ.id,
    serviceName: 'DJ & Sound System Setup (Scheduled at 7:00 PM)',
    scheduledConfirmationTime: new Date(weddingDate.getTime() + 19.25 * 60 * 60 * 1000).toISOString(), // 7:15 PM check
    status: ServiceVerificationStatus.AWAITING_CONFIRMATION,
  });

  // 9. Payment Milestones
  DataStore.payments.create({
    weddingId: flagshipWedding.id,
    type: 'CLIENT_MILESTONE',
    milestoneName: 'BOOKING_DEPOSIT',
    amount: 875000,
    paidAmount: 875000,
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    paidDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    status: PaymentStatus.PAID,
    paymentMethod: 'NEFT_BANK_TRANSFER',
    transactionRef: 'NEFT-HDFC-98218731',
    notes: '25% Booking Deposit received and verified.',
  });

  DataStore.payments.create({
    weddingId: flagshipWedding.id,
    type: 'CLIENT_MILESTONE',
    milestoneName: 'ADVANCE_PAYMENT',
    amount: 1750000,
    paidAmount: 0,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    status: PaymentStatus.PENDING,
    notes: '50% Production Advance due 30 days before event date.',
  });

  DataStore.payments.create({
    weddingId: flagshipWedding.id,
    type: 'CLIENT_MILESTONE',
    milestoneName: 'FINAL_PAYMENT',
    amount: 875000,
    paidAmount: 0,
    dueDate: new Date(weddingDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: PaymentStatus.PENDING,
    notes: '25% Balance + Post-wedding reconciliation adjustments.',
  });

  // Vendor Payment to Decorator
  DataStore.payments.create({
    weddingId: flagshipWedding.id,
    type: 'VENDOR_PAYMENT',
    milestoneName: 'VENDOR_DISBURSEMENT',
    amount: 1500000,
    paidAmount: 750000,
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    paidDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: PaymentStatus.PARTIALLY_PAID,
    vendorId: vendorDecor.id,
    paymentMethod: 'RTGS_TRANSFER',
    transactionRef: 'RTGS-ICICI-881920',
    notes: '50% Production advance paid for floral imports and Mandap structure.',
  });

  // 10. Sample Enquiries with Bride Side / Groom Side differentiation
  DataStore.enquiries.create({
    agencyId: agency.id,
    customerName: 'Aarav Singhania',
    email: 'aarav.singhania@heritage.in',
    phone: '+91 99887 76655',
    weddingDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Rambagh Palace, Jaipur',
    guestCount: 500,
    theme: 'Royal Rajputana Heritage & Gold',
    minBudget: 4000000,
    maxBudget: 6000000,
    source: EnquirySource.WEBSITE,
    planningFor: PlanningForSide.GROOM_SIDE,
    status: EnquiryStatus.CONSULTATION_SCHEDULED,
    followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Looking for 3-day royal palace celebration with vintage cars procession.',
  });

  DataStore.enquiries.create({
    agencyId: agency.id,
    customerName: 'Meera Iyer',
    email: 'meera.iyer@gmail.com',
    phone: '+91 98765 43210',
    weddingDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Taj Falaknuma Palace, Hyderabad',
    guestCount: 300,
    theme: 'Mughal Elegance & Pearls',
    minBudget: 3000000,
    maxBudget: 4500000,
    source: EnquirySource.INSTAGRAM,
    planningFor: PlanningForSide.BRIDE_SIDE,
    status: EnquiryStatus.PROPOSAL_SENT,
    followUpDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Bride side coordination. Requested female dhol troupe and organic floral mandap.',
  });

  DataStore.enquiries.create({
    agencyId: agency.id,
    customerName: 'Devika & Kabir',
    email: 'devika.kabir@outlook.com',
    phone: '+91 91234 56789',
    weddingDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    location: 'Alila Fort Bishangarh',
    guestCount: 250,
    theme: 'Minimalist Contemporary Royal',
    minBudget: 2500000,
    maxBudget: 3500000,
    source: EnquirySource.WHATSAPP,
    planningFor: PlanningForSide.NOT_SPECIFIED,
    status: EnquiryStatus.NEW,
    notes: 'Interested in Partial / Day-of coordination package.',
  });

  console.log('Grand Bandhan Demo Data Successfully Seeded!');
}
