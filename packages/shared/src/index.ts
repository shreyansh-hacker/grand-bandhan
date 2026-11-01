// Grand Bandhan Shared Definitions & Contracts

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  AGENCY_ADMIN = 'AGENCY_ADMIN',
  WEDDING_PLANNER = 'WEDDING_PLANNER',
  COORDINATOR = 'COORDINATOR',
  VENDOR = 'VENDOR',
  CLIENT = 'CLIENT',
}

export enum AgencyStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SUSPENDED = 'SUSPENDED',
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
}

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
}

export enum EmailDeliveryStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  BOUNCED = 'BOUNCED',
}

export enum EnquirySource {
  WEBSITE = 'WEBSITE',
  WHATSAPP = 'WHATSAPP',
  INSTAGRAM = 'INSTAGRAM',
  PHONE = 'PHONE',
  MANUAL = 'MANUAL',
}

export enum PlanningForSide {
  BRIDE_SIDE = 'BRIDE_SIDE',
  GROOM_SIDE = 'GROOM_SIDE',
  NOT_SPECIFIED = 'NOT_SPECIFIED',
}

export enum RsvpStatus {
  ATTENDING = 'ATTENDING',
  DECLINED = 'DECLINED',
  PENDING = 'PENDING',
}

export enum EnquiryStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  CONSULTATION_SCHEDULED = 'CONSULTATION_SCHEDULED',
  CONSULTATION_COMPLETED = 'CONSULTATION_COMPLETED',
  QUALIFIED = 'QUALIFIED',
  PROPOSAL_IN_PROGRESS = 'PROPOSAL_IN_PROGRESS',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  NEGOTIATION = 'NEGOTIATION',
  APPROVED = 'APPROVED',
  BOOKING_PENDING = 'BOOKING_PENDING',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST',
  ON_HOLD = 'ON_HOLD',
}

export enum AgreementStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  SIGNED = 'SIGNED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}


export enum ConsultationType {
  ONLINE_VIDEO = 'ONLINE_VIDEO',
  IN_PERSON = 'IN_PERSON',
}

export enum ConsultationStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  RESCHEDULED = 'RESCHEDULED',
  CANCELLED = 'CANCELLED',
}

export enum WeddingPackageType {
  FULL_SERVICE = 'FULL_SERVICE',
  PARTIAL_DAY_OF = 'PARTIAL_DAY_OF',
}

export enum WeddingStatus {
  ENQUIRY = 'ENQUIRY',
  PROPOSAL = 'PROPOSAL',
  CONFIRMED = 'CONFIRMED',
  IN_PLANNING = 'IN_PLANNING',
  EXECUTION = 'EXECUTION',
  COMPLETED = 'COMPLETED',
  SETTLED = 'SETTLED',
  CANCELLED = 'CANCELLED',
}

export enum VendorCategory {
  CATERING = 'CATERING',
  DECORATION = 'DECORATION',
  DJ_MUSIC = 'DJ_MUSIC',
  PHOTOGRAPHY = 'PHOTOGRAPHY',
  MAKEUP_ARTIST = 'MAKEUP_ARTIST',
  FLORIST = 'FLORIST',
  VENUE = 'VENUE',
  TRANSPORTATION = 'TRANSPORTATION',
  CHOREOGRAPHY = 'CHOREOGRAPHY',
  MEHENDI_ARTIST = 'MEHENDI_ARTIST',
  OTHER = 'OTHER',
}

export enum QuotationRequestStatus {
  DRAFT = 'DRAFT',
  INVITED = 'INVITED',
  COMPARING = 'COMPARING',
  AWARDED = 'AWARDED',
  CLOSED = 'CLOSED',
}

export enum QuotationStatus {
  SUBMITTED = 'SUBMITTED',
  SELECTED = 'SELECTED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TaskStatus {
  TO_PLAN = 'TO_PLAN',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  DONE = 'DONE',
}

export enum EventStatus {
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED',
}

export enum ArrivalStatus {
  PENDING = 'PENDING',
  ARRIVED_ON_TIME = 'ARRIVED_ON_TIME',
  DELAYED = 'DELAYED',
  NO_SHOW = 'NO_SHOW',
}

export enum ServiceVerificationStatus {
  AWAITING_CONFIRMATION = 'AWAITING_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
  ISSUE_REPORTED = 'ISSUE_REPORTED',
  VENDOR_RESPONDED = 'VENDOR_RESPONDED',
  UNDER_RESOLUTION = 'UNDER_RESOLUTION',
  RESOLVED = 'RESOLVED',
  DISPUTED = 'DISPUTED',
}

export enum VerificationResponse {
  COMPLETED = 'COMPLETED',
  INCOMPLETE = 'INCOMPLETE',
  NOT_DELIVERED = 'NOT_DELIVERED',
  ISSUE_REPORTED = 'ISSUE_REPORTED',
}

export enum PaymentType {
  CLIENT_MILESTONE = 'CLIENT_MILESTONE',
  VENDOR_PAYMENT = 'VENDOR_PAYMENT',
  ADDITIONAL_EXPENSE = 'ADDITIONAL_EXPENSE',
}

export enum PaymentMilestone {
  BOOKING_DEPOSIT = 'BOOKING_DEPOSIT',
  ADVANCE_PAYMENT = 'ADVANCE_PAYMENT',
  STAGE_PAYMENT = 'STAGE_PAYMENT',
  FINAL_PAYMENT = 'FINAL_PAYMENT',
  OVERAGE_EXPENSE = 'OVERAGE_EXPENSE',
  VENDOR_DISBURSEMENT = 'VENDOR_DISBURSEMENT',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum SettlementStatus {
  PENDING = 'PENDING',
  REVIEW = 'REVIEW',
  SETTLED = 'SETTLED',
}

export interface JwtPayload {
  userId: string;
  agencyId: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    agencyId: string;
    phone?: string | null;
  };
  accessToken: string;
}

export interface User {
  id: string;
  agencyId: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Enquiry {
  id: string;
  agencyId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  weddingDate?: string | Date | null;
  weddingLocation?: string | null;
  guestCount?: number | null;
  weddingTheme?: string | null;
  minBudget?: number | null;
  maxBudget?: number | null;
  source: EnquirySource;
  planningFor: PlanningForSide;
  status: EnquiryStatus;
  followUpDate?: string | Date | null;
  notes?: string | null;
  assignedToId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Wedding {
  id: string;
  agencyId: string;
  title: string;
  brideName: string;
  groomName: string;
  startDate: string | Date;
  endDate?: string | Date | null;
  location: string;
  guestCount: number;
  minBudget?: number | null;
  maxBudget?: number | null;
  packageType: WeddingPackageType;
  status: WeddingStatus;
  leadPlannerId?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface Vendor {
  id: string;
  agencyId: string;
  name: string;
  category: VendorCategory;
  contactPerson?: string | null;
  email: string;
  phone: string;
  address?: string | null;
  city?: string | null;
  website?: string | null;
  rating?: number | null;
  status: string;
  createdAt: string | Date;
}

export interface Quotation {
  id: string;
  quotationRequestId: string;
  vendorId: string;
  vendor?: Vendor;
  amount: number;
  breakdown?: any;
  deliverables?: any;
  terms?: string | null;
  status: QuotationStatus;
  submittedAt: string | Date;
}

export interface Task {
  id: string;
  weddingId: string;
  title: string;
  category: string;
  leadTimeDays: number;
  dueDate: string | Date;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId?: string | null;
  notes?: string | null;
  createdAt: string | Date;
}

export interface WeddingEvent {
  id: string;
  weddingId: string;
  name: string;
  location: string;
  startTime: string | Date;
  endTime: string | Date;
  status: EventStatus;
  notes?: string | null;
}

export interface VendorArrival {
  id: string;
  eventId: string;
  vendorId: string;
  vendor?: Vendor;
  expectedArrivalTime: string | Date;
  actualArrivalTime?: string | Date | null;
  status: ArrivalStatus;
  delayMinutes?: number | null;
  notes?: string | null;
}

export interface ServiceVerification {
  id: string;
  weddingId: string;
  eventId: string;
  vendorId: string;
  vendor?: Vendor;
  serviceName: string;
  scheduledConfirmationTime: string | Date;
  status: ServiceVerificationStatus;
  verifiedByRole?: string | null;
  issueNote?: string | null;
  vendorResponse?: string | null;
  resolvedAt?: string | Date | null;
  auditHistory?: any[];
}

export interface Payment {
  id: string;
  weddingId: string;
  type: PaymentType;
  milestone: PaymentMilestone;
  amount: number;
  dueDate: string | Date;
  paidDate?: string | Date | null;
  status: PaymentStatus;
  vendorId?: string | null;
  vendor?: Vendor;
  notes?: string | null;
}

export interface Settlement {
  id: string;
  weddingId: string;
  vendorId: string;
  vendor?: Vendor;
  agreedAmount: number;
  paidAmount: number;
  penaltyDeductions: number;
  finalPayout: number;
  status: SettlementStatus;
}

export interface StoredFile {
  id: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  uploaderId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  isPublic: boolean;
  createdAt: string | Date;
}

// Socket Events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  JOIN_WEDDING: 'join:wedding',
  LEAVE_WEDDING: 'leave:wedding',
  EVENT_STATUS_CHANGED: 'event:status_changed',
  VENDOR_ARRIVAL_UPDATED: 'vendor:arrival_updated',
  SERVICE_VERIFICATION_TRIGGERED: 'service:verification_triggered',
  SERVICE_VERIFICATION_UPDATED: 'service:verification_updated',
  TASK_STATUS_UPDATED: 'task:status_updated',
  PAYMENT_RECORDED: 'payment:recorded',
  NOTIFICATION_RECEIVED: 'notification:received',
} as const;

export enum NotificationCategory {
  SERVICE_VERIFICATION = 'SERVICE_VERIFICATION',
  VENDOR_DELAY = 'VENDOR_DELAY',
  PAYMENT_DUE = 'PAYMENT_DUE',
  WEDDING_TIMELINE = 'WEDDING_TIMELINE',
  TASK_DEADLINE = 'TASK_DEADLINE',
  COMPLAINT = 'COMPLAINT',
  ESCALATION = 'ESCALATION',
  GENERAL = 'GENERAL',
}

export interface AppNotificationItem {
  id: string;
  agencyId?: string | null;
  userId: string;
  category: NotificationCategory | string;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  deepLinkUri?: string | null;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SynchronizedScheduleItem {
  id: string;
  entityType: 'SERVICE_VERIFICATION' | 'TIMELINE_EVENT' | 'TASK_DEADLINE' | 'PAYMENT_DUE' | 'REMINDER';
  entityId: string;
  weddingId?: string;
  weddingCode?: string;
  title: string;
  message: string;
  scheduledFor: string;
  timestampMs: number;
  channelId: 'gb_verifications' | 'gb_milestones' | 'gb_payments' | 'gb_general';
  deepLinkUri?: string;
  dataJson?: string;
  actionRequired: boolean;
  status: string;
  updatedAt: string;
}

export interface ScheduleSyncResponse {
  serverTime: string;
  schedules: SynchronizedScheduleItem[];
  canceledIds: string[];
}
