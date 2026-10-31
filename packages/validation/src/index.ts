import { z } from 'zod';
import {
  UserRole,
  AgencyStatus,
  AccountStatus,
  ProposalStatus,
  EmailDeliveryStatus,
  EnquirySource,
  PlanningForSide,
  EnquiryStatus,
  WeddingPackageType,
  WeddingStatus,
  VendorCategory,
  TaskPriority,
  TaskStatus,
  EventStatus,
  ArrivalStatus,
  VerificationResponse,
  PaymentMilestone,
  PaymentStatus,
} from '@grand-bandhan/shared';

// Auth Validation
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(UserRole).default(UserRole.CLIENT),
  phone: z.string().optional(),
  agencyName: z.string().optional(),
});

export const registerAgencySchema = z
  .object({
    agencyName: z.string().min(2, 'Agency name must be at least 2 characters'),
    ownerName: z.string().min(2, 'Owner / contact name must be at least 2 characters'),
    email: z.string().email('Valid business email is required'),
    phone: z.string().min(10, 'Valid contact phone number is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
    address: z.string().min(3, 'Business address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    country: z.string().default('India'),
    website: z.string().optional().or(z.literal('')),
    gstin: z.string().optional().or(z.literal('')),
    businessDescription: z.string().optional().or(z.literal('')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const agencyStatusUpdateSchema = z.object({
  status: z.nativeEnum(AgencyStatus),
  rejectionReason: z.string().optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  department: z.string().optional(),
  specialization: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ['confirmPassword'],
  });

export const publicEnquirySchema = z.object({
  customerName: z.string().min(2, 'Your name is required'),
  partnerName: z.string().optional(),
  email: z.string().email('Valid email address is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  preferredContactMethod: z.enum(['EMAIL', 'PHONE', 'WHATSAPP']).default('EMAIL'),
  weddingDate: z.string().optional().nullable(),
  isDateFlexible: z.boolean().default(false),
  location: z.string().min(2, 'Wedding city or destination is required'),
  guestCount: z.coerce.number().min(1).default(250),
  minBudget: z.coerce.number().min(0).default(1500000),
  maxBudget: z.coerce.number().min(0).default(3500000),
  packageType: z.nativeEnum(WeddingPackageType).optional(),
  planningFor: z.nativeEnum(PlanningForSide).default(PlanningForSide.NOT_SPECIFIED),
  eventsRequired: z.array(z.string()).default([]),
  servicesRequired: z.array(z.string()).default([]),
  notes: z.string().optional(),
  source: z.nativeEnum(EnquirySource).default(EnquirySource.WEBSITE),
});

export const createProposalSchema = z.object({
  enquiryId: z.string().uuid('Valid enquiry ID is required'),
  packageType: z.nativeEnum(WeddingPackageType).default(WeddingPackageType.FULL_SERVICE),
  proposedServices: z.any().optional(),
  estimatedBudget: z.coerce.number().min(0, 'Estimated budget must be positive'),
  planningScope: z.string().optional(),
  termsContent: z.string().optional(),
  paymentMilestones: z.any().optional(),
  validUntil: z.string().min(1, 'Proposal validity date is required'),
});

export const respondProposalSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'REVISION_REQUESTED']),
  customerNotes: z.string().optional(),
});

// Enquiry Validation
export const createEnquirySchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  weddingDate: z.string().optional().nullable(),
  location: z.string().min(2, 'Location is required'),
  guestCount: z.coerce.number().min(1, 'Guest count must be at least 1').default(200),
  theme: z.string().optional(),
  minBudget: z.coerce.number().min(0, 'Min budget must be positive').default(500000),
  maxBudget: z.coerce.number().min(0, 'Max budget must be positive').default(2500000),
  source: z.nativeEnum(EnquirySource).default(EnquirySource.WEBSITE),
  planningFor: z.nativeEnum(PlanningForSide).default(PlanningForSide.NOT_SPECIFIED),
  notes: z.string().optional(),
});

export const updateEnquiryStatusSchema = z.object({
  status: z.nativeEnum(EnquiryStatus),
  followUpDate: z.string().optional().nullable(),
  notes: z.string().optional(),
});

// Wedding Creation Validation
export const createWeddingSchema = z.object({
  brideName: z.string().min(2, 'Bride name is required'),
  groomName: z.string().min(2, 'Groom name is required'),
  clientEmail: z.string().email('Valid email is required'),
  clientPhone: z.string().min(10, 'Valid phone is required'),
  weddingDate: z.string().min(1, 'Wedding start date is required'),
  endDate: z.string().optional().nullable(),
  location: z.string().min(2, 'Wedding venue/city is required'),
  guestCount: z.coerce.number().min(1, 'Guest count is required').default(350),
  budgetMin: z.coerce.number().min(0).default(1500000),
  budgetMax: z.coerce.number().min(0).default(3500000),
  packageType: z.nativeEnum(WeddingPackageType).default(WeddingPackageType.FULL_SERVICE),
  enquiryId: z.string().optional().nullable(),
  plannerId: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export const updateWeddingSchema = createWeddingSchema.partial().extend({
  status: z.nativeEnum(WeddingStatus).optional(),
});

// Digital Agreement Validation
export const signAgreementSchema = z.object({
  signedByName: z.string().min(2, 'Full legal name is required'),
  signatureDataUrl: z.string().min(20, 'Digital signature canvas drawing is required'),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must review and accept the agreement terms' }),
  }),
});

// Quotation Validation
export const createQuotationRequestSchema = z.object({
  weddingId: z.string().min(1, 'Wedding is required'),
  category: z.nativeEnum(VendorCategory),
  title: z.string().min(3, 'Title is required'),
  guestCount: z.coerce.number().optional(),
  targetBudget: z.coerce.number().optional(),
  specifications: z.string().min(10, 'Please provide detailed specifications'),
  invitedVendorIds: z.array(z.string()).min(1, 'Invite at least one vendor'),
});

export const submitVendorQuotationSchema = z.object({
  vendorId: z.string().min(1),
  baseAmount: z.coerce.number().min(0, 'Base amount is required'),
  pricePerPlate: z.coerce.number().min(0).optional().nullable(),
  extraHourRate: z.coerce.number().min(0).optional().nullable(),
  additionalCosts: z.coerce.number().min(0).default(0),
  menuDetails: z.string().optional(),
  includedItems: z.array(z.string()).default([]),
  notes: z.string().optional(),
  isAgencyRecommended: z.boolean().default(false),
});

export const selectQuotationSchema = z.object({
  selectedQuotationId: z.string().min(1, 'Quotation ID required'),
  selectionNotes: z.string().optional(),
});

// Instant Planning & Tasks Validation
export const createTaskSchema = z.object({
  weddingId: z.string().min(1),
  title: z.string().min(3, 'Task title is required'),
  description: z.string().optional(),
  category: z.string().default('General'),
  deadline: z.string().min(1, 'Deadline date is required'),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.TO_PLAN),
  assignedUserId: z.string().optional().nullable(),
  vendorId: z.string().optional().nullable(),
  eventId: z.string().optional().nullable(),
});

export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TaskStatus),
  assignedUserId: z.string().optional().nullable(),
});

// Live Event Schedule & Vendor Arrival Validation
export const createEventSchema = z.object({
  weddingId: z.string().min(1),
  title: z.string().min(2, 'Event title required'),
  startTime: z.string().min(1, 'Start time required'),
  endTime: z.string().min(1, 'End time required'),
  location: z.string().min(2, 'Location required'),
  responsibleUserId: z.string().optional().nullable(),
  notes: z.string().optional(),
});

export const updateArrivalStatusSchema = z.object({
  arrivalStatus: z.nativeEnum(ArrivalStatus),
  actualArrivalTime: z.string().optional().nullable(),
  delayMinutes: z.coerce.number().default(0),
  notes: z.string().optional(),
});

// Service Verification Validation
export const submitVerificationSchema = z.object({
  response: z.nativeEnum(VerificationResponse),
  issueNotes: z.string().optional(),
  evidencePhotos: z.array(z.string()).default([]),
});

export const vendorResolutionSchema = z.object({
  vendorResponseNotes: z.string().min(5, 'Response explanation is required'),
  proposedAction: z.string().optional(),
});

// Payment Validation
export const createPaymentMilestoneSchema = z.object({
  weddingId: z.string().min(1),
  milestoneName: z.nativeEnum(PaymentMilestone),
  amount: z.coerce.number().min(1, 'Amount must be greater than zero'),
  dueDate: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
});

export const recordPaymentTransactionSchema = z.object({
  paidAmount: z.coerce.number().min(1, 'Amount paid is required'),
  paymentMethod: z.string().default('BANK_TRANSFER'),
  transactionRef: z.string().min(3, 'Transaction reference is required'),
  notes: z.string().optional(),
});

// Post-Wedding Settlement Validation
export const calculateSettlementSchema = z.object({
  extraGuestCount: z.coerce.number().min(0).default(0),
  extraPlatesCount: z.coerce.number().min(0).default(0),
  extraPlateRate: z.coerce.number().min(0).default(0),
  extraVendorHours: z.coerce.number().min(0).default(0),
  extraVendorHourRate: z.coerce.number().min(0).default(0),
  unexpectedExpenses: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
});
